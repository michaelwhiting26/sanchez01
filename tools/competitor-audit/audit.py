#!/usr/bin/env python3
"""Competitor site audit for Sanchez Custom Boxing.

Visits each site in sites.json the way a buyer would (desktop Chromium 1440x900 and an emulated
iPhone 14 in WebKit), follows the home -> custom builder -> collection -> product path, and records
design, flow, engineering and business signals. Patterns only: nothing captured here is reused on
the Sanchez site.

Run:  python3 -I tools/competitor-audit/audit.py --out "<output dir>" [--only slug,slug] [--concurrency 4]
Writes: <out>/data/<slug>/data.json, shots/*.jpg, text/*.txt, and <out>/summary.json + summary.csv
"""
import argparse, asyncio, csv, html.parser, io, json, os, re, statistics, sys, time, traceback
from collections import Counter
from urllib.parse import urlparse, urljoin

from PIL import Image
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
DESKTOP_UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) "
              "Chrome/141.0.0.0 Safari/537.36")
NAV_TIMEOUT = 45000
IDLE_CAP = 10000
SITE_TIMEOUT = 600
FULL_CAP_DESKTOP = 9000
FULL_CAP_MOBILE = 12000

PERF_INIT = r"""
(() => {
  window.__perf = {lcp: 0, lcpEl: null, lcpUrl: null, cls: 0, longtasks: 0};
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) {
      window.__perf.lcp = e.renderTime || e.loadTime || e.startTime; const el = e.element;
      window.__perf.lcpEl = el ? (el.tagName + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '')) : null;
      window.__perf.lcpUrl = e.url || null; } }).observe({type: 'largest-contentful-paint', buffered: true}); } catch (e) {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (!e.hadRecentInput) window.__perf.cls += e.value; } }).observe({type: 'layout-shift', buffered: true}); } catch (e) {}
  try { new PerformanceObserver((l) => { window.__perf.longtasks += l.getEntries().length; }).observe({type: 'longtask', buffered: true}); } catch (e) {}
})();
"""

PERF_READ = r"""
() => {
  const n = performance.getEntriesByType('navigation')[0]; const p = window.__perf || {};
  const f = performance.getEntriesByName('first-contentful-paint')[0];
  return { ttfb: n ? Math.round(n.responseStart) : null, dcl: n ? Math.round(n.domContentLoadedEventEnd) : null,
    load: n ? Math.round(n.loadEventEnd) : null, fcp: f ? Math.round(f.startTime) : null,
    lcp: p.lcp ? Math.round(p.lcp) : null, lcpEl: p.lcpEl || null, lcpUrl: p.lcpUrl || null,
    cls: (p.cls != null) ? Math.round(p.cls * 1000) / 1000 : null, longtasks: p.longtasks || 0,
    domNodes: document.getElementsByTagName('*').length, docHeight: document.documentElement.scrollHeight };
}
"""

POPUPS = r"""
() => {
  const out = {cookie: [], closed: [], dialogsVisible: 0, emailPopup: false};
  const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'; };
  const txt = (el) => (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 60);
  const consentSel = ['#onetrust-accept-btn-handler', '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
    '#CybotCookiebotDialogBodyButtonAccept', '.cc-allow', '.cc-accept', '[data-testid="uc-accept-all-button"]',
    '#shopify-pc__banner__btn-accept', '.cookie-accept', '#cookie-accept', 'button[aria-label*="accept" i]'];
  for (const s of consentSel) { document.querySelectorAll(s).forEach(b => { if (vis(b)) { out.cookie.push(s + ' :: ' + txt(b)); try { b.click(); } catch (e) {} } }); }
  const boxes = Array.from(document.querySelectorAll('[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],[class*="gdpr" i],[id*="gdpr" i]')).filter(vis);
  for (const box of boxes) { for (const b of box.querySelectorAll('button, [role="button"]')) { const t = txt(b);
      if (/^(accept|accept all|allow all|allow|agree|i agree|got it|ok|okay|yes)/i.test(t) && vis(b)) { out.cookie.push('banner :: ' + t); try { b.click(); } catch (e) {} break; } } }
  const dialogs = Array.from(document.querySelectorAll('[role="dialog"], [aria-modal="true"], [class*="modal" i], [class*="popup" i], [class*="klaviyo-form" i], [id*="popup" i]')).filter(vis);
  out.dialogsVisible = dialogs.length;
  out.emailPopup = dialogs.some(d => d.querySelector('input[type="email"]'));
  for (const d of dialogs) { const c = d.querySelector('[aria-label*="close" i], [aria-label*="dismiss" i], button[class*="close" i], [class*="close" i], button[title*="close" i]');
    if (c && vis(c)) { out.closed.push(txt(c) || String(c.className).slice(0, 40)); try { c.click(); } catch (e) {} } }
  return out;
}
"""

