/* Waitlist form (prototype): validates the email, blocks bots with a honeypot, and MOCKS the submit (no network). The address is kept in localStorage["sz.waitlist"]
   only so the prototype can show the done state on reload. Real sending (provider, double opt-in, consent wording) is business TODO #22 in docs/TODO-business.md. */
(function () {
  var form = document.querySelector("[data-waitlist]"); if (!form) return;
  var sec = form.closest(".waitlist"), input = form.querySelector('input[type="email"]'), msg = form.querySelector(".waitlist__msg"), hp = form.querySelector('[name="company"]');
  var KEY = "sz.waitlist";
  function store(v) { try { if (v == null) return localStorage.getItem(KEY); localStorage.setItem(KEY, v); } catch (e) {} return null; }
  function done() { sec.classList.add("is-done"); msg.classList.remove("is-error"); msg.textContent = "You are on the list."; var fine = form.querySelector(".waitlist__fine"); if (fine) fine.textContent = "Watch your inbox. That is all we will say for now."; }
  if (store()) done();
  form.addEventListener("submit", function (e) {
    e.preventDefault(); var v = (input.value || "").trim();
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    if (!ok) { msg.classList.add("is-error"); msg.textContent = "That email does not look right."; input.focus(); return; }
    if (hp && hp.value) return;                                   /* a bot filled the hidden field: pretend success, send nothing */
    store(v); done();                                              /* PROTOTYPE: mock. Production posts to the waitlist endpoint (see TODO #22). */
  });
})();
