#!/usr/bin/env node
/**
 * Extract the Sanchez HTML prototype into JSON that the Figma plugin can rebuild as layers.
 *
 * Usage:  node extract.js [pageId ...]            (default: all pages, desktop + mobile for key pages)
 * Needs:  the prototype served at http://localhost:8000/prototype/  (cd ~/Code/sanchez-web && python3 -m http.server 8000)
 * Output: ./out/<page>.<desktop|mobile>.json  { page, tokens, tree, images }
 */
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const BASE = process.env.PROTO_BASE || "http://localhost:8000/prototype/";
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = path.join(__dirname, "out");

const KEY = ["index", "product", "configure", "review", "checkout"];
const ALL = fs.readdirSync(path.join(__dirname, "../../../prototype")).filter((f) => f.endsWith(".html")).map((f) => f.replace(".html", ""));
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };

/* ---------- runs inside the page ---------- */
function pageWalker() {
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "LINK", "META", "HEAD", "TEMPLATE", "SOURCE", "TRACK", "TITLE", "BASE", "DATALIST", "OPTION", "OPTGROUP"]);
  const imgUse = new Map(); // src -> max displayed width
  const sx = window.scrollX, sy = window.scrollY;

  const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const round = (n) => Math.round(n * 100) / 100;
  function color(str) {
    if (!str || str === "transparent") return [0, 0, 0, 0];
    let m = str.match(/rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.%]+))?\s*\)/);
    if (m) { let a = m[4] === undefined ? 1 : (m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4])); return [Math.round(+m[1]), Math.round(+m[2]), Math.round(+m[3]), round(a)]; }
    m = str.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/);
    if (m) return [Math.round(m[1] * 255), Math.round(m[2] * 255), Math.round(m[3] * 255), m[4] === undefined ? 1 : +m[4]];
    return [0, 0, 0, 1];
  }
  const isVisibleColor = (c) => c[3] > 0.001;
  function splitTop(s) { // split on top-level commas
    const out = []; let d = 0, cur = "";
    for (const ch of s) { if (ch === "(") d++; if (ch === ")") d--; if (ch === "," && d === 0) { out.push(cur.trim()); cur = ""; } else cur += ch; }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  function parseGradient(str, w, h) {
    const m = str.match(/^(linear|radial)-gradient\((.*)\)$/s);
    if (!m) return null;
    const parts = splitTop(m[2]);
    let angle = 180, i = 0;
    if (m[1] === "linear") {
      const a = parts[0];
      let mm;
      if ((mm = a.match(/^(-?[\d.]+)(deg|turn|rad|grad)$/))) { const v = +mm[1]; angle = mm[2] === "deg" ? v : mm[2] === "turn" ? v * 360 : mm[2] === "rad" ? v * 180 / Math.PI : v * 0.9; i = 1; }
      else if (a.startsWith("to ")) {
        const t = a.slice(3).trim(); const map = { top: 0, "top right": 45, "right top": 45, right: 90, "bottom right": 135, "right bottom": 135, bottom: 180, "bottom left": 225, "left bottom": 225, left: 270, "left top": 315, "top left": 315 };
        angle = map[t] !== undefined ? map[t] : 180; i = 1;
      }
    } else if (/^(circle|ellipse|closest|farthest|at )/.test(parts[0])) i = 1;
    const stops = [];
    for (; i < parts.length; i++) {
      const mm = parts[i].match(/^(rgba?\([^)]*\)|color\([^)]*\)|#[0-9a-fA-F]+|[a-zA-Z]+)\s*(.*)$/);
      if (!mm) continue;
      let pos = null;
      if (mm[2]) { const pm = mm[2].match(/^(-?[\d.]+)(%|px)/); if (pm) pos = pm[2] === "%" ? +pm[1] / 100 : +pm[1] / (m[1] === "linear" ? (Math.abs(Math.sin(angle * Math.PI / 180)) * w + Math.abs(Math.cos(angle * Math.PI / 180)) * h) || 1 : w || 1); }
      stops.push({ c: color(mm[1] === "currentcolor" ? "rgb(0,0,0)" : mm[1]), p: pos });
    }
    if (stops.length < 2) return null;
    if (stops[0].p === null) stops[0].p = 0;
    if (stops[stops.length - 1].p === null) stops[stops.length - 1].p = 1;
    for (let k = 1; k < stops.length - 1; k++) if (stops[k].p === null) {
      let a = k - 1, b = k + 1; while (stops[b].p === null) b++;
      const n = b - a; for (let j = a + 1; j < b; j++) stops[j].p = stops[a].p + (stops[b].p - stops[a].p) * (j - a) / n;
    }
    stops.forEach((s) => { s.p = Math.max(0, Math.min(1, s.p)); });
    return { t: m[1] === "linear" ? "gl" : "gr", angle, stops };
  }
  function fillsFor(el, cs, w, h) {
    const fills = [], subs = [];
    const bg = color(cs.backgroundColor);
    if (isVisibleColor(bg)) fills.push({ t: "s", c: bg });
    const bi = cs.backgroundImage;
    if (bi && bi !== "none") {
      const layers = splitTop(bi);
      const sizes = splitTop(cs.backgroundSize || "auto");
      const reps = splitTop(cs.backgroundRepeat || "repeat");
      const poss = splitTop(cs.backgroundPosition || "0% 0%");
      const at = (arr, i) => arr[i % arr.length];
      const dim = (tok, box) => { if (!tok || tok === "auto") return null; return tok.endsWith("%") ? box * parseFloat(tok) / 100 : num(tok); };
      const off = (tok, box, lay) => {
        const m = tok.match(/^calc\(\s*(-?[\d.]+)%\s*([+-])\s*([\d.]+)px\s*\)$/);
        if (m) return (box - lay) * parseFloat(m[1]) / 100 + (m[2] === "-" ? -1 : 1) * parseFloat(m[3]);
        if (tok.endsWith("%")) return (box - lay) * parseFloat(tok) / 100;
        return num(tok);
      };
      for (let idx = layers.length - 1; idx >= 0; idx--) { // CSS: first layer on top; Figma: last on top
        const L = layers[idx];
        const sz = at(sizes, idx), rep = at(reps, idx), pos = at(poss, idx);
        const um = L.match(/^url\(["']?(.*?)["']?\)$/);
        const sw = sz.split(/\s+/);
        const explicit = !/cover|contain|auto$/.test(sz) && sz !== "auto" && sz !== "auto auto";
        let fill = null;
        if (um) {
          const src = new URL(um[1], document.baseURI).href;
          imgUse.set(src, Math.max(imgUse.get(src) || 0, w));
          fill = { t: "i", src, mode: /contain/.test(sz) ? "FIT" : /cover/.test(sz) ? "FILL" : /no-repeat/.test(rep) ? "FILL" : "TILE" };
        } else fill = parseGradient(L, explicit ? (dim(sw[0], w) || w) : w, explicit ? (dim(sw[1] || sw[0], h) || h) : h);
        if (!fill) continue;
        if (explicit && /no-repeat/.test(rep)) { // a small positioned graphic (e.g. select chevron)
          const lw = dim(sw[0], w) || w, lh = dim(sw[1] || sw[0], h) || h;
          const px = pos.split(/\s+(?![^(]*\))/); // split on spaces outside calc()
          subs.push({ fill, x: off(px[0] || "0%", w, lw), y: off(px[1] || "0%", h, lh), w: lw, h: lh });
        } else if (explicit) {
          continue; // tiled pattern: not representable, drop rather than smear over the whole box
        } else fills.push(fill);
      }
    }
    return { fills, subs };
  }
  function shadowsFor(cs) {
    const s = cs.boxShadow; if (!s || s === "none") return [];
    return splitTop(s).map((p) => {
      if (/inset/.test(p)) return null;
      const cm = p.match(/rgba?\([^)]*\)|color\([^)]*\)/); if (!cm) return null;
      const rest = p.replace(cm[0], "").trim().split(/\s+/).map(num);
      return { x: rest[0] || 0, y: rest[1] || 0, b: rest[2] || 0, s: rest[3] || 0, c: color(cm[0]) };
    }).filter(Boolean);
  }
  function fontInfo(cs) {
    const fam = (cs.fontFamily || "").split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
    const generic = /^(sans-serif|serif|monospace|system-ui|ui-monospace|-apple-system|BlinkMacSystemFont)$/i;
    const first = fam.find((f) => !generic.test(f)) || "Inter";
    const lh = cs.lineHeight === "normal" ? round(num(cs.fontSize) * 1.2) : round(num(cs.lineHeight));
    return { ff: first, fw: parseInt(cs.fontWeight, 10) || 400, fi: cs.fontStyle === "italic", fs: round(num(cs.fontSize)), lh, ls: cs.letterSpacing === "normal" ? 0 : round(num(cs.letterSpacing)) };
  }
  function xform(t, cs) {
    let s = t;
    if (cs.textTransform === "uppercase") s = s.toUpperCase();
    else if (cs.textTransform === "lowercase") s = s.toLowerCase();
    else if (cs.textTransform === "capitalize") s = s.replace(/\b\w/g, (c) => c.toUpperCase());
    return s;
  }
  function textNode(text, cs, rects, name) {
    const pre = /pre/.test(cs.whiteSpace);
    let s = pre ? text : text.replace(/\s+/g, " ").trim();
    if (!s) return null;
    s = xform(s, cs);
    let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    for (const q of rects) { if (q.width === 0 && q.height === 0) continue; l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom); }
    if (!isFinite(l)) return null;
    const f = fontInfo(cs);
    const lines = new Set(Array.from(rects).map((q) => Math.round(q.top))).size;
    const col = color(cs.color);
    return { k: "t", n: name || s.slice(0, 32), ax: l + sx, ay: t + sy, w: round(r - l), h: round(b - t), ch: round(rects[0].height), s, ...f, ta: cs.textAlign, col, ul: /underline/.test(cs.textDecorationLine), one: lines <= 1 && !pre, o: 1 };
  }
  function svgNode(el, cs, rect) {
    const clone = el.cloneNode(true);
    // bake CSS-applied paint into attributes (icons are styled by class: fill:none; stroke:currentColor)
    const origAll = [el, ...el.querySelectorAll("*")], cloneAll = [clone, ...clone.querySelectorAll("*")];
    origAll.forEach((o, i) => {
      const c = cloneAll[i]; if (!c) return;
      const st = getComputedStyle(o);
      const paint = (v) => (v === "none" ? "none" : v);
      c.setAttribute("fill", paint(st.fill));
      c.setAttribute("stroke", paint(st.stroke));
      if (st.stroke !== "none") {
        c.setAttribute("stroke-width", st.strokeWidth.replace("px", ""));
        c.setAttribute("stroke-linecap", st.strokeLinecap); c.setAttribute("stroke-linejoin", st.strokeLinejoin);
      }
      if (st.opacity !== "1") c.setAttribute("opacity", st.opacity);
    });
    clone.querySelectorAll("use").forEach((u) => {
      const href = u.getAttribute("href") || u.getAttribute("xlink:href");
      if (href && href[0] === "#") {
        const ref = document.querySelector(href);
        if (ref) {
          const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
          g.innerHTML = ref.innerHTML;
          if (ref.tagName.toLowerCase() === "symbol" && ref.getAttribute("viewBox") && !clone.getAttribute("viewBox")) clone.setAttribute("viewBox", ref.getAttribute("viewBox"));
          u.replaceWith(g);
        }
      }
    });
    const c = cs.color;
    clone.setAttribute("width", round(rect.width)); clone.setAttribute("height", round(rect.height));
    if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    let str = new XMLSerializer().serializeToString(clone).replace(/currentColor/g, c);
    return { k: "v", n: el.getAttribute("aria-label") || el.getAttribute("class") || "icon", ax: rect.left + sx, ay: rect.top + sy, w: round(rect.width), h: round(rect.height), svg: str, o: round(num(cs.opacity)) };
  }
  function nameOf(el) {
    if (el.tagName === "BODY") return "body";
    const cl = (el.getAttribute("class") || "").trim().split(/\s+/)[0];
    const id = el.id;
    const label = el.getAttribute("aria-label");
    return (id ? "#" + id : cl ? "." + cl : el.tagName.toLowerCase()) + (label ? " · " + label.slice(0, 28) : "");
  }

  function pseudoNodes(el, cs, rect, which) {
    const p = getComputedStyle(el, which);
    if (p.display === "none" || p.content === "none" || p.content === "normal") return [];
    const w = num(p.width), h = num(p.height);
    const bg = color(p.backgroundColor);
    const bw = [p.borderTopWidth, p.borderRightWidth, p.borderBottomWidth, p.borderLeftWidth].map(num);
    const hasBox = (p.position === "absolute" || p.position === "fixed") && w > 0 && h > 0 && (isVisibleColor(bg) || bw.some((x) => x > 0) || (p.backgroundImage && p.backgroundImage !== "none"));
    const out = [];
    const txt = p.content.replace(/^["']|["']$/g, "");
    if (hasBox) {
      const bl = num(cs.borderLeftWidth), bt = num(cs.borderTopWidth);
      let x = null, y = null;
      if (p.left !== "auto") x = rect.left + bl + num(p.left); else if (p.right !== "auto") x = rect.right - num(cs.borderRightWidth) - num(p.right) - w;
      if (p.top !== "auto") y = rect.top + bt + num(p.top); else if (p.bottom !== "auto") y = rect.bottom - num(cs.borderBottomWidth) - num(p.bottom) - h;
      if (x !== null && y !== null) {
        const fills = fillsFor(el, p, w, h).fills;
        out.push({ k: "f", n: which, ax: x + sx, ay: y + sy, w: round(w), h: round(h), fills, r: [p.borderTopLeftRadius, p.borderTopRightRadius, p.borderBottomRightRadius, p.borderBottomLeftRadius].map((v) => Math.min(num(v), 9999)), bw, bc: [color(p.borderTopColor), color(p.borderRightColor), color(p.borderBottomColor), color(p.borderLeftColor)], sh: shadowsFor(p), o: round(num(p.opacity)), c: [] });
      }
    }
    return out;
  }

  function visit(el) {
    if (el.nodeType !== 1 || SKIP.has(el.tagName)) return [];
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.visibility === "collapse") return [];
    const op = num(cs.opacity);
    if (op === 0) return [];
    const rect = el.getBoundingClientRect();
    const tag = el.tagName;

    if (tag === "svg") { if (rect.width < 1 || rect.height < 1) return []; return [svgNode(el, cs, rect)]; }
    if (el.namespaceURI === "http://www.w3.org/2000/svg") return [];

    const isContents = cs.display === "contents";
    const w = rect.width, h = rect.height;
    const _ff = isContents ? { fills: [], subs: [] } : fillsFor(el, cs, w, h);
    const fills = _ff.fills;
    const bw = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map(num);
    const bc = [cs.borderTopColor, cs.borderRightColor, cs.borderBottomColor, cs.borderLeftColor].map(color);
    const hasBorder = !isContents && bw.some((v, i) => v > 0 && isVisibleColor(bc[i]) && cs[["borderTopStyle", "borderRightStyle", "borderBottomStyle", "borderLeftStyle"][i]] !== "none");
    const sh = isContents ? [] : shadowsFor(cs);
    const blur = /blur\(([\d.]+)px\)/.exec(cs.backdropFilter || cs.webkitBackdropFilter || "");
    const clip = !isContents && /(hidden|clip|auto|scroll)/.test(cs.overflowX + cs.overflowY);
    let isFrame = !isContents && (fills.length || _ff.subs.length || hasBorder || sh.length || blur);
    if (tag === "IMG") {
      const src = el.currentSrc || el.src;
      if (src) {
        const abs = new URL(src, document.baseURI).href; imgUse.set(abs, Math.max(imgUse.get(abs) || 0, w));
        const fit = cs.objectFit;
        fills.push({ t: "i", src: abs, mode: fit === "contain" || fit === "scale-down" ? "FIT" : "FILL" });
        isFrame = true;
      }
    }
    if (tag === "VIDEO") {
      const poster = el.getAttribute("poster");
      if (poster) { const abs = new URL(poster, document.baseURI).href; imgUse.set(abs, Math.max(imgUse.get(abs) || 0, w)); fills.push({ t: "i", src: abs, mode: "FILL" }); }
      else fills.push({ t: "s", c: [30, 24, 20, 1] });
      isFrame = true;
    }
    if (tag === "INPUT" && el.type === "color") isFrame = true;
    if (tag === "CANVAS" || tag === "IFRAME") { fills.push({ t: "s", c: [58, 46, 37, 1] }); isFrame = true; }
    if (clip && (rect.width > 0 && rect.height > 0) && !isFrame) isFrame = true;
    if (isFrame && (w < 0.5 || h < 0.5)) isFrame = false;

    // children in DOM order: elements, text nodes, plus ::before / ::after boxes
    const kids = [];
    for (const sb of _ff.subs) kids.push({ k: "f", n: "bg-layer", ax: rect.left + sx + num(cs.borderLeftWidth) + sb.x, ay: rect.top + sy + num(cs.borderTopWidth) + sb.y, w: round(sb.w), h: round(sb.h), fills: [sb.fill], r: [0, 0, 0, 0], bw: [0, 0, 0, 0], bc: [], sh: [], bb: 0, o: 1, clip: 0, c: [] });
    if (!isContents && rect.width > 0) {
      for (const pn of pseudoNodes(el, cs, rect, "::before")) kids.push(pn);
    }
    if (tag === "INPUT" && el.type === "color") { // native swatch lives in shadow DOM: draw it inset by padding + border
      const m = /^#?([0-9a-f]{6})$/i.exec(el.value || "");
      const c = m ? [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16), 1] : [0, 0, 0, 1];
      const il = num(cs.borderLeftWidth) + num(cs.paddingLeft), it = num(cs.borderTopWidth) + num(cs.paddingTop), ir = num(cs.borderRightWidth) + num(cs.paddingRight), ib = num(cs.borderBottomWidth) + num(cs.paddingBottom);
      kids.push({ k: "f", n: "color-swatch", ax: rect.left + sx + il, ay: rect.top + sy + it, w: round(rect.width - il - ir), h: round(rect.height - it - ib), fills: [{ t: "s", c }], r: [3, 3, 3, 3], bw: [1, 1, 1, 1], bc: [[255, 255, 255, 0.18], [255, 255, 255, 0.18], [255, 255, 255, 0.18], [255, 255, 255, 0.18]], sh: [], bb: 0, o: 1, clip: 0, c: [] });
    } else if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
      let val = tag === "SELECT" ? (el.options[el.selectedIndex] || {}).text : el.value;
      let ph = false;
      if (!val && el.placeholder) { val = el.placeholder; ph = true; }
      if (val && !/^(checkbox|radio|hidden|range|file|color)$/.test(el.type || "")) {
        const range = document.createRange(); range.selectNodeContents(el);
        const padL = num(cs.paddingLeft), padT = num(cs.paddingTop), bwL = num(cs.borderLeftWidth), bwT = num(cs.borderTopWidth);
        const f = fontInfo(cs); const col = color(cs.color); if (ph) col[3] = Math.min(col[3], 0.55);
        kids.push({ k: "t", n: "value", ax: rect.left + sx + padL + bwL, ay: rect.top + sy + (rect.height - f.lh) / 2, w: Math.max(10, rect.width - padL - num(cs.paddingRight) - bwL * 2), h: f.lh, s: xform(val, cs), ...f, ta: cs.textAlign, col, ul: false, one: true, o: 1 });
      }
    } else {
      for (const ch of el.childNodes) {
        if (ch.nodeType === 3) {
          const range = document.createRange(); range.selectNodeContents(ch);
          const tn = textNode(ch.textContent, cs, Array.from(range.getClientRects()));
          if (tn) kids.push(tn);
        } else if (ch.nodeType === 1) {
          for (const n of visit(ch)) kids.push(n);
        }
      }
    }
    if (!isContents && rect.width > 0) {
      for (const pn of pseudoNodes(el, cs, rect, "::after")) kids.push(pn);
    }

    // stable z-order for positioned siblings with explicit z-index
    const z = cs.position !== "static" && cs.zIndex !== "auto" ? parseInt(cs.zIndex, 10) || 0 : 0;

    if (!isFrame) {
      kids.forEach((k) => { k._z = k._z !== undefined ? k._z : 0; });
      if (z && kids.length) kids.forEach((k) => { k._z = z; });
      return kids;
    }
    const node = {
      k: "f", n: nameOf(el), ax: rect.left + sx, ay: rect.top + sy, w: round(w), h: round(h), fills,
      r: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map((v) => Math.min(num(v), 9999)),
      bw: hasBorder ? bw : [0, 0, 0, 0], bc, sh, bb: blur ? +blur[1] : 0, o: round(op), clip: clip ? 1 : 0, c: kids, _z: z
    };
    return [node];
  }

  function finish(node, origin) { // convert absolute coords to parent-relative, sort by z, drop scratch keys
    node.x = round(node.ax - origin.x); node.y = round(node.ay - origin.y);
    delete node.ax; delete node.ay;
    if (node.c) {
      const o2 = { x: node.x + origin.x, y: node.y + origin.y };
      node.c.forEach((k) => finish(k, o2));
      node.c = node.c.map((k, i) => ({ k, i })).sort((a, b) => ((a.k._z || 0) - (b.k._z || 0)) || (a.i - b.i)).map((e) => e.k);
    }
    delete node._z;
    return node;
  }

  const root = document.documentElement;
  const bodyBg = color(getComputedStyle(document.body).backgroundColor);
  const htmlBg = color(getComputedStyle(root).backgroundColor);
  const W = Math.round(Math.max(root.scrollWidth, window.innerWidth));
  const H = Math.round(Math.max(root.scrollHeight, document.body.scrollHeight));
  const top = visit(document.body);
  const bodyKids = top.length === 1 && top[0].k === "f" && top[0].n === "body" ? top[0].c : top;
  const tree = { k: "f", n: "page", ax: 0, ay: 0, w: W, h: H, fills: [{ t: "s", c: isVisibleColor(bodyBg) ? bodyBg : isVisibleColor(htmlBg) ? htmlBg : [255, 255, 255, 1] }], r: [0, 0, 0, 0], bw: [0, 0, 0, 0], bc: [], sh: [], bb: 0, o: 1, clip: 1, c: bodyKids };
  finish(tree, { x: 0, y: 0 });

  // design tokens from :root custom properties
  const tokens = {};
  const rcs = getComputedStyle(root);
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
    for (const rule of rules) if (rule.selectorText === ":root") for (const name of rule.style) if (name.startsWith("--")) tokens[name] = rcs.getPropertyValue(name).trim();
  }
  return { title: document.title, width: W, height: H, tree, tokens, imgUse: Array.from(imgUse.entries()) };
}

