# Sanchez Custom Builder: configurator specification

**Version:** 0.1 draft, 27 Sep 2026
**Scope:** the step-by-step choices a buyer makes to customise three products (**Ring**, **Bag** and **Bag Wall / Rack**), plus a combined **Gym Package** route.
**Audience:** Michael (product owner), a front-end developer, Jesse (to confirm what is feasible) and an image generator (Section 9 prompts).

> **Before build, check with Jesse:** does Sanchez make rings? The research found only bags and fit-outs on the current site. All prices below are **placeholders (P)** until Jesse gives factory costs. Ring dimensions must be confirmed against the target sanctioning body.

---

## 0. Principles

1. **Brand first, product second.** The buyer uploads their logo and colours once, and every product inherits them. This is what makes it feel custom straight away.
2. **Live preview at every step.** Each choice changes the render immediately.
3. **Show price ranges, never a surprise.** A running "from – to" estimate stays on screen. Standard bags can be ordered outright. Rings and walls end in a deposit or a quote.
4. **Guard rails, not dead ends.** Invalid combinations (ring too big for the room, rack on a stud wall) show a fix, not an error.
5. **Every build becomes a factory spec sheet** (Section 7). What the customer sees is what the factory sews.
6. **No "Australian made" wording anywhere.** Use "Designed in Sydney. Handmade in Thailand." (Legal to confirm.)

---

## 1. Entry flow (all products)

```
[Landing] → Choose path:
   A) Build a Bag
   B) Build a Bag Wall
   C) Build a Ring
   D) Full Gym Package (A + B + C + extras, one quote)
        ↓
[Step 0: Your Brand]  (shared, done once, saved to session)
        ↓
[Product flow(s)]
        ↓
[Review & Price] → [Deposit checkout]  or  [Request quote / book consult]
        ↓
[Confirmation + spec sheet PDF + "watch it being made" tracker link]
```

### Step 0: Your Brand (shared)
| Field | Type | Rules |
|---|---|---|
| Gym / buyer name | text | Required. Used on the spec sheet and optionally printed |
| Logo upload | file (SVG, PNG, PDF, AI, EPS) | SVG or vector preferred; raster at least 2000px. Auto background removal. Warn if low resolution |
| Logo variant | radio | Full colour / single colour (white) / single colour (black) |
| Primary brand colour | colour picker + HEX + Pantone field | Required |
| Secondary colour | colour picker | Optional |
| Accent colour | colour picker | Optional |
| Brand vibe (drives preview lighting and scene) | cards | *Old-school fight gym*, *Premium boutique*, *Industrial*, *Clean minimal*, *Neon night* |
| Buyer type | radio | Boutique studio / franchise / commercial gym / fight team / promoter / home gym / hotel |
| Country / delivery city | select | Drives currency (AUD / AED / SGD / GBP), duty note and lead time |
| "I don't have a logo yet" | toggle | Offers text wordmark using chosen font (4 fonts) |

---

## 2. Product flow A: Bag

**Step A1: Bag type**
| Option | Notes |
|---|---|
| Heavy bag (classic cylinder) | Default |
| Thai / banana bag (long) | Kicks and low strikes |
| Teardrop / uppercut bag | Angles and uppercuts |
| Angle / wall-uppercut bag | Wall mounted |
| Body-shot / wrecking ball | Round |
| Double-end / speed bag | Accessory. Limited options (colour + logo only) |

**Step A2: Size and weight**
| Type | Length options | Target filled weight (P) |
|---|---|---|
| Heavy | 3ft / 4ft / 5ft | 30 / 45 / 60 kg |
| Banana | 5ft / 6ft / 7ft | 40 / 55 / 70 kg |
| Teardrop | 3ft / 4ft | 35 / 45 kg |
| Body | Standard / large | 30 / 45 kg |
Also shows diameter and a silhouette next to a 180cm human for scale.

**Step A3: Fill**
- Filled (Australia and local delivery)
- **Unfilled, filled on site** (default for export; lower freight). Show the saving.
- Fill type: shredded textile (standard) / textile with a soft top section / custom (ask)