DOM = r"""
() => {
  const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const uniq = (arr, n) => { const seen = new Set(); const out = []; for (const x of arr) { if (!x) continue; const k = x.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(x); } if (out.length >= n) break; } return out; };
  const meta = (sel) => { const m = document.querySelector(sel); return m ? (m.getAttribute('content') || m.getAttribute('href')) : null; };
  const ld = []; document.querySelectorAll('script[type="application/ld+json"]').forEach(s => { try { const j = JSON.parse(s.textContent); const arr = Array.isArray(j) ? j : (j['@graph'] || [j]); arr.forEach(o => ld.push(o)); } catch (e) {} });
  const ldTypes = uniq(ld.map(o => Array.isArray(o['@type']) ? o['@type'].join('/') : String(o['@type'] || '?')), 30);
  const prod = ld.find(o => /Product/i.test(String(o['@type']))); let ldProduct = null;
  if (prod) { const off = Array.isArray(prod.offers) ? prod.offers[0] : prod.offers;
    ldProduct = { name: prod.name || null, brand: (prod.brand && (prod.brand.name || prod.brand)) || null, price: off ? (off.price || off.lowPrice || null) : null,
      currency: off ? (off.priceCurrency || null) : null, availability: off ? (off.availability || null) : null,
      rating: prod.aggregateRating ? { value: prod.aggregateRating.ratingValue, count: prod.aggregateRating.reviewCount || prod.aggregateRating.ratingCount } : null }; }
  const header = document.querySelector('header, [role="banner"], #shopify-section-header, .site-header, #header');
  const footer = document.querySelector('footer, [role="contentinfo"], #shopify-section-footer, .site-footer');
  const linkTexts = (root, onlyVis, n) => root ? uniq(Array.from(root.querySelectorAll('a')).filter(a => !onlyVis || vis(a)).map(a => clean(a.innerText || a.getAttribute('aria-label'))).filter(t => t && t.length < 60), n) : [];
  const ctas = uniq(Array.from(document.querySelectorAll('button, a[class*="btn" i], a[class*="button" i], input[type="submit"], [role="button"]')).filter(vis).map(b => clean(b.innerText || b.value || b.getAttribute('aria-label'))).filter(t => t && t.length < 50), 50);
  const ann = Array.from(document.querySelectorAll('[class*="announcement" i], [id*="announcement" i], [class*="promo-bar" i], [class*="topbar" i], [class*="top-bar" i], [class*="marquee" i], [class*="ticker" i]')).filter(vis).map(e => clean(e.innerText)).filter(Boolean);
  const imgs = Array.from(document.images);
  const imgStats = { total: imgs.length, noAlt: imgs.filter(i => !i.hasAttribute('alt')).length, emptyAlt: imgs.filter(i => i.getAttribute('alt') === '').length,
    lazy: imgs.filter(i => i.loading === 'lazy').length, srcset: imgs.filter(i => i.srcset).length, picture: document.querySelectorAll('picture').length };
  const videos = Array.from(document.querySelectorAll('video')).slice(0, 8).map(v => ({ autoplay: v.autoplay, muted: v.muted, loop: v.loop, poster: !!v.poster, src: (v.currentSrc || (v.querySelector('source') || {}).src || '').slice(0, 160) }));
  const iframes = uniq(Array.from(document.querySelectorAll('iframe')).map(f => { try { return new URL(f.src, location.href).hostname; } catch (e) { return ''; } }), 20);
  const fontOf = (sel) => { const el = document.querySelector(sel); return el ? getComputedStyle(el).fontFamily.slice(0, 120) : null; };
  const colourOf = (sel) => { const el = document.querySelector(sel); if (!el) return null; const s = getComputedStyle(el); return { color: s.color, bg: s.backgroundColor }; };
  const loaded = []; try { document.fonts.forEach(f => { if (f.status === 'loaded') loaded.push(f.family.replace(/["']/g, '')); }); } catch (e) {}
  const cssVars = [];
  for (const sheet of Array.from(document.styleSheets)) { let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
    for (const r of Array.from(rules || [])) { if (r.selectorText === ':root' && r.style) { for (const prop of Array.from(r.style)) {
      if (prop.startsWith('--') && /colou?r|bg|background|accent|primary|brand|text/i.test(prop)) cssVars.push(prop + ': ' + r.style.getPropertyValue(prop).trim()); } } }
    if (cssVars.length > 60) break; }
  const bodyText = document.body ? document.body.innerText : '';
  const terms = { handmade: /hand[\s-]?made|hand[\s-]?crafted|hand[\s-]?stitched/i, madeIn: /made in [A-Z][a-z]+/, custom: /\bcustom(?!er)/i,
    personalise: /personali[sz]/i, designYourOwn: /design your own|build your own|create your own|customi[sz]e (now|yours|your)/i,
    madeToOrder: /made[\s-]to[\s-]order/i, leadTime: /\b\d{1,2}\s*(?:-|–|to)?\s*\d{0,2}\s*(?:business\s+)?(?:weeks?|wks)\b/i,
    warranty: /warrant(y|ies)|guarantee/i, freeShipping: /free (shipping|delivery)/i, returns: /returns?|refund|exchange/i,
    afterpay: /afterpay|clearpay/i, klarna: /klarna/i, zip: /\bzip\s*(pay|money)\b/i, shopPay: /shop pay/i, paypal: /paypal/i,
    limited: /limited (edition|run|drop)|numbered/i, preorder: /pre[\s-]?order/i, soldOut: /sold out/i,
    team: /team (order|gear|kit)|\bclubs?\b|gym (order|package|fit)|wholesale|bulk order/i, athletes: /champion|world title|pro fighters|worn by|athletes?/i,
    reviews: /\breviews?\b/i, in4: /4 (interest[\s-]free )?(payments|instal?ments)/i };
  const kw = {}; for (const [k, re] of Object.entries(terms)) { const m = bodyText.match(re); kw[k] = m ? clean(bodyText.substr(Math.max(0, m.index - 60), 170)) : null; }
  const anchors = Array.from(document.querySelectorAll('a[href]')).map(a => ({ href: a.href, text: clean(a.innerText || a.getAttribute('aria-label')).slice(0, 80) })).filter(a => a.href.startsWith('http')).slice(0, 1500);
  let sticky = null; if (header) { const s1 = getComputedStyle(header).position; const s2 = header.firstElementChild ? getComputedStyle(header.firstElementChild).position : ''; sticky = /(sticky|fixed)/.test(s1 + ' ' + s2); }
  const forms = { email: document.querySelectorAll('input[type="email"]').length, file: document.querySelectorAll('input[type="file"]').length,
    text: document.querySelectorAll('input[type="text"]').length, search: document.querySelectorAll('input[type="search"], form[action*="search"]').length, selects: document.querySelectorAll('select').length };
  const labelsMissing = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), select, textarea')).filter(i => { const id = i.id;
    return !(i.getAttribute('aria-label') || i.getAttribute('aria-labelledby') || (id && document.querySelector('label[for="' + CSS.escape(id) + '"]')) || i.closest('label')); }).length;
  const btnNoName = Array.from(document.querySelectorAll('button, [role="button"]')).filter(b => !clean(b.innerText) && !b.getAttribute('aria-label') && !b.getAttribute('title') && !b.querySelector('img[alt]:not([alt=""]), svg title')).length;
  const loc = clean((document.querySelector('[class*="localization" i], [class*="currency" i], [id*="currency" i], [name="currency"], [class*="country-selector" i]') || {}).innerText || '').slice(0, 80);
  const shop = window.Shopify ? { theme: window.Shopify.theme ? (window.Shopify.theme.schema_name || window.Shopify.theme.name || null) : null,
    themeVersion: window.Shopify.theme ? (window.Shopify.theme.schema_version || null) : null, currency: window.Shopify.currency ? window.Shopify.currency.active : null,
    country: window.Shopify.country || null, locale: window.Shopify.locale || null } : null;
  const globals = { shopify: !!window.Shopify, next: !!window.__NEXT_DATA__ || !!document.querySelector('script[src*="/_next/"]'), nuxt: !!window.__NUXT__,
    gatsby: !!window.___gatsby, wordpress: !!document.querySelector('link[href*="wp-content"], script[src*="wp-content"], script[src*="wp-includes"]'),
    woocommerce: !!window.wc_add_to_cart_params || !!window.woocommerce_params || !!document.querySelector('body[class*="woocommerce"]'),
    magento: !!document.querySelector('script[type="text/x-magento-init"]'), bigcommerce: !!window.BCData,
    wix: !!document.querySelector('meta[name="generator"][content*="Wix" i]'), squarespace: !!(window.Static && window.Static.SQUARESPACE_CONTEXT),
    webflow: !!document.querySelector('html[data-wf-site]'), react: !!document.querySelector('[data-reactroot], #__next, #root'),
    vue: !!window.__VUE__ || !!document.querySelector('[data-v-app]'), jquery: (window.jQuery && window.jQuery.fn) ? window.jQuery.fn.jquery : null,
    three: window.THREE ? String(window.THREE.REVISION || 'yes') : null, babylon: !!window.BABYLON,
    modelViewer: !!(window.customElements && customElements.get('model-viewer')) };
  return { url: location.href, title: document.title, lang: document.documentElement.lang || null, description: meta('meta[name="description"]'),
    canonical: meta('link[rel="canonical"]'), ogTitle: meta('meta[property="og:title"]'), ogImage: meta('meta[property="og:image"]'),
    viewport: meta('meta[name="viewport"]'), robots: meta('meta[name="robots"]'), generator: meta('meta[name="generator"]'),
    hreflang: Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map(l => l.hreflang).slice(0, 40),
    ldTypes, ldProduct, h1: Array.from(document.querySelectorAll('h1')).map(e => clean(e.innerText)).filter(Boolean).slice(0, 5),
    h2: uniq(Array.from(document.querySelectorAll('h2')).map(e => clean(e.innerText)), 30), navVisible: linkTexts(header, true, 40),
    navLinksTotal: header ? header.querySelectorAll('a').length : 0, footerLinks: linkTexts(footer, false, 90), ctas, announcement: uniq(ann, 5),
    imgStats, videos, iframes, canvases: document.querySelectorAll('canvas').length,
    fonts: { body: fontOf('body'), h1: fontOf('h1'), h2: fontOf('h2'), button: fontOf('button, .btn, [class*="button"]'), nav: fontOf('header a, nav a'), loaded: uniq(loaded, 20) },
    colours: { body: colourOf('body'), header: colourOf('header, [role="banner"]'), footer: colourOf('footer'), button: colourOf('button[type="submit"], .btn, [class*="button" i]') },
    cssVars: cssVars.slice(0, 60), keywords: kw, forms, labelsMissing, btnNoName, localisation: loc, sticky,
    sections: document.querySelectorAll('.shopify-section, main > section, [data-section-type]').length, shop, globals,
    textLength: bodyText.length, anchors };
}
"""

