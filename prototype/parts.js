/* Build-by-parts page controller. Independent of app.js's configurator: own state, own storage key (sz.parts.v1). */
import { createPartsViewer, PART_DEFS, FINISHES } from "./assets/bag3d/parts-viewer.js";

const KEY = "sz.parts.v1";
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

const COLOURS = [
  ["Royal blue", "#0b6fe8"], ["Fight red", "#ef2a12"], ["Gold", "#e2b10a"], ["Black", "#0d0f12"], ["White", "#f7f7f2"], ["Cream", "#f3eadc"],
  ["Racing green", "#1f5c3a"], ["Navy", "#16223f"], ["Orange", "#f07a1a"], ["Maroon", "#7a1f16"], ["Pink", "#e8478b"], ["Cyan", "#12c4e6"], ["Purple", "#6b3fa0"], ["Grey", "#8a8f98"]
];
const HARDWARE = [["Black", "#2a2a2a"], ["Silver", "#c4c8cc"], ["Brass", "#c9a45c"], ["Red", "#a83e26"]];

/* the walk-through order: sides first, then the top, straps, bottom, details */
const STEPS = [
  { id: "bodyL", group: "Body", title: "Left side panel", hint: "The large left-hand panel of the bag.", mirror: "bodyR" },
  { id: "bodyR", group: "Body", title: "Right side panel", hint: "The large right-hand panel. Match it to the left or make it different for a two-tone bag.", mirror: "bodyL" },
  { id: "domeL", group: "Top", title: "Top dome, left", hint: "The rounded cap above the top waistband, left half.", mirror: "domeR" },
  { id: "domeR", group: "Top", title: "Top dome, right", hint: "The rounded cap, right half.", mirror: "domeL" },
  { id: "bandTop", group: "Top", title: "Top waistband", hint: "The band where the straps attach. Carries the SANCHEZ lettering." },
  { id: "strap1", group: "Straps", title: "Strap 1", hint: "The four straps that lift the bag to the chain. Each is coloured on its own.", straps: true },
  { id: "strap2", group: "Straps", title: "Strap 2", hint: "Second strap.", straps: true },
  { id: "strap3", group: "Straps", title: "Strap 3", hint: "Third strap.", straps: true },
  { id: "strap4", group: "Straps", title: "Strap 4", hint: "Fourth strap.", straps: true },
  { id: "bandBottom", group: "Bottom", title: "Bottom waistband", hint: "The band around the base." },
  { id: "patch", group: "Details", title: "Badge patch", hint: "The patch on the top band, where the Sanchez badge sits." },
  { id: "stitch", group: "Details", title: "Stitching", hint: "Thread colour on every seam.", noFinish: true },
  { id: "hardware", group: "Details", title: "Chain and hardware", hint: "The chain links, hook, swivel and disc.", hardware: true }
];
const LABEL = Object.fromEntries(PART_DEFS.map((d) => [d.id, d.label]));

/* colourways set every part at once */
const P = (body, dome, band, strap, patch, stitch, hw) => ({ bodyL: body[0], bodyR: body[1] || body[0], domeL: dome, domeR: dome, bandTop: band, bandBottom: band, strap1: strap, strap2: strap, strap3: strap, strap4: strap, patch, stitch, hardware: hw });
const PRESETS = [
  { name: "Royal Blue", chip: ["#0b6fe8"], c: P(["#0b6fe8"], "#0b6fe8", "#f7f7f2", "#f7f7f2", "#f7f7f2", "#f7f7f2", "#2a2a2a") },
  { name: "Fight Red", chip: ["#ef2a12"], c: P(["#ef2a12"], "#ef2a12", "#f7f7f2", "#f7f7f2", "#f7f7f2", "#f7f7f2", "#2a2a2a") },
  { name: "Gold & Black", chip: ["#e2b10a", "#0d0f12"], c: P(["#e2b10a", "#0d0f12"], "#0d0f12", "#f7f7f2", "#f7f7f2", "#f7f7f2", "#e2b10a", "#c9a45c") },
  { name: "Green & Red", chip: ["#1f5c3a", "#dc3a22"], c: P(["#1f5c3a", "#dc3a22"], "#f7f7f2", "#7a1f16", "#f7f7f2", "#f7f7f2", "#f7f7f2", "#c4c8cc") },
  { name: "Midnight", chip: ["#16223f", "#c9a45c"], c: P(["#16223f"], "#16223f", "#c9a45c", "#c9a45c", "#f3eadc", "#c9a45c", "#c9a45c") }
];

