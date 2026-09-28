# Gym Lead Engine: senior specification

**Version:** 0.1 draft, 27 Sep 2026
**Owner:** Michael Whiting
**Client:** Sanchez Custom Boxing (licensed or retained service)
**One line:** find boxing, combat and boutique gyms **before they open** (or while they refit), score them, and hand Jesse a short daily list of buyers with a reason to call and a first message ready to send.

> Rule: every lead carries its **evidence**: the source URL or record it was found from and the date. Nothing is invented. If a field can't be sourced, it stays blank.

> Every source marked **(verify)** must have its access terms and API checked before build. Do not scrape any platform whose terms forbid it.

---

## 1. Goals and success measures

| Goal | Metric | Target (first 90 days, P) |
|---|---|---|
| Find gyms early | Median days between detection and opening date | ≥ 60 days before opening |
| Useful leads only | % of leads Jesse marks "real prospect" | ≥ 40% |
| Pipeline | Qualified conversations per month | 15–25 |
| Revenue | Won deals attributed to the engine | Tracked from day 1 (CRM) |
| Cost | Run cost per qualified lead | Under AUD 20 (P) |

**Out of scope for v1:** consumer (home-gym) leads, automated sending without a human approving it, and phone dialling.

---

## 2. Users

- **Jesse / Sanchez sales:** a daily digest (email or WhatsApp) with 5–15 leads, one tap for "call / message / skip / not a fit".
- **Michael (operator):** an admin view with source health, scoring tuning and markets on or off.
- **Later:** franchise-account view (every new 12RND/UBX/KX/Rumble/BFT site across markets).

---

## 3. What counts as a lead

**The target:** any venue that will buy **bags, bag walls, rings or a fit-out** in the next 0–6 months.

| Segment | Priority | Why |
|---|---|---|
| New independent boxing / Muay Thai / MMA gym | A | Needs everything, and design matters |
| New boutique boxing franchise site (12RND, UBX, KX, Rumble, BFT, Engine Room…) | A | Repeatable: one relationship, many sites |
| Existing gym, **refit / relocation / expansion** | B | Replacement cycle |
| Commercial gym adding a combat zone | B | Bag-wall package |
| Promoter / event company | B | Rings, event bags (BATL route) |
| Hotel, residential tower gym, school or uni combat room | C | One-offs, often high budget |
| PT studio adding boxing | C | Small order |

---

## 4. Signal sources (the "triggers")

Each collector is an **agent** described as **Fetch · Filter · Check · Store · Show**.

### 4.1 Australia

| # | Source | Signal | Access |
|---|---|---|---|
| AU1 | **Council / state development applications**, e.g. the NSW Planning Portal, and change-of-use DAs for "recreation facility (indoor)" or "gym" | A gym **fit-out is planned**, 2–6 months early, with the address | Planning portal data and APIs (verify per state; NSW, VIC, QLD first) |
| AU2 | **Business name and company registrations** (ASIC, ABN Lookup) with names containing boxing / fight / MMA / muay thai / combat / strike / fitness | A new entity is being formed | ABR web services (free, needs a GUID); ASIC data (verify) |
| AU3 | **Google Places**: new listings in "boxing gym", "martial arts school", "gym" categories, and status "opening soon" or a new place_id | About to open or just opened | Google Places API (paid, within the terms; only place_id can be stored long-term, check caching rules) |
| AU4 | **Franchise "coming soon" location pages** (12RND, UBX, KX, Rumble, BFT, F45 etc.) | Specific site with an opening window | Public pages; check robots.txt and terms, poll weekly with diff detection |
| AU5 | **Job ads**: "boxing coach", "head coach new gym", "opening soon" | Hiring before launch | **No scraping of job boards** (their terms forbid it). Use Google Alerts and search-engine APIs on public results, or manual review |
| AU6 | **Commercial property "leased" notices** to fitness tenants | Lease signed, so a fit-out is next | Agency press and news (verify; many portals forbid scraping) |
| AU7 | **Instagram "coming soon" / pre-sale accounts** | Founding-member pre-sales | Meta Business Discovery API (needs our own business account) or **manual research**. No scraping |
| AU8 | **Local news and business press** ("new gym opens…") | Opening confirmation, founders' names | News search API / RSS |

### 4.2 UAE and Gulf

| # | Source | Signal | Access |
|---|---|---|---|
| ME1 | **Trade licence registries**: Dubai Economy and Tourism (DET) business search; ADDED (Abu Dhabi); free-zone registries | A new licence with a fitness or sports activity code | Public search (verify for bulk access or an API; may be manual) |
| ME2 | **Google Places** (Dubai, Abu Dhabi, Riyadh, Jeddah, Doha) | New venues | As AU3 |
| ME3 | **Saudi Ministry of Sport licensed-facility data** | Newly licensed gyms (the sector is growing fast) | (verify) |
| ME4 | **Mall and community "coming soon" tenant announcements** (Emaar, Nakheel, Aldar, Majid Al Futtaim) | A new gym in a development | News and press releases |
| ME5 | **Fight-card feeder gyms**: gyms whose fighters appear on BATL / UAE federation cards | Warm, credible introduction | BATL relationship (Michael), public fight cards |
| ME6 | **Hotel and residential tower openings** with gyms | Premium one-offs | Hospitality news |

