import "server-only";
import { z } from "zod";
import { BagConfigSchema, validateBagConfig, type BagConfig, type Validation } from "../configurator/schema";
import { bookFor, priceBag, type PriceResult } from "../configurator/pricing";
import { env, testPricesOn } from "../env";
import { CURRENCIES, type Currency } from "./money";

const Body = z.object({ config: BagConfigSchema, currency: z.enum(CURRENCIES) });

export type Evaluated =
  | { ok: false; status: 422; error: "invalid_body"; detail: string }
  | { ok: true; config: BagConfig; currency: Currency; validation: Validation; price: PriceResult };

/** The single server-side path from a browser's config to a validated, priced result. Nothing the browser says about price is trusted. */
export function evaluate(raw: unknown): Evaluated {
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return { ok: false, status: 422, error: "invalid_body", detail: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  const { config, currency } = parsed.data;
  const validation = validateBagConfig(config);
  const price = priceBag(config, bookFor(currency, testPricesOn(env())));
  return { ok: true, config, currency, validation, price };
}
