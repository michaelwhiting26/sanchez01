import { NextResponse } from "next/server";
import { applyDepositPaid, getOrderStore } from "@/lib/commerce/orders";
import { getPaymentProvider } from "@/lib/commerce/payments";

/**
 * Stripe's webhook. Payment truth comes only from here, verified by signature, never from a browser redirect. Events are idempotent by id (Stripe retries).
 * With the mock provider there is no webhook and this returns 404.
 */
export async function POST(req: Request): Promise<Response> {
  const provider = getPaymentProvider();
  if (provider.mode !== "stripe") return NextResponse.json({ error: "not_available" }, { status: 404 });
  const raw = await req.text();
  let event;
  try {
    event = await provider.parseWebhook(raw, req.headers.get("stripe-signature"));
  } catch {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }
  if (event.type === "payment_intent.succeeded" && event.orderId) {
    const result = await applyDepositPaid(getOrderStore(), event.orderId, event.id);
    return NextResponse.json({ received: true, result });
  }
  return NextResponse.json({ received: true });
}
