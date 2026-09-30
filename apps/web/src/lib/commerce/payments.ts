import "server-only";
import Stripe from "stripe";
import { env, isRealStripeKey } from "../env";
import type { Currency } from "./money";

/**
 * The payment boundary. Everything the app needs from a payment provider is here, and nothing else touches Stripe.
 * With no real Stripe key the MOCK provider runs (so the funnel works end to end); add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET and
 * NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and the real provider takes over with no code change. Card data never touches our servers (Stripe Elements).
 */
export interface DepositIntent {
  readonly id: string;
  readonly clientSecret: string;
  readonly mode: "stripe" | "mock";
}

export interface PaymentEvent {
  readonly id: string;
  readonly type: string;
  readonly orderId: string | null;
}

export interface PaymentProvider {
  readonly mode: "stripe" | "mock";
  createDepositIntent(args: { orderId: string; amountMinor: number; currency: Currency; idempotencyKey: string }): Promise<DepositIntent>;
  /** Verify a webhook (signature) and return the event, or throw. */
  parseWebhook(rawBody: string, signature: string | null): Promise<PaymentEvent>;
}

const mock: PaymentProvider = {
  mode: "mock",
  createDepositIntent: ({ orderId }) => Promise.resolve({ id: `pi_mock_${orderId}`, clientSecret: `mock_secret_${orderId}`, mode: "mock" }),
  parseWebhook: () => Promise.reject(new Error("Mock payments have no webhook: use /api/checkout/mock-pay in development.")),
};

function stripeProvider(secret: string, webhookSecret: string | undefined): PaymentProvider {
  const stripe = new Stripe(secret);
  return {
    mode: "stripe",
    async createDepositIntent({ orderId, amountMinor, currency, idempotencyKey }) {
      const pi = await stripe.paymentIntents.create(
        { amount: amountMinor, currency: currency.toLowerCase(), automatic_payment_methods: { enabled: true }, metadata: { orderId } },
        { idempotencyKey },
      );
      if (!pi.client_secret) throw new Error("Stripe returned no client secret");
      return { id: pi.id, clientSecret: pi.client_secret, mode: "stripe" };
    },
    parseWebhook(rawBody, signature) {
      try {
        if (!webhookSecret || !signature) throw new Error("Missing webhook secret or signature");
        const ev = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret); // throws on a bad signature
        const obj = ev.data.object as { metadata?: { orderId?: string } };
        return Promise.resolve({ id: ev.id, type: ev.type, orderId: obj.metadata?.orderId ?? null });
      } catch (e) {
        return Promise.reject(e instanceof Error ? e : new Error("bad webhook"));
      }
    },
  };
}

export function getPaymentProvider(): PaymentProvider {
  const e = env();
  return isRealStripeKey(e.STRIPE_SECRET_KEY) ? stripeProvider(e.STRIPE_SECRET_KEY, e.STRIPE_WEBHOOK_SECRET) : mock;
}