PRODUCT = r"""
() => {
  const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const root = document.querySelector('main, #MainContent, [role="main"], #content, .product') || document.body;
  const priceEl = Array.from(root.querySelectorAll('[class*="price" i], [data-price], .money')).find(e => vis(e) && /\d/.test(e.innerText || ''));
  const atc = Array.from(root.querySelectorAll('button, input[type="submit"], a')).filter(vis).map(b => clean(b.innerText || b.value))
    .find(t => /add to (cart|bag|basket)|buy now|buy it now|pre[- ]?order|customi[sz]e|design|build|get a quote|request|enquire|inquire|start/i.test(t)) || null;
  const text = root.innerText;
  const grab = (re) => { const m = text.match(re); return m ? clean(text.substr(Math.max(0, m.index - 40), 220)) : null; };
  return { price: priceEl ? clean(priceEl.innerText).slice(0, 80) : null, addToCart: atc,
    variantGroups: document.querySelectorAll('fieldset, select[name*="option" i], select[name="id"], [class*="variant" i] select').length,
    gallery: document.querySelectorAll('[class*="product" i] [class*="media" i] img, [class*="product" i] [class*="gallery" i] img, .woocommerce-product-gallery img').length,
    sizeGuide: grab(/size (guide|chart)/i),
    delivery: grab(/(ships (in|within)|dispatch(ed|es)? (in|within)|delivery (in|within|time|takes)|lead time|production time|made to order|ready in|turnaround|takes \d+\s*(-|to)?\s*\d*\s*(days|weeks))[^\n]{0,140}/i),
    bnpl: grab(/afterpay|clearpay|klarna|zip pay|sezzle|affirm|shop pay|interest[- ]free/i), stock: grab(/in stock|out of stock|sold out|low stock|only \d+ left/i),
    warranty: grab(/warrant(y|ies)|guarantee/i), returns: grab(/(no )?(returns?|refunds?)[^\n]{0,120}/i),
    accordions: Array.from(document.querySelectorAll('summary, [aria-expanded], [role="tab"]')).filter(vis).map(e => clean(e.innerText)).filter(t => t && t.length < 50).slice(0, 25) };
}
"""

CUSTOM = r"""
() => {
  const scripts = Array.from(document.scripts).map(s => s.src).filter(Boolean);
  const hit = (re) => scripts.filter(s => re.test(s)).slice(0, 6);
  const text = document.body.innerText;
  return { canvases: Array.from(document.querySelectorAll('canvas')).slice(0, 5).map(c => ({w: c.width, h: c.height})),
    threeScripts: hit(/three|gltf|draco|orbitcontrols/i), babylon: hit(/babylon/i),
    builderScripts: hit(/zakeke|threekit|doogma|customily|kickflip|productimize|expivi|vectary|sketchfab|marmoset|roomle|configurator|customi[sz]er|designer/i).filter(s => !/checkouts|preloads/i.test(s)),
    modelViewer: !!document.querySelector('model-viewer'), fileUpload: document.querySelectorAll('input[type="file"]').length,
    textInputs: document.querySelectorAll('input[type="text"], textarea').length, stepMentions: (text.match(/\bstep\s*\d\b/gi) || []).length,
    swatches: document.querySelectorAll('[class*="swatch" i], [data-color], [class*="color" i] button, [class*="colour" i] button').length,
    livePrice: !!Array.from(document.querySelectorAll('[class*="price" i], [class*="total" i]')).find(e => /\d/.test(e.innerText || '')),
    quoteFlow: /get a quote|request a quote|send (to|for) (a )?quote|enquir|inquir/i.test(text), depositMention: /deposit/i.test(text),
    leadTime: (text.match(/\b\d{1,2}\s*(?:-|–|to)?\s*\d{0,2}\s*(?:business\s+)?(?:weeks?|wks)\b/i) || [null])[0],
    noRefund: /no (returns|refunds)|non[- ]refundable|cannot be returned|final sale|not eligible for (a )?return/i.test(text),
    minimumOrder: (text.match(/minimum (order|quantity)[^\n.]{0,60}/i) || [null])[0] };
}
"""

STICKY = r"""
() => { const out = [];
  for (const el of Array.from(document.querySelectorAll('body *'))) { const s = getComputedStyle(el);
    if (s.position === 'fixed' || s.position === 'sticky') { const r = el.getBoundingClientRect();
      if (r.height > 20 && r.height < 260 && r.width > 200 && r.bottom >= window.innerHeight - 5 && r.top > window.innerHeight * 0.45) {
        const t = (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 100); if (t) out.push(t); } }
    if (out.length > 5) break; }
  return out; }
"""

