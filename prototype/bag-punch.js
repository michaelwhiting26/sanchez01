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
  /* ---- products: the slots the left / right buttons cycle through. Add a product here and it appears in the switcher. ---- */
  /* Only Tiger and Monogram are live for now; Dragon, Koi and Gold Vein are kept below as comments so they can be switched back on. */
  const PRODUCTS = [
    { id: "tiger", name: "Tiger", sub: "Heavy bag", kind: "bag", art: "tigerfull", trim: 0xffffff, bump: 1.4, order: ["Order this bag", "product.html"], build: "configure.html?preset=tigerfull" },
    // PAUSED for now (Tiger and Monogram only): { id: "dragon", name: "Dragon", sub: "After Hokusai · gold on oxblood", kind: "bag", art: "dragonfull", trim: 0xc9a45c, bump: 1.3, order: ["Order this bag", "product.html"], build: "configure.html?preset=dragon" },
    // PAUSED for now (Tiger and Monogram only): { id: "koi", name: "Koi", sub: "After Gakutei · coral on indigo", kind: "bag", art: "koifull", trim: 0xe9e0cf, bump: 1.0, order: ["Order this bag", "product.html"], build: "configure.html?preset=koi" },
    { id: "monogram", name: "Monogram", sub: "Tone on tone · black on black", kind: "bag", art: "monogram", trim: 0x1c1c1e, bump: 1.6, order: ["Order this bag", "product.html"], build: "configure.html?preset=monogram" },
    // PAUSED for now (Tiger and Monogram only): { id: "kintsugi", name: "Gold Vein", sub: "Kintsugi leather", kind: "bag", art: "kintsugi", trim: 0xb8953f, bump: 1.6, order: ["Order this bag", "product.html"], build: "configure.html?preset=kintsugi" },
  ];
  let cur = 0;

  /* placeholder glove, built from simple shapes: red lacquer fist, thumb, cream cuff, hung on a chain like the bags. Swap for a Blender model later. */
  const gloveRoot = new THREE.Group(); gloveRoot.visible = false;
  const gloveHit = [];
  {
    const red = new THREE.MeshPhysicalMaterial({ color: 0xa83e26, roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.12 });
    const cream = new THREE.MeshPhysicalMaterial({ color: 0xf3eadc, roughness: 0.5, clearcoat: 0.25 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xc9a45c, roughness: 0.45, metalness: 0.6 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x1b1b1d, metalness: 1, roughness: 0.3 });
    const G = new THREE.Group(); G.scale.setScalar(1.5); G.position.y = 0.86 - 1.824; G.rotation.y = 0.35;
    const add = (geo, mat, x, y, z, sx = 1, sy = 1, sz = 1, rz = 0, rx = 0, hit = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.set(rx, 0, rz); G.add(m); if (hit) gloveHit.push(m); return m; };
    const sph = new THREE.SphereGeometry(1, 64, 48);
    add(sph, red, 0, -0.02, 0, 0.19, 0.245, 0.175);                              // main fist
    add(sph, red, 0.005, -0.15, 0.035, 0.175, 0.125, 0.155);                     // knuckle roll at the bottom
    add(new THREE.CapsuleGeometry(0.062, 0.15, 12, 24), red, -0.165, -0.035, 0.085, 1, 1, 0.9, 0.5, 0.25);   // thumb
    add(new THREE.CylinderGeometry(0.105, 0.118, 0.17, 64), cream, 0, 0.225, 0, 1, 1, 0.92);                // cuff
    add(new THREE.TorusGeometry(0.112, 0.011, 16, 64), gold, 0, 0.145, 0, 1, 1, 0.92, 0, Math.PI / 2, false); // stitched band
    add(new THREE.TorusGeometry(0.111, 0.011, 16, 64), gold, 0, 0.305, 0, 1, 1, 0.92, 0, Math.PI / 2, false);
    add(new THREE.TorusGeometry(0.028, 0.008, 12, 32), dark, 0, 0.335, 0, 1, 1, 1, 0, 0, false);             // hanging eye
    gloveRoot.add(G);
    const chainLen = 1.824 - 1.0 - 0.02;                                                                     // eye (~world y 1.02) up to the hook
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, chainLen, 8), dark); chain.position.y = 1.02 - 1.824 + chainLen / 2; gloveRoot.add(chain);
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
  const HOOK = 1.824; let MID = 0.55;
  const pivot = new THREE.Group(); pivot.position.y = HOOK; scene.add(pivot);
  const twist = new THREE.Group(); pivot.add(twist);
  const bodyGroup = new THREE.Group(); twist.add(bodyGroup);
  const spinG = new THREE.Group(); bodyGroup.add(spinG);   /* drag turns this, 360 degrees, round the bag's own vertical axis */
  let bodyMeshes = [];

  /* shock ring at the impact point */
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.2, 64), new THREE.MeshBasicMaterial({ color: 0xf3eadc, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
  scene.add(ring);

  let bagModel = null, bagAspect = 1, hitMeshes = bodyMeshes;
  const artTex = {};
  const rmTex = {};
  function rmTexture(url) {                                     /* R = relief, G = roughness, B = metal */
    if (rmTex[url]) return rmTex[url];
    const t = new THREE.TextureLoader().load(url); t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso;
    return (rmTex[url] = t);
  }
  function bagTexture(key) {                                     /* one texture per artwork, made the first time it is needed */
    if (artTex[key]) return artTex[key];
    const cw = Math.min(2560, Math.floor(6144 / bagAspect)), cv = window.SZ_ART.canvas(key, cw, Math.round(cw * bagAspect));
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; t.flipY = false;
    cv.__refresh = () => { t.needsUpdate = true; };              /* art.js redraws the canvas once the picture has loaded */
    return (artTex[key] = t);
  }
  new GLTFLoader().load(new URL("./assets/bag3d/bag_4ft.glb", import.meta.url).href, (g) => {
    const model = g.scene; model.position.y = -HOOK;
    model.traverse((o) => { if (o.isMesh) { o.material = pick(o.name); if (/^(body|crown)/.test(o.name)) bodyMeshes.push(o); } });
    spinG.add(model); spinG.add(gloveRoot); bagModel = model;
    if (tiger) { spinG.updateWorldMatrix(true, true); bagAspect = cylUV(model); }
    show(0, true);
    root.classList.add("is-ready"); fit(); if (!reduce) idle();
  });

  /* switching product: shrink out, swap, spring back in */
  const SW = { k: 1 };
  function apply(i) {
    const P = PRODUCTS[i]; cur = i;
    const isBag = P.kind === "bag", ok = isBag && window.SZ_ART && window.SZ_ART.kinds && window.SZ_ART.kinds[P.art];
    if (bagModel) bagModel.visible = isBag; gloveRoot.visible = !isBag;
    if (isBag && ok) {
      const t = bagTexture(P.art), kind = window.SZ_ART.kinds[P.art];
      M.body.map = t; M.body.bumpScale = P.bump;
      if (kind.rm) { const rm = rmTexture(kind.rm); M.body.bumpMap = rm; M.body.roughnessMap = rm; M.body.metalnessMap = rm; M.body.roughness = 1; M.body.metalness = 1; M.body.clearcoat = 0.12; }
      else { M.body.bumpMap = t; M.body.roughnessMap = null; M.body.metalnessMap = null; M.body.roughness = 0.5; M.body.metalness = 0; M.body.clearcoat = 0.08; }
      M.body.needsUpdate = true;
      [M.bandTop, M.bandBottom].forEach((m) => m && m.color.setHex(P.trim));
    }
    hitMeshes = isBag ? bodyMeshes : gloveHit; MID = P.mid || 0.55;
    el.setAttribute("aria-label", "Interactive " + P.name.toLowerCase() + ". Drag to spin, click or tap to hit it.");
    ui(i);
  }
  function show(i, instant) {
    if (instant || reduce) { apply(i); SW.k = 1; return; }
    animate(SW, { k: 0.001, duration: 150, ease: "inQuad", onComplete: () => { apply(i); spinVel = 0; animate(SW, { k: 1, duration: 700, ease: createSpring({ stiffness: 170, damping: 13 }) }); } });
  }
  const go = (d) => show((cur + d + PRODUCTS.length) % PRODUCTS.length);
  /* the buttons, name and dots */
  const orderEl = root.querySelector("[data-product-order]"), buildEl = root.querySelector("[data-product-build]");
  const ui = (i) => { const P = PRODUCTS[i]; if (orderEl) { orderEl.textContent = P.order[0]; orderEl.setAttribute("href", P.order[1]); } if (buildEl) { buildEl.setAttribute("href", P.build); buildEl.textContent = P.kind === "bag" ? "Build yourself" : "Design a glove"; } if (nameEl) nameEl.textContent = PRODUCTS[i].name; if (subEl) subEl.textContent = PRODUCTS[i].sub; dots.forEach((d, k) => d.setAttribute("aria-current", k === i ? "true" : "false")); };
  const nameEl = root.querySelector("[data-product-name]"), subEl = root.querySelector("[data-product-sub]");
  const dotBox = root.querySelector(".bag-punch__dots"); if (dotBox) dotBox.innerHTML = PRODUCTS.map((P, k) => '<button type="button" data-product-dot aria-label="' + P.name + '" aria-current="' + (k === 0) + '"></button>').join("");
  const dots = [...root.querySelectorAll("[data-product-dot]")];
  root.querySelector("[data-product-prev]")?.addEventListener("click", () => go(-1));
  root.querySelector("[data-product-next]")?.addEventListener("click", () => go(1));
  dots.forEach((d, k) => d.addEventListener("click", () => k !== cur && show(k)));
  root.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") { go(-1); e.preventDefault(); } else if (e.key === "ArrowRight") { go(1); e.preventDefault(); } });

  /* camera framing */
  const fit = () => {
    const w = host.clientWidth || 1, h = host.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    const f = THREE.MathUtils.degToRad(cam.fov), half = 1.42;
    const d = Math.max(half / Math.tan(f / 2), 0.55 / (Math.tan(f / 2) * cam.aspect));
    cam.position.set(0.35, 0.9, d); cam.lookAt(0, 0.66, 0);   /* looks a little low, so the product sits high and the name has room below it */
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
    const hit = ray.intersectObjects(hitMeshes, false)[0];
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
  let onScreen = true;   /* off screen: no drawing (a hidden WebGL scene still costs a phone real battery and frame rate) */
  new IntersectionObserver((e) => { onScreen = e[0].isIntersecting; }, { rootMargin: "150px" }).observe(root);
  const DNA_RATE = (2 * Math.PI * 0.55) / 210;   /* radians per pixel of scroll: exactly how fast the DNA helix turns */
  const loop = () => {
    requestAnimationFrame(loop);
    if (!onScreen) return;
    if (!down) {
      spin += spinVel; spinVel *= 0.94; if (Math.abs(spinVel) < 0.0004) spinVel = 0;
      if (!reduce && !hover && spinVel === 0 && performance.now() > resumeAt) spin += 0.003;   /* slow turn (about 35 s a revolution) while nobody is touching it */
    }
    /* entry spin: as the bag scrolls up from the bottom of the screen it turns at the DNA's own rate (0.55 turn per 210px of scroll), and that rate tapers smoothly to zero as it settles into its place on the page */
    let entry = 0;
    if (!reduce) { const r = root.getBoundingClientRect(), vh = window.innerHeight || 1, k = Math.max(0, (r.top + r.height / 2 - vh / 2) / vh); entry = -(DNA_RATE * vh / 2) * k * k; }
    spinG.rotation.y = spin + entry;
    pivot.rotation.z = S.swingZ; pivot.rotation.x = S.swingX; twist.rotation.y = S.twist;
    const d = S.dent * 0.045; bodyGroup.scale.set((base.x - d) * SW.k, (base.y + d * 0.35) * SW.k, (base.z - d) * SW.k);
    ring.material.opacity = S.ring > 0 && S.ring < 1 ? (1 - S.ring) * 0.8 : 0; ring.scale.setScalar(0.4 + S.ring * 1.8);
    renderer.render(scene, cam);
  };
  loop();
}