### 4.3 Other markets (phase 2)
Singapore (ACRA registrations, verify), the UK (Companies House: free API, SIC 93130 "fitness facilities" + name keywords; plus planning portals), New Zealand (Companies Office), and Thailand and Bali camps (Google Places plus manual work).

### 4.4 Enrichment sources (only after a trigger fires)
Company website, public Google Business profile, public social handles, public director / owner names (company registries), franchise-network pages. **No buying scraped personal data lists.**

---

## 5. Architecture

```
          ┌────────────── Collectors (one per source, scheduled) ──────────────┐
          │ AU1 DA  AU2 ABN  AU3 Places  AU4 Franchise  ME1 Licence  ...        │
          └───────────────┬─────────────────────────────────────────────────────┘
                          ▼
                 Raw Signal Store (append-only, with evidence URL + fetched_at)
                          ▼
              Normalise → Classify (LLM + rules: "is this a gym? which segment?")
                          ▼
              Entity Resolution (merge signals about the same venue/business)
                          ▼
              Enrich (website, socials, owner, franchise, size clues)
                          ▼
              Score (fit × timing × value × reachability) → Priority A/B/C
                          ▼
              Review Queue (Michael/Jesse approve) → Outreach Draft (LLM)
                          ▼
              CRM sync (HubSpot/Pipedrive) + Daily Digest (email/WhatsApp)
                          ▼
              Feedback loop: outcomes (won/lost/not a fit) → retune scoring
```

**Stack (recommended):**
- **App:** Next.js + TypeScript (same shape as Hub and Billz), with Postgres (or SQLite for the pilot).
- **Jobs:** scheduled workers (cron). One collector per file, each idempotent.
- **LLM:** Claude. **Haiku 4.5** (`claude-haiku-4-5-20251001`) for bulk classification and extraction; **Sonnet 5** (`claude-sonnet-5`) for scoring rationale and outreach drafts. All prompts versioned in the repo.
- **Maps:** Google Places API (a paid key with budget caps).
- **CRM:** HubSpot Starter or Pipedrive through their APIs.
- **Digest:** email (Resend or Gmail API) + WhatsApp Business API (phase 2).
- **Hosting:** a small VPS or Vercel + managed Postgres. Secrets live in env vars, never in the repo.

---

## 6. Data model (core tables)

| Table | Key fields |
|---|---|
| `signals` | id, source, source_ref, url, fetched_at, raw_json, hash (for dedupe), market |
| `venues` | id, name, address, geo, market, place_id, status (planned / opening / open / refit), opening_est, segment, franchise_brand |
| `organisations` | id, legal_name, registry_id (ABN / licence / CRN), registered_at, website |
| `people` | id, org_id, name, role, **source_url**, contact (only business contacts that are publicly published) |
| `venue_signals` | venue_id, signal_id, confidence |
| `scores` | venue_id, fit, timing, value, reach, total, priority, rationale, model_version, scored_at |
| `outreach` | venue_id, channel, draft, approved_by, sent_at, reply_status |
| `outcomes` | venue_id, stage (contacted / meeting / quote / won / lost / not a fit), value, reason |
| `suppression` | contact, reason (unsubscribed / not a fit / do-not-contact), at |

Every venue page shows its **evidence trail**: each signal with its link and date.

---

## 7. Classification and entity resolution

**Classifier (Haiku)** input: the raw signal text. Output (JSON schema):
`{is_relevant: bool, segment: A|B|C|none, venue_type, franchise_brand|null, opening_hint|null, address|null, confidence 0–1, quote: "<exact source text that justifies it>"}`
- If `quote` is not found verbatim in the source, the result is **rejected** (hallucination guard).
- Rules first, LLM second: keyword and category rules pre-filter to keep cost down.

**Entity resolution:** match on place_id → registry ID → normalised name + address (fuzzy, Jaro-Winkler > 0.9) → geo within 50m. Ambiguous matches go to the review queue, never auto-merged.

---

## 8. Scoring model (v1, transparent weights, tunable)

```
total = 0.35·fit + 0.30·timing + 0.20·value + 0.15·reach     (each 0–100)
```
| Factor | Inputs |
|---|---|
| **Fit** | Segment (A = 100, B = 70, C = 40); combat-specific keyword; boutique vs big-box; market enabled |
| **Timing** | Stage: DA lodged (80) → DA approved (100) → lease / "coming soon" (100) → opened < 30 days (60) → open > 90 days (20). Decays over time |
| **Value** | Size clues (floor area in the DA, number of classes, franchise = multi-site bonus), premium location, ring likely |
| **Reach** | A published business contact exists; warm path (BATL / fighter / mutual); language and market |

**Priority:** A ≥ 75, B 55–74, C < 55. The LLM writes a **one-line rationale** ("DA approved 12 Sep for 320m² boxing studio, Surry Hills; opening est. Jan; franchise: none; warm path: none") built only from stored signals.

