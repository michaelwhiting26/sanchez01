/* Waitlist form (prototype): validates the email, blocks bots with a honeypot, and MOCKS the submit (no network). The address is kept in localStorage["sz.waitlist"]
   only so the prototype can show the done state on reload. Real sending (provider, double opt-in, consent wording) is business TODO #22 in docs/TODO-business.md. */
(function () {
  var form = document.querySelector("[data-waitlist]"); if (!form) return;
  var sec = form.closest(".waitlist"), input = form.querySelector('input[type="email"]'), msg = form.querySelector(".waitlist__msg"), hp = form.querySelector('[name="company"]');
  var HINT = { email: "you@email.com", gmail: "you@gmail.com", other: "your login email" };
  function method() { var r = form.querySelector('input[name="method"]:checked'); return r ? r.value : "email"; }
  [].forEach.call(form.querySelectorAll('input[name="method"]'), function (r) { r.addEventListener("change", function () { input.placeholder = HINT[method()]; input.removeAttribute("aria-invalid"); msg.textContent = ""; msg.classList.remove("is-error"); }); });
  var KEY = "sz.waitlist";
  function store(v) { try { if (v == null) return localStorage.getItem(KEY); localStorage.setItem(KEY, v); } catch (e) {} return null; }
  function done() { sec.classList.add("is-done"); msg.classList.remove("is-error"); msg.textContent = "You are in."; [].forEach.call(form.querySelectorAll(".waitlist__method"), function (e) { e.style.display = "none"; }); }
  if (store()) done();
  form.addEventListener("submit", function (e) {
    e.preventDefault(); var v = (input.value || "").trim();
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    var mth = method(), gmailOk = mth !== "gmail" || /@(gmail|googlemail)\.com$/i.test(v);
    input.setAttribute("aria-invalid", ok && gmailOk ? "false" : "true");
    if (!ok || !gmailOk) { msg.classList.add("is-error"); msg.textContent = !ok ? "That email does not look right." : "Use your Gmail address."; input.focus(); return; }
    if (hp && hp.value) return;                                   /* a bot filled the hidden field: pretend success, send nothing */
    store(v + " (" + mth + ")"); done();                                              /* PROTOTYPE: mock. Production posts to the waitlist endpoint (see TODO #22). */
  });
})();
