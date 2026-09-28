# Sanchez Custom Boxing: website build specification

**Version:** 0.1, 28 Sep 2026
**Author:** Michael Whiting
**Status:** draft for build

**Related:**
- 01 Configurator specification (product option flows)
- 02 Gym lead engine
- 03 Tech and strategy answers
- `scrape/` (archive of the old Wix site: content, images, 5 videos)

> **Evidence rule:** no invented reviews, stats, clients or testimonials. Client logos and names only with Jesse's written OK. All prices come from Jesse's price list, never guessed.

---

## 1. Goals and non-goals

### 1.1 Business goals
1. Replace the Wix site (login lost, placeholder products live, demo template pages indexed) with an owned, fast, premium site.
2. Turn visitors into **paid deposits and qualified quotes**. The primary conversion is a custom-order deposit or a fit-out quote.
3. Tell the story, **"Designed in Sydney. Handmade in Pattaya."**: the craftsman, the workshop, the fighters.
4. Sell **off-the-shelf stock** (country collections, standard bags, mitts, shin guards, apparel) in local currencies.
5. Track every interaction for conversion work and for revenue-share attribution.

### 1.2 Success measures (first 90 days after launch)

| Metric | Target |
|---|---|
| Mobile LCP (p75, 4G) | < 2.5 s |
| INP (p75) | < 200 ms |
| CLS | < 0.1 |
| Lighthouse mobile performance | ≥ 85 (pages without 3D) |
| Configurator start → deposit/quote | Baseline in month 1, then +20% |
| Organic clicks on non-brand terms | Tracked from week 1 (Search Console) |
| Uptime | 99.9% |

### 1.3 Not in v1
- Customer accounts (guest checkout only)
- A native app
- A marketplace
- Live chat staffed by humans (WhatsApp click-to-chat instead)
- AR try-on (v2 candidate)

---

## 2. Users and key journeys

| Persona | Journey | Primary conversion |
|---|---|---|
| **Gym owner** (new or refit) | Home → Fit-outs → case study → gym builder → quote | Fit-out quote (+ design deposit) |
| **Trainer / fighter** | Instagram → product → configurator (mitts, gloves, bag) → deposit | Custom-order deposit |
| **Fan / consumer** | Social or search → country collection or apparel → checkout | Order (Apple Pay) |
| **Distributor / franchise** | Wholesale page → B2B enquiry | B2B application |
| **Jesse (admin)** | Admin → orders, quotes, content, production status | Operations |

**Critical path** (must be flawless on mobile): product page → configurator → review → Apple Pay deposit, in under 90 seconds for a returning or decisive buyer.

---

## 3. Architecture

### 3.1 Stack (decision record)

| Layer | Choice | Reason / alternative |
|---|---|---|
| Framework | **Next.js (App Router), TypeScript, React Server Components** | SSR/ISR for SEO; the same stack as Legends Gym's site |
| 3D | **React Three Fiber + drei + three.js** | Mature, largest community. Alt: Babylon.js |
| Styling | Tailwind CSS + CSS variables (design tokens) | Speed and consistency |
| CMS / admin | **Payload CMS 3** (inside the Next.js app) | Open source, TypeScript, gives Jesse an admin. Alt: Sanity (hosted) |
| Database | **Postgres** (Neon or Supabase) | Payload adapter; orders and configs as JSONB |
| Payments | **Stripe**: Payment Element + Express Checkout Element (Apple Pay, Google Pay, Link), Stripe Tax | On-site checkout; deposits; multi-currency |
| Media | Images: Next/Image + Cloudflare R2 or Vercel Blob. Video: **Mux** (or Cloudflare Stream) with HLS | Adaptive streaming for hero and story videos |
| 3D assets | glTF/GLB, **Meshopt** or Draco, **KTX2** (Basis) textures, served from a CDN with immutable caching | Small, GPU-friendly |
| Scans | Gaussian splat (workshop) via Polycam/Luma export → `.splat`/`.spz` streamed with a web splat renderer | A virtual workshop without hand-modelling |
| i18n | **next-intl**, locale routes `/en /th /ar /es`, RTL for Arabic | SEO per language |
| Analytics | **PostHog** (events, funnels, replay, flags), Microsoft Clarity, GA4 | Detailed tracking + ad attribution |
| Ads attribution | Meta Conversions API + Google Ads enhanced conversions, sent server-side from Stripe webhooks | Accurate as browser tracking weakens |
| Consent | CMP (e.g. Cookiebot / Klaro, open source) with Google Consent Mode v2 | AU pixel rulings, UAE PDPL, GDPR |
| Email | Resend (transactional, React Email) + Klaviyo or Brevo (marketing) | |
| Search | Postgres full-text (v1) → Algolia/Meilisearch if the catalogue exceeds about 300 SKUs | |
| Hosting | **Vercel** (edge CDN, preview deploys) | Alt: Cloudflare Pages |
| Monitoring | Sentry (errors + performance), Vercel Analytics (Web Vitals), Better Stack uptime | |
| CI/CD | GitHub Actions: typecheck, lint, unit, Playwright end-to-end, Lighthouse CI budget gate → Vercel | |

