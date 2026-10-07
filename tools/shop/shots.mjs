// Full-page pictures of the shop pages at phone and desktop size, for review.
//   node tools/shop/shots.mjs <outDir> [baseUrl]
/* global process, console, window, document */
import { chromium } from "playwright";

const out = process.argv[2];
const base = process.argv[3] ?? "http://localhost:3002";
const PAGES = [["home", "/"], ["shop", "/shop"], ["how", "/how-it-works"], ["contact", "/contact"]];
const browser = await chromium.launch();
for (const [size, width, height] of [["phone", 390, 844], ["desk", 1440, 900]]) {
  for (const [name, path] of PAGES) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(base + path, { waitUntil: "networkidle" });
    const total = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < total; y += 600) { await page.evaluate((to) => window.scrollTo(0, to), y); await page.waitForTimeout(120); }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; } .sh-head { position: static !important; }" });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${name}-${size}.jpg`, fullPage: true, type: "jpeg", quality: 72 });
    console.log(name, size, total);
    await page.close();
  }
}
await browser.close();
