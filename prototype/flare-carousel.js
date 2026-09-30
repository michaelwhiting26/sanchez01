/* Flare carousel: one calm, flat hero card in a black void. Each neighbour is ONE continuous curved surface: a turned card whose outer part is
   stretched into a huge bell that fills the screen edge. The surface is built in the vertex shader by walking along it: a heading angle
   starts at the card's yaw and relaxes to face the camera, so the card body turns edge-on while the wall swells toward the lens. Its picture is the
   card's own picture, dragged into long horizontal fibres. Text is painted into the card texture, so it deforms (and mirrors on the back).
   One virtual position is driven by drag, wheel and arrow keys; a critically damped spring follows it and snaps to whole cards.
   Built by comparing frames of a reference recording, not from anyone's code. Serve over http (canvas textures are blocked on file://). */
import * as THREE from "three";

/* ---- art-direction knobs: everything you would tune lives here ---- */
const LINE_FLOW_SPEED = 0.25;                       /* cycles per second: how fast light travels along the wall streaks */
const LINE_STITCH_CYCLES = 44.0;                    /* running-stitch dashes along a wall streak (8 on : 3 off, like the hero fingerprint) */
const LINE_FLOW_FREQUENCY = 3.0;                    /* pulses along the length of a wall */
const CONFIG = {
  bg: 0x161311,
  card: { w: 0.74, h: 1, radius: 0.045 },       /* a taller card than 4:5 */
  camera: { fov: 35, heroHeightFraction: 0.64 },  /* the hero fills this much of the viewport height */
  segments: { x: 168, y: 48 },
  visible: 1.6,                                  /* |p| beyond this is not drawn: at most hero + two neighbours are legible */
  layout: {
    restGap: 1.12,                              /* card centre distance at rest, in card widths */
    nearPow: 0.62,                               /* how fast a card moves out as it leaves the centre */
    yawFirst: 1.45, yawFirstAt: 0.35,           /* almost edge-on very early ... */
    yawRest: 1.02,                               /* ... then relaxes to this angle at rest (~58 deg) */
    yawBack: 0.95,                               /* past a slot it keeps turning over (the back face shows) */
    recede: 1.1,                                 /* resting neighbours sit this far behind the hero, so they read smaller */
    flareFrom: 0.45, flareTo: 1.0, flareFade: [0.95, 1.4],   /* the wall grows toward rest and shrinks as the card turns over */
  },
  wall: {
    length: 1.25,          /* arc length of the bell, in world units */
    heightGain: 3.6,      /* extra height at the outer end, as a multiple of the card height */
    heightExp: 1.0,      /* S-curve steepness of the top/bottom profile */
    straighten: 0.5,      /* how quickly the surface turns to face the camera */
    bodyKeep: 0.8,       /* share of the picture that stays on the card body; the rest becomes the wall */
    fibre: 0.15,          /* horizontal streak length (in picture widths) at the far end */
    haloHeight: 0.16, haloStrength: 1.0,
  },
  optics: { aberration: 0.0035, aberrationVelocity: 0.0016, rim: 0.9 },
  portrait: { below: 1.0, heroWidth: 0.6, restGap: 0.74, yawRest: 1.3, wallLength: 0.4, heightGain: 2.0, textScale: 1.45 },   /* phones/tablets held upright: smaller hero, neighbours tucked in and turned further, a short bell that starts inside the screen */
  motion: { omega: 8, omegaReduced: 20, dragPerCard: 0.26, wheelPerCard: 420, maxVelocity: 9, flick: 0.2, snapDelayMs: 140 },
};

const root = document.querySelector("[data-flare]");
if (window.__flare && window.__flare.destroy) window.__flare.destroy();          /* safe to re-run (reload / debug) */
if (root) start(root);