VENDORS = {
    "Shopify": ["cdn.shopify.com", "myshopify.com", "shopifycloud"], "Shop Pay": ["shop.app/", "shop-js", "shopify-pay"],
    "WordPress/WooCommerce": ["/wp-content/", "/wp-includes/", "/wp-json/"], "Next.js": ["/_next/"], "Vercel": ["vercel-insights", "/_vercel/"],
    "Google Tag Manager": ["googletagmanager.com/gtm.js"], "Google Analytics 4": ["googletagmanager.com/gtag/js", "google-analytics.com/g/collect", "analytics.google.com"],
    "Google Ads": ["googleadservices.com", "doubleclick.net", "googlesyndication"], "Meta Pixel": ["connect.facebook.net", "facebook.com/tr"],
    "TikTok Pixel": ["analytics.tiktok.com"], "Snapchat Pixel": ["sc-static.net", "tr.snapchat.com"], "Pinterest Tag": ["ct.pinterest.com", "s.pinimg.com/ct"],
    "Microsoft Clarity": ["clarity.ms"], "Hotjar": ["hotjar.com"], "Bing Ads": ["bat.bing.com"], "Klaviyo": ["klaviyo.com"], "Attentive": ["attn.tv", "attentivemobile"],
    "Postscript": ["postscript.io"], "Omnisend": ["omnisend"], "Mailchimp": ["chimpstatic", "list-manage.com"], "Gorgias": ["gorgias"], "Re:amaze": ["reamaze"],
    "Zendesk": ["zdassets", "zendesk"], "Tidio": ["tidio"], "Intercom": ["intercom"], "LiveChat": ["livechatinc"], "Tawk.to": ["tawk.to"],
    "Yotpo": ["yotpo"], "Okendo": ["okendo"], "Judge.me": ["judge.me", "judgeme"], "Stamped": ["stamped.io"], "Trustpilot": ["trustpilot"],
    "Reviews.io": ["reviews.io", "reviews.co.uk"], "Loox": ["loox.io"], "Junip": ["junip"], "Afterpay/Clearpay": ["afterpay", "clearpay"], "Klarna": ["klarna"],
    "Zip": ["zip.co", "quadpay", "zipmoney"], "Sezzle": ["sezzle"], "Affirm": ["affirm.com"], "PayPal": ["paypal.com", "paypalobjects"], "Stripe": ["js.stripe.com"],
    "Global-e": ["global-e", "bglobale"], "Rebuy": ["rebuyengine"], "Searchanise": ["searchanise"], "Boost Commerce": ["boostcommerce", "bc-solutions"],
    "Algolia": ["algolia"], "Klevu": ["klevu"], "Nosto": ["nosto"], "Recharge": ["rechargeapps", "rechargecdn"], "Weglot": ["weglot"],
    "OneTrust": ["onetrust", "cookielaw.org"], "Cookiebot": ["cookiebot"], "Termly": ["termly"], "Usercentrics": ["usercentrics"],
    "Cloudflare": ["cloudflareinsights", "challenges.cloudflare.com", "cdnjs.cloudflare.com"], "Sentry": ["sentry"], "New Relic": ["nr-data.net"],
    "Segment": ["segment.com", "segment.io"], "Elevar": ["elevar"], "YouTube": ["youtube.com", "ytimg.com"], "Vimeo": ["vimeo"],
    "Instagram feed widget": ["instafeed", "behold.so", "cdninstagram"], "Elfsight": ["elfsight"], "Zakeke (3D customiser)": ["zakeke"],
    "Threekit (3D)": ["threekit"], "Doogma (builder)": ["doogma"], "Customily": ["customily"], "Kickflip": ["kickflip", "mycustomizer"],
    "Expivi (3D)": ["expivi"], "Sketchfab": ["sketchfab"], "three.js": ["three.min.js", "three.module", "/three/build", "/r146/three"],
    "Adobe Fonts": ["use.typekit.net", "p.typekit.net"], "Google Fonts": ["fonts.googleapis.com", "fonts.gstatic.com"], "Font Awesome": ["fontawesome"],
    "Smile.io (loyalty)": ["smile.io", "sweettooth"], "LoyaltyLion": ["loyaltylion"], "Privy": ["privy.com"], "Justuno": ["justuno"],
    "PageFly": ["pagefly"], "GemPages": ["gempages"], "Shogun": ["getshogun"], "Swym (wishlist)": ["swym"], "Route": ["routeapp", "route.com"],
    "AfterShip": ["aftership"], "Criteo": ["criteo"], "Triple Whale": ["triplewhale", "triplepixel"], "Northbeam": ["northbeam"],
}
TWO_LEVEL_TLDS = {("co", "uk"), ("com", "au"), ("co", "nz"), ("com", "br"), ("co", "jp"), ("com", "mx"), ("co", "th"), ("com", "sg"), ("co", "za")}


def reg_domain(host):
    if not host:
        return ""
    parts = host.lower().split(".")
    if len(parts) >= 3 and (parts[-2], parts[-1]) in TWO_LEVEL_TLDS:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:])


def log(slug, msg):
    print(f"[{time.strftime('%H:%M:%S')}] [{slug}] {msg}", flush=True)


class TextOnly(html.parser.HTMLParser):
    SKIP = {"script", "style", "noscript", "svg", "template"}

    def __init__(self):
        super().__init__()
        self.skip = 0
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP:
            self.skip += 1
        elif tag in ("p", "br", "li", "h1", "h2", "h3", "h4", "tr", "div", "section"):
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in self.SKIP and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)

    def text(self):
        t = "".join(self.parts)
        t = re.sub(r"[ \t\r\f\v]+", " ", t)
        return re.sub(r"\n\s*\n+", "\n", t).strip()


def html_to_text(s):
    p = TextOnly()
    try:
        p.feed(s)
    except Exception:
        pass
    return p.text()


def palette(path, n=6):
    try:
        im = Image.open(path).convert("RGB")
        im.thumbnail((240, 240))
        q = im.quantize(colors=n)
        pal = q.getpalette()
        total = im.size[0] * im.size[1]
        out = []
        for count, idx in sorted(q.getcolors(), reverse=True)[:n]:
            r, g, b = pal[idx * 3: idx * 3 + 3]
            out.append({"hex": f"#{r:02x}{g:02x}{b:02x}", "share": round(count / total, 3)})
        return out
    except Exception as e:
        return [{"error": str(e)}]


def vendors_from(urls):
    found = Counter()
    for u in urls:
        lu = u.lower()
        for name, pats in VENDORS.items():
            if any(p in lu for p in pats):
                found[name] += 1
    return sorted(found)


