import { expect, test, type CDPSession } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Network budget (phone): what the homepage downloads at start and over a full scroll, in WIRE bytes (Chrome's encodedDataLength: compressed bytes as received;
 * cache hits and 304s count only headers). Real time, no fake clock: loading is the thing under test. Thresholds: e2e/network-budget.json.
 */
interface Budget { ceilingsKB: Record<string, number>; targetsKB: Record<string, number>; forbiddenAtStart: string[] }
const budget = JSON.parse(readFileSync(fileURLToPath(new URL("./network-budget.json", import.meta.url)), "utf8")) as Budget;
interface Req { url: string; type: string; phase: "initial" | "scroll"; wire: number }

test("homepage network budget at phone size: nothing heavy at start, no duplicate downloads, within the byte ceilings", async ({ page, context }) => {
  test.skip(test.info().project.name !== "phone", "the budget is defined for the phone profile");
  test.setTimeout(180_000);
  const cdp: CDPSession = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  const reqs = new Map<string, Req>();
  let phase: Req["phase"] = "initial";
  cdp.on("Network.requestWillBeSent", (e) => reqs.set(e.requestId, { url: new URL(e.request.url).pathname, type: e.type ?? "Other", phase, wire: 0 }));
  cdp.on("Network.loadingFinished", (e) => {
    const r = reqs.get(e.requestId);
    if (r) r.wire = e.encodedDataLength;
  });
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(4000); // idle after load: no clock signal exists for "nothing else will start", so a fixed real-time window is the definition
  const initial = [...reqs.values()];
  const kb = (rs: Req[], f: (r: Req) => boolean = () => true): number => Math.round(rs.filter(f).reduce((s, r) => s + r.wire, 0) / 1024);

  // 1. nothing heavy at start
  const forbidden = budget.forbiddenAtStart.map((p) => new RegExp(p));
  const early = initial.filter((r) => forbidden.some((re) => re.test(r.url)));
  expect(early.map((r) => r.url), "heavy assets fetched before the visitor scrolled").toEqual([]);

  // 2. full scroll
  phase = "scroll";
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo({ top, left: 0, behavior: "instant" }), y);
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(4000);
  const all = [...reqs.values()];

  // 3. no file downloaded twice (bodies over 2 KB: a revalidation is headers only)
  const counts = new Map<string, number>();
  for (const r of all) if (r.wire > 2048) counts.set(r.url, (counts.get(r.url) ?? 0) + 1);
  expect([...counts].filter(([, n]) => n > 1).map(([u, n]) => `${u} x${n}`), "files downloaded more than once").toEqual([]);

  const m = {
    initial: kb(initial),
    initialScript: kb(initial, (r) => r.type === "Script"),
    initialFont: kb(initial, (r) => r.type === "Font"),
    fullScrollExcludingMedia: kb(all, (r) => r.type !== "Media"),
    fullScrollIncludingMedia: kb(all),
    media: kb(all, (r) => r.type === "Media"),
    requests: all.length,
  };
  const report = Object.entries(budget.targetsKB).map(([k, t]) => `${k}: ${m[k as keyof typeof m]} KB (target ${t})`).join("; ");
  test.info().annotations.push({ type: "network", description: `${JSON.stringify(m)} | targets: ${report}` });
  console.log(`[network] ${JSON.stringify(m)}\n[network] targets: ${report}`);

  // 4. ceilings (regressions fail)
  for (const [k, ceiling] of Object.entries(budget.ceilingsKB)) expect(m[k as keyof typeof m], `${k} (KB) over its ceiling`).toBeLessThanOrEqual(ceiling);
});
