import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  addMoney,
  basisPointsOf,
  CURRENCIES,
  compareMoney,
  divideRounded,
  formatMoney,
  money,
  MoneyError,
  MoneySchema,
  multiplyMoney,
  parseMoney,
  percentOf,
  percentToBasisPoints,
  subtractMoney,
  sumMoney,
  toDecimalString,
  type Currency,
} from "./index";

const norm = (s: string): string => s.replace(/\s/g, " ");

describe("money construction", () => {
  it("accepts integer minor units", () => {
    expect(money(12345, "AUD")).toEqual({ amount: 12345, currency: "AUD" });
  });
  it.each([1.5, 0.1, Number.NaN, Infinity])("rejects non-integer %s", (n) => {
    expect(() => money(n, "AUD")).toThrow(MoneyError);
  });
  it("rejects unsafe integers", () => {
    expect(() => money(Number.MAX_SAFE_INTEGER + 1, "AUD")).toThrow(/safe integer|integer/);
  });
  it("normalises -0 to 0", () => {
    expect(Object.is(money(-0, "GBP").amount, 0)).toBe(true);
  });
  it("MoneySchema rejects floats and unknown currencies", () => {
    expect(MoneySchema.safeParse({ amount: 10.5, currency: "AUD" }).success).toBe(false);
    expect(MoneySchema.safeParse({ amount: 10, currency: "EUR" }).success).toBe(false);
    expect(MoneySchema.safeParse({ amount: 10, currency: "AED" }).success).toBe(true);
  });
});

describe("arithmetic", () => {
  it("adds and subtracts in the same currency", () => {
    expect(addMoney(money(1050, "SGD"), money(1, "SGD")).amount).toBe(1051);
    expect(subtractMoney(money(1050, "SGD"), money(2000, "SGD")).amount).toBe(-950);
  });
  it("refuses to mix currencies (no FX)", () => {
    expect(() => addMoney(money(1, "AUD"), money(1, "USD"))).toThrow(/no FX/);
    expect(() => compareMoney(money(1, "AUD"), money(1, "USD"))).toThrow(MoneyError);
  });
  it("multiplies by integer quantities only", () => {
    expect(multiplyMoney(money(1999, "GBP"), 12).amount).toBe(23988);
    expect(() => multiplyMoney(money(1999, "GBP"), 1.5)).toThrow(/Quantity/);
  });
  it("sums a list and handles the empty list", () => {
    expect(sumMoney([money(1, "USD"), money(2, "USD"), money(3, "USD")], "USD").amount).toBe(6);
    expect(sumMoney([], "USD").amount).toBe(0);
  });
  it("0.1 + 0.2 style float error cannot happen", () => {
    expect(addMoney(money(10, "AUD"), money(20, "AUD")).amount).toBe(30);
  });
  it("addition is commutative and associative (property)", () => {
    const amt = fc.integer({ min: -1e12, max: 1e12 });
    fc.assert(
      fc.property(amt, amt, amt, (a, b, c) => {
        const [x, y, z] = [money(a, "AUD"), money(b, "AUD"), money(c, "AUD")];
        expect(addMoney(x, y)).toEqual(addMoney(y, x));
        expect(addMoney(addMoney(x, y), z)).toEqual(addMoney(x, addMoney(y, z)));
      }),
    );
  });
});

