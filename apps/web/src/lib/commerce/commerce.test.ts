import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { depositMinor } from "./money";
import { applyDepositPaid, canTransition, ORDER_STATES, transition, InvalidTransition, type Order, type OrderStore } from "./orders";
import { signOrderToken, verifyOrderToken } from "./token";
import { DEFAULT_BAG, validateBagConfig, BagConfigSchema } from "../configurator/schema";
import { PRICE_BOOKS, priceBag, testBook } from "../configurator/pricing";

const order = (): Order => ({
  id: "o1", status: "pending", schemaVersion: "bag@1", config: DEFAULT_BAG, currency: "AUD", book: "test", totalMinor: 12000, depositMinor: 3600,
  paymentIntentId: null, createdAt: "t", updatedAt: "t", history: [],
});

function memStore(o: Order | null): OrderStore & { saved: Order | null } {
  const events = new Set<string>();
  const s = {
    saved: o,
    create: (x: Order) => { s.saved = x; return Promise.resolve(); },
    get: () => Promise.resolve(s.saved),
    save: (x: Order) => { s.saved = x; return Promise.resolve(); },
    hasEvent: (id: string) => Promise.resolve(events.has(id)),
    recordEvent: (id: string) => { events.add(id); return Promise.resolve(); },
  };
  return s;
}

describe("deposit", () => {
  it("is an integer within [0, total]", () => {
    for (const t of [0, 1, 999, 12345, 1_000_000]) for (const p of [1, 25, 30, 33.3, 100]) {
      const d = depositMinor(t, p);
      expect(Number.isInteger(d)).toBe(true);
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(t);
    }
  });
  it("rounds half-even and half-up as specified", () => {
    expect(depositMinor(5, 50, "half-even")).toBe(2); // 2.5 -> 2
    expect(depositMinor(7, 50, "half-even")).toBe(4); // 3.5 -> 4
    expect(depositMinor(5, 50, "half-up")).toBe(3);
  });
});

describe("order state machine", () => {
  it("only allows the next state", () => {
    ORDER_STATES.forEach((from, i) => ORDER_STATES.forEach((to, j) => expect(canTransition(from, to)).toBe(j === i + 1)));
  });
  it("rejects skips and reversals", () => {
    expect(() => transition(order(), "paid", "t")).toThrow(InvalidTransition);
    expect(transition(order(), "deposit_paid", "t").status).toBe("deposit_paid");
  });
});

describe("webhook idempotency", () => {
  it("applies a payment once however often the event is delivered", async () => {
    const s = memStore(order());
    expect(await applyDepositPaid(s, "o1", "evt_1")).toBe("applied");
    expect(await applyDepositPaid(s, "o1", "evt_1")).toBe("duplicate");
    expect(s.saved?.status).toBe("deposit_paid");
    expect(s.saved?.history.length).toBe(1);
  });
  it("ignores a second, different event once paid, and unknown orders", async () => {
    const s = memStore(order());
    await applyDepositPaid(s, "o1", "evt_1");
    expect(await applyDepositPaid(s, "o1", "evt_2")).toBe("ignored");
    expect(await applyDepositPaid(memStore(null), "x", "evt_9")).toBe("unknown_order");
  });
});

describe("order links", () => {
  const secret = "s".repeat(40);
  it("verify, expire and reject tampering", () => {
    const t = signOrderToken("o1", secret, 1, 1_000_000);
    expect(verifyOrderToken(t, secret, 1_000_000 + 1000)).toBe("o1");
    expect(verifyOrderToken(t, secret, 1_000_000 + 2 * 86400 * 1000)).toBeNull();
    expect(verifyOrderToken(t + "x", secret, 1_000_000)).toBeNull();
    expect(verifyOrderToken(t, "z".repeat(40), 1_000_000)).toBeNull();
  });
});

describe("rules", () => {
  it("accepts the default", () => expect(validateBagConfig(DEFAULT_BAG).ok).toBe(true));
  it("enforces leather palette, deboss and local fill", () => {
    const codes = (c: typeof DEFAULT_BAG) => validateBagConfig(c).issues.map((i) => i.code);
    expect(codes({ ...DEFAULT_BAG, material: "leather", bodyColour: "royal-blue" })).toContain("leather_colour");
    expect(codes({ ...DEFAULT_BAG, brandingMethod: "debossed" })).toContain("deboss_leather_only");
    expect(codes({ ...DEFAULT_BAG, fill: "filled", country: "TH" })).toContain("fill_local_only");
  });
  it("marks large quantities as quote, and rejects unknown keys", () => {
    expect(validateBagConfig({ ...DEFAULT_BAG, quantity: 120 }).quote).toBe(true);
    expect(BagConfigSchema.safeParse({ ...DEFAULT_BAG, price: 1 }).success).toBe(false);
  });
});

describe("pricing", () => {
  it("is unpriced while the live price book is empty (no invented prices)", () => {
    expect(priceBag(DEFAULT_BAG, PRICE_BOOKS.AUD).status).toBe("unpriced");
  });
  it("priced results are integer, non-negative, add up, and never get dearer per unit with quantity", () => {
    let prevUnit = Infinity;
    for (const q of [1, 2, 5, 6, 11, 12, 40]) {
      const r = priceBag({ ...DEFAULT_BAG, quantity: q, extras: ["qr-tag", "cover"] }, testBook("AUD"));
      if (r.status !== "priced") throw new Error("expected priced");
      expect(Number.isInteger(r.totalMinor)).toBe(true);
      expect(r.totalMinor).toBeGreaterThanOrEqual(0);
      expect(r.totalMinor).toBe(r.unitMinor * q);
      expect(r.unitMinor).toBeLessThanOrEqual(prevUnit);
      prevUnit = r.unitMinor;
    }
  });
  it("prices only from the config: every line is accounted for", () => {
    const r = priceBag({ ...DEFAULT_BAG, fill: "filled", makersMark: false, extras: ["spare-chain"] }, testBook("AUD"));
    if (r.status !== "priced") throw new Error("expected priced");
    expect(r.lines.map((l) => l.key)).toEqual(expect.arrayContaining(["base", "fill", "makers-mark", "extra-spare-chain"]));
  });
});