**Feedback:** monthly, compare scores with outcomes and adjust the weights. Log every change with a `model_version`.

---

## 9. Outreach

- The LLM (Sonnet) drafts a **short, specific first message** per lead, citing the real trigger ("Saw your DA for the new studio on X St…"). Offer: the free AI **"see your gym" mock-up** (from the configurator spec) as the hook.
- **A human approves every send** in v1. No automated blasts.
- Channels: business email (published address), Instagram DM (manual), phone (manual), warm introduction via BATL.
- Sequences: at most 3 touches over 14 days, then stop. Replies stop the sequence automatically.
- **Templates by segment:** new independent / franchise / refit / promoter / hotel.

---

## 10. Legal and compliance (must-haves)

| Area | Requirement |
|---|---|
| **Australia: Spam Act 2003** | Commercial emails need consent. Inferred consent can apply where the address is **conspicuously published** and the message relates to the recipient's business role. Must identify the sender and include a working **unsubscribe** honoured within 5 business days |
| **Australia: Privacy Act** | Collect only what's needed. Keep a privacy notice; watch the Tranche 2 reforms (draft Aug 2026) |
| **Australia: telemarketing** | Check the Do Not Call Register before any cold calling |
| **UAE: PDPL + TDRA marketing rules** | Consent-based. B2B outreach to published business contacts only; honour opt-outs (verify) |
| **Saudi: PDPL** | As above (verify) |
| **UK (phase 2): PECR / GDPR** | Corporate subscribers are OK with an opt-out; sole traders need consent; a legitimate-interest assessment is required |
| **Platform terms** | No scraping of LinkedIn, Instagram, Seek or Indeed, or where robots.txt or the terms forbid. Use APIs, alerts or manual work |
| **Google Places terms** | Respect the caching and display rules; store place_id and refresh other fields |
| **Suppression** | A global suppression list checked before every send |
| **Evidence** | Keep the source and date for every personal data field (answers "where did you get my details?") |

---

## 11. Admin and operations

- **Source health dashboard:** last run, items found, errors, cost per source.
- **Budget caps:** Places API daily cap; LLM monthly cap with alerts.
- **Run schedule:** daily for Places, news and franchise diffs; weekly for DAs and registries; on demand for manual research batches.
- **Review queue:** approve, merge or reject, with keyboard shortcuts.
- **Audit log:** every automated decision with its model_version and prompt hash.
- **Tests:** a fixture set of about 50 real historic gym openings (known dates). The engine must detect ≥ 70% of them earlier than their opening date (backtest).

---

## 12. Delivery plan

| Phase | Weeks | Scope | Done when |
|---|---|---|---|
| 0: Discovery | 1 | Confirm Jesse's ideal customer, markets and capacity; verify source access (every "verify" item) | Written source list with access confirmed |
| 1: Pilot, Sydney | 2–3 | AU1 (NSW DA), AU2, AU3, AU4 · classifier · scoring · daily email digest · CRM sync | 2 weeks of digests; ≥ 40% marked real prospect |
| 2: Outreach + feedback | 2 | Drafts, approval flow, sequences, suppression, outcomes | First meetings booked from the engine |
| 3: Gulf | 2–3 | ME1, ME2, ME4, ME5 (BATL feeder gyms) · AED / Arabic name handling | UAE digest live |
| 4: Franchise radar | 1–2 | Multi-market franchise site tracking + account view | Every new franchise site flagged in ≤ 7 days |
| 5: Expand | ongoing | Saudi, Singapore, UK, NZ | By demand |

---

## 13. Commercials (link to the pricing sheet)

- **Build:** AED 10–15k (≈ AUD 4–6k) for phases 0–2; the Gulf add-on is quoted separately.
- **Run:** AED 1–2k a month (hosting, APIs, LLM, source maintenance, monthly tuning).
- **Optional:** commission of 5–10% on won deals from engine leads (in writing).
- **IP:** Michael owns the engine. Sanchez gets a **licence** for the boxing and fitness-equipment category in the agreed markets. This keeps the engine reusable (for example in the expert-lead engine pattern) and is your leverage.

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| Source access blocked or changes | Several sources per market; manual fallback; weekly source health checks |
| Low signal volume in a market | Widen to refits and commercial gyms; add franchise radar |
| Jesse doesn't follow up | Digest capped at ≤ 15; one-tap actions; weekly pipeline review |
| Legal complaint | Evidence trail, suppression list, human approval, published contacts only |
| LLM errors | Verbatim-quote guard, confidence threshold, review queue |
| Factory can't deliver on time | Opening-date vs lead-time check before outreach |

---

## 15. Open questions
1. Which markets first: Sydney only, or Sydney + Dubai?
2. Jesse's real capacity (bag walls per month) and lead times from Pattaya.
3. Does Jesse want franchise HQ deals (long cycle, big) or independents (fast, small) first?
4. Who sends the outreach: Jesse, a VA, or Michael?
5. Are BATL introductions formally part of this?
