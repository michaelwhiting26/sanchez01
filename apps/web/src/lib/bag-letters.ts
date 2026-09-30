/**
 * SANCHEZ from seven bags. One real bag per letter (the Blender bag_4ft.glb) hangs in its slot. In order, S A N C H E Z, each bag spins on its own
 * vertical axis and MORPHS into a big mosaic letter: the bag's body is swapped for a skin of square tiles that hug its surface exactly, then the tiles
 * flow (top to bottom, with a little swirl) onto the letter's pixel grid while the spin winds down; straps and bands shrink away. A tan outline and
 * shaded fill give the dot-mosaic look. Each letter starts GAP seconds after the previous one finishes.
 * On a phone (portrait) the word is laid out in two rows, SAN over CHEZ, so the letters stay big enough to read.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const WORD = "SANCHEZ";
const ASSETS = "/assets/bag3d/";

// timing, seconds
const INTRO = 1.5; // bags drop in and settle
const START = 3.2; // first letter starts to morph
const MORPH = 2.6; // how long one letter takes
const GAP = 0.8; // pause between one letter finishing and the next starting
const T_END = START + WORD.length * MORPH + (WORD.length - 1) * GAP;

// look
const RL = 84; // letter height in tiles
const LH = 3.0;
const LW = LH * 0.6;
const SLOT = LW * 1.3; // pitch between letters
const SB = 1.5; // bag scale before it morphs
const COLOURS = [0x0b6fe8, 0xef2a12, 0x1f5c3a, 0xe2b10a]; // the plain colourways, one per letter, cycling
const TAN = 0xc2a673;

interface Cell {
  r: number;
  c: number;
  edge: boolean;
  hidden?: boolean;
}
interface Tile {
  th: number;
  cyY: number;
  lx: number;
  ly: number;
  lz: number;
  cwx: number;
  cwy: number;
  st: number;
  rnd: number;
  hidden: boolean;
}
interface LetterBag {
  k: number;
  g: THREE.Group;
  bodyG: THREE.Group;
  partsG: THREE.Group;
  mesh: THREE.InstancedMesh;
  tiles: Tile[];
  cx: number;
  cy: number;
  start: number;
  drop: number;
  dir: 1 | -1;
}

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
const easeIO = (u: number): number => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);
const easeOut = (u: number): number => 1 - (1 - u) ** 3;

/** One letter to grid cells: drawn in a heavy block face, fitted so its ink exactly fills the cell box, then ink per cell is measured. */
function letterGrid(ch: string): { cells: Cell[]; cols: number } {
  const cols = Math.round(RL * 0.6);
  const S = 4;
  const W = cols * S;
  const H = RL * S;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d", { willReadFrequently: true });
  if (!g) return { cells: [], cols };
  g.fillStyle = "#fff";
  g.font = '400 200px Impact,"Arial Black","Barlow Condensed",sans-serif';
  g.textAlign = "left";
  g.textBaseline = "alphabetic";
  const m = g.measureText(ch);
  const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  const inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const sy = (H * 0.96) / inkH;
  const sx = Math.min(sy, (W * 0.94) / inkW);
  g.translate(W / 2, H / 2);
  g.scale(sx, sy);
  g.fillText(ch, m.actualBoundingBoxLeft - inkW / 2, inkH / 2 - m.actualBoundingBoxDescent);
  const px = g.getImageData(0, 0, W, H).data;
  const on = new Uint8Array(cols * RL);
  for (let r = 0; r < RL; r++) {
    for (let c = 0; c < cols; c++) {
      let ink = 0;
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) ink += px[((r * S + y) * W + c * S + x) * 4 + 3] ?? 0;
      on[r * cols + c] = ink / (S * S * 255) > 0.5 ? 1 : 0;
    }
  }
  const at = (r: number, c: number): number => (r < 0 || c < 0 || r >= RL || c >= cols ? 0 : (on[r * cols + c] ?? 0));
  const open = (r: number, c: number): boolean => {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (!at(r + dr, c + dc)) return true;
    return false;
  };
  const ring1 = new Uint8Array(cols * RL);
  for (let r = 0; r < RL; r++) for (let c = 0; c < cols; c++) if (at(r, c) && open(r, c)) ring1[r * cols + c] = 1;
  const nearRing = (r: number, c: number): boolean => {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr >= 0 && cc >= 0 && rr < RL && cc < cols && ring1[rr * cols + cc]) return true;
      }
    }
    return false;
  };
  const cells: Cell[] = [];
  for (let r = 0; r < RL; r++) for (let c = 0; c < cols; c++) if (at(r, c)) cells.push({ r, c, edge: ring1[r * cols + c] === 1 || nearRing(r, c) }); // two-tile tan outline
  return { cells, cols };
}

