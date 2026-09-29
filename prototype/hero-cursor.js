/* Hero cursor: a stitched ring. Cream stitch dashes turn slowly round a red centre dot (the exact pointer).
   The ring trails a touch behind, stretches a little along the direction of travel, and tightens on click like a
   punch landing (the dot field's own shockwave fires at the same time). Mouse/trackpad only; reduced motion = no
   spin, no trail, no stretch. */
(function () {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var hero = document.querySelector("[data-hero-rings]"); if (!hero) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var c = document.createElement("div"); c.className = "hero-cursor"; c.setAttribute("aria-hidden", "true");
  c.innerHTML = '<div class="hero-cursor__ring"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" pathLength="48"/></svg></div><div class="hero-cursor__dot"></div>';
  document.body.appendChild(c);
  var ring = c.firstChild, dot = c.lastChild;

  var mx = 0, my = 0, rx = 0, ry = 0, vx = 0, vy = 0, press = 0, pressT = 0, on = false, raf = 0;
  function frame() {
    var k = reduce ? 1 : 0.2;
    var nx = rx + (mx - rx) * k, ny = ry + (my - ry) * k;
    vx = nx - rx; vy = ny - ry; rx = nx; ry = ny;
    press += (pressT - press) * 0.25;
    var sp = reduce ? 0 : Math.min(Math.hypot(vx, vy) / 30, 0.25), ang = Math.atan2(vy, vx) * 180 / Math.PI;
    var s = 1 - press * 0.35;
    ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0) rotate(" + ang + "deg) scale(" + (s * (1 + sp)) + "," + (s * (1 - sp * 0.6)) + ")";
    dot.style.transform = "translate3d(" + mx + "px," + my + "px,0) scale(" + (1 + press * 0.8) + ")";
    raf = on || Math.abs(mx - rx) + Math.abs(my - ry) > 0.1 ? requestAnimationFrame(frame) : 0;
  }
  function show(e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    mx = e.clientX; my = e.clientY;
    if (!on) { if (!c.classList.contains("is-on")) { rx = mx; ry = my; } on = true; c.classList.add("is-on"); }
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function hide() { on = false; c.classList.remove("is-on"); }
  hero.addEventListener("pointermove", show);
  hero.addEventListener("pointerenter", show);
  hero.addEventListener("pointerleave", hide);
  addEventListener("scroll", function () { if (on) { var r = hero.getBoundingClientRect(); if (my < r.top || my > r.bottom) hide(); } }, { passive: true });
  hero.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse") { pressT = 1; if (!raf) raf = requestAnimationFrame(frame); } });
  addEventListener("pointerup", function () { pressT = 0; if (!raf) raf = requestAnimationFrame(frame); });
})();