const defaults = () => {
  const s = { ft: "4", step: 0, explode: false, parts: {} };
  const base = PRESETS[0].c;
  PART_DEFS.forEach((d) => (s.parts[d.id] = { color: base[d.id], finish: d.id === "stitch" ? "matte" : d.id === "hardware" ? "gloss" : "gloss" }));
  return s;
};
let S = (() => {
  try {
    const h = location.hash.match(/^#d=(.+)$/); if (h) { const j = JSON.parse(atob(decodeURIComponent(h[1]))); if (j && j.parts) return Object.assign(defaults(), j); }
    const raw = JSON.parse(localStorage.getItem(KEY)); if (raw && raw.parts) return Object.assign(defaults(), raw, { parts: Object.assign(defaults().parts, raw.parts) });
  } catch (e) {}
  return defaults();
})();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

/* ---------- 3D ---------- */
let viewer = null, ready = false;
const webgl = (() => { try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; } })();

function pushAll() { if (!viewer) return; PART_DEFS.forEach((d) => viewer.style(d.id, S.parts[d.id])); }

/* ---------- UI ---------- */
const stepIndex = (id) => STEPS.findIndex((s) => s.id === id);
function renderNav() {
  const groups = []; STEPS.forEach((s, i) => { let g = groups.find((x) => x.name === s.group); if (!g) groups.push((g = { name: s.group, items: [] })); g.items.push([s, i]); });
  $("[data-pb-nav]").innerHTML = groups.map((g) => '<div class="pb__group"><span class="pb__gname">' + g.name + "</span>" + g.items.map(([s, i]) =>
    '<button type="button" class="pb__chip" data-step="' + i + '" aria-current="' + (i === S.step) + '"><i style="background:' + S.parts[s.id].color + '"></i>' + s.title.replace("Top dome, ", "Dome ").replace(" panel", "") + "</button>").join("") + "</div>").join("");
}
function renderCard() {
  const st = STEPS[S.step], cur = S.parts[st.id], list = st.hardware ? HARDWARE : COLOURS;
  const sw = list.map(([n, h]) => '<button type="button" class="pb__sw" data-color="' + h + '" title="' + n + '" aria-label="' + n + '" aria-pressed="' + (cur.color.toLowerCase() === h) + '" style="--c:' + h + '"></button>').join("");
  const fin = st.noFinish ? "" : '<div class="pb__label">Finish</div><div class="pb__seg" role="group" aria-label="Finish">' + Object.entries(FINISHES).map(([k, f]) =>
    '<button type="button" data-finish="' + k + '" aria-pressed="' + (cur.finish === k) + '">' + f.name + "</button>").join("") + "</div>";
  const acts = [];
  if (st.mirror) acts.push('<button type="button" class="pb__ghost" data-act="mirror">Match ' + LABEL[st.mirror].toLowerCase() + "</button>");
  if (st.straps) acts.push('<button type="button" class="pb__ghost" data-act="straps">Use for all four straps</button>');
  if (["bodyL", "bodyR", "domeL", "domeR"].includes(st.id)) acts.push('<button type="button" class="pb__ghost" data-act="body">Use for both sides and both domes</button>');
  $("[data-pb-card]").innerHTML = '<p class="pb__step">Step ' + (S.step + 1) + " of " + STEPS.length + " · " + st.group + '</p><h2 class="pb__title">' + st.title + '</h2><p class="pb__desc">' + st.hint + "</p>" +
    '<div class="pb__label">Colour</div><div class="pb__swatches">' + sw + '<label class="pb__custom" title="Any colour"><input type="color" value="' + cur.color + '" data-custom aria-label="Custom colour"><span>Custom</span></label></div>' +
    fin + (acts.length ? '<div class="pb__acts">' + acts.join("") + "</div>" : "");
}
function renderSummary() {
  const dots = PART_DEFS.map((d) => '<i title="' + d.label + '" style="background:' + S.parts[d.id].color + '"></i>').join("");
  $("[data-pb-summary]").innerHTML = '<span class="pb__dots">' + dots + '</span><span class="pb__sumtxt">' + STEPS[S.step].title + "</span>";
  $("[data-pb-count]").textContent = "Part " + (S.step + 1) + " of " + STEPS.length;
  $("[data-pb-bar]").style.inlineSize = ((S.step + 1) / STEPS.length) * 100 + "%";
  $("[data-pb-next]").textContent = S.step === STEPS.length - 1 ? "Done ✓" : "Next part →";
}
function renderPresets() {
  $("[data-pb-presets]").innerHTML = PRESETS.map((p, i) => '<button type="button" class="pb__preset" data-preset="' + i + '" title="' + p.name + '"><span class="pb__pchip">' + p.chip.map((c) => '<i style="background:' + c + '"></i>').join("") + "</span><span>" + p.name + "</span></button>").join("");
}
function renderAll() { renderNav(); renderCard(); renderSummary(); $$("[data-pb-length] button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.ft === S.ft)); }

function status(t) { const e = $("[data-pb-status]"); e.textContent = t; clearTimeout(status.t); status.t = setTimeout(() => (e.textContent = ""), 2400); }
function go(i, opts) {
  S.step = Math.max(0, Math.min(STEPS.length - 1, i)); save(); renderAll();
  if (viewer) { viewer.select(STEPS[S.step].id); if (!opts || opts.focus !== false) viewer.focus(STEPS[S.step].id); }
}
function setPart(id, patch) { Object.assign(S.parts[id], patch); if (viewer) viewer.style(id, S.parts[id]); }

document.addEventListener("click", (e) => {
  const t = e.target.closest("button, [data-custom]"); if (!t) return;
  const st = STEPS[S.step];
  if (t.dataset.step !== undefined) return go(+t.dataset.step);
  if (t.dataset.color) { setPart(st.id, { color: t.dataset.color }); save(); renderCard(); renderNav(); renderSummary(); return; }
  if (t.dataset.finish) { setPart(st.id, { finish: t.dataset.finish }); save(); renderCard(); return; }
  if (t.dataset.preset !== undefined) { const p = PRESETS[+t.dataset.preset]; PART_DEFS.forEach((d) => setPart(d.id, { color: p.c[d.id] })); save(); renderAll(); status(p.name + " applied to every part"); return; }
  if (t.dataset.ft) { S.ft = t.dataset.ft; save(); renderAll(); if (viewer) viewer.load(S.ft).then(pushAll); return; }
  if (t.dataset.act) {
    const c = S.parts[st.id];
    if (t.dataset.act === "mirror") setPart(st.mirror, { color: c.color, finish: c.finish });
    if (t.dataset.act === "straps") ["strap1", "strap2", "strap3", "strap4"].forEach((id) => setPart(id, { color: c.color, finish: c.finish }));
    if (t.dataset.act === "body") ["bodyL", "bodyR", "domeL", "domeR"].forEach((id) => setPart(id, { color: c.color, finish: c.finish }));
    save(); renderAll(); return;
  }
  if (t.hasAttribute("data-pb-next")) return S.step === STEPS.length - 1 ? status("Saved on this device. Use Copy spec to share it.") : go(S.step + 1);
  if (t.hasAttribute("data-pb-prev")) return go(S.step - 1);
  if (t.hasAttribute("data-pb-explode")) { S.explode = !S.explode; t.setAttribute("aria-pressed", S.explode); t.textContent = S.explode ? "Put back together" : "Pull apart"; if (viewer) viewer.setExplode(S.explode); save(); return; }
  if (t.hasAttribute("data-pb-recentre")) { if (viewer) viewer.reset(); return; }
  if (t.hasAttribute("data-pb-reset")) { S = defaults(); save(); pushAll(); renderAll(); if (viewer) { viewer.setExplode(false); viewer.load(S.ft).then(() => { pushAll(); viewer.select(STEPS[0].id); }); } $("[data-pb-explode]").setAttribute("aria-pressed", "false"); $("[data-pb-explode]").textContent = "Pull apart"; status("Reset"); return; }
  if (t.hasAttribute("data-pb-copy")) {
    const spec = { schema: "sanchez-bag-parts/1", length: S.ft + "ft", parts: Object.fromEntries(PART_DEFS.map((d) => [d.id, { label: d.label, color: S.parts[d.id].color, finish: S.parts[d.id].finish }])) };
    const link = location.origin + location.pathname + "#d=" + encodeURIComponent(btoa(JSON.stringify({ ft: S.ft, parts: S.parts })));
    const txt = JSON.stringify(spec, null, 2) + "\n\nLink: " + link;
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => status("Spec and link copied"), () => status("Couldn't copy here: select and copy from the address bar"));
  }
});
document.addEventListener("input", (e) => { const t = e.target; if (t && t.matches && t.matches("[data-custom]")) { setPart(STEPS[S.step].id, { color: t.value }); save(); renderNav(); renderSummary(); $$(".pb__sw").forEach((b) => b.setAttribute("aria-pressed", "false")); } });
document.addEventListener("keydown", (e) => { if (/input|textarea|select/i.test(e.target.tagName)) return; if (e.key === "ArrowRight") go(S.step + 1); if (e.key === "ArrowLeft") go(S.step - 1); });

renderPresets(); renderAll();
const host = $("[data-pb-view]");
if (!webgl) { $("[data-pb-fallback]").hidden = false; host.hidden = true; }
else {
  viewer = createPartsViewer(host, { onPick: (id) => { const i = stepIndex(id); if (i >= 0) go(i); } });
  viewer.load(S.ft).then(() => { pushAll(); viewer.select(STEPS[S.step].id); ready = true; host.setAttribute("data-ready", "1"); if (S.explode) { $("[data-pb-explode]").setAttribute("aria-pressed", "true"); $("[data-pb-explode]").textContent = "Put back together"; viewer.setExplode(true); } })
    .catch((err) => { console.error(err); $("[data-pb-fallback]").hidden = false; });
}
window.__parts = { get state() { return S; }, go, STEPS };