/* ---------- runs inside the page: fetch + downscale images ---------- */
async function pageImages(list) {
  const out = {};
  for (const [src, dispW] of list) {
    try {
      const img = new Image(); img.crossOrigin = "anonymous"; img.src = src; await img.decode();
      const target = Math.min(img.naturalWidth, Math.max(64, Math.ceil(dispW * 2)), 1800);
      const scale = target / img.naturalWidth;
      const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(img.naturalWidth * scale)); c.height = Math.max(1, Math.round(img.naturalHeight * scale));
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const png = /\.(png|svg|gif|webp)(\?|$)/i.test(src);
      out[src] = png ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.85);
    } catch (e) { out[src] = null; }
  }
  return out;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const want = process.argv.slice(2);
  const pages = want.length ? want : ALL;
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--hide-scrollbars"] });
  const summary = [];
  for (const id of pages) {
    for (const vp of ["desktop", "mobile"]) {
      if (vp === "mobile" && !KEY.includes(id)) continue;
      const page = await browser.newPage();
      await page.setViewport({ ...VIEWPORTS[vp], deviceScaleFactor: 1 });
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
      await page.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch (e) {} });
      const url = `${BASE}${id}.html`;
      try {
        await page.goto(url, { waitUntil: "networkidle0", timeout: 45000 });
        await page.evaluate(() => document.fonts && document.fonts.ready);
        // kill transitions/animations so everything is in its resting state
        await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" });
        await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
        await new Promise((r) => setTimeout(r, 400));
        const data = await page.evaluate(pageWalker);
        const images = await page.evaluate(pageImages, data.imgUse);
        delete data.imgUse;
        const file = path.join(OUT, `${id}.${vp}.json`);
        fs.writeFileSync(file, JSON.stringify({ id, vp, url, ...data, images }));
        const nodes = (function count(n) { return 1 + (n.c || []).reduce((s, k) => s + count(k), 0); })(data.tree);
        summary.push(`${id}.${vp}: ${data.width}x${data.height}, ${nodes} nodes, ${Object.keys(images).length} images, ${(fs.statSync(file).size / 1048576).toFixed(1)} MB`);
        console.log(summary[summary.length - 1]);
      } catch (e) { console.log(`FAILED ${id}.${vp}: ${e.message}`); }
      await page.close();
    }
  }
  await browser.close();
})();
