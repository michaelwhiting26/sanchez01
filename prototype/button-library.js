/* Button library: 34 CSS button pens from CodePen (the list in webdeasy.de's "beautiful CSS buttons" article; per that article the pens are MIT-licensed,
   see https://blog.codepen.io/documentation/licensing/). Each is a live sandboxed frame that only loads when it is scrolled near, with the author credited.
   Pen #5 (Blobs button, by Hilary / hilwat) is shown separately above. To add or drop one, edit the list. */
(function () {
  var box = document.querySelector("[data-btn-library]"); if (!box) return;
  var L = [
    [1, "Hover Glow Effect", "twhite96/rggjXp", "Kocsten", "kocsten"], [2, "Rounded Button", "twhite96/zBZwOP", "alticreation", "alticreation"], [3, "3D Touch", "twhite96/ojhCp", "jemware", "jemware"],
    [4, "Icon buttons", "twhite96/KLbwJw", "Andrea Maselli", "andrea-maselli"], [6, "Thin Buttons", "twhite96/oRRjPP", "Natalia Reshetnikova", "natalia-reshetnikova"], [7, "Bootstrap Buttons", "twhite96/wbZXYR", "dew31794", "dew31794"],
    [8, "Rounded Pulse Button", "twhite96/NVJzQW", "Raj Kamal", "avvign"], [9, "CSS Fizzy Button", "twhite96/XwGENz", "Jürgen Leister", "webLeister"], [10, "Button N° 045", "twhite96/xNBExN", "Vitor Siqueira", "vitor-siqueira"],
    [11, "Flush button", "twhite96/joXzOw", "AbhishekBaiju", "abhishekbaiju"], [12, "Button Concept", "twhite96/Bevpxd", "Shyam", "Shtam3x"], [13, "Sliced Button", "twhite96/NpwdGv", "Sarah", "saraharaya"],
    [14, "More fancy Icon buttons", "twhite96/WoJGRK", "Ishaan Saxena", "ishaansaxena"], [15, "Button Change", "twhite96/WEXwMO", "thelaazyguy", "thelaazyguy"], [16, "Simple Button", "twhite96/YgJGMX", "Tiberiu Raducea", "tyberiu88"],
    [17, "Button Flip", "twhite96/NBwNZa", "Alex Moore", "MoorLex"], [18, "Swipe Right Button", "twhite96/brryVq", "thelaazyguy", "thelaazyguy"], [19, "Fancy Buttons", "twhite96/ZMxQJp", "Alexandre do Vale", "alexandrevale"],
    [20, "FlipCover Buttons", "twhite96/Areng", "Velina V Veleva", "vveleva"], [21, "Collection of Button Hover Effects", "davidicus/emgQKJ", "David Conner", "davidicus"], [22, "Animated Border & Glow", "AnthonyBmm/poooJmO", "Anthony", "AnthonyBmm"],
    [23, "CSS Button Hover", "folaad/YvmRpz", "Imran Pardes", "folaad"], [24, "Still in View", "Alexb98/XWrqpxB", "Alex Bodin", "Alexb98"], [25, "Pure CSS Button with Ring Indicator", "mccombsc/ZEzxWPy", "Cole McCombs", "mccombsc"],
    [26, "Button Hover Effects", "kjbrum/wBBLXx", "Kyle Brumm", "kjbrum"], [27, "Gooey Menu", "lbebber/LELBEo", "Luca Bebber", "lbebber"], [28, "SVG CSS3 Menu/Burger Button", "kylehenwood/Alayb", "Kyle Henwood", "kylehenwood"],
    [29, "Button bubble effect", "Grsmto/RPQPPB", "Adrien Grsmto", "Grsmto"], [30, "Animation Submit Button", "valentingalmand/MYMZZK", "Valentin Galmand", "valentingalmand"], [31, "Who doesn’t like Fun Buttons?", "derekmorash/XddZJY", "Derek Morash", "derekmorash"],
    [32, "Flipside", "hakimel/ZYRgwB", "Hakim El Hattab", "hakimel"], [33, "Squishy Toggle Buttons", "soulwire/bKens", "Justin Windle", "soulwire"], [34, "CSS Button Animation", "sashatran/KaLqKR", "Sasha", "sashatran"],
    [35, "Submit Button (Anime.js)", "andrewmillen/MoKLob", "Andrew Millen", "andrewmillen"]
  ];
  var grid = box.querySelector(".btn-library__grid"), io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { var f = e.target; f.src = f.getAttribute("data-src"); io.unobserve(f); } });
  }, { rootMargin: "500px 0px" }) : null;
  L.forEach(function (b) {
    var card = document.createElement("figure"); card.className = "btn-library__card";
    var f = document.createElement("iframe"); f.className = "btn-library__frame"; f.title = b[1] + " (CodePen by " + b[3] + ")"; f.loading = "lazy"; f.referrerPolicy = "strict-origin-when-cross-origin";
    f.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups"); f.setAttribute("data-src", "https://codepen.io/" + b[2].split("/")[0] + "/embed/" + b[2].split("/")[1] + "?height=260&default-tab=result&embed-version=2");
    var cap = document.createElement("figcaption"); cap.innerHTML = '<span class="btn-library__n">#' + b[0] + "</span> " + b[1].replace(/&/g, "&amp;") + ' <span class="btn-library__by">by <a href="https://codepen.io/' + b[4] + '" target="_blank" rel="noopener noreferrer">' + b[3] + "</a></span>";
    card.appendChild(f); card.appendChild(cap); grid.appendChild(card);
    if (io) io.observe(f); else f.src = f.getAttribute("data-src");
  });
})();
