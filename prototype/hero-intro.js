/* Home hero intro controller (spec 05). All timing lives in hero-intro.css; this only decides
   WHETHER to play, waits for the two SVGs, and handles skip + replay. */
(function () {
  var root = document.querySelector("[data-intro]");
  if (!root) return;
  var KEY = "sz.intro";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var force = /[?&]intro=1\b/.test(location.search);
  var seen = false;
  try { seen = !!sessionStorage.getItem(KEY); } catch (e) {}
  var timer = null, skipEvents = ["pointerdown", "keydown", "wheel", "touchstart"];

  function finish() {
    clearTimeout(timer);
    skipEvents.forEach(function (t) { window.removeEventListener(t, skip, true); });
    root.classList.remove("is-playing", "is-wait");
    root.classList.add("is-final");
  }
  function skip() { finish(); }
  function play() {
    root.classList.remove("is-final", "is-wait");
    void root.offsetWidth;                                   // restart the CSS animations from 0
    root.classList.add("is-playing");
    skipEvents.forEach(function (t) { window.addEventListener(t, skip, { capture: true, passive: true, once: false }); });
    timer = setTimeout(finish, 5900 + 200);
    try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
  }
  function start() {
    var imgs = Array.prototype.slice.call(root.querySelectorAll("img"));
    root.classList.add("is-wait");
    var ready = Promise.all(imgs.map(function (i) { return i.decode ? i.decode().catch(function () {}) : Promise.resolve(); }));
    var cap = new Promise(function (r) { setTimeout(r, 2500); });
    Promise.race([ready, cap]).then(play);
  }

  if (reduce || (seen && !force)) { root.classList.add("is-final"); }
  else start();

  var btn = root.querySelector("[data-intro-replay]");
  if (btn) btn.addEventListener("click", function (e) { e.stopPropagation(); finish(); requestAnimationFrame(start); });
})();
