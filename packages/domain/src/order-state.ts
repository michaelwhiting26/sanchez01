/**
 * Order state machine (spec 04 §7.2, CLAUDE.md). See docs/decisions/0003-order-state-machine.md.
 *
 *   pending → deposit_paid → in_production → qc → balance_due → paid → shipped → delivered
 *
 * Terminal branches:
 *   cancelled: allowed before the goods are paid in full (pending … balance_due).
 *   refunded:  allowed once money has been taken (deposit_paid … delivered).
 *
 * TODO(business): the refund policy for custom work is undecided (spec 04 §19.1). Whether a
 * cancellation after deposit keeps the deposit, is partly refunded, or must pass through `refunded`
 * is NOT modelled here; the cancelled/refunded edges are structural placeholders only.
 * TODO(business): a pay-in-full path for stock and simple bags (spec 01 §6) is not in the spec'd
 * machine and is intentionally absent until decided (see docs/TODO-business.md).
 */
import { z } from "zod";
import { err, ok, type Result } from "./result";

export const ORDER_STATUSES = [
  "pending",
  "deposit_paid",
  "in_production",
  "qc",
  "balance_due",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const OrderStatusSchema = z.enum(ORDER_STATUSES);

export const ORDER_TRANSITIONS = {
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
} as const satisfies Record<OrderStatus, readonly OrderStatus[]>;

/** The statuses reachable in one step from `S`, as a type. */
export type NextStatus<S extends OrderStatus> = (typeof ORDER_TRANSITIONS)[S][number];

export type TerminalStatus = {
  [S in OrderStatus]: (typeof ORDER_TRANSITIONS)[S] extends readonly [] ? S : never;
}[OrderStatus];

export const isTerminalStatus = (s: OrderStatus): s is TerminalStatus =>
  ORDER_TRANSITIONS[s].length === 0;

export const allowedTransitions = (from: OrderStatus): readonly OrderStatus[] =>
  ORDER_TRANSITIONS[from];

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return (ORDER_TRANSITIONS[from] as readonly OrderStatus[]).includes(to);
}

export type OrderTransitionError =
  | { readonly type: "terminal_state"; readonly from: TerminalStatus; readonly to: OrderStatus }
  | {
      readonly type: "invalid_transition";
      readonly from: OrderStatus;
      readonly to: OrderStatus;
      readonly allowed: readonly OrderStatus[];
    };

/** Runtime-checked transition, for untrusted input (webhooks, admin actions). */
export function transition(
  from: OrderStatus,
  to: OrderStatus,
): Result<OrderStatus, OrderTransitionError> {
  if (isTerminalStatus(from)) return err({ type: "terminal_state", from, to });
  if (!canTransition(from, to)) {
    return err({ type: "invalid_transition", from, to, allowed: ORDER_TRANSITIONS[from] });
  }
  return ok(to);
}

/** Compile-time-checked transition, for code paths where both states are statically known. */
export function transitionTo<S extends OrderStatus, T extends NextStatus<S>>(_from: S, to: T): T {
  return to;
}

export const ORDER_ACTORS = ["stripe_webhook", "admin", "factory", "system"] as const;
export type OrderActor = (typeof ORDER_ACTORS)[number];

export interface OrderStatusChange {
  readonly from: OrderStatus;
  readonly to: OrderStatus;
  readonly at: string;
  readonly actor: OrderActor;
  readonly reason?: string;
}

export interface OrderLifecycle {
  readonly status: OrderStatus;
  readonly history: readonly OrderStatusChange[];
}

/** Apply a transition and append an audit entry. Returns a new object; never mutates. */
export function applyTransition(
  order: OrderLifecycle,
  to: OrderStatus,
  meta: { readonly at: Date; readonly actor: OrderActor; readonly reason?: string },
): Result<OrderLifecycle, OrderTransitionError> {
  const r = transition(order.status, to);
  if (!r.ok) return r;
  const change: OrderStatusChange = {
    from: order.status,
    to,
    at: meta.at.toISOString(),
    actor: meta.actor,
    ...(meta.reason !== undefined ? { reason: meta.reason } : {}),
  };
  return ok({ status: to, history: [...order.history, change] });
}

export const OrderTransitionRequestSchema = z
  .object({
    from: OrderStatusSchema,
    to: OrderStatusSchema,
    actor: z.enum(ORDER_ACTORS),
    reason: z.string().max(500).optional(),
  })
  .strict();
