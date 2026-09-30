/* The Sanchez fingerprint: stitched ridges round the SANCHEZ wordmark that carry on down the page.
   One field of dots for the whole top of the site, drawn on a fixed canvas BEHIND the sections and scrolling with the page, so the hero,
   the curved strip, the gallery, the marquee and the bag all sit in the same pattern (their backgrounds are transparent).
   A small precomputed map (R = distance from the word, G = the outline, B = the letters) sets the hero; above and below it the ridges simply keep going.
   Ridges are running stitch (dashes with gaps and the odd missing stitch), dim and warm toward gold with distance; a slow pulse travels outward.
   Every dot is a particle: the cursor pushes dots away, a click sends a shockwave (same physics as the dithered-logo component).
   SZ_FINGERPRINT.setSeed("name") reshapes the ridges for a name. Reduced motion: a still frame. */
(function () {
  var root = document.querySelector("[data-hero-rings]"); if (!root) return;
  var cv = root.querySelector("canvas"), ctx = cv.getContext("2d");
  document.body.insertBefore(cv, document.body.firstChild); cv.className = "wm-field";      /* out of the hero, behind everything */
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, coarse = matchMedia("(pointer: coarse)").matches;
  var MW = 0, MH = 0, bd, bp, bl;                                 /* the map */
  var R = 0, r0 = 0, ddw, thv, pseed;                              /* the page-long grid: rows, map's first row, ridge distance, angle, per-dot random */
  var nRows = 0, topRow = 0, sub = 0, bucketOf, order, counts, offX, offY;   /* what is on screen right now */
  var fpA = 1.7, fpB = 4.1, fpC = 0.6, STITCH = 8, GAP = 3, PERIOD = 6.5, WIDTH = 1.9, PULSE_EVERY = 5.25, FLOOR = 0.26;
  var CREAM = [243, 234, 220], GOLD = [201, 164, 92];
  var CURSOR_RADIUS = 100, CURSOR_FORCE = 40, RIPPLE_SPEED = 225, RIPPLE_WIDTH = 37, RIPPLE_FORCE = 20, RIPPLE_DURATION = 675, LERP = 0.12;
  var LEVELS = 20, WARMS = 6, NB = (LEVELS + 1) * WARMS, styles = [];
  for (var lv = 0; lv <= LEVELS; lv++) for (var w = 0; w < WARMS; w++) {
    var k = lv / LEVELS, t = w / (WARMS - 1);
    styles.push("rgb(" + Math.round((CREAM[0] + (GOLD[0] - CREAM[0]) * t) * k) + "," + Math.round((CREAM[1] + (GOLD[1] - CREAM[1]) * t) * k) + "," + Math.round((CREAM[2] + (GOLD[2] - CREAM[2]) * t) * k) + ")");
  }
  var cursor = { x: 0, y: 0, active: false }, ripples = [], cell = 1, ox = 0, dpr = 1, moving = false, fieldEnd = 1e9, cw = 0, ch = 0;

  function load() {
    var port = innerWidth < innerHeight, im = new Image();
    im.onload = function () {
      MW = im.width; MH = im.height; var n = MW * MH;
      var t = document.createElement("canvas"); t.width = MW; t.height = MH; var tc = t.getContext("2d"); tc.drawImage(im, 0, 0);
      var px = tc.getImageData(0, 0, MW, MH).data;
      bd = new Float32Array(n); bp = new Uint8Array(n); bl = new Uint8Array(n);
      for (var i = 0; i < n; i++) { bd[i] = px[i * 4]; bp[i] = px[i * 4 + 1] > 127; bl[i] = px[i * 4 + 2] > 127; }
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
  function draw(t) {
    var sy = scrollY * dpr; topRow = Math.max(0, Math.floor(sy / cell)); sub = sy - topRow * cell;
    var maxD = Math.hypot(MW, MH) * 0.5, wave = ((t / 1000) % PULSE_EVERY) / PULSE_EVERY * maxD * 1.15, drift = reduce ? 0 : t / 1000 * 1.1;
    counts.fill(0);
    /* TORNADO: while the workshop carousel is scrolled through, a vortex sits at the centre of the screen and twists the ridges around it. It is the same field
       (the ridges the hero fingerprint sends down the page), so the lines flow out of the hero, spin up into a tornado behind the carousel, and unwind again after it.
       The page scrolls the ridges through the vortex, and the vortex also turns as you scroll, so the lines pass through the design. Twisted ridges are pushed to full gold. */
    var env = 0, trk = reduce ? null : document.querySelector(".lgc-track");
    if (trk) { var tr = trk.getBoundingClientRect(), pp = Math.min(1, Math.max(0, (innerHeight - tr.top) / (tr.height + innerHeight))); env = Math.pow(Math.sin(Math.PI * pp), 1.1); }
    if (typeof window.__tornado === "number") env = window.__tornado;                 /* dev: force the tornado on for screenshots */
    var vcx = MW / 2, vcy = topRow + (ch / 2 + sub) / cell, sig2 = Math.pow(MW * 0.42, 2), tw = env * (3.4 + scrollY * 0.0012);
    for (var y = 0, i = 0; y < nRows; y++) {
      var pr = topRow + y, m = pr - r0, inMap = m >= 0 && m < MH, base = pr * MW;
      for (var x = 0; x < MW; x++, i++) {
        var b = -1;
        if (pr < R) {
          if (inMap && bp[m * MW + x]) { if (pseed[base + x] < 0.9) b = LEVELS * WARMS; }            /* the outline: full cream */
          else if (!(inMap && bl[m * MW + x])) {
            var dw = ddw[base + x], tv = thv[base + x], vf = 0;
            if (env > 0.01) {
              var dxv = x - vcx, dyv = pr - vcy, d2v = dxv * dxv + dyv * dyv;
              if (d2v < 9 * sig2) {
                var fv = Math.exp(-d2v / sig2), phv = tw * fv, cv_ = Math.cos(phv), sv_ = Math.sin(phv);
                var xr = Math.round(vcx + cv_ * dxv - sv_ * dyv), yr = Math.round(vcy + sv_ * dxv + cv_ * dyv);
                var mr = yr - r0;
                if (xr >= 0 && xr < MW && yr >= 0 && yr < R && !(mr >= 0 && mr < MH)) { var i2 = yr * MW + xr; dw = ddw[i2]; tv = thv[i2]; }   /* never sample from inside the word itself: no holes */
                vf = fv * env;
              }
            }
            if (dw > 2.2) {
              var rel = dw - drift, ring = Math.floor(rel / PERIOD), ph = rel - ring * PERIOD;
              /* stitch: dashes of STITCH cells with a small gap, measured along the ridge (angle x radius), each ridge starting a little apart */
              var run = (tv * (dw + 34)) / (STITCH + GAP) + ring * 0.37 + (Math.sin(ring * 12.9898) * 43758.5453 % 1), seg = Math.floor(run), inD = (run - seg) * (STITCH + GAP) < STITCH;
              var gone = Math.abs(Math.sin(ring * 78.233 + seg * 37.719) * 43758.5453 % 1) < 0.07;      /* the odd stitch missing: the flaw that makes it a print */
              if (ph < WIDTH && inD && !gone) {
                var fade = FLOOR + (1 - FLOOR) * Math.exp(-dw / (maxD * 0.34));                         /* bright at the word, a quiet floor further out so it flows on down the page */
                var pulse = reduce ? 0 : Math.exp(-Math.pow((dw - wave) / 7, 2)) * 0.55;
                var kk = Math.min(1, (0.34 * fade + pulse * fade) * (1 + 0.6 * vf)), warm = Math.min(1, Math.max(dw / (maxD * 0.55), vf * 1.15));   /* in the tornado the lines are full gold and a little brighter */
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
      for (var j = a; j < z; j++) {
        var n = order[j], xx = n % MW, yy = (n - xx) / MW;
        ctx.fillRect(ox + xx * cell + pad + offX[n], yy * cell - sub + pad + offY[n], s, s);
      }
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
