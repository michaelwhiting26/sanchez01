# ADR 0001 — Money representation

- **Status:** accepted
- **Date:** 2026-09-28

## Context

Five currencies (AUD, AED, SGD, GBP, USD) with prices set explicitly per currency and no live FX at checkout (spec 04 §7.2, CLAUDE.md). Prices are recomputed on the server and compared with Stripe amounts, which are integers in minor units.

## Decision

- `Money = { amount: number; currency: Currency }`, where `amount` is an **integer count of minor units** and always `Number.isSafeInteger` (±9.007×10^15 minor units is far above any order value).
- `MINOR_UNIT_EXPONENT` is explicit per currency (all 2 today), so a 0- or 3-decimal currency can be added without code changes elsewhere.
- Arithmetic: `addMoney`, `subtractMoney`, `sumMoney`, `multiplyMoney` (integer quantities only), `percentOf` / `basisPointsOf` (via BigInt, then an explicit rounding mode, see ADR 0002).
- Mixing currencies **throws** `MoneyError("currency_mismatch")`: there is no FX path anywhere.
- Price books store integer minor units per currency and **must** carry every currency they declare. A missing price is an error, never a converted or zero fallback.
- Display uses `Intl.NumberFormat`, fed the exact decimal string (ES2023), so formatting never goes through a float.
- Parsing admin/user input uses `parseMoney("123.45", currency)`, which is regex + BigInt, never `parseFloat`.

## Consequences

- Stored values (Postgres, Stripe metadata, analytics) are integers. JSONB order snapshots store `{amount, currency}`.
- `number` rather than `bigint` keeps JSON/Zod/Stripe interop trivial; the BigInt path is used only inside percentage maths.
