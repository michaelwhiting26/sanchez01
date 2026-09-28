# Sanchez: tech and strategy answers (28 Sep 2026)

## 1. Better than Shopify?
**Recommendation: a custom build, which you own.**
- **Front end:** Next.js with React Three Fiber for 3D.
- **Checkout:** Stripe (Checkout and Payment Element, with Apple Pay, Google Pay and Link) plus Stripe Tax.
- **Content admin for Jesse:** Payload CMS (open source, sits inside the Next.js app), backed by Postgres (Supabase or Neon).
- **Analytics:** PostHog.
- **Hosting:** Vercel.

Why it beats Shopify here:
- Your 3D configurator and gym builder are the product. On Shopify they'd sit inside someone else's theme and apps.
- No platform or app fees.
- You own every data point.
- The site becomes an asset you maintain, which is what makes the care retainer recurring.

**The catch:** Jesse gets no ready-made admin like Shopify's, so Payload needs setting up properly (products, orders, content).

**Alternative:** Medusa.js, open-source commerce with a ready admin, if order management gets heavy.

**Keep Shopify in mind only if** Jesse insists on a familiar off-the-shelf admin. Even then, run it headless with your own front end.

## 2. Tracking every detail
- **PostHog (free up to about 1M events and 5k session replays a month):**
  - custom events for every configurator step and choice
  - funnels
  - session replay
  - heatmaps
  - feature flags and A/B tests
- **Microsoft Clarity (free):** a second heatmap and replay tool.
- **GA4 + Meta pixel and Conversions API + Google Ads enhanced conversions:** for ad attribution. Send server-side events from Stripe webhooks.
- **Consent banner:** Australian privacy rulings against tracking pixels in June 2026 and the draft Tranche 2 reforms, plus the UAE's personal data law (PDPL), mean opt-in where required.
- **Log the whole configuration** (JSON) with every quote and order, so you know exactly what people design, including what they design and then abandon.

## 3. 3D load speed and mobile-first
- **Page first, 3D second.** The page renders instantly as normal HTML with a poster image or a short muted video. The 3D engine loads after first paint, or only when the visitor taps "Customise".
- **Asset budget:** under 1.5 MB of JS for the first load, and 2–5 MB per 3D product model.
  - Models in glTF with Draco or Meshopt compression, textures in KTX2.
  - Lighting "baked" into the textures instead of calculated live.
  - Simpler versions of models on mobile.
- **Quality tiers:** detect the device and serve lower resolution, fewer lights and no shadows on phones.
- **Virtual workshop:** capture the real workshop as a Gaussian splat with Polycam, Luma or Scaniverse on an iPhone, then stream it in progressively. Jesse "in it" as a transparent-background video (filmed in front of a green screen) or a short scanned clip. Heavy, so desktop gets the full world and mobile gets a guided video version.
- **Split by device:**
  - **Product configurator:** works on mobile (one object, touch rotate).
  - **3D gym builder:** desktop and tablet only. On phones, show a 2D planner plus an "email me the 3D builder link" button.
- **Targets:** Lighthouse mobile 85+ and LCP under 2.5s on 4G. Test on a mid-range Android, not just an iPhone.

## 4. Checkout on-site
Stripe Payment Element / Express Checkout embedded in the site. Apple Pay needs domain verification in Stripe. Deposits for custom work are a "part-payment" invoice or PaymentIntent. Multi-currency is set per price.

## 5. Login on the current site
Not needed. Use guest checkout. Collect email at the quote or order stage for email marketing. Add accounts later only for reorders and wholesale.

## 6. Multiple languages
next-intl with locale URLs (/en, /th, /ar, /es). Arabic needs right-to-left layout, so plan for it from the start. Translate with AI, then have a native speaker review product and legal pages.

## 7. Is publishing prices dangerous?
- **The risk is low:** competitors can get his prices anyway by posing as customers.
- **Hiding prices costs sales:** an Instagram comment already asks "could I request a pricing list please".
- **Approach:**
  - **Standard products:** show the full price.
  - **Custom items:** show "from" prices, with the configurator giving a live range.
  - **Fit-outs:** quote only.
  - **Wholesale and gym pricing:** behind a B2B login.
- **Who looks at this professionally:** a **pricing strategist** (or commercial / revenue manager). For the funnel side, a **conversion-rate-optimisation (CRO) specialist** or product analyst.
- **Their usual strategies:**
  - "good, better, best" tiers
  - price anchoring (show the premium option first)
  - "from" pricing
  - bundles (a bag wall package)
  - value-based pricing for custom work
  - A/B testing price display
  - never discounting the flagship

## 8. Revenue share on what you drive
Yes, if it's in the contract:
- a percentage of net online revenue through Stripe
- plus ambassador and discount codes and UTM links for social
- with a monthly statement and audit rights

See section 5 of the proposal document.

## 9. Lean tool stack (alongside Higgsfield)

| Need | Tool | Cost |
|---|---|---|
| Build | Claude Code | Your existing plan |
| 3D models | Blender | Free |
| Scans (workshop, gyms) | Polycam / Scaniverse / Luma | Free tiers |
| Design | Figma | Free tier |
| Hosting | Vercel | Free → US$20/mo |
| Database | Supabase or Neon | Free tier |
| CMS | Payload | Free (open source) |
| Payments | Stripe | Fees only |
| Analytics | PostHog + Clarity | Free tiers |
| Email | Resend (transactional) + Klaviyo or Brevo (marketing) | Free tiers |
| Video edits | CapCut / DaVinci Resolve | Free |

## 10. Things to be careful about
- **The fighter sponsor idea:** if this is Paul Weir, you parted ways this month. Decide deliberately, and use a written ambassador agreement either way.
- **Australian glove design:** it's fine creatively, but don't imitate the licensed green-and-gold Australian Made kangaroo, and don't imply the gloves are made in Australia.
- **BOXRAW:** it has a "Sanchez Collection" and is BATL's partner. Watch the trademark overlap.
