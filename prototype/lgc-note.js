/* Workshop carousel: when you click into an image, a short paragraph appears under it. The words live in each item's "note"
   field in the carousel's data-items (index.html), so Jesse's copy goes there. Until it is written, each note is a clearly
   marked PLACEHOLDER. Reads the focused slide's title and the Close button's state from the carousel; changes nothing in it. */
(function () {
  var host = document.querySelector("[data-lgc]"); if (!host) return;
  var stage = host.parentElement, items = []; try { items = JSON.parse(host.getAttribute("data-items") || "[]"); } catch (e) {}
  var note = document.createElement("p"); note.className = "lgc-note"; note.setAttribute("aria-live", "polite"); stage.appendChild(note);
  var last = "";
  function sync() {
    var close = host.querySelector('button[aria-label="Close focused project"]'), title = host.querySelector('p[class*="top-[4.5%]"]');
    var open = !!close && close.style.opacity === "1", t = title ? title.textContent.trim() : "";
    var it = open && items.filter(function (i) { return (i.title || "").trim() === t; })[0];
    var text = it && it.note ? it.note : "";
    if (text !== last) { last = text; if (text) note.textContent = text; }
    note.classList.toggle("is-on", !!text);
  }
  new MutationObserver(sync).observe(host, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["style"] });
  sync();
})();
