# ADR 0004 — Configuration schema versioning

- **Status:** accepted
- **Date:** 2026-09-28

## Context

Products are data, not code (spec 04 §6.1). Jesse or Michael will add colours and options in the admin, and orders must keep what was actually bought (CLAUDE.md "Configs").

## Decision

- Every `ProductConfiguration` document has:
  - `format` — the **engine document format** (currently literal `1`). Bumped only when the schema shape changes in a way old engines cannot read. The Zod schema rejects unknown formats.
  - `id` + `version` — the **content revision** of that product's schema, semver:
    - PATCH: labels/translations only.
    - MINOR: additive (new choice, new optional option, new modifier).
    - MAJOR: removals/renames or rule changes that could invalidate saved configs.
- Documents are validated by `ProductConfigurationSchema`, including referential integrity (every option referenced by conditions, price templates, constraints and quantity exists; defaults are real choices; tiers ascend).
- `validateSelection` output (`NormalizedSelection`) records `schemaId` + `schemaVersion`; the spec-sheet builder and `createConfigSnapshot` refuse a mismatched version.
- **Orders snapshot the full schema document**, the normalised selection and the price quote (`ConfigSnapshot`), so an order can be re-validated, re-priced and re-printed after the live schema changes. Saved (unordered) configs store `schemaId@version` and are migrated or re-validated against the latest MINOR on load.
- Prices are **not** in the schema: schemas reference price keys (`bag.base.{bag_type}.{length}`), and price books supply per-currency amounts. Price changes therefore never require a schema version bump.

## Consequences

- The Payload `configSchemas` collection stores versions immutably (publish = new version).
- Migrations between MAJOR versions are explicit functions, written when first needed.
