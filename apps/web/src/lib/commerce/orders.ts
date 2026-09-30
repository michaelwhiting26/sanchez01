import "server-only";
import { getDb } from "../db";
import type { BagConfig } from "../configurator/schema";
import type { Currency } from "./money";

/** The order state machine (CLAUDE.md): pending -> deposit_paid -> in_production -> qc -> balance_due -> paid -> shipped -> delivered. No skips, no going back. */
export const ORDER_STATES = ["pending", "deposit_paid", "in_production", "qc", "balance_due", "paid", "shipped", "delivered"] as const;
export type OrderStatus = (typeof ORDER_STATES)[number];

const NEXT: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  pending: ["deposit_paid"],
  deposit_paid: ["in_production"],
  in_production: ["qc"],
  qc: ["balance_due"],
  balance_due: ["paid"],
  paid: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus): boolean => NEXT[from].includes(to);

export interface Order {
  id: string;
  status: OrderStatus;
  /** The exact schema version and config the order was priced against. */
  schemaVersion: string;
  config: BagConfig;
  currency: Currency;
  book: "live" | "test";
  totalMinor: number;
  depositMinor: number;
  paymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
  history: Array<{ at: string; from: OrderStatus | null; to: OrderStatus; by: string }>;
}

export class InvalidTransition extends Error {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Invalid order transition ${from} -> ${to}`);
  }
}

/** Apply a transition, rejecting anything the state machine does not allow. Pure (returns a new order). */
export function transition(order: Order, to: OrderStatus, by: string, now = new Date()): Order {
  if (!canTransition(order.status, to)) throw new InvalidTransition(order.status, to);
  const at = now.toISOString();
  return { ...order, status: to, updatedAt: at, history: [...order.history, { at, from: order.status, to, by }] };
}

/** Where orders and processed webhook event ids live: Postgres. */
export interface OrderStore {
  create(order: Order): Promise<void>;
  get(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
  /** True if this payment event id was already processed (webhooks are retried). */
  hasEvent(id: string): Promise<boolean>;
  recordEvent(id: string): Promise<void>;
}

interface OrderRow extends Record<string, unknown> {
  id: string;
  status: OrderStatus;
  schema_version: string;
  config: BagConfig;
  currency: Currency;
  book: "live" | "test";
  total_minor: number | string;
  deposit_minor: number | string;
  payment_intent_id: string | null;
  history: Order["history"];
  created_at: string | Date;
  updated_at: string | Date;
}

const iso = (v: string | Date): string => new Date(v).toISOString();
const rowToOrder = (r: OrderRow): Order => ({
  id: r.id, status: r.status, schemaVersion: r.schema_version, config: r.config, currency: r.currency, book: r.book,
  totalMinor: Number(r.total_minor), depositMinor: Number(r.deposit_minor), paymentIntentId: r.payment_intent_id, history: r.history,
  createdAt: iso(r.created_at), updatedAt: iso(r.updated_at),
});

/** Orders and processed payment-event ids, in Postgres (see lib/db). */
class PgOrderStore implements OrderStore {
  async create(o: Order): Promise<void> {
    const db = await getDb();
    await db.query(
      `INSERT INTO orders (id, status, schema_version, config, currency, book, total_minor, deposit_minor, payment_intent_id, history, created_at, updated_at)
       VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7,$8,$9,$10::jsonb,$11,$12)`,
      [o.id, o.status, o.schemaVersion, JSON.stringify(o.config), o.currency, o.book, o.totalMinor, o.depositMinor, o.paymentIntentId, JSON.stringify(o.history), o.createdAt, o.updatedAt],
    );
  }
  async get(id: string): Promise<Order | null> {
    const db = await getDb();
    const rows = await db.query<OrderRow>("SELECT * FROM orders WHERE id = $1", [id]);
    return rows[0] ? rowToOrder(rows[0]) : null;
  }
  async save(o: Order): Promise<void> {
    const db = await getDb();
    await db.query("UPDATE orders SET status=$2, payment_intent_id=$3, history=$4::jsonb, updated_at=$5 WHERE id=$1", [o.id, o.status, o.paymentIntentId, JSON.stringify(o.history), o.updatedAt]);
  }
  async hasEvent(id: string): Promise<boolean> {
    const db = await getDb();
    return (await db.query("SELECT 1 FROM payment_events WHERE id = $1", [id])).length > 0;
  }
  async recordEvent(id: string): Promise<void> {
    const db = await getDb();
    await db.query("INSERT INTO payment_events (id) VALUES ($1) ON CONFLICT (id) DO NOTHING", [id]);
  }
}

let store: OrderStore | null = null;
export function getOrderStore(): OrderStore {
  return (store ??= new PgOrderStore());
}

/** A payment succeeded: move the order to deposit_paid exactly once, however many times the event is delivered. */
export async function applyDepositPaid(s: OrderStore, orderId: string, eventId: string): Promise<"applied" | "duplicate" | "unknown_order" | "ignored"> {
  if (await s.hasEvent(eventId)) return "duplicate";
  const order = await s.get(orderId);
  if (!order) return "unknown_order";
  if (order.status !== "pending") {
    await s.recordEvent(eventId);
    return "ignored";
  }
  await s.save(transition(order, "deposit_paid", `payment:${eventId}`));
  await s.recordEvent(eventId);
  return "applied";
}
