// QA helper: re-render an extracted JSON as absolute-positioned HTML and screenshot it next to the original page.
const puppeteer = require("puppeteer-core"), fs = require("fs"), path = require("path");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const [id = "index", vp = "desktop"] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(path.join(__dirname, "out", `${id}.${vp}.json`)));
const rgba = (c) => `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`;
function fillCss(f, w, h) {
  if (f.t === "s") return rgba(f.c);
  if (f.t === "i") { const u = d.images[f.src]; return u ? `url(${u}) center/${f.mode === "FIT" ? "contain" : f.mode === "TILE" ? "auto" : "cover"} ${f.mode === "TILE" ? "repeat" : "no-repeat"}` : "#f0f"; }
  if (f.t === "gl") return `linear-gradient(${f.angle}deg,${f.stops.map((s) => rgba(s.c) + " " + s.p * 100 + "%").join(",")})`;
  if (f.t === "gr") return `radial-gradient(${f.stops.map((s) => rgba(s.c) + " " + s.p * 100 + "%").join(",")})`;
}
function html(n) {
  const pos = `position:absolute;left:${n.x}px;top:${n.y}px;width:${n.w}px;height:${n.h}px;`;
  if (n.k === "t") return `<div style="position:absolute;left:${n.x}px;top:${n.y - (n.lh - (n.ch || n.lh)) / 2}px;width:${n.w + (n.one ? 0 : 2)}px;${n.one ? "white-space:nowrap;" : ""}font:${n.fi ? "italic " : ""}${n.fw} ${n.fs}px/${n.lh}px '${n.ff}';letter-spacing:${n.ls}px;color:${rgba(n.col)};text-align:${n.ta};${n.ul ? "text-decoration:underline;" : ""}">${n.s.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</div>`;
  if (n.k === "v") return `<div style="${pos}">${n.svg}</div>`;
  const bgs = n.fills.slice().reverse().map((f) => fillCss(f, n.w, n.h));
  const solid = bgs.filter((b) => b && !b.startsWith("url") && !b.includes("gradient"));
  const layers = bgs.filter((b) => b && (b.startsWith("url") || b.includes("gradient")));
  const bwc = n.bw.some((x) => x) ? `border-style:solid;border-width:${n.bw.join("px ")}px;border-color:${n.bc.map(rgba).join(" ")};box-sizing:border-box;` : "";
  const sh = n.sh.length ? `box-shadow:${n.sh.map((s) => `${s.x}px ${s.y}px ${s.b}px ${s.s}px ${rgba(s.c)}`).join(",")};` : "";
  const bg = layers.length || solid.length ? `background:${[...layers, solid[solid.length - 1] || "transparent"].join(",")};` : "";
  return `<div style="${pos}${bg}${bwc}${sh}border-radius:${n.r.join("px ")}px;opacity:${n.o};${n.clip ? "overflow:hidden;" : ""}">${(n.c || []).map(html).join("")}</div>`;
}
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
  const W = d.width, H = d.height;
  const p = await b.newPage(); await p.setViewport({ width: W, height: 900 });
  await p.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet"></head><body style="margin:0;position:relative;width:${W}px;height:${H}px">${html(d.tree)}</body></html>`, { waitUntil: "networkidle0" });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(__dirname, "out", `${id}.${vp}.rebuilt.png`), fullPage: true });
  const o = await b.newPage(); await o.setViewport({ width: W, height: 900 });
  await o.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await o.goto(d.url, { waitUntil: "networkidle0" }); await o.addStyleTag({ content: "*{animation:none!important;transition:none!important}" });
  await o.screenshot({ path: path.join(__dirname, "out", `${id}.${vp}.original.png`), fullPage: true });
  await b.close();
})();