### 3.2 How the pieces connect
```
Browser ──► Vercel Edge (CDN, middleware: locale, geo→currency, bot rules)
            │
            ├─ Next.js RSC pages (ISR) ──► Payload (content, products) ──► Postgres
            ├─ /configure (client island: R3F canvas, lazy)
            ├─ /api/checkout ──► Stripe (PaymentIntent / Checkout Session)
            ├─ /api/quote ──► Postgres + Resend + CRM webhook
            └─ /api/stripe/webhook ──► orders, production queue, CAPI/GA4 server events
Assets: GLB/KTX2/splat/images on CDN (immutable, hashed)   Video: Mux HLS
Analytics: PostHog (client + server), Clarity, GA4 via consent
```

### 3.3 Repository layout (monorepo, pnpm)
```
apps/web            Next.js + Payload
packages/config3d   configurator engine: schema, rules, pricing, R3F scene
packages/ui         design system (tokens, components)
packages/analytics  typed event catalogue + PostHog/GA4/CAPI adapters
assets-pipeline/    Blender exports → gltf-transform scripts (meshopt, ktx2, LOD)
e2e/                Playwright
```

---

## 4. Information architecture

```
/ (Home, story-led)
/workshop                 3D virtual workshop (desktop full; mobile = guided video)
/shop                     collections: Bags · Gloves · Mitts & Pads · Shin Guards · Apparel · Country Collections
/shop/[collection]/[product]
/configure/[productType]  bag · gloves · mitts · shin-guards · bag-wall · ring
/gym-fit-outs             service + gallery + case studies
/gym-fit-outs/[case-study]
/gym-builder              3D (desktop/tablet) · 2D planner (mobile)
/fighters                 ambassadors (with consent only)
/journal                  blog (events, builds, networking)
/wholesale                B2B application
/about  /contact  /faq  /shipping  /returns-warranty
/legal/terms  /legal/privacy  /legal/cookies
/order/[token]            "Watch it being made" tracker (no login; signed link)
/verify/[serial]          QR authenticity page
```
**Remove at migration:** placeholder products, the Jobs template pages and the "Affiliate Program" page. Put in 301 redirects for every old Wix URL (§14).

---

## 5. Design system and UX

- **Brand direction:** dark, premium workshop feel (leather, stitching, low-key light), from the existing hero film. Shield logo redrawn as SVG.
- **Typography:** one display face (condensed, athletic) + one text face. Self-hosted, `font-display: swap`, subset.
- **Tokens:** colour, spacing, radius, motion, all as CSS variables, with a light theme for admin only.
- **Mobile-first:** design at 375px first. Thumb-zone primary actions (sticky price + "Continue" bar in the configurator).
- **Motion:** respect `prefers-reduced-motion`. Scroll storytelling uses CSS/GSAP ScrollTrigger, and no scroll-jacking on mobile.
- **Accessibility (WCAG 2.2 AA):**
  - keyboard-operable configurator
  - every 3D choice is also a labelled HTML control (the canvas is never the only interface)
  - contrast ≥ 4.5:1
  - captions on all videos
- **States:** loading skeletons, empty states, error recovery ("Your design is saved, try again").

---

## 6. 3D subsystems

