/* Depth cards (our own implementation of the effect): tilt toward the cursor, layers parallax at their own depth,
   a spotlight follows the pointer, and the caption slides in. Off for reduced motion and touch. */
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, touch = matchMedia("(hover: none)").matches;
  var MAX_ROT = 14, MAX_T = 18;
  document.querySelectorAll("[data-depth-card]").forEach(function (card) {
    var layers = card.querySelectorAll("[data-depth]");
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, on = false;
    function frame() {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      card.style.transform = "perspective(900px) rotateX(" + (-cy * MAX_ROT) + "deg) rotateY(" + (cx * MAX_ROT) + "deg)";
      layers.forEach(function (l) { var d = Number(l.getAttribute("data-depth")); l.style.transform = "translate3d(" + (cx * MAX_T * d) + "px," + (cy * MAX_T * d) + "px,0) scale(" + (1 + 0.06 * Math.abs(d)) + ")"; });
      if (on || Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) raf = requestAnimationFrame(frame); else raf = 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    if (reduce || touch) { card.classList.add("is-static"); return; }
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      tx = x * 2 - 1; ty = y * 2 - 1; on = true;
      card.style.setProperty("--mx", x * 100 + "%"); card.style.setProperty("--my", y * 100 + "%"); kick();
    });
    card.addEventListener("pointerleave", function () { tx = 0; ty = 0; on = false; kick(); });
  });
  /* staggered caption reveal when the row scrolls into view */
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { threshold: 0.25 });
  document.querySelectorAll(".depth-cards").forEach(function (s) { io.observe(s); });
})();
