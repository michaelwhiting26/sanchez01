import { expect, test, type Page } from "@playwright/test";
import { boot, centred, galleryY, readLayout, scrollToY, settle, settleLayout, visibleJesse, type JesseOwner, type Layout } from "./support";

/**
 * State-machine regressions, asserted semantically (DOM, computed style, canvas pixels, hook state), never by comparing screenshots.
 * Every test names the bug it guards. Lettered a-h to match the WP4 brief.
 */

let layout: Layout;

test.beforeEach(async ({ page }) => {
  await boot(page);
  layout = await readLayout(page);
});

/** Scroll positions strictly inside [from, to], evenly spaced. */
const spread = (from: number, to: number, n: number): number[] => Array.from({ length: n }, (_, i) => Math.round(from + ((to - from) * (i + 0.5)) / n));

// ---------------------------------------------------------------------------------------------------------------------------------- a. spiral
/** Does any stacking context between `el` and the root sit above the page's other fixed layers? Returns the element that owns the stacking context `el` paints in. */
async function stackingRoot(page: Page, selector: string): Promise<string> {
  return page.evaluate((sel) => {
    const makesContext = (e: Element): boolean => {
      const cs = getComputedStyle(e);
      const positioned = cs.position !== "static";
      return (
        e === document.documentElement ||
        cs.isolation === "isolate" ||
        (positioned && cs.zIndex !== "auto" && (cs.position === "fixed" || cs.position === "sticky" || cs.position === "relative" || cs.position === "absolute")) ||
        parseFloat(cs.opacity) < 1 ||
        cs.transform !== "none" ||
        cs.filter !== "none" ||
        cs.perspective !== "none" ||
        cs.clipPath !== "none" ||
        cs.mask !== "none" ||
        cs.mixBlendMode !== "normal" ||
        /paint|layout|strict|content/.test(cs.contain) ||
        /transform|opacity|filter/.test(cs.willChange)
      );
    };
    const el = document.querySelector(sel);
    if (!el) return "missing";
    for (let p = el.parentElement; p; p = p.parentElement) if (makesContext(p)) return p === document.documentElement ? "html" : `${p.tagName.toLowerCase()}.${p.className.toString()}`;
    return "html";
  }, selector);
}

/** Opaque-ish pixels of the spiral canvas in the viewport rows [top, bottom) within a centre band. */
async function spiralPixels(page: Page, top: number, bottom: number): Promise<number> {
  return page.evaluate(
    ([t, b]) => {
      const canvas = document.querySelector<HTMLCanvasElement>(".dna-core");
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return -1;
      const k = canvas.width / canvas.clientWidth;
      const bandW = Math.round(Math.min(canvas.width, 260 * k));
      const x0 = Math.round((canvas.width - bandW) / 2);
      const y0 = Math.max(0, Math.round(t * k));
      const y1 = Math.min(canvas.height, Math.round(b * k));
      if (y1 <= y0) return 0;
      const data = ctx.getImageData(x0, y0, bandW, y1 - y0).data;
      let n = 0;
      for (let i = 3; i < data.length; i += 4) if ((data[i] ?? 0) > 10) n++;
      return n;
    },
    [top, bottom] as const,
  );
}

const ringY = (page: Page): Promise<number> =>
  page.evaluate(() => {
    const view = document.querySelector("[data-bag-view]");
    if (!view) throw new Error("no bag view");
    const r = view.getBoundingClientRect();
    return r.top + window.scrollY + r.height * 0.118; // the chain ring, as lib/dna.ts places it
  });

