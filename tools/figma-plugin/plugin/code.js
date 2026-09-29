// Sanchez prototype → Figma. Runs in Figma's plugin sandbox.
// Receives page JSON (made by extract/extract.js) from ui.html and rebuilds it as editable layers.

figma.showUI(__html__, { width: 440, height: 600, themeColors: true });

const WEIGHT_STYLE = { 100: "Thin", 200: "ExtraLight", 300: "Light", 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold", 800: "ExtraBold", 900: "Black" };
const fontCache = new Map();      // "family|style" -> resolved FontName or null
const imageCache = new Map();     // data-url hash -> Image
const warnings = [];
let stats = { frames: 0, texts: 0, icons: 0, images: 0 };

const log = (t) => figma.ui.postMessage({ type: "log", text: t });
const warn = (t) => { if (warnings.length < 40) warnings.push(t); };
const rgb = (c) => ({ r: c[0] / 255, g: c[1] / 255, b: c[2] / 255 });
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ---------------- fonts ---------------- */
function styleCandidates(weight, italic) {
  const w = WEIGHT_STYLE[weight] || (weight >= 700 ? "Bold" : weight >= 500 ? "Medium" : "Regular");
  const list = [];
  const add = (s) => { if (list.indexOf(s) < 0) list.push(s); };
  if (italic) { add(w === "Regular" ? "Italic" : w + " Italic"); add(w + " Italic"); }
  add(w);
  if (w === "SemiBold") { add("Semi Bold"); add("Bold"); }
  if (w === "ExtraBold") { add("Extra Bold"); add("Bold"); }
  add("Regular");
  return list;
}
async function resolveFont(family, weight, italic) {
  const key = family + "|" + weight + "|" + italic;
  if (fontCache.has(key)) return fontCache.get(key);
  let found = null;
  const mono = /mono|menlo|consolas|courier/i.test(family);
  for (const fam of mono ? [family, "Roboto Mono", "Inter"] : [family, "Inter"]) {
    for (const style of styleCandidates(weight, italic)) {
      try { await figma.loadFontAsync({ family: fam, style }); found = { family: fam, style }; break; } catch (e) { /* try next */ }
    }
    if (found) break;
    if (fam === family) warn("Font not available in Figma, substituting: " + family);
  }
  fontCache.set(key, found);
  return found;
}
function collectFonts(node, set) {
  if (node.k === "t") set.set(node.ff + "|" + node.fw + "|" + node.fi, [node.ff, node.fw, node.fi]);
  (node.c || []).forEach((c) => collectFonts(c, set));
}

/* ---------------- paints ---------------- */
function gradientTransform(angleDeg, w, h) {
  // CSS angle: 0deg = up, clockwise. Build node-normalised → gradient-space matrix.
  const th = angleDeg * Math.PI / 180;
  const dx = Math.sin(th), dy = -Math.cos(th);
  const L = Math.abs(w * dx) + Math.abs(h * dy);
  const s = { x: 0.5 - (dx * L) / (2 * w), y: 0.5 - (dy * L) / (2 * h) };
  const U = { x: dx * L, y: dy * L };           // pixel-space vector start → end
  const V = { x: -U.y, y: U.x };                // perpendicular, same length
  const m = [[U.x / w, V.x / w, s.x - 0.5 * V.x / w], [U.y / h, V.y / h, s.y - 0.5 * V.y / h]];
  const det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
  if (Math.abs(det) < 1e-9) return [[1, 0, 0], [0, 1, 0]];
  const a = m[1][1] / det, b = -m[0][1] / det, c = -m[1][0] / det, d = m[0][0] / det;
  return [[a, b, -(a * m[0][2] + b * m[1][2])], [c, d, -(c * m[0][2] + d * m[1][2])]];
}
function imageFor(dataUrl) {
  if (!dataUrl) return null;
  const key = dataUrl.length + ":" + dataUrl.slice(-64);
  if (imageCache.has(key)) return imageCache.get(key);
  const b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const img = figma.createImage(figma.base64Decode(b64));
  imageCache.set(key, img); stats.images++;
  return img;
}
function paintFor(f, w, h, images) {
  if (f.t === "s") return { type: "SOLID", color: rgb(f.c), opacity: f.c[3] };
  if (f.t === "gl") return { type: "GRADIENT_LINEAR", gradientTransform: gradientTransform(f.angle, Math.max(w, 1), Math.max(h, 1)), gradientStops: f.stops.map((s) => ({ position: s.p, color: { ...rgb(s.c), a: s.c[3] } })) };
  if (f.t === "gr") return { type: "GRADIENT_RADIAL", gradientTransform: [[1, 0, 0], [0, 1, 0]], gradientStops: f.stops.map((s) => ({ position: s.p, color: { ...rgb(s.c), a: s.c[3] } })) };
  if (f.t === "i") {
    const img = imageFor(images[f.src]);
    if (!img) { warn("Image missing: " + f.src.split("/").pop()); return { type: "SOLID", color: { r: 0.2, g: 0.16, b: 0.13 } }; }
    return { type: "IMAGE", imageHash: img.hash, scaleMode: f.mode === "FIT" ? "FIT" : f.mode === "TILE" ? "TILE" : "FILL" };
  }
  return null;
}

/* ---------------- node builders ---------------- */
function place(node, n, parent) {
  parent.appendChild(node);
  node.x = n.x; node.y = n.y;
}
function buildFrame(n, parent, images) {
  const f = figma.createFrame();
  f.name = n.name || n.n;
  f.resize(Math.max(n.w, 0.01), Math.max(n.h, 0.01));
  f.fills = (n.fills || []).map((p) => paintFor(p, n.w, n.h, images)).filter(Boolean);
  f.clipsContent = !!n.clip;
  f.opacity = clamp(n.o === undefined ? 1 : n.o, 0, 1);
  place(f, n, parent);
  const maxR = Math.min(n.w, n.h) / 2;
  const r = n.r || [0, 0, 0, 0];
  f.topLeftRadius = clamp(r[0], 0, maxR); f.topRightRadius = clamp(r[1], 0, maxR);
  f.bottomRightRadius = clamp(r[2], 0, maxR); f.bottomLeftRadius = clamp(r[3], 0, maxR);
  const bw = n.bw || [0, 0, 0, 0];
  if (bw.some((v) => v > 0)) {
    const i = bw.findIndex((v, k) => v > 0 && n.bc[k] && n.bc[k][3] > 0);
    if (i >= 0) {
      f.strokes = [{ type: "SOLID", color: rgb(n.bc[i]), opacity: n.bc[i][3] }];
      f.strokeAlign = "INSIDE";
      f.strokeTopWeight = bw[0]; f.strokeRightWeight = bw[1]; f.strokeBottomWeight = bw[2]; f.strokeLeftWeight = bw[3];
    }
  }
  const fx = [];
  (n.sh || []).forEach((s) => fx.push({ type: "DROP_SHADOW", color: { ...rgb(s.c), a: s.c[3] }, offset: { x: s.x, y: s.y }, radius: Math.max(0, s.b), spread: s.s || 0, visible: true, blendMode: "NORMAL" }));
  if (n.bb) fx.push({ type: "BACKGROUND_BLUR", radius: n.bb, visible: true });
  if (fx.length) f.effects = fx;
  stats.frames++;
  return f;
}
function buildText(n, parent) {
  const font = fontCache.get(n.ff + "|" + n.fw + "|" + n.fi) || { family: "Inter", style: "Regular" };
  const t = figma.createText();
  t.fontName = font;
  t.characters = n.s;
  t.fontSize = Math.max(1, n.fs);
  t.lineHeight = { value: Math.max(1, n.lh), unit: "PIXELS" };
  t.letterSpacing = { value: n.ls || 0, unit: "PIXELS" };
  t.textAlignHorizontal = { left: "LEFT", start: "LEFT", right: "RIGHT", end: "RIGHT", center: "CENTER", justify: "JUSTIFIED" }[n.ta] || "LEFT";
  if (n.ul) t.textDecoration = "UNDERLINE";
  t.fills = [{ type: "SOLID", color: rgb(n.col), opacity: n.col[3] }];
  t.name = n.n;
  parent.appendChild(t);
  const yLine = n.y - (n.lh - (n.ch || n.lh)) / 2;   // HTML range box → Figma line box
  if (n.one) {
    t.textAutoResize = "WIDTH_AND_HEIGHT";
    t.x = n.x; t.y = yLine;
  } else {
    t.textAutoResize = "HEIGHT";
    t.resize(n.w + 2, n.h);
    t.x = n.x - 1; t.y = yLine;
  }
  stats.texts++;
  return t;
}
function buildSvg(n, parent) {
  let node;
  try { node = figma.createNodeFromSvg(n.svg); } catch (e) { warn("Icon skipped: " + n.n); return null; }
  node.name = n.n;
  parent.appendChild(node);
  if (n.w > 0 && n.h > 0) node.resize(n.w, n.h);
  node.x = n.x; node.y = n.y;
  if (n.o !== undefined && n.o < 1) node.opacity = n.o;
  stats.icons++;
  return node;
}
function build(n, parent, images) {
  try {
    if (n.k === "f") {
      const f = buildFrame(n, parent, images);
      (n.c || []).forEach((c) => build(c, f, images));
    } else if (n.k === "t") buildText(n, parent);
    else if (n.k === "v") buildSvg(n, parent);
  } catch (e) { warn("Skipped '" + (n.n || n.k) + "': " + e.message); }
}

/* ---------------- tokens: paint styles + swatch board ---------------- */
function parseCssColor(v) {
  let m = /^#([0-9a-f]{3,8})$/i.exec(v);
  if (m) {
    let h = m[1]; if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
  }
  m = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/.exec(v);
  if (m) return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
  return null;
}
async function buildTokens(tokens, x, y) {
  const colours = Object.entries(tokens).map(([k, v]) => [k.replace(/^--/, ""), parseCssColor(v), v]).filter((e) => e[1] && /^(c-|color-)/.test(e[0]));
  if (!colours.length) return 0;
  const existing = new Set((await figma.getLocalPaintStylesAsync()).map((s) => s.name));
  let made = 0;
  for (const [name, c] of colours) {
    const sn = "Sanchez/" + name.replace(/^c-/, "palette/").replace(/^color-/, "semantic/");
    if (existing.has(sn)) continue;
    const st = figma.createPaintStyle(); st.name = sn; st.paints = [{ type: "SOLID", color: rgb(c), opacity: c[3] }]; made++;
  }
  // swatch board
  const font = await resolveFont("Inter", 500, false);
  const board = figma.createFrame(); board.name = "Sanchez · colour tokens";
  const cols = 6, cw = 200, ch = 120, gap = 16, pad = 32;
  const rows = Math.ceil(colours.length / cols);
  board.resize(pad * 2 + cols * cw + (cols - 1) * gap, pad * 2 + rows * ch + (rows - 1) * gap);
  board.fills = [{ type: "SOLID", color: { r: 0.055, g: 0.043, b: 0.035 } }];
  board.x = x; board.y = y;
  colours.forEach(([name, c, raw], i) => {
    const cx = pad + (i % cols) * (cw + gap), cy = pad + Math.floor(i / cols) * (ch + gap);
    const sw = figma.createRectangle(); sw.resize(cw, 72); sw.x = cx; sw.y = cy; sw.cornerRadius = 8;
    sw.fills = [{ type: "SOLID", color: rgb(c), opacity: c[3] }];
    sw.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.12 }]; sw.strokeWeight = 1;
    board.appendChild(sw);
    const tx = figma.createText(); tx.fontName = font || { family: "Inter", style: "Medium" };
    tx.characters = name + "\n" + raw; tx.fontSize = 11; tx.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.92, b: 0.86 } }];
    tx.x = cx; tx.y = cy + 80; board.appendChild(tx);
  });
  return made;
}

