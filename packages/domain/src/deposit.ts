/**
 * Deposit policy is configuration, not code.
 * TODO(business): the deposit percentage is undecided (spec 04 §7.2 says "e.g. 30–50%", §19.1 open).
 * It is read from DEPOSIT_PERCENT; there is intentionally NO default, so an unset value fails loudly.
 */
import { z } from "zod";
import {
  percentToBasisPoints,
  basisPointsOf,
  RoundingModeSchema,
  subtractMoney,
  DEFAULT_ROUNDING,
  type Money,
  type RoundingMode,
} from "./money";
import { err, ok, type Result } from "./result";

export const PAYMENT_MODES = ["full", "deposit", "quote"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];
export const PaymentModeSchema = z.enum(PAYMENT_MODES);

export interface DepositPolicy {
  /** Deposit share in basis points (3000 = 30%). */
  readonly basisPoints: number;
  /** How the deposit is rounded to a whole minor unit. The balance absorbs the remainder. */
  readonly rounding: RoundingMode;
}

export type DepositConfigError =
  | { readonly type: "not_configured"; readonly variable: "DEPOSIT_PERCENT" }
  | {
      readonly type: "invalid";
      readonly variable: "DEPOSIT_PERCENT" | "DEPOSIT_ROUNDING";
      readonly message: string;
    };

const DepositPercentSchema = z
  .string()
  .trim()
  .regex(/^\d{1,3}(\.\d{1,2})?$/, {
    message: "DEPOSIT_PERCENT must be a number with at most two decimals",
  })
  .transform(Number)
  .refine((n) => n > 0 && n <= 100, { message: "DEPOSIT_PERCENT must be > 0 and <= 100" });

/** Read the deposit policy from environment-style config (e.g. process.env). */
export function depositPolicyFromEnv(
  env: Readonly<Record<string, string | undefined>>,
): Result<DepositPolicy, DepositConfigError> {
  const raw = env["DEPOSIT_PERCENT"];
  if (raw === undefined || raw.trim() === "")
    return err({ type: "not_configured", variable: "DEPOSIT_PERCENT" });
  const pct = DepositPercentSchema.safeParse(raw);
  if (!pct.success) {
    return err({
      type: "invalid",
      variable: "DEPOSIT_PERCENT",
      message: pct.error.issues[0]?.message ?? "invalid",
    });
  }
  const roundingRaw = env["DEPOSIT_ROUNDING"];
  let rounding: RoundingMode = DEFAULT_ROUNDING;
  if (roundingRaw !== undefined && roundingRaw.trim() !== "") {
    const r = RoundingModeSchema.safeParse(roundingRaw.trim());
    if (!r.success)
      return err({
        type: "invalid",
        variable: "DEPOSIT_ROUNDING",
        message: "must be half-even or half-up",
      });
    rounding = r.data;
  }
  return ok({ basisPoints: percentToBasisPoints(pct.data), rounding });
}

export interface DepositSplit {
  readonly total: Money;
  readonly deposit: Money;
  readonly balance: Money;
}

/** Split a total into deposit + balance. Invariant: deposit + balance === total, both >= 0 for total >= 0. */
export function splitDeposit(total: Money, policy: DepositPolicy): DepositSplit {
  const deposit = basisPointsOf(total, policy.basisPoints, policy.rounding);
  return { total, deposit, balance: subtractMoney(total, deposit) };
}
