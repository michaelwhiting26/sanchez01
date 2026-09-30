# Sanchez Custom Boxing: master engineering instructions

You are the principal engineer building the Sanchez Custom Boxing website as a **production-grade commercial system**, not a demo.

## Source of truth
- **`specs/04 Website build specification.md`** (primary). Read it fully before architectural decisions.
- Related:
  - `specs/01 Configurator specification.md` (option flows, validation rules, data model)
  - `specs/02 Gym lead engine specification.md`
  - `specs/03 Tech and strategy answers.md`
  - `specs/wix-scrape-README.md` (old site copy, quote-form fields) and `specs/wix-site_map.json` (old URLs, used for redirects)
- **Media (outside git, symlinked):**
  - `media-scrape/images/` (45 original images)
  - `media-scrape/videos/` (5 × 1080p, including the hero film of Jesse sewing)
  - `media-assets/` (logo `SANCHEZ LOGO.jpeg`, screenshots of the social posts, the configurator prototype image)

## Evidence rule (non-negotiable)
Do not invent any of these:
- reviews, ratings, stats, clients or testimonials
- prices or product specs
- legal claims

Missing data becomes a clearly marked **PLACEHOLDER** / TODO or a config value.

**Origin wording:** "Designed in Sydney. Handmade in Pattaya." Never "Australian made" or "Australian handmade".

Client logos and names (Wanderer, Opetaia, Wild Card, Titan, Team Reda…) must be marked "PLACEHOLDER — needs written consent" until confirmed.

## Execution order
1. **Milestone 1: HTML prototype** in `prototype/`: semantic HTML + CSS + minimal vanilla JS.
   - It is the visual source of truth for the production UI.
   - Build order:
     1. tokens, header and footer, then Home
     2. Product → Configure → Review → Checkout (deposit)
     3. Shop, Gym Fit-outs, Gym Builder, Workshop, About, Journal, Wholesale, Contact/FAQ
   - Show every state visibly: loading, empty, error, drawers, modals, sticky CTAs, hover and focus.
   - No real integrations. Mock Stripe, the DB, 3D and analytics visually.
   - Keep it openable by double-clicking (file://). Keep it separate from the production code.
2. **Then continue into production in `apps/web`** without waiting for approval between routine steps:
   - Foundation: monorepo, Next.js App Router, strict TypeScript, Tailwind with tokens ported from the prototype, Payload CMS 3, Postgres, env validation with Zod, next-intl (en, th, ar RTL, es), an analytics abstraction, a security baseline, CI.
   - Public pages, ported from the prototype as React Server Components.
   - Commerce: catalogue, variants, per-currency price books, cart, stock checkout, custom deposits, Stripe boundaries, webhooks, orders, emails.
   - Configurator foundation: versioned declarative schema (spec 01), Zod rules engine, server price recompute, persistence, 2D fallback, a 3D interface boundary.
   - Launch readiness: SEO, JSON-LD, sitemap, robots, redirects from the Wix URLs (placeholders, Jobs and Affiliate pages go 410 or 301), consent, Sentry, accessibility, Playwright, Lighthouse CI.
   - 3D showpieces (workshop splat, gym builder 3D) come **after** the launch path. They must never block it.

## Engineering rules
- Strict TypeScript. No `any` and no unexplained type assertions. Discriminated unions and a typed event catalogue.
- Server Components by default. `"use client"` only where interactive. Lazy-load the configurator, 3D, video and third-party code.
- **Never trust the client** for price, currency, availability, deposit, shipping, discounts, order state or config validity. The server recomputes.
- **Money:** integer minor units. Prices set explicitly per currency (AUD, AED, SGD, GBP, USD). No live FX at checkout. Geo suggests the currency; the user can change it and the choice persists.
- **Stripe:**
  - Elements / Express Checkout only; card data never touches our servers.
  - Signed, idempotent webhooks, with stored event IDs.
  - Payment truth comes only from verified webhooks, never from a redirect.
  - Order state machine: `pending → deposit_paid → in_production → qc → balance_due → paid → shipped → delivered`. Reject invalid transitions.
- **Unresolved business decisions stay as config/TODO:**
  - deposit %
  - refund policy
  - Gulf DDP vs DAP
  - launch locales and currencies
  - Payload hosting
  - authorised client logos
- **Configs:** schema versioned, and orders snapshot the exact schema version and config.
- **3D:** separate from domain logic. The rules engine runs without three.js. A 2D fallback always exists, and the canvas is never the only way to choose an option.
- **Mobile-first:** 375px baseline. The critical path, product → configure → review → deposit, is one-handed with a sticky price/action bar.
- **Performance budgets** (spec §6.4, §13):
  - LCP < 2.5s, INP < 200ms, CLS < 0.1
  - non-3D JS ≤ 170KB gz, 3D chunk ≤ 400KB gz
  - GLB ≤ 2.5MB desktop / 1.2MB mobile
- **Accessibility:** WCAG 2.2 AA, keyboard-operable, visible focus, reduced motion, captions.
- **Security:**
  - Zod on all inputs and Payload access control at the API level (roles: owner, editor, factory, admin).
  - CSP, HSTS, Referrer-Policy and Permissions-Policy headers.
  - Uploads: sniff the real MIME type, cap size, sanitise SVG, keep them private, leave a hook for a malware scan.
  - Order links use signed tokens. Rate-limit and add bot-protection hooks.
- **SEO:** metadata, canonical, hreflang/x-default, and JSON-LD only from real data (never aggregate ratings).
- **Tests:** unit tests for pricing (invariants: ≥ 0, server = canonical), rules, currency, order transitions and attribution. Playwright for the critical flows.
- **CI:** install → typecheck → lint → unit → build → Playwright → Lighthouse.
- **Design:** dark, premium workshop feel (leather, stitching), restrained motion, athletic type, strong product imagery. Not a generic Tailwind or SaaS template.

## Per-milestone loop
1. State the goal.
2. Inspect the code.
3. Make the smallest coherent change.
4. Validate, test and fix.
5. Summarise the changes and remaining TODOs.
6. Move on to the next milestone.

Stop only for credentials or business decisions. In that case add them to `.env.example` and a TODO, and keep going on unblocked work.

## Environment notes
- Repo at `~/Code/sanchez-web`, **not** in Dropbox (Dropbox can corrupt `.git`).
- pnpm isn't installed globally: use `npx pnpm@9` or npm workspaces.
- Node 24 is available.
- Never commit secrets or the large media. Commit messages end with the co-author line from the session instructions.

## Locked decisions
Read `docs/LOCKED-DECISIONS.md` before changing any home, build-flow or product-page behaviour. Do not undo a line there without the owner saying so; update the line when the owner changes their mind.
