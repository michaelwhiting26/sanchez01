import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { CURRENCIES, PriceBookSchema, type Currency, type PriceBook } from "@sanchez/domain";
import {
  computePrice,
  expandPriceKey,
  validateSelection,
  type PriceQuote,
  type ProductConfiguration,
} from "./index";
import { bagSchema, bagWallSchema, placeholderRetailPriceBook, ringSchema } from "./seeds";
import { validBag, validRing, validWall } from "./fixtures.test-helpers";

const unwrap = (r: ReturnType<typeof computePrice>): PriceQuote => {
  if (!r.ok) throw new Error(JSON.stringify(r.error));
  return r.value;
};

/** A small hand-checkable schema + book, independent of placeholder seed values. */
const miniSchema: ProductConfiguration = {
  format: 1,
  id: "mini",
  version: "1.0.0",
  productType: "bag",
  label: { en: "Mini" },
  placeholder: false,
  paymentMode: "deposit",
  leadTimeDays: 30,
  steps: [
    {
      id: "s1",
      label: { en: "Step" },
      options: [
        {
          id: "size",
          kind: "choice",
          label: { en: "Size" },
          required: true,
          choices: [
            { value: "s", label: { en: "S" } },
            { value: "l", label: { en: "L" } },
          ],
        },
        { id: "logo", kind: "boolean", label: { en: "Logo" }, required: false, default: false },
        {
          id: "extras",
          kind: "multi_choice",
          label: { en: "Extras" },
          required: false,
          choices: [
            { value: "tag", label: { en: "Tag" } },
            { value: "cover", label: { en: "Cover" } },
          ],
        },
        {
          id: "stations",
          kind: "number",
          label: { en: "Stations" },
          required: true,
          min: 0,
          max: 50,
          integer: true,
          unit: "count",
          default: 1,
        },
        {
          id: "qty",
          kind: "number",
          label: { en: "Qty" },
          required: true,
          min: 1,
          max: 100,
          integer: true,
          unit: "count",
          default: 1,
        },
      ],
    },
  ],
  constraints: [],
  pricing: {
    base: { priceKey: "mini.base.{size}", label: { en: "Base" } },
    modifiers: [
      {
        id: "logo",
        label: { en: "Logo" },
        priceKey: "mini.logo",
        scope: "unit",
        when: { option: "logo", eq: true },
      },
      { id: "extras", label: { en: "Extras" }, priceKey: "mini.extra.{extras}", scope: "unit" },
      {
        id: "per_station",
        label: { en: "Per station" },
        priceKey: "mini.station",
        scope: "line",
        multiplyBy: "stations",
      },
      { id: "install", label: { en: "Install" }, priceKey: "mini.install", scope: "line" },
    ],
    quantity: {
      option: "qty",
      tiers: [
        { minQty: 1, discountBps: 0 },
        { minQty: 5, discountBps: 1000 },
      ],
    },
    rangeBps: 1500,
    rounding: "half-even",
  },
};

const miniBook: PriceBook = PriceBookSchema.parse({
  id: "mini",
  name: "Mini test book",
  kind: "retail",
  placeholder: false,
  currencies: ["AUD", "GBP"],
  prices: {
    "mini.base.s": { AUD: 10_000, GBP: 5_000 },
    "mini.base.l": { AUD: 15_005, GBP: 7_500 },
    "mini.logo": { AUD: 2_000, GBP: 1_000 },
    "mini.extra.tag": { AUD: 500, GBP: 300 },
    "mini.extra.cover": { AUD: 1_500, GBP: 900 },
    "mini.station": { AUD: 3_000, GBP: 1_500 },
    "mini.install": { AUD: 20_000, GBP: 10_000 },
  },
});

