import { existsSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { boot, centred, galleryY, readLayout, scrollToY, settle, settleLayout, waitForViewportImages, type Layout } from "./support";

/**
 * Homepage checkpoints. Each one: (1) scroll to a position computed from element geometry, (2) put every scene in a known state through the window.__sz hooks
 * (frozen clock, explicit updates), (3) assert what the visitor should and should not see, (4) compare a screenshot.
 *
 * Screenshots are per platform (`{platform}` in `snapshotPathTemplate`, playwright.config.ts): the committed baselines are darwin's. On a platform with no
 * baseline (CI's linux, until the "E2E snapshots" workflow has produced and someone has committed linux ones) the screenshot step is skipped and noted in
 * the report, and everything else still runs; it is never silently written or failed. `--update-snapshots` always writes. The videos are masked (decoded
 * frames differ across machines); the WebGL canvases are not: with the fake clock they are pixel-stable.
 *
 * Determinism and tolerance: page time is Playwright's fake clock, paused from before the first byte and advanced only by `settle`; Math.random is seeded; the bag's
 * frame-counted idle spin is suspended (support.ts). Measured: re-runs against one baseline are byte-identical except 2-150 anti-aliasing pixels in the WebGL/canvas
 * frames (max 151 of 1.3M px), so `maxDiffPixelRatio` is 0.001, not looser. A baseline is a function of the test's own sequence of calls (frame counts, scroll
 * steps): if you change a checkpoint's flow, re-baseline it. Baselines are written with `--update-snapshots` and then `--update-snapshots=changed` (a first
 * write can capture a transient frame that a normal comparison never sees).
 */

let layout: Layout;

/** Every checkpoint doubles as an overflow check (regression e): a page wider than the viewport shifts everything sideways on phones. */
const expectNoOverflow = async (page: Page): Promise<void> => {
  const o = await page.evaluate(() => ({ doc: document.scrollingElement?.scrollWidth ?? 0, client: document.scrollingElement?.clientWidth ?? 0 }));
  expect(o.doc, "horizontal overflow").toBeLessThanOrEqual(o.client);
};

test.beforeEach(async ({ page }) => {
  await boot(page);
  layout = await readLayout(page);
});

const shot = async (page: Page, name: string, extra: Locator[] = []): Promise<void> => {
  await waitForViewportImages(page);
  await expectNoOverflow(page);
  const info = test.info();
  if (info.config.updateSnapshots === "missing" && !existsSync(info.snapshotPath(`${name}.png`))) {
    info.annotations.push({ type: "screenshot-skipped", description: `no ${process.platform} baseline for ${name}` });
    return;
  }
  await expect(page).toHaveScreenshot(`${name}.png`, { mask: [page.locator("video"), ...extra], maskColor: "#ff00ff" });
};

const sigState = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll<SVGPathElement>(".sig__p"), (p) => ({ off: parseFloat(p.style.strokeDashoffset || getComputedStyle(p).strokeDashoffset), fill: parseFloat(p.style.fillOpacity || getComputedStyle(p).fillOpacity) })),
  );

test.describe("hero", () => {
  test("intro end: SANCHEZ and Custom drawn, Jesse crouched, still", async ({ page }) => {
    await settle(page, { heroMs: "end" });
    const sig = await sigState(page);
    expect(sig.length).toBeGreaterThan(0);
    for (const s of sig) {
      expect(s.off).toBeCloseTo(0, 3);
      expect(s.fill).toBeGreaterThan(0.99);
    }
    expect(await page.evaluate(() => window.__sz?.owner())).toBe("hero");
    await expect(page.locator(".wm-hero")).toBeInViewport();
    await shot(page, "hero-intro-end");
  });

  test("mid Custom: first strokes inked, last stroke not yet", async ({ page }) => {
    const t = await page.evaluate(() => {
      const tl = window.__sz?.hero?.timeline() as { strokes: [number, number][] } | null;
      return tl ? tl.strokes : [];
    });
    expect(t.length).toBeGreaterThan(3);
    const first = t[0];
    const last = t[t.length - 1];
    if (!first || !last) throw new Error("no strokes");
    const mid = Math.round((first[0] + last[1]) / 2);
    await settle(page, { heroMs: mid });
    const sig = await sigState(page);
    expect(sig[0]?.off).toBeCloseTo(0, 3);
    expect(sig[sig.length - 1]?.off).toBeCloseTo(1, 3);
    await shot(page, "hero-mid-custom");
  });
});