### 6.1 Product configurator (all products)
- **Rules engine** (`packages/config3d`):
  - A **declarative JSON schema** per product type: steps, options, constraints, price modifiers. Products are data, not code, so Jesse or Michael can add a colour or option in the admin.
  - The same schema drives the HTML controls, the 3D material swaps, pricing and the factory spec sheet.
  - Validation is shared between client and server, with Zod. **The server recomputes price. Never trust the client.**
- **Rendering:**
  - One GLB per product family, with named material slots (`panel_left`, `stitch`, `cap_top`, `logo_decal`…).
  - Colour and material changes are material parameter swaps, with no reloads.
  - Logo upload: the client does background removal (WASM) and vector/raster checks, then the logo is applied as a decal or texture.
- **Persistence:**
  - The config autosaves to localStorage and the server (anonymous `configId`).
  - The shareable URL encodes the config id ("send to my business partner").
- **Outputs:**
  - a PNG snapshot (canvas capture) for the cart/quote
  - the full config JSON
  - a factory spec PDF (server-rendered)
- **Fallback:** if WebGL is unavailable or the device is too weak, show a 2D layered-image configurator driven by the same schema.

### 6.2 Virtual workshop (storytelling)
- **Desktop:**
  - A Gaussian-splat scan of the real workshop, streamed progressively (low-detail first, then refined).
  - Guided camera "stations" (Cut → Stitch → Print → Fill → QC), each with a short film of Jesse (transparent-background WebM/HEVC, or a Mux clip) and product hotspots.
- **Mobile:** the same story as a scroll-driven guided video with hotspots. The splat is off by default, and there's an "Explore in 3D" opt-in with a data warning.
- **Budget:** first station interactive in under 4 s on desktop broadband. Splat under 25 MB for the initial level of detail.

### 6.3 Gym builder
- **Desktop and tablet:**
  - A room box (length, width, height from the form).
  - Drag-and-drop catalogue items (ring sizes, bag stations, racks, mats, speed-bag platforms) on a snap grid.
  - Live dimensions and **clearance checks** (ring + apron + 1 m, bag spacing, ceiling height vs bag length).
  - Instanced meshes for repeated bags.
- **Mobile:** a 2D planner (SVG) with the same data model, plus "Email me the 3D link".
- **Output:**
  - a layout JSON
  - a top-down plan PNG/PDF
  - a bill of materials
  - an indicative price range
  - which then creates a fit-out quote in the CRM
- **Stretch (v2):** upload a room photo → an AI "after" render (image-generation API), queued, delivered by email.

### 6.4 3D performance budgets (enforced in CI via gltf-transform inspect + Lighthouse)

| Asset | Budget |
|---|---|
| Product GLB (compressed) | ≤ 2.5 MB desktop, ≤ 1.2 MB mobile LOD |
| Textures | KTX2, ≤ 2048² desktop / 1024² mobile |
| Draw calls (configurator) | ≤ 50 |
| Gym builder triangles | ≤ 500k with instancing |
| Initial JS (non-3D pages) | ≤ 170 KB gzipped |
| 3D chunk | Lazy, ≤ 400 KB gzipped, loaded after first paint or on intent (hover/tap "Customise") |

**Techniques:**
- lighting baked into textures (no live shadows on mobile)
- PMREM environment map
- `frameloop="demand"` (render only on change)
- devicePixelRatio capped at 1.5 on mobile
- adaptive quality via `PerformanceMonitor`
- tiered by GPU using `detect-gpu`
- preload on hover
- Suspense with a poster image (no layout shift)

---

## 7. Commerce

### 7.1 Catalogue model (Payload collections)
- `products`: type, collection(s), variants, base prices **per currency**, SKU, weight/dimensions (shipping), lead time, stock flag, 3D asset reference, config schema reference, SEO fields and translations.
- `collections`, `countryCollections` (flag and region metadata).
- `configSchemas` (versioned JSON; orders reference the version used).
- `priceBooks`: retail, wholesale tiers, per currency.

### 7.2 Checkout flows

| Flow | Mechanism |
|---|---|
| Stock items | Cart → Stripe Payment Element + **Express Checkout (Apple Pay/Google Pay)** on product and cart pages |
| Custom items | Config → review → **deposit PaymentIntent** (e.g. 30–50%). Balance invoiced before dispatch (Stripe Invoice / payment link) |
| Fit-outs | Quote → Michael/Jesse send a proposal → design deposit via a Stripe payment link |
| B2B | Application → approval → wholesale price book → invoice terms (net 14/30) via Stripe Invoicing |

