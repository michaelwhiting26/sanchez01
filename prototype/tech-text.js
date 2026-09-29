/* Tech text (our own implementation of the effect): a solid wordmark that turns into dashed vector outlines inside a soft
   circle around the pointer; a frame glides to the active letter with a size label and blinking specks; letters can be
   dragged off the baseline and spring back; the reveal sweeps across on its own when the pointer is away. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var go = function () { document.querySelectorAll("[data-tech-text]").forEach(init); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();

  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  function init(root) {
    var TEXT = root.getAttribute("data-text") || "SANCHEZ", FS = 150, REACH = Number(root.getAttribute("data-reach") || 200);
    var color = root.getAttribute("data-color") || "#f3eadc", accent = root.getAttribute("data-accent") || "#c4553a";
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var uid = "tt" + Math.random().toString(36).slice(2, 7);
    var svg = el("svg", { class: "tech-text__svg", role: "img", "aria-label": TEXT }, root);
    var defs = el("defs", {}, svg);
    var grad = el("radialGradient", { id: uid + "g" }, defs);
    el("stop", { offset: "0", "stop-color": "#fff" }, grad); el("stop", { offset: "0.3", "stop-color": "#fff" }, grad); el("stop", { offset: "1", "stop-color": "#fff", "stop-opacity": "0" }, grad);
    var mFill = el("mask", { id: uid + "f", maskUnits: "userSpaceOnUse" }, defs), mLine = el("mask", { id: uid + "l", maskUnits: "userSpaceOnUse" }, defs);
    var bgF = el("rect", { fill: "#fff" }, mFill), holeF = el("circle", { r: REACH, fill: "url(#" + uid + "g)", style: "mix-blend-mode:normal" }, mFill);
    holeF.setAttribute("fill", "#000"); holeF.setAttribute("filter", "url(#" + uid + "b)");
    var blur = el("filter", { id: uid + "b", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs); el("feGaussianBlur", { stdDeviation: REACH * 0.25 }, blur);
    var holeL = el("circle", { r: REACH, fill: "#fff", filter: "url(#" + uid + "b)" }, mLine);
    var gFill = el("g", { mask: "url(#" + uid + "f)" }, svg), gLine = el("g", { mask: "url(#" + uid + "l)" }, svg);
    var frame = el("rect", { class: "tech-text__frame", fill: "none", stroke: accent, "stroke-width": 1.5, rx: 2 }, svg);
    var label = el("text", { class: "tech-text__label", fill: accent }, svg);
    var gSpecks = el("g", { fill: accent }, svg);

    /* letters: measure each, lay out with tight tracking */
    var measure = el("text", { class: "tech-text__glyph", "font-size": FS, style: "visibility:hidden" }, svg);
    var x = 0, letters = [];
    TEXT.split("").forEach(function (ch) {
      measure.textContent = ch; var w = measure.getComputedTextLength();
      letters.push({ ch: ch, x: x, w: w, dx: 0, dy: 0, vx: 0, vy: 0, drag: false });
      x += w + FS * -0.02;
    });
    measure.remove();
    var W = x, H = FS * 1.25, BASE = FS * 0.95, PAD = FS * 0.25;
    svg.setAttribute("viewBox", (-PAD) + " " + (-PAD) + " " + (W + 2 * PAD) + " " + (H + 2 * PAD));
    [bgF].forEach(function (r) { r.setAttribute("x", -PAD); r.setAttribute("y", -PAD); r.setAttribute("width", W + 2 * PAD); r.setAttribute("height", H + 2 * PAD); });
    letters.forEach(function (L) {
      L.fill = el("text", { class: "tech-text__glyph", x: L.x, y: BASE, "font-size": FS, fill: color }, gFill); L.fill.textContent = L.ch;
      L.line = el("text", { class: "tech-text__glyph", x: L.x, y: BASE, "font-size": FS, fill: "none", stroke: color, "stroke-width": 1.5, "stroke-dasharray": "4 2" }, gLine); L.line.textContent = L.ch;
    });

    /* specks */
    var specks = []; for (var i = 0; i < 15; i++) specks.push({ el: el("rect", { width: 4, height: 4, opacity: 0 }, gSpecks), t: Math.random() * 2 });

    /* pointer in SVG space */
    var pt = svg.createSVGPoint(), pointer = { x: -9999, y: -9999, in: false }, active = -1, fx = 0, fy = 0, fw = 0, fh = 0;
    function toSvg(e) { pt.x = e.clientX; pt.y = e.clientY; var p = pt.matrixTransform(svg.getScreenCTM().inverse()); return p; }
    var dragging = null, dragStart = null;
    svg.addEventListener("pointermove", function (e) {
      var p = toSvg(e); pointer.x = p.x; pointer.y = p.y; pointer.in = true;
      if (dragging) { dragging.dx = dragStart.dx + (p.x - dragStart.x); dragging.dy = dragStart.dy + (p.y - dragStart.y); }
    });
    svg.addEventListener("pointerleave", function () { pointer.in = false; });
    svg.addEventListener("pointerdown", function (e) {
      if (active < 0) return; var p = toSvg(e); dragging = letters[active]; dragging.drag = true;
      dragStart = { x: p.x, y: p.y, dx: dragging.dx, dy: dragging.dy }; svg.setPointerCapture(e.pointerId); root.classList.add("is-dragging");
    });
    function release() { if (dragging) { dragging.drag = false; dragging = null; root.classList.remove("is-dragging"); } }
    svg.addEventListener("pointerup", release); svg.addEventListener("pointercancel", release);

    var last = performance.now(), sweepT = 0;
    function tick(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      /* idle sweep */
      var px = pointer.x, py = pointer.y;
      if (!pointer.in && !reduce) { sweepT += dt * 0.35; var s = (Math.sin(sweepT * 2) + 1) / 2; px = -REACH + s * (W + 2 * REACH); py = BASE - FS * 0.35 + Math.sin(sweepT * 3.1) * FS * 0.15; }
      if (reduce && !pointer.in) { px = -9999; py = -9999; }
      holeF.setAttribute("cx", px); holeF.setAttribute("cy", py); holeL.setAttribute("cx", px); holeL.setAttribute("cy", py);
      /* active letter */
      var a = -1; letters.forEach(function (L, i) { var cx = L.x + L.dx; if (px >= cx && px <= cx + L.w && py > -PAD && py < H + PAD) a = i; });
      if (dragging) a = letters.indexOf(dragging);
      active = a;
      /* springs + positions */
      letters.forEach(function (L) {
        if (!L.drag) { var k = 180, d = 14; L.vx += (-k * L.dx - d * L.vx) * dt; L.vy += (-k * L.dy - d * L.vy) * dt; L.dx += L.vx * dt; L.dy += L.vy * dt; }
        var tr = "translate(" + L.dx.toFixed(2) + "," + L.dy.toFixed(2) + ")"; L.fill.setAttribute("transform", tr); L.line.setAttribute("transform", tr);
      });
      /* frame glides to the active letter */
      if (active >= 0) {
        var L = letters[active], bb = L.fill.getBBox(), CAP = FS * 0.7, tx = bb.x + L.dx - 6, ty = BASE - CAP + L.dy - 6, tw = bb.width + 12, th = CAP + 12, e = Math.min(1, dt * 14);
        fx += (tx - fx) * e; fy += (ty - fy) * e; fw += (tw - fw) * e; fh += (th - fh) * e;
        frame.setAttribute("x", fx); frame.setAttribute("y", fy); frame.setAttribute("width", Math.max(0, fw)); frame.setAttribute("height", Math.max(0, fh)); frame.style.opacity = 1;
        label.setAttribute("x", fx); label.setAttribute("y", fy - 10);
        label.textContent = L.drag || Math.abs(L.dx) + Math.abs(L.dy) > 2 ? L.ch + "  " + Math.round(L.dx) + ", " + Math.round(L.dy) : L.ch + "  " + Math.round(bb.width) + " × " + Math.round(CAP);
        label.style.opacity = 1;
        specks.forEach(function (sp, i) {
          sp.t -= dt; if (sp.t <= 0) { sp.t = 0.4 + Math.random() * 1.4; sp.el.setAttribute("x", fx - 20 + Math.random() * (fw + 40)); sp.el.setAttribute("y", fy - 20 + Math.random() * (fh + 40)); }
          sp.el.setAttribute("opacity", reduce ? 0 : (Math.sin(sp.t * 9) > 0 ? 0.9 : 0));
        });
      } else { frame.style.opacity = 0; label.style.opacity = 0; specks.forEach(function (sp) { sp.el.setAttribute("opacity", 0); }); }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
})();