**Step A4: Material**
| Option | Notes |
|---|---|
| Premium vinyl (house material) | Default |
| Genuine leather | Premium tier. Limited colours |
| Heavy canvas | Budget and training-camp tier |
Show a swatch zoom for each material.

**Step A5: Colour layout**
- Panel layout: single colour / 2-tone vertical split / 2-tone horizontal bands / 3-panel / chequer / custom patchwork (goes to quote)
- Colour per panel (brand colours pre-loaded plus a colour library of about 20)
- Top cap colour, bottom cap colour
- Stitching colour: tonal / contrast / brand accent
- Piping or trim: none / contrast

**Step A6: Branding**
| Field | Options |
|---|---|
| Method | Silicone screen print (standard) / embroidered patch / leather patch / debossed leather (leather only) |
| Placement | Front / front + back / 360° wrap / top band / bottom band |
| Logo size | S / M / L / full height |
| Extra text | e.g. motto or gym name, up to 30 characters, 4 fonts |
| Numbering | "Station 01–12" sequence (auto when quantity > 1) |
| Sanchez maker's mark | Small, default on, can be removed on franchise orders (P fee) |

**Step A7: Hanging and hardware**
- 4-point chain with swivel (standard) / heavy-duty swivel / strap hang
- Bottom anchor ring: yes / no
- Hardware finish: black / silver / brand colour (powder coat, P)

**Step A8: Quantity**
- Quantity: 1–100+
- Price tiers: 1 / 2–5 / 6–11 / 12+ / franchise (quote)
- "Make each bag different" toggle (turns on per-bag editing)

**Step A9: Extras**
- Serial-numbered QR tag (authenticity, care, reorder)
- Matching gloves or pads (goes to quote; gloves excluded from competition use)
- Protective cover, spare chain set

---

## 3. Product flow B: Bag Wall / Rack

**Step B1: Room**
| Field | Type | Rules |
|---|---|---|
| Room length × width | numbers (m) | Required |
| Ceiling height | number (m) | Required. Under 2.7m limits long bags |
| Wall construction | select | Concrete / masonry block / steel frame / timber stud / unknown |
| Ceiling structure | select | Concrete slab / steel beam / timber joist / suspended ceiling / unknown |
| Floor | select | Concrete / timber / existing rubber |
| Upload room photo(s) | files | Optional. Used for the AI "your gym" mock-up |
| Floor plan | file | Optional |

**Step B2: Mount system**
| Option | Best for | Guard rail |
|---|---|---|
| Wall-mounted arms (one per bag) | Most studios | Needs concrete, block or steel. Stud wall means "backing plate required: add?" |
| Ceiling beam / track | High ceilings | Needs a structural sign-off (auto-adds an engineer check line item) |
| Free-standing gantry frame | Rentals, no-drill sites | Needs floor footprint. Shows the footprint in the plan |
| Heavy-bag station pods | Island layouts | 2–4 bags per pod |

**Step B3: Layout**
- Number of stations (the system suggests a maximum from room size)
- Spacing: compact 1.2m / standard 1.5m / premium 1.8m centre to centre (P, to be confirmed with Jesse)
- Arrangement: single wall line / L-shape / two facing walls / centre island / grid
- A **top-down plan view** updates live, with walkways shaded and clearance warnings shown

**Step B4: Bags for the wall**
- "Use one bag design for all" (runs flow A once) / "Mix" (for example 8 heavy + 4 banana)
- Stations can be assigned individually

**Step B5: Frame finish and branding**
| Field | Options |
|---|---|
| Frame colour | Matte black / gloss black / white / brand colour powder coat |
| Wall branding panel | None / printed acoustic panel behind bags / painted mural (quote) / backlit logo sign |
| Station numbers | Wall plates 01–N |
| Lighting | None / LED strip above rack (brand colour) / spotlights per bag |
| Floor matting | None / rubber tiles under bag zone (colour) / branded mat |

**Step B6: Install**
- Self-install kit plus video / Sanchez install team / partner installer (Gulf)
- Preferred install date. The **opening date** field drives a "Launch-ready guarantee" check against the lead time.

