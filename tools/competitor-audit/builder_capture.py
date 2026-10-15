#!/usr/bin/env python3
"""Slow second pass over competitor custom-builder pages: wait for the builder to render, then capture it.

Run: python3 -I tools/competitor-audit/builder_capture.py --out "<competitor research dir>"
Writes data/<slug>/builder_capture.json and data/<slug>/shots/builder_<name>_<viewport>_<t>.jpg
"""
import argparse, asyncio, json, os, time
from playwright.async_api import async_playwright

DESKTOP_UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) "
              "Chrome/141.0.0.0 Safari/537.36")
TARGETS = [
    ("yokkao", "gloves", "https://yokkao.com/products/yokkao-power-custom-gloves"),
    ("yokkao", "heavy-bag", "https://yokkao.com/products/yokkao-custom-heavy-bag-170cm"),
    ("sting", "viper-x-custom", "https://www.stingsports.com.au/products/viper-x-lace-2024"),
    ("fly", "bespoke-superbar", "https://flysportsuk.com/products/bespoke-superbar"),
    ("infinitude", "product-builder", None),   # taken from data/infinitude/data.json discovered.product
]
PROBE = r"""
() => {
  const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const canv = Array.from(document.querySelectorAll('canvas')).filter(vis).map(c => { const r = c.getBoundingClientRect(); return {w: Math.round(r.width), h: Math.round(r.height)}; });
  const iframes = Array.from(document.querySelectorAll('iframe')).filter(vis).map(f => { try { return new URL(f.src, location.href).hostname; } catch (e) { return ''; } });
  const scripts = Array.from(document.scripts).map(s => s.src).filter(s => /kickflip|mycustomizer|zakeke|threekit|three|gltf|babylon|customi[sz]er|configurator|designer/i.test(s)).slice(0, 8);
  const labels = Array.from(document.querySelectorAll('legend, label, [class*="option" i] [class*="title" i], [class*="step" i], h3, h4')).filter(vis).map(e => clean(e.innerText)).filter(t => t && t.length < 60);
  const buttons = Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"]')).filter(vis).map(b => clean(b.innerText || b.value || b.getAttribute('aria-label'))).filter(t => t && t.length < 50);
  const swatches = Array.from(document.querySelectorAll('[class*="swatch" i], [data-color], [class*="color" i] button, [class*="colour" i] button, [class*="option" i] button')).filter(vis).length;
  const price = (Array.from(document.querySelectorAll('[class*="price" i], [class*="total" i]')).find(e => vis(e) && /\d/.test(e.innerText || '')) || {}).innerText || null;
  const text = document.body.innerText;
  const m = (re) => { const x = text.match(re); return x ? clean(text.substr(Math.max(0, x.index - 50), 200)) : null; };
  return { url: location.href, title: document.title, canvases: canv, iframes: [...new Set(iframes)], builderScripts: scripts,
    labels: [...new Set(labels)].slice(0, 60), buttons: [...new Set(buttons)].slice(0, 60), swatches, price: price ? clean(price).slice(0, 80) : null,
    upload: document.querySelectorAll('input[type="file"]').length, textInputs: document.querySelectorAll('input[type="text"], textarea').length,
    leadTime: m(/\b\d{1,2}\s*(?:-|–|to)\s*\d{1,2}\s*(?:business\s+)?(?:weeks?|days)\b/i), finalSale: m(/final sale|no (returns|refunds)|non[- ]refundable/i),
    loading: m(/loading|\d{1,3}\s*%/i) };
}
"""


async def grab(page, path_base, t_marks):
    out = []
    t0 = time.time()
    for t in t_marks:
        wait = t - (time.time() - t0)
        if wait > 0:
            await page.wait_for_timeout(int(wait * 1000))
        p = f"{path_base}_{t}s.jpg"
        await page.screenshot(path=p, type="jpeg", quality=68)
        out.append({"t": t, "shot": os.path.basename(p), "probe": await page.evaluate(PROBE)})
    return out


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    inf = json.load(open(os.path.join(a.out, "data", "infinitude", "data.json")))
    results = {}
    async with async_playwright() as pw:
        chromium = await pw.chromium.launch(headless=True, args=["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"])
        webkit = await pw.webkit.launch(headless=True)
        for slug, name, url in TARGETS:
            url = url or (inf.get("discovered") or {}).get("product")
            if not url:
                continue
            shots = os.path.join(a.out, "data", slug, "shots")
            os.makedirs(shots, exist_ok=True)
            rec = results.setdefault(slug, {})
            for vp in ("desktop", "mobile"):
                ctx = await (chromium.new_context(viewport={"width": 1440, "height": 900}, user_agent=DESKTOP_UA, locale="en-GB")
                             if vp == "desktop" else webkit.new_context(**pw.devices["iPhone 14"], locale="en-GB"))
                page = await ctx.new_page()
                print(f"[{time.strftime('%H:%M:%S')}] [{slug}] builder {name} {vp} {url}", flush=True)
                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=45000)
                    caps = await grab(page, os.path.join(shots, f"builder_{name}_{vp}"), [8, 20, 40])
                    # then scroll to where the options usually sit and capture once more
                    await page.evaluate("() => window.scrollTo(0, Math.round(window.innerHeight * 0.9))")
                    await page.wait_for_timeout(1500)
                    p = os.path.join(shots, f"builder_{name}_{vp}_options.jpg")
                    await page.screenshot(path=p, type="jpeg", quality=68)
                    caps.append({"t": "options", "shot": os.path.basename(p), "probe": await page.evaluate(PROBE)})
                    rec[f"{name}_{vp}"] = {"url": url, "captures": caps}
                except Exception as e:
                    rec[f"{name}_{vp}"] = {"url": url, "error": str(e)[:300]}
                    print(f"   error: {str(e)[:160]}", flush=True)
                await ctx.close()
        await chromium.close()
        await webkit.close()
    for slug, rec in results.items():
        with open(os.path.join(a.out, "data", slug, "builder_capture.json"), "w") as f:
            json.dump(rec, f, indent=1)
    print("BUILDER PASS DONE", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
