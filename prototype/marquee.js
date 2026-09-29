/* Big SANCHEZ marquee: drifts left, and scroll velocity speeds it up / reverses it (like componentry's scroll marquee). */
(function () {
  var t = document.querySelector("[data-marquee]"); if (!t) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  var x = 0, v = 0, lastY = window.scrollY, last = performance.now();
  var vis = true; new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }, { rootMargin: "150px" }).observe(t.parentElement || t);
  function frame(now) {
    if (!vis) { last = now; lastY = window.scrollY; requestAnimationFrame(frame); return; }   /* off screen: idle */
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var y = window.scrollY, sv = (y - lastY) / Math.max(dt, 0.001); lastY = y;
    v += ((sv * 0.004) - v) * Math.min(1, dt * 6);                  /* smoothed scroll velocity */
    var dir = v < -0.3 ? -1 : 1;
    x -= (2.2 + Math.abs(v) * 1.6) * dir * dt;                      /* % per second */
    var half = 50; if (x <= -half) x += half; if (x > 0) x -= half;  /* track holds two copies of the loop */
    t.style.transform = "translate3d(" + x + "%,0,0)";
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
