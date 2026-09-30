/* Pixel field: a fixed matrix of microscopic square emitters inside each depth card, under the type. One WebGL quad + one fragment shader per card, no per-pixel JS.
   The lattice never moves; only each emitter's brightness does. Hover (or, on touch, being on screen) powers a radial wave outward from a FIXED origin
   (fast ease-out, granular noise-broken edge, brightest at the core); leaving cuts the power off much faster than it came on. Each cell has a permanent brightness
   (a hash of its cell id, biased dark), so the geometry is perfect and the energy is not. Only a tiny brightness breath lives on while active. No noise is
   scrolled through time, nothing drifts, and the type above is never touched. Reduced motion: switches on and off with no wave. */
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, touch = matchMedia("(hover: none)").matches;

  /* the tuning constants (dev: change window.__pixelField.config, then move the pointer) */
  var CONFIG = {
    spacing: 10,            /* css px between emitter centres */
    pixelMin: 0.09, pixelMax: 0.25,   /* emitter half-size as a fraction of a cell (about 1 to 3px) */
    contrast: 2.6,          /* brightness bias: higher = more dark cells, fewer bright ones */
    feather: 0.16, roughness: 0.42,   /* softness and granularity of the wave's edge */
    activateMs: 620, deactivateMs: 220,
    pulseAmount: 0.05,      /* the active-state breath: 0.87 +/- this */
    origin: [0.5, 0.48]     /* fixed, in card space (never the pointer) */
  };

  var VS = "attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }";
  var FS = [
    "precision highp float; varying vec2 vUv;",
    "uniform vec2 uGrid, uOrigin; uniform float uAspect, uReveal, uPower, uTime, uSeed, uContrast, uPMin, uPMax, uFeather, uRough, uPulse, uPitchPx;",
    "float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21) + uSeed); p += dot(p, p + 45.32); return fract(p.x * p.y); }",
    "float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }",
    "void main(){",
    "  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);                                   /* top-left origin */",
    "  vec2 g = uv * uGrid, cell = floor(g), f = fract(g);                    /* the fixed lattice */",
    "  float hh = h21(cell), inten = pow(hh, uContrast);                       /* permanent, mostly dark */",
    "  vec2 c = (cell + 0.5) / uGrid;                                          /* this emitter's centre */",
    "  vec2 dv = (c - uOrigin) * vec2(uAspect, 1.0);",
    "  float maxR = length(vec2(max(uOrigin.x, 1.0 - uOrigin.x) * uAspect, max(uOrigin.y, 1.0 - uOrigin.y)));",
    "  float d = length(dv) / maxR;                                            /* 0 at the origin .. ~1 at the far corner (a circle in screen space) */",
    "  float radius = uReveal * 1.3;",
    "  float local = radius + (h21(cell + 7.7) - 0.5) * uRough * 0.6 + (vn(cell * 0.16) - 0.5) * uRough * 0.6;   /* per-cell threshold: a granular, broken perimeter (anchored, never time-driven) */",
    "  float reveal = 1.0 - smoothstep(local - uFeather, local, d);",
    "  float core = 1.0 - d * 0.35;",
    "  float pulse = 0.87 + uPulse * sin(uTime * 0.9 + h21(cell + 3.1) * 6.2831);",
    "  vec2 q = abs(f - 0.5);",
    "  float sz = uPMin + (uPMax - uPMin) * inten, aa = 0.75 / uPitchPx;",
    "  float sq = 1.0 - smoothstep(sz, sz + aa, max(q.x, q.y));               /* a square, not a dot */",
    "  float arm = 1.0 - smoothstep(sz * 1.9, sz * 1.9 + aa, max(q.x, q.y));",
    "  float plus = arm * (1.0 - smoothstep(0.045, 0.045 + aa, min(q.x, q.y)));   /* the rare spark reads as a tiny cross */",
    "  float shape = max(sq, plus * step(0.955, hh));",
    "  float a = shape * reveal * (0.1 + 0.9 * inten) * core * pulse * uPower;",
    "  gl_FragColor = vec4(vec3(1.0, 0.957, 0.9) * a, a);",
    "}"
  ].join("\n");

  function makeGL(cv) {
    var gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true }); if (!gl) return null;
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : (console.warn("pixel-field shader:", gl.getShaderInfoLog(s)), null); }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS); if (!vs || !fs) return null;
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr); var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    var u = {}; ["uGrid", "uOrigin", "uAspect", "uReveal", "uPower", "uTime", "uSeed", "uContrast", "uPMin", "uPMax", "uFeather", "uRough", "uPulse", "uPitchPx"].forEach(function (n) { u[n] = gl.getUniformLocation(pr, n); });
    return { gl: gl, u: u };
  }

  var easeOutQuart = function (t) { return 1 - Math.pow(1 - t, 4); };
  var fields = [];
  document.querySelectorAll("[data-depth-card]").forEach(function (card, idx) {
    var cv = document.createElement("canvas"); cv.className = "depth-card__px"; cv.setAttribute("aria-hidden", "true");
    var g = makeGL(cv); if (!g) return;
    var shade = card.querySelector(".depth-card__shade"); card.insertBefore(cv, shade ? shade.nextSibling : card.firstChild);
    var f = { card: card, cv: cv, g: g, w: 0, h: 0, cols: 1, rows: 1, target: 0, reveal: 0, power: 0, tAct: 0, seed: idx * 1.618 + 0.37, dirty: true, onScreen: true, held: false };
    f.size = function () {
      var w = card.offsetWidth, h = card.offsetHeight; if (!w || !h) return; var dpr = Math.min(window.devicePixelRatio || 1, 2);
      f.w = w; f.h = h; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      f.cols = Math.max(1, Math.floor(w / CONFIG.spacing)); f.rows = Math.max(1, Math.floor(h / CONFIG.spacing));   /* density is set by spacing, not by a fixed count */
      g.gl.viewport(0, 0, cv.width, cv.height); f.dirty = true;
    };
    f.activate = function () {
      var now = performance.now(); f.target = 1;
      if (f.power < 0.02 || reduce) { f.reveal = reduce ? 1 : 0; f.tAct = now; }
      else f.tAct = now - (1 - Math.pow(1 - Math.min(1, f.reveal), 0.25)) * CONFIG.activateMs;   /* resume the wave from where it is */
    };
    f.deactivate = function () { f.target = 0; f.tOff = performance.now(); f.pOff = f.power; };
    f.size(); fields.push(f);
    if (!touch) {
      card.addEventListener("pointerenter", function () { f.activate(); });
      card.addEventListener("pointerleave", function () { f.deactivate(); });
    }
    card.addEventListener("focus", function () { f.activate(); }); card.addEventListener("blur", function () { f.deactivate(); });
    new IntersectionObserver(function (e) {
      f.onScreen = e[0].isIntersecting;
      if (touch) { if (e[0].intersectionRatio >= 0.6) f.activate(); else f.deactivate(); }   /* touch: being on screen is the trigger */
    }, { threshold: [0, 0.6], rootMargin: "60px" }).observe(card);
  });
  if (!fields.length) return;
  if (window.ResizeObserver) { var ro = new ResizeObserver(function () { fields.forEach(function (f) { f.size(); }); }); fields.forEach(function (f) { ro.observe(f.card); }); }

  function render(f, t) {
    var gl = f.g.gl, u = f.g.u, C = CONFIG;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    if (f.power <= 0.001) return;
    gl.uniform2f(u.uGrid, f.cols, f.rows); gl.uniform2f(u.uOrigin, C.origin[0], C.origin[1]); gl.uniform1f(u.uAspect, f.w / f.h);
    gl.uniform1f(u.uReveal, f.reveal); gl.uniform1f(u.uPower, f.power); gl.uniform1f(u.uTime, t); gl.uniform1f(u.uSeed, f.seed);
    gl.uniform1f(u.uContrast, C.contrast); gl.uniform1f(u.uPMin, C.pixelMin); gl.uniform1f(u.uPMax, C.pixelMax); gl.uniform1f(u.uFeather, C.feather);
    gl.uniform1f(u.uRough, C.roughness); gl.uniform1f(u.uPulse, reduce ? 0 : C.pulseAmount); gl.uniform1f(u.uPitchPx, f.w / f.cols);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  /* state per frame: ACTIVATE = the wave propagates (ease-out radius), DEACTIVATE = the power just collapses fast; the wave is not reversed */
  function step(f, now) {
    if (f.held) return;
    if (f.target > 0) { var t = reduce ? 1 : Math.min(1, (now - f.tAct) / CONFIG.activateMs); f.reveal = reduce ? 1 : easeOutQuart(t); f.power = Math.min(1, f.power + 0.12 + (reduce ? 1 : 0)); }
    else if (f.power > 0) { f.power = Math.max(0, f.pOff * (1 - (now - f.tOff) / CONFIG.deactivateMs)); if (f.power === 0) f.reveal = 0; }
  }
  var t0 = performance.now();
  function loop(now) {
    requestAnimationFrame(loop); if (document.hidden) return;
    fields.forEach(function (f) {
      if (!f.onScreen && f.power === 0 && !f.dirty) return;
      var before = f.power + f.reveal; step(f, now);
      if (f.power > 0 || before > 0 || f.dirty) { render(f, (now - t0) / 1000); f.dirty = false; }
    });
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