test.describe("a. the spiral stays visible in its interval", () => {
  test("the hero does not lift its field above the spiral (isolation)", async ({ page }) => {
    // Bug (owner, 30 Sep 19:05): `isolation: isolate` on .wm-hero put the hero's fixed canvas in its own stacking context, above the DNA canvas, hiding the spiral page-wide.
    expect(await page.evaluate(() => getComputedStyle(document.querySelector(".wm-hero") ?? document.body).isolation)).not.toBe("isolate");
    await expect(page.locator(".wm-hero")).toHaveCount(1);
    expect(await stackingRoot(page, ".wm-field")).toBe("html");
    expect(await stackingRoot(page, ".dna-core")).toBe("html");
    // same root and same z-index: the spiral paints over the field only if it comes later in the DOM
    const order = await page.evaluate(() => {
      const f = document.querySelector(".wm-field");
      const d = document.querySelector(".dna-core");
      if (!f || !d) return "missing";
      return f.compareDocumentPosition(d) & Node.DOCUMENT_POSITION_FOLLOWING ? "field-then-spiral" : "spiral-then-field";
    });
    expect(order).toBe("field-then-spiral");
    const z = await page.evaluate(() => [".wm-field", ".dna-core"].map((s) => getComputedStyle(document.querySelector(s) ?? document.body).zIndex));
    expect(z[1]).toBe(z[0]);
  });

  test("spiral pixels between the SANCHEZ rows and the bag's chain ring", async ({ page }) => {
    const ring = await ringY(page);
    const from = layout.marquee.top + layout.marquee.height + 40; // below the rows
    const to = ring - 20;
    let checked = 0;
    for (const y of spread(from - layout.vh * 0.6, to - layout.vh * 0.4, 8)) {
      await scrollToY(page, y, { heroMs: "end", ms: 32 });
      const top = Math.max(0, from - y);
      const bottom = Math.min(layout.vh, to - y);
      if (bottom - top < 60) continue;
      checked++;
      expect(await spiralPixels(page, top, bottom), `no spiral pixels at scrollY ${y} (rows ${top}-${bottom})`).toBeGreaterThan(20);
    }
    expect(checked, "the sweep never had a tall enough window to check").toBeGreaterThan(2);
  });

  test("spiral pixels in the empty transit field after the gallery", async ({ page }) => {
    const from = layout.track.top + layout.track.height;
    const to = layout.marquee.top;
    let checked = 0;
    for (const y of spread(from, to - layout.vh * 0.5, 6)) {
      await scrollToY(page, y, { heroMs: "end", ms: 32 });
      const top = Math.max(0, from - y);
      const bottom = Math.min(layout.vh, to - y);
      if (bottom - top < 60) continue;
      checked++;
      expect(await spiralPixels(page, top, bottom), `no spiral pixels at scrollY ${y}`).toBeGreaterThan(20);
    }
    expect(checked).toBeGreaterThan(2);
  });
});

// ---------------------------------------------------------------------------------------------------------------------------------- b. one Jesse
test("b. exactly one Jesse at every scroll position, and it is the one the hand-off names", async ({ page }) => {
  const max = layout.scrollHeight - layout.vh;
  const derived = [0, centred(layout.loop, layout.vh), galleryY(layout, 0.1), galleryY(layout, 0.35), galleryY(layout, 0.6), galleryY(layout, 0.9), galleryY(layout, 1.02), centred(layout.marquee, layout.vh), centred(layout.bag, layout.vh), max];
  const grid = Array.from({ length: 20 }, (_, i) => Math.round((max * i) / 19));
  const down = [...new Set([...derived, ...grid].map((y) => Math.min(max, Math.max(0, y))))].sort((a, b) => a - b);
  const sweep = [...down, ...[...down].reverse()]; // top to bottom and back
  const seen: Record<string, number> = { hero: 0, ribbon: 0, gallery: 0, none: 0 };
  await settle(page, { heroMs: "end", ms: 32 });
  for (const y of sweep) {
    await scrollToY(page, y, { heroMs: "end", ms: 32 });
    const own: JesseOwner = await page.evaluate(() => window.__sz?.owner() ?? "none");
    const v = await visibleJesse(page);
    const count = v.ribbon + v.gallery + v.hero;
    expect(count, `${count} Jesse figures at scrollY ${y}: ${JSON.stringify(v)} (owner ${own})`).toBeLessThanOrEqual(1);
    if (own !== "ribbon") expect(v.ribbon, `ribbon figure drawn at ${y} while owner is ${own}`).toBe(0);
    if (own !== "gallery") expect(v.gallery, `gallery figure drawn at ${y} while owner is ${own}`).toBe(0);
    seen[own] = (seen[own] ?? 0) + 1;
  }
  // the sweep must really have crossed every scene, or it proves nothing
  expect(seen["ribbon"], "the sweep never met the ribbon figure").toBeGreaterThan(0);
  expect(seen["gallery"], "the sweep never met the gallery figure").toBeGreaterThan(0);
  expect(seen["hero"], "the sweep never met the hero runner").toBeGreaterThan(0);
});

