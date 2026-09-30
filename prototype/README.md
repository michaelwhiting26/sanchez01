# Sanchez Custom Boxing: HTML prototype (Milestone 1a)

The visual source of truth for the production UI in `apps/web`. Plain HTML, CSS and vanilla JS. No build step, no framework, no network calls except Google Fonts.

## Open it

- **Double-click** any `.html` file (it works on `file://`). Start at `index.html`.
- Or serve it: `cd ~/Code/sanchez-web && python3 -m http.server 8000`, then open `http://localhost:8000/prototype/`.
- Media is **outside git**. It is loaded through the repo symlinks with relative paths (`../media-scrape/images/…`, `../media-scrape/videos/…`). If the Dropbox symlinks are missing, images and video will not show.
- The living style guide is `components.html`.

## Review tools

| What | How |
|---|---|
| Loading / empty / error states | Add `?state=loading`, `?state=empty` or `?state=error` to any page (links in the footer's "Prototype" box). |
| Payment Element states only | `checkout.html?pay=loading` or `?pay=error` |
| Declined payment | Card `4000 0000 0000 0002`, or `checkout.html?result=fail` (also fails the wallet sheet) |
| RTL | Footer → Language → العربية. It sets `<html dir="rtl" lang="ar">`. Translations are a stub. |
| Currency | Header (≥768px), footer or menu drawer. Persisted in `localStorage["sz.currency"]`. |
| Reset the configurator | "Start over" in the configurator, or `configure.html?fresh=1` |
| Deep-link into the configurator | `configure.html?type=heavy&length=5ft` (the product page does this), `#step-N` for a reached step |

Local storage keys: `sz.config.v1` (design), `sz.cart.v1` (stock cart), `sz.currency`, `sz.lang`, `sz.lastOrder`.

## Pages

| File | Status | Production route |
|---|---|---|
| `flare-carousel.html` | Experiment: dark gallery, flat hero card, neighbours edge-on then flaring into huge curved walls (three.js, text baked into card textures). Needs `http://` (not file://): `python3 -m http.server`. `?debug` shows a readout. | (not a route yet) |
| `index.html` | Built: hero film, paths, consultation, key features, workshop film, client-logo wall (consent placeholders), fit-out steps, journal (stateful), quote form | `/` |
| `product.html` | Built: gallery, length, customise CTA, stock bag + Express Checkout (mock), tabs, FAQ, mobile sticky CTA, states | `/shop/bags/custom-heavy-bag` |
| `configure.html` | Built: Step 0 brand + A1–A9 (spec 01 §2), live 2D preview, sticky price bar, guard rails, autosave, share, states | `/configure/bag` |
| `review.html` | Built: preview, itemised spec with Edit links, deposit vs quote mode, quote modal, share, states | `/configure/bag/review` |
| `checkout.html` | Built: Apple Pay/Google Pay sheet (mock), contact, delivery, mocked Stripe Payment Element, success (webhook-confirmed timeline) and failure, `?mode=stock` for the cart | `/checkout` |
| `components.html` | Built: style guide | (not shipped) |
| `shop`, `gym-fit-outs`, `gym-builder`, `workshop`, `journal`, `about`, `contact`, `faq`, `wholesale`, `fighters`, `shipping`, `returns-warranty`, `legal-terms`, `legal-privacy`, `legal-cookies`, `order`, `verify` `.html` | **Stubs** ("Coming in milestone 1b") with shared chrome, so no link 404s | see spec 04 §4 |

## How to add or edit a page

1. Copy a stub (e.g. `shop.html`). Keep the `<head>` block as is: the fonts, `styles.css`, the inline script that applies the saved language/direction before paint, and `app.js` with `defer`.
2. Set `<body data-page="…">` to the nav key (`shop`, `configure`, `gym-fit-outs`, `workshop`, `journal`, `about`, `contact`). This sets `aria-current` in the header and drawer.
3. Keep the empty chrome slots: `<header class="site-header" data-chrome="header">` and `<footer class="site-footer" data-chrome="footer">`. `app.js` fills them, and adds the skip link, icon sprite, nav drawer, cart drawer and toast region. The header slot has a reserved height, so there is no layout shift.
4. Put content in `<main id="main" tabindex="-1">`. Use only the component classes below and the tokens. Add new components to `styles.css` (tokens only) **and** to `components.html`.
5. Nav, footer links, socials, currencies, countries, colours and the price book are data at the top of `app.js` (`SZ.DATA`, `SZ.OPT`, `SZ.STEPS`).

## Design tokens (`styles.css` §1)

**Palette** (leather, bone, logo rust):

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#0E0B09` | page |
| `--color-surface` / `-raised` / `-hover` | `#17120F` / `#211A15` / `#2C231D` | cards, inputs, hover |
| `--c-leather-700` / `-600` / `-500` | `#3D2C21` / `#5A3F2C` / `#7D5638` | leather sections, strong borders |
| `--color-text` | `#F3EADC` | body (16.4:1) |
| `--color-text-2` | `#D6C8B3` | secondary (11.9:1) |
| `--color-text-muted` | `#A8977F` | muted (6.9:1) |
| `--color-accent` | `#A83E26` | the one accent: primary buttons, selected state (bone text on it: 5.2:1) |
| `--color-accent-text` | `#E0724F` | accent as text/icons on dark (6.2:1) |
| `--color-stitch` | `#C9A45C` | dashed stitching details only |
| `--color-success` / `-warning` / `-danger` / `-focus` | `#6FBF73` / `#E3B341` / `#F07167` / `#E3B341` | feedback, focus ring |
| `--color-ph-bg` / `--color-ph-text` | `#3A2F0C` / `#F4D27A` | PLACEHOLDER tag |

**Type:** `--font-display` Barlow Condensed (500–800, uppercase headings, buttons, eyebrows); `--font-text` Barlow (400–700). Scale `--fs-xs … --fs-4xl` (0.75rem → fluid 5.5rem). Google Fonts in the prototype; **production must self-host and subset** (Latin + Thai + Arabic fallbacks, `font-display: swap`).

**Spacing** `--space-1…10` (4, 8, 12, 16, 24, 32, 40, 48, 64, 96px), `--gutter`, `--container` 76rem, `--container-narrow` 44rem.
**Radius** `--radius-sm 2px`, `-md 4px`, `-lg 8px`, `-round`. **Shadow** `--shadow-1…3`.
**Motion** `--dur-1/2/3` 120/200/320ms, `--ease-out`, `--ease-in-out`; all zero under `prefers-reduced-motion`.
**Z-index** `--z-base 0`, `-raised 10`, `-sticky 100`, `-header 200`, `-drawer 400`, `-modal 500`, `-toast 600`, `-skip 700`.
**Sizing** `--tap 44px`, `--header-h 64/72px`, `--sticky-bar-h 76px`, `--stitch-dash`.
**Breakpoints** (literal in `@media`, mobile-first): 480, 768, 1024, 1280px.
**Direction** `--dir` is `1`, or `-1` under `[dir=rtl]`; use it in any horizontal transform. All layout uses logical properties.

## Component catalogue (class names)

Every class below is shown live in `components.html`.

- **Layout:** `.container(--narrow)` `.section(--tight|--surface|--leather)` `.section-head` `.stack(--sm|--lg)` `.cluster` `.grid` (`--grid-min`) `.split(--wide-start)`
- **Type:** `.display-1` `.display-2` `.h2` `.h3` `.h4` `.eyebrow` `.lede` `.muted` `.small` `.xsmall` `.accent-text` `.mono` `.origin-line` `.prose` `.wordmark` (CSS logo fallback, PLACEHOLDER) `.visually-hidden` `.skip-link`
- **Tags:** `.ph` (`.ph--block`) `.badge(--accent|--success|--warning|--danger)` `.chip-list` `.chip`
- **Stitch motif:** `.stitch` (dashed inner border) `.stitch-rule`. One per view.
- **Buttons:** `.btn` + `--primary|--secondary|--ghost|--link` + `--sm|--lg|--block|--icon`; `.btn--wallet` `.btn--gpay` `.wallet-row` `.or-divider`; `.icon-btn` `.count-badge`; busy = `aria-busy="true"`; `.icon` `.icon--dir`
- **Header/footer:** `.site-header` `.site-header__inner` `.brand` `.nav-primary` `.header-actions` `.header-currency` `.header-cta` `.nav-drawer-list` `.site-footer` `.footer-top` `.footer-brand` `.footer-cols` `.footer-col` `.footer-bottom` `.switchers` `.legal-links` `.social-links` `.proto-tools`
- **Hero/media/cards:** `.hero` `.hero__media` `.hero__content` `.hero__actions` `.hero__toggle` `.media(--16x9|--1x1|--9x16)` `.media__caption` `.card(--flush|--link)` `.card__body` `.path-card` `.path-card__title` `.feature` `.feature__num` `.logo-wall` `.logo-slot` `.steps-list` `.steps-list__num`
- **Forms:** `form[data-validate]` `.field` `.field__label` `.req` `.field__hint` `.field__error` `.is-invalid` `.is-valid` `.field__row` `.input` `.select(--sm)` `.textarea` `.check` `.check-group(--row)` `.switch` `.legend-lg` `.error-summary` + `[data-error-summary]` `[data-form-success]`; per-field message via `data-error="…"`
- **Choices:** `.choice-grid` (`--choice-min`) `.choice` `.choice__box` `.choice__art` `.choice__title` `.choice__desc` `.seg` `.swatches` `.swatch(--brand)` `.swatch__chip` (`--swatch`) `.color-field` `.stepper(--sm)` + `[data-stepper]` `.file-drop` `.file-preview`
- **Feedback/states:** `.notice(--info|--success|--warning|--error)` `.toast-region` `.toast(--success|--error|--warning)` `.state(--error)` `.state__icon` `.skeleton(--text|--title|--block)` `.demo-banner`
- **Overlays:** `dialog.drawer(--start)` `.drawer__header|__title|__body|__footer` `dialog.modal` `.modal__header|__title|__body|__footer`
- **Tabs/accordion:** `[data-tabs]` `.tabs__list` `.tabs__tab` `.tabs__panel` `details.accordion` `.accordion__body`
- **Commerce:** `.price(--lg)` `.price__cur` `.summary-list` `.summary-group(__head)` `.totals` `.totals__row(--grand)` `.timeline` `.cart-lines` `.cart-line(__thumb|__meta|__actions)` `.breadcrumbs` `.pdp` `.pdp__info` `.pdp__title` `.gallery` `.gallery__main` `.gallery__thumbs` `.gallery__thumb` `.spec-table`
- **Progress/sticky:** `.progress` `.progress__meta` `.progress__bar` `.progress__fill` (`--progress`) `.step-nav` `.step-nav__n` `.sticky-bar(--mobile-only)` `.sticky-bar__info|__label|__actions` `.hide-below-md`
- **Configurator:** `.cfg` `.cfg__preview[data-vibe]` `.cfg__stage` `.cfg__preview-label` `.cfg__view-toggle` `.cfg__panel` `.cfg-step` `.cfg-step__head` `.cfg-step__title` `.tier-table` `.material-swatch(--vinyl|--leather|--canvas)`
- **Checkout:** `.checkout` `.checkout__section` `.checkout__num` `.order-summary` `.stripe-mock` `.stripe-mock__label` `.result-panel(--success|--error)`

### Behaviour hooks (`app.js`)

| Hook | Behaviour |
|---|---|
| `[data-open="id"]`, `[data-close]` | open/close a `<dialog>` (drawer or modal) with `showModal()`: focus trap, Esc, inert page, focus return; backdrop click closes |
| `SZ.toast(msg, type, ms)` | toast in the polite live region |
| `[data-price="key"]` (+ `data-range`, `data-prefix`, `data-ph-label`) | price from `SZ.DATA.priceBook[key][currency]`; `null` renders a PLACEHOLDER tag |
| `[data-currency-select]`, `[data-lang-select]`, `[data-currency-code]` | currency and language switchers |
| `[data-stateful]` > `[data-when]`; `[data-retry]` | demo states; `data-stateful="pay"` reads `?pay=` |
| `form[data-validate]`, `sz:submit` event | validation, error summary, success toast |
| `[data-tabs]`, `[data-gallery]`, `[data-stepper]`, `video[data-autoplay]` + `[data-video-toggle]` | tabs, gallery, steppers, reduced-motion-aware video |
| `[data-add-to-cart='{json}']`, `SZ.cart` | stock cart |
| `SZ.config`, `SZ.bag.render(cfg, {view, human})`, `SZ.STEPS`, `SZ.OPT` | configurator state, rules, summary and 2D renderer (reuse on the gym builder later) |

## Content and evidence rules applied

- Origin line everywhere: **"Designed in Sydney. Handmade in Pattaya."** The scraped H1 "WORLD CLASS. AUSTRALIAN HANDMADE." was cut to "World class." (Spec 01 still says "Handmade in Thailand"; CLAUDE.md's Pattaya wording wins.)
- Real scrape copy: "Personalised design consultation" + the six "Customisable …" items, the key features (precision cutting / Persian vinyl, HH-66 Vinyl Cement by RH Adhesives, silicone screen printing, masterclass stitchwork heading), "Trusted by the best", "Request a Quote from the Owner" form fields, and the four fit-out steps.
- Option names, sizes and target weights come from spec 01 §2. Weights are flagged `(P)` in the spec, so they carry a PLACEHOLDER tag.
- No testimonials, ratings, stats or client names anywhere. The client-logo wall is four "PLACEHOLDER — needs written consent" slots. The Opetaia exterior video (`3d2aa4_5d68…`) and the scraped client-logo images are **deliberately not used**.
- Wix template stock images (`22e53e_*`, `c837a6_*`) are not Sanchez's and are not used.

## Media used

| File | What it is | Used on |
|---|---|---|
| `images/3d2aa4_57957db3…~mv2.webp` | colour logo (rust + cream shield) | header, footer |
| `videos/3d2aa4_158202ae…_1080p.mp4` + `images/…f000.jpg` poster | Jesse sewing, 16:9 (hero film) | Home hero |
| `videos/3d2aa4_23235d6b…_1080p.mp4` + poster | Jesse sewing, 9:16 | Home workshop section, gallery |
| `images/3d2aa4_53bb9dfb…f000.jpg` | bag close-up with the Sanchez label | product main image, cards, cart thumb |
| `images/3d2aa4_8508388d…f000.jpg` | workshop tool wall, 9:16 | cards, gallery |
| `other/3d2aa4_667e0051…~mv2.jpg` | favicon | all pages |

Production TODOs: compress and transcode the hero (currently 16 MB, 1080p) to AV1/H.264 at several sizes with a small poster, add WebVTT captions, redraw the shield logo as SVG, and run a real product photo shoot.

## PLACEHOLDER inventory

About 70 `PLACEHOLDER` markers in the flow pages and `app.js`, plus every price, which renders at runtime as a PLACEHOLDER tag. By category:

| Category | Where | Needs |
|---|---|---|
| All prices (custom, stock, ranges, tier discounts, extras, fees: maker's-mark removal, vectorising, brand powder coat) | price book in `app.js`, configurator, product, review, checkout, cart | Jesse's price list, per currency |
| Deposit % and refund policy | review, checkout, product, home fit-out step 3 ("50%" is scraped copy, flagged to confirm) | business decision |
| Lead times / handover dates | product, configurator bar, review | factory capacity table |
| Target weights, diameters, material specs, leather colour range, colour library (~20), 4 wordmark fonts | configurator, product | Jesse |
| Shipping rates, Stripe Tax, Gulf DDP vs DAP, currency per country, freight saving | configurator (fill), product, checkout | accountant / business decision |
| Stock availability of standard bags | product | Jesse |
| Client logos and names | home logo wall | written consent |
| Ring capability | home path card | Jesse |
| Masterclass stitchwork copy, response time, email template, legal entity + ABN, care and warranty copy, max logo file size | home, footer, checkout, product | Jesse / legal |
| Studio product photos, material macro photos, captions | product, swatch modal, home | shoot |

## Notes for milestone 1b (secondary pages)

- Reuse the chrome, tokens and classes; don't add colours or fonts. One accent (`--color-accent`), stitching (`.stitch`, dashed) once per view at most.
- Every region that loads data gets `[data-stateful]` with `ready/loading/empty/error` children, so `?state=` works everywhere.
- Headings: one `<h1>` per page, `.display-1/2` for section titles, `.eyebrow` above them.
- Forms: `form[data-validate]`, `.field` wrappers, `required` + `data-error` for messages. The fit-out questionnaire fields are in `specs/wix-scrape-README.md` §4.
- Images: always `width`/`height` (no CLS), `loading="lazy"` below the fold, empty `alt` when decorative.
- Replace a stub in place (same filename), so links stay valid.
