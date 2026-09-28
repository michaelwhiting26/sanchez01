import { describe, expect, it } from "vitest";
import {
  allowedTransitions,
  applyTransition,
  canTransition,
  isTerminalStatus,
  ORDER_STATUSES,
  OrderTransitionRequestSchema,
  transition,
  transitionTo,
  type OrderStatus,
} from "./index";

// Independent statement of the expected machine (spec 04 §7.2 + documented terminal branches).
const EXPECTED: Record<OrderStatus, OrderStatus[]> = {
  pending: ["deposit_paid", "cancelled"],
  deposit_paid: ["in_production", "cancelled", "refunded"],
  in_production: ["qc", "cancelled", "refunded"],
  qc: ["balance_due", "cancelled", "refunded"],
  balance_due: ["paid", "cancelled", "refunded"],
  paid: ["shipped", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

const pairs = ORDER_STATUSES.flatMap((from) => ORDER_STATUSES.map((to) => [from, to] as const));

describe("order state machine", () => {
  it.each(pairs)("%s → %s", (from, to) => {
    const valid = EXPECTED[from].includes(to);
    const r = transition(from, to);
    expect(r.ok).toBe(valid);
    expect(canTransition(from, to)).toBe(valid);
    if (!r.ok) {
      if (EXPECTED[from].length === 0)
        expect(r.error).toEqual({ type: "terminal_state", from, to });
      else
        expect(r.error).toEqual({ type: "invalid_transition", from, to, allowed: EXPECTED[from] });
    }
  });

  it("walks the full happy path", () => {
    const path: OrderStatus[] = [
      "pending",
      "deposit_paid",
      "in_production",
      "qc",
      "balance_due",
      "paid",
      "shipped",
      "delivered",
    ];
    for (let i = 1; i < path.length; i++) expect(transition(path[i - 1]!, path[i]!).ok).toBe(true);
  });

  it("identifies terminal states", () => {
    expect(ORDER_STATUSES.filter(isTerminalStatus)).toEqual(["cancelled", "refunded"]);
    expect(allowedTransitions("delivered")).toEqual(["refunded"]);
  });

  it("rejects skipping steps (payment truth cannot jump to shipped)", () => {
    expect(transition("pending", "shipped")).toMatchObject({
      ok: false,
      error: { type: "invalid_transition" },
    });
    expect(transition("deposit_paid", "paid").ok).toBe(false);
  });

  it("transitionTo is compile-time checked", () => {
    expect(transitionTo("pending", "deposit_paid")).toBe("deposit_paid");
    // @ts-expect-error pending cannot go straight to shipped
    transitionTo("pending", "shipped");
    // @ts-expect-error terminal states have no next status
    transitionTo("refunded", "pending");
  });

  it("applyTransition appends history immutably and rejects invalid moves", () => {
    const order = { status: "pending" as const, history: [] };
    const at = new Date("2026-09-28T10:00:00Z");
    const r = applyTransition(order, "deposit_paid", {
      at,
      actor: "stripe_webhook",
      reason: "pi_123 succeeded",
    });
    expect(r).toEqual({
      ok: true,
      value: {
        status: "deposit_paid",
        history: [
          {
            from: "pending",
            to: "deposit_paid",
            at: at.toISOString(),
            actor: "stripe_webhook",
            reason: "pi_123 succeeded",
          },
        ],
      },
    });
    expect(order.history).toHaveLength(0);
    expect(applyTransition(order, "delivered", { at, actor: "admin" }).ok).toBe(false);
  });

  it("validates transition requests from untrusted input", () => {
    expect(
      OrderTransitionRequestSchema.safeParse({ from: "pending", to: "paid", actor: "admin" })
        .success,
    ).toBe(true);
    expect(
      OrderTransitionRequestSchema.safeParse({ from: "pending", to: "teleported", actor: "admin" })
        .success,
    ).toBe(false);
    expect(
      OrderTransitionRequestSchema.safeParse({ from: "pending", to: "paid", actor: "customer" })
        .success,
    ).toBe(false);
  });
});
