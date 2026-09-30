/* The Sanchez fingerprint: stitched ridges round the SANCHEZ wordmark that carry on down the page.
   One field of dots for the whole top of the site, drawn on a fixed canvas BEHIND the sections and scrolling with the page, so the hero,
   the curved strip, the gallery, the marquee and the bag all sit in the same pattern (their backgrounds are transparent).
   A small precomputed map (R = distance from the word, G = the outline, B = the letters) sets the hero; above and below it the ridges simply keep going.
   Ridges are running stitch (dashes with gaps and the odd missing stitch), dim and warm toward gold with distance; a slow pulse travels outward.
   Every dot is a particle: the cursor pushes dots away, a click sends a shockwave (same physics as the dithered-logo component).
   SZ_FINGERPRINT.setSeed("name") reshapes the ridges for a name. Reduced motion: a still frame. */
(function () {
  var root = document.querySelector("[data-hero-rings]"); if (!root) return;
  var sn = null;                                                                        /* simplex noise (vendored, MIT): the smooth, slowly evolving flow */
  try { import("./assets/vendor/simplex-noise/simplex-noise.js").then(function (m) { sn = new m.SimplexNoise("sanchez"); }).catch(function () {}); } catch (e) {}
  var cv = root.querySelector("canvas"), ctx = cv.getContext("2d");
  document.body.insertBefore(cv, document.body.firstChild); cv.className = "wm-field";      /* out of the hero, behind everything */
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, coarse = matchMedia("(pointer: coarse)").matches;
  var MW = 0, MH = 0, bd, bp, bl;                                 /* the map */
  var R = 0, r0 = 0, ddw, thv, pseed;                              /* the page-long grid: rows, map's first row, ridge distance, angle, per-dot random */
  var nRows = 0, topRow = 0, sub = 0, bucketOf, order, counts, offX, offY;   /* what is on screen right now */
  var fpA = 1.7, fpB = 4.1, fpC = 0.6, STITCH = 8, GAP = 3, PERIOD = 6.5, WIDTH = 1.9, PULSE_EVERY = 9, FLOOR = 0.26;
  var CREAM = [214, 181, 136], GOLD = [214, 181, 136];   /* Tan #D6B588: the whole pattern, the SANCHEZ outline and the ridges, in one colour (brightness still fades with distance) */
  var CURSOR_RADIUS = 100, CURSOR_FORCE = 40, RIPPLE_SPEED = 225, RIPPLE_WIDTH = 37, RIPPLE_FORCE = 20, RIPPLE_DURATION = 675, LERP = 0.12;
  var LEVELS = 20, WARMS = 6, NEON = 30, NB0 = (LEVELS + 1) * WARMS, NB = NB0 + NEON + 1, styles = [];   /* the last NEON shades are the SANCHEZ outline, one per slice of the word, left to right */
  /* the spectrum, each colour taken to both of its ends (light and deep): pink -> deep red -> orange -> yellow -> blue */
  var SPECTRUM = [[255, 120, 190], [255, 32, 140], [255, 16, 96], [214, 10, 40], [255, 34, 24], [255, 96, 12], [255, 150, 0], [255, 210, 0], [255, 244, 70], [90, 220, 255], [24, 150, 255], [30, 80, 255]];
  function spec(u) { u = Math.min(1, Math.max(0, u)) * (SPECTRUM.length - 1); var i = Math.min(SPECTRUM.length - 2, Math.floor(u)), f = u - i, a = SPECTRUM[i], b = SPECTRUM[i + 1]; return [Math.round(a[0] + (b[0] - a[0]) * f), Math.round(a[1] + (b[1] - a[1]) * f), Math.round(a[2] + (b[2] - a[2]) * f)]; }
  for (var lv = 0; lv <= LEVELS; lv++) for (var w = 0; w < WARMS; w++) {
    var k = lv / LEVELS, t = w / (WARMS - 1);
    styles.push("rgb(" + Math.round((CREAM[0] + (GOLD[0] - CREAM[0]) * t) * k) + "," + Math.round((CREAM[1] + (GOLD[1] - CREAM[1]) * t) * k) + "," + Math.round((CREAM[2] + (GOLD[2] - CREAM[2]) * t) * k) + ")");
  }
  for (var nz = 0; nz < NEON; nz++) { var nc = spec(nz / (NEON - 1)); styles.push("rgb(" + nc[0] + "," + nc[1] + "," + nc[2] + ")"); }
  styles.push("rgb(" + CREAM[0] + "," + CREAM[1] + "," + CREAM[2] + ")");   /* the tan of the outline, kept separate from the paint */
  var cursor = { x: 0, y: 0, active: false }, ripples = [], cell = 1, ox = 0, dpr = 1, moving = false, fieldEnd = 1e9, cw = 0, ch = 0;

  function load() {
    var port = innerWidth < innerHeight, im = new Image();
    im.onload = function () {
      MW = im.width; MH = im.height; var n = MW * MH;
      var t = document.createElement("canvas"); t.width = MW; t.height = MH; var tc = t.getContext("2d"); tc.drawImage(im, 0, 0);
      var px = tc.getImageData(0, 0, MW, MH).data;
      bd = new Float32Array(n); bp = new Uint8Array(n); bl = new Uint8Array(n);
      for (var i = 0; i < n; i++) { bd[i] = px[i * 4]; bp[i] = px[i * 4 + 1] > 127; bl[i] = px[i * 4 + 2] > 127; }
      sx0 = MW; sx1 = 0; for (var yb = 0; yb < MH; yb++) for (var xb = 0; xb < MW; xb++) if (bp[yb * MW + xb]) { if (xb < sx0) sx0 = xb; if (xb > sx1) sx1 = xb; }
      sprayStart = performance.now();
      size(true); cv.classList.add("is-ready");
      if (reduce) draw(0); else requestAnimationFrame(loop);
    };
    im.src = "assets/globe/rings-map-" + (port ? "port" : "land") + ".png?v=1";
  }

  /* where the field ends: the bottom of the last transparent section (below that the sections are solid, so nothing needs drawing) */
  function measureEnd() {
    var end = 0; [].forEach.call(document.querySelectorAll("[data-hero-rings], .curved-loop, .lgc-track, .sz-marquee, .bag-punch"), function (e) { end = Math.max(end, e.getBoundingClientRect().bottom + scrollY); });
    return end || innerHeight;
  }

  var gridKey = "";
  function size(force) {
    var vw = document.documentElement.clientWidth, vh = innerHeight, heroH = root.getBoundingClientRect().height || vh;
    dpr = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2);
    if (force || cw !== Math.round(vw * dpr) || ch !== Math.round(vh * dpr)) { cw = Math.round(vw * dpr); ch = Math.round(vh * dpr); cv.width = cw; cv.height = ch; }
    cell = Math.max(cw / MW, heroH * dpr / MH); ox = (cw - MW * cell) / 2;
    var mapTop = (heroH * dpr - MH * cell) / 2; r0 = Math.round(mapTop / cell);
    fieldEnd = measureEnd();
    var rows = Math.ceil(((fieldEnd + vh) * dpr) / cell) + 4, key = [cw, ch, Math.round(cell * 100), rows, r0].join();
    if (key !== gridKey || force) { gridKey = key; build(rows); }
    var win = Math.ceil(ch / cell) + 3; if (win !== nRows || !bucketOf) { nRows = win; var m = MW * nRows; bucketOf = new Int16Array(m); order = new Int32Array(m); offX = new Float32Array(m); offY = new Float32Array(m); }
    if (reduce) draw(0);
  }

  /* the grid: ridge distance for every row of the page. Inside the map it is the map; above and below, distance keeps growing straight out from the map's edge row. */
  function build(rows) {
    R = rows; var n = MW * R; ddw = new Float32Array(n); thv = new Float32Array(n); pseed = new Float32Array(n); counts = counts || new Int32Array(NB + 1);
    for (var i = 0; i < n; i++) { var h = Math.sin(i * 12.9898) * 43758.5453; pseed[i] = h - Math.floor(h); }
    fingerprint();
  }
  /* The ridges are a fingerprint: rings round a core (the word), wobbled so they are never perfect ellipses, like a loop or whorl. */
  function fingerprint() {
    var cx = MW / 2, cy = r0 + MH / 2;
    for (var y = 0, i = 0; y < R; y++) {
      var m = y - r0;
      for (var x = 0; x < MW; x++, i++) {
        var d = m < 0 ? bd[x] + (-m) : m >= MH ? bd[(MH - 1) * MW + x] + (m - MH + 1) : bd[m * MW + x];
        if (m < 0 || m >= MH) {                                                  /* beyond the word: the ridges fan out as arches, as if the space were limitless */
          var dyo = m < 0 ? -m : m - MH + 1, wA = Math.min(1, dyo / (MH * 1.2)); wA = wA * wA * (3 - 2 * wA);
          var dfar = Math.hypot((x - cx) * 0.82, dyo + MH * 0.5);
          d = d * (1 - wA) + dfar * wA;
        }
        var th = Math.atan2(y - cy, x - cx);
        ddw[i] = d + 1.15 * Math.sin(th * 3 + fpA) + 0.75 * Math.sin(th * 5 + d * 0.045 + fpB) + 0.55 * Math.sin(d * 0.09 + th * 2 + fpC); thv[i] = th;
      }
    }
  }
  function hashSeed(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  window.SZ_FINGERPRINT = { setSeed: function (str) { var h = hashSeed(String(str || "sanchez")); fpA = (h & 1023) / 1023 * 6.28; fpB = ((h >> 10) & 1023) / 1023 * 6.28; fpC = ((h >> 20) & 511) / 511 * 6.28; if (ddw) fingerprint(); } };

  addEventListener("resize", function () { if (MW) size(false); });
  var rz = 0; if (window.ResizeObserver) new ResizeObserver(function () { clearTimeout(rz); rz = setTimeout(function () { if (MW) size(false); }, 250); }).observe(document.body);
  var idle = (function () { return function (e) { return !!(e.target && e.target.closest && e.target.closest("a,button,input,select,textarea,label,[data-lgc],[data-bag-view],dialog")); }; })();
  addEventListener("pointermove", function (e) { if (scrollY > fieldEnd) return; cursor.x = e.clientX * dpr; cursor.y = e.clientY * dpr; cursor.active = true; }, { passive: true });
  document.addEventListener("pointerleave", function () { cursor.active = false; });
  addEventListener("pointerup", function (e) {
    if (scrollY > fieldEnd || idle(e)) return; ripples.push({ x: e.clientX * dpr, y: e.clientY * dpr, start: performance.now() });
    if (e.pointerType !== "mouse") cursor.active = false;
  }, { passive: true });

  /* push the dots on screen away from the cursor and ripples; ease back when the force goes */
  function step(now) {
    moving = false;
    for (var k = ripples.length - 1; k >= 0; k--) if (now - ripples[k].start >= RIPPLE_DURATION) ripples.splice(k, 1);
    var nr = ripples.length, mul = nr ? 1 + 0.5 * (nr - 1) : 0;
    var CR = CURSOR_RADIUS * dpr, CR2 = CR * CR, CF = CURSOR_FORCE * dpr, RW = RIPPLE_WIDTH * dpr, RF = RIPPLE_FORCE * dpr;
    for (var y = 0, i = 0; y < nRows; y++) {
      var by = y * cell - sub + cell * 0.5;
      for (var x = 0; x < MW; x++, i++) {
        if (bucketOf[i] < 0 && offX[i] === 0 && offY[i] === 0) continue;
        var bx = ox + (x + 0.5) * cell, fx = 0, fy = 0;
        if (cursor.active) {
          var vx = bx + offX[i] - cursor.x, vy = by + offY[i] - cursor.y, d2 = vx * vx + vy * vy;
          if (d2 > 0.1 && d2 < CR2) { var d = Math.sqrt(d2), f = Math.pow(1 - d / CR, 3) * CF; fx += vx / d * f; fy += vy / d * f; }
        }
        for (var r = 0; r < nr; r++) {
          var rp = ripples[r], el = now - rp.start, rad = el / 1000 * RIPPLE_SPEED * dpr, life = 1 - el / RIPPLE_DURATION;
          var sx = bx - rp.x, sy = by - rp.y, dd = Math.sqrt(sx * sx + sy * sy);
          if (dd < 0.1) continue; var band = Math.abs(dd - rad);
          if (band < RW) { var wf = (1 - band / RW) * life * RF * mul; fx += sx / dd * wf; fy += sy / dd * wf; }
        }
        offX[i] += (fx - offX[i]) * LERP; offY[i] += (fy - offY[i]) * LERP;
        if (Math.abs(offX[i]) < 0.01) offX[i] = 0; if (Math.abs(offY[i]) < 0.01) offY[i] = 0;
        if (offX[i] !== 0 || offY[i] !== 0) moving = true;
      }
    }
  }

  /* colour every dot on screen into one of NB shades (brightness x warmth), then draw each shade in one pass */
  var lgcTrack = null, warpG = null, waveTabs = null, FLUFF = 2.2, sx0 = 0, sx1 = 0, sprayStart = 0, SPRAY_MS = 5200;
  function draw(t) {
    var sy = (typeof window.__sy === "number" ? window.__sy : scrollY) * dpr, sy0 = sy; topRow = Math.max(0, Math.floor(sy / cell)); sub = sy - topRow * cell;
    var tsec0 = t / 1000; var maxD = Math.hypot(MW, MH) * 0.5, wave = ((t / 1000) % PULSE_EVERY) / PULSE_EVERY * maxD * 1.15, drift = reduce ? 0 : t / 1000 * 0.9;
    counts.fill(0);
    /* SPRAY PAINT: on load the word is sprayed on left to right. The word's front leads; the ridges paint in behind it. Each dot has its own ragged edge so the front is a spray, not a wipe. */
    var sp = reduce ? 1 : Math.min(1, Math.max(0, (t - (sprayStart || t) - 700) / SPRAY_MS)); if (typeof window.__spray === "number") sp = window.__spray;
    var eOut = function (v) { v = Math.min(1, Math.max(0, v)); return v * v * (3 - 2 * v) * 0.35 + v * 0.65; };
    var SLOPE = 0.35, PSMAX = (sx1 - sx0) + SLOPE * MH, FF = sp >= 1 ? PSMAX + 40 : -8 + (PSMAX + 24) * eOut(sp);   /* the front: a slightly sloping line moving left to right, starting at the top-left of the S and ending at the bottom-right of the Z */
    /* WAVE SETS, one per quarter: every quarter of the field rolls out its own sets of seven waves (own timing, speed, spacing and power), so the four sides move independently.
       Each crest has its own strength (middle ones strongest, every set differs). A 1-D table per quarter over distance keeps it cheap; the quarters blend smoothly across the axes. */
    var WAVES = 7, BINS = 480, WWIDTH = 8.5, tW0 = (t - (sprayStart || t)) / 1000 - SPRAY_MS / 1000 * 0.7 - 0.7;
    var Q = [{ per: 16, off: 0, sp: 20, gap: 17, k: 1.0 }, { per: 19, off: 5.3, sp: 17, gap: 15, k: 0.9 }, { per: 14.5, off: 9.1, sp: 23, gap: 19, k: 1.1 }, { per: 21, off: 2.4, sp: 19, gap: 16, k: 0.95 }];
    if (!waveTabs) { waveTabs = []; for (var qi = 0; qi < 4; qi++) waveTabs.push(new Float32Array(BINS + 1)); }
    for (var qq = 0; qq < 4; qq++) {
      var tab = waveTabs[qq], Qp = Q[qq], tW = tW0 + Qp.off; tab.fill(0);
      if (!reduce && tW > 0) {
        var setI = Math.floor(tW / Qp.per), loc = tW - setI * Qp.per;
        for (var wk = 0; wk < WAVES; wk++) {
          var wh = Math.abs(Math.sin((setI + 3 + qq * 7) * 12.9898 + wk * 78.233) * 43758.5453 % 1), env7 = [0.42, 0.68, 0.92, 1.0, 0.8, 0.58, 0.36][wk], amp = env7 * (0.72 + 0.5 * wh) * Qp.k;   /* each wave its own power */
          var rk = loc * Qp.sp - wk * Qp.gap; if (rk < -WWIDTH * 3 || rk > BINS / 2 + WWIDTH * 3) continue;
          var b0 = Math.max(0, Math.floor((rk - WWIDTH * 3) * 2)), b1 = Math.min(BINS, Math.ceil((rk + WWIDTH * 3) * 2));
          for (var wb = b0; wb <= b1; wb++) { var dd = wb / 2 - rk; tab[wb] += amp * Math.exp(-(dd * dd) / (WWIDTH * WWIDTH)); }
        }
      }
    }
    var wcx = (sx0 + sx1) / 2, wcy = MH / 2;
    var GS = 8, gcols = Math.ceil(MW / GS) + 2, grows = Math.ceil(nRows / GS) + 2, tsn = t / 1000;
    if (!warpG || warpG.length !== gcols * grows) warpG = new Float32Array(gcols * grows);
    for (var gy = 0; gy < grows; gy++) for (var gx = 0; gx < gcols; gx++) {           /* smooth flow, sampled coarsely and interpolated: cheap, and never steps */
      var prg = topRow + gy * GS;
      warpG[gy * gcols + gx] = (sn && !reduce) ? sn.noise3D(gx * GS * 0.011, prg * 0.011, tsn * 0.045) + 0.5 * sn.noise3D(gx * GS * 0.026 + 7, prg * 0.026, tsn * 0.08) : 0;
    }
    /* EGG SPIN: while the workshop carousel is scrolled through, the lines are painted on an egg at the centre of the screen and the egg spins: the lines travel across it left to right
       and top to bottom (its axis is tilted), foreshortening round the curve like a globe, then unwind after the section. It is the same field the hero fingerprint sends down the
       page, so the lines flow out of the hero, wrap round the egg and carry on. The page scrolls the lines through it and the spin advances with the scroll. Lines on the egg are full gold. */
    var env = 0, trk = reduce ? null : (lgcTrack || (lgcTrack = document.querySelector(".lgc-track")));
    if (trk) { var tr = trk.getBoundingClientRect(), pp = Math.min(1, Math.max(0, (innerHeight - tr.top) / (tr.height + innerHeight))); env = Math.pow(Math.sin(Math.PI * pp), 1.1); }
    if (typeof window.__tornado === "number") env = window.__tornado;                 /* dev: force the effect on for screenshots */
    var ecx = MW / 2, ecy = topRow + (ch / 2 + sub) / cell, erx = MW * 0.47, ery = (ch / cell) * 0.47, tsec = tsec0;
    var FLOW_V = 2.6, FLOW_S = 0.022;                                             /* cells per second, and cells per pixel of scroll */
    var P = env * (tsec * FLOW_V + scrollY * FLOW_S) + (typeof window.__spin === "number" ? window.__spin * 12 : 0);   /* ONE flow for the whole section: every dot moves along the long axis by P, inside the shape and out */
    var AX = 0.62, cax = Math.cos(AX), sax = Math.sin(AX), diag = Math.hypot(MW, ch / cell), ea = diag * 0.56, eb = ea * 0.48;   /* long axis top-left to bottom-right */
    var spin = P / ea;                                                          /* the shape's spin is the same flow: at its centre the pattern moves exactly as fast as it does outside */
    for (var y = 0, i = 0; y < nRows; y++) {
      var pr = topRow + y, m = pr - r0, inMap = m >= 0 && m < MH, base = pr * MW;
      for (var x = 0; x < MW; x++, i++) {
        var b = -1;
        if (pr < R) {
          if (inMap && bp[m * MW + x]) { b = NB0 + NEON; }   /* the outline: pure tan, every dot */            /* the outline: its own bright white-tan shade */
          else if (inMap && bl[m * MW + x]) {                                          /* the black inside the letters: spray paint */
            var ps = (x - sx0) + SLOPE * m, agep = FF - ps + (pseed[base + x] - 0.5) * 6;
            if (agep > 0) { var covp = Math.min(1, agep / 18); if (pseed[base + x] * 0.97 < covp) b = NB0 + Math.max(0, Math.min(NEON - 1, Math.floor(ps / PSMAX * NEON))); }   /* speckled just behind the nozzle, solid further back */
          }
          else if (!(inMap && bl[m * MW + x])) {
            var dw = ddw[base + x], tv = thv[base + x], vf = 0;
            if (env > 0.01) {
              var sxp = x - P * cax, syp = pr - P * sax;                                 /* the flow: everything is read from a point P cells back along the long axis, so it all moves forward together */
              var dxc = x - ecx, dyc = pr - ecy, along = dxc * cax + dyc * sax, across = -dxc * sax + dyc * cax;   /* the shape's own axes: long axis runs top-left to bottom-right */
              var u1 = along / ea, v1 = across / eb;
              var ue = u1 / (1 + 0.14 * v1), r2 = ue * ue + v1 * v1;                    /* a slightly fuller-bottomed oval: only ever suggested by the flow, never drawn */
              var xf = sxp, yf = syp;
              if (r2 < 1) {
                var z = Math.sqrt(1 - r2), lat = Math.asin(v1), lon = Math.atan2(ue, z) - spin, cl = Math.cos(lat);
                var un = cl * Math.sin(lon) * (1 + 0.14 * v1), rim = Math.min(1, Math.max(0, (Math.sqrt(r2) - 0.8) / 0.2)), keepW = 1 - rim * rim * (3 - 2 * rim);
                var al2 = un * ea, ac2 = v1 * eb, dxn = al2 * cax - ac2 * sax, dyn = al2 * sax + ac2 * cax;
                xf = sxp + (ecx + dxn - sxp) * keepW; yf = syp + (ecy + dyn - syp) * keepW;   /* inside, the flow wraps round the shape (squeezed toward its edge like a globe); at its edge it hands over to the outside flow with no seam */
                vf = env * keepW * (0.4 + 0.6 * z);
              }
              var xr = Math.round(xf), yr = Math.round(yf), mr = yr - r0;
              if (xr >= 0 && xr < MW && yr >= 0 && yr < R && !(mr >= 0 && mr < MH)) { var i2 = yr * MW + xr; dw = ddw[i2]; tv = thv[i2]; }   /* never sample from inside the word itself */
            }
            var reach = FLUFF + (pseed[base + x] - 0.5) * 1.5;                             /* the puff round the letters: a cloud edge, soft and grainy, still clearly the word */
            if (dw <= reach) { var pf = 1 - dw / reach, lvF = Math.round(LEVELS * 0.5 * Math.min(1, pf * 1.3)); if (lvF > 0) b = lvF * WARMS; }
            else if (dw > 2.2) {
              var fxg = x / GS, fyg = y / GS, gx0 = Math.floor(fxg), gy0 = Math.floor(fyg), tx = fxg - gx0, ty = fyg - gy0, gi = gy0 * gcols + gx0;
              var wv = (warpG[gi] * (1 - tx) + warpG[gi + 1] * tx) * (1 - ty) + (warpG[gi + gcols] * (1 - tx) + warpG[gi + gcols + 1] * tx) * ty;
              var wt = Math.min(1, Math.max(0, (dw - 6) / (maxD * 0.25)));               /* the defined lines right at the word stay put; further out the thread drifts */
              var flow = wv * 1.7 * wt;
              /* this quarter's waves: the field is split into four quarters round the word and each rolls its own sets, blended across the axes */
              var wIdx = Math.min(BINS, (dw * 2) | 0), wxr = Math.min(1, Math.max(0, ((x - wcx) / 14 + 1) / 2)), wyr = Math.min(1, Math.max(0, ((m - wcy) / 12 + 1) / 2)); wxr = wxr * wxr * (3 - 2 * wxr); wyr = wyr * wyr * (3 - 2 * wyr);
              var wav = waveTabs[0][wIdx] * (1 - wxr) * (1 - wyr) + waveTabs[1][wIdx] * wxr * (1 - wyr) + waveTabs[2][wIdx] * (1 - wxr) * wyr + waveTabs[3][wIdx] * wxr * wyr, wv1 = Math.min(1, wav);
              var rel = dw - drift * (1 - env) + flow, ring = Math.floor(rel / PERIOD), ph = rel - ring * PERIOD;
              var WE = WIDTH * (1 + 0.55 * wv1);                                           /* where a wave is strong the ridges thicken: a denser pattern */
              /* stitch: dashes of STITCH cells with a small gap, measured along the ridge (angle x radius), each ridge starting a little apart */
              var run = (tv * (dw + 34)) / (STITCH + GAP) + ring * 0.37 + (Math.sin(ring * 12.9898) * 43758.5453 % 1), seg = Math.floor(run);
              var gone = Math.abs(Math.sin(ring * 78.233 + seg * 37.719) * 43758.5453 % 1) < 0.07 * (1 - wv1);      /* the odd stitch missing: the flaw that makes it a print (no gaps at the height of a wave) */
              var ph2 = ph > PERIOD - 1.4 ? ph - PERIOD : ph, cov = 1 - Math.abs(ph2 - WE * 0.5) / (WE * 0.5 + 0.7), dpos = (run - seg) * (STITCH + GAP), dcv = Math.min(1, Math.min(dpos + 0.6 + 1.0 * wv1, STITCH + 1 * wv1 - dpos + 0.6));
              if (cov > 0.02 && dcv > 0.02 && !gone) {                                    /* soft edges: a ridge or a stitch fades in and out over a cell instead of switching on and off */
                var fade = FLOOR + (1 - FLOOR) * Math.exp(-dw / (maxD * 0.34));                         /* bright at the word, a quiet floor further out so it flows on down the page */
                var kk = Math.min(1, (0.4 * fade + wav * 0.55 * fade) * (1 + 1.3 * vf) * Math.pow(cov * dcv, 0.7) * 1.2 * (1 + 0.5 * wv1)), warm = Math.min(1, Math.max(dw / (maxD * 0.55), vf * 1.15));
                var lv2 = Math.round(kk * LEVELS); if (lv2 > 0) b = lv2 * WARMS + Math.round(warm * (WARMS - 1));
              }
            }
          }
        }
        bucketOf[i] = b; if (b >= 0) counts[b + 1]++;
      }
    }
    for (var c = 1; c <= NB; c++) counts[c] += counts[c - 1];
    var start = counts.slice(0), nn = nRows * MW;
    for (i = 0; i < nn; i++) if (bucketOf[i] >= 0) order[start[bucketOf[i]]++] = i;

    ctx.fillStyle = "#050403"; ctx.fillRect(0, 0, cw, ch);
    var s = Math.max(1, cell * 0.72), pad = (cell - s) / 2;
    for (var bk = 0; bk < NB; bk++) {
      var a = counts[bk], z = counts[bk + 1]; if (a === z) continue;
      ctx.fillStyle = styles[bk];
      if (bk >= NB0) {                                                              /* soft glow under each neon dot: a larger, faint copy */
        ctx.globalAlpha = 0.14; var gs = s * 2.6, gp = (cell - gs) / 2;
        for (var jg = a; jg < z; jg++) { var ng = order[jg], xg = ng % MW, yg = (ng - xg) / MW; ctx.fillRect(ox + xg * cell + gp + offX[ng], yg * cell - sub + gp + offY[ng], gs, gs); }
        ctx.globalAlpha = 1;
      }
      for (var j = a; j < z; j++) {
        var n = order[j], xx = n % MW, yy = (n - xx) / MW;
        ctx.fillRect(ox + xx * cell + pad + offX[n], yy * cell - sub + pad + offY[n], s, s);
      }
    }
    /* overspray: a fine mist thrown around the nozzle line while the letters are being painted */
    if (sp < 1 && sp > 0.005 && sx1 > sx0) {
      var mc = spec(Math.min(1, Math.max(0, FF / PSMAX))), k, mrow, mx, my, aa, ms;
      for (k = 0; k < 240; k++) {
        mrow = Math.random() * (MH + 4) - 2;                                                       /* a row of the word */
        mx = ox + (sx0 + FF - SLOPE * mrow + 0.5 + (Math.random() + Math.random() - 1) * 9) * cell; my = (r0 + mrow) * cell - sy0;
        aa = 0.16 + Math.random() * 0.5; ctx.fillStyle = "rgba(" + mc[0] + "," + mc[1] + "," + mc[2] + "," + aa.toFixed(2) + ")"; ms = (0.8 + Math.random() * 1.7) * dpr; ctx.fillRect(mx, my, ms, ms);
      }
      for (k = 0; k < 50; k++) {
        mrow = Math.random() * (MH + 4) - 2; mx = ox + (sx0 + FF - SLOPE * mrow + 0.5 + (Math.random() - 0.5) * 4) * cell; my = (r0 + mrow) * cell - sy0;
        ctx.fillStyle = "rgba(" + mc[0] + "," + mc[1] + "," + mc[2] + "," + (0.35 + Math.random() * 0.4).toFixed(2) + ")"; ctx.fillRect(mx, my, 2.4 * dpr, 2.4 * dpr);
      }
    } else if (sp >= 1 && !reduce && sx1 > sx0) {
      /* the can keeps going: after the first pass the nozzle roams back and forth and up and down over the word for ever, throwing mist and lighting the wet paint under it */
      var tn = (t - (sprayStart || t) - 700 - SPRAY_MS) / 1000, xN = sx0 + (sx1 - sx0) * (0.5 + 0.5 * Math.sin(tn * 0.42 - 1.2)), yN = MH * (0.5 + 0.44 * Math.sin(tn * 1.55 + 0.6) * Math.cos(tn * 0.37));
      var mcN = spec((xN - sx0) / Math.max(1, sx1 - sx0)), npx = ox + (xN + 0.5) * cell, npy = (r0 + yN) * cell - sy0, kk2;
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      var gr = ctx.createRadialGradient(npx, npy, 0, npx, npy, cell * 16); gr.addColorStop(0, "rgba(" + mcN[0] + "," + mcN[1] + "," + mcN[2] + ",0.26)"); gr.addColorStop(1, "rgba(" + mcN[0] + "," + mcN[1] + "," + mcN[2] + ",0)");
      ctx.fillStyle = gr; ctx.fillRect(npx - cell * 16, npy - cell * 16, cell * 32, cell * 32);       /* wet paint glow */
      for (kk2 = 0; kk2 < 220; kk2++) {
        var ang = Math.random() * 6.2832, rad = (Math.random() + Math.random() + Math.random() - 1.5) * cell * 7, aN = 0.14 + Math.random() * 0.5, sz = (0.8 + Math.random() * 1.7) * dpr;
        ctx.fillStyle = "rgba(" + mcN[0] + "," + mcN[1] + "," + mcN[2] + "," + aN.toFixed(2) + ")"; ctx.fillRect(npx + Math.cos(ang) * rad, npy + Math.sin(ang) * rad, sz, sz);
      }
      ctx.restore();
    }
  }

  addEventListener("scroll", function () { if (reduce && MW && scrollY <= fieldEnd + innerHeight) draw(0); }, { passive: true });
  var lastFrame = 0, cleared = false;
  function loop(t) {
    requestAnimationFrame(loop);
    if (document.hidden || (coarse && t - lastFrame < 32)) return;
    lastFrame = t;
    if (scrollY > fieldEnd) { if (!cleared) { ctx.clearRect(0, 0, cw, ch); cleared = true; } return; }   /* below the last transparent section nothing shows: skip the work */
    cleared = false;
    if (cursor.active || ripples.length || moving) step(t);
    draw(t);
  }
  window.__ringsDraw = function () { if (MW) draw(performance.now()); };   /* dev/test: a hidden tab pauses requestAnimationFrame */
  load();
})();