- **Multi-currency:** AUD, AED, SGD, GBP, USD. The currency comes from the geo header, can be changed by the user, and is persisted. Prices are set explicitly per currency, never converted live at checkout.
- **Tax:**
  - Stripe Tax registrations, as advised by the accountant (AU GST, UAE VAT, UK VAT if thresholds are met).
  - Duties shown as a note for Gulf destinations (DDP vs DAP decided with Jesse).
- **Shipping:**
  - Rate tables by zone and weight (heavy bags ship unfilled by default for export).
  - Live carrier rates in v2.
- **Apple Pay:** domain verification file served from `/.well-known/`.
- **Fraud:** Stripe Radar with rules for high-value custom orders (3DS enforced above a threshold).
- **Webhooks:** idempotent handler; events stored in the `stripe_events` table. The order state machine is `pending → deposit_paid → in_production → qc → balance_due → paid → shipped → delivered`.

### 7.3 Production and "watch it being made"
- Each order line creates **production tasks** (cut, sew, print, fill, QC) in the admin.
- Workers or Jesse upload a photo per stage from a phone (the Payload admin is mobile-friendly, with a Thai language option for factory staff).
- The customer's `/order/[token]` page shows the timeline and photos (signed, unguessable token).
- The QR serial is assigned at QC and printed on a woven or printed label; `/verify/[serial]` shows the product, maker, date, care and a reorder link.

---

## 8. Content and CMS (Payload)

**Collections:**
- pages (block-based builder: hero, story, video, gallery, logos, CTA, FAQ)
- products
- caseStudies (gym, location, photos/3D scan, items fitted, quote from the client **only with consent**)
- fighters (with a consent record)
- journal posts
- FAQs
- legal pages
- redirects
- translations

**Other requirements:**
- **Roles:**
  - `owner` (Jesse): everything except code settings
  - `editor`: content
  - `factory`: production tasks and photos only
  - `admin` (Michael)
- **Drafts, preview and scheduled publish.** Every change is versioned.
- **Media:** automatic WebP/AVIF, focal point, alt text required.

---

## 9. Internationalisation

- next-intl with locales: `en` (default), `th`, `ar` (RTL), `es`. Also `en-AU` / `en-GB` spelling variants if needed.
- Routes per locale with `hreflang` alternates and x-default.
- Content fields are localised in Payload. Machine translation first (DeepL/Claude), then native review for product, checkout and legal text.
- RTL: CSS logical properties everywhere (`margin-inline-start`), with a mirrored UI tested for Arabic.
- Numbers, currency and dates via `Intl`.

---

## 10. SEO and GEO (AI search)

- SSR/ISR on every indexable page, clean URLs, canonical tags, XML sitemaps per locale, robots rules (block `/order`, `/verify`, `/configure?*`).
- **Structured data (JSON-LD):**
  - `Organization` (with sameAs: Instagram, Facebook, LinkedIn, Legends Gym)
  - `Product` + `Offer` (price per currency)
  - `BreadcrumbList`, `FAQPage`, `Article`, `LocalBusiness` (if a showroom exists)
  - `VideoObject` for the films
- **Entity clarity (GEO):**
  - Consistent name "Sanchez Custom Boxing", with a founder page for Jesse Sanchez.
  - An "About / facts" page with verifiable facts (founded, location, makers, materials, clients with permission).
  - `llms.txt`.
  - Reduces confusion with S4NCH3Z, BOXRAW "Sanchez" and the US Sanchez gyms.
- **Keyword strategy:** long-tail and local ("custom boxing bags Australia", "boxing gym fit out Sydney/Dubai", "custom boxing mitts", "Muay Thai shin guards handmade Thailand"), not the bare "Sanchez boxing".
- Old Wix URLs are 301-redirected. Google Search Console + Bing Webmaster set up at launch.

---

## 11. Analytics and tracking

### 11.1 Event catalogue (typed, in `packages/analytics`)

