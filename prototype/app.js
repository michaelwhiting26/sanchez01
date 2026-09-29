/* =============================================================================
   Sanchez Custom Boxing — prototype behaviour (vanilla JS, no build, file://-safe)
   -----------------------------------------------------------------------------
   Sections
     1. DATA           nav, currencies, price book (all null = PLACEHOLDER), bag schema
     2. UTILITIES      storage, escaping, icons
     3. CHROME         header, footer, nav drawer, cart drawer, toast region
     4. BEHAVIOURS     dialogs, toasts, currency, language/RTL, tabs, forms,
                       demo state switcher, hero video, gallery, steppers, cart
     5. BAG RENDERER   2D SVG fallback of the configurator preview
     6. CONFIG ENGINE  state, rules/guard rails, summary (shared by configure/review/checkout)
     7. PAGES          configure, review, checkout controllers
   Everything public hangs off window.SZ so other pages (milestone 1b) can reuse it.
   PRODUCTION NOTE: nothing here is trusted. The server recomputes price, currency,
   deposit, availability and config validity (see CLAUDE.md).
   ========================================================================== */
(function () {
  "use strict";
  var SZ = (window.SZ = window.SZ || {});

  /* ===========================================================================
     1. DATA (inlined: file:// cannot fetch local JSON)
     ======================================================================== */
  var MEDIA = "assets/site/";
  var D = (SZ.DATA = {
    logo: MEDIA + "images/3d2aa4_57957db32ff34fe8ac950b275e2e774b~mv2.webp",
    img: {
      bagPatch: MEDIA + "images/3d2aa4_53bb9dfbccab4f3da838f823d595b52ff000.jpg",   // bag close-up, Sanchez label (poster of video 53bb)
      sewingWide: MEDIA + "images/3d2aa4_158202aee59345f58eae5838887e0ccdf000.jpg", // Jesse at the machine, 16:9 (hero poster)
      sewingTall: MEDIA + "images/3d2aa4_23235d6beb8d42e4a81f10e2b73d4eeff000.jpg", // Jesse sewing, 9:16
      tools: MEDIA + "images/3d2aa4_8508388db7d841b0a3a47119727325cdf000.jpg"       // workshop tool wall, 9:16
    },
    nav: [
      { href: "shop.html", label: "Shop", page: "shop" },
      { href: "configure.html", label: "Configure", page: "configure" },
      { href: "gym-fit-outs.html", label: "Gym Fit-outs", page: "gym-fit-outs" },
      { href: "workshop.html", label: "Workshop", page: "workshop" },
      { href: "journal.html", label: "Journal", page: "journal" },
      { href: "about.html", label: "About", page: "about" },
      { href: "contact.html", label: "Contact", page: "contact" }
    ],
    footerCols: [
      { title: "Shop", links: [["shop.html", "All products"], ["product.html", "Custom heavy bag"], ["configure.html", "Build your bag"], ["wholesale.html", "Wholesale"]] },
      { title: "Gyms", links: [["gym-fit-outs.html", "Gym fit-outs"], ["gym-builder.html", "Gym builder"], ["fighters.html", "Fighters"]] },
      { title: "Sanchez", links: [["workshop.html", "The workshop"], ["about.html", "About"], ["journal.html", "Journal"], ["contact.html", "Contact"]] },
      { title: "Help", links: [["faq.html", "FAQ"], ["shipping.html", "Shipping"], ["returns-warranty.html", "Returns and warranty"], ["order.html", "Track an order"]] }
    ],
    legal: [["legal-terms.html", "Terms"], ["legal-privacy.html", "Privacy"], ["legal-cookies.html", "Cookies"]],
    socials: [
      { handle: "@sanchezproducts", href: "https://www.instagram.com/sanchezproducts/" },
      { handle: "@jessesanchezlgboxing", href: "https://www.instagram.com/jessesanchezlgboxing/" }
    ],
    origin: "Designed in Sydney. Handmade in Pattaya.",
    currencies: ["AUD", "AED", "SGD", "GBP", "USD"],
    langs: [["en", "English"], ["th", "ไทย (Thai)"], ["ar", "العربية (Arabic)"], ["es", "Español"]],
    /* Price book: explicit per-currency integer minor units. ALL null until Jesse's
       price list arrives -> every price renders as a visible PLACEHOLDER tag. */
    priceBook: {
      "heavy-bag-custom": { AUD: null, AED: null, SGD: null, GBP: null, USD: null },
      "heavy-bag-stock": { AUD: null, AED: null, SGD: null, GBP: null, USD: null }
    },
    depositPct: null, /* business decision pending (spec says e.g. 30–50%) */
    countries: [
      ["AU", "Australia", "AUD"], ["AE", "United Arab Emirates", "AED"], ["SA", "Saudi Arabia", "USD"],
      ["QA", "Qatar", "USD"], ["SG", "Singapore", "SGD"], ["GB", "United Kingdom", "GBP"],
      ["US", "United States", "USD"], ["TH", "Thailand", "USD"], ["NZ", "New Zealand", "USD"], ["XX", "Other", "USD"]
    ],
    gulf: ["AE", "SA", "QA"],
    /* Colour library: PLACEHOLDER — Jesse to confirm real stock colours + codes */
    colours: [
      ["#111111", "Black"], ["#3a3a3a", "Charcoal"], ["#8a8a8a", "Grey"], ["#f7f7f2", "White"], ["#e9dcc4", "Bone"],
      ["#c8102e", "Red"], ["#6d1a1f", "Oxblood"], ["#b0482b", "Rust"], ["#e07a1f", "Orange"], ["#f2c230", "Yellow"],
      ["#c9a45c", "Gold"], ["#a8784f", "Tan"], ["#5a3a26", "Brown"], ["#1c2b4a", "Navy"], ["#1f5fbf", "Royal blue"],
      ["#6fb6e0", "Sky"], ["#1f4a33", "Forest"], ["#6b6b3a", "Olive"], ["#e46fa2", "Pink"], ["#5b2f82", "Purple"]
    ],
    leatherColours: ["#111111", "#5a3a26", "#a8784f", "#6d1a1f", "#e9dcc4"] /* PLACEHOLDER: limited leather range */
  });

  /* Option tables for the bag flow (spec 01 §2). Labels are the spec's wording. */
  var OPT = (SZ.OPT = {
    types: [
      { v: "heavy", t: "Heavy bag", d: "Classic cylinder", lengths: [["3ft", "30 kg"], ["4ft", "45 kg"], ["5ft", "60 kg"]], def: "4ft" },
      { v: "banana", t: "Thai / banana bag", d: "Long. Kicks and low strikes", lengths: [["5ft", "40 kg"], ["6ft", "55 kg"], ["7ft", "70 kg"]], def: "6ft" },
      { v: "teardrop", t: "Teardrop / uppercut bag", d: "Angles and uppercuts", lengths: [["3ft", "35 kg"], ["4ft", "45 kg"]], def: "4ft" },
      { v: "angle", t: "Angle / wall-uppercut bag", d: "Wall mounted", lengths: [["standard", null]], def: "standard" },
      { v: "body", t: "Body-shot / wrecking ball", d: "Round", lengths: [["standard", "30 kg"], ["large", "45 kg"]], def: "standard" },
      { v: "double-end", t: "Double-end / speed bag", d: "Accessory. Colour and logo only", lengths: [], def: null }
    ],
    logoVariant: [["full", "Full colour"], ["white", "Single colour (white)"], ["black", "Single colour (black)"]],
    vibe: [["oldschool", "Old-school fight gym"], ["boutique", "Premium boutique"], ["industrial", "Industrial"], ["minimal", "Clean minimal"], ["neon", "Neon night"]],
    buyerType: [["boutique", "Boutique studio"], ["franchise", "Franchise"], ["commercial", "Commercial gym"], ["fight-team", "Fight team"], ["promoter", "Promoter"], ["home", "Home gym"], ["hotel", "Hotel"]],
    fill: [["filled", "Filled", "Australia and local delivery"], ["unfilled", "Unfilled, filled on site", "Default for export. Lower freight"]],
    fillType: [["shredded", "Shredded textile (standard)"], ["soft-top", "Textile with a soft top section"], ["custom", "Custom (ask)"]],
    material: [["vinyl", "Premium vinyl (house material)", "Default. Hand-cut Persian vinyl"], ["leather", "Genuine leather", "Premium tier. Limited colours"], ["canvas", "Heavy canvas", "Budget and training-camp tier"]],
    layout: [["single", "Single colour"], ["2tone-vertical", "2-tone vertical split"], ["2tone-horizontal", "2-tone horizontal bands"], ["3panel", "3-panel"], ["chequer", "Chequer"], ["patchwork", "Custom patchwork", "Goes to quote"]],
    stitch: [["tonal", "Tonal"], ["contrast", "Contrast"], ["accent", "Brand accent"]],
    piping: [["none", "None"], ["contrast", "Contrast"]],
    method: [["silicone-screen", "Silicone screen print", "Standard"], ["embroidered", "Embroidered patch", ""], ["leather-patch", "Leather patch", ""], ["debossed", "Debossed leather", "Leather only"]],
    placement: [["front", "Front"], ["front-back", "Front + back"], ["wrap", "360° wrap"], ["top-band", "Top band"], ["bottom-band", "Bottom band"]],
    logoSize: [["S", "S"], ["M", "M"], ["L", "L"], ["full", "Full height"]],
    font: [["font-1", "Font 1"], ["font-2", "Font 2"], ["font-3", "Font 3"], ["font-4", "Font 4"]],
    hang: [["4pt-swivel", "4-point chain with swivel", "Standard"], ["hd-swivel", "Heavy-duty swivel", ""], ["strap", "Strap hang", ""]],
    finish: [["black", "Black"], ["silver", "Silver"], ["brand", "Brand colour (powder coat)"]],
    extras: [["qr-tag", "Serial-numbered QR tag", "Authenticity, care and reorder"], ["gloves-pads", "Matching gloves or pads", "Goes to quote. Gloves excluded from competition use"], ["cover", "Protective cover", ""], ["spare-chain", "Spare chain set", ""]],
    tiers: [["1", 1, 1], ["2–5", 2, 5], ["6–11", 6, 11], ["12+", 12, 99], ["Franchise (quote)", 100, Infinity]]
  });
  var FONT_FAMILY = { "font-1": "Barlow Condensed, sans-serif", "font-2": "Georgia, serif", "font-3": "Courier New, monospace", "font-4": "Arial Black, sans-serif" };

  var STEPS = (SZ.STEPS = [
    { id: "brand", code: "0", title: "Your brand", intro: "Add your gym details and logo once. Every product you build inherits them." },
    { id: "type", code: "A1", title: "Bag type", intro: "Choose the style that suits your training." },
    { id: "size", code: "A2", title: "Size and weight", intro: "Shown next to a 180 cm person for scale.", skip: ["double-end"] },
    { id: "fill", code: "A3", title: "Fill", intro: "Export orders ship unfilled by default to cut freight.", skip: ["double-end"] },
    { id: "material", code: "A4", title: "Material", intro: "Every piece is hand cut in the workshop.", skip: ["double-end"] },
    { id: "colours", code: "A5", title: "Colour layout", intro: "Panels, caps, stitching and trim." },
    { id: "branding", code: "A6", title: "Branding", intro: "Your logo, your words, your station numbers." },
    { id: "hardware", code: "A7", title: "Hanging and hardware", intro: "How it hangs and how it's finished.", skip: ["double-end"] },
    { id: "quantity", code: "A8", title: "Quantity", intro: "Kitting out a whole floor? Tiers apply automatically." },
    { id: "extras", code: "A9", title: "Extras", intro: "Finishing touches." }
  ]);

  /* ===========================================================================
     2. UTILITIES
     ======================================================================== */
  var store = (SZ.store = {
    get: function (k, fallback) {
      try { var v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; }
    },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  });
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function ic(name, cls) { return '<svg class="icon ' + (cls || "") + '" aria-hidden="true" focusable="false"><use href="#i-' + name + '"></use></svg>'; }
  function ph(text) { return '<span class="ph">' + esc(text || "PLACEHOLDER") + "</span>"; }
  function param(name) { try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; } }
  function label(list, v) { for (var i = 0; i < list.length; i++) if (list[i][0] === v) return list[i][1]; return v; }
  SZ.util = { $: $, $$: $$, esc: esc, ic: ic, ph: ph, param: param, label: label };

  var ICONS = {
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    bag: '<path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
    "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "arrow-left": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    alert: '<path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
    play: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    upload: '<path d="M12 16V4M6 10l6-6 6 6M4 20h16"/>',
    share: '<path d="M4 13v7h16v-7M12 3v13M7 8l5-5 5 5"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    rotate: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    edit: '<path d="M4 20h4L20 8l-4-4L4 16v4z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>',
    "x-circle": '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    package: '<path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5M8 11h6M11 8v6"/>'
  };
  function injectSprite() {
    if ($("#sz-sprite")) return;
    var s = '<svg id="sz-sprite" xmlns="http://www.w3.org/2000/svg" style="display:none">';
    Object.keys(ICONS).forEach(function (k) { s += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + ICONS[k] + "</symbol>"; });
    document.body.insertAdjacentHTML("afterbegin", s + "</svg>");
  }

  /* ===========================================================================
     3. CHROME (header, footer, drawers). Pages contain empty
        <header class="site-header" data-chrome="header"> and
        <footer class="site-footer" data-chrome="footer"> slots; the header slot
        has a reserved height so injection causes no layout shift.
     ======================================================================== */
  function currencySelect(id, cls) {
    return '<select class="select ' + (cls || "") + '" id="' + id + '" data-currency-select aria-label="Currency">' +
      D.currencies.map(function (c) { return '<option value="' + c + '">' + c + "</option>"; }).join("") + "</select>";
  }
  function langSelect(id, cls) {
    return '<select class="select ' + (cls || "") + '" id="' + id + '" data-lang-select aria-label="Language">' +
      D.langs.map(function (l) { return '<option value="' + l[0] + '" lang="' + l[0] + '">' + l[1] + "</option>"; }).join("") + "</select>";
  }

  function renderChrome() {
    var page = document.body.getAttribute("data-page") || "";
    document.body.insertAdjacentHTML("afterbegin", '<a class="skip-link" href="#main">Skip to content</a>');

    var header = $('[data-chrome="header"]');
    if (header) {
      header.innerHTML =
        '<div class="container site-header__inner">' +
        '<button class="icon-btn menu-toggle" type="button" data-open="nav-drawer" aria-haspopup="dialog" aria-controls="nav-drawer" aria-label="Open menu">' + ic("menu") + "</button>" +
        '<a class="brand" href="index.html" aria-label="Sanchez Custom Boxing Equipment, home"><img class="brand__logo" src="' + D.logo + '" alt="" width="55" height="48"></a>' +
        '<nav class="nav-primary" aria-label="Primary"><ul>' +
        D.nav.map(function (n) { return '<li><a href="' + n.href + '"' + (n.page === page ? ' aria-current="page"' : "") + ">" + n.label + "</a></li>"; }).join("") +
        "</ul></nav>" +
        '<div class="header-actions">' +
        '<div class="header-currency">' + currencySelect("hdr-currency", "select--sm") + "</div>" +
        '<button class="icon-btn" type="button" data-open="cart-drawer" aria-haspopup="dialog" aria-controls="cart-drawer" data-cart-button aria-label="Cart, 0 items">' + ic("bag") + '<span class="count-badge" data-cart-count data-count="0"></span></button>' +
        '<a class="btn btn--primary btn--sm header-cta" href="configure.html">Build yours</a>' +
        "</div></div>";
    }

    var footer = $('[data-chrome="footer"]');
    if (footer) {
      footer.innerHTML =
        '<div class="container">' +
        '<div class="footer-top">' +
        '<div class="footer-brand"><img src="' + D.logo + '" alt="Sanchez Custom Boxing Equipment" width="96" height="83" loading="lazy">' +
        '<p class="origin-line">' + D.origin + "</p>" +
        '<ul class="footer-cities" aria-label="Where we work">' + ["London", "Dubai", "Thailand", "Sydney"].map(function (c) { return "<li>" + c + "</li>"; }).join("") + "</ul>" +
        '<ul class="social-links" aria-label="Instagram">' + D.socials.map(function (s) {
          return '<li><a href="' + s.href + '" rel="noopener" target="_blank">' + ic("instagram") + s.handle + '<span class="visually-hidden"> on Instagram (opens in a new tab)</span></a></li>';
        }).join("") + "</ul></div>" +
        '<div class="footer-cols">' + D.footerCols.map(function (c, i) {
          return '<nav class="footer-col" aria-labelledby="fc-' + i + '"><h2 id="fc-' + i + '">' + c.title + "</h2><ul>" +
            c.links.map(function (l) { return '<li><a href="' + l[0] + '">' + l[1] + "</a></li>"; }).join("") + "</ul></nav>";
        }).join("") + "</div></div>" +
        '<div class="footer-bottom">' +
        '<div class="switchers">' +
        '<div class="field"><label class="field__label" for="ftr-currency">Currency</label>' + currencySelect("ftr-currency").replace(' aria-label="Currency"', "") + "</div>" +
        '<div class="field"><label class="field__label" for="ftr-lang">Language ' + ph("visual stub") + "</label>" + langSelect("ftr-lang").replace(' aria-label="Language"', "") + "</div>" +
        "</div>" +
        '<ul class="legal-links" aria-label="Legal">' + D.legal.map(function (l) { return '<li><a href="' + l[0] + '">' + l[1] + "</a></li>"; }).join("") + "</ul>" +
        "<p>© " + new Date().getFullYear() + " Sanchez Custom Boxing Equipment. " + ph("PLACEHOLDER: legal entity + ABN") + "</p>" +
        '<div class="proto-tools" role="group" aria-label="Prototype review tools"><span class="xsmall">Prototype: view state</span>' +
        ["ready", "loading", "empty", "error"].map(function (s) { return '<a href="?state=' + s + '">' + s + "</a>"; }).join("") +
        '<a href="components.html">Components</a></div>' +
        "</div></div>";
    }

    /* Overlays: nav drawer, cart drawer, toast region */
    var overlays =
      '<dialog class="drawer drawer--start" id="nav-drawer" aria-labelledby="nav-drawer-title">' +
      '<div class="drawer__header"><h2 class="drawer__title" id="nav-drawer-title">Menu</h2>' +
      '<button class="icon-btn" type="button" data-close aria-label="Close menu">' + ic("close") + "</button></div>" +
      '<nav class="drawer__body" aria-label="Mobile"><ul class="nav-drawer-list">' +
      D.nav.map(function (n) { return '<li><a href="' + n.href + '"' + (n.page === page ? ' aria-current="page"' : "") + ">" + n.label + ic("arrow-right", "icon--dir") + "</a></li>"; }).join("") +
      "</ul></nav>" +
      '<div class="drawer__footer"><a class="btn btn--primary btn--block" href="configure.html">Build your bag</a>' +
      '<div class="switchers"><div class="field"><label class="field__label" for="drw-currency">Currency</label>' + currencySelect("drw-currency").replace(' aria-label="Currency"', "") + "</div>" +
      '<div class="field"><label class="field__label" for="drw-lang">Language</label>' + langSelect("drw-lang").replace(' aria-label="Language"', "") + "</div></div>" +
      '<p class="origin-line xsmall muted">' + D.origin + "</p></div></dialog>" +

      '<dialog class="drawer" id="cart-drawer" aria-labelledby="cart-title">' +
      '<div class="drawer__header"><h2 class="drawer__title" id="cart-title">Your cart</h2>' +
      '<button class="icon-btn" type="button" data-close aria-label="Close cart">' + ic("close") + "</button></div>" +
      '<div class="drawer__body" data-cart-body></div>' +
      '<div class="drawer__footer" data-cart-footer>' +
      '<div class="totals"><div class="totals__row"><span>Subtotal</span><span class="price" data-price="heavy-bag-stock"></span></div>' +
      '<p class="xsmall muted">Shipping and tax calculated at checkout. Custom builds are paid by deposit from the review page.</p></div>' +
      '<div class="wallet-row"><button class="btn btn--wallet" type="button" data-mock-wallet="Apple Pay"> Pay</button><button class="btn btn--gpay" type="button" data-mock-wallet="Google Pay">G Pay</button></div>' +
      '<a class="btn btn--primary btn--block" href="checkout.html?mode=stock">Checkout</a></div></dialog>' +

      '<div class="toast-region" data-toast-region role="status" aria-live="polite"></div>';
    document.body.insertAdjacentHTML("beforeend", overlays);
  }

  /* ===========================================================================
     4. BEHAVIOURS
     ======================================================================== */

  /* ---- Dialogs (drawers + modals). Native <dialog>.showModal() gives us the
     focus trap, Esc to close, inert background and focus return. ---------- */
  SZ.openDialog = function (id) {
    var d = document.getElementById(id);
    if (!d || d.open) return;
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    document.dispatchEvent(new CustomEvent("sz:dialog-open", { detail: { id: id } }));
  };
  SZ.closeDialog = function (d) { if (d && d.open) d.close(); };
  function initDialogs() {
    document.addEventListener("click", function (e) {
      var opener = e.target.closest("[data-open]");
      if (opener) { e.preventDefault(); SZ.openDialog(opener.getAttribute("data-open")); return; }
      var closer = e.target.closest("[data-close]");
      if (closer) { SZ.closeDialog(closer.closest("dialog")); return; }
      /* light dismiss: click on the backdrop (the dialog element itself) */
      if (e.target.tagName === "DIALOG") SZ.closeDialog(e.target);
    });
  }

  /* ---- Toasts ------------------------------------------------------------- */
  SZ.toast = function (msg, type, ms) {
    var region = $("[data-toast-region]");
    if (!region) return;
    var t = document.createElement("div");
    t.className = "toast toast--" + (type || "info");
    t.innerHTML = ic(type === "error" ? "x-circle" : type === "warning" ? "alert" : type === "success" ? "check" : "info") +
      '<span class="toast__msg">' + esc(msg) + '</span><button class="icon-btn" type="button" aria-label="Dismiss">' + ic("close") + "</button>";
    t.querySelector("button").addEventListener("click", function () { t.remove(); });
    region.appendChild(t);
    setTimeout(function () { t.remove(); }, ms || 5000);
  };

  /* ---- Currency ------------------------------------------------------------ */
  SZ.currency = function () { var c = store.get("sz.currency", "AUD"); return D.currencies.indexOf(c) > -1 ? c : "AUD"; };
  SZ.setCurrency = function (c, silent) {
    if (D.currencies.indexOf(c) < 0) return;
    store.set("sz.currency", c);
    $$("[data-currency-select]").forEach(function (s) { s.value = c; });
    SZ.renderPrices();
    document.dispatchEvent(new CustomEvent("sz:currency", { detail: { currency: c } }));
    if (!silent) SZ.toast("Prices now shown in " + c + ". Set per currency, never converted live.", "info", 3500);
  };
  /* Formats a price from the price book. null = PLACEHOLDER (never guessed). */
  SZ.formatPrice = function (key, opts) {
    var cur = SZ.currency();
    var row = D.priceBook[key];
    var minor = row ? row[cur] : null;
    var pre = opts && opts.prefix ? '<span class="price__cur">' + esc(opts.prefix) + "</span>" : "";
    if (minor == null) return pre + '<span class="price__cur">' + cur + "</span>" + ph((opts && opts.phLabel) || (opts && opts.range ? "PLACEHOLDER price range" : "PLACEHOLDER price"));
    return pre + '<span class="price__cur">' + cur + "</span>" + (minor / 100).toLocaleString(undefined, { minimumFractionDigits: 0 });
  };
  SZ.renderPrices = function () {
    $$("[data-price]").forEach(function (el) {
      el.innerHTML = SZ.formatPrice(el.getAttribute("data-price"), { range: el.hasAttribute("data-range"), prefix: el.getAttribute("data-prefix"), phLabel: el.getAttribute("data-ph-label") });
    });
    $$("[data-currency-code]").forEach(function (el) { el.textContent = SZ.currency(); });
  };
  function initCurrency() {
    $$("[data-currency-select]").forEach(function (s) { s.value = SZ.currency(); });
    document.addEventListener("change", function (e) {
      if (e.target.matches("[data-currency-select]")) SZ.setCurrency(e.target.value);
    });
    SZ.renderPrices();
  }

  /* ---- Language + RTL (visual stub; no translations in the prototype) ----- */
  SZ.setLang = function (l, silent) {
    store.set("sz.lang", l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    $$("[data-lang-select]").forEach(function (s) { s.value = l; });
    if (!silent) SZ.toast(l === "ar" ? "Layout mirrored right-to-left. Translations are a stub in the prototype." : "Language set. Translations are a stub in the prototype.", "info", 4000);
  };
  function initLang() {
    SZ.setLang(store.get("sz.lang", "en"), true);
    document.addEventListener("change", function (e) { if (e.target.matches("[data-lang-select]")) SZ.setLang(e.target.value); });
  }

  /* ---- Tabs (WAI-ARIA tabs pattern, automatic activation) ----------------- */
  function initTabs(root) {
    $$("[data-tabs]", root).forEach(function (tabs) {
      var list = $('[role="tablist"]', tabs);
      var btns = $$('[role="tab"]', list);
      function select(b, focus) {
        btns.forEach(function (x) {
          var on = x === b;
          x.setAttribute("aria-selected", on ? "true" : "false");
          x.tabIndex = on ? 0 : -1;
          var p = document.getElementById(x.getAttribute("aria-controls"));
          if (p) p.hidden = !on;
        });
        if (focus) b.focus();
      }
      btns.forEach(function (b, i) {
        b.addEventListener("click", function () { select(b); });
        b.addEventListener("keydown", function (e) {
          var rtl = document.documentElement.dir === "rtl";
          var next = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
          if (next) { e.preventDefault(); select(btns[(i + next + btns.length) % btns.length], true); }
          if (e.key === "Home") { e.preventDefault(); select(btns[0], true); }
          if (e.key === "End") { e.preventDefault(); select(btns[btns.length - 1], true); }
        });
      });
      select(btns.filter(function (b) { return b.getAttribute("aria-selected") === "true"; })[0] || btns[0]);
    });
  }
  SZ.initTabs = initTabs;

  /* ---- Form validation ------------------------------------------------------
     Markup: <form data-validate> containing .field wrappers. Each control gets
     an auto-created .field__error (id linked via aria-describedby). Messages
     come from data-error="…" or a sensible default. An element with
     [data-error-summary] (optional) lists all errors on submit.
     On success the form fires "sz:submit" (cancelable); default = toast. */
  function fieldOf(ctrl) { return ctrl.closest(".field") || ctrl.closest("fieldset"); }
  function ensureError(ctrl) {
    var f = fieldOf(ctrl);
    if (!f) return null;
    var err = $(".field__error", f);
    if (!err) {
      err = document.createElement("p");
      err.className = "field__error";
      err.id = (ctrl.id || ctrl.name || "f" + Math.random().toString(36).slice(2)) + "-err";
      f.appendChild(err);
    }
    var ids = (ctrl.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
    if (ids.indexOf(err.id) < 0) { ids.push(err.id); ctrl.setAttribute("aria-describedby", ids.join(" ")); }
    return err;
  }
  function messageFor(ctrl) {
    var v = ctrl.validity;
    if (ctrl.getAttribute("data-error") && !v.valid) return ctrl.getAttribute("data-error");
    if (v.valueMissing) return ctrl.type === "checkbox" ? "Please tick this box to continue" : ctrl.type === "radio" ? "Please choose an option" : "This field is required";
    if (v.typeMismatch && ctrl.type === "email") return "Enter an email address like name@gym.com";
    if (v.typeMismatch && ctrl.type === "url") return "Enter a full web address, starting https://";
    if (v.patternMismatch) return ctrl.getAttribute("title") || "Check the format";
    if (v.tooLong) return "Too long: maximum " + ctrl.maxLength + " characters";
    if (v.rangeUnderflow || v.rangeOverflow) return "Enter a value between " + ctrl.min + " and " + ctrl.max;
    return ctrl.validationMessage || "Check this field";
  }
  SZ.validateControl = function (ctrl) {
    if (!ctrl.willValidate) return true;
    var f = fieldOf(ctrl);
    var err = ensureError(ctrl);
    var ok = ctrl.checkValidity();
    var group = ctrl.type === "radio" && ctrl.name ? $$('input[name="' + ctrl.name + '"]', ctrl.form || document) : [ctrl];
    group.forEach(function (c) { if (ok) c.removeAttribute("aria-invalid"); else c.setAttribute("aria-invalid", "true"); });
    if (f) { f.classList.toggle("is-invalid", !ok); f.classList.toggle("is-valid", ok && !!ctrl.value && ctrl.type !== "checkbox" && ctrl.type !== "radio"); }
    if (err) err.innerHTML = ok ? "" : ic("alert") + "<span>" + esc(messageFor(ctrl)) + "</span>";
    return ok;
  };
  SZ.validateForm = function (form, scope) {
    var seen = {}, bad = [];
    $$("input, select, textarea", scope || form).forEach(function (c) {
      if (c.type === "radio") { if (seen[c.name]) return; seen[c.name] = 1; }
      if (!SZ.validateControl(c)) bad.push(c);
    });
    var sum = $("[data-error-summary]", form);
    if (sum) {
      if (bad.length) {
        sum.hidden = false;
        sum.innerHTML = '<h2 tabindex="-1">There ' + (bad.length === 1 ? "is 1 problem" : "are " + bad.length + " problems") + "</h2><ul>" +
          bad.map(function (c) {
            var lbl = c.labels && c.labels[0] ? c.labels[0].textContent.replace("*", "").trim() : (fieldOf(c) && $("legend", fieldOf(c)) ? $("legend", fieldOf(c)).textContent : c.name);
            return '<li><a href="#' + c.id + '">' + esc(lbl) + ": " + esc(messageFor(c)) + "</a></li>";
          }).join("") + "</ul>";
        $("h2", sum).focus();
      } else { sum.hidden = true; sum.innerHTML = ""; }
    } else if (bad.length) bad[0].focus();
    return bad.length === 0;
  };
  function initForms() {
    $$("form[data-validate]").forEach(function (form) {
      form.noValidate = true;
      $$("input, select, textarea", form).forEach(ensureError);
      form.addEventListener("focusout", function (e) {
        var c = e.target;
        if (c.matches("input, select, textarea") && (c.value || c.getAttribute("aria-invalid"))) SZ.validateControl(c);
      });
      form.addEventListener("input", function (e) { if (e.target.getAttribute("aria-invalid") === "true") SZ.validateControl(e.target); });
      form.addEventListener("change", function (e) { if (e.target.getAttribute("aria-invalid") === "true") SZ.validateControl(e.target); });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!SZ.validateForm(form)) return;
        var ev = new CustomEvent("sz:submit", { cancelable: true });
        if (!form.dispatchEvent(ev)) return;
        var btn = $('[type="submit"]', form);
        if (btn) btn.setAttribute("aria-busy", "true");
        setTimeout(function () {
          if (btn) btn.removeAttribute("aria-busy");
          var ok = $("[data-form-success]", form);
          if (ok) { ok.hidden = false; ok.focus && ok.focus(); }
          SZ.toast(form.getAttribute("data-success") || "Sent (prototype: nothing left this page).", "success");
          form.reset();
          $$(".is-valid", form).forEach(function (f) { f.classList.remove("is-valid"); });
          var d = form.closest("dialog"); if (d) setTimeout(function () { SZ.closeDialog(d); }, 600);
        }, 900);
      });
    });
  }

  /* ---- Demo state switcher (?state=loading|empty|error) --------------------
     Any [data-stateful] container holds children [data-when="ready|loading|
     empty|error"]. The one matching the URL state is shown; default "ready". */
  SZ.demoState = function () { var s = param("state"); return ["loading", "empty", "error"].indexOf(s) > -1 ? s : "ready"; };
  SZ.setRegionState = function (region, state) {
    var kids = $$(":scope > [data-when]", region);
    var has = kids.some(function (k) { return k.getAttribute("data-when") === state; });
    kids.forEach(function (k) { k.hidden = k.getAttribute("data-when") !== (has ? state : "ready"); });
    region.setAttribute("data-current-state", has ? state : "ready");
    region.setAttribute("aria-busy", state === "loading" ? "true" : "false");
  };
  function initStates() {
    var s = SZ.demoState();
    /* data-stateful="pay" reads ?pay=… instead of ?state=… (nested regions) */
    $$("[data-stateful]").forEach(function (r) {
      var key = r.getAttribute("data-stateful");
      SZ.setRegionState(r, key ? (param(key) || "ready") : s);
    });
    if (s !== "ready") {
      var main = $("main");
      main.insertAdjacentHTML("beforebegin", '<div class="demo-banner" role="note">' + ic("info") + "Demo state: <strong>" + s + '</strong>. <a href="' + location.pathname.split("/").pop() + '">Back to the normal view</a></div>');
    }
    document.addEventListener("click", function (e) {
      var r = e.target.closest("[data-retry]");
      if (!r) return;
      var region = r.closest("[data-stateful]");
      SZ.setRegionState(region, "loading");
      setTimeout(function () { SZ.setRegionState(region, "ready"); SZ.toast("Loaded.", "success", 2000); }, 1000);
    });
  }

  /* ---- Hero / inline video: honours prefers-reduced-motion, pause button,
     pauses when off-screen. --------------------------------------------- */
  function initVideos() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    $$("video[data-autoplay]").forEach(function (v) {
      var btn = document.querySelector('[data-video-toggle="' + v.id + '"]');
      function sync() {
        if (!btn) return;
        var playing = !v.paused;
        btn.setAttribute("aria-label", playing ? "Pause background video" : "Play background video");
        btn.innerHTML = ic(playing ? "pause" : "play");
      }
      if (reduce) { v.removeAttribute("autoplay"); v.pause(); }
      else { var p = v.play(); if (p && p.catch) p.catch(function () { sync(); }); }
      v.addEventListener("play", sync); v.addEventListener("pause", sync); sync();
      if (btn) btn.addEventListener("click", function () { v.dataset.userPaused = v.paused ? "" : "1"; if (v.paused) v.play(); else v.pause(); });
      if ("IntersectionObserver" in window && !reduce) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (!en.isIntersecting) v.pause(); else if (!v.dataset.userPaused) { var q = v.play(); if (q && q.catch) q.catch(function () {}); } });
        }, { threshold: 0.1 }).observe(v);
      }
    });
  }

  /* ---- Gallery (product page) -------------------------------------------- */
  function initGallery() {
    $$("[data-gallery]").forEach(function (g) {
      var main = $("[data-gallery-main]", g);
      $$("[data-gallery-thumb]", g).forEach(function (t) {
        t.addEventListener("click", function () {
          $$("[data-gallery-thumb]", g).forEach(function (x) { x.setAttribute("aria-pressed", x === t ? "true" : "false"); });
          main.src = t.getAttribute("data-src");
          main.alt = t.getAttribute("data-alt");
        });
      });
    });
  }

  /* ---- Quantity steppers ------------------------------------------------- */
  function initSteppers() {
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-stepper] [data-step]");
      if (!b) return;
      var input = $("input", b.closest("[data-stepper]"));
      var min = +input.min || 1, max = +input.max || 999;
      input.value = Math.min(max, Math.max(min, (+input.value || min) + +b.getAttribute("data-step")));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  /* ---- Cart (stock items only; custom builds go review -> deposit) ------- */
  var cart = (SZ.cart = {
    items: function () { return store.get("sz.cart.v1", []); },
    save: function (items) { store.set("sz.cart.v1", items); cart.render(); },
    add: function (item) {
      var items = cart.items();
      var ex = items.filter(function (i) { return i.id === item.id; })[0];
      if (ex) ex.qty += item.qty || 1; else items.push(Object.assign({ qty: 1 }, item));
      cart.save(items);
      SZ.openDialog("cart-drawer");
      SZ.toast(item.title + " added to cart.", "success", 3000);
    },
    setQty: function (id, q) {
      var items = cart.items().map(function (i) { if (i.id === id) i.qty = q; return i; }).filter(function (i) { return i.qty > 0; });
      cart.save(items);
    },
    count: function () { return cart.items().reduce(function (n, i) { return n + i.qty; }, 0); },
    render: function () {
      var n = cart.count();
      $$("[data-cart-count]").forEach(function (b) { b.textContent = n ? n : ""; b.setAttribute("data-count", n); });
      $$("[data-cart-button]").forEach(function (b) { b.setAttribute("aria-label", "Cart, " + n + (n === 1 ? " item" : " items")); });
      var body = $("[data-cart-body]"), foot = $("[data-cart-footer]");
      if (!body) return;
      var items = cart.items();
      var demoEmpty = SZ.demoState() === "empty";
      if (!items.length || demoEmpty) {
        body.innerHTML = '<div class="state">' + '<svg class="state__icon icon" aria-hidden="true"><use href="#i-package"></use></svg>' +
          '<h3>Your cart is empty</h3><p>Stock items land here. Custom builds are paid by deposit from the review page.</p>' +
          '<a class="btn btn--primary" href="configure.html">Build your bag</a><a class="btn btn--secondary" href="shop.html">Browse the shop</a></div>';
        foot.hidden = true;
        return;
      }
      foot.hidden = false;
      body.innerHTML = '<ul class="cart-lines">' + items.map(function (i) {
        return '<li class="cart-line"><div class="cart-line__thumb"><img src="' + esc(i.thumb) + '" alt="" width="72" height="90" loading="lazy"></div>' +
          '<div class="cart-line__meta"><strong>' + esc(i.title) + '</strong><span class="small muted">' + esc(i.variant || "") + "</span>" +
          '<span class="price" data-price="' + esc(i.priceKey) + '"></span>' +
          '<div class="cart-line__actions"><div class="stepper stepper--sm" data-stepper>' +
          '<button type="button" data-step="-1" aria-label="Decrease quantity">−</button>' +
          '<input type="number" min="0" max="99" value="' + i.qty + '" aria-label="Quantity for ' + esc(i.title) + '" data-cart-qty="' + esc(i.id) + '">' +
          '<button type="button" data-step="1" aria-label="Increase quantity">+</button></div>' +
          '<button class="btn btn--ghost btn--sm" type="button" data-cart-remove="' + esc(i.id) + '">' + ic("trash") + "Remove</button></div></div></li>";
      }).join("") + "</ul>";
      SZ.renderPrices();
    }
  });
  function initCart() {
    cart.render();
    document.addEventListener("change", function (e) {
      if (e.target.matches("[data-cart-qty]")) cart.setQty(e.target.getAttribute("data-cart-qty"), Math.max(0, +e.target.value || 0));
    });
    document.addEventListener("click", function (e) {
      var r = e.target.closest("[data-cart-remove]");
      if (r) { cart.setQty(r.getAttribute("data-cart-remove"), 0); SZ.toast("Removed from cart.", "info", 2500); }
      var add = e.target.closest("[data-add-to-cart]");
      if (add) cart.add(JSON.parse(add.getAttribute("data-add-to-cart")));
      var w = e.target.closest("[data-mock-wallet]");
      if (w && !$("#wallet-sheet")) SZ.toast(w.getAttribute("data-mock-wallet") + " is mocked in the prototype (production: Stripe Express Checkout).", "info");
    });
  }

  /* ---- Share / copy helper -------------------------------------------- */
  SZ.copy = function (text, okMsg) {
    function done() { SZ.toast(okMsg || "Link copied.", "success", 3000); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { SZ.toast("Copy this link: " + text, "info", 8000); });
    else SZ.toast("Copy this link: " + text, "info", 8000);
  };

  /* ===========================================================================
     5. BAG RENDERER — 2D SVG fallback. Production: React Three Fiber with named
        material slots (panel_left, stitch, cap_top, logo_decal…) driven by the
        same config. viewBox 300×400, bag centred at x=150.
     ======================================================================== */
  var BAG = (SZ.bag = {});
  var LEN_CM = { "3ft": 91, "4ft": 122, "5ft": 152, "6ft": 183, "7ft": 213, standard: 100, large: 120 };
  BAG.dims = function (item) {
    var t = item.type, L = item.length;
    var map = {
      heavy: { w: 96, h: { "3ft": 170, "4ft": 215, "5ft": 260 }[L] || 215, shape: "cyl" },
      banana: { w: 70, h: { "5ft": 250, "6ft": 280, "7ft": 310 }[L] || 280, shape: "cyl" },
      teardrop: { w: 124, h: { "3ft": 190, "4ft": 230 }[L] || 230, shape: "tear" },
      angle: { w: 110, h: 220, shape: "angle" },
      body: { w: L === "large" ? 170 : 146, h: L === "large" ? 170 : 146, shape: "ball" },
      "double-end": { w: 84, h: 90, shape: "dbl" }
    };
    return map[t] || map.heavy;
  };
  function shapeEl(d, x, y, extra) {
    var w = d.w, h = d.h, cx = 150;
    if (d.shape === "cyl") return '<rect x="' + (cx - w / 2) + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="12" ' + extra + "/>";
    if (d.shape === "ball" || d.shape === "dbl") return '<ellipse cx="' + cx + '" cy="' + (y + h / 2) + '" rx="' + w / 2 + '" ry="' + h / 2 + '" ' + extra + "/>";
    if (d.shape === "tear") {
      return '<path d="M' + (cx - w * 0.28) + " " + y + " L" + (cx + w * 0.28) + " " + y + " C" + (cx + w * 0.55) + " " + (y + h * 0.45) + " " + (cx + w * 0.52) + " " + (y + h) + " " + cx + " " + (y + h) +
        " C" + (cx - w * 0.52) + " " + (y + h) + " " + (cx - w * 0.55) + " " + (y + h * 0.45) + " " + (cx - w * 0.28) + " " + y + ' Z" ' + extra + "/>";
    }
    /* angle bag: wider at the base */
    return '<path d="M' + (cx - w * 0.34) + " " + y + " L" + (cx + w * 0.34) + " " + y + " Q" + (cx + w * 0.5) + " " + (y + h * 0.5) + " " + (cx + w / 2) + " " + (y + h - 10) +
      " Q" + (cx + w / 2) + " " + (y + h) + " " + (cx + w / 2 - 10) + " " + (y + h) + " L" + (cx - w / 2 + 10) + " " + (y + h) + " Q" + (cx - w / 2) + " " + (y + h) + " " + (cx - w / 2) + " " + (y + h - 10) +
      " Q" + (cx - w * 0.5) + " " + (y + h * 0.5) + " " + (cx - w * 0.34) + " " + y + ' Z" ' + extra + "/>";
  }
  function hexToRgb(h) { h = (h || "#000").replace("#", ""); if (h.length === 3) h = h.replace(/./g, "$&$&"); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function lum(h) { var c = hexToRgb(h); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; }
  function shade(h, amt) { var c = hexToRgb(h).map(function (v) { return Math.round(Math.max(0, Math.min(255, v + amt * 255))); }); return "#" + c.map(function (v) { return ("0" + v.toString(16)).slice(-2); }).join(""); }
  BAG.resolve = function (cfg, token) {
    if (!token) return "#111111";
    if (token.indexOf("brand:") === 0) {
      var k = token.slice(6);
      return cfg.brand[k] || { primary: "#a83e26", secondary: "#111111", accent: "#f3eadc" }[k];
    }
    return token;
  };
  BAG.render = function (cfg, opts) {
    opts = opts || {};
    var it = cfg.item, d = BAG.dims(it), cx = 150;
    var dbl = d.shape === "dbl";
    var y0 = dbl ? 150 : 60, x0 = cx - d.w / 2, w = d.w, h = d.h;
    var R = function (t) { return BAG.resolve(cfg, t); };
    var c = [R(it.panels[0]), R(it.panels[1]), R(it.panels[2])];
    var finish = it.finish === "silver" ? "#c4c8cc" : it.finish === "brand" ? R("brand:primary") : "#2a2a2a";
    var stitch = it.stitch === "tonal" ? shade(c[0], lum(c[0]) > 0.5 ? -0.25 : 0.18) : it.stitch === "accent" ? R("brand:accent") : (lum(c[0]) > 0.6 ? "#1a1a1a" : "#f3eadc");
    var id = "b" + Math.random().toString(36).slice(2, 7);
    /* Crop the viewBox to the bag (3:4, matching .cfg__stage) unless the
       180 cm person is shown, which needs the full floor-to-ceiling frame. */
    var floorY = opts.human && !dbl ? 392 : dbl ? 392 : y0 + h + 18;
    var vh = opts.human || dbl ? 400 : Math.max(floorY + 8, (w + 60) / 0.75);
    var vw = vh * 0.75, vx = cx - vw / 2;
    var s = '<svg viewBox="' + vx.toFixed(1) + " 0 " + vw.toFixed(1) + " " + vh.toFixed(1) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="' + id + '-t">' +
      '<title id="' + id + '-t">' + esc(BAG.describe(cfg, opts.view)) + "</title>" +
      "<defs>" + '<clipPath id="' + id + '-clip">' + shapeEl(d, x0, y0, "") + "</clipPath>" +
      '<linearGradient id="' + id + '-shade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".32" stop-color="#000" stop-opacity="0"/>' +
      '<stop offset=".48" stop-color="#fff" stop-opacity=".10"/><stop offset=".66" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>' +
      '<filter id="' + id + '-white"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>' +
      '<filter id="' + id + '-black"><feColorMatrix type="matrix" values="0 0 0 0 .07  0 0 0 0 .07  0 0 0 0 .07  0 0 0 1 0"/></filter>' +
      "</defs>";

    /* floor shadow */
    s += '<ellipse cx="' + cx + '" cy="' + floorY + '" rx="' + (w * 0.6) + '" ry="5" fill="#000" opacity=".45"/>';

    /* hanging hardware */
    if (dbl) {
      s += '<path d="M150 8 V' + y0 + " M150 " + (y0 + h) + ' V392" stroke="#d9d0c0" stroke-width="2" stroke-dasharray="' + (it.hang === "strap" ? "0" : "5 2") + '"/>';
    } else {
      var pts = [x0 + 8, cx - w / 6, cx + w / 6, x0 + w - 8];
      if (d.shape === "tear") pts = [cx - w * 0.26, cx - w * 0.09, cx + w * 0.09, cx + w * 0.26];
      if (d.shape === "angle") pts = [cx - w * 0.32, cx - w * 0.1, cx + w * 0.1, cx + w * 0.32];
      if (d.shape === "ball") pts = [cx - w * 0.3, cx - w * 0.1, cx + w * 0.1, cx + w * 0.3];
      var topY = d.shape === "ball" ? y0 + h * 0.1 : y0;
      var strap = it.hang === "strap";
      pts.forEach(function (px) {
        s += '<line x1="150" y1="' + (it.hang === "hd-swivel" ? 30 : 24) + '" x2="' + px + '" y2="' + (topY + 2) + '" stroke="' + finish + '" stroke-width="' + (strap ? 4 : 2.2) + '" stroke-dasharray="' + (strap ? "0" : "5 2.5") + '" stroke-linecap="round"/>';
      });
      var sw = it.hang === "hd-swivel" ? 9 : 6;
      s += '<rect x="' + (150 - sw / 2) + '" y="8" width="' + sw + '" height="' + (it.hang === "hd-swivel" ? 22 : 16) + '" rx="2" fill="' + finish + '" stroke="#000" stroke-opacity=".4"/>';
      s += '<circle cx="150" cy="8" r="5" fill="none" stroke="' + finish + '" stroke-width="2.5"/>';
    }

    /* panels (clipped to the silhouette) */
    s += '<g clip-path="url(#' + id + '-clip)">';
    var L = it.layout;
    if (L === "single" || !L) s += rect(x0, y0, w, h, c[0]);
    else if (L === "2tone-vertical") s += rect(x0, y0, w / 2, h, c[0]) + rect(cx, y0, w / 2, h, c[1]) + seamV(cx, y0, h, stitch);
    else if (L === "2tone-horizontal") {
      s += rect(x0, y0, w, h, c[0]);
      [[0.2, 0.34], [0.66, 0.8]].forEach(function (b) { s += rect(x0, y0 + h * b[0], w, h * (b[1] - b[0]), c[1]) + seamH(x0, y0 + h * b[0], w, stitch) + seamH(x0, y0 + h * b[1], w, stitch); });
    } else if (L === "3panel") s += rect(x0, y0, w / 3, h, c[0]) + rect(x0 + w / 3, y0, w / 3, h, c[1]) + rect(x0 + 2 * w / 3, y0, w / 3, h, c[2]) + seamV(x0 + w / 3, y0, h, stitch) + seamV(x0 + 2 * w / 3, y0, h, stitch);
    else if (L === "chequer") {
      var cols = 4, rows = Math.max(4, Math.round(h / (w / cols)));
      for (var r = 0; r < rows; r++) for (var k = 0; k < cols; k++) s += rect(x0 + k * w / cols, y0 + r * h / rows, w / cols + 0.5, h / rows + 0.5, (r + k) % 2 ? c[1] : c[0]);
    } else if (L === "patchwork") {
      var pal = [c[0], c[1], c[2], "#6d1a1f", "#1c2b4a", "#c9a45c"];
      var blocks = [[0, 0, 0.5, 0.3], [0.5, 0, 0.5, 0.45], [0, 0.3, 0.35, 0.4], [0.35, 0.3, 0.65, 0.25], [0.35, 0.55, 0.65, 0.45], [0, 0.7, 0.35, 0.3]];
      blocks.forEach(function (b, i) { s += rect(x0 + b[0] * w, y0 + b[1] * h, b[2] * w + 0.5, b[3] * h + 0.5, pal[i % pal.length]); });
    }
    if (it.art === "tigerfull") s += '<image href="assets/bag3d/tiger.png" x="' + (x0 + w * 0.05) + '" y="' + (y0 + h * 0.1) + '" width="' + (w * 0.9) + '" height="' + (h * 0.8) + '" preserveAspectRatio="xMidYMid meet"/>';
    else if (it.art && window.SZ_ART) s += '<image href="' + SZ_ART.url(it.art, 900, 450) + '" x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMid slice"/>';
    /* caps */
    if (d.shape === "cyl" || d.shape === "angle") {
      s += rect(x0, y0, w, 16, R(it.capTop)) + seamH(x0, y0 + 16, w, stitch);
      s += rect(x0, y0 + h - 16, w, 16, R(it.capBottom)) + seamH(x0, y0 + h - 16, w, stitch);
    } else if (d.shape === "tear") {
      s += rect(x0, y0, w, 14, R(it.capTop)) + seamH(x0, y0 + 14, w, stitch);
    }
    /* branding */
    s += BAG.logo(cfg, { x0: x0, y0: y0, w: w, h: h, cx: cx, id: id, view: opts.view, c0: c[0] });
    /* numbering + maker's mark */
    if (it.numbering && !dbl) s += '<text x="' + (x0 + 12) + '" y="' + (y0 + h - 24) + '" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="14" fill="' + stitch + '">' + (opts.view === "back" ? "" : "01") + "</text>";
    if (it.makersMark && opts.view !== "back" && !dbl) s += '<rect x="' + (x0 + w - 26) + '" y="' + (y0 + h - 36) + '" width="16" height="10" rx="1" fill="#e9dcc4"/><text x="' + (x0 + w - 18) + '" y="' + (y0 + h - 28.5) + '" text-anchor="middle" font-size="7" font-weight="700" fill="#a83e26" font-family="Barlow Condensed, sans-serif">S</text>';
    /* volume shading */
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '" fill="url(#' + id + '-shade)"/>';
    s += "</g>";
    /* outline / piping */
    s += shapeEl(d, x0, y0, 'fill="none" stroke="' + (it.piping === "contrast" ? stitch : "#000") + '" stroke-opacity="' + (it.piping === "contrast" ? 1 : 0.6) + '" stroke-width="' + (it.piping === "contrast" ? 3 : 1.5) + '"');
    /* inner edge stitch line */
    if (d.shape === "cyl") s += '<rect x="' + (x0 + 4) + '" y="' + (y0 + 4) + '" width="' + (w - 8) + '" height="' + (h - 8) + '" rx="9" fill="none" stroke="' + stitch + '" stroke-width="1" stroke-dasharray="3 3" opacity=".7"/>';
    /* bottom anchor ring */
    if (it.anchor && !dbl) s += '<circle cx="150" cy="' + (y0 + h + 7) + '" r="5" fill="none" stroke="' + finish + '" stroke-width="2.5"/>';
    /* human for scale (size step) */
    if (opts.human && !dbl) {
      var cm = LEN_CM[it.length] || 120, pxPerCm = h / cm, hh = 180 * pxPerCm, top = 392 - hh;
      if (d.shape === "ball") { pxPerCm = h / (it.length === "large" ? 60 : 50); hh = Math.min(330, 180 * pxPerCm); top = 392 - hh; }
      var hx = 262, hw = hh * 0.2;
      s += '<g fill="#6b5f52" opacity=".75" aria-hidden="true"><circle cx="' + hx + '" cy="' + (top + hh * 0.065) + '" r="' + (hh * 0.065) + '"/>' +
        '<rect x="' + (hx - hw / 2) + '" y="' + (top + hh * 0.14) + '" width="' + hw + '" height="' + (hh * 0.46) + '" rx="' + (hw * 0.3) + '"/>' +
        '<rect x="' + (hx - hw / 2) + '" y="' + (top + hh * 0.55) + '" width="' + (hw * 0.44) + '" height="' + (hh * 0.45) + '" rx="3"/>' +
        '<rect x="' + (hx + hw * 0.06) + '" y="' + (top + hh * 0.55) + '" width="' + (hw * 0.44) + '" height="' + (hh * 0.45) + '" rx="3"/></g>' +
        '<text x="' + hx + '" y="' + (top - 6) + '" text-anchor="middle" font-size="10" fill="#a8977f" font-family="Barlow, sans-serif">180 cm</text>';
    }
    return s + "</svg>";

    function rect(x, y, ww, hh2, fill) { return '<rect x="' + x + '" y="' + y + '" width="' + ww + '" height="' + hh2 + '" fill="' + fill + '"/>'; }
    function seamV(x, y, hh2, col) { return '<line x1="' + (x - 3) + '" y1="' + y + '" x2="' + (x - 3) + '" y2="' + (y + hh2) + '" stroke="' + col + '" stroke-width="1.1" stroke-dasharray="3 3"/><line x1="' + (x + 3) + '" y1="' + y + '" x2="' + (x + 3) + '" y2="' + (y + hh2) + '" stroke="' + col + '" stroke-width="1.1" stroke-dasharray="3 3"/>'; }
    function seamH(x, y, ww, col) { return '<line x1="' + x + '" y1="' + (y + 3) + '" x2="' + (x + ww) + '" y2="' + (y + 3) + '" stroke="' + col + '" stroke-width="1.1" stroke-dasharray="3 3"/>'; }
  };
  BAG.logo = function (cfg, g) {
    var it = cfg.item, b = cfg.brand;
    var place = it.placement || "front";
    if (g.view === "back" && !(place === "front-back" || place === "wrap")) return "";
    var frac = { S: 0.34, M: 0.5, L: 0.68, full: 0.9 }[it.logoSize] || 0.5;
    var lw = g.w * frac, lh = it.logoSize === "full" ? g.h * 0.6 : lw * 0.8;
    var cy = place === "top-band" ? g.y0 + g.h * 0.18 : place === "bottom-band" ? g.y0 + g.h * 0.8 : g.y0 + g.h * 0.4;
    if (it.logoSize === "full") cy = g.y0 + g.h * 0.5;
    var fg = b.logoVariant === "white" ? "#ffffff" : b.logoVariant === "black" ? "#111111" : (b.accent || "#f3eadc");
    var out = "";
    if (place === "wrap") out += '<rect x="' + g.x0 + '" y="' + (cy - lh * 0.45) + '" width="' + g.w + '" height="' + (lh * 0.9) + '" fill="#000" opacity=".18"/>';
    /* method backgrounds */
    if (it.method === "embroidered") out += '<rect x="' + (g.cx - lw / 2 - 6) + '" y="' + (cy - lh / 2 - 6) + '" width="' + (lw + 12) + '" height="' + (lh + 12) + '" rx="4" fill="' + shade(g.c0, lum(g.c0) > 0.5 ? -0.15 : 0.1) + '" stroke="' + fg + '" stroke-width="1" stroke-dasharray="2 2"/>';
    if (it.method === "leather-patch") out += '<rect x="' + (g.cx - lw / 2 - 6) + '" y="' + (cy - lh / 2 - 6) + '" width="' + (lw + 12) + '" height="' + (lh + 12) + '" rx="3" fill="#8a5a3a" stroke="#e9dcc4" stroke-width="1" stroke-dasharray="3 2"/>';
    var debossed = it.method === "debossed";
    if (debossed) fg = shade(g.c0, lum(g.c0) > 0.4 ? -0.22 : -0.08);
    var logoData = b.logo || (SZ._logoCache || null);
    if (logoData && !b.noLogo && /^data:image\/(png|jpe?g|svg|webp|gif)/.test(logoData)) {
      var filt = b.logoVariant === "white" ? ' filter="url(#' + g.id + '-white)"' : b.logoVariant === "black" ? ' filter="url(#' + g.id + '-black)"' : "";
      if (debossed) filt = ' filter="url(#' + g.id + '-black)" opacity=".35"';
      out += '<image href="' + logoData + '" x="' + (g.cx - lw / 2) + '" y="' + (cy - lh / 2) + '" width="' + lw + '" height="' + lh + '" preserveAspectRatio="xMidYMid meet"' + filt + "/>";
    } else {
      /* Text stand-in for the logo: gym name stacked on up to 3 lines */
      var words = (b.name || "YOUR LOGO").toUpperCase().trim().split(/\s+/);
      var lines = words.length <= 3 ? words : [words[0], words[1], words.slice(2).join(" ")];
      var longest = lines.reduce(function (m, l) { return Math.max(m, l.length); }, 3);
      var fam = b.noLogo ? FONT_FAMILY[b.wordmarkFont] || FONT_FAMILY["font-1"] : FONT_FAMILY["font-1"];
      var fs = Math.max(6, Math.min(lh / (lines.length + 0.4), (lw * 1.9) / longest));
      var y1 = cy - ((lines.length - 1) * fs) / 2 + fs * 0.35;
      out += '<text text-anchor="middle" font-family="' + fam + '" font-weight="800" font-size="' + fs.toFixed(1) + '" fill="' + fg + '"' + (debossed ? ' stroke="#000" stroke-opacity=".3" stroke-width=".6"' : "") + ">" +
        lines.map(function (l, i) { return '<tspan x="' + g.cx + '" y="' + (y1 + i * fs).toFixed(1) + '">' + esc(l.slice(0, 14)) + "</tspan>"; }).join("") + "</text>";
    }
    if (it.text && g.view !== "back") {
      var tfs = Math.min(11, (g.w * 1.6) / Math.max(8, it.text.length));
      out += '<text x="' + g.cx + '" y="' + (cy + lh / 2 + 16) + '" text-anchor="middle" font-family="' + (FONT_FAMILY[it.textFont] || FONT_FAMILY["font-1"]) + '" font-weight="600" font-size="' + tfs.toFixed(1) + '" fill="' + fg + '">' + esc(it.text.toUpperCase()) + "</text>";
    }
    return out;
  };
  /* Real-time 3D preview (heavy bag). Geometry is the Blender template exported to glTF (assets/bag3d/viewer.js).
     Other bag types, other layouts and the size step (person for scale) fall back to the SVG drawing. */
  BAG.has3d = function (cfg, opts) {
    var it = cfg.item;
    return it.type === "heavy" && !(opts && opts.human) && (it.layout === "single" || it.layout === "2tone-vertical" || !it.layout) && /^[345]ft$/.test(it.length) && !!window.WebGLRenderingContext;
  };
  BAG.state3d = function (cfg) {
    var it = cfg.item, b = cfg.brand, split = it.layout === "2tone-vertical";
    /* nothing is coloured until the customer picks a colour: unset brand colours stay plain vinyl */
    var R = function (t) { return t && t.indexOf("brand:") === 0 && !cfg.brand[t.slice(6)] ? null : BAG.resolve(cfg, t); };
    var left = R(it.panels[0]), right = R(split ? it.panels[1] : it.panels[0]);
    var fg = b.logoVariant === "white" ? "#ffffff" : b.logoVariant === "black" ? "#111111" : (left ? (b.accent || "#f3eadc") : "#2a2a2a");
    var debossed = it.method === "debossed";
    var words = (b.name || "YOUR LOGO").toUpperCase().trim().split(/\s+/);
    var lines = (words.length <= 3 ? words : [words[0], words[1], words.slice(2).join(" ")]).map(function (l) { return l.slice(0, 14); });
    var logoData = b.logo || SZ._logoCache || null, img = null;
    if (logoData && !b.noLogo && /^data:image\/(png|jpe?g|svg|webp|gif)/.test(logoData)) {
      img = SZ._logoImg && SZ._logoImg.src === logoData ? SZ._logoImg : (SZ._logoImg = new Image());
      if (img.src !== logoData) { img.onload = function () { if (SZ._redraw3d) SZ._redraw3d(); }; img.src = logoData; }
    }
    var lc = left || "#b4b4b4";
    return {
      length: it.length, left: left, right: right, top: R(it.capTop), bottom: R(it.capBottom), split: split,
      finish: it.finish, brandPrimary: cfg.brand.primary || null, art: it.art || null,
      decal: {
        placement: it.placement || "front", size: it.logoSize, frac: { S: 0.34, M: 0.5, L: 0.68, full: 0.9 }[it.logoSize] || 0.5,
        fg: fg, img: img, variant: b.logoVariant, lines: lines, debossed: debossed, method: it.method,
        patchFill: shade(lc, lum(lc) > 0.5 ? -0.15 : 0.1),
        fam: b.noLogo ? FONT_FAMILY[b.wordmarkFont] || FONT_FAMILY["font-1"] : FONT_FAMILY["font-1"],
        text: it.text ? it.text.toUpperCase() : "", textFam: FONT_FAMILY[it.textFont] || FONT_FAMILY["font-1"]
      }
    };
  };
  BAG.describe = function (cfg, view) {
    var it = cfg.item;
    var t = OPT.types.filter(function (x) { return x.v === it.type; })[0];
    return (view === "back" ? "Back view: " : "Preview: ") + (t ? t.t : "bag") + (it.length ? ", " + it.length : "") + ", " + label(OPT.layout, it.layout) + ", " + label(OPT.method, it.method) + " logo, " + label(OPT.placement, it.placement) + ".";
  };

  /* ===========================================================================
     6. CONFIG ENGINE (state + rules). Production: packages/config3d schema +
        Zod rules shared with the server, which recomputes everything.
     ======================================================================== */
  var CFG_KEY = "sz.config.v1";
  var CONFIG = (SZ.config = {});
  CONFIG.schemaVersion = "bag@0.1.1-prototype";
  CONFIG.defaults = function () {
    return {
      schemaVersion: CONFIG.schemaVersion,
      configId: "CFG-PROTO-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      step: 0, reached: 0, touched: {}, updatedAt: null,
      brand: { name: "", noLogo: false, wordmarkFont: "font-1", logo: null, logoName: "", logoWidth: null, logoVariant: "full", primary: "", secondary: "", accent: "#f3eadc", pantone: "", vibe: "oldschool" },
      buyer: { type: "", country: "" },
      item: {
        product: "bag", type: "heavy", length: "4ft", fill: "filled", fillType: "shredded", material: "vinyl",
        layout: "2tone-vertical", panels: ["brand:primary", "brand:secondary", "#f3eadc"], capTop: "brand:secondary", capBottom: "brand:secondary",
        stitch: "contrast", piping: "none", method: "silicone-screen", placement: "front", logoSize: "M", text: "", textFont: "font-1",
        numbering: false, makersMark: true, hang: "4pt-swivel", anchor: true, finish: "black", qty: 1, eachDifferent: false, extras: []
      }
    };
  };
  CONFIG.load = function () {
    var c = store.get(CFG_KEY, null);
    if (!c || c.schemaVersion !== CONFIG.schemaVersion) return null;
    return c;
  };
  CONFIG.save = function (c) {
    c.updatedAt = new Date().toISOString();
    var copy = JSON.parse(JSON.stringify(c));
    if (copy.brand.logo && copy.brand.logo.length > 900000) { SZ._logoCache = copy.brand.logo; copy.brand.logo = null; copy.brand.logoSessionOnly = true; }
    if (!store.set(CFG_KEY, copy)) SZ.toast("Couldn't autosave in this browser. Your design is kept for this session.", "warning");
  };
  CONFIG.clear = function () { store.del(CFG_KEY); };
  CONFIG.get = function (c, path) { return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, c); };
  CONFIG.set = function (c, path, v) {
    var ks = path.split("."), o = c;
    for (var i = 0; i < ks.length - 1; i++) o = o[ks[i]];
    o[ks[ks.length - 1]] = v;
  };
  CONFIG.isSkipped = function (c, step) { return !!(step.skip && step.skip.indexOf(c.item.type) > -1); };
  CONFIG.isExport = function (c) { return !!c.buyer.country && c.buyer.country !== "AU"; };
  CONFIG.quoteReasons = function (c) {
    var r = [];
    if (c.item.layout === "patchwork") r.push("Custom patchwork layout");
    if (c.item.extras.indexOf("gloves-pads") > -1) r.push("Matching gloves or pads");
    if (c.item.qty >= 100) r.push("Franchise quantity (100+)");
    if (c.buyer.type === "franchise") r.push("Franchise order");
    if (c.item.fillType === "custom") r.push("Custom fill");
    return r;
  };
  CONFIG.mode = function (c) { return CONFIG.quoteReasons(c).length ? "quote" : "deposit"; };
  CONFIG.tierIndex = function (q) { for (var i = 0; i < OPT.tiers.length; i++) if (q >= OPT.tiers[i][1] && q <= OPT.tiers[i][2]) return i; return 0; };
  CONFIG.colourName = function (c, token) {
    if (!token) return "—";
    if (token.indexOf("brand:") === 0) { var k = token.slice(6); return "Brand " + k + " (" + (c.brand[k] || "not set") + ")"; }
    var hit = D.colours.filter(function (x) { return x[0] === token; })[0];
    return (hit ? hit[1] + " " : "") + token.toUpperCase();
  };
  /* Rules = guard rails. Called after every change; returns side-effect messages. */
  CONFIG.applyRules = function (c, changed) {
    var msgs = [], it = c.item;
    if (changed === "buyer.country") {
      var row = D.countries.filter(function (x) { return x[0] === c.buyer.country; })[0];
      if (row) SZ.setCurrency(row[2], true);
      if (!c.touched["item.fill"]) it.fill = CONFIG.isExport(c) ? "unfilled" : "filled";
      if (CONFIG.isExport(c)) msgs.push(["info", "Export destination: bags default to unfilled (filled on site). Currency set to " + (row ? row[2] : "USD") + "."]);
    }
    if (changed === "item.type") {
      var t = OPT.types.filter(function (x) { return x.v === it.type; })[0];
      if (t) it.length = t.def;
    }
    if (it.method === "debossed" && it.material !== "leather") {
      it.method = "silicone-screen";
      if (changed === "item.material") msgs.push(["warning", "Debossed branding needs genuine leather, so we switched to silicone screen print."]);
    }
    if (changed === "item.qty" && it.qty > 1 && !c.touched["item.numbering"]) { it.numbering = true; msgs.push(["info", "Station numbering turned on for multiple bags."]); }
    if (changed === "item.layout" && it.layout === "patchwork") msgs.push(["info", "Custom patchwork goes to a quote. You can still design it here."]);
    return msgs;
  };
  /* Summary rows for review + spec sheet. Each group links back to its step. */
  CONFIG.summary = function (c) {
    var it = c.item, b = c.brand, g = [];
    var t = OPT.types.filter(function (x) { return x.v === it.type; })[0] || {};
    var len = (t.lengths || []).filter(function (l) { return l[0] === it.length; })[0];
    var country = D.countries.filter(function (x) { return x[0] === c.buyer.country; })[0];
    var dbl = it.type === "double-end";
    g.push({ step: 0, title: "Your brand", rows: [
      ["Gym / buyer", b.name || "—"], ["Logo", b.noLogo ? "Text wordmark (" + label(OPT.font, b.wordmarkFont) + ")" : (b.logoName || "Not uploaded yet")],
      ["Logo variant", label(OPT.logoVariant, b.logoVariant)], ["Brand colours", [b.primary || "primary not set", b.secondary, b.accent].filter(Boolean).join(" · ") + (b.pantone ? " (Pantone " + b.pantone + ")" : "")],
      ["Vibe", label(OPT.vibe, b.vibe)], ["Buyer type", b && c.buyer.type ? label(OPT.buyerType, c.buyer.type) : "—"], ["Delivery", country ? country[1] : "—"]] });
    g.push({ step: 1, title: "Bag", rows: [["Type", t.t || it.type]].concat(dbl ? [] : [
      ["Size", (it.length || "—") + (len && len[1] ? " · target " + len[1] + " (PLACEHOLDER)" : "")],
      ["Fill", label(OPT.fill, it.fill) + " · " + label(OPT.fillType, it.fillType)], ["Material", label(OPT.material, it.material)]]) });
    g.push({ step: 5, title: "Colours", rows: [["Layout", label(OPT.layout, it.layout)],
      ["Panels", it.panels.slice(0, { single: 1, "2tone-vertical": 2, "2tone-horizontal": 2, "3panel": 3, chequer: 2, patchwork: 3 }[it.layout] || 1).map(function (p) { return CONFIG.colourName(c, p); }).join(" / ")],
      ["Caps", "Top " + CONFIG.colourName(c, it.capTop) + ", bottom " + CONFIG.colourName(c, it.capBottom)], ["Stitching", label(OPT.stitch, it.stitch)], ["Piping", label(OPT.piping, it.piping)]] });
    g.push({ step: 6, title: "Branding", rows: [["Method", label(OPT.method, it.method)], ["Placement", label(OPT.placement, it.placement)], ["Logo size", label(OPT.logoSize, it.logoSize)],
      ["Extra text", it.text ? "“" + it.text + "” (" + label(OPT.font, it.textFont) + ")" : "None"], ["Numbering", it.numbering ? "Station 01–" + ("0" + it.qty).slice(-2) : "Off"], ["Maker's mark", it.makersMark ? "On" : "Removed (fee PLACEHOLDER)"]] });
    if (!dbl) g.push({ step: 7, title: "Hardware", rows: [["Hanging", label(OPT.hang, it.hang)], ["Bottom anchor ring", it.anchor ? "Yes" : "No"], ["Finish", label(OPT.finish, it.finish)]] });
    g.push({ step: 8, title: "Quantity and extras", rows: [["Quantity", it.qty + " · tier " + OPT.tiers[CONFIG.tierIndex(it.qty)][0] + (it.eachDifferent ? " · each bag different" : "")],
      ["Extras", it.extras.length ? it.extras.map(function (e) { return label(OPT.extras, e); }).join(", ") : "None"]] });
    return g;
  };

  /* ===========================================================================
     7. PAGE CONTROLLERS
     ======================================================================== */

  /* ---------- 7a. Configurator ------------------------------------------- */
  function fieldId(name, v) { return "f-" + name.replace(/[^a-z0-9]+/gi, "-") + (v != null ? "-" + String(v).replace(/[^a-z0-9]+/gi, "-") : ""); }
  var UI = {
    text: function (name, lbl, val, o) {
      o = o || {};
      var id = fieldId(name);
      return '<div class="field"><label class="field__label" for="' + id + '">' + lbl + (o.required ? ' <span class="req" aria-hidden="true">*</span>' : "") + "</label>" +
        (o.hint ? '<p class="field__hint" id="' + id + '-hint">' + o.hint + "</p>" : "") +
        '<input class="input" id="' + id + '" name="' + name + '" type="text" value="' + esc(val) + '"' + (o.required ? " required" : "") + (o.maxlength ? ' maxlength="' + o.maxlength + '"' : "") +
        (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : "") + (o.autocomplete ? ' autocomplete="' + o.autocomplete + '"' : "") + (o.hint ? ' aria-describedby="' + id + '-hint"' : "") +
        (o.error ? ' data-error="' + esc(o.error) + '"' : "") + ">" +
        (o.counter ? '<p class="field__hint" aria-live="polite" data-counter-for="' + id + '">' + (val || "").length + "/" + o.maxlength + "</p>" : "") + "</div>";
    },
    select: function (name, lbl, opts, val, o) {
      o = o || {};
      var id = fieldId(name);
      return '<div class="field"><label class="field__label" for="' + id + '">' + lbl + (o.required ? ' <span class="req" aria-hidden="true">*</span>' : "") + "</label>" +
        (o.hint ? '<p class="field__hint">' + o.hint + "</p>" : "") +
        '<select class="select" id="' + id + '" name="' + name + '"' + (o.required ? " required" : "") + ">" + (o.empty ? '<option value="">' + o.empty + "</option>" : "") +
        opts.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === val ? " selected" : "") + ">" + x[1] + "</option>"; }).join("") + "</select></div>";
    },
    cards: function (name, legend, opts, val, o) {
      o = o || {};
      return '<fieldset class="field"><legend>' + legend + "</legend>" + (o.hint ? '<p class="field__hint">' + o.hint + "</p>" : "") +
        '<div class="choice-grid" style="--choice-min:' + (o.min || "9.5rem") + '">' +
        opts.map(function (x) {
          var id = fieldId(name, x[0]), dis = o.disabled && o.disabled(x[0]);
          return '<label class="choice" for="' + id + '"><input type="radio" id="' + id + '" name="' + name + '" value="' + x[0] + '"' + (x[0] === val ? " checked" : "") + (dis ? " disabled" : "") + ">" +
            '<span class="choice__box">' + (o.art ? '<span class="choice__art" aria-hidden="true">' + o.art(x[0]) + "</span>" : "") +
            '<span class="choice__title">' + x[1] + "</span>" + (x[2] ? '<span class="choice__desc">' + x[2] + "</span>" : "") +
            (dis && o.disabledHint ? '<span class="choice__desc">' + o.disabledHint + "</span>" : "") + "</span></label>";
        }).join("") + "</div></fieldset>";
    },
    seg: function (name, legend, opts, val) {
      return '<fieldset class="field"><legend>' + legend + '</legend><div class="seg">' + opts.map(function (x) {
        var id = fieldId(name, x[0]);
        return '<label class="choice" for="' + id + '"><input type="radio" id="' + id + '" name="' + name + '" value="' + x[0] + '"' + (x[0] === val ? " checked" : "") + '><span class="choice__box"><span class="choice__title">' + x[1] + "</span></span></label>";
      }).join("") + "</div></fieldset>";
    },
    toggle: function (name, lbl, on, hint) {
      var id = fieldId(name);
      return '<div class="field"><label class="switch" for="' + id + '"><span><span class="field__label">' + lbl + "</span>" + (hint ? '<span class="field__hint" style="display:block">' + hint + "</span>" : "") +
        '</span><input type="checkbox" role="switch" id="' + id + '" name="' + name + '" data-type="bool"' + (on ? " checked" : "") + "></label></div>";
    },
    swatches: function (c, name, legend, val, o) {
      o = o || {};
      var leather = c.item.material === "leather";
      var brand = [["brand:primary", "Brand primary"], ["brand:secondary", "Brand secondary"], ["brand:accent", "Brand accent"]].filter(function (x) { return c.brand[x[0].slice(6)]; });
      function one(token, nm, isBrand) {
        var hex = BAG.resolve(c, token), id = fieldId(name, token);
        var dis = leather && !isBrand && D.leatherColours.indexOf(token) < 0;
        return '<label class="swatch' + (isBrand ? " swatch--brand" : "") + '" for="' + id + '" title="' + esc(nm) + '"><input type="radio" id="' + id + '" name="' + name + '" value="' + token + '"' + (token === val ? " checked" : "") + (dis ? " disabled" : "") + '>' +
          '<span class="swatch__chip" style="--swatch:' + hex + '"></span><span class="visually-hidden">' + esc(nm) + (dis ? " (not available in leather)" : "") + "</span></label>";
      }
      return '<fieldset class="field"><legend>' + legend + ' <span class="muted small">' + esc(CONFIG.colourName(c, val)) + "</span></legend>" +
        '<div class="swatches">' + brand.map(function (x) { return one(x[0], x[1] + " " + c.brand[x[0].slice(6)], true); }).join("") + D.colours.map(function (x) { return one(x[0], x[1]); }).join("") + "</div></fieldset>";
    },
    checks: function (name, legend, opts, vals) {
      return '<fieldset class="field"><legend>' + legend + '</legend><div class="check-group">' + opts.map(function (x) {
        var id = fieldId(name, x[0]);
        return '<label class="check" for="' + id + '"><input type="checkbox" id="' + id + '" name="' + name + '" value="' + x[0] + '" data-type="list"' + (vals.indexOf(x[0]) > -1 ? " checked" : "") + '><span><span class="choice__title">' + x[1] + "</span>" + (x[2] ? '<br><span class="small muted">' + x[2] + "</span>" : "") + "</span></label>";
      }).join("") + "</div></fieldset>";
    },
    color: function (name, lbl, val, o) {
      o = o || {};
      var id = fieldId(name);
      return '<div class="field"><label class="field__label" for="' + id + '-hex">' + lbl + (o.required ? ' <span class="req" aria-hidden="true">*</span>' : "") + "</label>" +
        '<div class="color-field"><input type="color" id="' + id + '" value="' + (val || "#b4b4b4") + '" data-color-for="' + name + '" aria-label="' + esc(lbl) + ' picker">' +
        '<input class="input mono" id="' + id + '-hex" name="' + name + '" type="text" value="' + esc(val) + '" placeholder="#RRGGBB" pattern="^#[0-9a-fA-F]{6}$" title="Use a 6-digit HEX code like #A83E26" maxlength="7" spellcheck="false" autocomplete="off"' + (o.required ? ' required data-error="Choose your primary brand colour (HEX like #A83E26)"' : "") + "></div></div>";
    }
  };
  function typeArt(v) {
    var fake = { item: { type: v, length: (OPT.types.filter(function (t) { return t.v === v; })[0] || {}).def } };
    var d = BAG.dims(fake.item), y = v === "double-end" ? 150 : 60;
    return '<svg viewBox="40 0 220 400" style="height:72px">' + (v === "double-end" ? '<path d="M150 20V150M150 240V380" stroke="currentColor" stroke-width="4"/>' : '<path d="M150 14 L' + (150 - d.w / 3) + " " + y + " M150 14 L" + (150 + d.w / 3) + " " + y + '" stroke="currentColor" stroke-width="4"/>') +
      shapeEl(d, 150 - d.w / 2, y, 'fill="currentColor"') + "</svg>";
  }
  function layoutArt(v) {
    var c = { brand: { primary: "#e0724f", secondary: "#3a2e25", accent: "#f3eadc" }, item: { type: "heavy", length: "3ft", layout: v, panels: ["brand:primary", "brand:secondary", "#f3eadc"], capTop: "#1a1a1a", capBottom: "#1a1a1a", stitch: "contrast", piping: "none", method: "silicone-screen", placement: "front", logoSize: "S", extras: [] } };
    c.brand.name = " ";
    return BAG.render(c).replace("<svg ", '<svg style="height:72px" ');
  }

  var STEP_HTML = {
    brand: function (c) {
      var b = c.brand;
      var logoBlock = b.noLogo
        ? UI.select("brand.wordmarkFont", "Wordmark font " + ph("PLACEHOLDER: 4 font names"), OPT.font, b.wordmarkFont, { hint: "We'll set your gym name as a text wordmark." })
        : '<div class="field"><span class="field__label" id="logo-lbl">Logo upload</span>' +
          '<div class="file-drop" data-file-drop>' + ic("upload") + '<span><strong>Drag and drop your logo</strong> or choose a file</span><span class="small muted">SVG or vector preferred (SVG, PNG, PDF, AI, EPS). Raster at least 2000px.</span>' +
          '<input type="file" id="f-brand-logo" name="brand.logo" accept=".svg,.png,.pdf,.ai,.eps,image/svg+xml,image/png,application/pdf" aria-labelledby="logo-lbl" aria-describedby="logo-help"></div>' +
          '<p class="field__hint" id="logo-help">Background removal runs on your device in production (WASM). ' + ph("PLACEHOLDER: max file size") + "</p>" +
          (b.logoName ? '<div class="file-preview">' + (b.logo || SZ._logoCache ? '<img src="' + esc(b.logo || SZ._logoCache) + '" alt="Your uploaded logo">' : "") + '<div class="stack stack--sm"><strong class="small">' + esc(b.logoName) + "</strong>" + logoCheck(b) + '</div><button class="btn btn--ghost btn--sm" type="button" data-remove-logo>' + ic("trash") + "Remove</button></div>" : "") + "</div>";
      return UI.text("brand.name", "Gym / buyer name", b.name, { required: true, autocomplete: "organization", placeholder: "e.g. City Fight Club", hint: "Used on the spec sheet and optionally printed.", error: "Enter your gym or buyer name" }) +
        UI.toggle("brand.noLogo", "I don't have a logo yet", b.noLogo, "We'll set a text wordmark in one of four fonts.") + logoBlock +
        (b.noLogo ? "" : UI.seg("brand.logoVariant", "Logo variant", OPT.logoVariant, b.logoVariant)) +
        '<div class="field__row">' + UI.color("brand.primary", "Primary brand colour", b.primary, { required: true }) + UI.text("brand.pantone", "Pantone (optional)", b.pantone, { placeholder: "e.g. 186 C", maxlength: 20 }) + "</div>" +
        '<div class="field__row">' + UI.color("brand.secondary", "Secondary colour (optional)", b.secondary) + UI.color("brand.accent", "Accent colour (optional)", b.accent) + "</div>" +
        UI.cards("brand.vibe", "Brand vibe <span class='muted small'>(drives preview lighting)</span>", OPT.vibe, b.vibe, { min: "8rem" }) +
        '<div class="field__row">' + UI.select("buyer.type", "Buyer type", OPT.buyerType, c.buyer.type, { empty: "Choose…" }) +
        UI.select("buyer.country", "Country / delivery", D.countries.map(function (x) { return [x[0], x[1] + " (" + x[2] + ")"]; }), c.buyer.country, { empty: "Choose…", hint: "Sets currency, duty note and lead time. " + ph("PLACEHOLDER: currency per country") }) + "</div>";
    },
    type: function (c) {
      return UI.cards("item.type", "Bag type", OPT.types.map(function (t) { return [t.v, t.t, t.d]; }), c.item.type, { art: typeArt, min: "9rem" });
    },
    size: function (c) {
      var t = OPT.types.filter(function (x) { return x.v === c.item.type; })[0];
      return UI.cards("item.length", "Length", t.lengths.map(function (l) { return [l[0], l[0] === "standard" || l[0] === "large" ? l[0][0].toUpperCase() + l[0].slice(1) : l[0], l[1] ? "Target filled weight " + l[1] + " " + ph("PLACEHOLDER") : ph("PLACEHOLDER: weight")]; }), c.item.length, { min: "7rem" }) +
        '<dl class="summary-list"><dt>Diameter</dt><dd>' + ph("PLACEHOLDER: diameter per size") + "</dd><dt>Scale</dt><dd>The preview shows a 180 cm person next to the bag.</dd></dl>";
    },
    fill: function (c) {
      return (CONFIG.isExport(c) ? notice("info", "Export destination: we recommend <strong>unfilled</strong> (filled on site). Freight saving " + ph("PLACEHOLDER") + ". Duty and VAT note: " + ph("PLACEHOLDER: DDP vs DAP undecided")) : "") +
        UI.cards("item.fill", "Fill", OPT.fill, c.item.fill, { min: "12rem" }) + UI.cards("item.fillType", "Fill type", OPT.fillType, c.item.fillType, { min: "10rem" }) +
        (c.item.fillType === "custom" ? notice("info", "Custom fill goes to a quote. Tell us what you need on the review page.") : "");
    },
    material: function (c) {
      return UI.cards("item.material", "Material", OPT.material, c.item.material, { min: "12rem" }) +
        '<button class="btn btn--secondary btn--sm" type="button" data-open="swatch-modal" style="align-self:flex-start">' + ic("zoom") + "Zoom swatch</button>" +
        '<p class="small muted">Material specifications (weight, thickness, colour range) ' + ph("PLACEHOLDER: from Jesse") + "</p>";
    },
    colours: function (c) {
      var it = c.item, n = { single: 1, "2tone-vertical": 2, "2tone-horizontal": 2, "3panel": 3, chequer: 2, patchwork: 3 }[it.layout] || 1;
      var names = n === 1 ? ["Panel colour"] : it.layout === "2tone-vertical" ? ["Left panel", "Right panel"] : it.layout === "2tone-horizontal" ? ["Body", "Bands"] : it.layout === "chequer" ? ["Chequer A", "Chequer B"] : ["Panel 1", "Panel 2", "Panel 3"];
      var out = UI.cards("item.layout", "Panel layout", OPT.layout, it.layout, { art: layoutArt, min: "7.5rem" });
      if (it.material === "leather") {
        var bad = it.panels.slice(0, n).some(function (p) { return p.indexOf("brand:") !== 0 && D.leatherColours.indexOf(p) < 0; });
        out += notice(bad ? "warning" : "info", "Genuine leather comes in a limited colour range " + ph("PLACEHOLDER: leather colours") + "." + (bad ? ' <button class="btn btn--link" type="button" data-fix="leather-colours">Fix: use leather colours</button>' : ""));
      }
      for (var i = 0; i < n; i++) out += UI.swatches(c, "item.panels." + i, names[i], it.panels[i]);
      if (it.type !== "body" && it.type !== "double-end") out += UI.swatches(c, "item.capTop", "Top cap", it.capTop) + (it.type === "teardrop" ? "" : UI.swatches(c, "item.capBottom", "Bottom cap", it.capBottom));
      out += UI.seg("item.stitch", "Stitching colour", OPT.stitch, it.stitch) + UI.seg("item.piping", "Piping or trim", OPT.piping, it.piping);
      return '<p class="field__hint">' + ph("PLACEHOLDER: colour library (about 20) to be confirmed by Jesse") + "</p>" + out;
    },
    branding: function (c) {
      var it = c.item;
      return UI.cards("item.method", "Branding method", OPT.method, it.method, { min: "9rem", disabled: function (v) { return v === "debossed" && it.material !== "leather"; }, disabledHint: "Needs genuine leather (step A4)" }) +
        UI.seg("item.placement", "Placement", OPT.placement, it.placement) + UI.seg("item.logoSize", "Logo size", OPT.logoSize, it.logoSize) +
        '<div class="field__row">' + UI.text("item.text", "Extra text (optional)", it.text, { maxlength: 30, counter: true, placeholder: "e.g. Stronger together" }) + UI.select("item.textFont", "Font " + ph("PLACEHOLDER: 4 fonts"), OPT.font, it.textFont) + "</div>" +
        UI.toggle("item.numbering", "Station numbering", it.numbering, "“Station 01–12” sequence. On automatically when quantity is more than 1.") +
        UI.toggle("item.makersMark", "Sanchez maker's mark", it.makersMark, "Small, on by default. Can be removed on franchise orders (fee " + ph("PLACEHOLDER") + ").");
    },
    hardware: function (c) {
      var it = c.item;
      return UI.cards("item.hang", "Hanging", OPT.hang, it.hang, { min: "10rem" }) +
        UI.seg("item.anchor", "Bottom anchor ring", [["yes", "Yes"], ["no", "No"]], it.anchor ? "yes" : "no") +
        UI.seg("item.finish", "Hardware finish", OPT.finish, it.finish) + (it.finish === "brand" ? '<p class="small muted">Brand-colour powder coat ' + ph("PLACEHOLDER: price") + "</p>" : "");
    },
    quantity: function (c) {
      var it = c.item, ti = CONFIG.tierIndex(it.qty);
      return '<div class="field"><label class="field__label" for="f-item-qty">Quantity</label><div class="stepper" data-stepper><button type="button" data-step="-1" aria-label="Decrease quantity">−</button>' +
        '<input id="f-item-qty" name="item.qty" type="number" inputmode="numeric" min="1" max="999" value="' + it.qty + '" data-type="num"><button type="button" data-step="1" aria-label="Increase quantity">+</button></div>' +
        '<p class="field__hint">1 to 100+. 100 or more goes to a franchise quote.</p></div>' +
        '<table class="tier-table"><caption class="visually-hidden">Price tiers</caption><thead><tr><th scope="col">Tier</th><th scope="col">Unit discount</th></tr></thead><tbody>' +
        OPT.tiers.map(function (t, i) { return '<tr class="' + (i === ti ? "is-active" : "") + '"><td>' + t[0] + (i === ti ? ' <span class="visually-hidden">(your tier)</span>' : "") + "</td><td>" + ph("PLACEHOLDER") + "</td></tr>"; }).join("") + "</tbody></table>" +
        UI.toggle("item.eachDifferent", "Make each bag different", it.eachDifferent, "Turns on per-bag editing (production). The prototype designs one bag.");
    },
    extras: function (c) {
      return UI.checks("item.extras", "Extras", OPT.extras.map(function (x) { return [x[0], x[1], (x[2] ? x[2] + ". " : "") + ""]; }), c.item.extras) +
        '<p class="small muted">Extras pricing ' + ph("PLACEHOLDER") + "</p>";
    }
  };
  function notice(type, html) { return '<div class="notice notice--' + type + '">' + ic(type === "warning" ? "alert" : type === "error" ? "x-circle" : type === "success" ? "check" : "info") + "<div>" + html + "</div></div>"; }
  SZ.notice = notice;
  function logoCheck(b) {
    if (/\.(svg|ai|eps|pdf)$/i.test(b.logoName || "")) return '<span class="badge badge--success">' + ic("check") + "Vector file</span>" + (/\.(ai|eps|pdf)$/i.test(b.logoName) ? '<span class="xsmall muted">Preview shows text until the file is processed (server-side in production).</span>' : "");
    if (b.logoWidth && b.logoWidth < 1000) return '<span class="badge badge--danger">' + ic("alert") + "Low resolution (" + b.logoWidth + 'px)</span><span class="xsmall">Under 1000px will print soft. We can vectorise it (fee ' + ph("PLACEHOLDER") + ").</span>";
    if (b.logoWidth && b.logoWidth < 2000) return '<span class="badge badge--warning">' + ic("alert") + b.logoWidth + 'px wide</span><span class="xsmall muted">At least 2000px is recommended.</span>';
    if (b.logoWidth) return '<span class="badge badge--success">' + ic("check") + b.logoWidth + "px, print ready</span>";
    return "";
  }

  function initConfigurator() {
    var root = $("#configurator");
    if (!root) return;
    var c = CONFIG.load() || CONFIG.defaults();
    /* entry params from the product page, e.g. ?type=heavy&length=5ft */
    var pt = param("type"), pl = param("length");
    if (pt && OPT.types.some(function (t) { return t.v === pt; })) { c.item.type = pt; CONFIG.applyRules(c, "item.type"); }
    if (pl) c.item.length = pl;
    if (param("fresh") === "1") c = CONFIG.defaults();
    var view = "front";
    var panel = $("[data-cfg-panel]", root), stage = $("[data-cfg-stage]", root), nav = $("[data-cfg-nav]", root);
    var live = $("[data-cfg-live]", root), preview = $("[data-cfg-preview]", root);
    var hashStep = /^#step-(\d+)$/.exec(location.hash);
    if (hashStep && +hashStep[1] <= c.reached) c.step = +hashStep[1];

    function visibleSteps() { return STEPS.map(function (s, i) { return i; }).filter(function (i) { return !CONFIG.isSkipped(c, STEPS[i]); }); }
    /* Sanchez Custom: off-the-shelf colourways, sampled from Sanchez's own finished bags */
    var PRESETS = [
      { id: "royal-blue", name: "Royal Blue", layout: "single", a: "#0b6fe8", caps: "#f7f7f2" },
      { id: "fight-red", name: "Fight Red", layout: "single", a: "#ef2a12", caps: "#f7f7f2" },
      { id: "gold-black", name: "Gold & Black", layout: "2tone-vertical", a: "#e2b10a", b: "#0d0f12", caps: "#f7f7f2" },
      { id: "green-red", name: "Green & Red", layout: "2tone-vertical", a: "#1f5c3a", b: "#dc3a22", caps: "#f7f7f2" },
      { id: "tigerfull", name: "Tiger Full", layout: "single", a: "#f7f7f2", b: "#b4402e", caps: "#7a1f16", art: "tigerfull" },
      { id: "fractal", name: "Fractal", layout: "single", a: "#e11d0c", caps: "#0b0b18", art: "hex" }
    ];
    var presetBox = $("[data-cfg-presets]", root);
    function presetOn(pr) {
      var it = c.item, lo = function (x) { return (x || "").toLowerCase(); };
      return (it.art || null) === (pr.art || null) && it.layout === pr.layout && lo(it.panels[0]) === pr.a && (pr.layout === "single" || lo(it.panels[1]) === pr.b) && lo(it.capTop) === pr.caps && lo(it.capBottom) === pr.caps;
    }
    function renderPresets() {
      if (!presetBox) return;
      presetBox.innerHTML = '<p class="eyebrow">Sanchez Custom</p><p class="xsmall muted">Off-the-shelf bags. Tap one to try it on the preview.</p>' +
        '<div class="presets__grid" role="group" aria-label="Sanchez Custom colourways">' + PRESETS.map(function (pr) {
          return '<button class="preset" type="button" data-preset="' + pr.id + '" aria-pressed="' + presetOn(pr) + '" title="' + esc(pr.name) + '">' +
            '<span class="preset__chip" aria-hidden="true">' + (pr.art === "tigerfull" ? '<i style="background:#f7f7f2"></i><i style="background:#b4402e url(assets/bag3d/tiger.png) center/cover"></i>' : pr.art && window.SZ_ART ? '<i style="background:url(' + SZ_ART.url(pr.art, 160, 80) + ') center/cover"></i>' : '<i style="background:' + pr.a + '"></i>' + (pr.b ? '<i style="background:' + pr.b + '"></i>' : "")) + "</span>" +
            '<span class="preset__name">' + esc(pr.name) + "</span></button>";
        }).join("") + "</div>";
    }
    if (presetBox) presetBox.addEventListener("click", function (e) {
      var b = e.target.closest("[data-preset]"); if (!b) return;
      var pr = PRESETS.filter(function (x) { return x.id === b.getAttribute("data-preset"); })[0];
      c.item.layout = pr.layout; c.item.panels = [pr.a, pr.b || pr.a, c.item.panels[2]];
      c.item.capTop = pr.caps; c.item.capBottom = pr.caps; c.item.art = pr.art || null;
      CONFIG.save(c); renderStep(false);
    });
    function renderPreview() {
      renderPresets();
      var ro = { view: view, human: STEPS[c.step].id === "size" }, is3d = BAG.has3d(c, ro);
      var toggle = $(".cfg__view-toggle", root);
      if (is3d) {
        if (toggle) toggle.hidden = true;
        stage.setAttribute("data-3d", ""); stage.style.aspectRatio = "";
        if (!stage.__viewer) {
          stage.innerHTML = ""; stage.__viewer = "pending";
          import("./assets/bag3d/viewer.js").then(function (m) {
            try { stage.__viewer = m.createBagViewer(stage); SZ._redraw3d = function () { if (stage.__viewer && stage.__viewer.update) stage.__viewer.update(BAG.state3d(c)); }; SZ._redraw3d(); }
            catch (err) { stage.__viewer = null; stage.removeAttribute("data-3d"); if (toggle) toggle.hidden = false; stage.innerHTML = BAG.render(c, ro); }
          }).catch(function () { stage.__viewer = null; stage.removeAttribute("data-3d"); if (toggle) toggle.hidden = false; stage.innerHTML = BAG.render(c, ro); });
        } else if (stage.__viewer.update) stage.__viewer.update(BAG.state3d(c));
      } else {
        if (stage.__viewer && stage.__viewer.dispose) stage.__viewer.dispose();
        stage.__viewer = null; stage.removeAttribute("data-3d"); if (toggle) toggle.hidden = false;
        stage.innerHTML = BAG.render(c, ro); stage.style.aspectRatio = "";
      }
      var lbl = $("[data-cfg-preview-label]", root); if (lbl) lbl.textContent = is3d ? "3D preview. Drag to rotate, scroll to zoom" : "2D preview";
      preview.setAttribute("data-vibe", c.brand.vibe);
    }
    function renderNav() {
      var vis = visibleSteps(), pos = vis.indexOf(c.step) + 1;
      nav.innerHTML = STEPS.map(function (s, i) {
        var skipped = CONFIG.isSkipped(c, s), cur = i === c.step, done = i < c.step || (i <= c.reached && i !== c.step);
        return '<li><button type="button" data-goto="' + i + '"' + (cur ? ' aria-current="step"' : "") + ' class="' + (done && !skipped ? "is-done" : "") + (skipped ? " is-skipped" : "") + '"' + (i > c.reached || skipped ? " disabled" : "") + ">" +
          '<span class="step-nav__n" aria-hidden="true">' + (done && !skipped ? "✓" : s.code) + "</span>" + s.title + (skipped ? '<span class="visually-hidden"> (not needed for this bag)</span>' : "") + "</button></li>";
      }).join("");
      $("[data-cfg-count]", root).textContent = "Step " + pos + " of " + vis.length;
      $("[data-cfg-progress]", root).style.setProperty("--progress", Math.round((pos / vis.length) * 100) + "%");
      $("[data-cfg-progressbar]", root).setAttribute("aria-valuenow", pos);
      $("[data-cfg-progressbar]", root).setAttribute("aria-valuemax", vis.length);
      var cur = nav.querySelector('[aria-current="step"]');
      if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest", inline: "center" });
    }
    function renderBar() {
      var mode = CONFIG.mode(c), last = c.step === visibleSteps()[visibleSteps().length - 1];
      $("[data-cfg-mode]", root).innerHTML = mode === "quote" ? '<span class="badge badge--warning">Quote</span>' : '<span class="badge">Deposit</span>';
      $("[data-cfg-next-label]", root).textContent = last ? "Review" : "Continue";
      $("[data-cfg-back]", root).disabled = c.step === 0;
      SZ.renderPrices();
    }
    function renderStep(focusHeading) {
      var s = STEPS[c.step];
      panel.innerHTML = '<section class="cfg-step" id="step-' + c.step + '" aria-labelledby="step-title">' +
        '<header class="cfg-step__head"><p class="eyebrow">Step ' + s.code + "</p>" +
        '<h1 class="cfg-step__title" id="step-title" tabindex="-1">' + s.title + "</h1>" + '<p class="muted">' + s.intro + "</p></header>" +
        '<div class="error-summary" data-error-summary hidden tabindex="-1"></div>' +
        STEP_HTML[s.id](c) + "</section>";
      $$("input, select, textarea", panel).forEach(function (el) { if (el.willValidate && (el.required || el.pattern)) ensureError(el); });
      renderNav(); renderBar(); renderPreview();
      if (focusHeading) { var h = $("#step-title", panel); h.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "auto" }); }
    }
    function go(i) {
      var vis = visibleSteps();
      if (vis.indexOf(i) < 0) return;
      c.step = i; c.reached = Math.max(c.reached, i);
      CONFIG.save(c);
      history.replaceState(null, "", "#step-" + i);
      renderStep(true);
      live.textContent = "Step " + (vis.indexOf(i) + 1) + " of " + vis.length + ": " + STEPS[i].title;
    }
    function validateStep() {
      var form = $("form", root);
      return SZ.validateForm(form, panel);
    }
    function next() {
      if (!validateStep()) return;
      var vis = visibleSteps(), p = vis.indexOf(c.step);
      if (p === vis.length - 1) { CONFIG.save(c); window.location.href = "review.html"; return; }
      go(vis[p + 1]);
    }
    function back() { var vis = visibleSteps(), p = vis.indexOf(c.step); if (p > 0) go(vis[p - 1]); }

    function readValue(el) {
      var t = el.getAttribute("data-type");
      if (t === "bool") return el.checked;
      if (t === "num") return Math.max(1, Math.min(999, parseInt(el.value, 10) || 1));
      if (t === "list") return $$('input[name="' + el.name + '"]:checked', panel).map(function (x) { return x.value; });
      if (el.name === "item.anchor") return el.value === "yes";
      return el.value;
    }
    function onChange(e, structural) {
      var el = e.target;
      if (el.matches("[data-color-for]")) {
        var hex = $('[name="' + el.getAttribute("data-color-for") + '"]', panel);
        hex.value = el.value.toUpperCase();
        CONFIG.set(c, hex.name, hex.value); SZ.validateControl(hex);
        CONFIG.save(c); renderPreview();
        if (structural) renderStep(false);
        return;
      }
      if (!el.name || el.type === "file") return;
      if (el.name.indexOf("brand.") === 0 && /primary|secondary|accent/.test(el.name) && el.type === "text") {
        if (!/^#[0-9a-fA-F]{6}$/.test(el.value)) return; /* wait for a valid HEX */
        var picker = $('[data-color-for="' + el.name + '"]', panel); if (picker) picker.value = el.value;
      }
      CONFIG.set(c, el.name, readValue(el));
      c.touched[el.name] = true;
      var counter = $('[data-counter-for="' + el.id + '"]', panel);
      if (counter) counter.textContent = el.value.length + "/" + el.maxLength;
      if (structural) {
        CONFIG.applyRules(c, el.name).forEach(function (m) { SZ.toast(m[1], m[0], 4500); });
        CONFIG.save(c);
        var id = el.id;
        renderStep(false);
        var again = document.getElementById(id); if (again) again.focus({ preventScroll: true });
      } else { CONFIG.save(c); renderPreview(); renderBar(); }
    }
    panel.addEventListener("input", function (e) { if (e.target.matches('input[type="text"], input[type="color"], textarea')) onChange(e, false); });
    panel.addEventListener("change", function (e) {
      if (e.target.type === "file") return handleLogo(e.target);
      var structural = !e.target.matches('input[type="text"], textarea') || e.target.name.indexOf("brand.") === 0 && /primary|secondary|accent/.test(e.target.name);
      onChange(e, structural);
    });
    panel.addEventListener("click", function (e) {
      if (e.target.closest("[data-remove-logo]")) { c.brand.logo = null; c.brand.logoName = ""; c.brand.logoWidth = null; SZ._logoCache = null; CONFIG.save(c); renderStep(false); SZ.toast("Logo removed.", "info", 2500); }
      if (e.target.closest('[data-fix="leather-colours"]')) {
        var fix = ["#111111", "#6d1a1f", "#e9dcc4"];
        c.item.panels = c.item.panels.map(function (p, i) { return p.indexOf("brand:") === 0 || D.leatherColours.indexOf(p) > -1 ? p : fix[i]; });
        CONFIG.save(c); renderStep(false); SZ.toast("Panels switched to leather colours.", "success", 3000);
      }
    });
    /* drag-over styling for the file drop zone */
    panel.addEventListener("dragover", function (e) { var z = e.target.closest("[data-file-drop]"); if (z) z.classList.add("is-dragover"); });
    panel.addEventListener("dragleave", function (e) { var z = e.target.closest("[data-file-drop]"); if (z) z.classList.remove("is-dragover"); });
    function handleLogo(input) {
      var f = input.files && input.files[0];
      if (!f) return;
      c.brand.logoName = f.name; c.brand.logoWidth = null; c.brand.logo = null; SZ._logoCache = null;
      if (!/\.(svg|png|pdf|ai|eps)$/i.test(f.name)) { SZ.toast("That file type isn't supported. Use SVG, PNG, PDF, AI or EPS.", "error"); c.brand.logoName = ""; renderStep(false); return; }
      if (/\.(pdf|ai|eps)$/i.test(f.name)) { CONFIG.save(c); renderStep(false); SZ.toast("Logo received: " + f.name, "success", 3000); return; }
      var r = new FileReader();
      r.onload = function () {
        var url = r.result;
        var img = new Image();
        img.onload = function () {
          c.brand.logo = url; c.brand.logoWidth = /\.svg$/i.test(f.name) ? null : img.naturalWidth;
          CONFIG.save(c); renderStep(false);
          if (c.brand.logoWidth && c.brand.logoWidth < 1000) SZ.toast("Your logo is under 1000px wide. It may print soft; see the options below it.", "warning", 6000);
          else SZ.toast("Logo added to your preview.", "success", 3000);
        };
        img.onerror = function () { SZ.toast("We couldn't read that image. Try another file. Your design is saved.", "error"); };
        img.src = url;
      };
      r.readAsDataURL(f);
    }

    nav.addEventListener("click", function (e) { var b = e.target.closest("[data-goto]"); if (b && !b.disabled) go(+b.getAttribute("data-goto")); });
    $("[data-cfg-next]", root).addEventListener("click", next);
    $("[data-cfg-back]", root).addEventListener("click", back);
    $("form", root).addEventListener("submit", function (e) { e.preventDefault(); next(); });
    $$("[data-cfg-view]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        view = b.getAttribute("data-cfg-view");
        $$("[data-cfg-view]", root).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        renderPreview();
      });
    });
    $("[data-cfg-share]", root).addEventListener("click", function () {
      CONFIG.save(c);
      SZ.copy(location.href.split("#")[0].split("?")[0] + "?cfg=" + c.configId, "Share link copied (prototype: links resolve server-side in production).");
    });
    $("[data-cfg-reset]", root).addEventListener("click", function () { SZ.openDialog("reset-modal"); });
    var confirmReset = $("[data-cfg-reset-confirm]");
    if (confirmReset) confirmReset.addEventListener("click", function () { c = CONFIG.defaults(); CONFIG.save(c); SZ.closeDialog($("#reset-modal")); go(0); SZ.toast("Started a new design.", "info"); });
    $("[data-cfg-id]", root).textContent = c.configId;
    document.addEventListener("sz:currency", renderBar);
    if (CONFIG.isSkipped(c, STEPS[c.step])) c.step = 0;
    renderStep(false);
    if (c.brand.logoSessionOnly && !SZ._logoCache) SZ.toast("Your large logo file was kept for the last session only. Please upload it again.", "warning", 6000);
  }

  /* ---------- 7b. Review --------------------------------------------------- */
  function initReview() {
    var root = $("#review");
    if (!root) return;
    var c = CONFIG.load();
    var region = $("[data-stateful]", root);
    if (!c && SZ.demoState() === "ready") { SZ.setRegionState(region, "empty"); return; }
    if (!c) return;
    $("[data-review-preview]", root).innerHTML = BAG.render(c, {});
    $("[data-review-id]", root).textContent = c.configId;
    $("[data-review-version]", root).textContent = c.schemaVersion;
    var groups = CONFIG.summary(c);
    $("[data-review-summary]", root).innerHTML = groups.map(function (g) {
      return '<section class="summary-group" aria-labelledby="sg-' + g.step + '"><div class="summary-group__head"><h3 id="sg-' + g.step + '">' + g.title + "</h3>" +
        '<a class="btn btn--ghost btn--sm" href="configure.html#step-' + g.step + '">' + ic("edit") + 'Edit<span class="visually-hidden"> ' + g.title + "</span></a></div>" +
        '<dl class="summary-list">' + g.rows.map(function (r) { return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]).replace(/PLACEHOLDER/g, '<span class="ph">PLACEHOLDER</span>') + "</dd>"; }).join("") + "</dl></section>";
    }).join("");
    var mode = CONFIG.mode(c), reasons = CONFIG.quoteReasons(c);
    $$("[data-mode]", root).forEach(function (el) { el.hidden = el.getAttribute("data-mode") !== mode; });
    $("[data-quote-reasons]", root).innerHTML = reasons.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("");
    var notes = [];
    if (CONFIG.isExport(c)) notes.push(notice("info", "Export order: ships unfilled by default. Duties and VAT for your destination " + ph("PLACEHOLDER: DDP vs DAP") + "."));
    if (!c.brand.logoName && !c.brand.noLogo) notes.push(notice("warning", 'No logo uploaded yet. You can still pay the deposit and send it later, or <a href="configure.html#step-0">add it now</a>.'));
    $("[data-review-notes]", root).innerHTML = notes.join("");
    /* pre-fill the quote form */
    var qn = $("#rq-gym"); if (qn) qn.value = c.brand.name;
    var qd = $("#rq-need"); if (qd) qd.value = "Custom bag design " + c.configId + ": " + groups.map(function (g) { return g.rows.map(function (r) { return r[0] + ": " + r[1]; }).join("; "); }).join(" | ");
    $("[data-review-share]", root).addEventListener("click", function () { SZ.copy(location.href.replace(/review\.html.*$/, "configure.html?cfg=" + c.configId), "Share link copied. Send it to your business partner."); });
    var payBtn = $("[data-review-pay]", root);
    payBtn.addEventListener("click", function (e) {
      var ok = SZ.validateForm($("#review-confirm-form"));
      if (!ok) { e.preventDefault(); }
    });
  }

  /* ---------- 7c. Checkout --------------------------------------------------- */
  function initCheckout() {
    var root = $("#checkout");
    if (!root) return;
    var stock = param("mode") === "stock";
    var c = CONFIG.load();
    var region = $("[data-stateful]", root);
    if (!stock && !c && SZ.demoState() === "ready") { SZ.setRegionState(region, "empty"); return; }
    $$("[data-if-mode]", root).forEach(function (el) { el.hidden = el.getAttribute("data-if-mode") !== (stock ? "stock" : "deposit"); });
    var sum = $("[data-checkout-item]", root);
    if (stock) {
      var items = cart.items();
      sum.innerHTML = items.length ? items.map(function (i) { return '<div class="cart-line"><div class="cart-line__thumb"><img src="' + esc(i.thumb) + '" alt="" width="72" height="90"></div><div class="cart-line__meta"><strong>' + esc(i.title) + '</strong><span class="small muted">' + esc(i.variant) + " · qty " + i.qty + '</span><span class="price" data-price="' + esc(i.priceKey) + '"></span></div></div>'; }).join("") : '<p class="muted">Your cart is empty.</p>';
    } else if (c) {
      var t = OPT.types.filter(function (x) { return x.v === c.item.type; })[0];
      sum.innerHTML = '<div class="cart-line"><div class="cart-line__thumb">' + BAG.render(c, {}) + '</div><div class="cart-line__meta"><strong>Custom ' + esc(t ? t.t.toLowerCase() : "bag") + " × " + c.item.qty + '</strong><span class="small muted">' + esc(c.brand.name || "") + " · " + esc(c.configId) + '</span><a class="small" href="review.html">Edit design</a></div></div>';
      var ctry = $("#co-country"); if (ctry && c.buyer.country) ctry.value = c.buyer.country;
      var nm = $("#co-company"); if (nm) nm.value = c.brand.name || "";
      if (CONFIG.mode(c) === "quote") $("[data-checkout-quote-warning]", root).hidden = false;
    }
    SZ.renderPrices();
    var form = $("#checkout-form"), payBtn = $("[data-pay]", root);
    var success = $("[data-result='success']", root), failure = $("[data-result='failure']", root);
    function succeed(via) {
      form.hidden = true; failure.hidden = true; success.hidden = false;
      var orderId = "SZ-PROTO-" + Math.random().toString(36).slice(2, 7).toUpperCase();
      $("[data-order-id]", success).textContent = orderId;
      $("[data-paid-via]", success).textContent = via;
      var status = $("[data-order-status]", success);
      status.innerHTML = '<span class="badge badge--warning">pending</span> Confirming with our payment provider…';
      var tl = $("[data-order-timeline]", success);
      tl.innerHTML = ["pending", "deposit_paid", "in_production", "qc", "balance_due", "paid", "shipped", "delivered"].map(function (s, i) { return '<li class="' + (i === 0 ? "is-current" : "") + '"><span class="mono">' + s + "</span></li>"; }).join("");
      $("h2", success).focus();
      setTimeout(function () {
        status.innerHTML = '<span class="badge badge--success">deposit_paid</span> Confirmed by webhook (mocked).';
        var li = $$("li", tl); li[0].className = "is-done"; li[1].className = "is-current";
      }, 1600);
      store.set("sz.lastOrder", { id: orderId, configId: c ? c.configId : null, at: new Date().toISOString(), status: "deposit_paid" });
      if (stock) store.set("sz.cart.v1", []), cart.render();
    }
    function fail(msg) {
      failure.hidden = false;
      $("[data-fail-msg]", failure).textContent = msg;
      failure.focus();
      payBtn.removeAttribute("aria-busy");
    }
    form.addEventListener("sz:submit", function (e) {
      e.preventDefault();
      payBtn.setAttribute("aria-busy", "true");
      failure.hidden = true;
      var card = ($("#co-card").value || "").replace(/\s/g, "");
      setTimeout(function () {
        payBtn.removeAttribute("aria-busy");
        if (param("result") === "fail" || card === "4000000000000002") fail("Your card was declined. No money was taken. Your design is saved, so try again or use another payment method.");
        else succeed("Card ending " + (card.slice(-4) || "4242"));
      }, 1400);
    });
    $$("[data-retry-pay]", root).forEach(function (b) { b.addEventListener("click", function () { failure.hidden = true; $("#co-card").focus(); }); });
    /* wallets open a mock payment sheet */
    root.addEventListener("click", function (e) {
      var w = e.target.closest("[data-mock-wallet]");
      if (!w) return;
      $("[data-wallet-name]").textContent = w.getAttribute("data-mock-wallet");
      SZ.openDialog("wallet-sheet");
    });
    var confirmWallet = $("[data-wallet-confirm]");
    if (confirmWallet) confirmWallet.addEventListener("click", function () {
      confirmWallet.setAttribute("aria-busy", "true");
      setTimeout(function () { confirmWallet.removeAttribute("aria-busy"); SZ.closeDialog($("#wallet-sheet")); if (param("result") === "fail") fail("The wallet payment was cancelled or declined. Your design is saved, so try again."); else succeed($("[data-wallet-name]").textContent); }, 1200);
    });
    /* card number formatting */
    var cardIn = $("#co-card");
    if (cardIn) cardIn.addEventListener("input", function () { var v = cardIn.value.replace(/\D/g, "").slice(0, 16); cardIn.value = v.replace(/(.{4})/g, "$1 ").trim(); });
    var exp = $("#co-exp");
    if (exp) exp.addEventListener("input", function () { var v = exp.value.replace(/\D/g, "").slice(0, 4); exp.value = v.length > 2 ? v.slice(0, 2) + " / " + v.slice(2) : v; });
  }

  /* ---------- 7d. Product page (length selection feeds the configure link) */
  function initProduct() {
    var root = $("#product");
    if (!root) return;
    var link = $("[data-customise-link]", root), add = $("[data-add-standard]", root);
    function sync() {
      var len = ($('input[name="pdp-length"]:checked', root) || {}).value || "4ft";
      $$("[data-customise-link]").forEach(function (a) { a.href = "configure.html?type=heavy&length=" + len; });
      if (add) add.setAttribute("data-add-to-cart", JSON.stringify({ id: "heavy-stock-" + len, title: "Standard heavy bag", variant: len + " · black · unfilled", qty: 1, priceKey: "heavy-bag-stock", thumb: D.img.bagPatch }));
      if (link) link.setAttribute("aria-label", "Customise a " + len + " heavy bag");
    }
    root.addEventListener("change", function (e) { if (e.target.name === "pdp-length") sync(); });
    sync();
  }

  /* ===========================================================================
     BOOT
     ======================================================================== */
  function boot() {
    injectSprite();
    renderChrome();
    initDialogs();
    initLang();
    initCurrency();
    initTabs();
    initForms();
    initStates();
    initVideos();
    initGallery();
    initSteppers();
    initCart();
    initProduct();
    initConfigurator();
    initReview();
    initCheckout();
    document.documentElement.classList.add("js");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

/* ---- Smooth scrolling (Lenis, vendored in assets/vendor/lenis, MIT) --------------------------
   Loaded from here so every page gets it without editing each HTML file. Off for reduced motion
   and on touch devices (native scrolling is better there). 3D stages, dialogs and drawers keep their
   own wheel handling via `prevent`, so orbit-zoom on the bags still works. */
(function () {
  if (window.__szLenis) return; window.__szLenis = true;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch = window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (reduce || touch) return;
  var cur = document.currentScript && document.currentScript.src, base = cur ? cur.replace(/app\.js.*$/, "") : "";
  var css = document.createElement("link"); css.rel = "stylesheet"; css.href = base + "assets/vendor/lenis/lenis.css"; document.head.appendChild(css);
  var s = document.createElement("script"); s.src = base + "assets/vendor/lenis/lenis.min.js";
  s.onload = function () {
    if (!window.Lenis) return;
    var lenis = new window.Lenis({
      duration: 1.15,
      easing: function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); },   /* expo-out, the same family as the hero's ease */
      smoothWheel: true, wheelMultiplier: 0.95, anchors: { offset: -80 },
      prevent: function (node) { return !!(node.closest && node.closest("[data-cfg-stage], [data-pb-view], canvas, dialog, .drawer, .modal, [data-lenis-prevent]")); }
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    window.SZ = window.SZ || {}; window.SZ.lenis = lenis;
  };
  document.head.appendChild(s);
})();

/* ---- GSAP (vendored in assets/vendor/gsap, v3.15, GSAP Standard "no charge" licence) --------------------
   Loads the core + ScrollTrigger on every page and registers them, so any page can use window.gsap.
   Other plugins (SplitText, DrawSVG, Flip, CustomEase...) are in the same folder: add them the same way. */
(function () {
  if (window.__szGsap) return; window.__szGsap = true;
  var cur = document.currentScript && document.currentScript.src, base = cur ? cur.replace(/app\.js.*$/, "") : "";
  function load(src, cb) { var s = document.createElement("script"); s.src = base + "assets/vendor/gsap/" + src; s.onload = cb; document.head.appendChild(s); }
  load("gsap.min.js", function () {
    load("ScrollTrigger.min.js", function () {
      if (!window.gsap || !window.ScrollTrigger) return;
      gsap.registerPlugin(ScrollTrigger);
      /* keep ScrollTrigger in sync with Lenis smooth scrolling */
      var hook = function () { if (window.SZ && SZ.lenis) { SZ.lenis.on("scroll", ScrollTrigger.update); return true; } return false; };
      if (!hook()) { var n = 0, t = setInterval(function () { if (hook() || ++n > 40) clearInterval(t); }, 150); }
      document.dispatchEvent(new CustomEvent("sz:gsap-ready"));
    });
  });
})();