describe("rounding", () => {
  it.each([
    // n, d, half-even, half-up
    [5n, 2n, 2n, 3n],
    [15n, 2n, 8n, 8n],
    [25n, 10n, 2n, 3n],
    [35n, 10n, 4n, 4n],
    [-5n, 2n, -2n, -3n],
    [-15n, 2n, -8n, -8n],
    [7n, 3n, 2n, 2n],
    [8n, 3n, 3n, 3n],
    [-8n, 3n, -3n, -3n],
    [10n, 5n, 2n, 2n],
  ])("divideRounded(%s, %s) = %s (half-even) / %s (half-up)", (n, d, even, up) => {
    expect(divideRounded(n, d, "half-even")).toBe(even);
    expect(divideRounded(n, d, "half-up")).toBe(up);
  });
  it("rejects a non-positive divisor", () => {
    expect(() => divideRounded(1n, 0n, "half-even")).toThrow(RangeError);
  });
  it("percentOf rounds ties per mode", () => {
    // 30% of 0.05 = 1.5 cents
    expect(percentOf(money(5, "AUD"), 30, "half-even").amount).toBe(2);
    expect(percentOf(money(5, "AUD"), 30, "half-up").amount).toBe(2);
    // 50% of 0.05 = 2.5 cents
    expect(percentOf(money(5, "AUD"), 50, "half-even").amount).toBe(2);
    expect(percentOf(money(5, "AUD"), 50, "half-up").amount).toBe(3);
    // 50% of 0.07 = 3.5 cents
    expect(percentOf(money(7, "AUD"), 50, "half-even").amount).toBe(4);
  });
  it("percentOf supports two-decimal percents exactly", () => {
    expect(percentToBasisPoints(12.5)).toBe(1250);
    expect(percentToBasisPoints(33.33)).toBe(3333);
    expect(() => percentToBasisPoints(33.333)).toThrow(/two decimal/);
    expect(() => percentToBasisPoints(Number.NaN)).toThrow(MoneyError);
    expect(percentOf(money(100_000, "USD"), 33.33, "half-even").amount).toBe(33_330);
  });
  it("basisPointsOf is exact for huge amounts (BigInt path)", () => {
    const big = money(Number.MAX_SAFE_INTEGER - 1, "USD"); // even
    expect(basisPointsOf(big, 5000, "half-even").amount).toBe((Number.MAX_SAFE_INTEGER - 1) / 2);
  });
  it("rounded percentage is within half a minor unit of the exact value (property)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1e10 }),
        fc.integer({ min: 0, max: 10_000 }),
        fc.constantFrom("half-even" as const, "half-up" as const),
        (a, bps, mode) => {
          const r = basisPointsOf(money(a, "GBP"), bps, mode).amount;
          const exactTimes10k = BigInt(a) * BigInt(bps);
          const diff = BigInt(r) * 10_000n - exactTimes10k;
          expect(diff <= 5_000n && diff >= -5_000n).toBe(true);
        },
      ),
    );
  });
});

describe("decimal strings and parsing", () => {
  it.each([
    [0, "0.00"],
    [5, "0.05"],
    [123, "1.23"],
    [-123, "-1.23"],
    [100000, "1000.00"],
  ])("toDecimalString(%s) = %s", (a, s) => {
    expect(toDecimalString(money(a, "AUD"))).toBe(s);
  });
  it("parses decimals without floats and round-trips", () => {
    const r = parseMoney("1234.5", "GBP");
    expect(r.ok && r.value.amount).toBe(123450);
    expect(parseMoney("-0.07", "GBP")).toEqual({
      ok: true,
      value: { amount: -7, currency: "GBP" },
    });
    for (const bad of ["1.234", "abc", "", "1e3", "1,000.00"])
      expect(parseMoney(bad, "GBP").ok).toBe(false);
    fc.assert(
      fc.property(
        fc.integer({ min: -1e12, max: 1e12 }),
        fc.constantFrom(...CURRENCIES),
        (a, c: Currency) => {
          const m = money(a, c);
          expect(parseMoney(toDecimalString(m), c)).toEqual({ ok: true, value: m });
        },
      ),
    );
  });
});

describe("formatMoney per currency", () => {
  it.each([
    ["en-AU", "AUD", 123456705, "$1,234,567.05"],
    ["en-AU", "USD", 123456705, "USD 1,234,567.05"],
    ["en-AE", "AED", 123456705, "AED 1,234,567.05"],
    ["en-SG", "SGD", 123456705, "$1,234,567.05"],
    ["en-GB", "GBP", 123456705, "£1,234,567.05"],
    ["en-US", "USD", 123456705, "$1,234,567.05"],
    ["en-GB", "GBP", -5, "-£0.05"],
    ["en-AU", "AUD", 0, "$0.00"],
  ] as const)("%s %s %s → %s", (locale, currency, amount, expected) => {
    expect(norm(formatMoney(money(amount, currency), locale))).toBe(expected);
  });
  it("supports code display and always shows the minor-unit digits", () => {
    expect(norm(formatMoney(money(100, "AED"), "en-AE", { currencyDisplay: "code" }))).toBe(
      "AED 1.00",
    );
    expect(formatMoney(money(1000, "AUD"))).toBe("$10.00");
  });
  it("formats Arabic locale output with the dirham symbol", () => {
    expect(formatMoney(money(100, "AED"), "ar-AE")).toContain("د.إ");
  });
  it("formats amounts beyond float precision exactly", () => {
    expect(norm(formatMoney(money(Number.MAX_SAFE_INTEGER, "USD"), "en-US"))).toBe(
      "$90,071,992,547,409.91",
    );
  });
});
