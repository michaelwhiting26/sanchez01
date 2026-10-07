// Times the store's first load on a slowed-down phone and saves a frame every half second, to see what the visitor sees and when.
//   node tools/store/trace-load.mjs <outDir> <baseUrl> [cpuSlowdown=4] [4g|3g|none]
// It taps the door as soon as it can be tapped. Written for the black-screen fault of 7 Oct 2026 (docs/STORE-3D.md).
/* global process, console, document */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [out, base, cpu = "4", net = "4g"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.enable");
await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
const NET = { "4g": { downloadThroughput: (9e6 / 8), uploadThroughput: (2e6 / 8), latency: 80 }, "3g": { downloadThroughput: (1.6e6 / 8), uploadThroughput: (750e3 / 8), latency: 150 }, none: null }[net];
if (NET) await cdp.send("Network.emulateNetworkConditions", { offline: false, ...NET });
await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(cpu) });
const t0 = Date.now();
const T = () => ((Date.now() - t0) / 1000).toFixed(1);
const log = [];
page.on("console", (m) => (m.type() === "error" || /context|lost/i.test(m.text())) && log.push(`${T()} console ${m.type()}: ${m.text().slice(0, 160)}`));
page.on("pageerror", (e) => log.push(`${T()} pageerror ${String(e).slice(0, 160)}`));
const sizes = [];
page.on("response", async (r) => { const u = r.url(); if (/\.(glb|webp|js)(\?|$)/.test(u) && !/_next\/image/.test(u)) { const b = await r.body().catch(() => null); sizes.push([T(), u.split("/").slice(-1)[0].slice(0, 44), b ? b.length : -1, r.headers()["content-encoding"] ?? "-"]); } });
page.goto(base, { waitUntil: "commit" }).catch(() => undefined);
let lastStage = "", tapped = false, n = 0;
while (Date.now() - t0 < 60000) {
  const stage = await page.evaluate(() => document.querySelector(".store")?.getAttribute("data-stage") ?? "(no store)").catch(() => "(nav)");
  const cap = await page.evaluate(() => document.querySelector(".store-ui__caption, [class*=caption]")?.textContent?.trim().slice(0, 30) ?? "").catch(() => "");
  if (stage !== lastStage) { log.push(`${T()} stage ${lastStage} -> ${stage}`); lastStage = stage; }
  if (cap) log.push(`${T()}   caption: ${cap}`);
  if (n % 2 === 0) await page.screenshot({ path: `${out}/t${String(n).padStart(3, "0")}-${T()}s.jpg`, type: "jpeg", quality: 50 }).catch(() => undefined);
  if (stage === "arrive" && !tapped) { tapped = true; log.push(`${T()} TAP enter`); await page.click(".store-ui__door").catch((e) => log.push("tap failed " + e)); }
  if (stage === "browsing") break;
  n++;
  await page.waitForTimeout(450);
}
console.log(log.join("\n"));
console.log("FILES"); for (const s of sizes) console.log(s.join("  "));
await browser.close();
