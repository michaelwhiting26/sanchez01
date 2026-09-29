/* DNA spine: a thin double helix down the left edge of the page, in running stitch (dashed thread).
   It starts as ONE line at the top, the fingerprint's core, and unwinds into two strands as you scroll out of the hero.
   Sections grow off it: as each one comes up the screen, a stub of thread reaches out from the helix at its top edge and ends in a small knot.
   The helix turns with the scroll. Drawn on one small fixed canvas, only while the tab is visible; reduced motion gets a still frame. */
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cv = document.createElement("canvas"); cv.className = "dna-spine"; cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;left:0;top:0;height:100%;pointer-events:none;z-index:40";
  document.body.appendChild(cv); var ctx = cv.getContext("2d");
  var RUST = "#c4553a", GOLD = "#c9a45c", CREAM = "243,234,220";
  var W = 0, H = 0, dpr = 1, targets = [], lastY = -1, dirty = true, t0 = performance.now();

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth < 768 ? 30 : 62; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + "px"; dirty = true;
    targets = [].slice.call(document.querySelectorAll("main > section, main > .lgc-track"));
  }
  addEventListener("resize", size); size();
  addEventListener("scroll", function () { dirty = true; }, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(function () { dirty = true; }).observe(document.body);

  function smooth(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function stroke(pts, color, width, alpha, dash) {
    ctx.beginPath(); pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
    ctx.setLineDash(dash || []); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = width; ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.stroke();
  }

  function draw(now) {
    var y = scrollY, out = smooth(0, innerHeight * 0.95, y);                  /* 0 in the hero, 1 once the hero is behind you */
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    var cx = W / 2 - 1, A = (W / 2 - 5) * out;                                 /* strand amplitude: one line at the top, a full helix below the hero */
    var turn = (reduce ? 0 : (now - t0) / 1000 * 0.35) + y * 0.0105, period = 118;
    var s1 = [], s2 = [];
    for (var yy = -10; yy <= H + 10; yy += 3) {
      var a = (yy + y * 0.0) / period * Math.PI * 2 + turn;
      s1.push([cx + A * Math.sin(a), yy]); s2.push([cx + A * Math.sin(a + Math.PI), yy]);
    }
    /* rungs: fine threads between the strands, fading where the helix turns edge-on */
    ctx.setLineDash([]); ctx.lineWidth = 1;
    for (var ry = 0; ry <= H; ry += 22) {
      var ra = ry / period * Math.PI * 2 + turn, x1 = cx + A * Math.sin(ra), x2 = cx + A * Math.sin(ra + Math.PI), depth = Math.abs(Math.cos(ra));
      if (A < 2) continue;
      ctx.globalAlpha = 0.10 + 0.28 * depth * out; ctx.strokeStyle = "rgb(" + CREAM + ")"; ctx.beginPath(); ctx.moveTo(x1, ry); ctx.lineTo(x2, ry); ctx.stroke();
    }
    /* the strands as running stitch: back strand dim and fine, front strand brighter */
    var frontIs1 = Math.cos(y * 0.0105 + turn) >= 0;
    stroke(frontIs1 ? s2 : s1, frontIs1 ? GOLD : RUST, 1.4, 0.45, [5, 4]);
    stroke(frontIs1 ? s1 : s2, frontIs1 ? RUST : GOLD, 2.2, 0.95, [7, 4]);
    /* sections growing off the strand: a stub of thread from the helix at the top edge of each section, ending in a knot */
    targets.forEach(function (el, i) {
      var r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > H) return;
      var top = Math.max(r.top + 26, 14), grow = smooth(H * 0.98, H * 0.55, r.top);
      if (r.height < 60 || grow <= 0 || out < 0.05) return;
      var ra = top / period * Math.PI * 2 + turn, sx = cx + A * Math.sin(ra), len = (W - sx - 3) * grow, col = i % 2 ? GOLD : RUST;
      ctx.globalAlpha = 0.85 * out; stroke([[sx, top], [sx + len, top]], col, 1.6, 0.85 * out, [4, 3]);
      ctx.setLineDash([]); ctx.globalAlpha = 0.95 * out; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(sx + len, top, 2.6 * grow, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1; ctx.setLineDash([]);
  }

  var visible = true; document.addEventListener("visibilitychange", function () { visible = !document.hidden; });
  function loop(now) {
    requestAnimationFrame(loop);
    if (!visible) return;
    if (reduce) { if (dirty) { draw(now); dirty = false; } return; }
    draw(now);                                                                  /* the helix turns by itself, so it redraws every frame (a canvas this small is cheap) */
  }
  requestAnimationFrame(loop);
})();