class NetLog:
    """Desktop (Chromium) network log via CDP: real transfer sizes per request."""

    def __init__(self):
        self.req = {}

    def on_response(self, p):
        r = p.get("response", {})
        self.req[p["requestId"]] = {"url": r.get("url", ""), "type": p.get("type", "Other"), "mime": r.get("mimeType", ""),
                                    "status": r.get("status"), "bytes": 0, "protocol": r.get("protocol")}

    def on_finished(self, p):
        e = self.req.get(p["requestId"])
        if e is not None:
            e["bytes"] = int(p.get("encodedDataLength", 0) or 0)

    def reset(self):
        self.req = {}

    def summary(self, page_host):
        rows = list(self.req.values())
        by_type = {}
        for r in rows:
            t = r["type"]
            d = by_type.setdefault(t, {"count": 0, "kb": 0.0})
            d["count"] += 1
            d["kb"] += r["bytes"] / 1024
        for d in by_type.values():
            d["kb"] = round(d["kb"], 1)
        mimes = Counter(r["mime"] for r in rows if r["type"] == "Image")
        first = reg_domain(page_host)
        third = Counter(reg_domain(urlparse(r["url"]).hostname or "") for r in rows)
        third.pop(first, None)
        third.pop("", None)
        protocols = Counter(r.get("protocol") or "?" for r in rows)
        largest = sorted(rows, key=lambda r: r["bytes"], reverse=True)[:10]
        return {"requests": len(rows), "kb_total": round(sum(r["bytes"] for r in rows) / 1024, 1), "by_type": by_type,
                "image_mimes": dict(mimes), "third_party_domains": len(third), "third_party_top": third.most_common(15),
                "protocols": dict(protocols), "failed": sum(1 for r in rows if (r["status"] or 0) >= 400),
                "largest": [{"url": r["url"][:140], "type": r["type"], "kb": round(r["bytes"] / 1024, 1)} for r in largest],
                "vendors": vendors_from(r["url"] for r in rows)}


def classify_platform(globs, vendors, headers, generator):
    g = globs or {}
    h = {k.lower(): v for k, v in (headers or {}).items()}
    if g.get("shopify") or "Shopify" in vendors or "x-shopify-stage" in h or "x-shopid" in h:
        return "Shopify"
    if g.get("woocommerce"):
        return "WooCommerce (WordPress)"
    if g.get("wordpress") or (generator and "wordpress" in generator.lower()):
        return "WordPress"
    if g.get("magento"):
        return "Magento / Adobe Commerce"
    if g.get("bigcommerce"):
        return "BigCommerce"
    if g.get("wix"):
        return "Wix"
    if g.get("squarespace"):
        return "Squarespace"
    if g.get("webflow"):
        return "Webflow"
    if g.get("next"):
        return "Next.js (custom build)"
    if g.get("nuxt"):
        return "Nuxt (custom build)"
    return "Unknown / custom"


def blocked(title, status, text_len):
    t = (title or "").lower()
    return bool(status in (401, 403, 429, 503) or any(x in t for x in ["just a moment", "attention required", "access denied", "verify you are human", "are you a robot"])
                or (text_len is not None and text_len < 40))


async def settle(page):
    try:
        await page.wait_for_load_state("networkidle", timeout=IDLE_CAP)
    except Exception:
        pass


async def scroll_through(page, steps=14):
    for _ in range(steps):
        at_bottom = await page.evaluate("() => { window.scrollBy(0, Math.round(window.innerHeight * 0.85)); return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4; }")
        await page.wait_for_timeout(280)
        if at_bottom:
            break
    await page.evaluate("() => window.scrollTo(0, 0)")
    await page.wait_for_timeout(700)


async def shoot(page, path_base, full_cap, want_full):
    out = {}
    await page.screenshot(path=path_base + "_fold.jpg", type="jpeg", quality=68)
    out["fold"] = os.path.basename(path_base + "_fold.jpg")
    if want_full:
        try:
            h = await page.evaluate("() => document.documentElement.scrollHeight")
            vw = page.viewport_size["width"]
            await page.screenshot(path=path_base + "_full.jpg", type="jpeg", quality=55, full_page=True,
                                  clip={"x": 0, "y": 0, "width": vw, "height": min(int(h), full_cap)})
            out["full"] = os.path.basename(path_base + "_full.jpg")
            out["full_truncated"] = h > full_cap
        except Exception as e:
            out["full_error"] = str(e)[:200]
    return out


async def visit(ctx, page, url, kind, viewport, site_dir, netlog=None, want_full=False):
    """Load one page in one viewport and capture everything."""
    rec = {"kind": kind, "viewport": viewport, "requested": url}
    hdrs = {}
    if netlog:
        netlog.reset()
    errors, console_errors = [], []

    def on_err(e):
        errors.append(str(e)[:200])

    def on_console(m):
        if m.type == "error":
            console_errors.append(m.text[:200])

    page.on("pageerror", on_err)
    page.on("console", on_console)
    try:
        return await _visit_body(ctx, page, url, kind, viewport, site_dir, netlog, want_full, rec, hdrs, errors, console_errors)
    finally:
        page.remove_listener("pageerror", on_err)
        page.remove_listener("console", on_console)


async def _visit_body(ctx, page, url, kind, viewport, site_dir, netlog, want_full, rec, hdrs, errors, console_errors):
    t0 = time.time()
    try:
        resp = await page.goto(url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)
        rec["status"] = resp.status if resp else None
        hdrs = await resp.all_headers() if resp else {}
        keep = ["server", "x-powered-by", "cache-control", "content-security-policy", "strict-transport-security", "x-frame-options",
                "via", "cf-ray", "x-vercel-id", "x-shopify-stage", "x-shopid", "x-cache", "alt-svc", "x-served-by", "powered-by"]
        rec["headers"] = {k: (v[:160] if k != "content-security-policy" else "present") for k, v in hdrs.items() if k in keep}
    except Exception as e:
        rec["error"] = f"goto: {str(e)[:300]}"
        return rec, hdrs
    await settle(page)
    rec["final_url"] = page.url
    rec["seconds_to_settle"] = round(time.time() - t0, 1)
    try:
        rec["perf"] = await page.evaluate(PERF_READ)
    except Exception as e:
        rec["perf_error"] = str(e)[:200]
    try:
        rec["popups"] = await page.evaluate(POPUPS)
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(600)
        rec["popups_after"] = await page.evaluate(POPUPS)
    except Exception as e:
        rec["popup_error"] = str(e)[:200]
    try:
        await scroll_through(page)
    except Exception as e:
        rec["scroll_error"] = str(e)[:200]
    base = os.path.join(site_dir, "shots", f"{kind}_{viewport}")
    try:
        rec["shots"] = await shoot(page, base, FULL_CAP_DESKTOP if viewport == "desktop" else FULL_CAP_MOBILE, want_full)
        rec["palette"] = palette(base + "_fold.jpg")
    except Exception as e:
        rec["shot_error"] = str(e)[:200]
    try:
        dom = await page.evaluate(DOM)
        rec["dom"] = dom
        with open(os.path.join(site_dir, "text", f"{kind}_{viewport}.txt"), "w") as f:
            f.write(await page.evaluate("() => document.body ? document.body.innerText.slice(0, 40000) : ''"))
    except Exception as e:
        rec["dom_error"] = str(e)[:200]
    if kind in ("product",):
        try:
            rec["product"] = await page.evaluate(PRODUCT)
        except Exception as e:
            rec["product_error"] = str(e)[:200]
    if kind in ("custom", "product", "home", "extra"):
        try:
            rec["builder"] = await page.evaluate(CUSTOM)
        except Exception as e:
            rec["builder_error"] = str(e)[:200]
    if kind == "product" and viewport == "mobile":
        try:
            await page.evaluate("() => window.scrollTo(0, Math.round(document.documentElement.scrollHeight * 0.4))")
            await page.wait_for_timeout(900)
            rec["sticky_bottom_bars"] = await page.evaluate(STICKY)
        except Exception as e:
            rec["sticky_error"] = str(e)[:200]
    if netlog:
        rec["network"] = netlog.summary(urlparse(page.url).hostname)
    rec["page_errors"] = errors[:10]
    rec["console_errors"] = console_errors[:10]
    rec["blocked"] = blocked((rec.get("dom") or {}).get("title"), rec.get("status"), (rec.get("dom") or {}).get("textLength"))
    return rec, hdrs


