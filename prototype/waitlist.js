/* Waitlist form (prototype): validates the email, blocks bots with a honeypot, and MOCKS the submit (no network). The address is kept in localStorage["sz.waitlist"]
   only so the prototype can show the done state on reload. Real sending (provider, double opt-in, consent wording) is business TODO #22 in docs/TODO-business.md. */
(function () {
  var form = document.querySelector("[data-waitlist]"); if (!form) return;
  var sec = form.closest(".waitlist"), input = form.querySelector('input[type="email"]'), msg = form.querySelector(".waitlist__msg"), hp = form.querySelector('[name="company"]');
  var HINT = { email: "you@email.com", gmail: "you@gmail.com", other: "your login email" };
  function method() { var r = form.querySelector('input[name="method"]:checked'); return r ? r.value : "email"; }
  [].forEach.call(form.querySelectorAll('input[name="method"]'), function (r) { r.addEventListener("change", function () { input.removeAttribute("aria-invalid"); msg.textContent = ""; msg.classList.remove("is-error"); }); });
  var KEY = "sz.waitlist";
  function store(v) { try { if (v == null) return localStorage.getItem(KEY); localStorage.setItem(KEY, v); } catch (e) {} return null; }
  function done() { sec.classList.add("is-done"); msg.classList.remove("is-error"); msg.textContent = "You are in."; [].forEach.call(form.querySelectorAll(".waitlist__method"), function (e) { e.style.display = "none"; }); }
  /* the field types its own placeholder: five lines built on being first and not missing out. It stops the moment someone focuses or types, resumes when the field is left empty. Still (first line) with reduced motion. */
  var LINES = ["Be first. Everyone else waits.", "Your name on the first drop.", "Something\u2019s coming. You\u2019ll know first.", "Early access goes to the list.", "Don\u2019t be the one who missed it."];
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches, tType = 0, li = 0, ci = 0, del = false, typing = true;
  function tick() {
    if (!typing) return;
    var line = LINES[li];
    if (!del) { ci++; input.placeholder = line.slice(0, ci) + "|"; if (ci >= line.length) { del = true; tType = setTimeout(tick, 1900); return; } tType = setTimeout(tick, 52 + Math.random() * 46); }
    else { ci--; input.placeholder = ci > 0 ? line.slice(0, ci) + "|" : "\u00a0"; if (ci <= 0) { del = false; li = (li + 1) % LINES.length; tType = setTimeout(tick, 420); return; } tType = setTimeout(tick, 22); }
  }
  function stopTyping() { typing = false; clearTimeout(tType); input.placeholder = LINES[0]; }
  function maybeResume() { if (!input.value && !reduceMotion && !sec.classList.contains("is-done")) { typing = true; ci = 0; del = false; clearTimeout(tType); tType = setTimeout(tick, 400); } }
  if (reduceMotion) input.placeholder = LINES[0]; else tType = setTimeout(tick, 900);
  input.addEventListener("focus", stopTyping); input.addEventListener("blur", maybeResume);
  input.setAttribute("aria-label", "Email address");
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