// ---------------------------------------------------------------------------------------------------------------------------------- c. gallery
test("c. the gallery never scrolls past slide 6", async ({ page }) => {
  const geo = await page.evaluate(() => {
    const strip = document.querySelector<HTMLElement>(".pg-strip");
    const vp = document.querySelector<HTMLElement>(".pg-viewport");
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".pg-card"));
    const last = cards[cards.length - 1];
    if (!strip || !vp || !last) throw new Error("gallery markup missing");
    const gap = parseFloat(getComputedStyle(strip).columnGap) || 0;
    // the travel the mechanic is specified to have: the last card flush right, a gap (plus 5% of a card: the neighbour is drawn smaller) beyond it
    const expected = last.offsetLeft + last.offsetWidth + gap + last.offsetWidth * 0.05 - vp.clientWidth;
    return { n: cards.length, expected, cardW: last.offsetWidth, last: last.offsetLeft, vpW: vp.clientWidth };
  });
  expect(geo.n).toBe(6);
  const tx = (): Promise<number> => page.evaluate(() => new DOMMatrixReadOnly(getComputedStyle(document.querySelector(".pg-strip") ?? document.body).transform).m41);
  const counter = (): Promise<string> => page.evaluate(() => document.querySelector(".pg-hud p")?.textContent?.trim() ?? "");

  let previous = -1;
  for (const d of [0, 0.25, 0.5, 0.75, 0.95, 1]) {
    await scrollToY(page, galleryY(layout, d), { heroMs: "end" });
    const m = /^(\d\d) \/ (\d\d)$/.exec(await counter());
    expect(m, "counter text").not.toBeNull();
    const n = Number(m?.[1]);
    expect(n).toBeLessThanOrEqual(6);
    expect(n).toBeGreaterThanOrEqual(previous);
    previous = n;
  }
  // at the end of the pin, and every scroll position after it: slide 6 is showing, the strip has stopped, nothing further slides
  const stops: number[] = [];
  for (const d of [1, 1.03, 1.08, 1.15]) {
    const y = Math.min(layout.track.top + layout.track.height - layout.vh, galleryY(layout, d));
    await scrollToY(page, y, { heroMs: "end" });
    expect(await counter(), `counter at d=${d}`).toBe("06 / 06");
    const t = await tx();
    stops.push(t);
    expect(-t, `strip travelled ${-t}px, the last card is centred/flush at ${geo.expected}px (d=${d})`).toBeLessThanOrEqual(geo.expected + 2);
    expect(-t).toBeGreaterThanOrEqual(geo.expected - 2);
    // the last card is fully on screen and its centre is within half a card width of the viewport's right-hand focus (never scrolled off to the left)
    const centre = geo.last + geo.cardW / 2 + t;
    expect(centre).toBeGreaterThan(0);
    expect(centre + geo.cardW / 2).toBeLessThanOrEqual(layout.vw + 1);
  }
  expect(new Set(stops.map((s) => Math.round(s))).size, "the strip kept sliding after the pin ended").toBe(1);
});