describe("computePrice arithmetic (hand-checked)", () => {
  it("base × qty + unit modifiers, tier discount, then line modifiers", () => {
    const q = unwrap(
      computePrice(
        miniSchema,
        { size: "l", logo: true, extras: ["tag", "cover"], stations: 3, qty: 5 },
        miniBook,
        "AUD",
      ),
    );
    // unit: 15005 + 2000 + 500 + 1500 = 19005; × 5 = 95025; 10% = 9502.5 → 9502 (half-even); lines: 3×3000 + 20000
    expect(q.lines.map((l) => [l.id, l.priceKey, l.quantity, l.total.amount])).toEqual([
      ["base", "mini.base.l", 5, 75_025],
      ["logo", "mini.logo", 5, 10_000],
      ["extras", "mini.extra.cover", 5, 7_500],
      ["extras", "mini.extra.tag", 5, 2_500],
      ["quantity_discount", null, 1, -9_502],
      ["per_station", "mini.station", 3, 9_000],
      ["install", "mini.install", 1, 20_000],
    ]);
    expect(q.subtotal).toEqual({ amount: 95_025 - 9_502 + 29_000, currency: "AUD" });
    // ±15%: 114523 × 0.15 = 17178.45 → 17178
    expect(q.display).toEqual({
      kind: "range",
      low: { amount: 97_345, currency: "AUD" },
      high: { amount: 131_701, currency: "AUD" },
    });
    expect(q.placeholder).toBe(false);
  });
  it("shows an exact amount once the spec is locked or for pay-in-full products", () => {
    const sel = { size: "s" };
    expect(
      unwrap(computePrice(miniSchema, sel, miniBook, "GBP", { specLocked: true })).display,
    ).toEqual({ kind: "exact", amount: { amount: 5_000 + 1_500 + 10_000, currency: "GBP" } });
    expect(
      unwrap(computePrice({ ...miniSchema, paymentMode: "full" }, sel, miniBook, "GBP")).display
        .kind,
    ).toBe("exact");
  });
  it("skips multiplyBy lines when the multiplier is zero", () => {
    const q = unwrap(computePrice(miniSchema, { size: "s", stations: 0 }, miniBook, "AUD"));
    expect(q.lines.find((l) => l.id === "per_station")).toBeUndefined();
  });
  it("never converts currency: an unpriced currency is an error", () => {
    expect(computePrice(miniSchema, { size: "s" }, miniBook, "USD")).toMatchObject({
      ok: false,
      error: { type: "price_lookup", error: { type: "currency_not_supported" } },
    });
  });
  it("a missing price key is an error, not a silent zero", () => {
    const { "mini.base.l": _removed, ...prices } = miniBook.prices;
    const book = PriceBookSchema.parse({ ...miniBook, prices });
    expect(computePrice(miniSchema, { size: "l" }, book, "AUD")).toMatchObject({
      ok: false,
      error: { type: "price_lookup", error: { type: "unknown_price_key", key: "mini.base.l" } },
    });
  });
  it("refuses to price an invalid selection", () => {
    expect(computePrice(miniSchema, { size: "xl" }, miniBook, "AUD")).toMatchObject({
      ok: false,
      error: { type: "invalid_selection" },
    });
  });
});

describe("expandPriceKey", () => {
  it("substitutes values, uses 'none' for missing, fans out sorted arrays", () => {
    expect(expandPriceKey("a.{x}.{y}", { x: "one" })).toEqual(["a.one.none"]);
    expect(expandPriceKey("a.{x}", { x: ["b", "a"] })).toEqual(["a.a", "a.b"]);
    expect(expandPriceKey("a.{x}", { x: [] })).toEqual([]);
    expect(expandPriceKey("a.{x}", { x: false })).toEqual(["a.false"]);
  });
});

