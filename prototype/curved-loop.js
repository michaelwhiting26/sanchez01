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
    /* The stars: the text keeps a (transparent) star character so spacing and scrolling are unchanged, and the red 3D sparkle sprite is laid over each one,
       following the curve and its tilt. */
    var STAR = "\u2726", SPRITE = root.getAttribute("data-star") || "assets/brand/sparkle-3d.png", FS = 64, SIZE = 60, stars = [];
    function build(n) {
      while (tp.firstChild) tp.removeChild(tp.firstChild);
      stars.forEach(function (st) { if (st.img.parentNode) st.img.parentNode.removeChild(st.img); }); stars = [];
      var idx = 0;
      for (var k = 0; k < n; k++) text.split(STAR).forEach(function (piece, i, arr) {
        if (piece) { tp.appendChild(document.createTextNode(piece)); idx += piece.length; }
        if (i < arr.length - 1) {
          var ts = document.createElementNS(NS, "tspan"); ts.setAttribute("fill-opacity", "0"); ts.textContent = STAR; tp.appendChild(ts);
          var img = document.createElementNS(NS, "image"); img.setAttribute("href", SPRITE); img.setAttribute("width", SIZE); img.setAttribute("height", SIZE); img.style.pointerEvents = "none"; img.style.display = "none";
          img.addEventListener("error", (function (tsp, im) { return function () { tsp.setAttribute("fill-opacity", "1"); im.remove(); }; })(ts, img));
          svg.appendChild(img); stars.push({ idx: idx, img: img }); idx += 1;
        }
      });
    }
    function place() {
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        try {
          var sp = tp.getStartPositionOfChar(st.idx), rot = tp.getRotationOfChar(st.idx), adv = tp.getSubStringLength(st.idx, 1);
          if (sp.x < -80 || sp.x > 1520) { st.img.style.display = "none"; continue; }
          var r = rot * Math.PI / 180, dx = adv / 2, dy = -0.34 * FS;                       /* centre of the glyph: half its advance along the baseline, a third of an em above it */
          var cx = sp.x + dx * Math.cos(r) - dy * Math.sin(r), cy = sp.y + dx * Math.sin(r) + dy * Math.cos(r);
          st.img.setAttribute("transform", "translate(" + cx.toFixed(1) + " " + cy.toFixed(1) + ") rotate(" + rot.toFixed(2) + ") translate(" + (-SIZE / 2) + " " + (-SIZE / 2) + ")"); st.img.style.display = "";
        } catch (e) { st.img.style.display = "none"; }
      }
    }
    function setup() {
      spacing = measure.getComputedTextLength(); if (!spacing) return requestAnimationFrame(setup);
      var len = path.getTotalLength(), n = Math.ceil(len / spacing) + 2;
      build(n); offset = -spacing; tp.setAttribute("startOffset", offset + "px"); place();
      if (!reduce) requestAnimationFrame(step);
    }
    function wrap() { if (offset <= -spacing) offset += spacing; if (offset > 0) offset -= spacing; }
    var last = performance.now();
    var vis = true; new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }, { rootMargin: "150px" }).observe(root);
    function step(now) {
      if (!vis) { last = now; requestAnimationFrame(step); return; }   /* off screen: idle */
      var dt = Math.min(0.05, (now - last) / 1000) * 60; last = now;
      if (!drag) offset += dir * speed * dt;
      wrap(); tp.setAttribute("startOffset", offset + "px"); place(); requestAnimationFrame(step);
    }
    root.addEventListener("pointerdown", function (e) { drag = true; lastX = e.clientX; vel = 0; root.setPointerCapture(e.pointerId); });
    root.addEventListener("pointermove", function (e) { if (!drag) return; var dx = e.clientX - lastX; lastX = e.clientX; offset += dx * (1440 / root.clientWidth); vel = dx; wrap(); tp.setAttribute("startOffset", offset + "px"); place(); });
    function end() { if (!drag) return; drag = false; if (Math.abs(vel) > 0.5) dir = vel > 0 ? 1 : -1; }
    root.addEventListener("pointerup", end); root.addEventListener("pointercancel", end);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setup); else setup();
  });
})();
