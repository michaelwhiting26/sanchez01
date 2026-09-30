/**
 * "Hit it": the Blender punch bag (bag_4ft.glb) hanging live in 3D, animated with anime.js 4. Click or tap the bag to punch it: it swings from the
 * hook on a spring, twists a little, the body dents at the impact, and a shock ring flashes. When nobody is punching it throws its own 1-2-hook combo
 * every few seconds and sways gently. Drag to spin it 360 degrees. As it scrolls into place it turns at the DNA helix's own rate, tapering to rest.
 * Off screen it is not drawn (a hidden WebGL scene still costs a phone real battery and frame rate).
 */
import { animate, createSpring, createTimeline } from "animejs";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { BAG_ART } from "./art";
import { BAG_PRODUCTS, type BagArtKey, type BagProduct } from "./products";

const HOOK = 1.824;
const DNA_RATE = (2 * Math.PI * 0.55) / 210; // radians per pixel of scroll: exactly how fast the DNA helix turns

interface AnimState {
  swingX: number;
  swingZ: number;
  twist: number;
  dent: number;
  ring: number;
}

export interface BagEngineOptions {
  /** The section element (observed for visibility, sets classes). */
  root: HTMLElement;
  /** Where the canvas goes. */
  host: HTMLElement;
  onProduct(index: number): void;
}

const isBody = (n: string): boolean => /^(body|crown)/.test(n);

type AnyMesh = THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
/** glTF meshes are plain THREE.Mesh objects; three's `instanceof` narrowing yields `Mesh<any, any, any>`, so it is pinned to the concrete generic types here, once. */
function asMesh(o: THREE.Object3D): AnyMesh | null {
  return o instanceof THREE.Mesh ? (o as AnyMesh) : null;
}

export class BagEngine {
  private readonly root: HTMLElement;
  private readonly host: HTMLElement;
  private readonly onProduct: (i: number) => void;
  private readonly abort = new AbortController();
  private readonly reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly cam = new THREE.PerspectiveCamera(26, 1, 0.05, 50);
  private readonly pivot = new THREE.Group();
  private readonly twist = new THREE.Group();
  private readonly bodyGroup = new THREE.Group();
  private readonly spinGroup = new THREE.Group();
  private readonly ring: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private readonly bodyMaterial: THREE.MeshPhysicalMaterial;
  private readonly bandTop: THREE.MeshPhysicalMaterial;
  private readonly bandBottom: THREE.MeshPhysicalMaterial;
  private readonly textures = new Map<string, THREE.Texture>();
  private readonly state: AnimState = { swingX: 0, swingZ: 0, twist: 0, dent: 0, ring: 0 };
  private readonly switchScale = { k: 1 };
  private readonly anisotropy: number;

  private bodyMeshes: AnyMesh[] = [];
  private model: THREE.Object3D | null = null;
  private aspect = 1;
  private mid = 0.55;
  private current = 0;
  private spin = 0;
  private spinVel = 0;
  private pointer: { x: number; lx: number; moved: boolean; id: number } | null = null;
  private lastMove = 0;
  private lastUser = -1e9;
  private hover = false;
  private resumeAt = 0;
  private onScreen = true;
  private raf = 0;
  private timers: number[] = [];
  /** When set (by the builder), this look is applied instead of the current product's, so any colours or artwork can be previewed. */
  private override: BagProduct | null = null;

