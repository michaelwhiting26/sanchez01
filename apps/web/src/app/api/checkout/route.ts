import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { evaluate } from "@/lib/commerce/evaluate";
import { depositMinor } from "@/lib/commerce/money";
import { getOrderStore, type Order } from "@/lib/commerce/orders";
import { getPaymentProvider } from "@/lib/commerce/payments";
import { signOrderToken } from "@/lib/commerce/token";
import { demoMode, env, testPricesOn } from "@/lib/env";
import { SCHEMA_VERSION } from "@/lib/configurator/schema";

const DEV_SECRET = "dev-only-order-link-secret-not-for-production-0000";

/**
 * Start a checkout: validate and price the config on the server, create the order (status pending) with the exact schema version and config, and
 * open the deposit payment. Refuses unpriced orders, quotes and invalid configs. Never trusts a price from the browser.
 */
export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const r = evaluate(body);
  if (!r.ok) return NextResponse.json({ error: r.error, detail: r.detail }, { status: r.status });
  if (!r.validation.ok) return NextResponse.json({ error: "invalid_config", issues: r.validation.issues }, { status: 422 });
  if (r.validation.quote) return NextResponse.json({ error: "quote_required" }, { status: 409 });
  if (r.price.status !== "priced") return NextResponse.json({ error: "unpriced", detail: r.price.reason }, { status: 409 });

  const e = env();
  const percent = e.DEPOSIT_PERCENT ?? (testPricesOn(e) ? 30 : undefined); // dev fallback only alongside test prices; undecided in production (business TODO)
  if (!percent) return NextResponse.json({ error: "deposit_percent_unset" }, { status: 500 });
  const secret = e.ORDER_LINK_SECRET ?? (demoMode(e) ? DEV_SECRET : undefined);
  if (!secret) return NextResponse.json({ error: "order_link_secret_unset" }, { status: 500 });

  const total = r.price.totalMinor;
  const deposit = depositMinor(total, percent, e.DEPOSIT_ROUNDING);
  const id = randomUUID();
  const now = new Date().toISOString();
  const order: Order = {
    id,
    status: "pending",
    schemaVersion: SCHEMA_VERSION,
    config: r.config,
    currency: r.currency,
    book: r.price.book,
    totalMinor: total,
    depositMinor: deposit,
    paymentIntentId: null,
    createdAt: now,
    updatedAt: now,
    history: [{ at: now, from: null, to: "pending", by: "checkout" }],
  };
  const store = getOrderStore();
  await store.create(order);
  const provider = getPaymentProvider();
  const intent = await provider.createDepositIntent({ orderId: id, amountMinor: deposit, currency: r.currency, idempotencyKey: `deposit:${id}` });
  await store.save({ ...order, paymentIntentId: intent.id });
  const token = signOrderToken(id, secret, e.ORDER_LINK_TTL_DAYS);
  return NextResponse.json({ token, clientSecret: intent.clientSecret, mode: intent.mode, book: r.price.book, totalMinor: total, depositMinor: deposit, currency: r.currency }, { status: 201 });
}