CUSTOM_RE = re.compile(r"\bcustom(?!er)|personali[sz]|design[- ]?your[- ]?own|build[- ]?your[- ]?own|create[- ]?your[- ]?own|configur|bespoke|made[- ]to[- ]order|custom[- ]lab", re.I)
COLL_RE = re.compile(r"/(collections|product-category|category|shop|c)/[^?#]*glove", re.I)
PROD_RE = re.compile(r"/(products?|p)/[^/?#]+/?$", re.I)
SKIP_RE = re.compile(r"/(cart|account|login|register|search|policies|blogs?|news|pages/contact|wishlist)(/|$|\?)|mailto:|tel:|javascript:", re.I)


def pick(anchors, site_dom, kind, find=None):
    best, best_score = None, 0
    for a in anchors or []:
        href, text = a.get("href", ""), a.get("text", "")
        host = urlparse(href).hostname
        if reg_domain(host) != site_dom or SKIP_RE.search(href) or href.rstrip("/").endswith("#"):
            continue
        path = urlparse(href).path
        s = 0
        if find and (re.search(find, href, re.I) or re.search(find, text, re.I)):
            s += 5
        if kind == "custom":
            if CUSTOM_RE.search(text):
                s += 4
            if CUSTOM_RE.search(path):
                s += 3
            if PROD_RE.search(path) and not CUSTOM_RE.search(path):
                s -= 2
        elif kind == "collection":
            if COLL_RE.search(path):
                s += 5
            if re.fullmatch(r"(boxing )?gloves", text.strip(), re.I):
                s += 3
            if re.search(r"/collections/", path) and re.search(r"boxing", path + text, re.I):
                s += 1
        elif kind == "product":
            if PROD_RE.search(path):
                s += 4
                if re.search(r"glove", path + text, re.I):
                    s += 2
            else:
                continue
        if s > best_score:
            best, best_score = href, s
    return best if best_score >= 3 else None


async def shopify_catalog(req, origin):
    """req is a cookie-free APIRequestContext, so prices come back in the shop's own currency, not a geo-localised one."""
    out = {"source": "shopify products.json (cookie-free request)"}
    prods = []
    for page_no in range(1, 5):
        try:
            r = await req.get(f"{origin}/products.json?limit=250&page={page_no}", timeout=30000)
            if not r.ok:
                out["status"] = r.status
                break
            ps = (await r.json()).get("products", [])
        except Exception as e:
            out["error"] = str(e)[:200]
            break
        prods += ps
        if len(ps) < 250:
            break
    try:
        r = await req.get(f"{origin}/meta.json", timeout=20000)
        if r.ok:
            m = await r.json()
            out["shop"] = {k: m.get(k) for k in ("name", "city", "province", "country", "currency", "published_products_count", "published_collections_count") if k in m}
    except Exception:
        pass
    if not prods:
        return out
    prices, discounted, variants = [], 0, 0
    for p in prods:
        for v in p.get("variants", []):
            variants += 1
            try:
                pr = float(v.get("price") or 0)
                prices.append(pr)
                if v.get("compare_at_price") and float(v["compare_at_price"]) > pr:
                    discounted += 1
            except Exception:
                pass
    prices = [x for x in prices if x > 0]
    custom = [p for p in prods if CUSTOM_RE.search(" ".join([p.get("title", ""), p.get("handle", ""), " ".join(p.get("tags", []) if isinstance(p.get("tags"), list) else [str(p.get("tags", ""))])]))]
    opts = Counter(o.get("name") for p in prods for o in p.get("options", []))
    out.update({"products": len(prods), "variants": variants, "types": Counter(p.get("product_type") or "(none)" for p in prods).most_common(15),
                "vendors": Counter(p.get("vendor") for p in prods).most_common(8), "option_names": opts.most_common(10),
                "price_min": min(prices) if prices else None, "price_median": statistics.median(prices) if prices else None,
                "price_p90": sorted(prices)[int(len(prices) * 0.9) - 1] if len(prices) > 9 else None, "price_max": max(prices) if prices else None,
                "variants_discounted_share": round(discounted / variants, 3) if variants else None,
                "custom_products": len(custom), "custom_examples": [p.get("title") for p in custom[:12]],
                "newest_created": max((p.get("created_at") or "" for p in prods), default=None),
                "glove_examples": [(p.get("title"), (p.get("variants") or [{}])[0].get("price")) for p in prods if re.search("glove", p.get("title", ""), re.I)][:12]})
    return out


async def woo_catalog(req, origin):
    out = {"source": "woocommerce store api"}
    items = []
    for page_no in range(1, 4):
        try:
            r = await req.get(f"{origin}/wp-json/wc/store/v1/products?per_page=100&page={page_no}", timeout=30000)
            if not r.ok:
                out["status"] = r.status
                break
            batch = await r.json()
        except Exception as e:
            out["error"] = str(e)[:200]
            break
        if not isinstance(batch, list):
            break
        items += batch
        if len(batch) < 100:
            break
    if not items:
        return out
    prices, cur = [], None
    for it in items:
        p = it.get("prices") or {}
        try:
            unit = int(p.get("currency_minor_unit", 2))
            v = int(p.get("price") or 0) / (10 ** unit)
            if v > 0:
                prices.append(v)
            cur = p.get("currency_code") or cur
        except Exception:
            pass
    cats = Counter(c.get("name") for it in items for c in (it.get("categories") or []))
    custom = [it.get("name") for it in items if CUSTOM_RE.search((it.get("name") or "") + " " + (it.get("slug") or ""))]
    out.update({"products": len(items), "currency": cur, "categories": cats.most_common(15),
                "price_min": min(prices) if prices else None, "price_median": statistics.median(prices) if prices else None,
                "price_max": max(prices) if prices else None, "custom_products": len(custom), "custom_examples": custom[:12]})
    return out


POLICY_PATHS = ["/policies/refund-policy", "/policies/shipping-policy", "/policies/terms-of-service", "/pages/faq", "/pages/faqs",
                "/pages/shipping", "/pages/returns", "/pages/about", "/pages/about-us", "/pages/our-story", "/about", "/about-us", "/faq",
                "/shipping", "/returns", "/pages/warranty", "/pages/wholesale", "/pages/team-orders"]
