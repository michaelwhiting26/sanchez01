// Phone-size captures of the 3D store for art-direction sign-off (not part of the site or its tests).
//   node tools/store/capture.mjs [outDir] [baseUrl]
// Takes every part of the journey (arrive, walk in, greeting, each product, product chosen) at 390x844 and 430x932. Needs the dev server running.
/* global process, console */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "tools/store/shots";
const base = process.argv[3] ?? "http://localhost:3000";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
for (const [w, h] of [[390, 844], [430, 932]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForSelector('.store[data-stage="arrive"]', { timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/A-arrive-${w}x${h}.png` });
  await page.click(".store-ui__door");
  for (const [name, ms] of [["B1-doors-opening", 1100], ["B2-threshold", 1700], ["B3-inside", 1300], ["C1-greeting-arrives", 2300], ["C-greeting", 2300]]) {
    await page.waitForTimeout(ms);
    await page.screenshot({ path: `${out}/${name}-${w}x${h}.png` });
  }
  // Part 4: each product in turn (arrow key = one swipe), then the chosen-product moment on the last one.
  await page.waitForSelector('.store[data-stage="browsing"]', { timeout: 15000 });
  for (const name of ["D-gloves", "E-heavy-bag", "F2-thai-pads", "F-focus-mitts", "G-guards"]) {
    await page.waitForTimeout(name === "D-gloves" ? 3600 : 2100);
    await page.screenshot({ path: `${out}/${name}-${w}x${h}.png` });
    if (name !== "G-guards") await page.keyboard.press("ArrowRight");
  }
  await page.click(".store-ui__actions button");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/H-selected-${w}x${h}.png` });
  console.log(`${w}x${h}`, errors.length ? errors : "no errors");
  await page.close();
}
await browser.close();