// ---------------------------------------------------------------------------------------------------------------------------------- d. Custom
test("d. the C of Custom is not inked before the pen reaches it", async ({ page }) => {
  const tl = await page.evaluate(() => {
    const t: unknown = window.__sz?.hero?.timeline();
    if (typeof t !== "object" || t === null || !("strokes" in t) || !("write0" in t)) return null;
    const strokes = Array.isArray(t.strokes) ? t.strokes.map((s: unknown) => (Array.isArray(s) ? s.map(Number) : [])) : [];
    return { strokes, write0: Number(t.write0) };
  });
  if (!tl) throw new Error("no timeline");
  expect(tl.strokes.length).toBeGreaterThan(3);
  const [start = 0, end = 0] = tl.strokes[0] ?? [];
  const first: [number, number] = [start, end];
  const reveal = async (ms: number): Promise<number[]> => {
    await page.evaluate((t) => window.__sz?.hero?.seek(t), ms);
    return page.evaluate(() => Array.from(document.querySelectorAll<SVGPathElement>(".sig__p"), (p) => 1 - parseFloat(p.style.strokeDashoffset || getComputedStyle(p).strokeDashoffset)));
  };
  // before the first stroke starts: nothing is inked, on any stroke (walk-in, crouch, shake, the whole approach)
  for (const ms of [0, 1000, tl.write0 - 2000, tl.write0 - 1, first[0] - 400, first[0] - 30, first[0] - 1]) {
    const r = await reveal(Math.max(0, ms));
    r.forEach((v, i) => expect(v, `stroke ${i} inked ${v} at ${ms.toFixed(0)}ms, before the pen starts at ${first[0].toFixed(0)}ms`).toBeLessThan(1e-6));
  }
  // during stroke 0: it grows monotonically from nothing, the later strokes stay empty, and it is complete when the stroke ends
  let last = 0;
  for (let k = 1; k <= 12; k++) {
    const ms = first[0] + ((first[1] - first[0]) * k) / 12;
    const r = await reveal(ms);
    expect(r[0] ?? 0).toBeGreaterThanOrEqual(last - 1e-9);
    expect(r[0] ?? 0).toBeLessThanOrEqual(1 + 1e-9);
    if (k === 1) expect(r[0] ?? 0, "the pen jumped ahead in its first twelfth").toBeLessThan(0.5);
    last = r[0] ?? 0;
    for (let i = 1; i < r.length; i++) if ((tl.strokes[i]?.[0] ?? 0) > ms) expect(r[i] ?? 0, `stroke ${i} inked during stroke 0`).toBeLessThan(1e-6);
  }
  expect(last).toBeGreaterThan(0.999);
});

// ---------------------------------------------------------------------------------------------------------------------------------- e. overflow
/**
 * The site sets `html, body { overflow-x: clip }`, so a too-wide element never makes the document scroll sideways: it is silently cut off (or, on a phone, drags
 * the layout viewport wider). `scrollWidth <= clientWidth` alone therefore cannot see it. So this also lists every visible element that sticks out of the
 * viewport and is NOT inside an ancestor that clips on purpose (the marquee rows, the ribbon, the gallery viewport). Known, harmless exceptions are named below.
 */
const KNOWN_BLEEDS = [
  ".waitlist__hp", // the bot honeypot, parked far off-screen on purpose
  ".wm-hero__pool", // decorative radial gradient behind "Custom": 31px past the right edge at 390, clipped by html (aria-hidden, no content)
];
async function stickingOut(page: Page): Promise<string[]> {
  return page.evaluate((known) => {
    const vw = document.documentElement.clientWidth;
    const out: string[] = [];
    for (const e of Array.from(document.body.querySelectorAll("*"))) {
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(e);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      if (r.right <= vw + 1 && r.left >= -1) continue;
      if (known.some((k) => e.matches(k))) continue;
      let clipped = false;
      for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
        if (getComputedStyle(p).overflowX !== "visible") {
          clipped = true;
          break;
        }
      }
      if (!clipped) out.push(`${e.tagName.toLowerCase()}.${e.className.toString().slice(0, 40)} ${Math.round(r.left)}..${Math.round(r.right)} (viewport ${vw})`);
    }
    return out;
  }, KNOWN_BLEEDS);
}

