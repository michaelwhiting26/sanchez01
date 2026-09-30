/* Rise panel: after the footer, a contact panel rises up over a pinned stage as you scroll, PAUSES part-way up (the shaped top edge lingers), and
   needs a little more scrolling to finish rising. Ported from the mr-2 "Section 3" reveal: same three-phase easing. Desktop + motion only;
   on phones and with reduced motion it is a plain block in the page. The page scroll itself is never hijacked: the section is just tall, and the
   panel's position is a pure function of scroll. */
(function () {
  var root = document.querySelector("[data-rise]");
  if (!root) return;
  var card = root.querySelector(".rise__card");
  var mq = matchMedia("(min-width: 761px) and (prefers-reduced-motion: no-preference)");
  var vh = 0, top = 0, reveal = 0, ticking = false;

  var smooth = function (x) { return x * x * (3 - 2 * x); };
  /* early rise -> eased plateau (lingers) -> final rise; velocity eases to ~0 at the plateau edges, so there is no kink. */
  var TEASE = { A: 0.34, B: 0.57, LO: 0.42, HI: 0.46 };
  function teaseRise(raw) {
    if (raw < TEASE.A) return TEASE.LO * smooth(raw / TEASE.A);
    if (raw < TEASE.B) return TEASE.LO + (TEASE.HI - TEASE.LO) * smooth((raw - TEASE.A) / (TEASE.B - TEASE.A));
    return TEASE.HI + (1 - TEASE.HI) * smooth((raw - TEASE.B) / (1 - TEASE.B));
  }

  function measure() {
    vh = window.innerHeight || 1;
    if (!mq.matches) { root.style.height = ""; root.classList.remove("is-pinned"); root.style.setProperty("--rise", "1"); root.classList.add("is-in"); return; }
    root.classList.add("is-pinned");
    reveal = Math.round(vh * 1.4);                                   /* the extra scroll: rise, pause, rise again */
    root.style.height = vh + reveal + "px";
    top = root.getBoundingClientRect().top + window.scrollY;
    update();
  }
  function update() {
    ticking = false;
    if (!mq.matches) return;
    var raw = Math.min(1, Math.max(0, (window.scrollY - top) / reveal));
    var rise = teaseRise(raw);
    root.style.setProperty("--rise", rise.toFixed(4));
    if (rise > 0.3) root.classList.add("is-in");                     /* one-shot copy reveal once the panel is well into view */
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", measure);
  mq.addEventListener("change", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();
  window.addEventListener("load", measure);
})();
