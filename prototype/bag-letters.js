/* SANCHEZ from seven bags. One real bag per letter (the Blender bag_4ft.glb) hangs in its slot. In order, S A N C H E Z, each bag spins on its own
   vertical axis and MORPHS into a big mosaic letter: the bag's body is swapped for a skin of square tiles that hug its surface exactly, then the tiles
   flow (top to bottom, with a little swirl) onto the letter's pixel grid while the spin winds down; straps and bands shrink away. A tan outline
   and shaded fill give the dot-mosaic look. Each letter starts GAP seconds after the previous one finishes.
   ?t=<seconds> freezes the animation at that time (screenshots / tests). */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const params = new URLSearchParams(location.search);
const WORD = "SANCHEZ";
const FREEZE = params.has("t") ? parseFloat(params.get("t")) : null;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- timing (seconds) ---- */
const INTRO = 1.5;        /* bags drop in and settle */
const START = 3.2;        /* first letter starts to morph */
const MORPH = 2.6;        /* how long one letter takes */
const GAP = 0.8;          /* pause between one letter finishing and the next starting */
const T_END = START + WORD.length * MORPH + (WORD.length - 1) * GAP;

/* ---- look ---- */
const RL = 84;                                    /* letter height in tiles */
const LH = 3.0, LW = LH * 0.6, SLOT = LW * 1.3; /* world size of a letter, and the pitch between letters */
const SB = 1.5;                                   /* bag scale before it morphs */
const COLOURS = [0x0b6fe8, 0xef2a12, 0x1f5c3a, 0xe2b10a];   /* plain colourways, one per letter, cycling */
const TAN = new THREE.Color(0xc2a673);

const host = document.querySelector("[data-stage]");
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 2));   /* lighter on phones */
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
host.appendChild(renderer.domElement);
renderer.domElement.style.cssText = "display:block;inline-size:100%;block-size:100%";
const scene = new THREE.Scene();
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.7;
const key = new THREE.DirectionalLight(0xfff1dc, 2.4); key.position.set(-3, 5, 7); scene.add(key);
const rim = new THREE.DirectionalLight(0xc9a45c, 1.8); rim.position.set(5, 3, -4); scene.add(rim);
const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 200);

let seed = 987654321; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = { io: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2), out: (u) => 1 - Math.pow(1 - u, 3) };

/* ---- one letter -> grid cells (filled, outline) by drawing it big and measuring ink per cell ---- */
function letterGrid(ch) {
  /* draw the letter in a heavy block face, fitted so its ink exactly fills the cell box (same height for every letter), then measure ink per cell */
  const cols = Math.round(RL * 0.6), S = 4, W = cols * S, Hh = RL * S, cv = document.createElement("canvas"); cv.width = W; cv.height = Hh;
  const g = cv.getContext("2d", { willReadFrequently: true }); g.fillStyle = "#fff";
  g.font = '400 200px Impact,"Arial Black","Barlow Condensed",sans-serif'; g.textAlign = "left"; g.textBaseline = "alphabetic";
  const m = g.measureText(ch), inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight, inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const sy = (Hh * 0.96) / inkH, sx = Math.min(sy, (W * 0.94) / inkW);
  g.translate(W / 2, Hh / 2); g.scale(sx, sy); g.fillText(ch, m.actualBoundingBoxLeft - inkW / 2, inkH / 2 - m.actualBoundingBoxDescent);
  const px = g.getImageData(0, 0, W, Hh).data, on = new Uint8Array(cols * RL);
  for (let r = 0; r < RL; r++) for (let c = 0; c < cols; c++) {
    let ink = 0; for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) ink += px[((r * S + y) * W + c * S + x) * 4 + 3];
    on[r * cols + c] = ink / (S * S * 255) > 0.5 ? 1 : 0;
  }
  const at = (r, c) => (r < 0 || c < 0 || r >= RL || c >= cols ? 0 : on[r * cols + c]);
  const open = (r, c) => { for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (!at(r + dr, c + dc)) return true; return false; };
  const ring1 = new Uint8Array(cols * RL), cells = [];
  for (let r = 0; r < RL; r++) for (let c = 0; c < cols; c++) if (on[r * cols + c] && open(r, c)) ring1[r * cols + c] = 1;
  const nearRing = (r, c) => { for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const rr = r + dr, cc = c + dc; if (rr >= 0 && cc >= 0 && rr < RL && cc < cols && ring1[rr * cols + cc]) return true; } return false; };
  for (let r = 0; r < RL; r++) for (let c = 0; c < cols; c++) if (on[r * cols + c]) cells.push({ r, c, edge: ring1[r * cols + c] === 1 || nearRing(r, c) });   /* two-tile tan outline */
  return { cells, cols };
}
/* soft value noise for the shaded fill (dark / light / accent patches like the reference) */
function noise2(x, y, sd) {
  const h = (i, j) => { const n = Math.sin(i * 127.1 + j * 311.7 + sd * 74.7) * 43758.5453; return n - Math.floor(n); };
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return h(xi, yi) * (1 - u) * (1 - v) + h(xi + 1, yi) * u * (1 - v) + h(xi, yi + 1) * (1 - u) * v + h(xi + 1, yi + 1) * u * v;
}

