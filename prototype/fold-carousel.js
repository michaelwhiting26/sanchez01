/* Fold carousel: our own three.js implementation of a "folding cards" carousel (built from the effect's public description, not from anyone's code).
   The centre card lies flat and faces you. Its neighbours swing away about their inner edge like doors, showing their backs, then curl back toward the
   lens at the side of the stage, where the stretched picture smears into horizontal streaks and the silhouette picks up a thin spectral fringe.
   One card at a time: drag, horizontal wheel, arrow keys, or the two step buttons. An exact critically damped spring settles it at any frame rate.
   Accessible: a live region names the card, keyboard focus shows a ring, reduced motion settles faster and turns autoplay off,
   and a browser without WebGL sees a still card instead of a hole. Cards are curved strips with rounded corners cut by a signed-distance mask. */
import * as THREE from "three";

const root = document.querySelector("[data-fold-carousel]");
if (root) start(root);

function start(root) {
  const stage = root.querySelector("[data-fold-stage]"), live = root.querySelector("[data-fold-live]"), capT = root.querySelector("[data-fold-title]"), capS = root.querySelector("[data-fold-sub]");
  let cards = []; try { cards = JSON.parse(root.getAttribute("data-cards") || "[]"); } catch (e) {}
  const N = cards.length; if (!N) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ASPECT = 0.75, RADIUS = 0.055, FOLD_MAX = 2.0, GAP = 0.05, PITCH = 0.2, OMEGA = reduce ? 18 : 9;
  const nextBtn = root.querySelector("[data-fold-next]"), prevBtn = root.querySelector("[data-fold-prev]");

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { fallback(); return; }
  function fallback() { stage.classList.add("is-fallback"); const im = document.createElement("img"); im.src = cards[0].src; im.alt = cards[0].title; stage.appendChild(im); root.classList.add("is-ready"); }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setClearColor(0x000000, 0);
  const el = renderer.domElement; el.style.cssText = "display:block;inline-size:100%;block-size:100%;touch-action:pan-y"; el.setAttribute("aria-hidden", "true"); stage.appendChild(el);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);

  /* ---- textures: the six pictures, and one shared card back drawn with a 2D canvas ---- */
  const loader = new THREE.TextureLoader(), maxAniso = renderer.capabilities.getMaxAnisotropy();
  function backTexture() {
    const c = document.createElement("canvas"); c.width = 512; c.height = 683; const g = c.getContext("2d");
    g.fillStyle = "#0d0a08"; g.fillRect(0, 0, 512, 683);
    g.strokeStyle = "rgba(201,164,92,.55)"; g.lineWidth = 2; g.setLineDash([9, 7]); g.strokeRect(22, 22, 468, 639);            /* running stitch round the edge */
    g.setLineDash([]); g.fillStyle = "#c4553a"; g.beginPath(); const cx = 256, cy = 300, r = 46;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.36 : r; g.lineTo(cx + Math.cos(a - Math.PI / 2) * rr, cy + Math.sin(a - Math.PI / 2) * rr); } g.closePath(); g.fill();
    g.fillStyle = "#f3eadc"; g.textAlign = "center"; g.font = "800 44px 'Barlow Condensed', 'Arial Narrow', sans-serif"; g.fillText("SANCHEZ", 256, 410);
    g.fillStyle = "rgba(243,234,220,.5)"; g.font = "500 15px Barlow, Arial, sans-serif"; g.fillText("CUSTOM BOXING EQUIPMENT", 256, 442);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; return t;
  }
  let back = backTexture(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { const nb = backTexture(); meshes.forEach((m) => { m.material.uniforms.uBack.value = nb; }); back.dispose(); back = nb; });

  /* ---- one card: a curved strip, drawn with a shader that cuts rounded corners, smears and fringes when folded ---- */
  const VERT = `varying vec2 vUv; uniform float uBend; void main(){ vUv = uv; vec3 p = position; p.z -= uBend * p.x * p.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`;
  const FRAG = `precision highp float; varying vec2 vUv; uniform sampler2D uMap; uniform sampler2D uBack; uniform vec4 uCover; uniform float uAspect, uRadius, uFold, uSide, uOpacity, uLoaded;
    vec3 pic(vec2 uv){ return texture2D(uMap, uv * uCover.xy + uCover.zw).rgb; }
    void main(){
      vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0); vec2 q = abs(p) - vec2(uAspect, 1.0) * 0.5 + uRadius;
      float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
      float alpha = 1.0 - smoothstep(-0.003, 0.003, d);
      vec3 col;
      if (gl_FrontFacing) {
        float sm = uFold * uFold * 0.09, fr = uFold * 0.010, w = 0.0; vec3 acc = vec3(0.0);
        for (int i = -3; i <= 3; i++) { float o = float(i) / 3.0; float k = exp(-o * o * 1.6); vec2 uv = vec2(vUv.x + o * sm * (0.35 + 0.65 * (uSide > 0.0 ? vUv.x : 1.0 - vUv.x)), vUv.y);
          acc += vec3(pic(uv + vec2(fr, 0.0)).r, pic(uv).g, pic(uv - vec2(fr, 0.0)).b) * k; w += k; }
        col = acc / w; col = mix(col, col * vec3(1.06, 0.96, 0.9), uFold * 0.5); col = mix(vec3(0.05, 0.04, 0.035), col, uLoaded);
      } else { col = texture2D(uBack, vec2(1.0 - vUv.x, vUv.y)).rgb; }
      float rim = exp(-abs(d) / 0.010) * uFold;                                       /* the thin spectral fringe on the silhouette */
      vec3 hue = 0.5 + 0.5 * cos(6.28318 * (vUv.y * 0.7 + uFold * 0.3 + vec3(0.0, 0.33, 0.67)));
      col += hue * rim * 0.8; alpha = max(alpha, rim * 0.55);
      gl_FragColor = vec4(col, alpha * uOpacity);
      #include <colorspace_fragment>
    }`;
  const geo = new THREE.PlaneGeometry(ASPECT, 1, 28, 1);
  const meshes = cards.map((c) => {
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { uMap: { value: null }, uBack: { value: back }, uCover: { value: new THREE.Vector4(1, 1, 0, 0) }, uAspect: { value: ASPECT }, uRadius: { value: RADIUS }, uFold: { value: 0 }, uSide: { value: 1 }, uOpacity: { value: 1 }, uLoaded: { value: 0 }, uBend: { value: 0.07 } } });
    const m = new THREE.Mesh(geo, mat); scene.add(m);
    loader.load(c.src, (t) => {
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; const ia = t.image.width / t.image.height;   /* cover-fit the picture into the 3:4 card */
      let sx = 1, sy = 1; if (ia > ASPECT) sx = ASPECT / ia; else sy = ia / ASPECT;
      mat.uniforms.uCover.value.set(sx, sy, (1 - sx) / 2, (1 - sy) / 2); mat.uniforms.uMap.value = t; mat.uniforms.uLoaded.value = 1; dirty = true;
    });
    return m;
  });

  /* ---- the flare: as a card swings edge-on, a spectral streak of light runs the FULL height of the stage at its hinge, and the next card unfolds out of it ---- */
  const FLARE_V = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const FLARE_F = `precision highp float; varying vec2 vUv; uniform float uI, uT;
    vec3 spectrum(float t){ return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67))); }
    void main(){
      float x = (vUv.x - 0.5) * 2.0, y = vUv.y;
      float core = exp(-pow(x * 26.0, 2.0)), halo = exp(-abs(x) * 5.0) * 0.32;
      float tall = smoothstep(0.0, 0.10, y) * smoothstep(1.0, 0.90, y);                       /* runs the whole height, tapering only at the very ends */
      float streak = exp(-abs(y - 0.5) * 7.0) * exp(-abs(x) * 0.9) * 0.28;                     /* the anamorphic glint across the middle */
      vec3 hue = mix(spectrum(y * 0.85 + uT * 0.04), vec3(1.0, 0.9, 0.75), core * 0.55);       /* spectral along its length, hot white at the very centre */
      float k = (core * 1.25 + halo) * tall + streak;
      gl_FragColor = vec4(hue, clamp(k * uI, 0.0, 1.0));
      #include <colorspace_fragment>
    }`;
  const flareGeo = new THREE.PlaneGeometry(1, 1);
  const flares = cards.map(() => { const m = new THREE.Mesh(flareGeo, new THREE.ShaderMaterial({ vertexShader: FLARE_V, fragmentShader: FLARE_F, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: { uI: { value: 0 }, uT: { value: 0 } } })); m.renderOrder = 100; m.visible = false; scene.add(m); return m; });
  function placeFlare(f, o, phi, hingeX, hingeZ, timeS) {
    const a = Math.abs(o), edgeOn = Math.exp(-Math.pow((phi - Math.PI / 2) / 0.32, 2));               /* peaks when the card is exactly edge-on */
    const inten = a < 1.6 ? 0.16 * sm(0.05, 0.9, a) * (1 - sm(1.0, 1.6, a)) + 1.0 * edgeOn : 0;         /* a faint one at rest, a full one at edge-on */
    f.visible = inten > 0.01; if (!f.visible) return;
    const dist = cam.position.z - hingeZ, vh = 2 * dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    f.position.set(hingeX, 0, hingeZ + 0.05); f.scale.set(0.9, vh * 1.04, 1);                          /* full stage height at that depth */
    f.material.uniforms.uI.value = inten; f.material.uniforms.uT.value = timeS;
  }

  /* ---- layout: where each card sits for a (fractional) offset from the centre ---- */
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function place(m, o) {
    const a = Math.abs(o), s = o < 0 ? -1 : 1, fold = sm(0, 1, a), phi = FOLD_MAX * fold;             /* hinge angle: 0 flat .. ~115 degrees (back showing) */
    const hinge = s * (-ASPECT / 2 + Math.min(a, 1) * (ASPECT + GAP)) + s * Math.max(0, a - 1) * PITCH;   /* the card's inner edge (the door hinge): under the centre card at a=0, one slot out at a=1 */
    const along = ASPECT / 2, cosP = Math.cos(phi), sinP = Math.sin(phi);
    m.position.set(hinge + s * along * cosP, 0, -along * sinP + Math.max(0, a - 1) * 0.3);          /* swings about the inner edge; deeper cards curl back toward the lens */
    m.rotation.y = s * phi;
    const u = m.material.uniforms; u.uFold.value = fold; u.uSide.value = s; u.uOpacity.value = 1 - sm(1.7, 2.5, a);
    m.renderOrder = -Math.round(a * 10); m.visible = a < 2.6; return { phi, hinge, hz: Math.max(0, a - 1) * 0.3 };                                                   /* the deepest card fades out before it can grow past the frame */
  }

  /* ---- state: pos is the (fractional) index at the centre; an exact critically damped spring settles it on the target ---- */
  let pos = 0, vel = 0, target = 0, dirty = true, visible = true, lastT = performance.now(), idleSince = performance.now(), hoverOrFocus = false, drag = null;
  const wrap = (v) => { const h = N / 2; return ((((v + h) % N) + N) % N) - h; };
  function spring(dt) { const x0 = pos - target, A = x0, B = vel + OMEGA * x0, e = Math.exp(-OMEGA * dt); pos = target + (A + B * dt) * e; vel = (B - OMEGA * (A + B * dt)) * e; if (Math.abs(pos - target) < 1e-4 && Math.abs(vel) < 1e-4) { pos = target; vel = 0; } }
  function names() { const i = ((Math.round(target) % N) + N) % N; if (capT) capT.textContent = cards[i].title; if (capS) capS.textContent = cards[i].sub || ""; if (live) live.textContent = cards[i].title + ", card " + (i + 1) + " of " + N; }
  function go(d) { target = Math.round(target) + d; names(); idleSince = performance.now(); dirty = true; }
  names();

  function fit() {
    const w = stage.clientWidth || 1, h = stage.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    const f = THREE.MathUtils.degToRad(cam.fov), dH = 0.62 / Math.tan(f / 2), dW = 1.55 / (Math.tan(f / 2) * cam.aspect);   /* the centre card fits by height; on phones also leave room for the neighbours' edges */
    cam.position.set(0, 0, Math.max(dH, Math.min(dW, dH * 2.1))); cam.lookAt(0, 0, 0); dirty = true;
  }
  new ResizeObserver(fit).observe(stage); fit();

  /* ---- input ---- */
  nextBtn && nextBtn.addEventListener("click", () => go(1)); prevBtn && prevBtn.addEventListener("click", () => go(-1));
  stage.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { go(1); e.preventDefault(); } else if (e.key === "ArrowLeft") { go(-1); e.preventDefault(); } });
  stage.addEventListener("wheel", (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 8) { const now = performance.now(); if (!stage.__w || now - stage.__w > 350) { stage.__w = now; go(e.deltaX > 0 ? 1 : -1); } e.preventDefault(); } }, { passive: false });   /* horizontal only: vertical wheel still scrolls the page */
  stage.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, start: Math.round(target), moved: 0, id: e.pointerId }; });
  stage.addEventListener("pointermove", (e) => { if (!drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x; drag.moved = dx; if (Math.abs(dx) > 6) { try { stage.setPointerCapture(e.pointerId); } catch (_) {} } pos = drag.start - dx / (stage.clientWidth * 0.32) * 0.9; vel = 0; dirty = true; });
  const up = () => { if (!drag) return; const dx = drag.moved, thr = stage.clientWidth * 0.06; drag = null; if (Math.abs(dx) > thr) go(dx < 0 ? 1 : -1); else { target = Math.round(target); names(); } dirty = true; };
  stage.addEventListener("pointerup", up); stage.addEventListener("pointercancel", up);
  ["mouseenter", "focusin"].forEach((ev) => stage.addEventListener(ev, () => { hoverOrFocus = true; })); ["mouseleave", "focusout"].forEach((ev) => stage.addEventListener(ev, () => { hoverOrFocus = false; idleSince = performance.now(); }));
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { rootMargin: "100px" }).observe(stage);

  /* ---- loop: render only while on screen and moving (or every frame for the first second so pictures appear) ---- */
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now; if (!visible || document.hidden) return;
    if (!reduce && !hoverOrFocus && !drag && now - idleSince > 4500) go(1);                       /* gentle autoplay, off for reduced motion */
    const moving = drag || pos !== target || vel !== 0; if (!moving && !dirty) return;
    if (!drag) spring(dt);
    meshes.forEach((m, i) => { const o = wrap(i - pos), r = place(m, o); placeFlare(flares[i], o, r.phi, r.hinge, r.hz, now / 1000); });
    renderer.render(scene, cam); dirty = false; root.classList.add("is-ready");
  }
  requestAnimationFrame(frame);
}
