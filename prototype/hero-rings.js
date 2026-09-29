/* Hero 3: SANCHEZ with engraved rings rippling outward.
   A small precomputed map (R = distance from the word, G = the outline, B = the letters) gives every dot its place.
   Rings dim and warm toward gold with distance, and a slow pulse travels outward every few seconds.
   Every dot is a particle: the cursor pushes dots away and they ease back, and a click or tap sends a shockwave out
   (same physics constants as the dithered-logo component used in revisions 1 and 2). Reduced motion: a still frame. */
(function () {
  var root = document.querySelector("[data-hero-rings]"); if (!root) return;
  var cv = root.querySelector("canvas"), ctx = cv.getContext("2d");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MW = 0, MH = 0, MHe = 0, N = 0, curExtra = -1, bd, bp, bl, dist, pipe, letr, seed, offX, offY, bucketOf, order, counts;   /* MH = map rows, MHe = rows incl. the bleed below the hero */
  var PERIOD = 6.5, WIDTH = 1.9, PULSE_EVERY = 5.25;   /* 4.2s slowed by 20% */
  var CREAM = [243, 234, 220], GOLD = [201, 164, 92];
  /* dithered-logo physics, in CSS pixels */
  var CURSOR_RADIUS = 100, CURSOR_FORCE = 40, RIPPLE_SPEED = 225, RIPPLE_WIDTH = 37, RIPPLE_FORCE = 20, RIPPLE_DURATION = 675, LERP = 0.12;
  var LEVELS = 20, WARMS = 6, NB = (LEVELS + 1) * WARMS, styles = [];
  for (var lv = 0; lv <= LEVELS; lv++) for (var w = 0; w < WARMS; w++) {
    var k = lv / LEVELS, t = w / (WARMS - 1);
    styles.push("rgb(" + Math.round((CREAM[0] + (GOLD[0] - CREAM[0]) * t) * k) + "," + Math.round((CREAM[1] + (GOLD[1] - CREAM[1]) * t) * k) + "," + Math.round((CREAM[2] + (GOLD[2] - CREAM[2]) * t) * k) + ")");
  }
  var cursor = { x: 0, y: 0, active: false }, ripples = [];

  function load() {
    var port = innerWidth < innerHeight, im = new Image();
    im.onload = function () {
      MW = im.width; MH = im.height; N = MW * MH;
      var t = document.createElement("canvas"); t.width = MW; t.height = MH; var tc = t.getContext("2d"); tc.drawImage(im, 0, 0);
      var px = tc.getImageData(0, 0, MW, MH).data;
      bd = new Float32Array(N); bp = new Uint8Array(N); bl = new Uint8Array(N);
      for (var i = 0; i < N; i++) { bd[i] = px[i * 4]; bp[i] = px[i * 4 + 1] > 127; bl[i] = px[i * 4 + 2] > 127; }
      size(); root.classList.add("is-ready");
      if (reduce) draw(0); else requestAnimationFrame(loop);
    };
    im.src = "assets/globe/rings-map-" + (port ? "port" : "land") + ".png?v=1";
  }

  /* cover-fit the map into the canvas; cell = one map pixel, in device pixels */
  var coarse = matchMedia("(pointer: coarse)").matches;   /* phones / tablets: lighter canvas, 30 fps, physics only while something is moving */
  var cell = 1, ox = 0, oy = 0, dpr = 1, moving = false;
  function size() {
    var r = root.getBoundingClientRect(), loop = document.querySelector(".curved-loop");
    var bleed = loop ? loop.getBoundingClientRect().height : 0, heroH = r.height; dpr = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round((heroH + bleed) * dpr); cv.style.height = (heroH + bleed) + "px";
    cell = Math.max(cv.width / MW, heroH * dpr / MH); ox = (cv.width - MW * cell) / 2; oy = (heroH * dpr - MH * cell) / 2;   /* the map is fitted to the hero box */
    build(Math.max(0, Math.ceil((cv.height - (oy + MH * cell)) / cell)));
    if (reduce && MW) draw(0);
  }
  /* grid = the map plus `extra` rows below it. Distance in the extra rows keeps growing straight down from the map's last row,
     so the rings and the pulse carry on past the hero's bottom edge instead of stopping at it. */
  function build(extra) {
    if (extra === curExtra && dist) return;
    curExtra = extra; MHe = MH + extra; N = MW * MHe;
    dist = new Float32Array(N); pipe = new Uint8Array(N); letr = new Uint8Array(N); seed = new Float32Array(N);
    offX = new Float32Array(N); offY = new Float32Array(N); bucketOf = new Int16Array(N); order = new Int32Array(N); counts = new Int32Array(NB + 1);
    dist.set(bd); pipe.set(bp); letr.set(bl);
    for (var y = MH; y < MHe; y++) for (var x = 0; x < MW; x++) dist[y * MW + x] = bd[(MH - 1) * MW + x] + (y - MH + 1);
    for (var i = 0; i < N; i++) { var h = Math.sin(i * 12.9898) * 43758.5453; seed[i] = h - Math.floor(h); }
  }
  addEventListener("resize", function () { if (MW) size(); });
  var loopEl = document.querySelector(".curved-loop");
  if (loopEl && window.ResizeObserver) new ResizeObserver(function () { if (MW) size(); }).observe(loopEl);
  function local(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr }; }
  root.addEventListener("pointermove", function (e) { var p = local(e); cursor.x = p.x; cursor.y = p.y; cursor.active = true; });
  root.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") cursor.active = false; });
  root.addEventListener("pointercancel", function () { cursor.active = false; });
  root.addEventListener("pointerup", function (e) {
    var p = local(e); ripples.push({ x: p.x, y: p.y, start: performance.now() });
    if (e.pointerType !== "mouse") cursor.active = false;
  });

  /* push dots away from the cursor and ripples; ease back when the force goes */
  function step(now) {
    moving = false;
    for (var k = ripples.length - 1; k >= 0; k--) if (now - ripples[k].start >= RIPPLE_DURATION) ripples.splice(k, 1);
    var nr = ripples.length, mul = nr ? 1 + 0.5 * (nr - 1) : 0;
    var CR = CURSOR_RADIUS * dpr, CR2 = CR * CR, CF = CURSOR_FORCE * dpr, RW = RIPPLE_WIDTH * dpr, RF = RIPPLE_FORCE * dpr;
    for (var y = 0, i = 0; y < MHe; y++) {
      var by = oy + (y + 0.5) * cell;
      for (var x = 0; x < MW; x++, i++) {
        if (bucketOf[i] < 0 && offX[i] === 0 && offY[i] === 0) continue;   /* unlit and at rest: nothing to move */
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

  /* colour every dot into one of NB shades (brightness x warmth), then draw each shade in one pass */
  function draw(t) {
    var maxD = Math.hypot(MW, MH) * 0.5;
    var wave = ((t / 1000) % PULSE_EVERY) / PULSE_EVERY * maxD * 1.15;
    var drift = reduce ? 0 : t / 1000 * 1.1;
    counts.fill(0);
    for (var i = 0; i < N; i++) {
      var b = -1;
      if (pipe[i]) { if (seed[i] < 0.9) b = LEVELS * WARMS; }                 /* outline: full cream */
      else if (!letr[i]) {
        var dd = dist[i];
        if (dd > 2.2) {
          var ph = ((dd - drift) % PERIOD + PERIOD) % PERIOD;
          if (ph < WIDTH && seed[i] < 0.86) {
            var fade = Math.exp(-dd / (maxD * 0.34));
            var pulse = reduce ? 0 : Math.exp(-Math.pow((dd - wave) / 7, 2)) * 0.55;
            var k = Math.min(1, 0.34 * fade + pulse * fade);
            var warm = Math.min(1, dd / (maxD * 0.55));
            var lv = Math.round(k * LEVELS); if (lv > 0) b = lv * WARMS + Math.round(warm * (WARMS - 1));
          }
        }
      }
      bucketOf[i] = b; if (b >= 0) counts[b + 1]++;
    }
    for (var c = 1; c <= NB; c++) counts[c] += counts[c - 1];
    var start = counts.slice(0);
    for (i = 0; i < N; i++) if (bucketOf[i] >= 0) order[start[bucketOf[i]]++] = i;

    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cv.width, cv.height);
    var s = Math.max(1, cell * 0.72), pad = (cell - s) / 2;
    for (var bk = 0; bk < NB; bk++) {
      var a = counts[bk], z = counts[bk + 1]; if (a === z) continue;
      ctx.fillStyle = styles[bk];
      for (var j = a; j < z; j++) {
        var n = order[j], x = n % MW, y = (n - x) / MW;
        ctx.fillRect(ox + x * cell + pad + offX[n], oy + y * cell + pad + offY[n], s, s);
      }
    }
  }

  /* hide the nav while the hero is on screen: "on-hero" stays on until the hero's bottom passes the top of the viewport */
  new IntersectionObserver(function (e) { document.body.classList.toggle("on-hero", e[0].isIntersecting); }, { rootMargin: "0px 0px 0px 0px", threshold: 0 }).observe(root);

  var visible = true;
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(root);
  var lastFrame = 0;
  function loop(t) {
    requestAnimationFrame(loop);
    if (!visible || (coarse && t - lastFrame < 32)) return;   /* phones: about 30 fps */
    lastFrame = t;
    if (cursor.active || ripples.length || moving) step(t);    /* nothing pushing the dots: skip the whole physics pass */
    draw(t);
  }
  load();
})();