/* ---- assets ---- */
const ASSETS = new URL("./assets/bag3d/", import.meta.url).href;
const aniso = renderer.capabilities.getMaxAnisotropy();
const img = (f) => { const t = new THREE.TextureLoader().load(ASSETS + f); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t; };
const MAT = {
  bandTop: new THREE.MeshPhysicalMaterial({ map: img("band_top_plain.png"), roughness: 0.5, sheen: 0.3 }),
  bandBottom: new THREE.MeshPhysicalMaterial({ map: img("band_bottom_plain.png"), roughness: 0.5, sheen: 0.3 }),
  strap: new THREE.MeshStandardMaterial({ color: 0xd8d8d2, roughness: 0.7 }),
  stitch: new THREE.MeshStandardMaterial({ color: 0xe4e4e0, roughness: 0.8 }),
  patch: new THREE.MeshPhysicalMaterial({ map: img("patch.png"), roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })
};
const pick = (n) => /^band_top/.test(n) ? MAT.bandTop : /^band_bottom/.test(n) ? MAT.bandBottom : /^band/.test(n) ? MAT.bandTop : /^strap/.test(n) ? MAT.strap : /^stitch/.test(n) ? MAT.stitch : MAT.patch;
const bodyMat = (hex) => new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.5, clearcoat: 0.18, clearcoatRoughness: 0.3, envMapIntensity: 0.5 });

try { await document.fonts.load('800 100px "Barlow Condensed"'); } catch (_) { /* falls back to Impact */ }
new GLTFLoader().load(ASSETS + "bag_4ft.glb", (gltf) => build(gltf.scene));

