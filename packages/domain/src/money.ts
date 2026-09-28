/**
 * Money is stored as an integer count of minor units (cents, fils, pence) plus an ISO 4217 currency.
 * Floats are never stored. Arithmetic that can produce fractions (percentages) goes through BigInt
 * rational arithmetic with an explicit rounding mode. See docs/decisions/0001 and 0002.
 */
import { z } from "zod";
import { err, ok, type Result } from "./result";

export const CURRENCIES = ["AUD", "AED", "SGD", "GBP", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const CurrencySchema = z.enum(CURRENCIES);

/** ISO 4217 minor-unit exponent per supported currency (all five are 2 today; kept explicit so a 0- or 3-decimal currency can be added safely). */
export const MINOR_UNIT_EXPONENT: Readonly<Record<Currency, number>> = {
  AUD: 2,
  AED: 2,
  SGD: 2,
  GBP: 2,
  USD: 2,
};

/**
 * Rounding modes:
 * - `half-even` (banker's rounding): ties go to the even neighbour. Default: unbiased across many lines.
 * - `half-up`: ties go away from zero (what most people expect on a single invoice line).
 */
export const ROUNDING_MODES = ["half-even", "half-up"] as const;
export type RoundingMode = (typeof ROUNDING_MODES)[number];
export const RoundingModeSchema = z.enum(ROUNDING_MODES);
export const DEFAULT_ROUNDING: RoundingMode = "half-even";

export interface Money {
  /** Integer minor units (e.g. 12345 = 123.45 AUD). Always a safe integer. */
  readonly amount: number;
  readonly currency: Currency;
}

export type MoneyErrorCode =
  | "non_integer_amount"
  | "unsafe_integer"
  | "currency_mismatch"
  | "invalid_quantity"
  | "invalid_percent";

export class MoneyError extends Error {
  override readonly name = "MoneyError";
  constructor(
    readonly code: MoneyErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export const MinorUnitsSchema = z
  .number()
  .int()
  .refine((n) => Number.isSafeInteger(n), { message: "amount must be a safe integer" });

export const MoneySchema = z
  .object({
    amount: MinorUnitsSchema,
    currency: CurrencySchema,
  })
  .strict();

function assertAmount(amount: number): void {
  if (!Number.isInteger(amount)) {
    throw new MoneyError(
      "non_integer_amount",
      `Money amount must be an integer of minor units, got ${amount}`,
    );
  }
  if (!Number.isSafeInteger(amount)) {
    throw new MoneyError("unsafe_integer", `Money amount ${amount} exceeds the safe integer range`);
  }
}

/** Construct Money from integer minor units. Throws MoneyError on a non-integer (programmer error). */
export function money(amount: number, currency: Currency): Money {
  assertAmount(amount);
  return Object.freeze({ amount: amount === 0 ? 0 : amount, currency });
}

export const zeroMoney = (currency: Currency): Money => money(0, currency);

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new MoneyError(
      "currency_mismatch",
      `Cannot combine ${a.currency} with ${b.currency}; there is no FX conversion`,
    );
  }
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount + b.amount, a.currency);
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount - b.amount, a.currency);
}

export function sumMoney(items: readonly Money[], currency: Currency): Money {
  return items.reduce((acc, m) => addMoney(acc, m), zeroMoney(currency));
}

/** Multiply by an integer quantity (quantities are always whole units). */
export function multiplyMoney(m: Money, quantity: number): Money {
  if (!Number.isSafeInteger(quantity)) {
    throw new MoneyError("invalid_quantity", `Quantity must be an integer, got ${quantity}`);
  }
  return money(m.amount * quantity, m.currency);
}

export const negateMoney = (m: Money): Money => money(-m.amount, m.currency);

export function compareMoney(a: Money, b: Money): -1 | 0 | 1 {
  assertSameCurrency(a, b);
  return a.amount < b.amount ? -1 : a.amount > b.amount ? 1 : 0;
}

export const moneyEquals = (a: Money, b: Money): boolean =>
  a.currency === b.currency && a.amount === b.amount;

/** Integer division of n by a positive d with an explicit rounding mode. Exact (BigInt). */
export function divideRounded(n: bigint, d: bigint, mode: RoundingMode): bigint {
  if (d <= 0n) throw new RangeError("divisor must be positive");
  const q = n / d; // truncates toward zero
  const r = n % d;
  if (r === 0n) return q;
  const sign = n < 0n ? -1n : 1n;
  const twiceRemainder = 2n * (r < 0n ? -r : r);
  if (twiceRemainder > d) return q + sign;
  if (twiceRemainder < d) return q;
  // exact tie
  if (mode === "half-up") return q + sign;
  return q % 2n === 0n ? q : q + sign;
}

