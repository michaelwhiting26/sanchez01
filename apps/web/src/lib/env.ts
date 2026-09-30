import "server-only";
import { z } from "zod";

const Schema = z.object({
  NODE_ENV: z.string().default("development"),
  DEPOSIT_PERCENT: z.coerce.number().gt(0).lte(100).optional(),
  DEPOSIT_ROUNDING: z.enum(["half-even", "half-up"]).default("half-even"),
  ORDER_LINK_SECRET: z.string().min(32).optional(),
  ORDER_LINK_TTL_DAYS: z.coerce.number().int().positive().default(180),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  /** Dev only: price with a synthetic book so the funnel can be exercised before real prices exist. Ignored in production. */
  TEST_PRICES: z.enum(["0", "1"]).default("0"),
  ALLOW_DEMO: z.enum(["0", "1"]).default("0"),
});

export type Env = z.infer<typeof Schema>;

export function env(): Env {
  return Schema.parse(process.env);
}

/** A key is "real" only if it looks like a Stripe key and is not the .env.example placeholder. */
export const isRealStripeKey = (k: string | undefined): k is string => Boolean(k && /^(sk|rk)_(test|live)_/.test(k) && !k.includes("placeholder"));
/**
 * Demo mode: development, or a deployment where ALLOW_DEMO=1 is set on purpose (a private preview before real prices, keys and a database exist).
 * In demo mode test prices, the mock deposit button and the built-in order-link secret are allowed. Never set ALLOW_DEMO on the real, public site.
 */
export const demoMode = (e: Env): boolean => e.NODE_ENV !== "production" || e.ALLOW_DEMO === "1";
export const testPricesOn = (e: Env): boolean => e.TEST_PRICES === "1" && demoMode(e);