---

## 4. Product flow C: Ring

> Confirm production capability first. The ring flow may launch as quote-only.

**Step C1: Ring purpose**
| Option | Notes |
|---|---|
| Competition (sanctioned events) | Shows the sanctioning selector (C1a) |
| Training / gym | Default |
| Floor ring (no platform) | Budget, low ceilings |
| Event / portable (touring) | Promoters. Quick assembly and transport cases |

**C1a: Sanctioning target:** IBA / WBC / WBA / IBF / WBO / national commission / none. Sets permitted sizes and padding.

**Step C2: Size (inside the ropes)**
- 14ft / 16ft / 18ft / 20ft / 22ft / 24ft (training defaults to 16–18ft; competition allowed sizes come from the C1a rulebook)
- Guard rail: ring plus apron plus 1m clearance must fit the room from B1 (or re-ask room size)

**Step C3: Platform**
- Height: floor / 0.5m / 0.9m / 1.0m / 1.2m (competition default 0.9–1.2m, to be confirmed)
- Apron width: 0.5m / 0.75m / 1m
- Steps: 1 set / 2 sets / 3 sets (competition = 3: red, blue, neutral)

**Step C4: Ropes**
- Count: 3 / 4 (4 is standard)
- Rope colour and sleeve: per-rope colour, or all one colour / brand pattern
- Rope-sleeve printing: none / logo repeat / text
- Spacers and ties: colour

**Step C5: Corner pads (turnbuckle covers)**
- Standard set: red corner, blue corner, 2 × neutral (white)
- Custom: brand colours (training only; competition keeps red and blue)
- Print: logo on each / sponsor slots per corner (promoter option)

**Step C6: Canvas and floor**
- Canvas colour
- Centre logo: size S / M / L / full
- Corner and edge prints: sponsor zones (up to 4) and gym name
- Under-canvas padding: 25mm / 40mm / 50mm (competition as per rulebook)
- Non-slip finish: standard / tournament grade

**Step C7: Apron skirt**
- Colour
- Printed branding: logo / gym name / sponsor panels (4 sides)

**Step C8: Posts and frame**
- Finish: black / silver / brand colour powder coat
- Post pads: colour + print

**Step C9: Delivery and install**
- Self-assembly / Sanchez team / partner
- For event rings: transport cases, a quick-assembly spec and a "tour" branding swap kit (spare skirt and canvas per event, which suits promoters)

---

## 5. Flow D: Full Gym Package

1. Step 0 (brand) → B1 (room)
2. "What goes in the room?" Pick any of: bag wall / ring / floor bags / speed-bag platform / mats / signage
3. Runs the sub-flows with brand pre-applied
4. **Auto plan:** a top-down layout combining ring, walls and walkways, with a clearance check
5. **"See your gym":** an AI render using the uploaded room photo with the chosen kit (Section 9)
6. Always ends in **Book a design consult + pay a design deposit** (P, credited to the order)

---

## 6. Pricing logic (structure only; all figures P)

```
line_price = base(product, size) 
           + material_modifier 
           + Σ colour_panel_modifiers 
           + branding_method × placements 
           + hardware_modifier 
           + extras
unit_price × quantity × tier_discount(qty)
+ install (by method & location)
+ freight estimate (filled vs unfilled, destination)
+ duty/VAT note (AU 0% under TAFTA; GCC 5% duty + local VAT, to confirm)
```
- Show a **range** (±15%) until the spec is locked. Firm price comes on quote or on checkout for standard bags.
- Payment modes: **Pay in full** (stock and simple bags) / **deposit (P%)**, e.g. 30–50% (custom bags, walls) / **Quote only** (rings, full packages, franchise orders).
- Currency: AUD / AED / SGD / GBP from Step 0.
- Lead time is shown at every step: "Estimated handover: [date]" (P, from the factory capacity table).

---

## 7. Outputs

**7.1 Customer confirmation:** a PDF with renders, the plan view, the itemised spec, price, lead time and the tracker link.

