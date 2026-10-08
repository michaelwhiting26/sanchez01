import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STORE_PRODUCTS } from "../storefront/config";
import { NAME_CONSENT, SHOP_NAV, SHOP_PRODUCTS, SHOP_RANGE, SHOP_STEPS, SHOP_WORK, SHOP_WORK_WAITING } from "./catalogue";

const PUBLIC = fileURLToPath(new URL("../../../public", import.meta.url));
const onDisk = (src: string): boolean => existsSync(PUBLIC + src);

const LETTERED = /roach-pair|roach-side|freddie-front|roach-front|bowman|christian|ennor|savva|ttl/;

describe("the shop catalogue", () => {
  it("shows every active product once, in the wall's order", () => {
    const active = STORE_PRODUCTS.filter((p) => p.active).toSorted((a, b) => a.sortOrder - b.sortOrder);
    expect(SHOP_PRODUCTS.map((p) => p.slug)).toEqual(active.map((p) => p.slug));
  });

  it("gives every product a picture that exists and a builder to open", () => {
    for (const p of SHOP_PRODUCTS) {
      expect(onDisk(p.image.src), p.image.src).toBe(true);
      expect(p.image.alt.length, p.slug).toBeGreaterThan(10);
      expect(p.href).toBe(`/build/${p.slug}`);
    }
  });

  it("marks only the mitts as waiting for a builder", () => {
    expect(SHOP_PRODUCTS.filter((p) => !p.ready).map((p) => p.slug)).toEqual(["focus-mitts"]);
  });

  it("has something to show at every stop on the range slider", () => {
    expect(SHOP_RANGE[0]?.id).toBe("all");
    for (const r of SHOP_RANGE.slice(1)) expect(SHOP_WORK.some((w) => w.kind === r.id), r.id).toBe(true);
  });

  it("shows only workshop pieces whose photograph exists and that carry no person's full name", () => {
    expect(new Set(SHOP_WORK.map((w) => w.id)).size).toBe(SHOP_WORK.length);
    for (const w of SHOP_WORK) {
      expect(onDisk(w.image), w.image).toBe(true);
      expect(w.alt.length, w.id).toBeGreaterThan(10);
      if (LETTERED.test(w.image)) expect(w.consent && NAME_CONSENT[w.consent], w.id).toBe(true);
    }
    expect(SHOP_PRODUCTS.map((p) => p.image.src).join(" ")).not.toMatch(/roach|bowman|christian|ennor|savva|ttl/);
  });

  it("keeps every lettered piece out of the gallery until its consent is on file, with its picture ready", () => {
    const on = Object.values(NAME_CONSENT).filter(Boolean).length;
    if (on === 0) expect(SHOP_WORK.some((w) => w.consent)).toBe(false);
    for (const w of SHOP_WORK_WAITING) {
      expect(onDisk(w.image), w.image).toBe(true);
      expect(LETTERED.test(w.image), w.id).toBe(true);
      expect(`${w.label} ${w.alt}`, w.id).not.toMatch(/freddie|roach|bowman|christian|ennor|savva|ttl/i);
    }
    expect(new Set([...SHOP_WORK, ...SHOP_WORK_WAITING].map((w) => w.id)).size).toBe(SHOP_WORK.length + SHOP_WORK_WAITING.length);
  });

  it("states no price, timing or delivery promise", () => {
    const words = [...SHOP_PRODUCTS.map((p) => p.line), ...SHOP_STEPS.flatMap((s) => [s.title, s.text]), ...SHOP_NAV.map((n) => n.label)].join(" ");
    expect(words).not.toMatch(/\$|\d+\s*(?:working )?days?\b|\bfree\b|\bshipping\b|\bguarantee/i);
  });
});