test("e. no horizontal overflow at any scroll position or state", async ({ page }) => {
  const overflow = (): Promise<{ doc: number; client: number }> => page.evaluate(() => ({ doc: document.scrollingElement?.scrollWidth ?? 0, client: document.scrollingElement?.clientWidth ?? 0 }));
  const check = async (where: string): Promise<void> => {
    const o = await overflow();
    expect(o.doc, `document is ${o.doc}px wide in a ${o.client}px viewport (${where})`).toBeLessThanOrEqual(o.client);
    expect(await stickingOut(page), `elements sticking out of the ${o.client}px viewport (${where})`).toEqual([]);
  };
  const max = layout.scrollHeight - layout.vh;
  const ys = [...Array.from({ length: 16 }, (_, i) => Math.round((max * i) / 15)), galleryY(layout, 0.5), galleryY(layout, 1), centred(layout.marquee, layout.vh), centred(layout.options, layout.vh)];
  for (const y of ys) {
    await scrollToY(page, y, { heroMs: "end", ms: 32 });
    await check(`scrollY ${y}`);
  }
  await scrollToY(page, centred(layout.options, layout.vh), { heroMs: "end" });
  for (const name of ["Gloves", "Mitts", "Bags"]) {
    await page.getByRole("tab", { name }).click();
    await settleLayout(page, { heroMs: "end" });
    await check(`after choosing ${name}`);
  }
});

// ---------------------------------------------------------------------------------------------------------------------------------- f. bag
test("f. the bag stays visible: it is ready, revealed and fully opaque, before and after switching products", async ({ page }) => {
  // The 3D bag renders on the CPU (software WebGL) on a CI runner: this test takes ~37 s locally but 84-90+ s there, right at the 90 s limit. Same assertions, more time, CI only.
  test.slow(!!process.env.CI, "software WebGL on the CI runner is about 2.5x slower than a laptop GPU");
  const state = () =>
    page.evaluate(() => {
      const root = document.querySelector<HTMLElement>(".bag-punch");
      const view = document.querySelector<HTMLElement>(".bag-punch__view");
      if (!root || !view) throw new Error("bag markup missing");
      const cs = getComputedStyle(view);
      return { ready: root.classList.contains("is-ready"), revealed: root.classList.contains("is-revealed"), opacity: parseFloat(cs.opacity), visibility: cs.visibility };
    });
  const bagY = centred({ top: layout.bag.top, height: layout.vh }, layout.vh);
  // the product tabs sit below the bag: choose there, then come back up to the bag, exactly as a visitor does
  const choose = async (name: string): Promise<void> => {
    await scrollToY(page, centred(layout.options, layout.vh), { heroMs: "end", ms: 200 });
    await page.getByRole("tab", { name }).click();
    await settleLayout(page, { heroMs: "end" });
    await scrollToY(page, bagY, { heroMs: "end", ms: 200 });
    await expect
      .poll(async () => {
        await settle(page, { ms: 200 });
        return (await state()).revealed;
      })
      .toBe(true);
  };
  await scrollToY(page, bagY, { heroMs: "end", ms: 200 });
  await choose("Bags");
  expect(await state()).toMatchObject({ ready: true, revealed: true, opacity: 1, visibility: "visible" });
  await expect(page.locator(".bag-punch canvas")).toBeVisible();

  await choose("Gloves");
  expect((await state()).ready, "is-ready was wiped by switching to Gloves").toBe(true);
  await choose("Bags");
  // Bug: a className that changed with React state wiped the engine's is-ready / is-revealed classes when the product changed.
  expect(await state(), "bag after Gloves -> Bags").toMatchObject({ ready: true, revealed: true, opacity: 1, visibility: "visible" });
  await expect(page.locator(".bag-punch")).toHaveAttribute("class", /is-ready/);
});