| Event | Key properties |
|---|---|
| `page_viewed` | locale, currency, referrer, utm_* |
| `story_station_viewed` | station, dwell_ms |
| `video_progress` | video_id, 25/50/75/100 |
| `config_started` | product_type, entry_point |
| `config_option_changed` | step, option, value, time_on_step_ms |
| `config_logo_uploaded` | file_type, width, height, bg_removed |
| `config_step_completed` / `config_abandoned` | step, config_id |
| `config_shared` | channel |
| `price_viewed` | low, high, currency |
| `gym_builder_item_added` | item, count, clearance_warning |
| `quote_submitted` | type, value_band, country |
| `checkout_started` | cart_value, currency, payment_mode (full/deposit) |
| `express_pay_clicked` | wallet (apple/google/link) |
| `order_paid` (server) | order_id, value, currency, attribution |
| `ambassador_code_used` (server) | code, value |

### 11.2 Stack and data rules
- **PostHog:**
  - client and server SDKs
  - session replay with input masking (no card or personal data)
  - funnels (config → deposit)
  - feature flags / A/B tests for price display and CTA copy
- **Clarity:** secondary heatmaps.
- **GA4 + Meta CAPI + Google enhanced conversions:** server-side from the Stripe webhook, with a hashed email and an event_id for deduplication.
- **Consent:** nothing loads before consent where it's required. Consent Mode v2 signals. A regional policy (opt-in for the EU, UK and UAE; AU opt-in recommended).
- **Attribution for the revenue share:**
  - Every order stores first and last touch (UTM, referrer, click IDs, ambassador code).
  - A monthly revenue statement is generated from Postgres and reconciled with Stripe.

---

## 12. Security, privacy and compliance

- OWASP ASVS L1 baseline. All inputs validated with Zod server-side. Payload access control on every collection.
- **Payments:** Stripe Elements only, so card data never touches our servers (PCI SAQ-A).
- **Uploads:**
  - logos go to a private bucket, with type sniffing, a size cap (20 MB) and malware scanning (ClamAV worker or a vendor)
  - SVGs sanitised (DOMPurify server-side) before any render
- **Auth (admin):** Payload auth with MFA (TOTP), rate limiting, and IP allow-listing optional.
- **Headers:** CSP (nonce-based), HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- **Bot protection:** Cloudflare Turnstile on quote and wholesale forms, with rate limits on `/api/*`.
- **Secrets:** Vercel env vars, rotated, never in the repo. Dependabot + `pnpm audit` in CI.
- **Backups:**
  - Postgres point-in-time recovery (7–30 days) + a nightly logical dump to separate storage
  - media bucket versioning
- **Privacy:**
  - privacy policy (AU Privacy Act, UAE PDPL, GDPR)
  - data retention policy (quotes 24 months, analytics 12 months)
  - a data-subject request process
  - email opt-in with double opt-in for marketing
- **Legal copy:**
  - no "Australian made" claims
  - the origin statement on every product page
  - warranty and returns in line with Australian Consumer Law (consumer guarantees cannot be excluded)

---

## 13. Performance plan (mobile-first)

- RSC by default, and client components only where interactive. The 3D, video and heavy widgets are **islands**, lazy-loaded.
- Images: AVIF/WebP, `sizes`, and a blur placeholder. The hero uses a Mux poster + HLS at a low starting bitrate, with autoplay muted only on capable connections (`navigator.connection.saveData` respected).
- Fonts: 2 families max, subset, preloaded.
- Third-party scripts: loaded after consent with `next/script` `lazyOnload`. Budget ≤ 3 third-party origins before interaction.
- Edge caching: ISR revalidate on CMS publish (webhook). Product pages are static and regenerated on change.
- Lighthouse CI budgets fail the build if exceeded. Real-user Web Vitals are monitored per page and device class.

---

## 14. Migration from Wix

1. **Content:** use the `scrape/` archive (pages text, 45 images at original resolution, 5 videos at 1080p).
2. **Redirect map:** every URL in `scrape/site_map.json` gets a 301 to its new equivalent or the nearest page. The placeholder product, Jobs and Affiliate pages go 410 (gone) or 301 to /shop.
3. **Domain:**
   - Recover the registrar access for `sanchezboxing.com.au` (.au rules: the registrant must have an ABN/ACN).
   - Lower the DNS TTL 48 h before cutover, then cut over, then verify SSL.
   - Keep MX records untouched if email exists.
