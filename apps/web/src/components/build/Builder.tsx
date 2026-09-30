"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BagConfigSchema, COLOURS, DEFAULT_BAG, PRESETS, type BagConfig, type Issue, type Preset } from "@/lib/configurator/schema";
import { CURRENCIES, formatMoney, type Currency } from "@/lib/commerce/money";
import type { PriceResult } from "@/lib/configurator/pricing";
import { PaymentStep, type CheckoutResult } from "./PaymentStep";
import { BagPreview } from "./BagPreview";

const STEPS = ["Design", "Size", "Colours", "Branding", "Review"] as const;
const PRESET_LABEL: Record<Preset, string> = { plain: "Plain", tigerfull: "Tiger", monogram: "Monogram" };
const COUNTRIES = [["AU", "Australia"], ["TH", "Thailand"], ["GB", "United Kingdom"], ["US", "United States"], ["AE", "UAE"], ["SG", "Singapore"]] as const;

interface PriceResponse {
  validation: { ok: boolean; quote: boolean; issues: Issue[] };
  price: PriceResult;
  depositMinor: number | null;
}

function Choice<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: ReadonlyArray<{ id: T; name: string }>; onChange: (v: T) => void }) {
  return (
    <fieldset className="bd__field">
      <legend>{label}</legend>
      <div className="bd__chips" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={String(o.id)} type="button" role="radio" aria-checked={o.id === value} className="bd__chip" onClick={() => onChange(o.id)}>
            {o.name}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Swatches({ label, value, onChange }: { label: string; value: string; onChange: (v: BagConfig["bodyColour"]) => void }) {
  return (
    <fieldset className="bd__field">
      <legend>{label}</legend>
      <div className="bd__swatches" role="radiogroup" aria-label={label}>
        {COLOURS.map((c) => (
          <button key={c.id} type="button" role="radio" aria-checked={c.id === value} aria-label={c.name} title={c.name} className="bd__swatch" style={{ background: c.hex }} onClick={() => onChange(c.id)} />
        ))}
      </div>
    </fieldset>
  );
}

/** The bag builder: five steps, one decision at a time, with a sticky bar showing the server's price. The browser never computes a price. */
export function Builder({ initialPreset }: { initialPreset: Preset }) {
  const [step, setStep] = useState(0);
  const [cfg, setCfg] = useState<BagConfig>({ ...DEFAULT_BAG, preset: initialPreset });
  const [currency, setCurrency] = useState<Currency>("AUD");
  const [res, setRes] = useState<PriceResponse | null>(null);
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const seq = useRef(0);
  const set = <K extends keyof BagConfig>(k: K, v: BagConfig[K]): void => setCfg((c) => ({ ...c, [k]: v }));

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("sanchez-currency");
      if (saved && (CURRENCIES as readonly string[]).includes(saved)) setCurrency(saved as Currency);
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    const my = ++seq.current;
    const id = window.setTimeout(() => void (async () => {
      const r = await fetch("/api/price", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ config: cfg, currency }) }).catch(() => null);
      if (!r || my !== seq.current) return;
      if (r.ok) setRes((await r.json()) as PriceResponse);
    })(), 250);
    return () => window.clearTimeout(id);
  }, [cfg, currency]);

  const errors = useMemo(() => res?.validation.issues.filter((i) => i.severity === "error") ?? [], [res]);
  const price = res?.price;
  const canPay = Boolean(res?.validation.ok && !res.validation.quote && price?.status === "priced");

  async function startCheckout(): Promise<void> {
    setBusy(true);
    setError(null);
    const parsed = BagConfigSchema.safeParse(cfg);
    if (!parsed.success) {
      setError("Please check your choices.");
      setBusy(false);
      return;
    }
    const r = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ config: parsed.data, currency }) }).catch(() => null);
    const j = (await r?.json().catch(() => null)) as (CheckoutResult & { error?: string }) | null;
    if (!r || !r.ok || !j || j.error) setError(j?.error === "unpriced" ? "Prices are not set yet, so this cannot be ordered." : j?.error === "quote_required" ? "This size of order is a quote. We will come back to you." : "Something went wrong. Please try again.");
    else setCheckout(j);
    setBusy(false);
  }

  const priceText = !price ? "…" : price.status === "priced" ? formatMoney(price.totalMinor, price.currency) : "Price: placeholder";

  return (
    <div className="bd">
      <div className="bd__view">
        <BagPreview cfg={cfg} />
      </div>
      <div className="bd__panel">
      <ol className="bd__steps" aria-label="Build steps">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className={i <= step ? "is-done" : ""}>
            <button type="button" onClick={() => !checkout && setStep(i)}>{s}</button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <>
          <Choice label="Start from" value={cfg.preset} options={PRESETS.map((p) => ({ id: p, name: PRESET_LABEL[p] }))} onChange={(v) => set("preset", v)} />
          <p className="pg__note">Heavy bag. Other products come later.</p>
        </>
      )}
      {step === 1 && (
        <>
          <Choice label="Length" value={cfg.sizeFt} options={[3, 4, 5].map((n) => ({ id: n as 3 | 4 | 5, name: `${n} ft` }))} onChange={(v) => set("sizeFt", v)} />
          <Choice label="Fill" value={cfg.fill} options={[{ id: "unfilled", name: "Unfilled, filled on site" }, { id: "filled", name: "Filled (local delivery)" }]} onChange={(v) => set("fill", v)} />
          <Choice label="Delivering to" value={cfg.country} options={COUNTRIES.map(([id, name]) => ({ id, name }))} onChange={(v) => set("country", v)} />
          <label className="bd__field">
            <span>Quantity</span>
            <input type="number" min={1} max={500} value={cfg.quantity} onChange={(e) => set("quantity", Math.max(1, Math.min(500, Number(e.target.value) || 1)))} />
          </label>
        </>
      )}
      {step === 2 && (
        <>
          <Choice label="Material" value={cfg.material} options={[{ id: "vinyl", name: "Premium vinyl" }, { id: "leather", name: "Genuine leather" }, { id: "canvas", name: "Heavy canvas" }]} onChange={(v) => set("material", v)} />
          <Choice label="Layout" value={cfg.panelLayout} options={[{ id: "single", name: "Single colour" }, { id: "split-vertical", name: "Vertical split" }, { id: "bands", name: "Bands" }, { id: "three-panel", name: "Three panel" }]} onChange={(v) => set("panelLayout", v)} />
          <Swatches label="Body" value={cfg.bodyColour} onChange={(v) => set("bodyColour", v)} />
          <Swatches label="Accent" value={cfg.accentColour} onChange={(v) => set("accentColour", v)} />
          <Swatches label="Caps" value={cfg.capColour} onChange={(v) => set("capColour", v)} />
          <Choice label="Stitching" value={cfg.stitching} options={[{ id: "tonal", name: "Tonal" }, { id: "contrast", name: "Contrast" }, { id: "accent", name: "Accent" }]} onChange={(v) => set("stitching", v)} />
        </>
      )}
      {step === 3 && (
        <>
          <Choice label="Branding" value={cfg.brandingMethod} options={[{ id: "screen-print", name: "Screen print" }, { id: "embroidered-patch", name: "Embroidered patch" }, { id: "leather-patch", name: "Leather patch" }, { id: "debossed", name: "Debossed (leather)" }]} onChange={(v) => set("brandingMethod", v)} />
          <Choice label="Placement" value={cfg.placement} options={[{ id: "front", name: "Front" }, { id: "front-back", name: "Front + back" }, { id: "wrap", name: "Wrap" }, { id: "top-band", name: "Top band" }, { id: "bottom-band", name: "Bottom band" }]} onChange={(v) => set("placement", v)} />
          <Choice label="Logo size" value={cfg.logoSize} options={[{ id: "S", name: "S" }, { id: "M", name: "M" }, { id: "L", name: "L" }, { id: "full", name: "Full height" }]} onChange={(v) => set("logoSize", v)} />
          <label className="bd__field">
            <span>Extra text (up to 30 characters)</span>
            <input type="text" maxLength={30} value={cfg.extraText} onChange={(e) => set("extraText", e.target.value)} />
          </label>
          <Choice label="Hanging" value={cfg.hanging} options={[{ id: "chain-4pt", name: "4-point chain" }, { id: "heavy-swivel", name: "Heavy swivel" }, { id: "strap", name: "Strap" }]} onChange={(v) => set("hanging", v)} />
          <Choice label="Hardware" value={cfg.hardware} options={[{ id: "black", name: "Black" }, { id: "silver", name: "Silver" }]} onChange={(v) => set("hardware", v)} />
          <label className="bd__check"><input type="checkbox" checked={cfg.makersMark} onChange={(e) => set("makersMark", e.target.checked)} /> Sanchez maker&rsquo;s mark</label>
          {(["qr-tag", "cover", "spare-chain"] as const).map((x) => (
            <label key={x} className="bd__check">
              <input type="checkbox" checked={cfg.extras.includes(x)} onChange={(e) => set("extras", e.target.checked ? [...cfg.extras, x] : cfg.extras.filter((y) => y !== x))} /> {x === "qr-tag" ? "QR authenticity tag" : x === "cover" ? "Protective cover" : "Spare chain set"}
            </label>
          ))}
        </>
      )}
      {step === 4 && !checkout && (
        <>
          <dl className="bd__sum">
            <dt>Design</dt><dd>{PRESET_LABEL[cfg.preset]}, {cfg.sizeFt} ft, {cfg.material}</dd>
            <dt>Fill</dt><dd>{cfg.fill === "filled" ? "Filled" : "Unfilled, filled on site"} ({cfg.country})</dd>
            <dt>Colours</dt><dd>{cfg.bodyColour}, {cfg.accentColour}, {cfg.capColour}</dd>
            <dt>Branding</dt><dd>{cfg.brandingMethod}, {cfg.placement}, {cfg.logoSize}{cfg.extraText ? `, "${cfg.extraText}"` : ""}</dd>
            <dt>Quantity</dt><dd>{cfg.quantity}</dd>
          </dl>
          {price?.status === "priced" && (
            <ul className="bd__lines">
              {price.lines.map((l) => <li key={l.key}><span>{l.label}</span><span>{formatMoney(l.unitMinor, price.currency)}</span></li>)}
            </ul>
          )}
          {errors.map((i) => <p key={i.code} className="pg__note" role="alert">{i.message}</p>)}
          {price?.status === "unpriced" && <p className="pg__note">{price.reason} Ordering opens once prices are set. Join the waitlist meanwhile.</p>}
          {error && <p className="pg__note" role="alert">{error}</p>}
          <div className="pg__actions">
            <button className="pg__btn" type="button" disabled={!canPay || busy} onClick={() => void startCheckout()}>{busy ? "Working…" : "Continue to the deposit"}</button>
            <a className="pg__btn pg__btn--ghost" href="/#waitlist">Join the waitlist</a>
          </div>
        </>
      )}
      {step === 4 && checkout && (
        <>
          <p className="pg__lead">Deposit due now: <strong>{formatMoney(checkout.depositMinor, checkout.currency as Currency)}</strong> of {formatMoney(checkout.totalMinor, checkout.currency as Currency)}.{checkout.book === "test" ? " (TEST PRICES: synthetic, not real.)" : ""}</p>
          <PaymentStep checkout={checkout} />
        </>
      )}

      </div>

      <div className="bd__bar" role="region" aria-label="Your price">
        <div>
          <small>{price?.status === "priced" && price.book === "test" ? "Test price" : "Your bag"}</small>
          <strong>{priceText}</strong>
          {res?.depositMinor && price?.status === "priced" ? <small>Deposit {formatMoney(res.depositMinor, price.currency)}</small> : null}
        </div>
        <select aria-label="Currency" value={currency} onChange={(e) => { const c = e.target.value as Currency; setCurrency(c); try { window.localStorage.setItem("sanchez-currency", c); } catch { /* private mode */ } }}>
          {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        {step < 4 && !checkout && <button className="pg__btn" type="button" onClick={() => setStep((s) => Math.min(4, s + 1))}>Next</button>}
      </div>
    </div>
  );
}