describe("seed pricing (placeholder data)", () => {
  it.each([
    ["bag", bagSchema, validBag],
    ["bag_wall", bagWallSchema, validWall],
    ["ring", ringSchema, validRing],
  ] as const)("%s prices in every currency and is flagged placeholder", (_n, schema, sel) => {
    for (const c of CURRENCIES) {
      const q = unwrap(computePrice(schema, sel, placeholderRetailPriceBook, c));
      expect(q.placeholder).toBe(true);
      expect(q.currency).toBe(c);
      expect(q.lines.every((l) => l.total.currency === c)).toBe(true);
    }
  });
  it("forced line items (engineer sign-off) are priced", () => {
    const q = unwrap(
      computePrice(
        bagWallSchema,
        { ...validWall, mount: "ceiling_track" },
        placeholderRetailPriceBook,
        "AUD",
      ),
    );
    expect(q.lines.some((l) => l.id === "engineer_signoff")).toBe(true);
  });
});

// ---- property-based invariants ----------------------------------------------------------------

const bagSelectionArb = fc.record(
  {
    bag_type: fc.constantFrom("heavy", "banana", "teardrop", "angle", "body", "double_end"),
    length: fc.constantFrom("ft3", "ft4", "ft5", "ft6", "ft7", "standard", "large"),
    fill: fc.constantFrom("filled", "unfilled"),
    fill_type: fc.constantFrom("shredded_textile", "textile_soft_top", "custom"),
    material: fc.constantFrom("vinyl", "leather", "canvas"),
    panel_layout: fc.constantFrom("single", "two_tone_vertical", "chequer", "custom_patchwork"),
    panel_colours: fc.array(fc.constantFrom("#000000", "#C8102E", "#FFFFFF"), {
      minLength: 1,
      maxLength: 6,
    }),
    branding_method: fc.constantFrom(
      "silicone_screen",
      "embroidered_patch",
      "leather_patch",
      "debossed_leather",
    ),
    placement: fc.constantFrom("front", "front_back", "wrap_360"),
    extra_text: fc.constantFrom("", "LEGENDS"),
    makers_mark: fc.boolean(),
    anchor_ring: fc.boolean(),
    hang: fc.constantFrom("four_point_swivel", "heavy_duty_swivel", "strap"),
    quantity: fc.integer({ min: 1, max: 999 }),
    extras: fc.subarray(["qr_tag", "protective_cover", "spare_chain_set"]),
  },
  { requiredKeys: ["bag_type", "panel_colours"] },
);

/** Random price book over the same keys: arbitrary non-negative prices per currency. */
const bookArb = fc
  .array(fc.integer({ min: 0, max: 10_000_000 }), {
    minLength: Object.keys(placeholderRetailPriceBook.prices).length,
    maxLength: Object.keys(placeholderRetailPriceBook.prices).length,
  })
  .map((amounts) =>
    PriceBookSchema.parse({
      ...placeholderRetailPriceBook,
      id: "random",
      prices: Object.fromEntries(
        Object.keys(placeholderRetailPriceBook.prices).map((k, i) => [
          k,
          Object.fromEntries(CURRENCIES.map((c) => [c, amounts[i] ?? 0])),
        ]),
      ),
    }),
  );

const currencyArb = fc.constantFrom<Currency>(...CURRENCIES);

