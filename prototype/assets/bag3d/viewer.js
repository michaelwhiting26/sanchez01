/* Real-time 3D bag preview (three.js). Geometry comes from the Blender template (bag_<n>ft.glb).
   Orbit is locked to the bag's own vertical axis (drag = rotate 360, wheel/pinch = zoom toward the bag centre). */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const BASE = new URL(".", import.meta.url).href;
const R = 0.2, BAND_T = 0.007, BAND_BOT = [0.04, 0.126], BELLY = 0.004;

function geo(ft) {
  const dz = ft * 0.3048 - 1.22;
  return { bodyTop: 1.02 + dz, bandTop: [0.985 + dz, 1.127 + dz], bag: 1.127 + dz };
}
const bodyR = (z, g) => R + BELLY * Math.sin((Math.PI * Math.min(Math.max(z, 0), g.bodyTop)) / g.bodyTop);

export function createBagViewer(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  const el = renderer.domElement;
  el.style.cssText = "display:block;inline-size:100%;block-size:100%;touch-action:none;cursor:grab";
  el.setAttribute("role", "img");
  host.appendChild(el);

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.85;
  const key = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(-2, 3, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.5); rim.position.set(3, 2, -3); scene.add(rim);

  const cam = new THREE.PerspectiveCamera(28, 1, 0.05, 60);
  const controls = new OrbitControls(cam, el);
  controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.9; controls.zoomSpeed = 0.8;
  controls.minPolarAngle = Math.PI / 2 - 0.32; controls.maxPolarAngle = Math.PI / 2 + 0.12;

  const hint = document.createElement("div");
  hint.className = "bag3d-hint"; hint.textContent = "Drag to rotate · Scroll to zoom";
  host.appendChild(hint);
  const hideHint = () => hint.classList.add("is-hidden");
  el.addEventListener("pointerdown", hideHint, { once: true }); el.addEventListener("wheel", hideHint, { once: true, passive: true });
  el.addEventListener("pointerdown", () => (el.style.cursor = "grabbing")); window.addEventListener("pointerup", () => (el.style.cursor = "grab"));

  /* ---- materials (colours are set from the configurator) ---- */
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const tex = (f) => { const t = new THREE.TextureLoader().load(BASE + f); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t; };
  const vinyl = () => new THREE.MeshPhysicalMaterial({ color: 0xe8e8e6, roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.25 });
  const M = {
    left: vinyl(), right: vinyl(),
    top: new THREE.MeshPhysicalMaterial({ map: tex("band_top_plain.png"), roughness: 0.5, sheen: 0.3 }),
    bottom: new THREE.MeshPhysicalMaterial({ map: tex("band_bottom_plain.png"), roughness: 0.5, sheen: 0.3 }),
    patch: new THREE.MeshPhysicalMaterial({ map: tex("patch.png"), roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    web: new THREE.MeshStandardMaterial({ color: 0xd8d8d2, roughness: 0.7 }),
    thread: new THREE.MeshStandardMaterial({ color: 0xe4e4e0, roughness: 0.8 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xc4c8cc, metalness: 1, roughness: 0.3 })
  };

  const holder = new THREE.Group(); scene.add(holder);
  const cache = {}; const loader = new GLTFLoader();
  const load = (ft) => (cache[ft] = cache[ft] || loader.loadAsync(BASE + "bag_" + ft + "ft.glb").then((g) => g.scene));
  let cur = null, decalGroup = new THREE.Group(), model = null, frameInfo = null, pending = null, disposed = false;

  /* The exported body has collapsed UVs, so patterns get a cylindrical mapping: u wraps once around the bag (seamless), v keeps the tile square. */
  function cylUV(root, fit) {
    if (root.userData.cylUV === (fit ? 'fit' : 'tile')) return; root.userData.cylUV = fit ? 'fit' : 'tile';
    const body = []; const box = new THREE.Box3();
    root.traverse((o) => { if (o.isMesh && /^(body|crown)_[LR]/.test(o.name)) { body.push(o); o.updateWorldMatrix(true, false); box.expandByObject(o); } });
    if (!body.length) return;
    const size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
    const ax = size.y >= size.x && size.y >= size.z ? 1 : size.x >= size.z ? 0 : 2;
    const h = ax === 1 ? "x" : "y", k = ax === 2 ? "x" : "z";      /* the two axes around the bag */
    const rad = (size[h] + size[k]) / 4, circ = 2 * Math.PI * rad, minA = box.min[["x", "y", "z"][ax]];
    body.forEach((m) => {
      const g = m.geometry, p = g.attributes.position, uv = new Float32Array(p.count * 2), v3 = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) {
        v3.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld);
        const th = Math.atan2(v3[h] - ctr[h], v3[k] - ctr[k]);
        uv[i * 2] = th / (2 * Math.PI) + 0.5; uv[i * 2 + 1] = fit ? 1 - (v3[["x", "y", "z"][ax]] - minA) / size[["x", "y", "z"][ax]] : (v3[["x", "y", "z"][ax]] - minA) / (circ / 2);
      }
      g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    });
    root.userData.aspect = size[["x", "y", "z"][ax]] / circ;
  }

  function assign(root) {
    root.traverse((o) => {
      if (!o.isMesh) return;
      const n = o.name;
      o.material = /^(body|crown)_L/.test(n) ? M.left : /^(body|crown)_R/.test(n) ? M.right : n.startsWith("band_top") ? M.top : n.startsWith("band_bottom") ? M.bottom :
        n.startsWith("patch") ? M.patch : n.startsWith("strap") ? M.web : n.startsWith("stitch") ? M.thread : n.indexOf("metal") === 0 ? M.metal : M.web;
    });
  }
  function frame(ft, keepAz) {
    const body = new THREE.Box3(), all = new THREE.Box3().setFromObject(model);
    model.traverse((o) => { if (o.isMesh && /^(body|crown)_/.test(o.name)) body.expandByObject(o); });
    const cy = (body.min.y + body.max.y) / 2;
    const halfH = Math.max(all.max.y - cy, cy - all.min.y) + 0.06;
    frameInfo = { cy, halfH };
    fit(true, keepAz);
  }
  function fit(reset, keepAz) {
    if (!frameInfo) return;
    const fov = THREE.MathUtils.degToRad(cam.fov), asp = cam.aspect || 1;
    const roomy = innerWidth < 1024 ? 1.17 : 1.06;   /* phones: pull back so the whole bag sits in the middle of the strip, not edge to edge */
    const d = Math.max(frameInfo.halfH / Math.tan(fov / 2), 0.3 / (Math.tan(fov / 2) * asp)) * roomy;
    controls.minDistance = d * 0.3; controls.maxDistance = d * 1.6;
    controls.target.set(0, frameInfo.cy, 0);
    const off = cam.position.clone().sub(controls.target);
    const az = keepAz && off.lengthSq() > 0 ? Math.atan2(off.x, off.z) : 0;
    const polar = Math.PI / 2 - 0.06, rad = reset ? d : Math.min(Math.max(off.length() * (d / (frameInfo.d || d)), controls.minDistance), controls.maxDistance);
    frameInfo.d = d;
    cam.position.set(controls.target.x + rad * Math.sin(polar) * Math.sin(az), controls.target.y + rad * Math.cos(polar), controls.target.z + rad * Math.sin(polar) * Math.cos(az));
    controls.update();
  }

  /* ---- logo decal ---- */
  function drawDecal(sp, W, H, totalLogoH) {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
    const logoH = Math.round(H * (totalLogoH)); const pad = sp.method === "embroidered" || sp.method === "leather-patch" ? Math.round(W * 0.05) : 0;
    if (pad) {
      x.fillStyle = sp.method === "leather-patch" ? "#8a5a3a" : sp.patchFill; x.strokeStyle = sp.method === "leather-patch" ? "#e9dcc4" : sp.fg;
      x.lineWidth = 3; x.setLineDash([9, 7]); x.beginPath(); x.roundRect(4, 4, W - 8, logoH - 8, 14); x.fill(); x.stroke(); x.setLineDash([]);
    }
    const cw = W - pad * 2, ch = logoH - pad * 2; x.save();
    if (sp.debossed) x.globalAlpha = 0.35;
    const fg = sp.debossed ? "#111111" : sp.fg;
    if (sp.img && sp.img.complete && sp.img.naturalWidth) {
      const r = Math.min(cw / sp.img.naturalWidth, ch / sp.img.naturalHeight), iw = sp.img.naturalWidth * r, ih = sp.img.naturalHeight * r;
      const t = document.createElement("canvas"); t.width = Math.max(1, Math.round(iw)); t.height = Math.max(1, Math.round(ih)); const tx = t.getContext("2d");
      tx.drawImage(sp.img, 0, 0, t.width, t.height);
      if (sp.variant === "white" || sp.variant === "black" || sp.debossed) { tx.globalCompositeOperation = "source-in"; tx.fillStyle = sp.variant === "white" ? "#ffffff" : "#111111"; tx.fillRect(0, 0, t.width, t.height); }
      x.drawImage(t, pad + (cw - iw) / 2, pad + (ch - ih) / 2);
    } else {
      const lines = sp.lines, longest = lines.reduce((m, l) => Math.max(m, l.length), 3);
      let fs = Math.min(ch / (lines.length + 0.3), cw / (longest * 0.46));
      x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = fg;
      const font = (s) => "800 " + s + "px " + sp.fam; x.font = font(fs);
      while (fs > 8 && Math.max.apply(null, lines.map((l) => x.measureText(l).width)) > cw) { fs -= 2; x.font = font(fs); }
      const y0 = pad + ch / 2 - ((lines.length - 1) * fs * 1.02) / 2;
      lines.forEach((l, i) => x.fillText(l, W / 2, y0 + i * fs * 1.02));
    }
    x.restore();
    if (sp.text) { x.fillStyle = sp.fg; x.textAlign = "center"; x.textBaseline = "middle"; const fs = Math.round((H - logoH) * 0.62); x.font = "600 " + fs + "px " + sp.textFam; x.fillText(sp.text, W / 2, logoH + (H - logoH) / 2); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t;
  }
  function buildDecals(sp, ft) {
    while (decalGroup.children.length) { const m = decalGroup.children.pop(); if (m.material.map) m.material.map.dispose(); m.material.dispose(); m.geometry.dispose(); }
    if (!sp) return;
    const g = geo(ft), place = sp.placement || "front";
    const lw = Math.min(sp.frac * 0.4, 0.62), lhFull = sp.size === "full";
    let lh = lhFull ? g.bag * 0.6 : lw * 0.8, zc, rad;
    const minZ = BAND_BOT[1] + 0.012, maxZ = g.bandTop[0] - 0.012;
    if (place === "top-band") { lh = Math.min(lh, 0.1); zc = (g.bandTop[0] + g.bandTop[1]) / 2; rad = R + BAND_T + 0.0012; }
    else if (place === "bottom-band") { lh = Math.min(lh, 0.07); zc = (BAND_BOT[0] + BAND_BOT[1]) / 2; rad = R + BAND_T + 0.0012; }
    else { zc = lhFull ? g.bag * 0.5 : g.bag - 0.4 * g.bag; lh = Math.min(lh, maxZ - minZ); zc = Math.min(Math.max(zc, minZ + lh / 2), maxZ - lh / 2); rad = bodyR(zc, g) + 0.0012; }
    const extra = sp.text && place === "front" ? 0.05 : 0, totalH = lh + extra;
    const W = 1024, H = Math.max(64, Math.round((W * totalH) / lw));
    const t = drawDecal(sp, W, H, lh / totalH);
    const half = lw / 2 / rad, thetas = place === "wrap" ? [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3] : place === "front-back" ? [0, Math.PI] : [0];
    const zCentre = zc - extra / 2;
    thetas.forEach((th) => {
      const geom = new THREE.CylinderGeometry(rad, rad, totalH, 64, 1, true, th - half, half * 2);
      const mat = new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
      const m = new THREE.Mesh(geom, mat); m.position.y = zCentre; decalGroup.add(m);
    });
  }

  let artKey = null, artTex = null;
  function setArt(k) {
    if (k === artKey) return; artKey = k;
    if (!k || !window.SZ_ART) { [M.left, M.right].forEach((m) => { m.map = null; m.bumpMap = null; m.roughnessMap = null; m.metalnessMap = null; m.roughness = 0.42; m.metalness = 0; m.clearcoat = 0.25; m.needsUpdate = true; }); return; }
    const fit = !!(window.SZ_ART.kinds[k] && window.SZ_ART.kinds[k].fit);
    if (fit && model) cylUV(model, true);
    const cv = window.SZ_ART.canvas(k, 2048, fit ? Math.round(2048 * ((model && model.userData.aspect) || 1)) : 1024);
    artTex = new THREE.CanvasTexture(cv); cv.__refresh = () => { artTex.needsUpdate = true; }; artTex.colorSpace = THREE.SRGBColorSpace; artTex.wrapS = THREE.RepeatWrapping; artTex.wrapT = THREE.RepeatWrapping; artTex.anisotropy = aniso; artTex.flipY = false;
    [M.left, M.right].forEach((m) => { m.map = artTex; m.needsUpdate = true; });
    const kind = window.SZ_ART.kinds[k];
    if (kind && kind.rm) {          /* R = relief, G = roughness, B = metal (gold veins, gold thread) */
      const rm = new THREE.TextureLoader().load(kind.rm, () => [M.left, M.right].forEach((m) => { m.needsUpdate = true; }));
      rm.flipY = false; rm.colorSpace = THREE.NoColorSpace; rm.wrapS = rm.wrapT = THREE.RepeatWrapping; rm.anisotropy = aniso;
      [M.left, M.right].forEach((m) => { m.bumpMap = rm; m.bumpScale = 1.3; m.roughnessMap = rm; m.metalnessMap = rm; m.roughness = 1; m.metalness = 1; m.clearcoat = 0.1; m.needsUpdate = true; });
    } else [M.left, M.right].forEach((m) => { m.bumpMap = null; m.roughnessMap = null; m.metalnessMap = null; m.roughness = 0.42; m.metalness = 0; m.clearcoat = 0.25; m.needsUpdate = true; });
  }

  function apply(st) {
    const c = (t, f) => new THREE.Color(t || f);
    const fitK = !!(st.art && window.SZ_ART && window.SZ_ART.kinds[st.art] && window.SZ_ART.kinds[st.art].fit);
    if (st.art && model) cylUV(model, fitK);
    setArt(st.art);
    M.left.color.copy(st.art ? new THREE.Color('#ffffff') : c(st.left, "#e8e8e6")); M.right.color.copy(st.art ? new THREE.Color('#ffffff') : c(st.right, "#e8e8e6"));
    M.top.color.copy(c(st.top, "#e6e6e2")); M.bottom.color.copy(c(st.bottom, "#e6e6e2"));
    const fin = st.finish === "silver" ? "#c4c8cc" : st.finish === "brand" ? st.brandPrimary || "#c4c8cc" : "#2a2a2a";
    M.metal.color.copy(new THREE.Color(fin));
    if (model) model.traverse((o) => { if (o.name === "stitch_seam") o.visible = !!st.split; });
    if (fitK) { while (decalGroup.children.length) { const m = decalGroup.children.pop(); if (m.material.map) m.material.map.dispose(); m.material.dispose(); m.geometry.dispose(); } } else buildDecals(st.decal, cur);
  }

  const ro = new ResizeObserver(() => { const w = host.clientWidth || 1, h = host.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); fit(false, true); });
  ro.observe(host);
  let raf = 0; const loop = () => { if (disposed) return; raf = requestAnimationFrame(loop); controls.update(); renderer.render(scene, cam); };
  loop();

  return {
    update(st) {
      pending = st;
      const ft = parseInt(st.length, 10);
      if (ft === cur && model) { apply(st); return; }
      load(ft).then((src) => {
        if (disposed || pending !== st && parseInt(pending.length, 10) !== ft) return;
        if (model) holder.remove(model);
        model = src; cur = ft; holder.add(model); holder.add(decalGroup); assign(model);
        frame(ft, true); apply(pending);
        el.setAttribute("aria-label", "Interactive 3D preview of the bag. Drag to rotate, scroll to zoom.");
      });
    },
    dispose() { disposed = true; cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); renderer.dispose(); pm.dispose(); el.remove(); hint.remove(); }
  };
}
