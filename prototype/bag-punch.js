/* "Hit it": the Blender punch bag (bag_4ft.glb), tiger colourway, hanging live in 3D, animated with anime.js 4.
   Click / tap the bag to punch it. It swings from the hook on a spring, twists a little, the body dents at the impact,
   and a shock ring flashes. When nobody is punching, it throws its own 1-2-hook combo every few seconds and sways gently. */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { animate, createSpring, createTimeline } from "./assets/vendor/anime/anime.esm.min.js";

const root = document.querySelector("[data-bag-punch]");
if (root) start(root);

function start(root) {
  const host = root.querySelector("[data-bag-view]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { root.classList.add("is-fallback"); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  const el = renderer.domElement; el.style.cssText = "display:block;inline-size:100%;block-size:100%;cursor:grab;touch-action:pan-y";
  el.setAttribute("aria-label", "Interactive punch bag. Click or tap the bag to hit it."); el.setAttribute("role", "img");
  host.appendChild(el);

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.9;
  const key = new THREE.DirectionalLight(0xfff1dc, 2.2); key.position.set(-2.5, 4, 3); scene.add(key);
  const rimL = new THREE.DirectionalLight(0xc9a45c, 1.6); rimL.position.set(3, 2, -2.5); scene.add(rimL);
  const cam = new THREE.PerspectiveCamera(26, 1, 0.05, 50);

  /* materials: black gloss body, cream bands and straps, black hardware (matches the black hero) */
  const M = {
    body: new THREE.MeshPhysicalMaterial({ color: 0x0c0c0e, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.18 }),
    band: new THREE.MeshPhysicalMaterial({ color: 0xf3eadc, roughness: 0.45, clearcoat: 0.3 }),
    strap: new THREE.MeshStandardMaterial({ color: 0xf3eadc, roughness: 0.6 }),
    stitch: new THREE.MeshStandardMaterial({ color: 0xc9a45c, roughness: 0.7 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x1b1b1d, metalness: 1, roughness: 0.28 }),
    patch: new THREE.MeshStandardMaterial({ color: 0xf3eadc, roughness: 0.6 })
  };
  /* tiger colourway (same artwork + mapping as the configurator: tiger on the front, white back). Falls back to the black bag if art.js is missing. */
  const ASSETS = new URL("./assets/bag3d/", import.meta.url).href;
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const img = (f) => { const t = new THREE.TextureLoader().load(ASSETS + f); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t; };
  const tiger = !!(window.SZ_ART && window.SZ_ART.kinds && window.SZ_ART.kinds.tigerfull);
  if (tiger) {
    M.body = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.5, clearcoat: 0.08, clearcoatRoughness: 0.4 });   /* satin, so the stitching reads instead of a glossy haze */
    M.bandTop = new THREE.MeshPhysicalMaterial({ map: img("band_top_plain.png"), roughness: 0.5, sheen: 0.3 });
    M.bandBottom = new THREE.MeshPhysicalMaterial({ map: img("band_bottom_plain.png"), roughness: 0.5, sheen: 0.3 });
    M.patch = new THREE.MeshPhysicalMaterial({ map: img("patch.png"), roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    M.strap = new THREE.MeshStandardMaterial({ color: 0xd8d8d2, roughness: 0.7 });
    M.stitch = new THREE.MeshStandardMaterial({ color: 0xe4e4e0, roughness: 0.8 });
  }
  /* The exported body has collapsed UVs, so map it cylindrically: u wraps once round the bag, v runs bottom to top (u = 0.5 faces the camera). */
  function cylUV(root) {
    const body = [], box = new THREE.Box3();
    root.traverse((o) => { if (o.isMesh && /^(body|crown)_[LR]/.test(o.name)) { body.push(o); o.updateWorldMatrix(true, false); box.expandByObject(o); } });
    if (!body.length) return 1;
    const size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
    const rad = (size.x + size.z) / 4, circ = 2 * Math.PI * rad, v3 = new THREE.Vector3();
    body.forEach((m) => {
      const p = m.geometry.attributes.position, uv = new Float32Array(p.count * 2);
      for (let i = 0; i < p.count; i++) {
        v3.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld);
        uv[i * 2] = Math.atan2(v3.x - ctr.x, v3.z - ctr.z) / (2 * Math.PI) + 0.5;
        uv[i * 2 + 1] = 1 - (v3.y - box.min.y) / size.y;
      }
      m.geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    });
    return size.y / circ;
  }
  const pick = (n) => /^(body|crown)/.test(n) ? M.body : /^band_top/.test(n) && M.bandTop ? M.bandTop : /^band_bottom/.test(n) && M.bandBottom ? M.bandBottom : /^band/.test(n) ? M.band : /^strap/.test(n) ? M.strap : /^stitch/.test(n) ? M.stitch : /^metal/.test(n) ? M.metal : /^patch/.test(n) ? M.patch : M.body;

  /* rig: pivot at the top of the hook, the bag hangs below it */
  const HOOK = 1.824, MID = 0.55;
  const pivot = new THREE.Group(); pivot.position.y = HOOK; scene.add(pivot);
  const twist = new THREE.Group(); pivot.add(twist);
  const bodyGroup = new THREE.Group(); twist.add(bodyGroup);
  const spinG = new THREE.Group(); bodyGroup.add(spinG);   /* drag turns this, 360 degrees, round the bag's own vertical axis */
  let bodyMeshes = [];

  /* shock ring at the impact point */
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.2, 64), new THREE.MeshBasicMaterial({ color: 0xf3eadc, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
  scene.add(ring);

  new GLTFLoader().load(new URL("./assets/bag3d/bag_4ft.glb", import.meta.url).href, (g) => {
    const model = g.scene; model.position.y = -HOOK;
    model.traverse((o) => { if (o.isMesh) { o.material = pick(o.name); if (/^(body|crown)/.test(o.name)) bodyMeshes.push(o); } });
    spinG.add(model);
    if (tiger) {
      spinG.updateWorldMatrix(true, true);
      const aspect = cylUV(model), cw = Math.min(2560, Math.floor(6144 / aspect)), cv = window.SZ_ART.canvas("tigerfull", cw, Math.round(cw * aspect));
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; t.flipY = false;
      cv.__refresh = () => { t.needsUpdate = true; };      /* art.js redraws the canvas once tiger.png has loaded */
      M.body.map = t; M.body.bumpMap = t; M.body.bumpScale = 1.4; M.body.needsUpdate = true;   /* the artwork doubles as a bump map: stitches catch the light */
    }
    root.classList.add("is-ready"); fit(); if (!reduce) idle();
  });

  /* camera framing */
  const fit = () => {
    const w = host.clientWidth || 1, h = host.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    const f = THREE.MathUtils.degToRad(cam.fov), half = 1.2;
    const d = Math.max(half / Math.tan(f / 2), 0.55 / (Math.tan(f / 2) * cam.aspect));
    cam.position.set(0.35, 0.95, d); cam.lookAt(0, 0.92, 0);
  };
  new ResizeObserver(fit).observe(host);

  /* animated state, driven by anime.js */
  const S = { swingX: 0, swingZ: 0, twist: 0, dent: 0, ring: 0 };
  let busy = null, lastUser = -1e9;

  /* one punch: a sharp hit, then the bag swings back on a spring and settles */
  function punch(dirX, dirZ, power = 1, point) {
    const amp = 0.12 * power;
    const tl = createTimeline({ defaults: { ease: "outQuad" } });
    tl.add(S, { swingZ: -dirX * amp, swingX: dirZ * amp * 0.7, twist: (Math.random() - 0.5) * 0.5 * power, duration: 170 })
      .add(S, { swingZ: 0, swingX: 0, twist: 0, ease: createSpring({ stiffness: 55, damping: 4.2, mass: 1.3 }) });
    animate(S, { dent: [0, power], duration: 90, ease: "outQuad", onComplete: () => animate(S, { dent: 0, duration: 600, ease: createSpring({ stiffness: 260, damping: 9 }) }) });
    if (point) {
      ring.position.copy(point); ring.lookAt(cam.position);
      animate(S, { ring: [0, 1], duration: 520, ease: "outExpo" });
    }
    return tl;
  }

  /* idle: gentle sway, and a combo every few seconds when nobody is hitting it */
  function idle() {
    animate(S, { swingX: [-0.012, 0.012], duration: 3200, ease: "inOutSine", loop: true, alternate: true });
    const combo = () => {
      if (performance.now() - lastUser > 5000 && document.visibilityState === "visible") {
        const hit = (dx, p, t) => setTimeout(() => punch(dx, 0.25, p, new THREE.Vector3(-dx * 0.2, MID + 0.25 * Math.random(), 0.16)), t);
        hit(-1, 0.55, 0); hit(-1, 0.6, 260); hit(1, 1.15, 700);
      }
      setTimeout(combo, 4200);
    };
    setTimeout(combo, 1200);
  }

  /* input: drag sideways to spin the bag 360 degrees (with a little momentum); a click / tap without dragging punches it */
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let spin = 0, spinVel = 0, down = null, lastMove = 0, hover = false, resumeAt = 0;
  el.addEventListener("pointerdown", (e) => {
    down = { x: e.clientX, y: e.clientY, lx: e.clientX, moved: false, id: e.pointerId }; spinVel = 0; resumeAt = performance.now() + 3500;
  });
  el.addEventListener("pointermove", (e) => {
    if (!down || e.pointerId !== down.id) return;
    if (!down.moved && Math.abs(e.clientX - down.x) > 6) { down.moved = true; el.style.cursor = "grabbing"; try { el.setPointerCapture(e.pointerId); } catch (_) {} }
    if (!down.moved) return;
    const dx = e.clientX - down.lx; down.lx = e.clientX; spin += dx * 0.011; spinVel = dx * 0.011; lastMove = performance.now(); resumeAt = lastMove + 3500;
  });
  const release = (e) => {
    if (!down) return; const d = down; down = null; el.style.cursor = "grab";
    if (d.moved || (e.type !== "pointerup")) { if (performance.now() - lastMove > 90) spinVel = 0; return; }
    const r = el.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, cam);
    const hit = ray.intersectObjects(bodyMeshes, false)[0];
    if (!hit) return;
    lastUser = performance.now();
    const dx = hit.point.x >= 0 ? 1 : -1;
    punch(-dx, 0.35, reduce ? 0.3 : 1, hit.point);
    root.classList.add("was-hit");
  };
  el.addEventListener("pointerup", release); el.addEventListener("pointercancel", release);
  el.addEventListener("pointerenter", () => { hover = true; }); el.addEventListener("pointerleave", () => { hover = false; });

  /* render loop: apply the animated state to the rig */
  const base = new THREE.Vector3(1, 1, 1);
  const loop = () => {
    requestAnimationFrame(loop);
    if (!down) {
      spin += spinVel; spinVel *= 0.94; if (Math.abs(spinVel) < 0.0004) spinVel = 0;
      if (!reduce && !hover && spinVel === 0 && performance.now() > resumeAt) spin += 0.003;   /* slow turn (about 35 s a revolution) while nobody is touching it */
    }
    spinG.rotation.y = spin;
    pivot.rotation.z = S.swingZ; pivot.rotation.x = S.swingX; twist.rotation.y = S.twist;
    const d = S.dent * 0.045; bodyGroup.scale.set(base.x - d, base.y + d * 0.35, base.z - d);
    ring.material.opacity = S.ring > 0 && S.ring < 1 ? (1 - S.ring) * 0.8 : 0; ring.scale.setScalar(0.4 + S.ring * 1.8);
    renderer.render(scene, cam);
  };
  loop();
}
