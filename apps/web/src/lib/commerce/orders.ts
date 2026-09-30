import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
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

/** Where orders and processed webhook event ids live. The default adapter is a JSON file for development; swap for the database (Payload / Postgres) before launch. */
export interface OrderStore {
  create(order: Order): Promise<void>;
  get(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
  /** True if this payment event id was already processed (webhooks are retried). */
  hasEvent(id: string): Promise<boolean>;
  recordEvent(id: string): Promise<void>;
}

interface Db {
  orders: Record<string, Order>;
  events: string[];
}

class FileOrderStore implements OrderStore {
  private readonly file = path.join(process.cwd(), ".data", "orders.json");
  private async read(): Promise<Db> {
    try {
      return JSON.parse(await fs.readFile(this.file, "utf8")) as Db;
    } catch {
      return { orders: {}, events: [] };
    }
  }
  private async write(db: Db): Promise<void> {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(db, null, 2));
  }
  async create(order: Order): Promise<void> {
    const db = await this.read();
    db.orders[order.id] = order;
    await this.write(db);
  }
  async get(id: string): Promise<Order | null> {
    return (await this.read()).orders[id] ?? null;
  }
  async save(order: Order): Promise<void> {
    const db = await this.read();
    db.orders[order.id] = order;
    await this.write(db);
  }
  async hasEvent(id: string): Promise<boolean> {
    return (await this.read()).events.includes(id);
  }
  async recordEvent(id: string): Promise<void> {
    const db = await this.read();
    if (!db.events.includes(id)) db.events.push(id);
    await this.write(db);
  }
}

let store: OrderStore | null = null;
export function getOrderStore(): OrderStore {
  return (store ??= new FileOrderStore());
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