function start(root) {
  const stage = root.querySelector("[data-flare-stage]");
  const live = root.querySelector("[data-flare-live]");
  const cards = JSON.parse(root.getAttribute("data-cards") || "[]");
  const N = cards.length; if (!N) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const C = CONFIG, W = C.card.w, H = C.card.h;
  const embed = root.hasAttribute("data-embed");                                    /* embedded in a scrolling page: never trap the page scroll or stray keys */
  const ac = new AbortController(), on = (t, ev, fn, o) => t.addEventListener(ev, fn, Object.assign({ signal: ac.signal }, o));

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: embed }); } catch (e) { fallback(); return; }
  function fallback() {                                                              /* no WebGL: a static, readable hero card */
    stage.classList.add("is-fallback"); const c = cards[0];
    stage.innerHTML = '<figure style="margin:0;position:relative;inline-size:min(80vw,320px);aspect-ratio:4/5;border-radius:18px;overflow:hidden;background:#222"><img alt="" style="inline-size:100%;block-size:100%;object-fit:cover" src="' + c.src + '"><figcaption style="position:absolute;inset:0;padding:16px;display:flex;flex-direction:column;justify-content:space-between;font-size:14px"><span><b>' + c.title + "</b><br>" + c.sub + "</span><span>" + c.foot + "</span></figcaption></figure>";
    stage.style.display = "grid"; stage.style.placeItems = "center";
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setClearColor(C.bg, embed ? 0 : 1);                                   /* embedded: no background box, the page shows through */
  const el = renderer.domElement; el.setAttribute("aria-hidden", "true"); stage.appendChild(el); if (embed) stage.style.touchAction = "pan-y";
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(C.camera.fov, 1, 0.1, 50);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();

  /* ---- layout curves: everything visible is derived from p = index - position ---- */
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const L = Object.assign({}, C.layout);                                            /* fit() adjusts a few of these for portrait screens */
  const yawOf = (a) => (a <= L.yawFirstAt ? L.yawFirst * sm(0, L.yawFirstAt, a) : L.yawFirst + (L.yawRest - L.yawFirst) * sm(L.yawFirstAt, 1, a)) + L.yawBack * sm(1, 1.8, a);
  const flareOf = (a) => sm(L.flareFrom, L.flareTo, a) * (1 - sm(L.flareFade[0], L.flareFade[1], a));
  const cxOf = (a) => W * L.restGap * Math.pow(Math.min(a, 1), L.nearPow) + Math.max(0, a - 1) * W * 0.9;

  /* ---- card textures: duotone picture, one side smeared into streaks, then the card's own quiet type ---- */
  const TW = 1060, TH = Math.round(TW * H / W), K = TW / 530;                          /* texture matches the card's proportions */
  const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  async function paintCard(c) {
    const cv = document.createElement("canvas"); cv.width = TW; cv.height = TH; const g = cv.getContext("2d");
    const img = await loadImg(c.src); const [c1, c2, c3] = c.colors;
    const grad = g.createLinearGradient(0, TH, TW, 0); grad.addColorStop(0, c1); grad.addColorStop(0.55, c2); grad.addColorStop(1, c3);
    g.fillStyle = grad; g.fillRect(0, 0, TW, TH);
    if (img) {
      const ia = img.width / img.height, ta = TW / TH; let sw = img.width, sh = img.height, sx = 0, sy = 0;
      if (ia > ta) { sw = img.height * ta; sx = (img.width - sw) / 2; } else { sh = img.width / ta; sy = (img.height - sh) / 2; }
      const layer = document.createElement("canvas"); layer.width = TW; layer.height = TH; const lg = layer.getContext("2d");
      lg.filter = "grayscale(1) contrast(1.25) brightness(2.1)"; lg.drawImage(img, sx, sy, sw, sh, 0, 0, TW, TH); lg.filter = "none";
      const seam = Math.round(TW * (c.dir > 0 ? 0.52 : 0.48));                       /* the dry-brush smear on one side */
      if (c.dir > 0) lg.drawImage(layer, seam, 0, 6, TH, 0, 0, seam, TH); else lg.drawImage(layer, seam - 6, 0, 6, TH, seam, 0, TW - seam, TH);
      g.globalCompositeOperation = "multiply"; g.drawImage(layer, 0, 0);
      g.globalCompositeOperation = "screen"; g.globalAlpha = 0.14; g.fillStyle = grad; g.fillRect(0, 0, TW, TH); g.globalAlpha = 1; g.globalCompositeOperation = "source-over";   /* lift the blacks toward the colour */
    }
    const TS = stage.clientWidth < stage.clientHeight ? C.portrait.textScale : 1;                 /* upright phone: the hero is smaller on screen, so the type is drawn larger */
    const F = "Inter, -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif", M = 28 * K * TS;
    g.fillStyle = "rgba(255,255,255,0.95)"; g.font = "500 " + 20 * K * TS + "px " + F; g.fillText(c.title, M, 52 * K * TS);
    g.fillStyle = "rgba(255,255,255,0.75)"; g.font = "400 " + 18 * K * TS + "px " + F; if (c.sub) g.fillText(c.sub, M, 80 * K * TS);
    if (c.pill) {
      g.font = "500 " + 14 * K * TS + "px " + F; const tw = g.measureText(c.pill).width, ph = 26 * K * TS, pw = tw + 22 * K * TS, px = TW - M - pw, py = 32 * K * TS;
      g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.roundRect(px, py, pw, ph, ph / 2); g.fill();
      g.fillStyle = "rgba(255,255,255,0.95)"; g.fillText(c.pill, px + 11 * K * TS, py + 18 * K * TS);
    }
    if (c.foot) { g.fillStyle = "rgba(255,255,255,0.92)"; g.font = "500 " + 17 * K * TS + "px " + F; g.fillText(c.foot, M, TH - 30 * K * TS); }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; return t;
  }

  /* ---- the surface ---- */
  const WL = C.wall;
  const VERT = `
    varying vec2 vUv; varying float vK, vW, vSy, vSigma;
    uniform float uS, uW, uH, uYaw, uF, uCx, uCz, uLen, uYf, uYexp, uStraight, uHalo;
    void main(){
      vUv = uv;
      float k = uS > 0.0 ? uv.x : 1.0 - uv.x;                              /* 0 at the inner edge .. 1 at the far end of the wall */
      float w = 0.0, sigma = k * 2.0 * uW;
      if (k > 0.5) { w = (k - 0.5) * 2.0; sigma = uW + w * uLen * uF; }
      /* walk along the surface: the heading starts at the card's yaw and relaxes to face the lens, so the card body is turned and the wall swells toward us */
      vec2 acc = vec2(0.0); const int STEPS = 22; float ds = sigma / float(STEPS);
      for (int i = 0; i < STEPS; i++) { float t = (float(i) + 0.5) * ds; float th = uYaw * (1.0 - smoothstep(uW * 0.9, uW + uLen * uF * uStraight, t)); acc += vec2(cos(th), sin(th)) * ds; }
      vec2 mid = 0.5 * uW * vec2(cos(uYaw), sin(uYaw));                     /* the middle of the card body sits at uCx */
      float x = uS * (acc.x - mid.x) + uCx, z = acc.y - mid.y + uCz;
      float Sy = pow(smoothstep(0.0, 1.0, w), uYexp);                        /* the S-curve of the wall's top and bottom */
      float y = position.y * (1.0 + (uYf + uHalo) * uF * Sy);
      vK = k; vW = w; vSy = Sy; vSigma = sigma;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(x, y, z, 1.0);
    }`;
  const FRAG = `
    precision highp float; varying vec2 vUv; varying float vK, vW, vSy, vSigma;
    uniform sampler2D uMap; uniform vec3 uTint;
    uniform float uTime, uFlow;
    uniform float uS, uW, uH, uF, uRadius, uVel, uLoaded, uBodyKeep, uFibre, uAb, uAbVel, uRim, uHalo, uHaloOn, uHaloStrength, uYf;
    vec3 srgb(vec3 c){ return pow(c, vec3(2.2)); }                              /* palette below is written in sRGB hex terms */
    /* warm grade: the wall's own brightness is remapped through a palette. Left = Sanchez red / burnt copper, right = dark bronze / amber / muted gold */
    vec3 ramp(float t, float side){
      t = clamp(pow(clamp(t, 0.0, 1.0), 0.75) * 1.3, 0.0, 1.0);
      vec3 a, b, c, d, e;
      if (side < 0.0) { a = vec3(0.106, 0.039, 0.031); b = vec3(0.290, 0.086, 0.063); c = vec3(0.565, 0.169, 0.102); d = vec3(0.686, 0.302, 0.145); e = vec3(0.761, 0.455, 0.275); }
      else { a = vec3(0.094, 0.071, 0.051); b = vec3(0.216, 0.133, 0.071); c = vec3(0.404, 0.259, 0.122); d = vec3(0.651, 0.427, 0.231); e = vec3(0.894, 0.788, 0.671); }
      vec3 col = t < 0.25 ? mix(a, b, t * 4.0) : t < 0.5 ? mix(b, c, (t - 0.25) * 4.0) : t < 0.75 ? mix(c, d, (t - 0.5) * 4.0) : mix(d, e, (t - 0.75) * 4.0);
      return srgb(col);
    }
    float lumaOf(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
    vec3 warmRim(float t){ float a = 0.5 + 0.5 * sin(6.28318 * t); return mix(srgb(vec3(0.565, 0.169, 0.102)), srgb(vec3(0.894, 0.788, 0.671)), a); }   /* red -> copper -> champagne */
    void main(){
      /* the outline: rounded on the inner side, open on the far side (it runs off into the wall) */
      float py = (vUv.y - 0.5) * uH;
      vec2 q = vec2(max(uRadius - vSigma, mix(vSigma - (uW - uRadius), -1e3, uF)), abs(py) - 0.5 * uH + uRadius);   /* the far corners round off too while the card is a plain card */
      float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
      float px = max(fwidth(d), 1e-5);
      if (uHaloOn > 0.5) {
        /* halo: a slightly larger copy behind the surface; it glows only in the ring outside the real edge */
        float m = (1.0 + uYf * uF * vSy) / (1.0 + (uYf + uHalo) * uF * vSy);
        float e = (abs(vUv.y * 2.0 - 1.0) - m) / max(1.0 - m, 1e-3);
        float a = uHaloStrength * uF * smoothstep(0.0, 0.5, vSy) * (1.0 - smoothstep(0.0, 1.0, e)) * step(0.0, e);
        gl_FragColor = vec4((uS < 0.0 ? srgb(vec3(0.478, 0.165, 0.078)) : srgb(vec3(0.651, 0.427, 0.231))) * a, 1.0); return;   /* halo: burnt copper left, amber right */
      }
      float alpha = clamp(0.5 - d / px, 0.0, 1.0); if (alpha <= 0.0) discard;
      /* picture: the card body shows most of the picture; the wall is the picture's far end dragged out into fibres */
      float kb = mix(1.0, uBodyKeep, uF), kt;
      if (vK <= 0.5) kt = vK * 2.0 * kb; else kt = kb + (1.0 - kb) * pow(vW, 0.7);
      float ab = uAb * uF * (0.25 + vW) + uAbVel * abs(uVel) * uF;             /* almost none on the hero; grows with the surface's distortion and speed */
      vec3 col = vec3(0.0), colG = vec3(0.0); float wsum = 0.0;
      float span = uFibre * vW * uF;
      for (int i = -3; i <= 3; i++) {
        float o = float(i) / 3.0, wt = exp(-o * o * 1.5), kk = clamp(kt + o * span, 0.0, 1.0);
        float kr = clamp(kk + ab, 0.0, 1.0), kbb = clamp(kk - ab, 0.0, 1.0);
        vec2 tr = vec2(uS > 0.0 ? kr : 1.0 - kr, vUv.y);
        vec2 tg = vec2(uS > 0.0 ? kk : 1.0 - kk, vUv.y);
        vec2 tb = vec2(uS > 0.0 ? kbb : 1.0 - kbb, vUv.y);
        vec3 sr = texture2D(uMap, tr).rgb, sg = texture2D(uMap, tg).rgb, sb = texture2D(uMap, tb).rgb;
        col += vec3(sr.r, sg.g, sb.b) * wt;
        vec3 g3 = vec3(ramp(lumaOf(sr), uS).r, ramp(lumaOf(sg), uS).g, ramp(lumaOf(sb), uS).b);      /* the same channel offsets, so the fringe turns warm */
        colG += mix(g3, sg, smoothstep(0.7, 0.9, min(sg.r, min(sg.g, sg.b)))) * wt; wsum += wt;      /* white type keeps its colour */
      }
      col = mix(col / wsum, colG / wsum, uF);                                   /* the hero stays natural; neighbours take the warm grade */
      col = mix(vec3(0.07), col, uLoaded);
      col *= 1.0 + uF * vW * 0.6; col += (uS < 0.0 ? srgb(vec3(0.565, 0.169, 0.102)) : srgb(vec3(0.404, 0.259, 0.122))) * 0.10 * smoothstep(0.0, 0.7, vW) * uF;                                              /* the wall carries the card's colour at full strength */
      /* light flowing along the wall's existing streaks: the streak mask (a ridge in the picture) stays fixed; only the brightness travelling through it moves */
      if (vW > 0.12) {
        vec2 tc = vec2(uS > 0.0 ? kt : 1.0 - kt, vUv.y);
        vec3 c0 = texture2D(uMap, tc).rgb;
        float ridge = lumaOf(c0) - 0.5 * (lumaOf(texture2D(uMap, tc + vec2(0.0, 0.006)).rgb) + lumaOf(texture2D(uMap, tc - vec2(0.0, 0.006)).rgb));
        float mask = smoothstep(0.004, 0.04, ridge) * smoothstep(0.12, 0.4, vW) * uF * (1.0 - smoothstep(0.7, 0.9, min(c0.r, min(c0.g, c0.b))));   /* never the type */
        float off = fract(sin(floor(vUv.y * 90.0) * 12.9898) * 43758.5453);                 /* fixed offset per streak row */
        float ph = fract(vW * ${LINE_FLOW_FREQUENCY.toFixed(2)} - uTime * ${LINE_FLOW_SPEED.toFixed(3)} + off);   /* increases outward on both sides */
        float packet = mix(1.0, 0.7 + 1.2 * smoothstep(0.0, 0.15, ph) * (1.0 - smoothstep(0.15, 0.5, ph)), uFlow);
        /* the streak drawn as running stitch: dashes with short gaps and the odd missing stitch, measured along the streak */
        float cyc = vW * ${LINE_STITCH_CYCLES.toFixed(1)} + off * 7.0, cell = floor(cyc);
        float dash = step(fract(cyc), 0.727) * (1.0 - step(fract(sin(cell * 12.9898 + off * 78.233) * 43758.5453), 0.12));
        float stitch = mix(0.3, 1.25, dash);                                                  /* mean ~1: same average brightness */
        col *= 1.0 + mask * (packet * stitch - 1.0);                                       /* mean of the multiplier is ~1: same average brightness as before */
      }
      /* the thin spectral rim, only along the deformed top and bottom edges of the wall, a few screen pixels wide */
      float band = 1.0 - smoothstep(0.0, 2.6 * px, -d);
      float rc = vW * ${LINE_STITCH_CYCLES.toFixed(1)} * 0.6 + step(0.5, vUv.y) * 0.37;                    /* the edge streak is stitched too */
      float rdash = step(fract(rc), 0.727) * (1.0 - step(fract(sin(floor(rc) * 12.9898) * 43758.5453), 0.12));
      band *= mix(0.25, 1.2, rdash);
      col += warmRim(vUv.y * 0.6 + vW * 0.5) * band * uRim * uF * smoothstep(0.02, 0.5, vSy);
      gl_FragColor = vec4(col, alpha);
      #include <colorspace_fragment>
    }`;

  const geo = new THREE.PlaneGeometry(2 * W, H, C.segments.x, C.segments.y);
  const baseUniforms = () => ({
    uMap: { value: null }, uTint: { value: new THREE.Color(1, 1, 1) }, uS: { value: 1 }, uW: { value: W }, uH: { value: H }, uYaw: { value: 0 }, uF: { value: 0 },
    uCx: { value: 0 }, uCz: { value: 0 }, uLen: { value: WL.length }, uYf: { value: WL.heightGain }, uYexp: { value: WL.heightExp }, uStraight: { value: WL.straighten },
    uHalo: { value: 0 }, uHaloOn: { value: 0 }, uHaloStrength: { value: WL.haloStrength }, uRadius: { value: C.card.radius }, uVel: { value: 0 }, uLoaded: { value: 0 },
    uTime: { value: 0 }, uFlow: { value: reduce ? 0 : 1 }, uBodyKeep: { value: WL.bodyKeep }, uFibre: { value: WL.fibre }, uAb: { value: C.optics.aberration }, uAbVel: { value: C.optics.aberrationVelocity }, uRim: { value: C.optics.rim },
  });
  let pos = 0, vel = 0, target = 0, dirty = true, visible = true, lastT = performance.now(), lastInput = 0, drag = null, disposed = false, raf = 0;
  const slides = cards.map((c) => {
    const uniforms = baseUniforms(); uniforms.uTint.value.set(c.colors[1]);
    const main = new THREE.Mesh(geo, new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    const hu = Object.assign(baseUniforms(), { uMap: uniforms.uMap }); hu.uTint.value.set(c.colors[1]); hu.uHalo.value = WL.haloHeight; hu.uHaloOn.value = 1;
    const halo = new THREE.Mesh(geo, new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: hu, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    main.frustumCulled = halo.frustumCulled = false; halo.renderOrder = -100; scene.add(halo, main);
    const tex = { t: null };
    fontsReady.then(() => paintCard(c)).then((t) => { if (disposed) { t.dispose(); return; } tex.t = t; uniforms.uMap.value = t; uniforms.uLoaded.value = 1; hu.uLoaded.value = 1; dirty = true; });   /* painted once, after the fonts are in */
    return { main, halo, u: uniforms, hu, tex };
  });

  /* ---- one virtual position; drag, wheel and keys all move `target`; a critically damped spring makes `pos` follow ---- */
  const OMEGA = reduce ? C.motion.omegaReduced : C.motion.omega;
  const wrap = (v) => { const h = N / 2; return ((((v + h) % N) + N) % N) - h; };
  function spring(dt) { const x0 = pos - target, B = vel + OMEGA * x0, e = Math.exp(-OMEGA * dt); pos = target + (x0 + B * dt) * e; vel = (B - OMEGA * (x0 + B * dt)) * e; vel = Math.max(-C.motion.maxVelocity, Math.min(C.motion.maxVelocity, vel)); if (Math.abs(pos - target) < 1e-4 && Math.abs(vel) < 1e-4) { pos = target; vel = 0; } }
  function announce() { const i = ((Math.round(target) % N) + N) % N; if (live) live.textContent = cards[i].title + ", card " + (i + 1) + " of " + N; }
  function nudge(d) { target += d; lastInput = performance.now(); dirty = true; }
  function settle() { target = Math.round(target); announce(); dirty = true; }
  announce();

  function fit() {
    const w = stage.clientWidth || 1, h = stage.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    const f = THREE.MathUtils.degToRad(cam.fov), visH = H / C.camera.heroHeightFraction;   /* on tall/narrow screens keep the hero within the width too */
    const portrait = cam.aspect < C.portrait.below;
    L.restGap = portrait ? C.portrait.restGap : C.layout.restGap; L.yawRest = portrait ? C.portrait.yawRest : C.layout.yawRest;
    const dH = visH / 2 / Math.tan(f / 2), dW = (W / (portrait ? C.portrait.heroWidth : 0.62)) / 2 / (Math.tan(f / 2) * cam.aspect);
    cam.position.set(0, 0, Math.max(dH, dW)); cam.lookAt(0, 0, 0); dirty = true;
    const len = portrait ? C.portrait.wallLength : WL.length * Math.max(1, cam.aspect / 1.45);   /* wider screens need a longer bell so it still runs off both edges; upright screens a short one */
    const yf = portrait ? C.portrait.heightGain : WL.heightGain;                     /* upright: a gentler flare, so the walls do not slam into the section edges */
    slides.forEach((sl) => { sl.u.uLen.value = sl.hu.uLen.value = len; sl.u.uYf.value = sl.hu.uYf.value = yf; });
  }
  const ro = new ResizeObserver(fit); ro.observe(stage); fit();

  /* ---- input ---- */
  on(window, "keydown", (e) => { if (embed && (!visible || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || "") || e.target.isContentEditable)) return; if (e.key === "ArrowRight") { nudge(1); settle(); e.preventDefault(); } else if (e.key === "ArrowLeft") { nudge(-1); settle(); e.preventDefault(); } });
  on(stage, "wheel", (e) => {
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;             /* normalise mouse wheels and trackpads */
    if (embed && Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;                 /* vertical wheel keeps scrolling the page */
    const d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unit;
    target += Math.max(-120, Math.min(120, d)) / C.motion.wheelPerCard; lastInput = performance.now(); dirty = true; e.preventDefault();
  }, { passive: false });
  let lastX = 0, lastMoveT = 0, dragV = 0;
  on(stage, "pointerdown", (e) => { drag = { id: e.pointerId }; lastX = e.clientX; lastMoveT = performance.now(); dragV = 0; stage.classList.add("is-drag"); try { stage.setPointerCapture(e.pointerId); } catch (_) {} });
  on(stage, "pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return; const now = performance.now(), dx = e.clientX - lastX, dt = Math.max(1, now - lastMoveT);
    const perCard = stage.clientWidth * C.motion.dragPerCard; target -= dx / perCard; dragV = 0.8 * dragV + 0.2 * (-dx / perCard) / (dt / 1000); lastX = e.clientX; lastMoveT = now; lastInput = now; dirty = true;
  });
  const up = () => { if (!drag) return; drag = null; stage.classList.remove("is-drag"); if (!reduce) target += Math.max(-2.5, Math.min(2.5, dragV * C.motion.flick)); settle(); };   /* a flick carries on a little, then snaps */
  on(stage, "pointerup", up); on(stage, "pointercancel", up);
  const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { rootMargin: "100px" }); io.observe(stage);

  /* ---- debug readout: add ?debug to the URL ---- */
  let dbg = null;
  if (new URLSearchParams(location.search).has("debug")) { dbg = document.createElement("pre"); dbg.style.cssText = "position:absolute;left:12px;top:12px;margin:0;font:11px/1.4 ui-monospace,monospace;color:#9f9;pointer-events:none;z-index:5"; root.appendChild(dbg); }

  /* ---- render ---- */
  let flowT = 0;
  function draw(dt) {
    spring(dt); flowT += dt;
    const velFx = reduce ? 0 : vel;
    for (let i = 0; i < N; i++) {
      const s = slides[i], p = wrap(i - pos), a = Math.abs(p), show = a < C.visible; s.main.visible = s.halo.visible = show; if (!show) continue;
      const F = flareOf(a), yaw = yawOf(a), cx = (p < 0 ? -1 : 1) * cxOf(a), cz = -C.layout.recede * F;
      for (const u of [s.u, s.hu]) { u.uS.value = p < 0 ? -1 : 1; u.uYaw.value = yaw; u.uF.value = F; u.uCx.value = cx; u.uCz.value = cz; u.uVel.value = velFx; u.uTime.value = flowT; }
      s.main.renderOrder = -Math.round(a * 10);
    }
    renderer.render(scene, cam); dirty = pos !== target; root.classList.add("is-ready");
    if (dbg) { const i = ((Math.round(pos) % N) + N) % N, p = wrap(i - pos), a = Math.abs(p), F = flareOf(a); dbg.textContent = "pos " + pos.toFixed(3) + "  vel " + vel.toFixed(3) + "  active " + i + "  snap " + Math.round(target) + "  dt " + (dt * 1000).toFixed(1) + "ms  fps " + Math.round(1 / Math.max(dt, 1e-3)) + "\nslide " + i + "  p " + p.toFixed(3) + "  yaw " + (yawOf(a) * 57.3).toFixed(1) + "deg  x " + cxOf(a).toFixed(3) + "  flare " + F.toFixed(3) + "  aberration " + (F * (C.optics.aberration + C.optics.aberrationVelocity * Math.abs(velFx))).toFixed(4); }
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now; if (!visible || document.hidden) return;
    if (!drag && lastInput && now - lastInput > C.motion.snapDelayMs && target !== Math.round(target)) settle();   /* wheel stopped: snap */
    if (reduce && !dirty && pos === target && vel === 0) return;                    /* otherwise redraw every frame: the streak light keeps flowing at rest */
    draw(dt);
  }
  raf = requestAnimationFrame(frame);

  function destroy() {                                                            /* tear everything down: listeners, loop, GPU objects */
    disposed = true; cancelAnimationFrame(raf); ac.abort(); ro.disconnect(); io.disconnect();
    slides.forEach((s) => { if (s.tex.t) s.tex.t.dispose(); s.main.material.dispose(); s.halo.material.dispose(); scene.remove(s.main, s.halo); });
    geo.dispose(); renderer.dispose(); if (el.parentNode) el.parentNode.removeChild(el); if (dbg && dbg.parentNode) dbg.parentNode.removeChild(dbg);
  }
  /* test handle: a hidden tab pauses requestAnimationFrame, so scripts can move and step the simulation by hand */
  window.__flare = { get pos() { return pos; }, destroy, go: (d) => { nudge(d); settle(); }, setPosition: (v) => { pos = target = v; vel = 0; dirty = true; }, set: (v) => { pos = target = v; vel = 0; dirty = true; },
    resize: fit, step: (n = 1, dt = 1 / 60) => { for (let i = 0; i < n; i++) draw(dt); } };
}
