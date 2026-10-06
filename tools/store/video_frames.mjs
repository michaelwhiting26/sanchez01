// Pulls evenly spaced still frames out of every .mp4 in a folder, using the installed Chrome to decode them (this Mac has no ffmpeg).
//   node tools/store/video_frames.mjs <folder of mp4s> <output folder> [frames per video]
/* global process, console, document, Buffer, setTimeout */
import { chromium } from "playwright";
import { readdirSync, writeFileSync } from "node:fs";
const [dir, out, nArg] = process.argv.slice(2);
const n = Number(nArg ?? 8);
const browser = await chromium.launch({ channel: "chrome", args: ["--autoplay-policy=no-user-gesture-required", "--allow-file-access-from-files"] });
const page = await browser.newPage();
for (const f of readdirSync(dir).filter((x) => x.endsWith(".mp4"))) {
  await page.goto("file://" + dir + "/" + encodeURIComponent(f));
  const info = await page.evaluate(async () => {
    const v = document.querySelector("video");
    v.muted = true; v.pause();
    if (v.readyState < 1) await new Promise((r) => v.addEventListener("loadedmetadata", r, { once: true }));
    return { d: v.duration, w: v.videoWidth, h: v.videoHeight };
  });
  console.log(f, JSON.stringify(info));
  for (let i = 0; i < n; i++) {
    const t = (info.d * (i + 0.5)) / n;
    const data = await page.evaluate(async (t) => {
      const v = document.querySelector("video");
      await new Promise((r) => { v.addEventListener("seeked", r, { once: true }); v.currentTime = t; });
      await new Promise((r) => setTimeout(r, 120));
      const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
      c.getContext("2d").drawImage(v, 0, 0);
      return c.toDataURL("image/jpeg", 0.9);
    }, t);
    writeFileSync(`${out}/${f.slice(7, 13)}_${String(i).padStart(2, "0")}_${t.toFixed(1)}s.jpg`, Buffer.from(data.split(",")[1], "base64"));
  }
}
await browser.close();
