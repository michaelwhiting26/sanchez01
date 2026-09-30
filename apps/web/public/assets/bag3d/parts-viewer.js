/* "Build by parts" 3D viewer (three.js). Separate from viewer.js, which the quick configurator uses and which is untouched.
   The Blender template (bag_<n>ft.glb) is split into individually styled parts. The two hanging-strap hoops are cut into their four arms at load.
   API: createPartsViewer(host, { onPick }) -> { load(ft), style(id, {color, finish}), select(id), focus(id), setExplode(bool), setHardware(color), dispose() } */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const BASE = new URL(".", import.meta.url).href;

/* part id -> which template meshes belong to it; explode = how far it slides when the bag is pulled apart */
export const PART_DEFS = [
  { id: "bodyL", label: "Left side panel", mesh: /^body_L/, kind: "panel" },
  { id: "bodyR", label: "Right side panel", mesh: /^body_R/, kind: "panel" },
  { id: "domeL", label: "Top dome, left", mesh: /^crown_L/, kind: "dome" },
  { id: "domeR", label: "Top dome, right", mesh: /^crown_R/, kind: "dome" },
  { id: "bandTop", label: "Top waistband", mesh: /^band_top/, kind: "bandTop", tex: "band_top_plain.png" },
  { id: "bandBottom", label: "Bottom waistband", mesh: /^band_bottom/, kind: "bandBottom", tex: "band_bottom_plain.png" },
  { id: "strap1", label: "Strap 1", mesh: /^strap1a$/, kind: "strap" },
  { id: "strap2", label: "Strap 2", mesh: /^strap1b$/, kind: "strap" },
  { id: "strap3", label: "Strap 3", mesh: /^strap2a$/, kind: "strap" },
  { id: "strap4", label: "Strap 4", mesh: /^strap2b$/, kind: "strap" },
  { id: "patch", label: "Badge patch", mesh: /^patch/, kind: "patch", tex: "patch.png" },
  { id: "stitch", label: "Stitching", mesh: /^stitch/, kind: "stitch" },
  { id: "hardware", label: "Chain and hardware", mesh: /^metal/, kind: "metal" }
];