  constructor(o: BagEngineOptions) {
    this.root = o.root;
    this.host = o.host;
    this.onProduct = (i) => o.onProduct(i);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // throws when WebGL is unavailable: the caller shows the fallback
    const r = this.renderer;
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    r.setClearColor(0x000000, 0);
    this.anisotropy = r.capabilities.getMaxAnisotropy();
    const el = r.domElement;
    el.style.cssText = "display:block;inline-size:100%;block-size:100%;cursor:grab;touch-action:pan-y";
    el.setAttribute("aria-label", "Interactive punch bag. Click or tap the bag to hit it.");
    el.setAttribute("role", "img");
    this.host.appendChild(el);

    const pm = new THREE.PMREMGenerator(r);
    this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.9;
    const key = new THREE.DirectionalLight(0xfff1dc, 2.2);
    key.position.set(-2.5, 4, 3);
    const rim = new THREE.DirectionalLight(0xc9a45c, 1.6);
    rim.position.set(3, 2, -2.5);
    this.scene.add(key, rim);

    // the tiger colourway material set: satin body so the stitching reads instead of a glossy haze
    this.bodyMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.5, clearcoat: 0.08, clearcoatRoughness: 0.4 });
    this.bandTop = new THREE.MeshPhysicalMaterial({ map: this.image("/assets/bag3d/band_top_plain.png"), roughness: 0.5, sheen: 0.3 });
    this.bandBottom = new THREE.MeshPhysicalMaterial({ map: this.image("/assets/bag3d/band_bottom_plain.png"), roughness: 0.5, sheen: 0.3 });

    this.pivot.position.y = HOOK; // rig: pivot at the top of the hook, the bag hangs below it
    this.scene.add(this.pivot);
    this.pivot.add(this.twist);
    this.twist.add(this.bodyGroup);
    this.bodyGroup.add(this.spinGroup);
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.2, 64), new THREE.MeshBasicMaterial({ color: 0xf3eadc, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    this.scene.add(this.ring);
  }

  start(): void {
    const { signal } = this.abort;
    new GLTFLoader().load("/assets/bag3d/bag_4ft.glb", (g) => {
      if (signal.aborted) return;
      this.attachModel(g.scene);
      this.show(0, true);
      this.root.classList.add("is-ready");
      this.fit();
      if (!this.reduce) this.idle();
    });
    const ro = new ResizeObserver(() => this.fit());
    ro.observe(this.host);
    const io = new IntersectionObserver((e) => (this.onScreen = e[0]?.isIntersecting ?? true), { rootMargin: "150px" });
    io.observe(this.root);
    signal.addEventListener("abort", () => {
      ro.disconnect();
      io.disconnect();
    });
    this.bindInput();
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy(): void {
    this.abort.abort();
    cancelAnimationFrame(this.raf);
    this.timers.forEach((t) => window.clearTimeout(t));
    this.textures.forEach((t) => t.dispose());
    this.ring.geometry.dispose();
    this.ring.material.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  /** Show any look on the live bag (the builder drives this as choices change); the model may still be loading, the look is applied as soon as it is. */
  preview(look: BagProduct): void {
    this.override = look;
    this.apply(this.current);
  }

  go(delta: number): void {
    this.show((this.current + delta + BAG_PRODUCTS.length) % BAG_PRODUCTS.length);
  }

  show(index: number, instant = false): void {
    if (instant || this.reduce) {
      this.apply(index);
      this.switchScale.k = 1;
      return;
    }
    // shrink out, swap, spring back in
    animate(this.switchScale, {
      k: 0.001,
      duration: 150,
      ease: "inQuad",
      onComplete: () => {
        this.apply(index);
        this.spinVel = 0;
        animate(this.switchScale, { k: 1, duration: 700, ease: createSpring({ stiffness: 170, damping: 13 }) });
      },
    });
  }

  // ------------------------------------------------------------------ model

  private image(url: string): THREE.Texture {
    const t = new THREE.TextureLoader().load(url);
    t.flipY = false;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = this.anisotropy;
    this.textures.set(url, t);
    return t;
  }

  private attachModel(model: THREE.Object3D): void {
    model.position.y = -HOOK;
    const patch = new THREE.MeshPhysicalMaterial({ map: this.image("/assets/bag3d/patch.png"), roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const strap = new THREE.MeshStandardMaterial({ color: 0xd8d8d2, roughness: 0.7 });
    const stitch = new THREE.MeshStandardMaterial({ color: 0xe4e4e0, roughness: 0.8 });
    const metal = new THREE.MeshStandardMaterial({ color: 0x1b1b1d, metalness: 1, roughness: 0.28 });
    const band = new THREE.MeshPhysicalMaterial({ color: 0xf3eadc, roughness: 0.45, clearcoat: 0.3 });
    const pick = (n: string): THREE.Material =>
      isBody(n) ? this.bodyMaterial : /^band_top/.test(n) ? this.bandTop : /^band_bottom/.test(n) ? this.bandBottom : /^band/.test(n) ? band : /^strap/.test(n) ? strap : /^stitch/.test(n) ? stitch : /^metal/.test(n) ? metal : /^patch/.test(n) ? patch : this.bodyMaterial;
    model.traverse((o) => {
      const m = asMesh(o);
      if (m) {
        m.material = pick(m.name);
        if (isBody(m.name)) this.bodyMeshes.push(m);
      }
    });
    this.spinGroup.add(model);
    this.model = model;
    this.spinGroup.updateWorldMatrix(true, true);
    this.aspect = this.cylindricalUV(model);
  }

  /** The exported body has collapsed UVs, so map it cylindrically: u wraps once round the bag, v runs bottom to top (u = 0.5 faces the camera). */
  private cylindricalUV(root: THREE.Object3D): number {
    const body: AnyMesh[] = [];
    const box = new THREE.Box3();
    root.traverse((o) => {
      const m = asMesh(o);
      if (m && /^(body|crown)_[LR]/.test(m.name)) {
        body.push(m);
        m.updateWorldMatrix(true, false);
        box.expandByObject(m);
      }
    });
    if (!body.length) return 1;
    const size = box.getSize(new THREE.Vector3());
    const ctr = box.getCenter(new THREE.Vector3());
    const rad = (size.x + size.z) / 4;
    const circ = 2 * Math.PI * rad;
    const v3 = new THREE.Vector3();
    for (const m of body) {
      const p = m.geometry.attributes["position"];
      if (!p) continue;
      const uv = new Float32Array(p.count * 2);
      for (let i = 0; i < p.count; i++) {
        v3.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld);
        uv[i * 2] = Math.atan2(v3.x - ctr.x, v3.z - ctr.z) / (2 * Math.PI) + 0.5;
        uv[i * 2 + 1] = 1 - (v3.y - box.min.y) / size.y;
      }
      m.geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    }
    return size.y / circ;
  }

  private artTexture(artKey: BagArtKey): THREE.Texture {
    const key = `art:${artKey}`;
    const hit = this.textures.get(key);
    if (hit) return hit;
    const cw = Math.min(2560, Math.floor(6144 / this.aspect));
    const t = new THREE.CanvasTexture(BAG_ART[artKey].draw(cw, Math.round(cw * this.aspect), () => (t.needsUpdate = true)));
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = this.anisotropy;
    t.flipY = false;
    this.textures.set(key, t);
    return t;
  }

  private apply(index: number): void {
    const p = this.override ?? BAG_PRODUCTS[index];
    if (!p) return;
    this.current = index;
    const m = this.bodyMaterial;
    if (p.art === null) {
      // plain colour: no texture, just a tinted satin-vinyl body. Every map is cleared so nothing from the previous artwork shows through.
      m.map = null;
      m.bumpMap = null;
      m.roughnessMap = null;
      m.metalnessMap = null;
      m.bumpScale = 0;
      m.color.setHex(p.color ?? 0xffffff);
      m.roughness = 0.5;
      m.metalness = 0;
      m.clearcoat = 0.18;
      m.clearcoatRoughness = 0.3;
      m.envMapIntensity = 0.45; // less studio reflection, so the colour stays true instead of washing out
      m.needsUpdate = true;
      this.bandTop.color.setHex(p.trim);
      this.bandBottom.color.setHex(p.trim);
      this.renderer.domElement.setAttribute("aria-label", `Interactive ${p.name.toLowerCase()}. Drag to spin, click or tap to hit it.`);
      this.onProduct(index);
      return;
    }
    m.color.setHex(0xffffff); // artwork textures carry their own colour; undo any plain-colour tint
    m.envMapIntensity = 1;
    const art = BAG_ART[p.art];
    const t = this.artTexture(p.art);
    m.map = t;
    m.bumpScale = p.bump;
    if (art.rm) {
      const rm = new THREE.TextureLoader().load(art.rm);
      rm.flipY = false;
      rm.colorSpace = THREE.NoColorSpace;
      rm.wrapS = rm.wrapT = THREE.RepeatWrapping;
      rm.anisotropy = this.anisotropy;
      this.textures.set(art.rm, rm);
      m.bumpMap = rm;
      m.roughnessMap = rm;
      m.metalnessMap = rm;
      m.roughness = 1;
      m.metalness = 1;
      m.clearcoat = 0.12;
    } else {
      m.bumpMap = t;
      m.roughnessMap = null;
      m.metalnessMap = null;
      m.roughness = 0.5;
      m.metalness = 0;
      m.clearcoat = 0.08;
    }
    m.needsUpdate = true;
    this.bandTop.color.setHex(p.trim);
    this.bandBottom.color.setHex(p.trim);
    this.renderer.domElement.setAttribute("aria-label", `Interactive ${p.name.toLowerCase()}. Drag to spin, click or tap to hit it.`);
    this.onProduct(index);
  }

  // ----------------------------------------------------------------- camera

  private fit(): void {
    const w = this.host.clientWidth || 1;
    const h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.cam.aspect = w / h;
    this.cam.updateProjectionMatrix();
    const f = THREE.MathUtils.degToRad(this.cam.fov);
    const half = 1.42;
    const d = Math.max(half / Math.tan(f / 2), 0.55 / (Math.tan(f / 2) * this.cam.aspect));
    this.cam.position.set(0.35, 0.9, d);
    this.cam.lookAt(0, 0.66, 0); // looks a little low, so the product sits high and the name has room below it
  }

  // ----------------------------------------------------------------- motion

  /** One punch: a sharp hit, then the bag swings back on a spring and settles. */
  private punch(dirX: number, dirZ: number, power = 1, point?: THREE.Vector3): void {
    const amp = 0.12 * power;
    const S = this.state;
    const tl = createTimeline({ defaults: { ease: "outQuad" } });
    tl.add(S, { swingZ: -dirX * amp, swingX: dirZ * amp * 0.7, twist: (Math.random() - 0.5) * 0.5 * power, duration: 170 }).add(S, { swingZ: 0, swingX: 0, twist: 0, ease: createSpring({ stiffness: 55, damping: 4.2, mass: 1.3 }) });
    animate(S, { dent: [0, power], duration: 90, ease: "outQuad", onComplete: () => animate(S, { dent: 0, duration: 600, ease: createSpring({ stiffness: 260, damping: 9 }) }) });
    if (point) {
      this.ring.position.copy(point);
      this.ring.lookAt(this.cam.position);
      animate(S, { ring: [0, 1], duration: 520, ease: "outExpo" });
    }
  }

  /** Idle: gentle sway, and a combo every few seconds when nobody is hitting it. */
  private idle(): void {
    animate(this.state, { swingX: [-0.012, 0.012], duration: 3200, ease: "inOutSine", loop: true, alternate: true });
    const later = (fn: () => void, ms: number): void => {
      this.timers.push(window.setTimeout(fn, ms));
    };
    const combo = (): void => {
      if (performance.now() - this.lastUser > 5000 && document.visibilityState === "visible") {
        const hit = (dx: number, p: number, t: number): void => later(() => this.punch(dx, 0.25, p, new THREE.Vector3(-dx * 0.2, this.mid + 0.25 * Math.random(), 0.16)), t);
        hit(-1, 0.55, 0);
        hit(-1, 0.6, 260);
        hit(1, 1.15, 700);
      }
      later(combo, 4200);
    };
    later(combo, 1200);
  }

  private bindInput(): void {
    const { signal } = this.abort;
    const el = this.renderer.domElement;
    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    el.addEventListener(
      "pointerdown",
      (e) => {
        this.pointer = { x: e.clientX, lx: e.clientX, moved: false, id: e.pointerId };
        this.spinVel = 0;
        this.resumeAt = performance.now() + 3500;
      },
      { signal },
    );
    el.addEventListener(
      "pointermove",
      (e) => {
        const d = this.pointer;
        if (!d || e.pointerId !== d.id) return;
        if (!d.moved && Math.abs(e.clientX - d.x) > 6) {
          d.moved = true;
          el.style.cursor = "grabbing";
          try {
            el.setPointerCapture(e.pointerId);
          } catch {
            /* capture can fail on some touch stacks: dragging still works */
          }
        }
        if (!d.moved) return;
        const dx = e.clientX - d.lx;
        d.lx = e.clientX;
        this.spin += dx * 0.011;
        this.spinVel = dx * 0.011;
        this.lastMove = performance.now();
        this.resumeAt = this.lastMove + 3500;
      },
      { signal },
    );
    const release = (e: PointerEvent): void => {
      const d = this.pointer;
      if (!d) return;
      this.pointer = null;
      el.style.cursor = "grab";
      if (d.moved || e.type !== "pointerup") {
        if (performance.now() - this.lastMove > 90) this.spinVel = 0;
        return;
      }
      const r = el.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, this.cam);
      const hit = ray.intersectObjects(this.bodyMeshes, false)[0];
      if (!hit) return;
      this.lastUser = performance.now();
      const dx = hit.point.x >= 0 ? 1 : -1;
      this.punch(-dx, 0.35, this.reduce ? 0.3 : 1, hit.point);
      this.root.classList.add("was-hit");
    };
    el.addEventListener("pointerup", release, { signal });
    el.addEventListener("pointercancel", release, { signal });
    el.addEventListener("pointerenter", () => (this.hover = true), { signal });
    el.addEventListener("pointerleave", () => (this.hover = false), { signal });
  }

  private readonly loop = (): void => {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.onScreen) return;
    if (!this.pointer) {
      this.spin += this.spinVel;
      this.spinVel *= 0.94;
      if (Math.abs(this.spinVel) < 0.0004) this.spinVel = 0;
      if (!this.reduce && !this.hover && this.spinVel === 0 && performance.now() > this.resumeAt) this.spin += 0.003; // slow turn (about 35 s a revolution) while nobody is touching it
    }
    // entry spin: as the bag scrolls up from the bottom it turns at the DNA's own rate, and that rate tapers smoothly to zero as it settles into place
    let entry = 0;
    if (!this.reduce) {
      const r = this.root.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const k = Math.max(0, (r.top + r.height / 2 - vh / 2) / vh);
      entry = -((DNA_RATE * vh) / 2) * k * k;
    }
    this.spinGroup.rotation.y = this.spin + entry;
    const S = this.state;
    this.pivot.rotation.z = S.swingZ;
    this.pivot.rotation.x = S.swingX;
    this.twist.rotation.y = S.twist;
    const d = S.dent * 0.045;
    const k = this.switchScale.k;
    this.bodyGroup.scale.set((1 - d) * k, (1 + d * 0.35) * k, (1 - d) * k);
    this.ring.material.opacity = S.ring > 0 && S.ring < 1 ? (1 - S.ring) * 0.8 : 0;
    this.ring.scale.setScalar(0.4 + S.ring * 1.8);
    this.renderer.render(this.scene, this.cam);
  };
}
