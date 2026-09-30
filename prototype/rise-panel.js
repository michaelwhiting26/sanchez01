/* Rise panel: after the footer, a contact panel rises up over a pinned stage as you scroll, PAUSES part-way up (the shaped top edge lingers), and
   needs a little more scrolling to finish rising. Ported from the mr-2 "Section 3" reveal: same three-phase easing. Desktop + motion only;
   on phones and with reduced motion it is a plain block in the page. The page scroll itself is never hijacked: the section is just tall, and the
   panel's position is a pure function of scroll. */
(function () {
  var root = document.querySelector("[data-rise]");
  if (!root) return;
  var card = root.querySelector(".rise__card");
  var mq = matchMedia("(min-width: 761px) and (prefers-reduced-motion: no-preference)");
  /* the mr-2 "Business enquiries" button: build the rolling characters and the two arrows */
  document.querySelectorAll("[data-roll]").forEach(function (a) {
    var label = a.getAttribute("data-roll"), arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7 H17 V16"/></svg>';
    var chars = Array.from(label).map(function (ch, i) { var c = ch === " " ? "\u00a0" : ch; return '<span class="enq__char" style="--i:' + i + '"><span class="enq__a">' + c + '</span><span class="enq__b">' + c + '</span></span>'; }).join("");
    a.innerHTML = '<span class="enq__clip" aria-hidden="true"><span class="enq__text">' + chars + '</span></span><span class="enq__icon" aria-hidden="true">' + arrow.replace("<svg", '<svg class="enq__arrowA"') + arrow.replace("<svg", '<svg class="enq__arrowB"') + '</span>';
  });
  var vh = 0, top = 0, reveal = 0, over = 0, ticking = false;

  var smooth = function (x) { return x * x * (3 - 2 * x); };
  /* early rise -> eased plateau (lingers) -> final rise; velocity eases to ~0 at the plateau edges, so there is no kink. */
  var TEASE = { A: 0.34, B: 0.57, LO: 0.6, HI: 0.64 };
  function teaseRise(raw) {
    if (raw < TEASE.A) return TEASE.LO * smooth(raw / TEASE.A);
    if (raw < TEASE.B) return TEASE.LO + (TEASE.HI - TEASE.LO) * smooth((raw - TEASE.A) / (TEASE.B - TEASE.A));
    return TEASE.HI + (1 - TEASE.HI) * smooth((raw - TEASE.B) / (1 - TEASE.B));
  }

  function measure() {
    vh = window.innerHeight || 1;
    if (!mq.matches) { root.style.height = ""; root.style.marginTop = ""; document.documentElement.classList.remove("rise-pinned"); root.classList.remove("is-pinned"); root.style.setProperty("--rise", "1"); root.classList.add("is-in"); return; }
    root.classList.add("is-pinned"); document.documentElement.classList.add("rise-pinned");
    var prev = document.getElementById("flare") || root.previousElementSibling; root.style.marginTop = prev ? -prev.offsetHeight + "px" : "";   /* start pinned the moment the carousel pins, so the panel rises over it */
    reveal = Math.round(vh * 1.4);                                   /* the extra scroll: rise, pause, rise again */
    over = Math.max(0, card.offsetHeight - vh);                      /* the footer is taller than the screen: after the rise, scroll on through it while the stage stays pinned */
    root.style.setProperty("--overflow", over + "px");
    root.style.height = vh + reveal + over + "px";
    top = root.getBoundingClientRect().top + window.scrollY;
    update();
  }
  function update() {
    ticking = false;
    if (!mq.matches) return;
    var raw = Math.min(1, Math.max(0, (window.scrollY - top) / reveal));
    var rise = teaseRise(raw);
    root.style.setProperty("--rise", rise.toFixed(4));
    root.style.setProperty("--more", (over > 0 ? Math.min(1, Math.max(0, (window.scrollY - top - reveal) / over)) : 0).toFixed(4));
    if (rise > 0.3) root.classList.add("is-in");                     /* one-shot copy reveal once the panel is well into view */
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", measure);
  mq.addEventListener("change", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();
  window.addEventListener("load", measure);
  if (window.ResizeObserver) new ResizeObserver(function () { if (mq.matches && Math.abs(card.offsetHeight - vh - over) > 2 && card.offsetHeight > 0) measure(); }).observe(card);   /* the footer fills in after load (chrome, globe) */
})();
