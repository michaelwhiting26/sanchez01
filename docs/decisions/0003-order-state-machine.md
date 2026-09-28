# ADR 0003 — Order state machine

- **Status:** accepted (terminal branches provisional)
- **Date:** 2026-09-28

## Context

Spec 04 §7.2 / CLAUDE.md: `pending → deposit_paid → in_production → qc → balance_due → paid → shipped → delivered`, rejecting invalid transitions. Payment truth comes only from verified Stripe webhooks.

## Decision

- `ORDER_TRANSITIONS` (in `@sanchez/domain`) is the single table of allowed moves. `transition(from, to)` returns a typed `Result`; errors are `{type: "invalid_transition", from, to, allowed}` or `{type: "terminal_state", from, to}`.
- `transitionTo(from, to)` is compile-time checked for code paths where both states are static.
- `applyTransition` returns a new lifecycle with an audit entry `{from, to, at, actor, reason?}` (actors: `stripe_webhook`, `admin`, `factory`, `system`).
- **Terminal branches (provisional):**
  - `cancelled` — allowed from `pending`, `deposit_paid`, `in_production`, `qc`, `balance_due`.
  - `refunded` — allowed from any state after money was taken (`deposit_paid` … `delivered`).
  - Both are terminal.
- **Not modelled (TODO business):** refund policy for custom work (is a deposit retained on cancellation? partial refunds?), and a pay-in-full path for stock/simple bags (spec 01 §6). Stock orders cannot currently use this machine without a decision: either a separate stock machine or an added `pending → paid` edge.

## Consequences

- Webhook handlers call `transition` and treat an error as "ignore + log" (idempotent replay) or "alert" (out-of-order event).
- Changing the machine is a table edit plus the exhaustive test in `order-state.test.ts`, which enumerates all 100 (from, to) pairs against an independently written expectation.
