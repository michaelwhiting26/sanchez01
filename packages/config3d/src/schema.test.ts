import { describe, expect, it } from "vitest";
import {
  parseProductConfiguration,
  ProductConfigurationSchema,
  requiredPriceKeys,
  type ProductConfiguration,
} from "./index";
import { bagSchema, bagWallSchema, placeholderRetailPriceBook, ringSchema } from "./seeds";

const seeds: ProductConfiguration[] = [bagSchema, bagWallSchema, ringSchema];
const errorsOf = (doc: unknown): string[] => {
  const r = parseProductConfiguration(doc);
  return r.success ? [] : r.error.issues.map((i) => i.message);
};

describe("seed schemas", () => {
  it.each(seeds.map((s) => [s.id, s] as const))(
    "%s parses and is flagged placeholder",
    (_id, s) => {
      expect(ProductConfigurationSchema.safeParse(s).success).toBe(true);
      expect(s.placeholder).toBe(true);
      expect(s.format).toBe(1);
    },
  );
  it("the placeholder price book is flagged and covers every key the seeds can request", () => {
    expect(placeholderRetailPriceBook.placeholder).toBe(true);
    expect(placeholderRetailPriceBook.name).toMatch(/PLACEHOLDER/);
    for (const s of seeds) {
      for (const key of requiredPriceKeys(s))
        expect(placeholderRetailPriceBook.prices[key], key).toBeDefined();
    }
  });
  it("ring is quote-only; bag and wall take deposits", () => {
    expect(seeds.map((s) => [s.id, s.paymentMode])).toEqual([
      ["bag", "deposit"],
      ["bag_wall", "deposit"],
      ["ring", "quote"],
    ]);
  });
});

describe("schema document validation", () => {
  const clone = (): ProductConfiguration => structuredClone(bagSchema);

  it("rejects an unknown format version", () => {
    expect(parseProductConfiguration({ ...clone(), format: 2 }).success).toBe(false);
  });
  it("rejects a non-semver version", () => {
    expect(errorsOf({ ...clone(), version: "v1" })).toContain(
      "version must be semver MAJOR.MINOR.PATCH",
    );
  });
  it("rejects duplicate option ids", () => {
    const s = clone();
    s.steps[0]!.options.push({ ...s.steps[0]!.options[0]! });
    expect(errorsOf(s)).toContain('duplicate option id "bag_type"');
  });
  it("rejects dangling option references in conditions, templates and constraints", () => {
    const s = clone();
    s.pricing.modifiers.push({
      id: "ghost",
      label: { en: "Ghost" },
      priceKey: "bag.ghost.{nope}",
      scope: "unit",
    });
    s.constraints.push({
      rule: "export_unfilled_default",
      fillOption: "missing",
      unfilledValue: "unfilled",
      homeCountries: ["AU"],
    });
    const errs = errorsOf(s);
    expect(errs).toContain('modifier ghost references unknown option "nope"');
    expect(errs).toContain(
      'constraint export_unfilled_default references unknown option "missing"',
    );
  });
  it("rejects a default that is not one of the choices", () => {
    const s = clone();
    const opt = s.steps[0]!.options[0]!;
    if (opt.kind === "choice") opt.default = "unicorn";
    expect(errorsOf(s)).toContain('default "unicorn" is not a choice of "bag_type"');
  });
  it("requires quantity tiers to start at 1 and ascend", () => {
    const s = clone();
    s.pricing.quantity = { option: "quantity", tiers: [{ minQty: 2, discountBps: 0 }] };
    expect(errorsOf(s)).toContain("tiers must start at minQty 1 and be strictly ascending");
  });
  it("requires multiplyBy to target an integer number option", () => {
    const s = clone();
    s.pricing.modifiers.push({
      id: "bad",
      label: { en: "Bad" },
      priceKey: "x",
      scope: "line",
      multiplyBy: "material",
    });
    expect(errorsOf(s)).toContain('multiplyBy "material" must be an integer number option');
  });
  it("rejects unknown keys (strict documents)", () => {
    expect(parseProductConfiguration({ ...clone(), price: 100 }).success).toBe(false);
  });
});
