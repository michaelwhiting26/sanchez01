/* Scroll portal (our own implementation of the effect): a pinned stage of nested frames set back in depth;
   scrolling flies the camera forward through each frame into the next scene. Reduced motion shows the scenes stacked flat. */
(function () {
  var root = document.querySelector("[data-scroll-portal]"); if (!root) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stage = root.querySelector(".portal__stage"), frames = [].slice.call(root.querySelectorAll(".portal__frame"));
  var N = frames.length;
  if (reduce) { root.classList.add("is-flat"); return; }
  root.style.setProperty("--scenes", N);
  var D = 900, cur = 0, target = 0;
  function depth() { return innerWidth < 768 ? 620 : 900; }
  function measure() {
    var r = root.getBoundingClientRect(), total = root.offsetHeight - innerHeight;
    target = Math.min(1, Math.max(0, -r.top / Math.max(1, total))) * (N - 1);
  }
  var vis = true; new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }, { rootMargin: "150px" }).observe(root);
  function frame() {
    if (!vis) { requestAnimationFrame(frame); return; }   /* off screen: idle */
    measure(); D = depth();
    cur += (target - cur) * 0.12;
    stage.style.transform = "translate3d(0,0," + (cur * D) + "px)";
    frames.forEach(function (f, i) {
      var dz = i - cur;                                   /* how far this frame is in front of (<0) or behind (>0) the camera */
      var op = dz < -0.35 ? 0 : dz < 0 ? (dz + 0.35) / 0.35 : Math.max(0, 1 - dz * 0.28);
      f.style.opacity = op.toFixed(3);
      f.style.setProperty("--dim", Math.min(0.75, Math.max(0, dz) * 0.55).toFixed(3));
      f.classList.toggle("is-active", Math.abs(dz) < 0.45);
    });
    requestAnimationFrame(frame);
  }
  frames.forEach(function (f, i) { f.style.transform = "translate3d(-50%,-50%," + (-i * D) + "px)"; });
  addEventListener("resize", function () { D = depth(); frames.forEach(function (f, i) { f.style.transform = "translate3d(-50%,-50%," + (-i * D) + "px)"; }); });
  requestAnimationFrame(frame);
})();
