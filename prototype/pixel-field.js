/* Fingerprint stitch: the Sanchez identity, drawn on each depth card in running stitch, ONLY while someone is touching or hovering the card. Dormant cards are clean.
   A dense fingerprint whorl of hairline gold thread (ridges sewn as short dashes, gaps, the odd missing stitch) is sewn in outward from the point of contact.
   It is gently alive (the ridges slowly breathe and the stitches slowly travel along them) and the pointer or finger is a real focal point: the print re-centres on it,
   ridges pinch and swirl around it, moving it sends ripples out through the thread, and the stitches near it glow. Leaving cuts the thread off fast.
   One WebGL quad + one fragment shader per card; each stitch keeps a permanent brightness and moment of arrival. Reduced motion: no wave, no drift. */
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, touch = matchMedia("(hover: none)").matches;

  /* the tuning constants (dev: change window.__pixelField.config, then move the pointer) */
  var CONFIG = {
    spacing: 5.4,          /* css px between ridges */
    dash: 4.6, gap: 2.4,       /* css px: running stitch */
    thickness: 0.9,        /* css px: hairline thread */
    missing: 0.11,         /* share of stitches left out */
    feather: 0.14, roughness: 0.34,
    activateMs: 800, deactivateMs: 300, deactivateTouchMs: 520,
    shimmer: 0.07,
    breathe: 0.022, drift: 0.09,    /* gentle life: how fast the ridges breathe and the stitches travel */
    lens: 1.7, swirl: 0.07, sigma: 96,   /* the pointer's pull on the print */
    warp: 1.5,            /* how far the fixed noise bends the ridges out of perfect circles */
    origin: [0.5, 0.47]    /* where the whorl sits when nothing has touched the card */
  };

  var VS = "attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }";
  var FS = [
    "precision highp float; varying vec2 vUv;",
    "uniform vec2 uSize, uOrigin, uFocus; uniform float uEnergy, uBreathe, uDrift, uLens, uSwirl, uSigma; uniform float uReveal, uPower, uTime, uSeed, uSpacing, uDash, uGap, uThick, uMissing, uFeather, uRough, uShimmer, uWarp;",
    "float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21) + uSeed); p += dot(p, p + 45.32); return fract(p.x * p.y); }",
    "float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }",
    "void main(){",
    "  vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uSize;                              /* css pixels, top-left origin */",
    "  vec2 o = uOrigin * uSize; vec2 pp = px - o; pp.y *= 1.12;                 /* a whorl a little taller than wide, like a real print */",
    "  float r = length(pp);",
    "  vec2 dF = px - uFocus; float df = length(dF), fall = exp(-(df * df) / (uSigma * uSigma));",
    "  float warp = (vn(px * 0.011 + vec2(uTime * uBreathe, -uTime * uBreathe * 0.7)) - 0.5) * 2.0 * uWarp + (vn(px * 0.027 + 5.0 - vec2(uTime * uBreathe * 1.6, 0.0)) - 0.5) * 0.7 * uWarp;   /* low-frequency bend that very slowly breathes */",
    "  float ripple = uEnergy * 0.3 * sin(df * 0.11 - uTime * 5.0) * exp(-df / 150.0);                /* moving the pointer sends ripples out through the thread */",
    "  float phase = r / uSpacing + warp + uLens * fall + ripple;                                      /* the pointer pinches the ridges toward itself */",
    "  float ridge = floor(phase), f = fract(phase);",
    "  float dPx = abs(f - 0.5) * uSpacing;                                      /* distance to the ridge centre, in css px */",
    "  float line = 1.0 - smoothstep(uThick * 0.5 - 0.5, uThick * 0.5 + 0.5, dPx);   /* hairline, 1px anti-aliasing */",
    "  float ringR = max((ridge + 0.5 - warp) * uSpacing, uSpacing);",
    "  float nDash = max(5.0, floor(6.2831853 * ringR / (uDash + uGap)));         /* whole number of stitches per ridge: no seam */",
    "  float th = atan(pp.y, pp.x) / 6.2831853 + 0.5 + uSwirl * fall;                 /* the print swirls a little around the pointer */",
    "  float dirn = mod(ridge, 2.0) * 2.0 - 1.0;",
    "  float u = th * nDash + uTime * uDrift * 6.0 * dirn, cellS = floor(u), fu = fract(u);   /* stitches slowly travel along their ridge, alternate ridges the other way */",
    "  float dashFrac = uDash / (uDash + uGap), aa = 1.0 / (uDash + uGap);",
    "  float dash = smoothstep(0.0, aa, fu) * (1.0 - smoothstep(dashFrac - aa, dashFrac, fu));",
    "  vec2 id = vec2(cellS, ridge);",
    "  float hh = h21(id + 3.7);",
    "  float keep = step(uMissing, h21(id + 11.3));                              /* the odd missing stitch */",
    "  float maxR = length(vec2(max(uOrigin.x, 1.0 - uOrigin.x) * uSize.x, max(uOrigin.y, 1.0 - uOrigin.y) * uSize.y * 1.12));",
    "  float d = ringR / maxR;",
    "  float radius = uReveal * 1.3;",
    "  float local = radius + (h21(id + 7.7) - 0.5) * uRough;                     /* every stitch has its own moment: a broken, granular edge */",
    "  float reveal = 1.0 - smoothstep(local - uFeather, local, d);",
    "  float core = 1.0 - d * 0.45;",
    "  float shimmer = 1.0 - uShimmer + uShimmer * sin(uTime * 0.8 + hh * 6.2831853);",
    "  float eDist = min(min(px.x, uSize.x - px.x), min(px.y, uSize.y - px.y));           /* keep the sewn border clean: the print fades out toward the card edge */",
    "  float edgeFade = 0.1 + 0.9 * smoothstep(8.0, 52.0, eDist);",
    "  float glow = 1.0 + 0.9 * exp(-(df * df) / (uSigma * uSigma * 1.3));                            /* stitches near the pointer glow */",
    "  float a = line * dash * keep * reveal * (0.22 + 0.6 * hh) * core * edgeFade * shimmer * glow * uPower;",
    "  vec3 gold = vec3(0.79, 0.64, 0.36), cream = vec3(0.96, 0.91, 0.80);",
    "  vec3 col = mix(gold, cream, hh * hh);",
    "  gl_FragColor = vec4(col * a, a);",
    "}"
  ].join("\n");

  function makeGL(cv) {
    var gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true }); if (!gl) return null;
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : (console.warn("fingerprint-stitch shader:", gl.getShaderInfoLog(s)), null); }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS); if (!vs || !fs) return null;
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr); var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    var u = {}; ["uSize", "uOrigin", "uFocus", "uEnergy", "uBreathe", "uDrift", "uLens", "uSwirl", "uSigma", "uReveal", "uPower", "uTime", "uSeed", "uSpacing", "uDash", "uGap", "uThick", "uMissing", "uFeather", "uRough", "uShimmer", "uWarp"].forEach(function (n) { u[n] = gl.getUniformLocation(pr, n); });
    return { gl: gl, u: u };
  }

  var easeOutQuart = function (t) { return 1 - Math.pow(1 - t, 4); };
  var fields = [];
  document.querySelectorAll("[data-depth-card]").forEach(function (card, idx) {
    var cv = document.createElement("canvas"); cv.className = "depth-card__px"; cv.setAttribute("aria-hidden", "true");
    var g = makeGL(cv); if (!g) return;
    var shade = card.querySelector(".depth-card__shade"); card.insertBefore(cv, shade ? shade.nextSibling : card.firstChild);   /* under the type */
    var f = { card: card, cv: cv, g: g, w: 0, h: 0, target: 0, reveal: 0, power: 0, tAct: 0, seed: idx * 1.618 + 0.37, dirty: true, onScreen: true, held: false,
              fx: 0, fy: 0, sx: 0, sy: 0, energy: 0, lx: 0, ly: 0, lt: 0, isTouch: false };
    f.size = function () {
      var w = card.offsetWidth, h = card.offsetHeight; if (!w || !h) return; var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      f.w = w; f.h = h; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); g.gl.viewport(0, 0, cv.width, cv.height);
      if (!f.fx) { f.fx = f.sx = w * CONFIG.origin[0]; f.fy = f.sy = h * CONFIG.origin[1]; } f.dirty = true;
    };
    f.focus = function (e, jump) {                                     /* the pointer / finger is the focal point (css px inside the card) */
      var r = card.getBoundingClientRect(), x = Math.max(0, Math.min(r.width, e.clientX - r.left)), y = Math.max(0, Math.min(r.height, e.clientY - r.top)), now = performance.now();
      if (jump) { f.sx = x; f.sy = y; f.lx = x; f.ly = y; f.lt = now; f.energy = 0; }
      else { var dt = Math.max(8, now - f.lt), sp = Math.hypot(x - f.lx, y - f.ly) / dt; f.energy = Math.min(1, f.energy + sp * 0.35); f.lx = x; f.ly = y; f.lt = now; }   /* speed of movement feeds the ripples */
      f.fx = x; f.fy = y;
    };
    f.activate = function () {
      var now = performance.now(); f.target = 1;
      if (f.power < 0.02 || reduce) { f.reveal = reduce ? 1 : 0; f.tAct = now; }
      else f.tAct = now - (1 - Math.pow(1 - Math.min(1, f.reveal), 0.25)) * CONFIG.activateMs;   /* resume the wave from where it is */
    };
    f.deactivate = function () { f.target = 0; f.tOff = performance.now(); f.pOff = f.power; };
    f.size(); fields.push(f);
    /* the pattern exists only while there is interaction: hover with a mouse, or a finger down on the card. Otherwise the card is clean. */
    var enter = function (e) { f.isTouch = e.pointerType === "touch"; f.focus(e, true); f.activate(); };
    card.addEventListener("pointerenter", enter); card.addEventListener("pointerdown", enter);
    card.addEventListener("pointermove", function (e) { if (f.target > 0) f.focus(e, false); });
    ["pointerleave", "pointerup", "pointercancel"].forEach(function (n) { card.addEventListener(n, function () { f.deactivate(); }); });
    card.addEventListener("focus", function () { f.isTouch = false; f.fx = f.sx = f.w * CONFIG.origin[0]; f.fy = f.sy = f.h * CONFIG.origin[1]; f.activate(); }); card.addEventListener("blur", function () { f.deactivate(); });
  });
  if (!fields.length) return;
  if (window.ResizeObserver) { var ro = new ResizeObserver(function () { fields.forEach(function (f) { f.size(); }); }); fields.forEach(function (f) { ro.observe(f.card); }); }

  function render(f, t) {
    var gl = f.g.gl, u = f.g.u, C = CONFIG;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    if (f.power <= 0.001) return;
    gl.uniform2f(u.uSize, f.w, f.h); gl.uniform2f(u.uOrigin, f.sx / f.w, f.sy / f.h); gl.uniform2f(u.uFocus, f.sx, f.sy); gl.uniform1f(u.uEnergy, f.energy);
    gl.uniform1f(u.uBreathe, reduce ? 0 : C.breathe); gl.uniform1f(u.uDrift, reduce ? 0 : C.drift); gl.uniform1f(u.uLens, C.lens); gl.uniform1f(u.uSwirl, C.swirl); gl.uniform1f(u.uSigma, C.sigma);
    gl.uniform1f(u.uReveal, f.reveal); gl.uniform1f(u.uPower, f.power); gl.uniform1f(u.uTime, t); gl.uniform1f(u.uSeed, f.seed);
    gl.uniform1f(u.uSpacing, C.spacing); gl.uniform1f(u.uDash, C.dash); gl.uniform1f(u.uGap, C.gap); gl.uniform1f(u.uThick, C.thickness);
    gl.uniform1f(u.uMissing, C.missing); gl.uniform1f(u.uFeather, C.feather); gl.uniform1f(u.uRough, C.roughness); gl.uniform1f(u.uShimmer, reduce ? 0 : C.shimmer); gl.uniform1f(u.uWarp, C.warp);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  /* ACTIVATE = the wave sews the stitches in (ease-out radius); DEACTIVATE = the thread just goes out fast; the wave is not reversed */
  var lastNow = performance.now();
  function step(f, now) {
    if (f.held) return;
    var dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000)); f.sx += (f.fx - f.sx) * (1 - Math.exp(-dt * 9)); f.sy += (f.fy - f.sy) * (1 - Math.exp(-dt * 9)); f.energy *= Math.exp(-dt * 2.6);   /* the print follows the pointer with a soft lag; ripples die away */
    if (f.target > 0) { var t = reduce ? 1 : Math.min(1, (now - f.tAct) / CONFIG.activateMs); f.reveal = reduce ? 1 : easeOutQuart(t); f.power = Math.min(1, f.power + 0.12 + (reduce ? 1 : 0)); }
    else if (f.power > 0) { f.power = Math.max(0, f.pOff * (1 - (now - f.tOff) / (f.isTouch ? CONFIG.deactivateTouchMs : CONFIG.deactivateMs))); if (f.power === 0) f.reveal = 0; }
  }
  var t0 = performance.now();
  function loop(now) {
    requestAnimationFrame(loop); if (document.hidden) return;
    fields.forEach(function (f) {
      if (!f.onScreen && f.power === 0 && !f.dirty) return;
      var before = f.power + f.reveal; step(f, now);
      if (f.power > 0 || before > 0 || f.dirty) { render(f, (now - t0) / 1000); f.dirty = false; }
    });
    lastNow = now;
  }
  requestAnimationFrame(loop);

  /* dev + test helpers */
  var pick = function (i) { return i == null ? fields : [fields[i]]; };
  window.__pixelField = {
    config: CONFIG, fields: fields,
    activate: function (i) { pick(i).forEach(function (f) { f.held = false; f.activate(); }); },
    deactivate: function (i) { pick(i).forEach(function (f) { f.held = false; f.deactivate(); }); },
    setReveal: function (v, i) { pick(i).forEach(function (f) { f.held = true; f.reveal = v; f.power = 1; f.dirty = true; render(f, 0); }); }   /* freezes at a chosen radius, for screenshot matching */
  };
})();
