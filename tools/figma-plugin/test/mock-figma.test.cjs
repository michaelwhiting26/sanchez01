// Runs plugin/code.js against a strict stand-in for the Figma API, using real extracted page JSON.
// It catches crashes and the common API mistakes (unloaded fonts, zero-size resize, bad property use).
// It does NOT prove the result looks right in Figma; that needs the real app.
const fs = require("fs"), path = require("path"), vm = require("vm");
const file = process.argv[2] || path.join(__dirname, "../extract/out/index.desktop.json");
const page = JSON.parse(fs.readFileSync(file));
const code = fs.readFileSync(path.join(__dirname, "../plugin/code.js"), "utf8");

const loaded = new Set(); const errors = []; const counts = {};
const KNOWN = { Barlow: ["Regular", "Medium", "SemiBold", "Bold", "Italic"], "Barlow Condensed": ["Medium", "SemiBold", "Bold", "ExtraBold", "Regular"], Inter: ["Regular", "Medium", "Bold"] };
const bad = (m) => { errors.push(m); throw new Error(m); };
function mkNode(type) {
  const n = { type, children: [], width: 100, height: 100, x: 0, y: 0, _fontSet: false };
  counts[type] = (counts[type] || 0) + 1;
  n.appendChild = (c) => { if (c.parent) c.parent.children.splice(c.parent.children.indexOf(c), 1); c.parent = n; n.children.push(c); };
  n.resize = (w, h) => { if (!(w >= 0.01) || !(h >= 0.01)) bad("resize below 0.01: " + w + "x" + h + " on " + type); n.width = w; n.height = h; };
  const guarded = new Proxy(n, {
    set(t, k, v) {
      if (k === "characters" && !t._fontSet) bad("characters set before fontName");
      if (k === "fontName") { if (!loaded.has(v.family + "|" + v.style)) bad("font not loaded: " + JSON.stringify(v)); t._fontSet = true; }
      if (k === "fontSize" && !(v > 0)) bad("bad fontSize " + v);
      if (k === "opacity" && !(v >= 0 && v <= 1)) bad("opacity out of range " + v);
      if (/Radius$/.test(k) && !(v >= 0)) bad("negative radius");
      if (k === "strokeTopWeight" && type !== "FRAME") bad("stroke weights only on frames");
      if (k === "fills" && !Array.isArray(v)) bad("fills must be an array");
      if (k === "textAutoResize" && type !== "TEXT") bad("textAutoResize on non-text");
      t[k] = v; return true;
    }
  });
  return guarded;
}
let posted = [];
const figma = {
  showUI() {}, ui: { postMessage: (m) => posted.push(m), onmessage: null }, closePlugin() {},
  currentPage: { children: [], selection: [], appendChild(n) { n.parent = this; this.children.push(n); } },
  viewport: { scrollAndZoomIntoView() {} },
  createFrame: () => mkNode("FRAME"), createText: () => mkNode("TEXT"), createRectangle: () => mkNode("RECTANGLE"),
  createPaintStyle: () => mkNode("STYLE"), getLocalPaintStylesAsync: async () => [],
  createImage: (bytes) => { if (!(bytes instanceof Uint8Array) || bytes.length < 8) bad("createImage needs bytes"); return { hash: "h" + bytes.length }; },
  base64Decode: (s) => new Uint8Array(Buffer.from(s, "base64")),
  createNodeFromSvg: (svg) => { if (!/^<svg[\s>]/.test(svg.trim())) bad("bad svg"); return mkNode("FRAME"); },
  loadFontAsync: async (f) => { if (!(KNOWN[f.family] || []).includes(f.style)) throw new Error("no such font " + f.family + " " + f.style); loaded.add(f.family + "|" + f.style); },
};
const ctx = { figma, __html__: "", setTimeout, console, Promise, Uint8Array, Map, Set, Math, JSON, Object, Array, Error, String, Number, isFinite, parseInt, parseFloat, RegExp };
vm.createContext(ctx);
vm.runInContext(code, ctx, { filename: "code.js" });
(async () => {
  await figma.ui.onmessage({ type: "build", pages: [page], tokens: true });
  const done = posted.find((m) => m.type === "done"), err = posted.find((m) => m.type === "error");
  const top = figma.currentPage.children;
  const nodeCount = (function c(n) { return 1 + n.children.reduce((s, k) => s + c(k), 0); });
  console.log("file:", path.basename(file));
  console.log("result:", err ? "ERROR " + err.text : done ? "done" : "no result");
  if (done) console.log("stats:", JSON.stringify(done.stats), "| tokenStyles:", done.tokenStyles, "| frames on canvas:", top.length);
  console.log("node types:", JSON.stringify(counts));
  if (done && done.warnings.length) console.log("warnings:\n  - " + done.warnings.join("\n  - "));
  console.log("mock API violations:", errors.length ? errors.slice(0, 8) : "none");
  process.exit(err || errors.length ? 1 : 0);
})();
