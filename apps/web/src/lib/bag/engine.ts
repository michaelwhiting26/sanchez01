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

/** The parts the camera can fly to. */
export type FocusPart = "whole" | "body" | "top" | "bottom" | "patch" | "hardware";

/** What the builder has chosen, in the terms the 3D bag understands. Everything here changes what you see. */
export interface BuildOptions {
  plain: boolean;
  sizeFt: 3 | 4 | 5;
  hardware: "black" | "silver";
  hanging: "chain-4pt" | "heavy-swivel" | "strap";
  stitching: "tonal" | "contrast" | "accent";
  material: "vinyl" | "leather" | "canvas";
  layout: "single" | "split-vertical" | "bands" | "three-panel";
  bodyHex: number;
  accentHex: number;
  bottomHex: number;
  logoSize: "S" | "M" | "L" | "full";
  makersMark: boolean;
  anchorRing: boolean;
  piping: "none" | "contrast";
  text: string;
  font: "classic" | "block" | "script" | "stencil";
}

export type SceneId = "studio" | "gym" | "garage" | "outdoor" | "room";
export const SCENES: ReadonlyArray<{ id: SceneId; label: string }> = [
  { id: "studio", label: "Studio" },
  { id: "gym", label: "Boxing gym" },
  { id: "garage", label: "Home garage" },
  { id: "outdoor", label: "Outdoor" },
  { id: "room", label: "Your room" },
];

interface SceneDef {
  /** Top-to-bottom wall/sky gradient stops as CSS colours; null = transparent (the page shows through). */
  wall: readonly string[] | null;
  pattern: "none" | "brick" | "panels";
  floor: "none" | "mat" | "concrete" | "deck";
  floorTint: number;
  keyColor: number;
  keyI: number;
  rimColor: number;
  rimI: number;
  env: number;
  exposure: number;
}

