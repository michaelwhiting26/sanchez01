/* Curved text loop (our own implementation of the effect): text flows along an arc; drag to push it faster or reverse it. */
(function () {
  document.querySelectorAll("[data-curved-loop]").forEach(function (root) {
    var NS = "http://www.w3.org/2000/svg", text = (root.getAttribute("data-text") || "SANCHEZ ✦ ").replace(/ /g, " ");
    var STAR = "\u2726", GAP = "\u00a0\u00a0\u00a0\u00a0", pieces = text.split(STAR); text = pieces.join(GAP);   /* the star glyph is not in our font, so each phone draws it from a different fallback with a different width; a run of spaces in our own font is the same everywhere */
    var VW = (root.clientWidth || window.innerWidth) < 700 ? 640 : 1440;   /* the drawing is VW units wide and scaled to the screen: on a phone a narrower drawing keeps the letters big */
    var curve = Number(root.getAttribute("data-curve") || 400) * (VW < 1440 ? 0.6 : 1), speed = Number(root.getAttribute("data-speed") || 1.6);
    var id = "cl-" + Math.random().toString(36).slice(2, 8);
    var svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 " + VW + " " + (70 + curve / 2)); svg.setAttribute("class", "curved-loop__svg"); svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS(NS, "path"); path.setAttribute("id", id); path.setAttribute("d", "M-100,50 Q" + VW / 2 + "," + (50 + curve) + " " + (VW + 100) + ",50"); path.setAttribute("fill", "none");
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
    var SPRITE = root.getAttribute("data-star") || "assets/brand/sparkle-3d.png", FS = 64, SIZE = 60, stars = [], plen = 0;
    /* Placement is arithmetic, not browser queries: a star's distance along the curve = scroll offset + (repeat number x text width) + (width of the text
       before its gap) + half the gap, all measured once on the hidden straight copy of the text. */
    /* Luxury finish, all in SVG: (1) the red body is deepened to oxblood and given a thin champagne rim, (2) a soft warm shadow sits under each star,
       (3) a glint (a soft light band clipped to the star's own shape) sweeps across it as it travels. The PNG itself is untouched. */
    function svgEl(name, attrs, parent) { var e = document.createElementNS(NS, name); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
    var FX = id + "-fx", MASK = id + "-mask", GLINT = id + "-glint";
    (function () {
      var f = svgEl("filter", { id: FX, x: "-30%", y: "-30%", width: "160%", height: "175%", "color-interpolation-filters": "sRGB" }, defs);
      svgEl("feColorMatrix", { in: "SourceGraphic", type: "matrix", values: "0.80 0 0 0 0  0 0.50 0 0 0  0 0 0.56 0 0  0 0 0 1 0", result: "body" }, f);               /* brick red -> oxblood, shading kept */
      svgEl("feMorphology", { in: "SourceAlpha", operator: "erode", radius: "1.1", result: "core" }, f);
      svgEl("feComposite", { in: "SourceAlpha", in2: "core", operator: "out", result: "edge" }, f);
      svgEl("feFlood", { "flood-color": "#e4c9ab", "flood-opacity": "0.95", result: "champ" }, f);
      svgEl("feComposite", { in: "champ", in2: "edge", operator: "in", result: "rim" }, f);                                                                              /* champagne rim */
      svgEl("feGaussianBlur", { in: "SourceAlpha", stdDeviation: "3", result: "blur" }, f);
      svgEl("feOffset", { in: "blur", dx: "0", dy: "4", result: "off" }, f);
      svgEl("feFlood", { "flood-color": "#1a0a02", "flood-opacity": "0.6", result: "shc" }, f);
      svgEl("feComposite", { in: "shc", in2: "off", operator: "in", result: "shadow" }, f);                                                                              /* warm soft shadow */
      var m = svgEl("feMerge", {}, f); ["shadow", "body", "rim"].forEach(function (r) { svgEl("feMergeNode", { in: r }, m); });
      var mk = svgEl("mask", { id: MASK, maskUnits: "userSpaceOnUse", x: "0", y: "0", width: SIZE, height: SIZE, style: "mask-type:alpha" }, defs);
      svgEl("image", { href: SPRITE, width: SIZE, height: SIZE }, mk);                                                                                                       /* the star's own silhouette */
      var g = svgEl("linearGradient", { id: GLINT, x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
      svgEl("stop", { offset: "0", "stop-color": "#fff3d6", "stop-opacity": "0" }, g); svgEl("stop", { offset: "0.5", "stop-color": "#fff3d6", "stop-opacity": "0.7" }, g); svgEl("stop", { offset: "1", "stop-color": "#fff3d6", "stop-opacity": "0" }, g);
    })();
    function build(n) {
      while (tp.firstChild) tp.removeChild(tp.firstChild);
      stars.forEach(function (st) { if (st.img.parentNode) st.img.parentNode.removeChild(st.img); }); stars = [];
      for (var k = 0; k < n; k++) {
        var at = 0;
        pieces.forEach(function (piece, i) {
          if (piece) { tp.appendChild(document.createTextNode(piece)); at += piece.length; }
          if (i < pieces.length - 1) {
            tp.appendChild(document.createTextNode(GAP));
            var before = at ? measure.getSubStringLength(0, at) : 0, adv = measure.getSubStringLength(at, GAP.length);
            var img = svgEl("g", {}); img.style.pointerEvents = "none"; img.style.display = "none";
            svgEl("image", { href: SPRITE, width: SIZE, height: SIZE, filter: "url(#" + FX + ")" }, img);
            var clip = svgEl("g", { mask: "url(#" + MASK + ")" }, img), glint = svgEl("rect", { x: "-30", y: "-6", width: "24", height: SIZE + 12, fill: "url(#" + GLINT + ")", transform: "rotate(18 30 30)" }, clip);
            svg.appendChild(img); stars.push({ d0: k * spacing + before + adv / 2, img: img, glint: glint }); at += GAP.length;
          }
        });
      }
      plen = path.getTotalLength();
    }
    function place() {
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i], d = offset + st.d0;
        if (d < 0 || d > plen) { st.img.style.display = "none"; continue; }
        var p0 = path.getPointAtLength(d), pa = path.getPointAtLength(Math.max(0, d - 2)), pb = path.getPointAtLength(Math.min(plen, d + 2));
        var rot = Math.atan2(pb.y - pa.y, pb.x - pa.x), c = Math.cos(rot), sn = Math.sin(rot), up = 0.34 * FS;   /* centre of the glyph: a third of an em above the baseline */
        var cx = p0.x + up * sn, cy = p0.y - up * c;
        if (cx < -80 || cx > VW + 80) { st.img.style.display = "none"; continue; }
        var sx = 1 - 0.10 * Math.abs(Math.sin(rot * 1.6)), wob = 3 * Math.sin(cx / 150 + i);           /* turns a little like a metal object as it rides the curve */
        st.img.setAttribute("transform", "translate(" + cx.toFixed(1) + " " + cy.toFixed(1) + ") rotate(" + (rot * 180 / Math.PI + wob).toFixed(2) + ") scale(" + sx.toFixed(3) + " 1) translate(" + (-SIZE / 2) + " " + (-SIZE / 2) + ")"); st.img.style.display = "";
        var gp = (cx / 520 + i * 0.37) % 1; st.glint.setAttribute("x", (-30 + 96 * (gp < 0 ? gp + 1 : gp)).toFixed(1));            /* the glint sweeps across the star once every ~520px of travel */
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
    root.addEventListener("pointermove", function (e) { if (!drag) return; var dx = e.clientX - lastX; lastX = e.clientX; offset += dx * (VW / root.clientWidth); vel = dx; wrap(); tp.setAttribute("startOffset", offset + "px"); place(); });
    function end() { if (!drag) return; drag = false; if (Math.abs(vel) > 0.5) dir = vel > 0 ? 1 : -1; }
    root.addEventListener("pointerup", end); root.addEventListener("pointercancel", end);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setup); else setup();
  });
})();
