import type { Currency } from "../commerce/money";
import { CURRENCIES } from "../commerce/money";
import type { BagConfig } from "./schema";

/**
 * Server-side pricing for the bag. The browser never decides a price: it sends a config, the server recomputes from the price book.
 * EVERY LIVE FIGURE IS NULL until Jesse supplies the price books (business TODO #23): a null price makes the order `unpriced`, and checkout refuses it.
 * `TEST_PRICES=1` (never in production) swaps in a clearly synthetic book so the whole funnel can be built and exercised without inventing real prices.
 */
export interface PriceBook {
  readonly book: "live" | "test";
  readonly currency: Currency;
  /** Per-bag base by length in ft (minor units), or null when not yet set. */
  readonly base: Readonly<Record<3 | 4 | 5, number | null>>;
  readonly material: Readonly<Record<"vinyl" | "leather" | "canvas", number | null>>;
  readonly layout: Readonly<Record<"single" | "split-vertical" | "bands" | "three-panel", number | null>>;
  readonly branding: Readonly<Record<"screen-print" | "embroidered-patch" | "leather-patch" | "debossed", number | null>>;
  readonly filled: number | null;
  readonly extras: Readonly<Record<"qr-tag" | "cover" | "spare-chain", number | null>>;
  readonly makersMarkRemoval: number | null;
  /** Quantity tier discounts, percent off the unit price: from qty -> percent. Must be non-decreasing. */
  readonly tiers: ReadonlyArray<{ readonly from: number; readonly pct: number }>;
}

const nulls = (currency: Currency): PriceBook => ({
  book: "live",
  currency,
  base: { 3: null, 4: null, 5: null },
  material: { vinyl: null, leather: null, canvas: null },
  layout: { single: null, "split-vertical": null, bands: null, "three-panel": null },
  branding: { "screen-print": null, "embroidered-patch": null, "leather-patch": null, debossed: null },
  filled: null,
  extras: { "qr-tag": null, cover: null, "spare-chain": null },
  makersMarkRemoval: null,
  tiers: [{ from: 1, pct: 0 }],
});

export const PRICE_BOOKS: Readonly<Record<Currency, PriceBook>> = Object.fromEntries(CURRENCIES.map((c) => [c, nulls(c)])) as Record<Currency, PriceBook>;

/** SYNTHETIC numbers, obviously round, for building and testing only. Never shown as real. */
export function testBook(currency: Currency): PriceBook {
  return {
    book: "test",
    currency,
    base: { 3: 10000, 4: 12000, 5: 14000 },
    material: { vinyl: 0, leather: 5000, canvas: -1000 },
    layout: { single: 0, "split-vertical": 500, bands: 500, "three-panel": 1000 },
    branding: { "screen-print": 0, "embroidered-patch": 1500, "leather-patch": 1500, debossed: 2000 },
    filled: 2000,
    extras: { "qr-tag": 300, cover: 1200, "spare-chain": 800 },
    makersMarkRemoval: 2500,
    tiers: [{ from: 1, pct: 0 }, { from: 2, pct: 5 }, { from: 6, pct: 10 }, { from: 12, pct: 15 }],
  };
}

export interface PriceLine {
  readonly key: string;
  readonly label: string;
  readonly unitMinor: number;
}

export type PriceResult =
  | { readonly status: "priced"; readonly book: "live" | "test"; readonly currency: Currency; readonly lines: readonly PriceLine[]; readonly unitMinor: number; readonly discountPct: number; readonly quantity: number; readonly totalMinor: number }
  | { readonly status: "unpriced"; readonly reason: string };

export function bookFor(currency: Currency, testPrices: boolean): PriceBook {
  return testPrices ? testBook(currency) : PRICE_BOOKS[currency];
}

/** Price a validated config. Returns `unpriced` if any figure it needs is null. Pure. */
export function priceBag(config: BagConfig, book: PriceBook): PriceResult {
  const lines: PriceLine[] = [];
  const need = (key: string, label: string, v: number | null): boolean => {
    if (v === null) return false;
    lines.push({ key, label, unitMinor: v });
    return true;
  };
  const ok =
    need("base", `Heavy bag, ${config.sizeFt}ft`, book.base[config.sizeFt]) &&
    need("material", `Material: ${config.material}`, book.material[config.material]) &&
    need("layout", `Layout: ${config.panelLayout}`, book.layout[config.panelLayout]) &&
    need("branding", `Branding: ${config.brandingMethod}`, book.branding[config.brandingMethod]) &&
    (config.fill !== "filled" || need("fill", "Filled", book.filled)) &&
    (config.makersMark || need("makers-mark", "Maker's mark removal", book.makersMarkRemoval)) &&
    config.extras.every((e) => need(`extra-${e}`, `Extra: ${e}`, book.extras[e]));
  if (!ok) return { status: "unpriced", reason: "Prices are not set yet." };
  const unit = Math.max(0, lines.reduce((a, l) => a + l.unitMinor, 0));
  let pct = 0;
  for (const t of book.tiers) if (config.quantity >= t.from) pct = t.pct;
  const discounted = Math.round((unit * (100 - pct)) / 100);
  return { status: "priced", book: book.book, currency: book.currency, lines, unitMinor: discounted, discountPct: pct, quantity: config.quantity, totalMinor: discounted * config.quantity };
}