// ---------------------------------------------------------------------------------------------------------------------------------- g. dead artefacts
test("g. dead artefacts stay dead", async ({ page }) => {
  await scrollToY(page, layout.scrollHeight, { heroMs: "end" });
  // owner, 30 Sep 19:25: no visible line between the globe and Submit. The element is not in the DOM at all (not merely hidden by CSS).
  await expect(page.locator(".orbit-tether"), "the orbit tether must not be in the DOM").toHaveCount(0);
  // no auto-tour, so no tour hint; no magnet on the waitlist
  await expect(page.locator(".tour-hint")).toHaveCount(0);
  await expect(page.locator(".waitlist__magnet")).toHaveCount(0);
  // never visible in the approved page (display:none at every width and scroll position), so removed from the DOM: the unused second footer bag
  // inside the rise panel, and the "Drag to spin" hint under the 3D bag
  await expect(page.locator(".rise__bag")).toHaveCount(0);
  await expect(page.locator(".bag-punch__hint")).toHaveCount(0);
  // one Submit: the tethered bag button. No second variant anywhere in the DOM.
  await expect(page.locator('button[type="submit"], input[type="submit"]')).toHaveCount(1);
  await expect(page.locator(".orbit-submit")).toHaveCount(1);
  const visibleSubmits = await page.locator('button[type="submit"]').evaluateAll((els) => els.filter((e) => getComputedStyle(e).visibility !== "hidden" && e.getBoundingClientRect().height > 0).length);
  expect(visibleSubmits).toBeLessThanOrEqual(1);
  await expect(page.locator("[class*='waitlist__submit'], .waitlist__btn")).toHaveCount(0);
});

// ---------------------------------------------------------------------------------------------------------------------------------- h. bag beneath the globe
test("h. the footer bag hangs beneath the globe (locked decision 8)", async ({ page }) => {
  await scrollToY(page, layout.scrollHeight, { heroMs: "end" });
  const m = await page.evaluate(() => {
    const bag = document.querySelector<HTMLElement>(".globe-bag");
    const globe = document.querySelector<HTMLElement>(".footer-globe");
    if (!bag || !globe) return null;
    const cs = getComputedStyle(bag);
    const b = bag.getBoundingClientRect();
    const g = globe.getBoundingClientRect();
    return { display: cs.display, visibility: cs.visibility, opacity: +cs.opacity, bag: { cx: b.x + b.width / 2, top: b.top, bottom: b.bottom, h: b.height }, globe: { cx: g.x + g.width / 2, top: g.top, bottom: g.bottom, h: g.height } };
  });
  expect(m, "the globe and the footer bag must both exist").not.toBeNull();
  if (!m) return;
  expect(m.display).not.toBe("none");
  expect(m.visibility).toBe("visible");
  expect(m.opacity).toBeGreaterThan(0);
  // phone: the bag is centred on the viewport and the globe sits 20 px right of it (identical before the WP3 refactor), so allow 6% of the globe's width
  expect(Math.abs(m.bag.cx - m.globe.cx), "the bag is centred under the globe").toBeLessThan(m.globe.h * 0.06);
  // the chain hook sits just inside the globe's lower edge, and the bag body hangs well below it
  expect(m.bag.top, "the bag starts inside the globe's lower half").toBeGreaterThan(m.globe.top + m.globe.h * 0.5);
  expect(m.bag.top, "the bag starts above the globe's bottom edge").toBeLessThan(m.globe.bottom);
  expect(m.bag.bottom, "the bag hangs below the globe").toBeGreaterThan(m.globe.bottom + m.bag.h * 0.5);
});