/** Soft value noise for the shaded fill (dark / light / accent patches, long diagonal streaks). */
function noise2(x: number, y: number, sd: number): number {
  const h = (i: number, j: number): number => {
    const n = Math.sin(i * 127.1 + j * 311.7 + sd * 74.7) * 43758.5453;
    return n - Math.floor(n);
  };
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  return h(xi, yi) * (1 - u) * (1 - v) + h(xi + 1, yi) * u * (1 - v) + h(xi, yi + 1) * (1 - u) * v + h(xi + 1, yi + 1) * u * v;
}

export interface BagLettersHandle {
  replay: () => void;
  destroy: () => void;
}

export function mountBagLetters(host: HTMLElement, freeze: number | null = null): BagLettersHandle {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.5 : 2)); // lighter on phones
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "display:block;inline-size:100%;block-size:100%";
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.7;
  const key = new THREE.DirectionalLight(0xfff1dc, 2.4);
  key.position.set(-3, 5, 7);
  const rim = new THREE.DirectionalLight(0xc9a45c, 1.8);
  rim.position.set(5, 3, -4);
  scene.add(key, rim);
  const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 200);

  let seed = 987654321;
  const rnd = (): number => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  let raf = 0;
  let destroyed = false;
  let t0 = performance.now();
  let ro: ResizeObserver | null = null;
  let io: IntersectionObserver | null = null;
  const disposables: { dispose: () => void }[] = [];

  const aniso = renderer.capabilities.getMaxAnisotropy();
  const img = (f: string): THREE.Texture => {
    const t = new THREE.TextureLoader().load(ASSETS + f);
    t.flipY = false;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = aniso;
    disposables.push(t);
    return t;
  };
  const MAT = {
    bandTop: new THREE.MeshPhysicalMaterial({ map: img("band_top_plain.png"), roughness: 0.5, sheen: 0.3 }),
    bandBottom: new THREE.MeshPhysicalMaterial({ map: img("band_bottom_plain.png"), roughness: 0.5, sheen: 0.3 }),
    strap: new THREE.MeshStandardMaterial({ color: 0xd8d8d2, roughness: 0.7 }),
    stitch: new THREE.MeshStandardMaterial({ color: 0xe4e4e0, roughness: 0.8 }),
    patch: new THREE.MeshPhysicalMaterial({ map: img("patch.png"), roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  };
  const pick = (n: string): THREE.Material =>
    /^band_top/.test(n) ? MAT.bandTop : /^band_bottom/.test(n) ? MAT.bandBottom : /^band/.test(n) ? MAT.bandTop : /^strap/.test(n) ? MAT.strap : /^stitch/.test(n) ? MAT.stitch : MAT.patch;
  const bodyMat = (hex: number): THREE.MeshPhysicalMaterial =>
    new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.5, clearcoat: 0.18, clearcoatRoughness: 0.3, envMapIntensity: 0.5 });
  disposables.push(...Object.values(MAT));

  // a guard (not `instanceof` inline) so the narrowed type is BufferGeometry with its default attribute map, not BufferGeometry<any, any>
  const isGeometry = (v: unknown): v is THREE.BufferGeometry => v instanceof THREE.BufferGeometry;

  const build = (model: THREE.Object3D): void => {
    // bake every part into model space and centre the bag on the origin
    model.updateMatrixWorld(true);
    const parts: { geo: THREE.BufferGeometry; name: string; isBody: boolean }[] = [];
    const box = new THREE.Box3();
    const bodyBox = new THREE.Box3();
    model.traverse((o) => {
      if (!(o instanceof THREE.Mesh) || /^metal/.test(o.name)) return; // no chain or hook
      const src: unknown = o.geometry; // THREE.Mesh's geometry is typed `any`; narrow it before use
      if (!isGeometry(src)) return;
      const geo = src.clone();
      geo.applyMatrix4(o.matrixWorld);
      geo.computeBoundingBox();
      const isBody = /^(body|crown)/.test(o.name);
      if (geo.boundingBox) {
        box.union(geo.boundingBox);
        if (isBody) bodyBox.union(geo.boundingBox);
      }
      parts.push({ geo, name: o.name, isBody });
    });
    const ctr = box.getCenter(new THREE.Vector3());
    for (const p of parts) {
      p.geo.translate(-ctr.x, -ctr.y, -ctr.z);
      disposables.push(p.geo);
    }
    const bs = bodyBox.getSize(new THREE.Vector3());
    const bc = bodyBox.getCenter(new THREE.Vector3()).sub(ctr);
    const R = (Math.max(bs.x, bs.z) / 2) * SB; // body cylinder radius, height and centre (scaled)
    const HB = bs.y * SB;
    const byc = bc.y * SB;

    const tileGeo = new THREE.BoxGeometry(1, 1, 1);
    const tileMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.05, envMapIntensity: 0.5 });
    disposables.push(tileGeo, tileMat);
    const n = WORD.length;
    const cellL = LH / RL;
    // one row on wide screens; two rows (SAN / CHEZ) on phones and other portrait screens
    const portrait = (host.clientWidth || 1) / (host.clientHeight || 1) < 0.9;
    const rowSpec = portrait ? [[0, 1, 2], [3, 4, 5, 6]] : [[0, 1, 2, 3, 4, 5, 6]];
    const rowGap = LH * 1.3;
    const slotOf: { x: number; y: number }[] = [];
    rowSpec.forEach((row, ri) =>
      row.forEach((k, i) => {
        slotOf[k] = { x: (i - (row.length - 1) / 2) * SLOT, y: ((rowSpec.length - 1) / 2 - ri) * rowGap };
      }),
    );

    const letters: LetterBag[] = [];
    const white = new THREE.Color(0xd2d5da);
    for (let k = 0; k < n; k++) {
      const ch = WORD[k];
      const slot = slotOf[k];
      if (!ch || !slot) continue;
      const hex = COLOURS[k % COLOURS.length] ?? 0xffffff;
      const base = new THREE.Color(hex);
      const { cells, cols } = letterGrid(ch);
      const cx = slot.x;
      const cy0 = slot.y;
      // the cylinder skin holds at least as many tiles as the letter has cells; spare tiles shrink away as they land
      const rows = Math.max(6, Math.round(Math.sqrt((cells.length * HB) / (2 * Math.PI * R))));
      const cc = Math.ceil(cells.length / rows);
      const M = rows * cc;
      const lc: Cell[] = cells.slice();
      while (lc.length < M) {
        const s = cells[Math.floor(rnd() * cells.length)];
        if (!s) break;
        lc.push({ ...s, hidden: true });
      }
      lc.sort((a, b) => a.r - b.r || a.c - b.c);
      const cyl: { row: number; th: number }[] = [];
      for (let j = 0; j < rows; j++) for (let i = 0; i < cc; i++) cyl.push({ row: j, th: (i / cc) * 2 * Math.PI - Math.PI + ((j % 2) * Math.PI) / cc });
      cyl.sort((a, b) => a.row - b.row || a.th - b.th); // top row first, like the letter cells
      // colours: deep colour with a speckle, long light streaks and an accent band, tan outline (as in the reference mosaic)
      const dark = base.clone().multiplyScalar(0.3);
      const light = base.clone().lerp(white, 0.7);
      const accent = new THREE.Color(k % 2 === 0 ? 0xc4202a : 0xdfe6f2);
      const tiles: Tile[] = [];
      const colours: THREE.Color[] = [];
      lc.forEach((cell, i) => {
        const cy = cyl[i];
        if (!cy) return;
        const lx = cx + (cell.c - cols / 2 + 0.5) * cellL;
        const ly = (RL / 2 - cell.r - 0.5) * cellL + cy0;
        const dg = noise2((cell.c * 0.7 + cell.r * 0.5) * 0.05, (cell.c * 0.5 - cell.r * 0.7) * 0.11, k);
        const nz = dg * 0.75 + noise2(cell.c * 0.35, cell.r * 0.35, k + 9) * 0.25;
        const f = clamp01(nz * 1.5 - 0.3 + (rnd() - 0.5) * 0.14);
        const col = cell.edge ? new THREE.Color(TAN) : dark.clone().lerp(base, Math.min(1, f * 1.3));
        if (!cell.edge && f > 0.7) col.lerp(light, (f - 0.7) * 2.4);
        if (!cell.edge && nz > 0.78 + (rnd() - 0.5) * 0.06) col.lerp(accent, 0.7);
        col.multiplyScalar(0.9 + rnd() * 0.2);
        const vn = 1 - cy.row / (rows - 1); // 0 at the bottom of the bag, 1 at the top
        tiles.push({
          th: cy.th,
          cyY: cy0 + byc + (vn - 0.5) * HB,
          lx,
          ly,
          lz: cell.hidden ? -0.12 : 0,
          cwx: ((2 * Math.PI * R) / cc) * 1.04,
          cwy: (HB / rows) * 1.04,
          st: clamp01((cell.r / RL) * 0.55 + rnd() * 0.45),
          rnd: rnd(),
          hidden: !!cell.hidden,
        });
        colours.push(col);
      });
      const mesh = new THREE.InstancedMesh(tileGeo, tileMat, tiles.length);
      mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      colours.forEach((c, i) => mesh.setColorAt(i, c));
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      scene.add(mesh);
      disposables.push(mesh);

      // the real bag: body (hidden once the tiles take over) and fading parts (straps, bands, patch)
      const g = new THREE.Group();
      const bodyG = new THREE.Group();
      const partsG = new THREE.Group();
      g.add(bodyG, partsG);
      scene.add(g);
      const bm = bodyMat(hex);
      disposables.push(bm);
      for (const p of parts) (p.isBody ? bodyG : partsG).add(new THREE.Mesh(p.geo, p.isBody ? bm : pick(p.name)));
      letters.push({ k, g, bodyG, partsG, mesh, tiles, cx, cy: cy0, start: START + k * (MORPH + GAP), drop: 0.16 * k, dir: k % 2 ? -1 : 1 });
    }

    // camera: fit the whole word
    const W = Math.max(...rowSpec.map((r) => (r.length - 1) * SLOT + LW));
    const H = rowSpec.length * LH + (rowSpec.length - 1) * (rowGap - LH);
    const fit = (): void => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      const f = THREE.MathUtils.degToRad(cam.fov);
      const d = Math.max((H * 0.95) / Math.tan(f / 2), (W * 0.64) / (Math.tan(f / 2) * cam.aspect));
      cam.position.set(0, 0, d);
      cam.lookAt(0, -H * 0.06, 0);
    };
    ro = new ResizeObserver(fit);
    ro.observe(host);
    fit();

    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e3 = new THREE.Euler();
    const sc = new THREE.Vector3();
    const P = new THREE.Vector3();
    const frame = (t: number): void => {
      for (const L of letters) {
        const tau = clamp01((t - L.start) / MORPH); // 0 = still a bag, 1 = finished letter
        const inU = clamp01((t - L.drop) / INTRO);
        const land = easeOut(inU);
        const morphing = tau > 0;
        // spin: a gentle idle turn, then it winds up into a few full turns during the morph and slows to a stop
        const spin = L.dir * (t * 0.5 + (1 - land) * 10 + 3 * Math.PI * 2 * easeIO(tau));
        L.g.position.set(L.cx, L.cy + (1 - land) * 9, 0);
        L.g.scale.setScalar(SB);
        L.g.rotation.set(Math.sin(t * 1.3 + L.k) * 0.02 * (1 - tau), spin, 0);
        L.bodyG.visible = !morphing;
        const fade = 1 - easeIO(clamp01(tau / 0.4));
        L.partsG.scale.setScalar(Math.max(0.0001, fade));
        L.partsG.visible = tau < 0.4;
        L.g.visible = tau < 1 && inU > 0;
        L.mesh.visible = morphing;
        if (!morphing) continue;
        const done = t - (L.start + MORPH);
        L.tiles.forEach((c, i) => {
          const e = easeIO(clamp01((tau - c.st * 0.5) / 0.5));
          const phi = c.th + spin; // the tile rides the spin until it lets go
          const cxp = L.cx + Math.sin(phi) * R;
          const czp = Math.cos(phi) * R;
          P.set(cxp + (c.lx - cxp) * e, c.cyY + (c.ly - c.cyY) * e, czp + (c.lz - czp) * e + Math.sin(Math.PI * e) * 0.9 * (0.4 + c.rnd));
          e3.set(0, phi * (1 - e), Math.sin(Math.PI * e) * (c.rnd - 0.5) * 1.6);
          q.setFromEuler(e3);
          const gap = (1.02 - 0.16 * e) * (c.hidden ? 1 - e : 1);
          const sw = c.cwx + (cellL - c.cwx) * e;
          const sh = c.cwy + (cellL - c.cwy) * e;
          if (done > 0 && !c.hidden) P.z += Math.sin(done * 1.6 + c.lx * 1.1 + c.ly * 0.7) * 0.03 * Math.min(1, done / 1.5); // settled letters keep breathing
          sc.set(sw * gap, sh * gap, Math.min(sw, sh) * gap * 0.7);
          m4.compose(P, q, sc);
          L.mesh.setMatrixAt(i, m4);
        });
        L.mesh.instanceMatrix.needsUpdate = true;
      }
      const a = Math.sin(t * 0.3) * 0.04;
      cam.position.x = Math.sin(a) * cam.position.z * 0.6;
      cam.lookAt(0, -H * 0.06, 0);
      renderer.render(scene, cam);
    };

    let onScreen = true;
    io = new IntersectionObserver((en) => {
      onScreen = en[0]?.isIntersecting ?? true;
    });
    io.observe(host);
    const loop = (): void => {
      if (destroyed) return;
      raf = requestAnimationFrame(loop);
      if (!onScreen) return;
      frame(freeze ?? (reduce ? T_END + 1 : (performance.now() - t0) / 1000));
    };
    loop();
  };

  void (async () => {
    try {
      await document.fonts.load('800 100px "Barlow Condensed"');
    } catch {
      // falls back to Impact
    }
    if (destroyed) return;
    try {
      const gltf = await new GLTFLoader().loadAsync(`${ASSETS}bag_4ft.glb`);
      if (!destroyed) build(gltf.scene);
    } catch (err) {
      console.error("bag-letters: could not load the bag model", err);
    }
  })();

  return {
    replay: () => {
      t0 = performance.now();
    },
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
      disposables.forEach((d) => d.dispose());
      pm.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