POLICY_LINK_RE = re.compile(r"shipping|delivery|return|refund|faq|about|story|warranty|guarantee|wholesale|team|club|gym|b2b|custom|lead time|production", re.I)


async def fetch_policies(req, origin, anchors, site_dom, text_dir, cap=12):
    urls = [origin + p for p in POLICY_PATHS]
    for a in anchors or []:
        if reg_domain(urlparse(a["href"]).hostname) == site_dom and POLICY_LINK_RE.search(a.get("text", "") + " " + urlparse(a["href"]).path):
            urls.append(a["href"].split("#")[0])
    seen, out = set(), []
    for u in urls:
        if u in seen or len(out) >= cap:
            continue
        seen.add(u)
        try:
            r = await req.get(u, timeout=20000, max_redirects=5)
            if not r.ok or "html" not in (r.headers.get("content-type", "")):
                continue
            txt = html_to_text(await r.text())
            if len(txt) < 200:
                continue
            name = re.sub(r"[^a-z0-9]+", "-", urlparse(r.url).path.lower()).strip("-")[:60] or "root"
            with open(os.path.join(text_dir, f"policy_{name}.txt"), "w") as f:
                f.write(r.url + "\n\n" + txt[:12000])
            out.append({"url": r.url, "chars": len(txt), "file": f"policy_{name}.txt", "excerpt": txt[:400]})
        except Exception:
            continue
    return out


async def audit_site(pw, chromium, webkit, site, out_root):
    slug = site["slug"]
    site_dir = os.path.join(out_root, "data", slug)
    for sub in ("shots", "text"):
        os.makedirs(os.path.join(site_dir, sub), exist_ok=True)
    data = {"slug": slug, "name": site["name"], "start_url": site["url"], "audited_at": time.strftime("%Y-%m-%d %H:%M %Z"), "pages": []}

    def save():
        with open(os.path.join(site_dir, "data.json"), "w") as f:
            json.dump(data, f, indent=1, default=str)

    dctx = await chromium.new_context(viewport={"width": 1440, "height": 900}, user_agent=DESKTOP_UA, locale="en-GB", timezone_id="Asia/Bangkok")
    mctx = await webkit.new_context(**pw.devices["iPhone 14"], locale="en-GB", timezone_id="Asia/Bangkok")
    await dctx.add_init_script(PERF_INIT)
    await mctx.add_init_script(PERF_INIT)
    try:
        dpage = await dctx.new_page()
        net = NetLog()
        cdp = await dctx.new_cdp_session(dpage)
        await cdp.send("Network.enable")
        cdp.on("Network.responseReceived", net.on_response)
        cdp.on("Network.loadingFinished", net.on_finished)
        mpage = await mctx.new_page()

        start = site["url"]
        log(slug, f"home desktop {start}")
        rec, hdrs = await visit(dctx, dpage, start, "home", "desktop", site_dir, net, want_full=True)
        if (rec.get("error") or rec.get("blocked")) and site.get("fallback"):
            log(slug, f"home failed or blocked, trying fallback {site['fallback']}")
            start = site["fallback"]
            rec, hdrs = await visit(dctx, dpage, start, "home", "desktop", site_dir, net, want_full=True)
        data["pages"].append(rec)
        save()
        dom = rec.get("dom") or {}
        data["platform"] = classify_platform(dom.get("globals"), (rec.get("network") or {}).get("vendors", []), rec.get("headers"), dom.get("generator"))
        final = rec.get("final_url") or start
        origin = f"{urlparse(final).scheme}://{urlparse(final).netloc}"
        site_dom = reg_domain(urlparse(final).hostname)
        data["origin"] = origin
        log(slug, f"home desktop done: status {rec.get('status')} platform {data['platform']} lcp {(rec.get('perf') or {}).get('lcp')}ms {((rec.get('network') or {}).get('kb_total'))}KB")

        log(slug, "home mobile")
        mrec, _ = await visit(mctx, mpage, final, "home", "mobile", site_dir, None, want_full=True)
        data["pages"].append(mrec)
        save()

        anchors = dom.get("anchors") or []
        seeds = site.get("seeds", {})
        find = site.get("find")
        targets = {
            "custom": seeds.get("custom") or pick(anchors, site_dom, "custom", find),
            "collection": seeds.get("collection") or pick(anchors, site_dom, "collection", find),
            "product": seeds.get("product") or pick(anchors, site_dom, "product", find),
            "extra": seeds.get("extra"),
        }
        data["discovered"] = dict(targets)
        for kind in ("custom", "collection", "product", "extra"):
            url = targets.get(kind)
            if not url and kind == "product" and data.get("_collection_anchors"):
                url = pick(data["_collection_anchors"], site_dom, "product", find)
                targets["product"] = url
                data["discovered"]["product"] = url
            if not url:
                continue
            log(slug, f"{kind} desktop {url}")
            r, _ = await visit(dctx, dpage, url, kind, "desktop", site_dir, net, want_full=(kind in ("custom", "product")))
            data["pages"].append(r)
            if kind == "collection":
                data["_collection_anchors"] = (r.get("dom") or {}).get("anchors") or []
            save()
            log(slug, f"{kind} mobile")
            r2, _ = await visit(mctx, mpage, url, kind, "mobile", site_dir, None, want_full=(kind in ("custom", "product", "collection")))
            data["pages"].append(r2)
            save()
        data.pop("_collection_anchors", None)

        api = await pw.request.new_context(user_agent=DESKTOP_UA)
        try:
            if data["platform"] == "Shopify":
                log(slug, "catalogue (Shopify products.json)")
                data["catalog"] = await shopify_catalog(api, origin)
            elif "WooCommerce" in data["platform"] or data["platform"] == "WordPress":
                log(slug, "catalogue (WooCommerce Store API)")
                data["catalog"] = await woo_catalog(api, origin)
            save()
            log(slug, "policies and about pages")
            data["policies"] = await fetch_policies(api, origin, anchors, site_dom, os.path.join(site_dir, "text"))
        finally:
            await api.dispose()
        for p in data["pages"]:
            if p.get("dom"):
                p["dom"]["anchors_count"] = len(p["dom"].get("anchors") or [])
                p["dom"].pop("anchors", None)
        save()
        log(slug, f"DONE: {len(data['pages'])} page views, {len(data.get('policies', []))} policy pages, catalogue {((data.get('catalog') or {}).get('products'))}")
    except Exception as e:
        data["fatal"] = f"{type(e).__name__}: {str(e)[:400]}"
        data["trace"] = traceback.format_exc()[-1500:]
        log(slug, f"FAILED: {data['fatal']}")
        for p in data["pages"]:
            if p.get("dom"):
                p["dom"].pop("anchors", None)
        save()
    finally:
        await dctx.close()
        await mctx.close()
    return data