**7.2 Factory spec sheet (bilingual, Thai + English)** for each item:
- Order ID, item ID, serial number, quantity
- Product type, size, target weight, fill status
- Material + colour codes (HEX + Pantone + internal swatch code) per panel
- Stitch colour, piping
- Branding: method, file link (vector), placement diagram with measurements, colour separations
- Hardware spec
- QC checklist with photo slots (cut → sew → print → fill → pack) that feed the "watch it being made" tracker

**7.3 CRM record:** the lead with full config JSON, value, buyer type, opening date, source attribution (UTM, gclid, fbclid).

---

## 8. Data model (config JSON, abridged)

```json
{
  "configId": "CFG-2026-000123",
  "brand": {"name": "", "logoUrl": "", "logoVariant": "full|white|black",
            "colors": {"primary": "#", "secondary": "#", "accent": "#", "pantone": []},
            "vibe": "oldschool|boutique|industrial|minimal|neon"},
  "buyer": {"type": "", "country": "", "city": "", "currency": "AUD", "openingDate": null},
  "items": [
    {"product": "bag", "type": "heavy", "lengthFt": 5, "fill": "unfilled",
     "material": "vinyl", "layout": "2tone-vertical", "panels": ["#000000", "#C8102E"],
     "caps": {"top": "#000000", "bottom": "#000000"}, "stitch": "contrast",
     "branding": [{"method": "silicone-screen", "placement": "front", "size": "L"}],
     "text": "", "numbering": true, "hardware": {"hang": "4pt-swivel", "finish": "black", "anchor": true},
     "qty": 12, "extras": ["qr-tag"]},
    {"product": "wall", "room": {"l": 12, "w": 8, "ceiling": 3.2, "wall": "concrete", "ceilingType": "slab"},
     "mount": "wall-arms", "stations": 12, "spacingM": 1.5, "arrangement": "L",
     "finish": "matte-black", "panel": "printed-acoustic", "lighting": "led-strip", "matting": "rubber-black",
     "install": "sanchez-team"},
    {"product": "ring", "purpose": "training", "sanction": null, "sizeFt": 18, "platformM": 0.5,
     "apronM": 0.75, "steps": 2, "ropes": {"count": 4, "colors": ["#C8102E", "#FFFFFF", "#FFFFFF", "#C8102E"], "print": "logo"},
     "corners": {"scheme": "brand", "print": "logo"}, "canvas": {"color": "#1A1A1A", "centreLogo": "L", "sponsorZones": 0, "padMm": 40},
     "skirt": {"color": "#000000", "print": "logo-4-sides"}, "posts": "matte-black", "install": "sanchez-team"}
  ],
  "pricing": {"low": 0, "high": 0, "currency": "AUD", "mode": "deposit|full|quote"},
  "attribution": {"utm": {}, "gclid": null, "fbclid": null}
}
```

---

## 9. GPT image prompts

**Set these once for every prompt** (edit the brackets):
`Brand: [GYM NAME]. Colours: primary [#C8102E red], secondary [#000000 black], accent [#FFFFFF white]. Logo: [describe the logo, or attach the file]. Style: photoreal product photography, 50mm lens, soft studio key light, subtle film grain, no text other than the logo and gym name, correct spelling.`

**9.1 Configurator UI screen (desktop)**
> Design a premium e-commerce product configurator web page for a custom boxing equipment brand called "Sanchez", dark theme, charcoal background, off-white type, a single red accent. Left 60%: a large photoreal 3D render of a 5ft black-and-red two-tone leather heavy bag with a white screen-printed logo, hanging on a matte-black chain in a moody gym. Right 40%: a step panel titled "Build your bag" with a progress bar (Brand › Type › Size › Material › Colours › Branding › Hardware › Review), the current step "Colours" showing colour swatches, a panel-layout selector with 5 small bag icons, and stitching colour chips. Bottom right: a running price "AUD 890 – 1,020 · est. handover 14 Nov" and a red "Continue" button. Small footer line: "Designed in Sydney. Handmade in Thailand." Clean, modern, generous spacing, like Apple or Nike By You.

