/* Curved text loop (our own implementation of the effect): text flows along an arc; drag to push it faster or reverse it. */
(function () {
  document.querySelectorAll("[data-curved-loop]").forEach(function (root) {
    var NS = "http://www.w3.org/2000/svg", text = (root.getAttribute("data-text") || "SANCHEZ ✦ ").replace(/ /g, " ");
    var curve = Number(root.getAttribute("data-curve") || 400), speed = Number(root.getAttribute("data-speed") || 1.6);
    var id = "cl-" + Math.random().toString(36).slice(2, 8);
    var svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 1440 " + (70 + curve / 2)); svg.setAttribute("class", "curved-loop__svg"); svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS(NS, "path"); path.setAttribute("id", id); path.setAttribute("d", "M-100,50 Q720," + (50 + curve) + " 1540,50"); path.setAttribute("fill", "none");
    var measure = document.createElementNS(NS, "text"); measure.setAttribute("class", "curved-loop__text"); measure.style.visibility = "hidden"; measure.textContent = text;
    var t = document.createElementNS(NS, "text"); t.setAttribute("class", "curved-loop__text");
    var tp = document.createElementNS(NS, "textPath"); tp.setAttribute("href", "#" + id);
    var defs = document.createElementNS(NS, "defs"); defs.appendChild(path);
    svg.appendChild(measure); svg.appendChild(defs); t.appendChild(tp); svg.appendChild(t); root.appendChild(svg);
    root.setAttribute("aria-label", root.getAttribute("data-text") || "Sanchez");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var spacing = 0, offset = 0, dir = -1, vel = 0, drag = false, lastX = 0;
    function setup() {
      spacing = measure.getComputedTextLength(); if (!spacing) return requestAnimationFrame(setup);
      var len = path.getTotalLength(), n = Math.ceil(len / spacing) + 2;
      tp.textContent = new Array(n + 1).join(text); offset = -spacing; tp.setAttribute("startOffset", offset + "px");
      if (!reduce) requestAnimationFrame(step);
    }
    function wrap() { if (offset <= -spacing) offset += spacing; if (offset > 0) offset -= spacing; }
    var last = performance.now();
    function step(now) {
      var dt = Math.min(0.05, (now - last) / 1000) * 60; last = now;
      if (!drag) offset += dir * speed * dt;
      wrap(); tp.setAttribute("startOffset", offset + "px"); requestAnimationFrame(step);
    }
    root.addEventListener("pointerdown", function (e) { drag = true; lastX = e.clientX; vel = 0; root.setPointerCapture(e.pointerId); });
    root.addEventListener("pointermove", function (e) { if (!drag) return; var dx = e.clientX - lastX; lastX = e.clientX; offset += dx * (1440 / root.clientWidth); vel = dx; wrap(); tp.setAttribute("startOffset", offset + "px"); });
    function end() { if (!drag) return; drag = false; if (Math.abs(vel) > 0.5) dir = vel > 0 ? 1 : -1; }
    root.addEventListener("pointerup", end); root.addEventListener("pointercancel", end);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setup); else setup();
  });
})();
