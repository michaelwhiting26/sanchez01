import { NextResponse } from "next/server";
import { z } from "zod";
import { applyDepositPaid, getOrderStore } from "@/lib/commerce/orders";
import { getPaymentProvider } from "@/lib/commerce/payments";
import { verifyOrderToken } from "@/lib/commerce/token";
import { demoMode, env } from "@/lib/env";

const DEV_SECRET = "dev-only-order-link-secret-not-for-production-0000";

/** Demo and development only: stands in for the Stripe webhook while payments are the mock provider. Not available on the real site or with real Stripe keys. */
export async function POST(req: Request): Promise<Response> {
  const e = env();
  if (!demoMode(e) || getPaymentProvider().mode !== "mock") return NextResponse.json({ error: "not_available" }, { status: 404 });
  const body = z.object({ token: z.string().min(10) }).safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "invalid_body" }, { status: 422 });
  const orderId = verifyOrderToken(body.data.token, e.ORDER_LINK_SECRET ?? DEV_SECRET);
  if (!orderId) return NextResponse.json({ error: "bad_token" }, { status: 403 });
  const result = await applyDepositPaid(getOrderStore(), orderId, `mock_evt_${orderId}`);
  return NextResponse.json({ result });
}