**9.2 Configurator UI screen (mobile)**
> Same brand and style as above, iPhone screen. The top half shows the bag render with a 360° rotate hint. The bottom sheet shows "Step 6 of 8 · Branding" with options for Screen print / Embroidered patch / Leather patch as cards, a placement selector (Front, Back, 360° wrap), and a sticky price bar with a "Continue" button.

**9.3 Bag product render**
> Photoreal studio product shot of a custom 5ft heavy boxing bag, vertical 2-tone split (left [primary], right [secondary]), black top and bottom caps, contrast [accent] stitching, a large [logo] silicone screen print centred on the front, station number "07" small near the base, hanging from a 4-point black chain with a heavy swivel, seamless dark grey backdrop, rim light, slight floor reflection.

**9.4 Bag wall render**
> Wide interior photo of a premium boutique boxing studio. Along one concrete wall, an L-shaped rack of 12 matte-black wall-mounted arms, each holding a custom heavy bag in [primary]/[secondary] with a [logo] print and station numbers 01–12, spaced 1.5m apart. A red LED strip runs above the rack; a large printed acoustic panel with the [logo] sits behind the bags; the floor is black rubber tiles under the bag zone and polished concrete elsewhere. Moody, cinematic lighting. Empty studio, just before opening day.

**9.5 Ring render**
> Photoreal wide shot of a custom 18ft training boxing ring on a 0.5m platform in the same studio. Four ropes (outer ropes [primary], middle ropes white) with padded sleeves printed with a small repeating [logo]. Corner pads in brand colours, each with the [logo]. The canvas is charcoal with a large centred [logo]. The black apron skirt carries the [gym name] on each side, with matte-black posts and two sets of steps. Overhead lights focused on the ring, the rest of the gym dim.

**9.6 Full Gym Package, before and after (use the customer's room photo)**
> Using the attached photo of an empty commercial unit, create a realistic "after" image of the same room fitted out as a boxing studio: [ring spec] positioned [location], [N]-bag wall on the [left/right/back] wall per the bag-wall spec, rubber flooring under the bag zone, [logo] signage. Keep the room's real windows, columns and ceiling. Show it as a side-by-side, BEFORE on the left and AFTER on the right.

**9.7 Top-down plan view**
> Clean architectural top-down floor plan, isometric-free, white background, thin grey walls, 12m × 8m room. Show an 18ft ring as a square with an apron outline, 12 bag stations as circles along an L-shaped wall with 1.5m spacing, walkways shaded light grey, clearance zones as dashed lines, and a small legend and scale bar. Minimal, brand accent [primary].

---

## 10. Validation rules (summary)

| Rule | Behaviour |
|---|---|
| Ceiling < bag length + 0.8m | Block long bags. Suggest a shorter bag or a wall-arm mount |
| Stud wall + wall arms | Force the "backing plate / structural check" line item |
| Ceiling mount | Auto-add an engineer sign-off (P) |
| Ring + apron + 1m clearance > room | Suggest the next size down or a floor ring |
| Competition ring | Lock corner colours to red/blue/neutral; apply rulebook sizes |
| Logo < 1000px raster | Warn, and offer vectorising (P fee) |
| Opening date < lead time | Offer an express slot (P) or a phased install |
| Export destination | Default to unfilled bags; show duty/VAT note |

---

## 11. Tracking events (for the analytics set-up)
`config_start`, `brand_logo_uploaded`, `product_selected`, `step_completed{step}`, `price_viewed`, `render_generated`, `quote_requested`, `consult_booked`, `deposit_started`, `deposit_paid`, `config_abandoned{step}`. Each event carries `configId`, value range and currency, and is sent to GA4, Meta CAPI and the CRM.

---

## 12. Build notes
- **Phase 1:** Shopify plus a configurator app (Kickflip or Zakeke) for **Bag only**, with deposits via Downpay, a quote form for wall and ring, and a CRM.
- **Phase 2:** a custom front end (Next.js + a three.js bag model) for wall and ring plus the plan view; AI room render via an image API.
- **Phase 3:** the factory spec sheet, the "watch it being made" tracker, and QR serials.
- **Open items for Jesse:** real prices, colour library, lead times per product, ring capability, max logo sizes by method, fill weights.