/**
 * Convert a percentage (e.g. 30, 12.5, 33.33) to integer basis points. At most two decimal places
 * are accepted, so the value is exactly representable and no float error leaks into money.
 */
export function percentToBasisPoints(percent: number): number {
  if (!Number.isFinite(percent))
    throw new MoneyError("invalid_percent", `Percent must be finite, got ${percent}`);
  const bps = Math.round(percent * 100);
  if (Math.abs(bps - percent * 100) > 1e-6) {
    throw new MoneyError("invalid_percent", `Percent ${percent} has more than two decimal places`);
  }
  return bps;
}

/** `bps` basis points (1/100 of a percent) of `m`, rounded to a whole minor unit with `mode`. */
export function basisPointsOf(m: Money, bps: number, mode: RoundingMode): Money {
  if (!Number.isSafeInteger(bps))
    throw new MoneyError("invalid_percent", `Basis points must be an integer, got ${bps}`);
  const result = divideRounded(BigInt(m.amount) * BigInt(bps), 10_000n, mode);
  return money(Number(result), m.currency);
}

/** `percent`% of `m` (percent may have up to two decimals), rounded with `mode`. */
export function percentOf(m: Money, percent: number, mode: RoundingMode): Money {
  return basisPointsOf(m, percentToBasisPoints(percent), mode);
}

/** Exact decimal string of the amount in major units, e.g. 12345 AUD → "123.45". No floats involved. */
export function toDecimalString(m: Money): string {
  const exp = MINOR_UNIT_EXPONENT[m.currency];
  const negative = m.amount < 0;
  const digits = Math.abs(m.amount)
    .toString()
    .padStart(exp + 1, "0");
  const whole = digits.slice(0, digits.length - exp);
  const frac = exp > 0 ? `.${digits.slice(digits.length - exp)}` : "";
  return `${negative ? "-" : ""}${whole}${frac}`;
}

export type ParseMoneyError = {
  readonly type: "invalid_decimal";
  readonly input: string;
  readonly currency: Currency;
};

/** Parse a decimal string in major units ("123.45") into Money without float arithmetic. */
export function parseMoney(input: string, currency: Currency): Result<Money, ParseMoneyError> {
  const exp = MINOR_UNIT_EXPONENT[currency];
  const pattern = exp > 0 ? new RegExp(`^(-)?(\\d+)(?:\\.(\\d{1,${exp}}))?$`) : /^(-)?(\d+)$/;
  const match = pattern.exec(input.trim());
  if (!match) return err({ type: "invalid_decimal", input, currency });
  const [, sign, whole = "0", frac = ""] = match;
  const minor = BigInt(whole) * 10n ** BigInt(exp) + BigInt(frac.padEnd(exp, "0") || "0");
  const signed = sign ? -minor : minor;
  if (signed > BigInt(Number.MAX_SAFE_INTEGER) || signed < BigInt(Number.MIN_SAFE_INTEGER)) {
    return err({ type: "invalid_decimal", input, currency });
  }
  return ok(money(Number(signed), currency));
}

const formatterCache = new Map<string, Intl.NumberFormat>();

export interface FormatMoneyOptions {
  readonly currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
}

/**
 * Locale-aware display string via Intl.NumberFormat. The exact decimal string is passed to Intl
 * (supported since ES2023), so no float conversion happens even for very large amounts.
 */
export function formatMoney(m: Money, locale = "en-AU", options: FormatMoneyOptions = {}): string {
  const exp = MINOR_UNIT_EXPONENT[m.currency];
  const currencyDisplay = options.currencyDisplay ?? "symbol";
  const key = `${locale}|${m.currency}|${currencyDisplay}`;
  let fmt = formatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: m.currency,
      currencyDisplay,
      minimumFractionDigits: exp,
      maximumFractionDigits: exp,
    });
    formatterCache.set(key, fmt);
  }
  // Assertion is sound: toDecimalString only ever emits /^-?\d+(\.\d+)?$/, a valid numeric literal.
  return fmt.format(toDecimalString(m) as Intl.StringNumericLiteral);
}
