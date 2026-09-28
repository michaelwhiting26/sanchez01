/**
 * PLACEHOLDER — awaiting Jesse's price list.
 *
 * Every amount below is an arbitrary dummy value so the engine can be exercised end-to-end.
 * The SAME nominal number is used in every currency on purpose (it is obviously not an FX-consistent
 * price list). `placeholder: true` makes every PriceQuote carry `placeholder: true`, which UIs must
 * surface. NEVER present these figures as real prices.
 */
import {
  CURRENCIES,
  PriceBookSchema,
  type PerCurrencyPrices,
  type PriceBook,
} from "@sanchez/domain";
import { requiredPriceKeys } from "../pricing";
import { bagSchema } from "./bag";
import { bagWallSchema } from "./bag-wall";
import { ringSchema } from "./ring";

/** Dummy amount in minor units for a key. PLACEHOLDER — awaiting Jesse's price list. */
function placeholderAmount(key: string): number {
  if (/\.(none|false)(\.|$)/.test(key)) return 0;
  if (key.includes(".base.")) return 100_000; // 1,000.00 dummy
  if (key.startsWith("line.")) return 25_000; // 250.00 dummy
  return 5_000; // 50.00 dummy
}

const keys = [...new Set([bagSchema, bagWallSchema, ringSchema].flatMap(requiredPriceKeys))].sort();

const prices: Record<string, PerCurrencyPrices> = {};
for (const key of keys) {
  const amount = placeholderAmount(key);
  prices[key] = Object.fromEntries(CURRENCIES.map((c) => [c, amount]));
}

// PLACEHOLDER — awaiting Jesse's price list
export const placeholderRetailPriceBook: PriceBook = PriceBookSchema.parse({
  id: "placeholder_retail",
  name: "PLACEHOLDER retail (not real prices)",
  kind: "retail",
  placeholder: true,
  currencies: [...CURRENCIES],
  prices,
});
