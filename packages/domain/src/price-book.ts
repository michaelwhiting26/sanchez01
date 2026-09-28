/**
 * Price books hold explicit prices per currency. There is deliberately no FX conversion anywhere:
 * a missing currency is an error, never a converted fallback.
 */
import { z } from "zod";
import { CURRENCIES, CurrencySchema, money, type Currency, type Money } from "./money";
import { err, ok, type Result } from "./result";

export const PriceKeySchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9][a-z0-9_.:-]*$/, { message: "price keys are lowercase dotted identifiers" });
export type PriceKey = z.infer<typeof PriceKeySchema>;

const NonNegativeMinorUnits = z
  .number()
  .int()
  .nonnegative()
  .refine((n) => Number.isSafeInteger(n), { message: "must be a safe integer" });

/** One price entry: integer minor units for each currency the book covers. */
export const PerCurrencyPricesSchema = z
  .object({
    AUD: NonNegativeMinorUnits.optional(),
    AED: NonNegativeMinorUnits.optional(),
    SGD: NonNegativeMinorUnits.optional(),
    GBP: NonNegativeMinorUnits.optional(),
    USD: NonNegativeMinorUnits.optional(),
  })
  .strict();
export type PerCurrencyPrices = z.infer<typeof PerCurrencyPricesSchema>;

export const PriceBookSchema = z
  .object({
    id: z.string().min(1).max(64),
    name: z.string().min(1).max(120),
    kind: z.enum(["retail", "wholesale"]),
    /** True while prices are not Jesse's real list. UIs must label placeholder prices as such. */
    placeholder: z.boolean(),
    currencies: z.array(CurrencySchema).min(1),
    prices: z.record(PriceKeySchema, PerCurrencyPricesSchema),
  })
  .strict()
  .superRefine((book, ctx) => {
    // Every entry must carry an explicit price for every currency the book claims to support.
    for (const [key, entry] of Object.entries(book.prices)) {
      for (const c of book.currencies) {
        if (entry[c] === undefined) {
          ctx.addIssue({
            code: "custom",
            path: ["prices", key, c],
            message: `missing explicit ${c} price for "${key}"`,
          });
        }
      }
    }
  });
export type PriceBook = z.infer<typeof PriceBookSchema>;

export type PriceLookupError =
  | {
      readonly type: "currency_not_supported";
      readonly priceBookId: string;
      readonly currency: Currency;
    }
  | { readonly type: "unknown_price_key"; readonly priceBookId: string; readonly key: string }
  | {
      readonly type: "missing_currency_price";
      readonly priceBookId: string;
      readonly key: string;
      readonly currency: Currency;
    };

export function getPrice(
  book: PriceBook,
  key: string,
  currency: Currency,
): Result<Money, PriceLookupError> {
  if (!book.currencies.includes(currency)) {
    return err({ type: "currency_not_supported", priceBookId: book.id, currency });
  }
  const entry = Object.hasOwn(book.prices, key) ? book.prices[key] : undefined;
  if (!entry) return err({ type: "unknown_price_key", priceBookId: book.id, key });
  const amount = entry[currency];
  if (amount === undefined)
    return err({ type: "missing_currency_price", priceBookId: book.id, key, currency });
  return ok(money(amount, currency));
}

export const isSupportedCurrency = (value: string): value is Currency =>
  (CURRENCIES as readonly string[]).includes(value);
