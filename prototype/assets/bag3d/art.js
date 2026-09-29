/* Procedural bag artwork for the configurator. Plain script (no build step), exposes window.SZ_ART.
   Both designs are drawn on a canvas that WRAPS horizontally, so the seam disappears where it meets around the bag.
   - "tiger": embroidered tiger-skin: satin-stitched gold/orange fur, navy / teal / red stripes with a gold cord outline, haunch spirals.
   - "hex":   fractal hexagon mosaic: each hexagon is a Sierpinski-style triangle tiling in a red / cyan / white / black / orange / blue palette.
   Deterministic (seeded), so the same design draws identically at any size (3D texture, 2D preview, preset chip).
   These are procedural recreations of two reference images, not the original artwork files. */
(function () {
  "use strict";
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function mk(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function hex2rgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function shade(h, f) { var c = hex2rgb(h); return "rgb(" + c.map(function (v) { return Math.max(0, Math.min(255, Math.round(v * f))); }).join(",") + ")"; }
  function pick(R, list) { var t = 0, i; for (i = 0; i < list.length; i++) t += list[i][1]; var x = R() * t; for (i = 0; i < list.length; i++) { x -= list[i][1]; if (x <= 0) return list[i][0]; } return list[0][0]; }

  /* ---------- TIGER ---------- */
  function tiger(w, h) {
    var c = mk(w, h), g = c.getContext("2d"), R = rng(7), S = w / 2048;
    var GOLD = "#e0ac48", ORANGE = "#d8631f", NAVY = "#16223f", TEAL = "#1e8f86", RED = "#a3231a", CREAM = "#f1e2c0";
    g.lineCap = "round";
    /* ground: warm satin fur (gold to orange), stitched in short strokes that follow a soft vertical flow */
    var grad = g.createLinearGradient(0, 0, w, h); grad.addColorStop(0, "#d9862a"); grad.addColorStop(.5, "#e0a23f"); grad.addColorStop(1, "#cf7522");
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    var i, n = Math.round(90000 * S * S);
    for (i = 0; i < n; i++) {
      var x = R() * w, y = R() * h, a = Math.PI / 2 + Math.sin(x * .004 + y * .002) * .55 + (R() - .5) * .25, L = (10 + R() * 16) * S;
      var t = R(); g.strokeStyle = t < .45 ? shade(GOLD, .82 + R() * .3) : t < .85 ? shade(ORANGE, .85 + R() * .35) : shade(CREAM, .78 + R() * .15);
      g.globalAlpha = .55; g.lineWidth = (1.4 + R() * 1.1) * S;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
    }
    g.globalAlpha = 1;

    /* a satin-stitched ribbon along a path: stitches run across the width, gold cord on both edges */
    function ribbon(P, widthAt, col, ox) {
      var m = P.length, left = [], right = [], k, j;
      for (k = 0; k < m; k++) {
        var p = P[k], q = P[Math.min(k + 1, m - 1)], o = P[Math.max(k - 1, 0)], dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, wd = widthAt(k / (m - 1)) / 2;
        left.push([p[0] + nx * wd + ox, p[1] + ny * wd]); right.push([p[0] - nx * wd + ox, p[1] - ny * wd]);
      }
      for (k = 0; k < m; k++) {
        for (j = 0; j < 2; j++) {
          var f = .9 + R() * .22 + (R() < .07 ? .3 : 0), a2 = (R() - .5) * .2, mx = (left[k][0] + right[k][0]) / 2, my = (left[k][1] + right[k][1]) / 2;
          var ax = left[k][0] - mx, ay = left[k][1] - my, cs = Math.cos(a2), sn = Math.sin(a2);
          g.strokeStyle = shade(col, f); g.lineWidth = 2.1 * S; g.beginPath();
          g.moveTo(mx + ax * cs - ay * sn, my + ax * sn + ay * cs); g.lineTo(mx - (ax * cs - ay * sn), my - (ax * sn + ay * cs)); g.stroke();
        }
      }
      g.strokeStyle = "rgba(240,200,102,.9)"; g.lineWidth = 1.6 * S;
      [left, right].forEach(function (E) { g.beginPath(); E.forEach(function (p, i2) { i2 ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.stroke(); });
    }
    function pathFlow(x0, y0, len, sway, ph) {
      var P = [], steps = Math.max(8, Math.round(len / (3 * S))), s;
      for (s = 0; s <= steps; s++) { var t = s / steps; P.push([x0 + Math.sin(t * 3.1 + ph) * sway * S + Math.sin(t * 7 + ph * 2) * sway * .12 * S, y0 + t * len]); }
      return P;
    }
    /* tiger stripes: vertical, swaying, tapered at both ends, drawn three times so the texture wraps */
    var cols = 46, ci, segs = [];
    for (ci = 0; ci < cols; ci++) {
      var bx = (ci + .5) * w / cols, yy = -R() * 220 * S;
      while (yy < h + 40 * S) {
        var len = (300 + R() * 420) * S, wid = (16 + R() * 26) * S, colr = pick(R, [[NAVY, 62], [RED, 16], [TEAL, 12], [CREAM, 3], [ORANGE, 7]]);
        segs.push({ P: pathFlow(bx + (R() - .5) * 26 * S, yy, len, 34 + R() * 40, R() * 6), wid: wid, col: colr });
        yy += len * .7 + (30 + R() * 110) * S;
      }
    }
    segs.forEach(function (sg) { [-w, 0, w].forEach(function (ox) { ribbon(sg.P, function (t) { return sg.wid * Math.pow(Math.sin(Math.PI * Math.min(1, t * .98 + .01)), .6); }, sg.col, ox); }); });

    /* haunch spirals: nested coloured spiral bands, like the swirl on the tiger's flank */
    function spiral(cx, cy, r0, turns, col, wid, ox) {
      var P = [], s2 = 160;
      for (var s = 0; s <= s2; s++) { var t = s / s2, th = t * turns * Math.PI * 2, r = r0 * (1 - t * .86); P.push([cx + Math.cos(th) * r, cy + Math.sin(th) * r]); }
      ribbon(P, function (t) { return wid * (1 - t * .55); }, col, ox);
    }
    [[.18, .34], [.6, .7]].forEach(function (p, idx) {
      var cx = p[0] * w, cy = p[1] * h, base = (110 + idx * 12) * S;
      [-w, 0, w].forEach(function (ox) {
        spiral(cx, cy, base * 1.0, 1.9, RED, 30 * S, ox);
        spiral(cx, cy, base * .8, 1.9, TEAL, 26 * S, ox);
        spiral(cx, cy, base * .55, 1.7, NAVY, 20 * S, ox);
      });
    });
    return c;
  }

  /* ---------- FRACTAL HEXAGONS ---------- */
  function hexmosaic(w, h) {
    var c = mk(w, h), g = c.getContext("2d"), R = rng(11), S = w / 2048;
    var PALS = [
      ["#e11d0c", "#ff3b1f", "#b30f0a", "#5a0d0a", "#ffffff"],   /* red */
      ["#12c4e6", "#7fe6f5", "#0a86c9", "#e8fbff", "#ffe66b"],   /* cyan */
      ["#dfe3f5", "#b7bde0", "#ffffff", "#7a5a55", "#8c1f1a"],   /* lavender / white */
      ["#050508", "#1a2233", "#c9d2e8", "#0a86c9", "#e11d0c"],   /* black */
      ["#ff9d1a", "#ffd23f", "#e11d0c", "#ffffff", "#0a86c9"],   /* orange / yellow */
      ["#0a6fd6", "#12c4e6", "#1b1f5a", "#ffffff", "#e11d0c"]    /* blue */
    ];
    g.fillStyle = "#0b0b18"; g.fillRect(0, 0, w, h);
    var cols = 8, r = w / (cols * Math.sqrt(3)), dx = Math.sqrt(3) * r, dy = 1.5 * r;
    function tri(a, b, cc, depth, pal) {
      g.fillStyle = pal[R() < .72 ? (R() * 3) | 0 : (R() * pal.length) | 0];
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(cc[0], cc[1]); g.closePath(); g.fill();
      if (depth <= 0) return;
      var ab = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], bc = [(b[0] + cc[0]) / 2, (b[1] + cc[1]) / 2], ca = [(cc[0] + a[0]) / 2, (cc[1] + a[1]) / 2];
      tri(a, ab, ca, depth - 1, pal); tri(ab, b, bc, depth - 1, pal); tri(ca, bc, cc, depth - 1, pal);
      if (R() < .4) tri(ab, bc, ca, depth - 1, pal);
    }
    var depth = S >= .75 ? 5 : S >= .3 ? 4 : 3, row, col;
    function cell(cx, cy, pal) {
      var V = [], k; for (k = 0; k < 6; k++) { var an = Math.PI / 180 * (60 * k - 30); V.push([cx + Math.cos(an) * r, cy + Math.sin(an) * r]); }
      for (k = 0; k < 6; k++) tri([cx, cy], V[k], V[(k + 1) % 6], depth, pal);
    }
    for (row = -1; row * dy < h + r; row++) for (col = 0; col < cols; col++) {
      var cx = col * dx + (row & 1 ? dx / 2 : 0) + dx / 2, cy = row * dy + r, pal = PALS[(R() * PALS.length) | 0];
      [-w, 0, w].forEach(function (ox) { if (cx + ox > -r && cx + ox < w + r) cell(cx + ox, cy, pal); });
    }
    /* fine speckle so it reads as rich, slightly noisy print */
    var n = Math.round(26000 * S * S), i;
    for (i = 0; i < n; i++) { g.fillStyle = R() < .5 ? "rgba(255,255,255,.28)" : "rgba(0,0,0,.28)"; g.fillRect(R() * w, R() * h, 1.4 * S + 1, 1.4 * S + 1); }
    return c;
  }

  /* ---------- debug: numbered grid to check the UV layout on the model ---------- */
  function uv(w, h) {
    var c = mk(w, h), g = c.getContext("2d"); g.fillStyle = "#223"; g.fillRect(0, 0, w, h);
    for (var i = 0; i <= 8; i++) { g.strokeStyle = "#fff"; g.lineWidth = 3; g.beginPath(); g.moveTo(i * w / 8, 0); g.lineTo(i * w / 8, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 8); g.lineTo(w, i * h / 8); g.stroke(); g.fillStyle = "#ff0"; g.font = "bold 48px sans-serif"; g.fillText(String(i), i * w / 8 + 8, 52); g.fillText(String(i), 8, i * h / 8 + 52); }
    return c;
  }

  /* ---------- FULL TIGER: one large artwork on the front, plain red back ---------- */
  function tigerfull(w, h) {
    var c = mk(w, h), g = c.getContext("2d");
    g.fillStyle = "#f7f7f2"; g.fillRect(0, 0, w, h);                       /* white half */
    g.fillStyle = "#b4402e"; g.fillRect(w / 4, 0, w / 2, h);               /* red half = the FRONT (u 0.25-0.75) */
    var im = new Image();
    im.onload = function () {
      var hw = w / 2, k = Math.max(hw / im.naturalWidth, h / im.naturalHeight), dw = im.naturalWidth * k, dh = im.naturalHeight * k;
      g.save(); g.beginPath(); g.rect(w / 4, 0, hw, h); g.clip();
      g.imageSmoothingQuality = "high";
      g.drawImage(im, w / 4 + (hw - dw) / 2, (h - dh) / 2, dw, dh);
      g.restore();
      if (c.__refresh) c.__refresh();
    };
    im.src = (document.currentScript && document.currentScript.src ? document.currentScript.src.replace(/art\.js.*$/, "") : "assets/bag3d/") + (window.SZ_TIGER_SRC || "tiger.png");
    return c;
  }

  /* ---------- PAINTED PORTRAIT (sample): artwork on the front, plain green back ("green for now") ---------- */
  function portraitfull(w, h) {
    var c = mk(w, h), g = c.getContext("2d");
    g.fillStyle = "#2d6a34"; g.fillRect(0, 0, w, h);                        /* green half = the BACK */
    var im = new Image();
    im.onload = function () {
      var hw = w / 2, k = Math.max(hw / im.naturalWidth, h / im.naturalHeight), dw = im.naturalWidth * k, dh = im.naturalHeight * k;
      g.save(); g.beginPath(); g.rect(w / 4, 0, hw, h); g.clip();            /* front = u 0.25-0.75 */
      g.imageSmoothingQuality = "high"; g.drawImage(im, w / 4 + (hw - dw) / 2, (h - dh) / 2, dw, dh); g.restore();
      if (c.__refresh) c.__refresh();
    };
    im.src = (document.currentScript && document.currentScript.src ? document.currentScript.src.replace(/art\.js.*$/, "") : "assets/bag3d/") + "portrait-sample.jpg";
    return c;
  }

  var KINDS = { tiger: { name: "Tiger embroidery", draw: tiger }, tigerfull: { name: "Tiger (full)", draw: tigerfull, fit: true }, portraitfull: { name: "Painted portrait (sample)", draw: portraitfull, fit: true }, hex: { name: "Fractal hexagons", draw: hexmosaic }, uv: { name: "UV test", draw: uv } };
  var cache = {};
  window.SZ_ART = {
    kinds: KINDS,
    name: function (k) { return KINDS[k] ? KINDS[k].name : ""; },
    canvas: function (k, w, h) { var key = k + ":" + w + "x" + h; return cache[key] || (cache[key] = KINDS[k].draw(w, h)); },
    url: function (k, w, h) { var key = "u:" + k + ":" + w; return cache[key] || (cache[key] = window.SZ_ART.canvas(k, w, h || (w / 2)).toDataURL("image/jpeg", 0.86)); }
  };
})();
