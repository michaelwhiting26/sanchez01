# Sanchez Custom Boxing — web monorepo

Production code for sanchezboxing (see `CLAUDE.md` and `specs/04 Website build specification.md`).
`prototype/` is the static HTML prototype (visual source of truth) and is **not** part of the workspace.

## Layout

| Path                    | What                                                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/domain`       | Money (integer minor units), price books, order state machine, deposit policy, attribution, signed order-link tokens (`@sanchez/domain/server`)                                                                                                  |
| `packages/config3d`     | Configurator rules engine: versioned declarative schema, `validateSelection`, `computePrice`, spec-01 §10 constraints, factory spec-sheet data, 3D material-slot types. No three.js. Seeds in `@sanchez/config3d/seeds` (**placeholder prices**) |
| `packages/analytics`    | Typed event catalogue (spec §11.1), consent-gated client/server trackers, PostHog/GA4/Meta CAPI/Google Ads adapters (no-op until wired), PII guards                                                                                              |
| `apps/web`              | Reserved for the Next.js + Payload app (not built yet)                                                                                                                                                                                           |
| `docs/decisions`        | ADRs                                                                                                                                                                                                                                             |
| `docs/TODO-business.md` | Open business decisions                                                                                                                                                                                                                          |

Packages ship TypeScript source (`exports` → `src/*.ts`); the Next.js app will transpile them
(`transpilePackages`). No build step is needed for tests or typechecking.

## Commands

```bash
npm install
npm run typecheck   # tsc per workspace (strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes)
npm run lint        # ESLint flat config, type-aware
npm test            # Vitest (+ fast-check property tests)
npm run format      # Prettier
npm run check       # typecheck + lint + test
```

## Package manager

npm workspaces are used because pnpm is not installed globally on the build machine. The spec
calls for pnpm; to switch later, add `pnpm-workspace.yaml` with the same globs
(`packages/*`, `apps/*`), change inter-package versions from `"*"` to `"workspace:*"`, delete
`package-lock.json`, and run `npx pnpm@9 install`.

## Environment

Copy `.env.example` to `.env.local`. Placeholders only; never commit secrets.
