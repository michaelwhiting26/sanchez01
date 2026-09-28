/** Domain-level configuration read from the environment. Validated with Zod; no silent defaults for business values. */
import { z } from "zod";
import { CurrencySchema, type Currency } from "./money";
import { err, ok, type Result } from "./result";

export const DomainEnvSchema = z.object({
  /** Fallback when geo gives no currency. Technical default only; launch currencies are a TODO(business). */
  DEFAULT_CURRENCY: CurrencySchema.default("AUD"),
  /** Comma-separated subset of AUD,AED,SGD,GBP,USD enabled for checkout. TODO(business): decide launch set. */
  ENABLED_CURRENCIES: z
    .string()
    .default("AUD,AED,SGD,GBP,USD")
    .transform((s) =>
      s
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    )
    .pipe(z.array(CurrencySchema).min(1)),
});

export interface DomainConfig {
  readonly defaultCurrency: Currency;
  readonly enabledCurrencies: readonly Currency[];
}

export function domainConfigFromEnv(
  env: Readonly<Record<string, string | undefined>>,
): Result<DomainConfig, z.ZodError> {
  const parsed = DomainEnvSchema.safeParse({
    DEFAULT_CURRENCY: env["DEFAULT_CURRENCY"] || undefined,
    ENABLED_CURRENCIES: env["ENABLED_CURRENCIES"] || undefined,
  });
  if (!parsed.success) return err(parsed.error);
  const { DEFAULT_CURRENCY, ENABLED_CURRENCIES } = parsed.data;
  if (!ENABLED_CURRENCIES.includes(DEFAULT_CURRENCY)) {
    return err(
      new z.ZodError([
        {
          code: "custom",
          path: ["DEFAULT_CURRENCY"],
          message: "DEFAULT_CURRENCY must be one of ENABLED_CURRENCIES",
          input: DEFAULT_CURRENCY,
        },
      ]),
    );
  }
  return ok({ defaultCurrency: DEFAULT_CURRENCY, enabledCurrencies: ENABLED_CURRENCIES });
}
