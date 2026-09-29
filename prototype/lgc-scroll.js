/* Workshop carousel driven by page scroll. The section sits in a tall "track" and is pinned (CSS sticky) while you scroll
   through it; the further you scroll, the further the carousel moves sideways, slide 1 to 6. Scroll up and it runs back the
   other way. Before the track the page scrolls down normally into it, and after slide 6 the page carries on down out of it.
   The carousel itself is unchanged: this script only presses its own Arrow keys to step it, and reads its "01/06" counter to
   see where it is. A real drag / tap / key press on the carousel takes over until the next scroll. */
(function () {
  var track = document.querySelector("[data-lgc-track]"); if (!track) return;
  var host = track.querySelector("[data-lgc]"), pin = track.querySelector(".lgc-section"); if (!host || !pin) return;
  var GAP = 140;                                       /* ms between key presses while catching up (pressing again mid-move is harmless) */
  var REACH = 0.85;                                    /* the last slide is reached at 85% of the track; the rest is a short hold before the page carries on */
  var hold = false, lastPress = 0, live = false;

  function total() { var m = /\/\s*(\d+)/.exec((host.querySelector(".tabular-nums") || {}).textContent || ""); return m ? parseInt(m[1], 10) : 0; }
  function current() { var m = /(\d+)\s*\//.exec((host.querySelector(".tabular-nums") || {}).textContent || ""); return m ? parseInt(m[1], 10) - 1 : -1; }
  function press(dir) {                                /* the carousel listens for these on its own root element */
    var t = host.firstElementChild; if (!t) return;
    t.dispatchEvent(new KeyboardEvent("keydown", { key: dir > 0 ? "ArrowRight" : "ArrowLeft", bubbles: true, cancelable: true }));
  }
  function progress() {
    var head = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64;
    var travel = track.offsetHeight - pin.offsetHeight; if (travel <= 0) return 0;
    return Math.max(0, Math.min(1, (head - track.getBoundingClientRect().top) / travel));
  }

  function tick(now) {
    if (!live) return;
    var n = total(), cur = current();
    if (n > 1 && track.__steps !== n) { track.__steps = n; track.style.setProperty("--lgc-steps", n - 1); }   /* track length follows the slide count */
    if (n > 1 && cur >= 0 && !hold) {
      var want = Math.min(n - 1, Math.round(Math.min(1, progress() / REACH) * (n - 1)));
      if (want !== cur && now - lastPress > GAP) { press(want > cur ? 1 : -1); lastPress = now; }
    }
    requestAnimationFrame(tick);
  }
  /* run only while the track is on screen */
  new IntersectionObserver(function (e) {
    var on = e[0].isIntersecting; if (on && !live) { live = true; requestAnimationFrame(tick); } else if (!on) live = false;
  }, { rootMargin: "20% 0px 20% 0px" }).observe(track);

  /* a real interaction on the carousel wins until the page is scrolled again */
  ["pointerdown", "keydown"].forEach(function (ev) { host.addEventListener(ev, function (e) { if (e.isTrusted) hold = true; }, true); });
  addEventListener("scroll", function () { hold = false; }, { passive: true });
})();
