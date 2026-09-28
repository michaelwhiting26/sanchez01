import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  CURRENCIES,
  depositPolicyFromEnv,
  domainConfigFromEnv,
  money,
  splitDeposit,
  type Currency,
} from "./index";

describe("deposit policy from config", () => {
  it("fails loudly when DEPOSIT_PERCENT is not configured (business decision pending)", () => {
    expect(depositPolicyFromEnv({})).toEqual({
      ok: false,
      error: { type: "not_configured", variable: "DEPOSIT_PERCENT" },
    });
    expect(depositPolicyFromEnv({ DEPOSIT_PERCENT: "  " }).ok).toBe(false);
  });
  it.each(["0", "101", "abc", "30%", "33.333", "-5"])("rejects DEPOSIT_PERCENT=%s", (v) => {
    expect(depositPolicyFromEnv({ DEPOSIT_PERCENT: v })).toMatchObject({
      ok: false,
      error: { type: "invalid" },
    });
  });
  it("parses percent into basis points with default banker's rounding", () => {
    expect(depositPolicyFromEnv({ DEPOSIT_PERCENT: "30" })).toEqual({
      ok: true,
      value: { basisPoints: 3000, rounding: "half-even" },
    });
    expect(depositPolicyFromEnv({ DEPOSIT_PERCENT: "37.5", DEPOSIT_ROUNDING: "half-up" })).toEqual({
      ok: true,
      value: { basisPoints: 3750, rounding: "half-up" },
    });
    expect(depositPolicyFromEnv({ DEPOSIT_PERCENT: "50", DEPOSIT_ROUNDING: "up" }).ok).toBe(false);
  });
});

describe("splitDeposit", () => {
  it("splits with the configured rounding", () => {
    const s = splitDeposit(money(100_005, "AUD"), { basisPoints: 3000, rounding: "half-even" });
    expect(s.deposit.amount).toBe(30_002); // 30001.5 → 30002 (even)
    expect(s.balance.amount).toBe(70_003);
  });
  it("deposit + balance === total and both are non-negative (property)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1e11 }),
        fc.integer({ min: 1, max: 10_000 }),
        fc.constantFrom(...CURRENCIES),
        fc.constantFrom("half-even" as const, "half-up" as const),
        (amount, bps, c: Currency, rounding) => {
          const s = splitDeposit(money(amount, c), { basisPoints: bps, rounding });
          expect(s.deposit.amount + s.balance.amount).toBe(amount);
          expect(s.deposit.amount).toBeGreaterThanOrEqual(0);
          expect(s.balance.amount).toBeGreaterThanOrEqual(0);
          expect(s.deposit.currency).toBe(c);
        },
      ),
    );
  });
  it("100% deposit leaves no balance", () => {
    expect(
      splitDeposit(money(999, "GBP"), { basisPoints: 10_000, rounding: "half-up" }).balance.amount,
    ).toBe(0);
  });
});

describe("domain config", () => {
  it("defaults currency technically but validates the pair", () => {
    expect(domainConfigFromEnv({})).toMatchObject({ ok: true, value: { defaultCurrency: "AUD" } });
    expect(
      domainConfigFromEnv({ DEFAULT_CURRENCY: "GBP", ENABLED_CURRENCIES: "AUD, GBP" }),
    ).toEqual({
      ok: true,
      value: { defaultCurrency: "GBP", enabledCurrencies: ["AUD", "GBP"] },
    });
    expect(domainConfigFromEnv({ DEFAULT_CURRENCY: "USD", ENABLED_CURRENCIES: "AUD" }).ok).toBe(
      false,
    );
    expect(domainConfigFromEnv({ DEFAULT_CURRENCY: "EUR" }).ok).toBe(false);
    expect(domainConfigFromEnv({ ENABLED_CURRENCIES: "AUD,JPY" }).ok).toBe(false);
  });
});