/* surface finishes: same material model, different physical parameters */
export const FINISHES = {
  gloss: { name: "Gloss vinyl", roughness: 0.34, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.18, sheen: 0 },
  satin: { name: "Satin", roughness: 0.55, metalness: 0, clearcoat: 0.15, clearcoatRoughness: 0.4, sheen: 0.15 },
  matte: { name: "Matte", roughness: 0.88, metalness: 0, clearcoat: 0, clearcoatRoughness: 0.6, sheen: 0.25 },
  metallic: { name: "Metallic", roughness: 0.3, metalness: 0.75, clearcoat: 0.4, clearcoatRoughness: 0.2, sheen: 0 }
};

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function createPartsViewer(host, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  const el = renderer.domElement;
  el.style.cssText = "display:block;inline-size:100%;block-size:100%;touch-action:none;cursor:grab";
  el.setAttribute("role", "img"); el.setAttribute("aria-label", "Interactive 3D bag. Drag to rotate, scroll to zoom, click a part to edit it.");
  host.appendChild(el);

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.85;
  const key = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(-2, 3, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.5); rim.position.set(3, 2, -3); scene.add(rim);

  const cam = new THREE.PerspectiveCamera(28, 1, 0.05, 60);
  const controls = new OrbitControls(cam, el);
  controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.08; controls.rotateSpeed = 0.9; controls.zoomSpeed = 0.8;
  controls.minPolarAngle = 0.35; controls.maxPolarAngle = Math.PI / 2 + 0.16;

  /* ---- materials: one per part ---- */
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const tex = (f) => { const t = new THREE.TextureLoader().load(BASE + f); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t; };
  const mats = {};
  PART_DEFS.forEach((d) => {
    const m = new THREE.MeshPhysicalMaterial({ color: 0xe8e8e6, ...FINISHES.gloss });
    if (d.tex) m.map = tex(d.tex);
    if (d.kind === "patch") { m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2; }
    if (d.kind === "stitch") { m.roughness = 0.8; m.clearcoat = 0; }
    if (d.kind === "metal") { m.color.set(0x2a2a2a); m.metalness = 1; m.roughness = 0.3; m.clearcoat = 0; }
    mats[d.id] = m;
  });

  const holder = new THREE.Group(); scene.add(holder);
  const loader = new GLTFLoader(); const cache = {};
  let model = null, parts = {}, frameInfo = null, selected = null, explode = 0, explodeTarget = 0, disposed = false, tween = null;

  /* cut a strap hoop into its two arms: split triangles by which side of the bag's axis they fall on, along the hoop's own direction */
  function splitStrap(mesh, nameA, nameB) {
    let g = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
    const p = g.attributes.position, n = p.count;
    let sxx = 0, szz = 0, sxz = 0;
    for (let i = 0; i < n; i++) { const x = p.getX(i), z = p.getZ(i); sxx += x * x; szz += z * z; sxz += x * z; }
    const a = 0.5 * Math.atan2(2 * sxz, sxx - szz), dx = Math.cos(a), dz = Math.sin(a);
    const side = [[], []];
    for (let t = 0; t < n; t += 3) {
      const c = ((p.getX(t) + p.getX(t + 1) + p.getX(t + 2)) * dx + (p.getZ(t) + p.getZ(t + 1) + p.getZ(t + 2)) * dz) / 3;
      side[c >= 0 ? 0 : 1].push(t);
    }
    const build = (starts, name) => {
      const ng = new THREE.BufferGeometry();
      for (const key of Object.keys(g.attributes)) {
        const src = g.attributes[key], sz = src.itemSize, arr = new Float32Array(starts.length * 3 * sz);
        starts.forEach((t, k) => { for (let v = 0; v < 3; v++) for (let c = 0; c < sz; c++) arr[(k * 3 + v) * sz + c] = src.array[(t + v) * sz + c]; });
        ng.setAttribute(key, new THREE.BufferAttribute(arr, sz));
      }
      const m = new THREE.Mesh(ng, mesh.material); m.name = name; m.position.copy(mesh.position); m.quaternion.copy(mesh.quaternion); m.scale.copy(mesh.scale);
      mesh.parent.add(m); return m;
    };
    build(side[0], nameA); build(side[1], nameB); mesh.parent.remove(mesh);
  }

  function prepare(root) {
    if (root.userData.parts) return;
    const straps = []; root.traverse((o) => { if (o.isMesh && /^strap[12]$/.test(o.name)) straps.push(o); });
    straps.forEach((s) => splitStrap(s, s.name + "a", s.name + "b"));
    root.updateMatrixWorld(true);
    root.userData.parts = true;
  }

  function register() {
    parts = {}; const all = new THREE.Box3();
    PART_DEFS.forEach((d) => (parts[d.id] = { def: d, meshes: [] }));
    model.traverse((o) => {
      if (!o.isMesh) return;
      const d = PART_DEFS.find((x) => x.mesh.test(o.name));
      if (!d) { o.visible = false; return; }
      o.material = mats[d.id]; o.userData.part = d.id; o.userData.base = o.position.clone(); parts[d.id].meshes.push(o);
    });
    model.updateMatrixWorld(true);
    const body = new THREE.Box3(); parts.bodyL.meshes.concat(parts.bodyR.meshes).forEach((m) => body.expandByObject(m));
    const ctr = body.getCenter(new THREE.Vector3()), size = body.getSize(new THREE.Vector3());
    Object.values(parts).forEach((p) => {
      const b = new THREE.Box3(); p.meshes.forEach((m) => b.expandByObject(m));
      const c = b.getCenter(new THREE.Vector3()); p.centre = c;
      const rad = new THREE.Vector3(c.x - ctr.x, 0, c.z - ctr.z); if (rad.lengthSq() < 1e-4) rad.set(0, 0, 0); else rad.normalize();
      const k = p.def.kind, H = size.y, up = new THREE.Vector3(0, 1, 0);
      p.explode = k === "panel" ? rad.clone().multiplyScalar(0.36)
        : k === "dome" ? rad.clone().multiplyScalar(0.3).addScaledVector(up, 0.3 * H)
        : k === "bandTop" ? up.clone().multiplyScalar(0.34 * H)
        : k === "bandBottom" ? up.clone().multiplyScalar(-0.3 * H)
        : k === "strap" ? rad.clone().multiplyScalar(0.12).addScaledVector(up, 0.42 * H)
        : k === "patch" ? rad.clone().multiplyScalar(0.3)
        : k === "metal" ? up.clone().multiplyScalar(0.62 * H) : new THREE.Vector3();
    });
    all.setFromObject(model);
    const cy = (body.min.y + body.max.y) / 2;
    frameInfo = { cy, halfH: Math.max(all.max.y - cy, cy - all.min.y) + 0.06, ctr };
  }

  function fit(reset, exTarget) {
    if (!frameInfo) return;
    const fov = THREE.MathUtils.degToRad(cam.fov), asp = cam.aspect || 1, ex = 1 + 0.55 * (exTarget === undefined ? explode : exTarget);
    const d = Math.max((frameInfo.halfH * ex) / Math.tan(fov / 2), (0.3 * ex) / (Math.tan(fov / 2) * asp)) * 0.86;
    controls.minDistance = d * 0.25; controls.maxDistance = d * 1.8;
    if (reset) {
      controls.target.set(0, frameInfo.cy, 0);
      const polar = Math.PI / 2 - 0.06;
      cam.position.set(0, frameInfo.cy + d * Math.cos(polar), d * Math.sin(polar)); controls.update();
    }
    frameInfo.d = d;
  }

  function applyExplode() {
    Object.values(parts).forEach((p) => p.meshes.forEach((m) => m.position.copy(m.userData.base).addScaledVector(p.explode, explode)));
    mats.stitch.transparent = true; mats.stitch.opacity = Math.max(0, 1 - explode * 1.4); parts.stitch.meshes.forEach((m) => (m.visible = mats.stitch.opacity > 0.02));
  }

  /* ---- picking: a click that is not a drag ---- */
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let down = null;
  el.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY }; el.style.cursor = "grabbing"; });
  window.addEventListener("pointerup", () => (el.style.cursor = "grab"));
  el.addEventListener("pointerup", (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5 || !model) return;
    const r = el.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, cam);
    const hit = ray.intersectObjects(Object.values(parts).filter((p) => p.def.kind !== "stitch").flatMap((p) => p.meshes), false)[0];
    if (hit && opts.onPick) opts.onPick(hit.object.userData.part);
  });

  const ro = new ResizeObserver(() => { const w = host.clientWidth || 1, h = host.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); fit(false); });
  ro.observe(host);

  const clock = new THREE.Clock();
  let raf = 0;
  const loop = () => {
    if (disposed) return; raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (Math.abs(explode - explodeTarget) > 0.001) { explode += (explodeTarget - explode) * Math.min(1, dt * 5); applyExplode(); fit(false); }
    if (tween) {
      tween.t = Math.min(1, tween.t + dt / tween.dur); const k = ease(tween.t);
      const az = tween.az0 + (tween.az1 - tween.az0) * k, pol = tween.pol0 + (tween.pol1 - tween.pol0) * k, rad = tween.r0 + (tween.r1 - tween.r0) * k;
      const ty = tween.ty0 + (tween.ty1 - tween.ty0) * k;
      controls.target.set(0, ty, 0);
      cam.position.set(rad * Math.sin(pol) * Math.sin(az), ty + rad * Math.cos(pol), rad * Math.sin(pol) * Math.cos(az));
      if (tween.t >= 1) tween = null;
    }
    if (selected && mats[selected]) { const s = 0.16 + 0.1 * Math.sin(performance.now() / 320); mats[selected].emissive.set(0xc9a45c); mats[selected].emissiveIntensity = s; }
    controls.update(); renderer.render(scene, cam);
  };
  loop();

  const wrapAz = (a0, a1) => { let d = a1 - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a0 + d; };

  return {
    load(ft) {
      const key = String(ft);
      const p = (cache[key] = cache[key] || loader.loadAsync(BASE + "bag_" + key + "ft.glb").then((g) => g.scene));
      return p.then((src) => {
        if (disposed) return;
        if (model) holder.remove(model);
        model = src; prepare(model); holder.add(model); register(); applyExplode(); fit(true);
        el.dispatchEvent(new CustomEvent("bagloaded"));
      });
    },
    style(id, s) {
      const m = mats[id]; if (!m) return;
      if (s.color) m.color.set(s.color);
      if (s.finish && FINISHES[s.finish] && PART_DEFS.find((d) => d.id === id).kind !== "stitch") {
        const f = FINISHES[s.finish]; m.roughness = f.roughness; m.metalness = PART_DEFS.find((d) => d.id === id).kind === "metal" ? Math.max(f.metalness, 0.9) : f.metalness;
        m.clearcoat = f.clearcoat; m.clearcoatRoughness = f.clearcoatRoughness; m.sheen = f.sheen; m.needsUpdate = true;
      }
    },
    select(id) { if (selected && mats[selected]) mats[selected].emissiveIntensity = 0; selected = id; },
    focus(id) {
      const p = parts[id]; if (!p || !frameInfo) return;
      const b = new THREE.Box3(); p.meshes.forEach((m) => b.expandByObject(m));
      const c = b.getCenter(new THREE.Vector3()), size = b.getSize(new THREE.Vector3());
      const off = cam.position.clone().sub(controls.target), r0 = off.length();
      const az0 = Math.atan2(off.x, off.z), pol0 = Math.acos(THREE.MathUtils.clamp(off.y / r0, -1, 1));
      const radial = Math.hypot(c.x, c.z) > 0.04, az1 = radial ? wrapAz(az0, Math.atan2(c.x, c.z)) : az0;
      const r1 = THREE.MathUtils.clamp(size.length() * 3.6 + 0.5, controls.minDistance, controls.maxDistance);
      const pol1 = THREE.MathUtils.clamp(Math.acos(THREE.MathUtils.clamp((c.y - frameInfo.cy) / Math.max(r1, 0.1) * 0.6, -0.5, 0.5)) , controls.minPolarAngle, controls.maxPolarAngle);
      tween = { t: 0, dur: 0.85, az0, az1, pol0, pol1, r0, r1, ty0: controls.target.y, ty1: THREE.MathUtils.clamp(c.y, frameInfo.cy - frameInfo.halfH, frameInfo.cy + frameInfo.halfH) };
    },
    setExplode(on) {
      explodeTarget = on ? 1 : 0; if (!frameInfo) return; fit(false, explodeTarget);
      const off = cam.position.clone().sub(controls.target), r0 = off.length(), az = Math.atan2(off.x, off.z), pol0 = Math.acos(THREE.MathUtils.clamp(off.y / r0, -1, 1));
      tween = { t: 0, dur: 1.1, az0: az, az1: az, pol0, pol1: Math.PI / 2 - 0.06, r0, r1: frameInfo.d, ty0: controls.target.y, ty1: frameInfo.cy };
    },
    reset() { tween = null; fit(true); },
    dispose() { disposed = true; cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); renderer.dispose(); pm.dispose(); el.remove(); }
  };
}