def summarise(d):
    pages = d.get("pages", [])

    def pg(kind, vp):
        return next((p for p in pages if p.get("kind") == kind and p.get("viewport") == vp), {})

    hd, hm = pg("home", "desktop"), pg("home", "mobile")
    pd, pm = pg("product", "desktop"), pg("product", "mobile")
    cd = pg("custom", "desktop")
    net = hd.get("network") or {}
    perf = hd.get("perf") or {}
    dom = hd.get("dom") or {}
    cat = d.get("catalog") or {}
    vend = net.get("vendors", [])
    pick_v = lambda names: [v for v in vend if v in names]
    bt = net.get("by_type", {})
    builder = cd.get("builder") or {}
    return {
        "slug": d["slug"], "name": d["name"], "url": d.get("origin") or d.get("start_url"), "platform": d.get("platform"),
        "theme": ((dom.get("shop") or {}).get("theme")), "blocked": hd.get("blocked"), "fatal": d.get("fatal"),
        "home_ttfb_ms": perf.get("ttfb"), "home_fcp_ms": perf.get("fcp"), "home_lcp_ms": perf.get("lcp"), "home_cls": perf.get("cls"),
        "home_long_tasks": perf.get("longtasks"), "home_dom_nodes": perf.get("domNodes"), "home_requests": net.get("requests"),
        "home_kb": net.get("kb_total"), "home_js_kb": (bt.get("Script") or {}).get("kb"), "home_img_kb": (bt.get("Image") or {}).get("kb"),
        "third_party_domains": net.get("third_party_domains"), "analytics_ads": pick_v({"Google Tag Manager", "Google Analytics 4", "Google Ads", "Meta Pixel", "TikTok Pixel", "Snapchat Pixel", "Pinterest Tag", "Microsoft Clarity", "Hotjar", "Bing Ads", "Triple Whale", "Northbeam", "Criteo", "Elevar", "Segment"}),
        "email_sms": pick_v({"Klaviyo", "Attentive", "Postscript", "Omnisend", "Mailchimp", "Privy", "Justuno"}),
        "reviews": pick_v({"Yotpo", "Okendo", "Judge.me", "Stamped", "Trustpilot", "Reviews.io", "Loox", "Junip"}),
        "chat": pick_v({"Gorgias", "Re:amaze", "Zendesk", "Tidio", "Intercom", "LiveChat", "Tawk.to"}),
        "bnpl": pick_v({"Afterpay/Clearpay", "Klarna", "Zip", "Sezzle", "Affirm", "Shop Pay", "PayPal"}),
        "builder_tech": pick_v({"Zakeke (3D customiser)", "Threekit (3D)", "Doogma (builder)", "Customily", "Kickflip", "Expivi (3D)", "Sketchfab", "three.js"}) + (builder.get("builderScripts") or [])[:2],
        "custom_page": (d.get("discovered") or {}).get("custom"), "custom_canvases": len(builder.get("canvases") or []), "custom_upload": builder.get("fileUpload"),
        "custom_quote_flow": builder.get("quoteFlow"), "custom_lead_time": builder.get("leadTime"), "custom_no_refund": builder.get("noRefund"),
        "product_page": (d.get("discovered") or {}).get("product"), "product_price": (pd.get("product") or {}).get("price"),
        "product_cta": (pd.get("product") or {}).get("addToCart"), "product_bnpl_text": (pd.get("product") or {}).get("bnpl"),
        "product_delivery_text": (pd.get("product") or {}).get("delivery"), "mobile_sticky_bar": (pm.get("sticky_bottom_bars") or [])[:2],
        "h1": (dom.get("h1") or [None])[0], "nav": (dom.get("navVisible") or [])[:12], "announcement": (dom.get("announcement") or [None])[0],
        "email_popup": (hd.get("popups") or {}).get("emailPopup") or (hm.get("popups") or {}).get("emailPopup"),
        "cookie_banner": bool((hd.get("popups") or {}).get("cookie")), "fonts_loaded": (dom.get("fonts") or {}).get("loaded"),
        "palette_desktop": [c.get("hex") for c in (hd.get("palette") or [])][:5], "localisation": dom.get("localisation"),
        "ld_types": dom.get("ldTypes"), "img_no_alt": (dom.get("imgStats") or {}).get("noAlt"), "img_total": (dom.get("imgStats") or {}).get("total"),
        "catalog_products": cat.get("products"), "catalog_price_min": cat.get("price_min"), "catalog_price_median": cat.get("price_median"),
        "catalog_price_max": cat.get("price_max"), "catalog_currency": (cat.get("shop") or {}).get("currency") or cat.get("currency"),
        "catalog_custom_products": cat.get("custom_products"), "policies_fetched": len(d.get("policies") or []),
        "mobile_lcp_ms": (hm.get("perf") or {}).get("lcp"), "mobile_status": hm.get("status"),
    }


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--only", default="")
    ap.add_argument("--concurrency", type=int, default=4)
    a = ap.parse_args()
    sites = json.load(open(os.path.join(HERE, "sites.json")))
    if a.only:
        keep = set(a.only.split(","))
        sites = [s for s in sites if s["slug"] in keep]
    os.makedirs(os.path.join(a.out, "data"), exist_ok=True)
    sem = asyncio.Semaphore(a.concurrency)
    results = []
    async with async_playwright() as pw:
        chromium = await pw.chromium.launch(headless=True, args=["--enable-unsafe-swiftshader", "--use-angle=swiftshader"])
        webkit = await pw.webkit.launch(headless=True)

        async def run(site):
            async with sem:
                t0 = time.time()
                try:
                    d = await asyncio.wait_for(audit_site(pw, chromium, webkit, site, a.out), timeout=SITE_TIMEOUT)
                except asyncio.TimeoutError:
                    log(site["slug"], f"TIMEOUT after {SITE_TIMEOUT}s (partial data kept)")
                    p = os.path.join(a.out, "data", site["slug"], "data.json")
                    d = json.load(open(p)) if os.path.exists(p) else {"slug": site["slug"], "name": site["name"], "pages": []}
                    d["fatal"] = "site timeout"
                log(site["slug"], f"finished in {round(time.time() - t0)}s")
                results.append(d)

        await asyncio.gather(*(run(s) for s in sites))
        await chromium.close()
        await webkit.close()
    order = {s["slug"]: i for i, s in enumerate(json.load(open(os.path.join(HERE, "sites.json"))))}
    results.sort(key=lambda d: order.get(d["slug"], 99))
    rows = [summarise(d) for d in results]
    # merge with any existing summary (so a partial re-run keeps the other sites)
    sp = os.path.join(a.out, "summary.json")
    if os.path.exists(sp) and a.only:
        old = {r["slug"]: r for r in json.load(open(sp))}
        for r in rows:
            old[r["slug"]] = r
        rows = sorted(old.values(), key=lambda r: order.get(r["slug"], 99))
    with open(sp, "w") as f:
        json.dump(rows, f, indent=1, default=str)
    with open(os.path.join(a.out, "summary.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        for r in rows:
            w.writerow({k: (json.dumps(v) if isinstance(v, (list, dict)) else v) for k, v in r.items()})
    print(f"ALL DONE: {len(results)} sites -> {a.out}", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