/* ---------------- main ---------------- */
figma.ui.onmessage = async (msg) => {
  if (msg.type === "close") { figma.closePlugin(); return; }
  if (msg.type !== "build") return;
  warnings.length = 0; stats = { frames: 0, texts: 0, icons: 0, images: 0 };
  try {
    const pages = msg.pages;
    // start to the right of anything already on the canvas
    let cursorX = 0;
    figma.currentPage.children.forEach((c) => { cursorX = Math.max(cursorX, c.x + c.width + 240); });
    const created = [];
    let tokenStyles = 0;
    if (msg.tokens) {
      const tk = pages.find((p) => p.tokens && Object.keys(p.tokens).length);
      if (tk) { tokenStyles = await buildTokens(tk.tokens, cursorX, 0); cursorX += 1400 + 240; }
    }
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      figma.ui.postMessage({ type: "progress", i, n: pages.length, label: p.id + " · " + p.vp });
      const fonts = new Map(); collectFonts(p.tree, fonts);
      for (const [, [fam, w, it]] of fonts) await resolveFont(fam, w, it);
      const root = figma.createFrame();
      root.name = p.id + " · " + p.vp; root.x = cursorX; root.y = 0;
      root.resize(p.width, p.height);
      root.fills = (p.tree.fills || []).map((f) => paintFor(f, p.width, p.height, p.images)).filter(Boolean);
      root.clipsContent = true;
      figma.currentPage.appendChild(root);
      (p.tree.c || []).forEach((c) => build(c, root, p.images));
      created.push(root);
      cursorX += p.width + 240;
      await new Promise((r) => setTimeout(r, 0)); // let the UI repaint
    }
    figma.currentPage.selection = created;
    figma.viewport.scrollAndZoomIntoView(created);
    figma.ui.postMessage({ type: "done", stats, warnings, tokenStyles, pages: created.length });
  } catch (e) {
    figma.ui.postMessage({ type: "error", text: String(e && e.message || e) });
  }
};
