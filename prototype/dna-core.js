/* DNA core: a double helix fixed at the centre of the page, behind the sections, driven by scroll.
   The hero is the fingerprint. Scroll out of it and the fingerprint's core lets go of ONE thread, which unwinds into two strands that turn
   as you scroll (3D: strands pass in front of and behind each other, rungs fade edge-on). It is drawn in running stitch, rust and gold.
   Same idea as lenis.dev: one fixed layer behind the page, the scroll position is the only input. Draws only while visible; reduced motion = still frame.
   Public hook: SZ_DNA.setSeed("name") changes the helix's pitch and phase for a name (the same name always gives the same helix). */
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, coarse = matchMedia("(pointer: coarse)").matches;
  var cv = document.createElement("canvas"); cv.className = "dna-core"; cv.setAttribute("aria-hidden", "true");
  document.body.insertBefore(cv, document.body.firstChild ? document.body.firstChild.nextSibling : null); var ctx = cv.getContext("2d");
  var RUST = [196, 85, 58], GOLD = [201, 164, 92], CREAM = [243, 234, 220];
  var W = 0, H = 0, dpr = 1, pitch = 210, phase0 = 0, dirty = true, t0 = performance.now(), fieldEnd = 3000, last = 0;
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  window.SZ_DNA = { setSeed: function (s) { var h = hash(String(s || "sanchez")); pitch = 170 + (h & 255) / 255 * 90; phase0 = ((h >> 8) & 1023) / 1023 * 6.283; dirty = true; } };

  function size() {
    dpr = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2); W = document.documentElement.clientWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + "px"; cv.style.height = H + "px"; dirty = true;
    var end = 0; [].forEach.call(document.querySelectorAll(".bag-punch, .lgc-track, .sz-marquee, .curved-loop, [data-hero-rings]"), function (e) { end = Math.max(end, e.getBoundingClientRect().bottom + scrollY); });
    fieldEnd = end || 3000;
  }
  addEventListener("resize", size); size(); addEventListener("load", size);
  if (window.ResizeObserver) { var rz = 0; new ResizeObserver(function () { clearTimeout(rz); rz = setTimeout(size, 250); }).observe(document.body); }
  addEventListener("scroll", function () { dirty = true; }, { passive: true });

  function sm(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a.toFixed(3) + ")"; }

  function draw(now) {
    var y = scrollY, vh = H;
    var grow = sm(vh * 0.12, vh * 0.95, y);                                   /* 0 in the hero, 1 one screen down: single thread -> two strands */
    var fadeOut = 1 - sm(fieldEnd - vh * 1.4, fieldEnd - vh * 0.4, y);       /* gone once the transparent sections are behind you */
    var bag = document.querySelector(".bag-punch"), bagK = 1;                   /* the bag is the centrepiece: the helix steps back while the bag fills the screen */
    if (bag) { var r = bag.getBoundingClientRect(), cover = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh; bagK = 1 - 0.8 * sm(0.35, 0.9, cover); }
    var alpha = grow * fadeOut * bagK; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    if (alpha < 0.01) return;
    var cx = W / 2, amp = Math.min(W * 0.16, 84) * grow, tilt = reduce ? 0 : (now - t0) / 1000 * 0.32;
    var turn = y / pitch * 2 * Math.PI * 0.55 + tilt + phase0, per = pitch;
    var step = 4, n = Math.ceil((H + 40) / step) + 1, A = [], B = [];
    for (var i = 0; i < n; i++) {
      var yy = -20 + i * step, a = (yy / per) * 2 * Math.PI + turn, s = Math.sin(a), c = Math.cos(a);
      A.push([cx + amp * s, yy, c]); B.push([cx - amp * s, yy, -c]);           /* [x, y, depth]: depth > 0 = towards you */
    }
    /* rungs, back to front by depth so the helix reads as 3D */
    ctx.setLineDash([]); ctx.lineCap = "round";
    for (var ry = -20; ry < H + 20; ry += 20) {
      var ra = (ry / per) * 2 * Math.PI + turn, dep = Math.cos(ra), x1 = cx + amp * Math.sin(ra), x2 = cx - amp * Math.sin(ra);
      if (amp < 3) continue;
      ctx.lineWidth = 1; ctx.strokeStyle = rgba(CREAM, alpha * (0.06 + 0.22 * Math.abs(dep))); ctx.beginPath(); ctx.moveTo(x1, ry); ctx.lineTo(x2, ry); ctx.stroke();
      /* the little knots where a rung meets a strand */
      ctx.fillStyle = rgba(dep > 0 ? RUST : GOLD, alpha * (0.25 + 0.5 * Math.abs(dep))); ctx.beginPath(); ctx.arc(x1, ry, 1.6 + 1.2 * Math.max(0, dep), 0, 7); ctx.fill();
      ctx.fillStyle = rgba(dep > 0 ? GOLD : RUST, alpha * (0.25 + 0.5 * Math.abs(dep))); ctx.beginPath(); ctx.arc(x2, ry, 1.6 + 1.2 * Math.max(0, -dep), 0, 7); ctx.fill();
    }
    /* each strand in short segments so thickness and brightness follow depth: far = fine and dim, near = bold and bright; running stitch dashes */
    function strand(P, col, other) {
      for (var i = 0; i < P.length - 1; i++) {
        var p = P[i], q = P[i + 1], d = (p[2] + q[2]) / 2, k = 0.5 + 0.5 * d;      /* 0 far .. 1 near */
        if (Math.floor(i / 2) % 3 === 2) continue;                                   /* the gap in the running stitch */
        ctx.strokeStyle = rgba(col, alpha * (0.18 + 0.82 * k)); ctx.lineWidth = 1 + 2.2 * k; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      }
    }
    var nearIsA = Math.cos(turn) >= 0;                                              /* draw the far strand first */
    if (nearIsA) { strand(B, GOLD); strand(A, RUST); } else { strand(A, RUST); strand(B, GOLD); }
  }

  var visible = true; document.addEventListener("visibilitychange", function () { visible = !document.hidden; });
  function loop(now) {
    requestAnimationFrame(loop);
    if (!visible || (coarse && now - last < 33)) return; last = now;
    if (scrollY > fieldEnd) { if (!loop.cleared) { ctx.clearRect(0, 0, W, H); loop.cleared = true; } return; } loop.cleared = false;
    if (reduce && !dirty) return; dirty = false; draw(now);
  }
  requestAnimationFrame(loop);
})();