const SCENE_DEFS: Record<SceneId, SceneDef> = {
  studio: { wall: null, pattern: "none", floor: "none", floorTint: 0xffffff, keyColor: 0xfff1dc, keyI: 2.2, rimColor: 0xc9a45c, rimI: 1.6, env: 0.9, exposure: 1.05 },
  gym: { wall: ["#1b1512", "#2d211b", "#3a2a20"], pattern: "brick", floor: "mat", floorTint: 0xffffff, keyColor: 0xffc98a, keyI: 2.8, rimColor: 0x9a6a3a, rimI: 1.0, env: 0.55, exposure: 1.0 },
  garage: { wall: ["#5b6168", "#79808a", "#8b929b"], pattern: "panels", floor: "concrete", floorTint: 0xffffff, keyColor: 0xdfeaff, keyI: 2.4, rimColor: 0x9db4d6, rimI: 1.1, env: 0.8, exposure: 1.0 },
  outdoor: { wall: ["#5d78a8", "#d79a7c", "#f2c88f"], pattern: "none", floor: "deck", floorTint: 0xffffff, keyColor: 0xffd9a8, keyI: 2.6, rimColor: 0x9cc0ff, rimI: 1.4, env: 1.15, exposure: 1.1 },
  room: { wall: null, pattern: "none", floor: "none", floorTint: 0xffffff, keyColor: 0xfff1dc, keyI: 2.2, rimColor: 0xc9a45c, rimI: 1.6, env: 0.9, exposure: 1.05 },
};

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
  private readonly partBoxes = new Map<FocusPart, THREE.Box3>();
  private opts: BuildOptions | null = null;
  private metalMat: THREE.MeshStandardMaterial | null = null;
  private stitchMat: THREE.MeshStandardMaterial | null = null;
  private chain: AnyMesh[] = [];
  private hook: AnyMesh[] = [];
  private swivel: AnyMesh[] = [];
  private patchMeshes: AnyMesh[] = [];
  private readonly baseScale = new WeakMap<THREE.Object3D, THREE.Vector3>();
  private modelFt = 4;
  private loadingFt = 0;
  private modelTop = HOOK;
  private anchor: THREE.Mesh | null = null;
  private readonly pipes: THREE.Mesh[] = [];
  private bandTopBox: THREE.Box3 | null = null;
  private readonly layoutTex = new Map<string, THREE.CanvasTexture>();
  private bandImg: HTMLImageElement | null = null;
  private bandTextKey = "";
  private focusPart: FocusPart = "whole";
  /** Half the height of the frame, in scene units: smaller is closer. The home page shows the bag with room below it; the builder frames it tight. */
  private half = 1.42;
  private readonly home = { pos: new THREE.Vector3(0.35, 0.9, 4), look: new THREE.Vector3(0, 0.66, 0) };
  private readonly camGoal = { pos: new THREE.Vector3(0.35, 0.9, 4), look: new THREE.Vector3(0, 0.66, 0) };
  private readonly camLook = new THREE.Vector3(0, 0.66, 0);
  private spinGoal: number | null = null;
  private lastFrame = performance.now();
  private readonly key = new THREE.DirectionalLight(0xfff1dc, 2.2);
  private readonly rimLight = new THREE.DirectionalLight(0xc9a45c, 1.6);
  private sceneId: SceneId = "studio";
  private bagBottom = 0;
  private readonly sceneTex = new Map<string, THREE.CanvasTexture>();
  private floorMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial> | null = null;
  private blobMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null;

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
    this.key.position.set(-2.5, 4, 3);
    this.rimLight.position.set(3, 2, -2.5);
    this.scene.add(this.key, this.rimLight);

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
      this.modelFt = 4;
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
    this.sceneTex.forEach((t) => t.dispose());
    this.scene.background = null;
    if (this.floorMesh) {
      this.floorMesh.geometry.dispose();
      this.floorMesh.material.dispose();
    }
    if (this.blobMesh) {
      this.blobMesh.geometry.dispose();
      this.blobMesh.material.dispose();
    }
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
    if (this.model) {
      this.spinGroup.remove(this.model); // a new size: take the old bag away
      this.partBoxes.clear();
      this.bodyMeshes = [];
      this.chain = [];
      this.hook = [];
      this.swivel = [];
      this.patchMeshes = [];
      this.anchor = null;
      this.pipes.length = 0;
    }
    model.updateWorldMatrix(true, true);
    const top = new THREE.Box3().setFromObject(model).max.y;
    this.modelTop = top > 0.5 ? top : HOOK;
    this.pivot.position.y = this.modelTop; // the hook stays at the pivot however long the bag is
    model.position.y = -this.modelTop;
    const patch = new THREE.MeshPhysicalMaterial({ map: this.image("/assets/bag3d/patch.png"), roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const strap = new THREE.MeshStandardMaterial({ color: 0xd8d8d2, roughness: 0.7 });
    const stitch = new THREE.MeshStandardMaterial({ color: 0xe4e4e0, roughness: 0.8 });
    const metal = new THREE.MeshStandardMaterial({ color: 0x1b1b1d, metalness: 1, roughness: 0.28 });
    const band = new THREE.MeshPhysicalMaterial({ color: 0xf3eadc, roughness: 0.45, clearcoat: 0.3 });
    const pick = (n: string): THREE.Material =>
      isBody(n) ? this.bodyMaterial : /^band_top/.test(n) ? this.bandTop : /^band_bottom/.test(n) ? this.bandBottom : /^band/.test(n) ? band : /^strap/.test(n) ? strap : /^stitch/.test(n) ? stitch : /^metal/.test(n) ? metal : /^patch/.test(n) ? patch : this.bodyMaterial;
    this.metalMat = metal;
    this.stitchMat = stitch;
    model.traverse((o) => {
      const m = asMesh(o);
      if (m) {
        m.material = pick(m.name);
        this.baseScale.set(m, m.scale.clone());
        if (isBody(m.name)) this.bodyMeshes.push(m);
        if (/^metal_link/.test(m.name)) this.chain.push(m);
        else if (/^metal_hook/.test(m.name)) this.hook.push(m);
        else if (/^metal_(swivel|disc)/.test(m.name)) this.swivel.push(m);
        else if (/^patch/.test(m.name)) this.patchMeshes.push(m);
      }
    });
    this.spinGroup.add(model);
    this.model = model;
    this.spinGroup.updateWorldMatrix(true, true);
    const partOf = (n: string): FocusPart | null => (/^(crown|band_top)/.test(n) ? "top" : /^band_bottom/.test(n) ? "bottom" : /^patch/.test(n) ? "patch" : /^metal/.test(n) ? "hardware" : /^body/.test(n) ? "body" : null);
    model.traverse((o) => {
      const m = asMesh(o);
      const part = m ? partOf(m.name) : null;
      if (!m || !part) return;
      const b = new THREE.Box3().setFromObject(m);
      const acc = this.partBoxes.get(part);
      if (acc) acc.union(b);
      else this.partBoxes.set(part, b);
    });
    const bt = new THREE.Box3();
    model.traverse((o) => {
      const m = asMesh(o);
      if (m && /^band_top/.test(m.name)) bt.expandByObject(m);
    });
    this.bandTopBox = bt.isEmpty() ? null : bt;
    this.aspect = this.cylindricalUV(model);
    this.bagBottom = new THREE.Box3().setFromObject(model).min.y;
    this.applyScene(); // the floor sits under whatever size of bag is now hanging
    this.applyOptions();
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
      this.bandBottom.color.setHex(p.trimBottom ?? p.trim);
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
    this.bandBottom.color.setHex(p.trimBottom ?? p.trim);
    this.renderer.domElement.setAttribute("aria-label", `Interactive ${p.name.toLowerCase()}. Drag to spin, click or tap to hit it.`);
    this.onProduct(index);
  }

  // ------------------------------------------------------------ build options

  /** Apply everything the builder has chosen. Safe to call before the model has loaded: it is applied as soon as it is. */
  build(o: BuildOptions): void {
    this.opts = o;
    if (o.sizeFt !== this.modelFt && this.loadingFt !== o.sizeFt) {
      const ft = o.sizeFt;
      this.loadingFt = ft;
      new GLTFLoader().load(`/assets/bag3d/bag_${ft}ft.glb`, (g) => {
        if (this.abort.signal.aborted) return;
        this.loadingFt = 0;
        this.modelFt = ft;
        this.attachModel(g.scene);
        this.apply(this.current);
        this.applyOptions();
        this.fit();
      });
    }
    this.applyOptions();
  }

  private applyOptions(): void {
    const o = this.opts;
    if (!o || !this.model) return;
    const silver = o.hardware === "silver";
    if (this.metalMat) {
      this.metalMat.color.setHex(silver ? 0xd6d9df : 0x1b1b1d);
      this.metalMat.roughness = silver ? 0.16 : 0.28;
      this.metalMat.needsUpdate = true;
    }
    const chained = o.hanging !== "strap";
    for (const m of [...this.chain, ...this.hook]) m.visible = chained;
    for (const m of this.swivel) {
      m.visible = chained;
      const base = this.baseScale.get(m);
      if (base) m.scale.copy(base).multiplyScalar(o.hanging === "heavy-swivel" ? 1.75 : 1);
    }
    if (this.stitchMat) {
      const body = new THREE.Color(o.bodyHex);
      const tonal = body.clone().offsetHSL(0, 0, body.getHSL({ h: 0, s: 0, l: 0 }).l > 0.55 ? -0.16 : 0.16);
      this.stitchMat.color.setHex(o.stitching === "tonal" ? tonal.getHex() : o.stitching === "contrast" ? 0xf3eadc : o.accentHex);
    }
    const scale = { S: 0.72, M: 1, L: 1.4, full: 1.8 }[o.logoSize];
    for (const m of this.patchMeshes) {
      m.visible = o.makersMark;
      const base = this.baseScale.get(m);
      if (base) m.scale.copy(base).multiplyScalar(scale);
    }
    this.applyBody();
    this.applyAnchor(o.anchorRing);
    this.applyPiping(o.piping === "contrast", o.accentHex);
    this.applyBandText();
  }

  /** Material feel, and the panel layout, on a plain bag (the artwork bags carry their own look). */
  private applyBody(): void {
    const o = this.opts;
    const m = this.bodyMaterial;
    if (!o || !o.plain) return;
    if (o.layout !== "single") {
      m.map = this.layoutTexture(o.layout, o.bodyHex, o.accentHex);
      m.color.setHex(0xffffff);
    }
    if (o.material === "leather") {
      m.roughness = 0.58;
      m.clearcoat = 0.05;
      m.clearcoatRoughness = 0.55;
      m.sheen = 0;
    } else if (o.material === "canvas") {
      m.roughness = 0.96;
      m.clearcoat = 0;
      m.sheen = 0.9;
      m.sheenRoughness = 0.5;
      m.sheenColor.setHex(0xffffff);
    } else {
      m.roughness = 0.5;
      m.clearcoat = 0.18;
      m.clearcoatRoughness = 0.3;
      m.sheen = 0;
    }
    m.needsUpdate = true;
  }

  private layoutTexture(layout: BuildOptions["layout"], bodyHex: number, accentHex: number): THREE.CanvasTexture {
    const key = `${layout}:${bodyHex}:${accentHex}`;
    const hit = this.layoutTex.get(key);
    if (hit) return hit;
    const W = 1024;
    const H = 1024;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    const css = (h: number): string => `#${h.toString(16).padStart(6, "0")}`;
    if (g) {
      g.fillStyle = css(bodyHex);
      g.fillRect(0, 0, W, H);
      g.fillStyle = css(accentHex);
      const seams: Array<[number, number, number, number]> = [];
      if (layout === "split-vertical") {
        g.fillRect(W / 2, 0, W / 2, H);
        seams.push([W / 2, 0, 3, H], [0, 0, 3, H]);
      } else if (layout === "three-panel") {
        g.fillRect(W / 3, 0, W / 3, H);
        seams.push([W / 3, 0, 3, H], [(2 * W) / 3, 0, 3, H], [0, 0, 3, H]);
      } else if (layout === "bands") {
        for (const [y0, y1] of [[0.3, 0.42], [0.58, 0.7]] as const) {
          g.fillRect(0, H * y0, W, H * (y1 - y0));
          seams.push([0, H * y0, W, 3], [0, H * y1, W, 3]);
        }
      }
      g.fillStyle = "rgba(0,0,0,0.28)"; // a fine seam where two panels meet
      for (const [x, y, w, h] of seams) g.fillRect(x, y, w, h);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = this.anisotropy;
    t.flipY = false;
    this.layoutTex.set(key, t);
    return t;
  }

  private applyAnchor(on: boolean): void {
    if (!this.model) return;
    if (!on) {
      if (this.anchor) this.anchor.visible = false;
      return;
    }
    if (!this.anchor) {
      this.anchor = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 14, 36), this.metalMat ?? new THREE.MeshStandardMaterial({ color: 0x1b1b1d, metalness: 1, roughness: 0.28 }));
      const bottom = this.partBoxes.get("bottom");
      this.anchor.position.set(0, (bottom?.min.y ?? 0) - 0.045, 0);
      this.model.add(this.anchor);
    }
    this.anchor.visible = true;
  }

  private applyPiping(on: boolean, hex: number): void {
    if (!this.model || !this.bandTopBox) return;
    if (!this.pipes.length && on) {
      const b = this.bandTopBox;
      const r = (b.max.x - b.min.x) / 2 + 0.004;
      for (const y of [b.min.y, b.max.y]) {
        const p = new THREE.Mesh(new THREE.TorusGeometry(r, 0.0065, 8, 64), new THREE.MeshStandardMaterial({ color: hex, roughness: 0.5 }));
        p.rotation.x = Math.PI / 2;
        p.position.set(0, y, 0);
        this.model.add(p);
        this.pipes.push(p);
      }
    }
    for (const p of this.pipes) {
      p.visible = on;
      (p.material as THREE.MeshStandardMaterial).color.setHex(hex);
    }
  }

  /** The visitor's own words, printed round the bottom band in the chosen lettering. */
  private applyBandText(): void {
    const o = this.opts;
    if (!o) return;
    const text = o.text.trim().toUpperCase();
    const key = `${text}|${o.font}`;
    if (key === this.bandTextKey) return;
    this.bandTextKey = key;
    if (!text) {
      this.bandBottom.map = this.image("/assets/bag3d/band_bottom_plain.png");
      this.bandBottom.needsUpdate = true;
      return;
    }
    const draw = (): void => {
      const c = document.createElement("canvas");
      c.width = 2048;
      c.height = 256;
      const g = c.getContext("2d");
      if (!g) return;
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, c.width, c.height);
      const face = { classic: "700 96px Georgia, 'Times New Roman', serif", block: "900 100px Impact, 'Arial Black', sans-serif", script: "italic 700 110px 'Brush Script MT', 'Snell Roundhand', cursive", stencil: "800 96px 'Courier New', monospace" }[o.font];
      g.font = face;
      g.fillStyle = "#1a1a1a";
      g.textAlign = "center";
      g.textBaseline = "middle";
      for (const x of [c.width * 0.125, c.width * 0.375, c.width * 0.625, c.width * 0.875]) g.fillText(text, x, c.height / 2, c.width * 0.22); // repeated round the bag so it reads from any side
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = this.anisotropy;
      t.flipY = false;
      this.bandBottom.map = t;
      this.bandBottom.needsUpdate = true;
    };
    draw();
  }

  // ------------------------------------------------------------------ scenes

  /** Swap the virtual room the bag hangs in, instantly. Safe before the model loads: the floor is re-seated when it does. */
  setScene(id: SceneId): void {
    this.sceneId = id;
    this.applyScene();
  }

  /** Render one frame right now and hand back the canvas, so the caller can drawImage it synchronously (no preserveDrawingBuffer needed). */
  capture(): HTMLCanvasElement {
    this.renderer.render(this.scene, this.cam);
    return this.renderer.domElement;
  }

  private sceneTexture(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat = false): THREE.CanvasTexture {
    const hit = this.sceneTex.get(key);
    if (hit) return hit;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    if (g) draw(g);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    if (repeat) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = this.anisotropy;
    }
    this.sceneTex.set(key, t);
    return t;
  }

  private wallTexture(id: SceneId, d: SceneDef): THREE.CanvasTexture | null {
    const stops = d.wall;
    if (!stops) return null;
    return this.sceneTexture(`wall:${id}`, 512, 512, (g) => {
      const grad = g.createLinearGradient(0, 0, 0, 512);
      stops.forEach((c, i) => grad.addColorStop(stops.length === 1 ? 0 : i / (stops.length - 1), c));
      g.fillStyle = grad;
      g.fillRect(0, 0, 512, 512);
      if (d.pattern === "brick") {
        g.strokeStyle = "rgba(0,0,0,0.28)";
        g.lineWidth = 2;
        for (let y = 0, row = 0; y < 512; y += 32, row++) {
          g.beginPath();
          g.moveTo(0, y);
          g.lineTo(512, y);
          g.stroke();
          for (let x = row % 2 ? 32 : 0; x < 512; x += 64) {
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x, y + 32);
            g.stroke();
          }
        }
      } else if (d.pattern === "panels") {
        g.strokeStyle = "rgba(0,0,0,0.16)";
        g.lineWidth = 2;
        for (let x = 0; x < 512; x += 64) {
          g.beginPath();
          g.moveTo(x, 0);
          g.lineTo(x, 512);
          g.stroke();
        }
      }
    });
  }

  private floorTexture(kind: "mat" | "concrete" | "deck"): THREE.CanvasTexture {
    return this.sceneTexture(`floor:${kind}`, 256, 256, (g) => {
      if (kind === "mat") {
        g.fillStyle = "#1c1c1e";
        g.fillRect(0, 0, 256, 256);
        g.strokeStyle = "rgba(255,255,255,0.10)";
        g.lineWidth = 3;
        g.strokeRect(0, 0, 256, 256);
        g.strokeStyle = "rgba(255,255,255,0.03)";
        for (let i = 16; i < 256; i += 16) {
          g.beginPath();
          g.moveTo(i, 0);
          g.lineTo(i, 256);
          g.stroke();
        }
      } else if (kind === "concrete") {
        g.fillStyle = "#8a8d92";
        g.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 2200; i++) {
          g.fillStyle = Math.random() < 0.5 ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)";
          g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
        }
        g.strokeStyle = "rgba(0,0,0,0.25)";
        g.lineWidth = 2;
        g.strokeRect(0, 0, 256, 256);
      } else {
        for (let y = 0; y < 256; y += 32) {
          g.fillStyle = y % 64 ? "#6a4a33" : "#75523a";
          g.fillRect(0, y, 256, 32);
          g.fillStyle = "rgba(0,0,0,0.35)";
          g.fillRect(0, y, 256, 2);
        }
      }
    }, true);
  }

  private blobTexture(): THREE.CanvasTexture {
    return this.sceneTexture("blob", 128, 128, (g) => {
      const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(0,0,0,0.55)");
      grad.addColorStop(0.5, "rgba(0,0,0,0.22)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
    });
  }

  private applyScene(): void {
    const id = this.sceneId;
    const d = SCENE_DEFS[id];
    this.scene.background = this.wallTexture(id, d);
    this.key.color.setHex(d.keyColor);
    this.key.intensity = d.keyI;
    this.rimLight.color.setHex(d.rimColor);
    this.rimLight.intensity = d.rimI;
    this.scene.environmentIntensity = d.env;
    this.renderer.toneMappingExposure = d.exposure;
    this.renderer.setClearColor(0x000000, 0);

    const floorY = this.bagBottom - 0.12;
    if (d.floor === "none") {
      if (this.floorMesh) this.floorMesh.visible = false;
    } else {
      if (!this.floorMesh) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0 }));
        m.rotation.x = -Math.PI / 2;
        this.floorMesh = m;
        this.scene.add(m);
      }
      const tex = this.floorTexture(d.floor);
      tex.repeat.set(d.floor === "deck" ? 10 : 20, d.floor === "deck" ? 10 : 20);
      this.floorMesh.material.map = tex;
      this.floorMesh.material.color.setHex(d.floorTint);
      this.floorMesh.material.needsUpdate = true;
      this.floorMesh.position.set(0, floorY, 0);
      this.floorMesh.visible = true;
    }
    // studio is exactly the original look: no blob. Every other scene (room included) gets a soft fake contact shadow.
    if (id === "studio") {
      if (this.blobMesh) this.blobMesh.visible = false;
    } else {
      if (!this.blobMesh) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), new THREE.MeshBasicMaterial({ map: this.blobTexture(), transparent: true, depthWrite: false }));
        m.rotation.x = -Math.PI / 2;
        m.renderOrder = 1;
        this.blobMesh = m;
        this.scene.add(m);
      }
      this.blobMesh.position.set(0, floorY + 0.004, 0);
      this.blobMesh.visible = true;
    }
  }

  // ----------------------------------------------------------------- camera

  /** Frame the whole bag tighter or looser (the builder wants it big). */
  setFraming(half: number): void {
    this.half = half;
    this.fit();
  }

  /** Fly the camera in on a part of the bag (and, for the patch, turn the bag to face it), or back out to the whole bag. */
  focus(part: FocusPart): void {
    this.focusPart = part;
    this.aim(false);
  }

  private aim(instant: boolean): void {
    const g = this.camGoal;
    const box = this.focusPart === "whole" ? null : this.partBoxes.get(this.focusPart);
    if (!box) {
      g.pos.copy(this.home.pos);
      g.look.copy(this.home.look);
      this.spinGoal = null;
    } else {
      const size = box.getSize(new THREE.Vector3());
      const ctr = box.getCenter(new THREE.Vector3());
      const f = THREE.MathUtils.degToRad(this.cam.fov);
      const fitH = size.y / 2 / Math.tan(f / 2);
      const fitW = Math.max(size.x, size.z) / 2 / (Math.tan(f / 2) * this.cam.aspect);
      const dist = Math.min(this.home.pos.z, Math.max(fitH, fitW) * 1.35 + 0.3); // the part fills most of the frame
      g.look.copy(ctr);
      g.pos.set(ctr.x + 0.12, ctr.y + size.y * 0.18, ctr.z + dist);
      // the patch sits on one side of the bag: turn the bag so it faces the camera
      const patch = this.partBoxes.get("patch");
      const pc = patch ? patch.getCenter(new THREE.Vector3()) : null;
      this.spinGoal = this.focusPart === "hardware" ? null : pc ? -Math.atan2(pc.x, pc.z) : 0; // turn the bag so the branded front faces you
    }
    if (instant) {
      this.cam.position.copy(g.pos);
      this.camLook.copy(g.look);
      this.cam.lookAt(this.camLook);
    }
  }

  private fit(): void {
    const w = this.host.clientWidth || 1;
    const h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.cam.aspect = w / h;
    this.cam.updateProjectionMatrix();
    const f = THREE.MathUtils.degToRad(this.cam.fov);
    const half = this.half < 1.3 ? 2.128 / 2 + 0.12 : this.half; // tight framing is fixed to the tallest (5 ft) bag, so a shorter bag really looks shorter
    const d = Math.max(half / Math.tan(f / 2), 0.55 / (Math.tan(f / 2) * this.cam.aspect));
    this.home.pos.set(0.35, 0.9, d);
    this.home.look.set(0, this.half < 1.3 ? 2.128 / 2 : 0.66 + (1.42 - half) * 0.33, 0); // looks a little low (and lower still when framed tight, so the top of the bag is not cropped), so the product sits high and the name has room below it
    this.aim(true);
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
        this.spinGoal = null; this.pointer = { x: e.clientX, lx: e.clientX, moved: false, id: e.pointerId };
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
    const nowMs = performance.now();
    const dt = Math.min(0.05, (nowMs - this.lastFrame) / 1000);
    this.lastFrame = nowMs;
    const kk = 1 - Math.exp(-dt * (this.reduce ? 40 : 4.2)); // an eased fly-in: fast at first, settling softly
    this.cam.position.lerp(this.camGoal.pos, kk);
    this.camLook.lerp(this.camGoal.look, kk);
    this.cam.lookAt(this.camLook);
    if (this.spinGoal !== null && !this.pointer) {
      const twoPi = Math.PI * 2;
      const diff = ((((this.spinGoal - this.spin) % twoPi) + Math.PI * 3) % twoPi) - Math.PI; // the shortest way round
      this.spin += diff * kk;
      this.spinVel = 0;
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
