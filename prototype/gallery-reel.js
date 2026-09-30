/* The gallery as one continuous film. "Play the film" opens a full-screen player that runs the six items in order like a single movie:
   photos hold for a few seconds (with a slow push-in), videos play to their end, and every join is an animated transition (a cross-dissolve,
   a push, an amber light-leak flash, in turn). Tap right/left (or arrow keys) to skip, Esc or the close button to leave. The items are read
   from the carousel's own data-items, so the reel and the carousel can never disagree. */
(function () {
  var host = document.querySelector("[data-lgc]"); if (!host) return;
  var items = []; try { items = JSON.parse(host.getAttribute("data-items") || "[]"); } catch (e) { items = []; }
  if (!items.length) return;
  var PHOTO_MS = 4500, XFADE = 850;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };

  /* the button, placed on the pinned gallery */
  var btn = document.createElement("button");
  btn.type = "button"; btn.className = "reel-play"; btn.setAttribute("aria-label", "Play the workshop film");
  btn.innerHTML = '<span class="reel-play__icon" aria-hidden="true">▶</span><span>Play the film</span>';
  (document.querySelector(".lgc-section") || host.parentNode).appendChild(btn);

  var root, stage, titleEl, countEl, bars, flash, idx = -1, timer = 0, raf = 0, startAt = 0, cur = null, open = false, token = 0;

  function build() {
    root = document.createElement("div"); root.className = "reel"; root.setAttribute("role", "dialog"); root.setAttribute("aria-label", "The workshop film");
    root.innerHTML =
      '<div class="reel__stage"></div><div class="reel__flash"></div><div class="reel__film reel__film--t"></div><div class="reel__film reel__film--b"></div>' +
      '<div class="reel__title"></div><div class="reel__count"></div><div class="reel__bars"></div>' +
      '<button type="button" class="reel__close" aria-label="Close the film">Close</button><div class="reel__tap reel__tap--l"></div><div class="reel__tap reel__tap--r"></div>';
    document.body.appendChild(root);
    stage = root.querySelector(".reel__stage"); flash = root.querySelector(".reel__flash");
    titleEl = root.querySelector(".reel__title"); countEl = root.querySelector(".reel__count"); bars = root.querySelector(".reel__bars");
    items.forEach(function () { var b = document.createElement("i"); b.innerHTML = "<b></b>"; bars.appendChild(b); });
    root.querySelector(".reel__close").addEventListener("click", close);
    root.querySelector(".reel__tap--l").addEventListener("click", function () { go(idx - 1, true); });
    root.querySelector(".reel__tap--r").addEventListener("click", function () { go(idx + 1, true); });
  }

  function mediaFor(item, my) {
    var layer = document.createElement("div"); layer.className = "reel__layer";
    if (item.video) {
      var v = document.createElement("video");
      v.muted = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "auto"; v.poster = item.src || ""; v.src = item.video;
      layer.appendChild(v); layer._video = v;
    } else {
      var im = document.createElement("img"); im.alt = ""; im.src = item.src; layer.appendChild(im); layer._img = im;
    }
    return layer;
  }

  function transition(next, prev, n) {
    var kind = n % 3;                                               /* dissolve, push, light-leak */
    var ease = "cubic-bezier(.4,0,.2,1)";
    var dur = reduced ? 1 : XFADE;
    if (!prev) { next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduced ? 1 : 900, easing: "ease-out", fill: "both" }); return; }
    if (kind === 0 || reduced) {
      next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, easing: ease, fill: "both" });
      prev.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur, easing: ease, fill: "both" });
    } else if (kind === 1) {
      next.animate([{ opacity: 0, transform: "translateX(9%) scale(1.04)", filter: "blur(6px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }], { duration: dur, easing: ease, fill: "both" });
      prev.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(-9%) scale(.97)", filter: "blur(5px)" }], { duration: dur, easing: ease, fill: "both" });
    } else {
      next.animate([{ opacity: 0 }, { opacity: 0, offset: .45 }, { opacity: 1 }], { duration: dur + 150, easing: ease, fill: "both" });
      prev.animate([{ opacity: 1 }, { opacity: 0, offset: .5 }, { opacity: 0 }], { duration: dur + 150, easing: ease, fill: "both" });
      flash.animate([{ opacity: 0 }, { opacity: .85, offset: .42 }, { opacity: 0 }], { duration: dur + 250, easing: "ease-in-out" });
    }
    root.querySelector(".reel__film--t").animate([{ backgroundPositionX: "0" }, { backgroundPositionX: "-260px" }], { duration: dur + 200, easing: ease });
  }

  function go(i, manual) {
    if (!open) return;
    if (i < 0) i = 0;
    if (i >= items.length) { finish(); return; }
    var my = ++token, item = items[i], prev = cur;
    idx = i; clearTimeout(timer); cancelAnimationFrame(raf);
    var layer = mediaFor(item, my); stage.appendChild(layer); cur = layer;
    transition(layer, prev, i);
    if (prev) setTimeout(function () { if (prev.parentNode) { if (prev._video) prev._video.pause(); prev.remove(); } }, XFADE + 400);
    titleEl.classList.remove("is-on"); void titleEl.offsetWidth;
    titleEl.innerHTML = "<span>" + pad(i + 1) + "</span>" + (item.title || ""); titleEl.classList.add("is-on");
    countEl.textContent = pad(i + 1) + " / " + pad(items.length);
    Array.prototype.forEach.call(bars.children, function (b, k) { b.firstChild.style.transform = "scaleX(" + (k < i ? 1 : 0) + ")"; });
    startAt = performance.now();
    var bar = bars.children[i].firstChild, advance = function () { if (token === my) go(i + 1); };
    if (layer._video) {
      var v = layer._video, dur = 0;
      var arm = function () {                                       /* a video plays for its own length */
        dur = v.duration && isFinite(v.duration) ? v.duration : 8;
        if (!reduced) v.parentNode.animate([{ transform: "scale(1)" }, { transform: "scale(1.035)" }], { duration: dur * 1000, easing: "linear", fill: "both" });
        clearTimeout(timer); timer = setTimeout(advance, dur * 1000 + 3000);   /* safety net if 'ended' never fires */
      };
      v.addEventListener("loadedmetadata", arm, { once: true });
      v.addEventListener("ended", advance, { once: true });
      v.addEventListener("error", function () { timer = setTimeout(advance, PHOTO_MS); }, { once: true });
      var p = v.play(); if (p && p.catch) p.catch(function () { timer = setTimeout(advance, PHOTO_MS); });
      var tick = function () { if (token !== my) return; bar.style.transform = "scaleX(" + (dur ? Math.min(1, v.currentTime / dur) : 0) + ")"; raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    } else {
      if (!reduced) layer.firstChild.animate([{ transform: "scale(1.02) translate(0,0)" }, { transform: "scale(1.11) translate(" + (i % 2 ? "-" : "") + "2.2%, -1.6%)" }], { duration: PHOTO_MS + XFADE, easing: "linear", fill: "both" });
      timer = setTimeout(advance, PHOTO_MS);                         /* a still holds for a few seconds */
      var tickP = function () { if (token !== my) return; bar.style.transform = "scaleX(" + Math.min(1, (performance.now() - startAt) / PHOTO_MS) + ")"; raf = requestAnimationFrame(tickP); };
      raf = requestAnimationFrame(tickP);
    }
  }

  function key(e) { if (e.key === "Escape") close(); else if (e.key === "ArrowRight") go(idx + 1, true); else if (e.key === "ArrowLeft") go(idx - 1, true); }
  function start() {
    if (open) return; if (!root) build();
    open = true; document.documentElement.classList.add("reel-open"); root.classList.add("is-open");
    stage.innerHTML = ""; cur = null; idx = -1; addEventListener("keydown", key);
    go(0);
  }
  function finish() { close(); }
  function close() {
    if (!open) return; open = false; token++; clearTimeout(timer); cancelAnimationFrame(raf); removeEventListener("keydown", key);
    root.classList.remove("is-open"); document.documentElement.classList.remove("reel-open");
    setTimeout(function () { if (!open) stage.innerHTML = ""; }, 500); btn.focus({ preventScroll: true });
  }
  btn.addEventListener("click", start);
})();