4. **Wix:** attempt account recovery (Wix support, with proof of domain ownership) so the site can be cancelled cleanly and the domain transferred if Wix is the registrar.
5. **Search:** submit the new sitemap, then monitor Search Console coverage and 404s for 4 weeks.

---

## 15. Quality assurance

- **Unit:** the rules engine, pricing (property-based tests: price is never negative, server = client), and currency formatting.
- **End-to-end (Playwright):**
  - config → deposit in each currency
  - Apple Pay in test mode
  - the quote form
  - the locale switch (including RTL)
  - the gym-builder clearance rules
  - a 404 and redirect sweep
- **Device matrix:** iPhone SE/13/15, a mid-range Android (e.g. Galaxy A-series), iPad, Chrome/Safari/Firefox desktop, and throttled 4G.
- **Accessibility:** axe in CI + a manual keyboard and screen-reader pass (VoiceOver).
- **Load:** k6 smoke on checkout and quote APIs (100 concurrent users).
- **Content QA:** every claim checked against the evidence rule, and origin wording checked on every product page.

---

## 16. Delivery plan

| Phase | Weeks | Scope | Exit criteria |
|---|---|---|---|
| 0: Discovery | 1 | Answers to "Questions for Jesse", price list, specs, asset access, brand redraw | Signed scope + price list received |
| 1: Foundation | 2–3 | Repo, design system, Payload, i18n scaffold, analytics + consent, the story Home, About, Fit-outs, Journal, legal, redirects | Staging site passes budgets |
| 2: Commerce | 2 | Catalogue, cart, Stripe (full + deposit), tax, shipping, emails, order state machine | Test orders end to end in 5 currencies |
| 3: Configurator v1 | 3 | Bag + mitts in 3D, logo upload, spec PDF, 2D fallback | Deposit from configurator on mobile < 90 s |
| 4: Launch | 1 | Migration, DNS cutover, Search Console, monitoring | Live, 0 critical bugs, Web Vitals green |
| 5: Workshop world | 2–3 | Splat scan, stations, films | Desktop < 4 s interactive |
| 6: Gym builder | 3–4 | 3D desktop + 2D mobile, BOM, quote | 3 real gyms test it |
| 7: More configurators + languages | ongoing | Gloves, shin guards, bag wall, ring; th/ar/es | Per item |
| 8: Production tracker + QR | 2 | Tasks, photos, order page, serials | First live order tracked |

**Launch first with Phases 0–4 (about 8–9 weeks).** The 3D-heavy features follow, so revenue isn't blocked by the showpiece.

---

## 17. Running costs (estimate, per month, before ads)

| Item | Cost |
|---|---|
| Vercel Pro | US$20 |
| Postgres (Neon/Supabase) | US$0–25 |
| Media storage + CDN (R2/Blob) | US$5–20 |
| Mux video | US$0–30 (usage) |
| PostHog / Clarity / Sentry | Free tiers → US$0–50 |
| Resend + Klaviyo/Brevo | US$0–45 |
| Cookie consent | Free (Klaro) → US$15 |
| Domain(s) | about US$2 |
| Stripe | Transaction fees only |
| **Total** | **≈ US$30–200 / month** |

---

## 18. Risks

| Risk | Mitigation |
|---|---|
| 3D slows the site | Islands + budgets + CI gate; the 2D fallback is always available |
| Jesse can't update the site | Payload admin training, a 10-minute video guide, mobile-friendly factory role |
| Scope creep (the showpiece first) | Revenue features launch first (Phases 0–4) |
| Domain / Wix recovery blocked | Start recovery in week 1; the .au registrant needs the ABN holder |
| Origin / consumer-law claims | Legal review of copy; no "Australian made" |
| Name confusion (S4NCH3Z, BOXRAW "Sanchez", US gyms) | GEO entity work, trademark filing, long-tail SEO |
| Payment disputes on custom items | Clear terms, deposit non-refundable after production starts, spec sign-off captured in the order |

---

## 19. Open decisions (need Jesse / Michael)
1. The deposit percentage and refund policy for custom work.
2. Shipping terms for the Gulf (DDP vs DAP).
3. Which currencies and languages go live at launch.
4. The Payload host: Vercel + Neon, or a single VPS (cheaper, but more ops).
5. Whether to show clients' logos and names (written consent needed).
