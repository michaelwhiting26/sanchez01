# ADR 0002 — Rounding mode

- **Status:** accepted
- **Date:** 2026-09-28

## Context

Percentages (deposits, quantity-tier discounts, the ±15% display range) produce fractional minor units that must round to whole cents/fils/pence.

## Decision

- All fractional money maths is done exactly (BigInt numerator/denominator) and then rounded **once** with an explicit `RoundingMode`:
  - `half-even` (banker's rounding): ties go to the even neighbour. **Default**, because it is unbiased when many lines are rounded (e.g. monthly revenue-share statements).
  - `half-up`: ties go away from zero. Available where a counterparty expects it.
- The mode is **never implicit**: `percentOf(money, pct, mode)` requires it; config schemas carry `pricing.rounding`; the deposit policy carries `rounding` (env `DEPOSIT_ROUNDING`, default `half-even`).
- Percentages are limited to two decimals (basis points) so they are exactly representable.
- Splits preserve totals: `splitDeposit` rounds the deposit and derives `balance = total − deposit`, so `deposit + balance === total` always (property-tested).

## Consequences

- Rounding differences between the client preview and the server cannot occur, because both run the same function.
- If the accountant requires a different rule for tax lines (Stripe Tax computes tax itself), add it as a new mode; do not round ad hoc.
