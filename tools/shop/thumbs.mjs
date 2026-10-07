// The product pictures on the shop cards: each builder's own model on a clear background, taken from the live builder so the card shows exactly
// what "Customise now" opens. Run it again whenever a model or its default colours change.
//   node tools/shop/thumbs.mjs [baseUrl]        (needs the dev server running; default http://localhost:3002)
// Writes apps/web/public/assets/shop/<slug>.webp
/* global process, console, URL */
import { chromium } from "playwright";
import { createRequire } from "node:module";
import { statSync } from "node:fs";

const sharp = createRequire(new URL("../../apps/web/package.json", import.meta.url))("sharp");
const base = process.argv[2] ?? "http://localhost:3002";
const out = new URL("../../apps/web/public/assets/shop/", import.meta.url).pathname;
const SLUGS = ["gloves", "head-guard", "groin-guard"];
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
for (const slug of SLUGS) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1100 }, deviceScaleFactor: 2 });
  await page.goto(`${base}/build/${slug}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".gb__canvas canvas", { timeout: 60000 });
  await page.waitForTimeout(4000);
  // only the model: nothing behind the canvas, so the picture keeps a clear background
  await page.addStyleTag({ content: "*, *::before, *::after { background: transparent !important; box-shadow: none !important; } nextjs-portal { display: none !important; } body * { visibility: hidden !important; } .gb__canvas, .gb__canvas * { visibility: visible !important; }" });
  await page.waitForTimeout(500);
  const png = await page.locator(".gb__canvas canvas").screenshot({ type: "png", omitBackground: true });
  const file = `${out}${slug}.webp`;
  await sharp(png).trim().resize({ width: 900, height: 900, fit: "inside" }).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(file);
  console.log("WROTE", file, statSync(file).size, "bytes");
  await page.close();
}
await browser.close();