describe("pricing invariants (property-based)", () => {
  it("price ≥ 0, subtotal = Σ lines, low ≤ subtotal ≤ high", () => {
    fc.assert(
      fc.property(bagSelectionArb, bookArb, currencyArb, (sel, book, currency) => {
        const r = computePrice(bagSchema, sel, book, currency);
        if (!r.ok) {
          expect(r.error.type).toBe("invalid_selection"); // only invalid selections may fail
          return;
        }
        const q = r.value;
        expect(q.subtotal.amount).toBeGreaterThanOrEqual(0);
        expect(q.lines.reduce((a, l) => a + l.total.amount, 0)).toBe(q.subtotal.amount);
        expect(q.lines.every((l) => l.kind === "discount" || l.total.amount >= 0)).toBe(true);
        if (q.display.kind === "range") {
          expect(q.display.low.amount).toBeGreaterThanOrEqual(0);
          expect(q.display.low.amount).toBeLessThanOrEqual(q.subtotal.amount);
          expect(q.display.high.amount).toBeGreaterThanOrEqual(q.subtotal.amount);
        }
      }),
      { numRuns: 300 },
    );
  });

  it("with tier discounts, the discount never exceeds the goods total", () => {
    const discounted: ProductConfiguration = {
      ...bagSchema,
      pricing: {
        ...bagSchema.pricing,
        quantity: {
          option: "quantity",
          tiers: [
            { minQty: 1, discountBps: 0 },
            { minQty: 2, discountBps: 2_500 },
            { minQty: 12, discountBps: 10_000 },
          ],
        },
      },
    };
    fc.assert(
      fc.property(bagSelectionArb, bookArb, currencyArb, (sel, book, currency) => {
        const r = computePrice(discounted, sel, book, currency);
        if (r.ok) expect(r.value.subtotal.amount).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 200 },
    );
  });

  it("server = canonical: the result depends only on (schema, selection, book, currency) and is deterministic", () => {
    fc.assert(
      fc.property(bagSelectionArb, currencyArb, (sel, currency) => {
        const a = computePrice(bagSchema, sel, placeholderRetailPriceBook, currency);
        const b = computePrice(
          bagSchema,
          structuredClone(sel),
          placeholderRetailPriceBook,
          currency,
        );
        expect(a).toEqual(b);
        // A client cannot smuggle its own price in: extra fields are rejected outright.
        const tampered = computePrice(
          bagSchema,
          { ...sel, subtotal: 1, price: { amount: 1, currency } },
          placeholderRetailPriceBook,
          currency,
        );
        expect(tampered.ok).toBe(false);
      }),
      { numRuns: 150 },
    );
  });

  it("order-independence: shuffling selection keys, multi-select order or modifier order never changes the total", () => {
    fc.assert(
      fc.property(
        bagSelectionArb,
        fc.infiniteStream(fc.nat()),
        currencyArb,
        (sel, rnd, currency) => {
          const it = rnd[Symbol.iterator]();
          const shuffle = <T>(xs: readonly T[]): T[] => {
            const out = [...xs];
            for (let i = out.length - 1; i > 0; i--) {
              const j = (it.next().value as number) % (i + 1);
              [out[i], out[j]] = [out[j]!, out[i]!];
            }
            return out;
          };
          const base = computePrice(bagSchema, sel, placeholderRetailPriceBook, currency);
          const shuffledSel = Object.fromEntries(
            shuffle(Object.entries(sel)).map(([k, v]) => [k, Array.isArray(v) ? shuffle(v) : v]),
          );
          const shuffledSchema: ProductConfiguration = {
            ...bagSchema,
            pricing: { ...bagSchema.pricing, modifiers: shuffle(bagSchema.pricing.modifiers) },
          };
          const other = computePrice(
            shuffledSchema,
            shuffledSel,
            placeholderRetailPriceBook,
            currency,
          );
          expect(other.ok).toBe(base.ok);
          if (base.ok && other.ok) {
            expect(other.value.subtotal).toEqual(base.value.subtotal);
            expect(other.value.display).toEqual(base.value.display);
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it("client preview equals server recompute for the same normalised selection", () => {
    fc.assert(
      fc.property(bagSelectionArb, currencyArb, (sel, currency) => {
        const v = validateSelection(bagSchema, sel);
        if (!v.ok) return;
        // The server re-validates the (already normalised) values it receives and must agree.
        const client = computePrice(bagSchema, sel, placeholderRetailPriceBook, currency);
        const server = computePrice(
          bagSchema,
          { ...v.selection.values },
          placeholderRetailPriceBook,
          currency,
        );
        expect(server.ok && client.ok).toBe(true);
        if (server.ok && client.ok) {
          expect(server.value.lines).toEqual(client.value.lines);
          expect(server.value.subtotal).toEqual(client.value.subtotal);
          expect(server.value.display).toEqual(client.value.display);
        }
      }),
      { numRuns: 150 },
    );
  });
});