function build(model) {
  /* bake every part into model space and centre the bag on the origin */
  model.updateMatrixWorld(true);
  const parts = [], box = new THREE.Box3(), bodyBox = new THREE.Box3();
  model.traverse((o) => {
    if (!o.isMesh || /^metal/.test(o.name)) return;                 /* no chain or hook */
    const geo = o.geometry.clone(); geo.applyMatrix4(o.matrixWorld); geo.computeBoundingBox();
    const isBody = /^(body|crown)/.test(o.name); box.union(geo.boundingBox); if (isBody) bodyBox.union(geo.boundingBox);
    parts.push({ geo, name: o.name, isBody });
  });
  const ctr = box.getCenter(new THREE.Vector3());
  parts.forEach((p) => p.geo.translate(-ctr.x, -ctr.y, -ctr.z));
  const bs = bodyBox.getSize(new THREE.Vector3()), bc = bodyBox.getCenter(new THREE.Vector3()).sub(ctr);
  const R = (Math.max(bs.x, bs.z) / 2) * SB, HB = bs.y * SB, byc = bc.y * SB;   /* body cylinder radius, height, centre (scaled) */

  const tileGeo = new THREE.BoxGeometry(1, 1, 1);
  const tileMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.05, envMapIntensity: 0.5 });
  const letters = [], n = WORD.length, cellL = LH / RL;
  /* layout: one row on wide screens; on a phone (portrait) two rows, SAN over CHEZ, so the letters stay big enough to read */
  const portrait = (host.clientWidth || 1) / (host.clientHeight || 1) < 0.9;
  const ROWSPEC = portrait ? [[0, 1, 2], [3, 4, 5, 6]] : [[0, 1, 2, 3, 4, 5, 6]], ROWGAP = LH * 1.3;
  const slotOf = []; ROWSPEC.forEach((row, ri) => row.forEach((k, i) => { slotOf[k] = { x: (i - (row.length - 1) / 2) * SLOT, y: ((ROWSPEC.length - 1) / 2 - ri) * ROWGAP }; }));

  for (let k = 0; k < n; k++) {
    const hex = COLOURS[k % COLOURS.length], base = new THREE.Color(hex);
    const { cells, cols } = letterGrid(WORD[k]), cx = slotOf[k].x, cy0 = slotOf[k].y;
    /* cylinder skin sized to hold at least as many tiles as the letter has cells (extras hide just behind the letter) */
    const rows = Math.max(6, Math.round(Math.sqrt((cells.length * HB) / (2 * Math.PI * R)))), cc = Math.ceil(cells.length / rows), M = rows * cc;
    const lc = cells.slice(); while (lc.length < M) { const s = cells[Math.floor(rnd() * cells.length)]; lc.push({ ...s, hidden: true }); }
    lc.sort((a, b) => a.r - b.r || a.c - b.c);
    const cyl = []; for (let j = 0; j < rows; j++) for (let i = 0; i < cc; i++) cyl.push({ row: j, th: (i / cc) * 2 * Math.PI - Math.PI + (j % 2) * Math.PI / cc });
    cyl.sort((a, b) => a.row - b.row || a.th - b.th);      /* top row first, like the letter cells */
    /* colours: dark-to-light shading with an accent streak, tan outline (as in the reference mosaic) */
    const dark = base.clone().multiplyScalar(0.3), light = base.clone().lerp(new THREE.Color(0xd2d5da), 0.7);   /* greyish highlights, as in the reference */
    const accent = new THREE.Color(k % 2 === 0 ? 0xc4202a : 0xdfe6f2);
    const tiles = lc.map((cell, i) => {
      const cy = cyl[i], lx = cx + (cell.c - cols / 2 + 0.5) * cellL, ly = (RL / 2 - cell.r - 0.5) * cellL + cy0;
      const dg = noise2((cell.c * 0.7 + cell.r * 0.5) * 0.05, (cell.c * 0.5 - cell.r * 0.7) * 0.11, k);   /* long diagonal streaks */
      const nz = dg * 0.75 + noise2(cell.c * 0.35, cell.r * 0.35, k + 9) * 0.25;
      const f = clamp01(nz * 1.5 - 0.3 + (rnd() - 0.5) * 0.14);   /* mostly deep colour, with a speckle, lighter streaks and an accent band */
      const col = cell.edge ? TAN.clone() : dark.clone().lerp(base, Math.min(1, f * 1.3));
      if (!cell.edge && f > 0.7) col.lerp(light, (f - 0.7) * 2.4);
      if (!cell.edge && nz > 0.78 + (rnd() - 0.5) * 0.06) col.lerp(accent, 0.7);
      col.multiplyScalar(0.9 + rnd() * 0.2);
      const vn = 1 - cy.row / (rows - 1);                   /* 0 at the bottom of the bag, 1 at the top */
      return { th: cy.th, cyY: cy0 + byc + (vn - 0.5) * HB, lx, ly, lz: cell.hidden ? -0.12 : 0, col, cwx: ((2 * Math.PI * R) / cc) * 1.04, cwy: (HB / rows) * 1.04,
        st: clamp01((cell.r / RL) * 0.55 + rnd() * 0.45), rnd: rnd(), hidden: !!cell.hidden };
    });
    const mesh = new THREE.InstancedMesh(tileGeo, tileMat, tiles.length); mesh.frustumCulled = false; mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    tiles.forEach((t, i) => mesh.setColorAt(i, t.col)); mesh.instanceColor.needsUpdate = true; scene.add(mesh);

    /* the real bag: body (hidden once the tiles take over) and fading parts (straps, bands, patch) */
    const g = new THREE.Group(), bodyG = new THREE.Group(), partsG = new THREE.Group(); g.add(bodyG, partsG); scene.add(g);
    const bm = bodyMat(hex);
    parts.forEach((p) => { const m = new THREE.Mesh(p.geo, p.isBody ? bm : pick(p.name)); (p.isBody ? bodyG : partsG).add(m); });
    letters.push({ k, g, bodyG, partsG, mesh, tiles, cx, cy: cy0, start: START + k * (MORPH + GAP), drop: 0.16 * k, dir: k % 2 ? -1 : 1 });
  }

  /* camera: fit the whole word */
  const W = Math.max(...ROWSPEC.map((r) => (r.length - 1) * SLOT + LW)), H = ROWSPEC.length * LH + (ROWSPEC.length - 1) * (ROWGAP - LH);
  const fit = () => {
    const w = host.clientWidth || 1, h = host.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    const f = THREE.MathUtils.degToRad(cam.fov), d = Math.max((H * 0.95) / Math.tan(f / 2), (W * 0.64) / (Math.tan(f / 2) * cam.aspect));
    cam.position.set(0, 0, d); cam.lookAt(0, -H * 0.06, 0);
  };
  new ResizeObserver(fit).observe(host); fit();

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), pos = new THREE.Vector3(), sc = new THREE.Vector3(), P = new THREE.Vector3();
  const frame = (t) => {
    for (const L of letters) {
      const tau = clamp01((t - L.start) / MORPH);                       /* 0 = still a bag, 1 = finished letter */
      const inU = clamp01((t - L.drop) / INTRO), land = ease.out(inU), morphing = tau > 0;
      /* spin: a gentle idle turn, then it winds up into a few full turns during the morph and slows to a stop */
      const spin = L.dir * (t * 0.5 + (1 - land) * 10 + 3 * Math.PI * 2 * ease.io(tau));
      L.g.position.set(L.cx, L.cy + (1 - land) * 9, 0); L.g.scale.setScalar(SB); L.g.rotation.set(Math.sin(t * 1.3 + L.k) * 0.02 * (1 - tau), spin, 0);
      L.bodyG.visible = !morphing;
      const fade = 1 - ease.io(clamp01(tau / 0.4)); L.partsG.scale.setScalar(Math.max(0.0001, fade)); L.partsG.visible = tau < 0.4;
      L.g.visible = tau < 1 && inU > 0; L.mesh.visible = morphing;
      if (!morphing) continue;
      const done = t - (L.start + MORPH);
      for (let i = 0; i < L.tiles.length; i++) {
        const c = L.tiles[i], e = ease.io(clamp01((tau - c.st * 0.5) / 0.5));
        const phi = c.th + spin;                                        /* the tile rides the spin until it lets go */
        const cxp = L.cx + Math.sin(phi) * R, czp = Math.cos(phi) * R;
        P.set(cxp + (c.lx - cxp) * e, c.cyY + (c.ly - c.cyY) * e, czp + (c.lz - czp) * e + Math.sin(Math.PI * e) * 0.9 * (0.4 + c.rnd));
        e3.set(0, phi * (1 - e), Math.sin(Math.PI * e) * (c.rnd - 0.5) * 1.6); q.setFromEuler(e3);
        const gap = (1.02 - 0.16 * e) * (c.hidden ? 1 - e : 1), sw = c.cwx + (cellL - c.cwx) * e, sh = c.cwy + (cellL - c.cwy) * e;   /* spare tiles shrink away as they land, so only the letter remains */
        if (done > 0 && !c.hidden) P.z += Math.sin(done * 1.6 + c.lx * 1.1 + c.ly * 0.7) * 0.03 * Math.min(1, done / 1.5);   /* settled letters keep breathing */
        sc.set(sw * gap, sh * gap, Math.min(sw, sh) * gap * 0.7); m4.compose(P, q, sc); L.mesh.setMatrixAt(i, m4);
      }
      L.mesh.instanceMatrix.needsUpdate = true;
    }
    const a = Math.sin(t * 0.3) * 0.04; cam.position.x = Math.sin(a) * cam.position.z * 0.6; cam.lookAt(0, -H * 0.06, 0);
    renderer.render(scene, cam);
  };
  let t0 = performance.now(), onScreen = true; new IntersectionObserver((en) => { onScreen = en[0].isIntersecting; }).observe(host);
  const loop = () => { requestAnimationFrame(loop); if (!onScreen) return; frame((performance.now() - t0) / 1000); };
  if (FREEZE !== null) { const hold = () => { requestAnimationFrame(hold); frame(FREEZE); }; hold(); }
  else if (reduce) { const hold = () => { requestAnimationFrame(hold); frame(T_END + 1); }; hold(); }
  else loop();
  document.querySelector("[data-replay]")?.addEventListener("click", () => { t0 = performance.now(); });
  document.documentElement.dataset.ready = letters.length + " bags, " + letters.reduce((s, L) => s + L.tiles.length, 0) + " tiles, " + T_END.toFixed(1) + "s";
}
