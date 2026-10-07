// The still that covers the 3D store while it downloads and is prepared (StoreExperience.tsx): the arrival view of the shop front, taken from
// the live scene so it is exactly what the 3D shows a moment later. Run it again whenever the street or the arrival camera changes.
//   node tools/store/poster.mjs [baseUrl]        (needs the dev server running; default http://localhost:3002)
// Writes apps/web/public/assets/store/poster-tall.webp (phones, upright) and poster-wide.webp (landscape and desktop).
/* global process, console, URL */
import { chromium } from "playwright";
import { createRequire } from "node:module";
import { statSync } from "node:fs";

const sharp = createRequire(new URL("../../apps/web/package.json", import.meta.url))("sharp");
const base = process.argv[2] ?? "http://localhost:3002";
const out = new URL("../../apps/web/public/assets/store/", import.meta.url).pathname;
const SHOTS = [
  { name: "poster-tall", width: 390, height: 844, scale: 3 },
  { name: "poster-wide", width: 1600, height: 1000, scale: 1 },
];
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
for (const s of SHOTS) {
  const page = await browser.newPage({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: s.scale, isMobile: s.width < 800, hasTouch: s.width < 800 });
  // the development quality hold keeps the full level on a test browser, so the still is never taken on the reduced one
  await page.goto(`${base}/?quality=full`, { waitUntil: "networkidle" });
  await page.waitForSelector('.store[data-stage="arrive"]', { timeout: 60000 });
  // only the 3D: no interface, and not an older copy of this still
  await page.addStyleTag({ content: ".store-ui, .store__poster, nextjs-portal { visibility: hidden !important; }" });
  await page.waitForTimeout(2500);
  const png = await page.locator(".store__canvas").screenshot({ type: "png" });
  const file = `${out}${s.name}.webp`;
  await sharp(png).webp({ quality: 90, effort: 6 }).toFile(file);
  console.log("WROTE", file, statSync(file).size, "bytes", `${s.width * s.scale}x${s.height * s.scale}`);
  await page.close();
}
await browser.close();