test.describe("ribbon and gallery", () => {
  test("ribbon crossing (mid)", async ({ page }) => {
    const y = await findOwnerMid(page, layout, "ribbon");
    await scrollToY(page, y, { heroMs: "end" });
    expect(await page.evaluate(() => window.__sz?.owner())).toBe("ribbon");
    await expect(page.locator(".curved-loop")).toBeInViewport();
    await shot(page, "ribbon-crossing");
  });

  for (const [label, d] of [["start", 0.02], ["mid", 0.5], ["end", 1]] as const) {
    test(`gallery ${label}`, async ({ page }) => {
      await scrollToY(page, galleryY(layout, d), { heroMs: "end" });
      await expect(page.locator(".pg-stage")).toBeInViewport({ ratio: 0.9 });
      await shot(page, `gallery-${label}`);
    });
  }
});

test.describe("spiral and wordmark", () => {
  test("spiral transit", async ({ page }) => {
    await scrollToY(page, centred(layout.transit, layout.vh), { heroMs: "end" });
    await shot(page, "spiral-transit");
  });

  test("SANCHEZ rows", async ({ page }) => {
    await scrollToY(page, centred(layout.marquee, layout.vh), { heroMs: "end" });
    await expect(page.locator(".sz-marquee")).toBeInViewport();
    await shot(page, "sanchez-rows");
  });

  test("hand-off to the bag chain", async ({ page }) => {
    await scrollToY(page, centred(layout.handoff, layout.vh), { heroMs: "end" });
    await shot(page, "handoff");
  });
});

test.describe("options and bag", () => {
  test("options band, Bags chosen by default", async ({ page }) => {
    await scrollToY(page, centred(layout.options, layout.vh), { heroMs: "end" });
    const cats = page.getByRole("tab");
    await expect(cats.filter({ hasText: "Bags" })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".bag-punch")).not.toHaveAttribute("data-unchosen");
    await shot(page, "options-bags");
  });

  test("options band, Gloves chosen (still placeholder)", async ({ page }) => {
    await scrollToY(page, centred(layout.options, layout.vh), { heroMs: "end" });
    await page.getByRole("tab", { name: "Gloves" }).click();
    await settleLayout(page, { heroMs: "end" });
    // the section above shrank (still instead of bag): where the click left the scroll depends on the browser's anchoring, so put the band back in the middle explicitly
    const after = await readLayout(page);
    await scrollToY(page, centred(after.options, after.vh), { heroMs: "end" });
    await expect(page.locator(".bag-punch")).toHaveAttribute("data-still", "");
    await shot(page, "options-gloves");
  });

  test("bag visible", async ({ page }) => {
    await scrollToY(page, centred({ top: layout.bag.top, height: layout.vh }, layout.vh), { heroMs: "end", ms: 2400 }); // long enough for the bag's exponential settle to reach its steady state
    await expect(page.locator(".bag-punch")).toHaveClass(/is-ready/);
    await shot(page, "bag");
  });

  test("Jesse 2D pad-work", async ({ page }) => {
    await scrollToY(page, centred(layout.jesse2d, layout.vh), { heroMs: "end" });
    await expect(page.locator(".jesse-2d img")).toBeInViewport();
    await shot(page, "jesse-2d");
  });
});

test.describe("footer", () => {
  test("globe and Submit", async ({ page }) => {
    await scrollToY(page, layout.scrollHeight, { heroMs: "end" });
    await expect(page.locator(".footer-globe")).toBeVisible();
    await expect(page.getByRole("button", { name: /submit/i })).toBeVisible();
    await shot(page, "footer-globe-submit");
  });

  test("waitlist", async ({ page }) => {
    // desktop: the footer panel rides up over the pinned page, so the form moves with scroll non-linearly: home in on the centred position
    await scrollToY(page, layout.scrollHeight, { heroMs: "end" });
    for (let i = 0; i < 4; i++) {
      const off = await page.evaluate(() => {
        const r = document.querySelector("#waitlist-form")?.getBoundingClientRect();
        return { delta: (r?.top ?? 0) + (r?.height ?? 0) / 2 - window.innerHeight / 2, y: window.scrollY };
      });
      if (Math.abs(off.delta) < 2) break;
      await scrollToY(page, Math.max(0, Math.round(off.y + off.delta)), { heroMs: "end" });
    }
    await expect(page.locator("#waitlist-form")).toBeVisible();
    await shot(page, "waitlist");
  });
});

/** Middle scroll position of the run where the hand-off owner is `who`, found by scanning through the hooks (frozen clock, no sleeps). */
async function findOwnerMid(page: Page, l: Layout, who: "ribbon" | "gallery"): Promise<number> {
  await settle(page, { heroMs: "end" });
  const from = Math.max(0, Math.round(l.loop.top - l.vh));
  const to = Math.round(l.loop.top + l.loop.height);
  const hits: number[] = [];
  for (let y = from; y <= to; y += Math.max(8, Math.round(l.vh / 30))) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await settle(page, { ms: 32 });
    if ((await page.evaluate(() => window.__sz?.owner())) === who) hits.push(y);
  }
  expect(hits.length, `no scroll position had owner "${who}"`).toBeGreaterThan(0);
  return hits[Math.floor(hits.length / 2)] ?? 0;
}
