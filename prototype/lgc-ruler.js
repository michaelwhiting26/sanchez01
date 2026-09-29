/* Carousel cursor: over the horizontal "From the workshop" carousel the mouse pointer becomes a small ruler, 1 to 6 cm
   along a horizontal axis with a short vertical line on the left (the pointer itself). The current slide's number lights
   up and a bar fills the axis up to it, so the section reads as "move sideways". Mouse/trackpad only; touch is untouched. */
(function () {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var host = document.querySelector("[data-lgc]"); if (!host) return;
  var stage = host.parentElement;   /* the carousel re-renders its own box, so the ruler lives on the section around it */
  function itemCount() { try { return JSON.parse(host.getAttribute("data-items")).length || 6; } catch (e) { return 6; } }
  var NS = "http://www.w3.org/2000/svg", CM = 36, N = itemCount(), W = CM * N + 36, H = 54, AX = 38;   /* AX = axis y inside the svg */
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var wrap = document.createElement("div"); wrap.className = "lgc-ruler"; wrap.setAttribute("aria-hidden", "true");
  var svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("width", W); svg.setAttribute("height", H);
  function el(tag, a, p) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; }
  var fill = el("rect", { class: "lgc-ruler__fill", x: 1, y: AX - 2, height: 4, width: 0 });
  el("line", { class: "lgc-ruler__ink", x1: 1, y1: AX - 28, x2: 1, y2: AX + 10, "stroke-width": 2.2 });            /* the pointer */
  el("line", { class: "lgc-ruler__ink", x1: 1, y1: AX, x2: CM * N + 8, y2: AX, "stroke-width": 1 });           /* the axis */
  el("path", { class: "lgc-ruler__arrow", d: "M" + (CM * N + 8) + " " + (AX - 4) + " l6 4 -6 4" });
  var labels = [];
  for (var t = 1; t <= N * 4; t++) {                                                                             /* quarter-cm ticks */
    var x = 1 + t * CM / 4, major = t % 4 === 0, half = t % 2 === 0;
    el("line", { class: "lgc-ruler__ink", x1: x, y1: AX, x2: x, y2: AX - (major ? 11 : half ? 7 : 4), "stroke-width": major ? 1.2 : 0.8 });
    if (major) { var lb = el("text", { class: "lgc-ruler__num", x: x, y: AX - 16, "text-anchor": "middle" }); lb.textContent = t / 4; labels.push(lb); }
  }
  wrap.appendChild(svg); stage.appendChild(wrap);

  /* follow the pointer: the vertical line sits exactly on the hotspot */
  var tx = 0, ty = 0, cx = 0, cy = 0, on = false, raf = 0;
  function frame() {
    var k = reduce ? 1 : 0.55; cx += (tx - cx) * k; cy += (ty - cy) * k;
    wrap.style.transform = "translate3d(" + (cx - 1) + "px," + (cy - AX) + "px,0)";
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.2 ? requestAnimationFrame(frame) : 0;
  }
  host.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    var r = stage.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top;
    if (!on) { cx = tx; cy = ty; on = true; wrap.classList.add("is-on"); }
    if (!raf) raf = requestAnimationFrame(frame);
  });
  host.addEventListener("pointerleave", function () { on = false; wrap.classList.remove("is-on"); });
  host.addEventListener("pointerdown", function () { wrap.classList.add("is-down"); });
  addEventListener("pointerup", function () { wrap.classList.remove("is-down"); });

  /* current slide from the carousel's own "01/06" counter */
  function sync() {
    var c = host.querySelector(".tabular-nums"); if (!c) return;
    var m = /(\d+)\s*\/\s*(\d+)/.exec(c.textContent || ""); if (!m) return;
    var i = Math.max(1, Math.min(N, parseInt(m[1], 10)));
    labels.forEach(function (l, j) { l.classList.toggle("is-active", j === i - 1); });
    fill.setAttribute("width", i * CM);
  }
  new MutationObserver(sync).observe(host, { subtree: true, childList: true, characterData: true });
  sync();
})();
