import { describe, expect, it } from "vitest";
import { getPrice, isSupportedCurrency, PriceBookSchema } from "./index";

const book = PriceBookSchema.parse({
  id: "test",
  name: "Test",
  kind: "retail",
  placeholder: true,
  currencies: ["AUD", "GBP"],
  prices: { "bag.base": { AUD: 1000, GBP: 500 } },
});

describe("price books", () => {
  it("returns the explicit per-currency price", () => {
    expect(getPrice(book, "bag.base", "GBP")).toEqual({
      ok: true,
      value: { amount: 500, currency: "GBP" },
    });
  });
  it("never converts: an unsupported currency is an error", () => {
    expect(getPrice(book, "bag.base", "USD")).toEqual({
      ok: false,
      error: { type: "currency_not_supported", priceBookId: "test", currency: "USD" },
    });
  });
  it("reports unknown keys (including prototype keys)", () => {
    expect(getPrice(book, "nope", "AUD").ok).toBe(false);
    expect(getPrice(book, "constructor", "AUD").ok).toBe(false);
  });
  it("rejects a book missing a declared currency for any entry", () => {
    const r = PriceBookSchema.safeParse({ ...book, prices: { "bag.base": { AUD: 1000 } } });
    expect(r.success).toBe(false);
  });
  it("rejects negative, fractional or float prices", () => {
    for (const bad of [-1, 10.5]) {
      expect(
        PriceBookSchema.safeParse({ ...book, prices: { k: { AUD: bad, GBP: 1 } } }).success,
      ).toBe(false);
    }
  });
  it("isSupportedCurrency", () => {
    expect(isSupportedCurrency("AED")).toBe(true);
    expect(isSupportedCurrency("EUR")).toBe(false);
  });
});
