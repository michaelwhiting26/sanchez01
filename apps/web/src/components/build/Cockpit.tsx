"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BagPreview } from "./BagPreview";
import { PaymentStep, type CheckoutResult } from "./PaymentStep";
import { BagConfigSchema, COLOURS, DEFAULT_BAG, PRESETS, type BagConfig, type Issue, type Preset } from "@/lib/configurator/schema";
import { CURRENCIES, formatMoney, type Currency } from "@/lib/commerce/money";
import type { PriceResult } from "@/lib/configurator/pricing";
import { clearSaved, decodeShare, encodeShare, loadSaved, store } from "@/lib/configurator/save";
import { STEPS, stepForKey, type StepDef, type StepId, type StepState } from "@/lib/configurator/steps";
import { LOGO_SRC } from "@/lib/site";
import "../../styles/cockpit.css";

const PRESET_LABEL: Record<Preset, string> = { plain: "Plain", tigerfull: "Tiger", monogram: "Monogram" };
const COUNTRIES = [["AU", "Australia"], ["TH", "Thailand"], ["GB", "United Kingdom"], ["US", "United States"], ["AE", "UAE"], ["SG", "Singapore"]] as const;
const colourName = (id: string): string => COLOURS.find((c) => c.id === id)?.name ?? id;
const pad = (n: number): string => String(n).padStart(2, "0");

interface PriceResponse {
  validation: { ok: boolean; quote: boolean; issues: Issue[] };
  price: PriceResult;
  depositMinor: number | null;
}

function Chips<T extends string | number>({ value, options, onChange, label }: { value: T; options: ReadonlyArray<{ id: T; name: string }>; onChange: (v: T) => void; label: string }) {
  return (
    <div className="ck__chips" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.id)} type="button" role="radio" aria-checked={o.id === value} onClick={() => onChange(o.id)}>
          {o.name}
        </button>
      ))}
    </div>
  );
}

function Swatches({ value, onChange, label }: { value: string; onChange: (v: BagConfig["bodyColour"]) => void; label: string }) {
  return (
    <div className="ck__swatches" role="radiogroup" aria-label={label}>
      {COLOURS.map((c) => (
        <button key={c.id} type="button" role="radio" aria-checked={c.id === value} aria-label={c.name} title={c.name} style={{ background: c.hex }} onClick={() => onChange(c.id)} />
      ))}
    </div>
  );
}

/** What was chosen on a step, in words (for the review). */
function summary(id: StepId, c: BagConfig): string {
  switch (id) {
    case "design": return PRESET_LABEL[c.preset];
    case "size": return `${c.sizeFt} ft`;
    case "delivery": return `${COUNTRIES.find(([k]) => k === c.country)?.[1] ?? c.country}, ${c.fill === "filled" ? "filled" : "unfilled"}`;
    case "material": return c.material;
    case "body": return colourName(c.bodyColour);
    case "layout": return `${c.panelLayout}, accent ${colourName(c.accentColour)}`;
    case "caps": return colourName(c.capColour);
    case "branding": return `${c.brandingMethod}, ${c.placement}`;
    case "logo": return `${c.logoSize}${c.extraText ? `, “${c.extraText}”` : ""}${c.makersMark ? "" : ", no maker's mark"}`;
    case "hardware": return `${c.hanging}, ${c.hardware}`;
    case "extras": return c.extras.length ? c.extras.join(", ") : "none";
    case "quantity": return `×${c.quantity}`;
    case "review": return "";
  }
}

/**
 * The build cockpit. The bag fills the screen and the camera flies to the part you are deciding; one question at a time, in a dock along the bottom.
 * You can skip a question and come back (the track shows what is answered, skipped, or still open), the build saves as you go, and the last step
 * leads to the deposit payment. The browser never computes a price: it shows what the server says.
 */
export function Cockpit({ initialPreset }: { initialPreset: Preset }) {
  const [cfg, setCfg] = useState<BagConfig>({ ...DEFAULT_BAG, preset: initialPreset });
  const [currency, setCurrency] = useState<Currency>("AUD");
  const [step, setStep] = useState(0);
  const [answered, setAnswered] = useState<StepId[]>([]);
  const [skipped, setSkipped] = useState<StepId[]>([]);
  const [res, setRes] = useState<PriceResponse | null>(null);
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<ReturnType<typeof loadSaved>>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const ready = useRef(false);
  const seq = useRef(0);
  const set = <K extends keyof BagConfig>(k: K, v: BagConfig[K]): void => setCfg((c) => ({ ...c, [k]: v }));

  // start: a shared link wins, then a saved build (offered, not forced), else a fresh build from the chosen design
  useEffect(() => {
    const h = window.location.hash.match(/^#c=(.+)$/)?.[1];
    const shared = h ? decodeShare(h) : null;
    if (shared) {
      setCfg(shared.cfg);
      setCurrency(shared.currency);
    } else {
      const saved = loadSaved();
      if (saved && (saved.answered.length || saved.skipped.length)) setResume(saved);
    }
    ready.current = true;
  }, []);

  // save as you go
  useEffect(() => {
    if (!ready.current || resume) return;
    const id = window.setTimeout(() => {
      const at = new Date().toISOString();
      store({ cfg, currency, step, answered, skipped, savedAt: at });
      setSavedAt(at);
    }, 400);
    return () => window.clearTimeout(id);
  }, [cfg, currency, step, answered, skipped, resume]);

  // the server's price for this exact config
  useEffect(() => {
    const my = ++seq.current;
    const id = window.setTimeout(() => void (async () => {
      const r = await fetch("/api/price", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ config: cfg, currency }) }).catch(() => null);
      if (!r || my !== seq.current) return;
      if (r.ok) setRes((await r.json()) as PriceResponse);
    })(), 250);
    return () => window.clearTimeout(id);
  }, [cfg, currency]);

  const def = (STEPS[step] ?? STEPS[0]) as StepDef;
  const last = step === STEPS.length - 1;
  const errors = useMemo(() => res?.validation.issues.filter((i) => i.severity === "error") ?? [], [res]);
  const price = res?.price;
  const canPay = Boolean(res?.validation.ok && !res.validation.quote && price?.status === "priced");
  const stateOf = (id: StepId): StepState => (answered.includes(id) ? "answered" : skipped.includes(id) ? "skipped" : "open");
  const mark = (id: StepId, how: "answered" | "skipped"): void => {
    setAnswered((a) => (how === "answered" ? [...new Set([...a, id])] : a.filter((x) => x !== id)));
    setSkipped((s) => (how === "skipped" ? [...new Set([...s, id])] : s.filter((x) => x !== id)));
  };
  const go = (i: number): void => setStep(Math.max(0, Math.min(STEPS.length - 1, i)));
  const confirm = (): void => { mark(def.id, "answered"); go(step + 1); };
  const skip = (): void => { if (!answered.includes(def.id)) mark(def.id, "skipped"); go(step + 1); };
  const skippedLeft = STEPS.filter((s) => s.id !== "review" && stateOf(s.id) === "skipped");

  async function startCheckout(): Promise<void> {
    setBusy(true);
    setError(null);
    const parsed = BagConfigSchema.safeParse(cfg);
    if (!parsed.success) { setError("Please check your choices."); setBusy(false); return; }
    const r = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ config: parsed.data, currency }) }).catch(() => null);
    const j = (await r?.json().catch(() => null)) as (CheckoutResult & { error?: string }) | null;
    if (!r || !r.ok || !j || j.error) setError(j?.error === "unpriced" ? "Prices are not set yet, so this cannot be ordered." : j?.error === "quote_required" ? "An order this size is a quote. We will come back to you." : "Something went wrong. Please try again.");
    else { setCheckout(j); clearSaved(); }
    setBusy(false);
  }

  async function share(): Promise<void> {
    const url = `${window.location.origin}/configure#c=${encodeShare(cfg, currency)}`;
    try { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { window.prompt("Copy your link", url); }
  }

  const controls: Record<Exclude<StepId, "review">, ReactNode> = {
    design: <Chips label="Design" value={cfg.preset} options={PRESETS.map((p) => ({ id: p, name: PRESET_LABEL[p] }))} onChange={(v) => set("preset", v)} />,
    size: <Chips label="Length" value={cfg.sizeFt} options={([3, 4, 5] as const).map((n) => ({ id: n, name: `${n} ft` }))} onChange={(v) => set("sizeFt", v)} />,
    delivery: (
      <>
        <Chips label="Delivering to" value={cfg.country} options={COUNTRIES.map(([id, name]) => ({ id, name }))} onChange={(v) => set("country", v)} />
        <Chips label="Fill" value={cfg.fill} options={[{ id: "unfilled", name: "Unfilled, filled on site" }, { id: "filled", name: "Filled (local)" }]} onChange={(v) => set("fill", v)} />
      </>
    ),
    material: <Chips label="Material" value={cfg.material} options={[{ id: "vinyl", name: "Premium vinyl" }, { id: "leather", name: "Genuine leather" }, { id: "canvas", name: "Heavy canvas" }]} onChange={(v) => set("material", v)} />,
    body: <Swatches label="Body colour" value={cfg.bodyColour} onChange={(v) => set("bodyColour", v)} />,
    layout: (
      <>
        <Chips label="Layout" value={cfg.panelLayout} options={[{ id: "single", name: "Single colour" }, { id: "split-vertical", name: "Vertical split" }, { id: "bands", name: "Bands" }, { id: "three-panel", name: "Three panel" }]} onChange={(v) => set("panelLayout", v)} />
        <Swatches label="Accent colour" value={cfg.accentColour} onChange={(v) => set("accentColour", v)} />
        <Chips label="Stitching" value={cfg.stitching} options={[{ id: "tonal", name: "Tonal" }, { id: "contrast", name: "Contrast" }, { id: "accent", name: "Accent" }]} onChange={(v) => set("stitching", v)} />
      </>
    ),
    caps: <Swatches label="Band colour" value={cfg.capColour} onChange={(v) => set("capColour", v)} />,
    branding: (
      <>
        <Chips label="Branding method" value={cfg.brandingMethod} options={[{ id: "screen-print", name: "Screen print" }, { id: "embroidered-patch", name: "Embroidered patch" }, { id: "leather-patch", name: "Leather patch" }, { id: "debossed", name: "Debossed (leather)" }]} onChange={(v) => set("brandingMethod", v)} />
        <Chips label="Placement" value={cfg.placement} options={[{ id: "front", name: "Front" }, { id: "front-back", name: "Front + back" }, { id: "wrap", name: "Wrap" }, { id: "top-band", name: "Top band" }, { id: "bottom-band", name: "Bottom band" }]} onChange={(v) => set("placement", v)} />
      </>
    ),
    logo: (
      <>
        <Chips label="Logo size" value={cfg.logoSize} options={[{ id: "S", name: "S" }, { id: "M", name: "M" }, { id: "L", name: "L" }, { id: "full", name: "Full height" }]} onChange={(v) => set("logoSize", v)} />
        <input className="ck__input" type="text" maxLength={30} value={cfg.extraText} placeholder="Your words (up to 30)" aria-label="Extra text" onChange={(e) => set("extraText", e.target.value)} />
        <label className="ck__check"><input type="checkbox" checked={cfg.makersMark} onChange={(e) => set("makersMark", e.target.checked)} /> Sanchez maker&rsquo;s mark</label>
      </>
    ),
    hardware: (
      <>
        <Chips label="Hanging" value={cfg.hanging} options={[{ id: "chain-4pt", name: "4-point chain" }, { id: "heavy-swivel", name: "Heavy swivel" }, { id: "strap", name: "Strap" }]} onChange={(v) => set("hanging", v)} />
        <Chips label="Hardware finish" value={cfg.hardware} options={[{ id: "black", name: "Black" }, { id: "silver", name: "Silver" }]} onChange={(v) => set("hardware", v)} />
      </>
    ),
    extras: (
      <div className="ck__checks">
        {(["qr-tag", "cover", "spare-chain"] as const).map((x) => (
          <label key={x} className="ck__check">
            <input type="checkbox" checked={cfg.extras.includes(x)} onChange={(e) => set("extras", e.target.checked ? [...cfg.extras, x] : cfg.extras.filter((y) => y !== x))} /> {x === "qr-tag" ? "QR authenticity tag" : x === "cover" ? "Protective cover" : "Spare chain set"}
          </label>
        ))}
      </div>
    ),
    quantity: (
      <div className="ck__stepper" role="group" aria-label="Quantity">
        <button type="button" aria-label="One fewer" onClick={() => set("quantity", Math.max(1, cfg.quantity - 1))}>−</button>
        <output>{cfg.quantity}</output>
        <button type="button" aria-label="One more" onClick={() => set("quantity", Math.min(500, cfg.quantity + 1))}>+</button>
      </div>
    ),
  };

  const priceText = !price ? "…" : price.status === "priced" ? formatMoney(price.totalMinor, price.currency) : "Price to come";

  return (
    <div className="ck">
      <h1 className="visually-hidden">Build your bag</h1>
      <div className="ck__stage">
        <BagPreview cfg={cfg} focus={def.part} />
        <p className="ck__focus" aria-hidden="true">◎ Focus · {def.part === "whole" ? "the whole bag" : def.part === "top" ? "bands and crown" : def.part}</p>
      </div>

      <header className="ck__top">
        <Link href="/product" className="ck__brand" aria-label="Back to the bag"><img src={LOGO_SRC} alt="" width={44} height={38} /></Link>
        <ol className="ck__track" aria-label="Build progress">
          {STEPS.map((s, i) => (
            <li key={s.id} data-state={stateOf(s.id)} aria-current={i === step ? "step" : undefined}>
              <button type="button" aria-label={`${s.label}: ${stateOf(s.id)}`} disabled={Boolean(checkout)} onClick={() => go(i)} />
            </li>
          ))}
        </ol>
        <button type="button" className="ck__save" onClick={() => void share()} aria-label="Copy a link to this build">{copied ? "Link copied" : savedAt ? "Saved · Share" : "Share"}</button>
      </header>

      <section className="ck__dock" aria-label="Build controls">
        {resume ? (
          <div className="ck__panel">
            <p className="ck__tele">Saved build found</p>
            <h2 className="ck__q">Pick up where you left off?</h2>
            <p className="ck__hint">{resume.answered.length} answered, {resume.skipped.length} skipped.</p>
            <div className="ck__actions">
              <button type="button" className="ck__btn ck__btn--ghost" onClick={() => { clearSaved(); setResume(null); }}>Start over</button>
              <button type="button" className="ck__btn" onClick={() => { setCfg(resume.cfg); setCurrency(resume.currency); setAnswered(resume.answered); setSkipped(resume.skipped); setStep(Math.min(resume.step, STEPS.length - 1)); setResume(null); }}>Resume</button>
            </div>
          </div>
        ) : checkout ? (
          <div className="ck__panel">
            <p className="ck__tele">Deposit</p>
            <h2 className="ck__q">Deposit due now: {formatMoney(checkout.depositMinor, checkout.currency as Currency)}</h2>
            <p className="ck__hint">of {formatMoney(checkout.totalMinor, checkout.currency as Currency)}{checkout.book === "test" ? " (test prices: synthetic, not real)" : ""}</p>
            <PaymentStep checkout={checkout} />
          </div>
        ) : (
          <div className="ck__panel">
            <p className="ck__tele"><span>Step {pad(step + 1)}/{pad(STEPS.length)}</span><span>{def.label}</span><span className="ck__tele-price">{priceText}</span></p>
            <h2 className={`ck__q${last ? " ck__q--yours" : ""}`}>{def.question}</h2>
            <p className="ck__hint">{def.hint}</p>

            {!last && <div className="ck__controls">{controls[def.id as Exclude<StepId, "review">]}</div>}

            {last && (
              <div className="ck__review">
                <ul>
                  {STEPS.filter((s) => s.id !== "review").map((s) => (
                    <li key={s.id} data-state={stateOf(s.id)}>
                      <span>{s.label}</span>
                      <span>{summary(s.id, cfg)}</span>
                      <button type="button" onClick={() => go(STEPS.indexOf(s))}>{stateOf(s.id) === "skipped" ? "Revisit" : "Edit"}</button>
                    </li>
                  ))}
                </ul>
                {skippedLeft.length > 0 && <p className="ck__note">You skipped {skippedLeft.map((s) => s.label).join(", ")}. The defaults are in your bag; revisit any time.</p>}
                {errors.map((i) => (
                  <p key={i.code} className="ck__note ck__note--err" role="alert">{i.message} <button type="button" onClick={() => go(STEPS.findIndex((s) => s.id === stepForKey(i.path)))}>Fix</button></p>
                ))}
                {price?.status === "unpriced" && <p className="ck__note">{price.reason} Ordering opens once prices are set.</p>}
                {error && <p className="ck__note ck__note--err" role="alert">{error}</p>}
              </div>
            )}

            {!last && errors.filter((i) => stepForKey(i.path) === def.id).map((i) => <p key={i.code} className="ck__note ck__note--err" role="alert">{i.message}</p>)}

            <div className="ck__actions">
              <button type="button" className="ck__btn ck__btn--ghost" disabled={step === 0} onClick={() => go(step - 1)}>Back</button>
              {!last && <button type="button" className="ck__skip" onClick={skip}>Skip for now ›</button>}
              {!last ? (
                <button type="button" className="ck__btn" onClick={confirm}>Confirm</button>
              ) : (
                <button type="button" className="ck__btn ck__btn--pay" disabled={!canPay || busy} onClick={() => void startCheckout()}>{busy ? "One moment…" : "Make it mine"}</button>
              )}
            </div>
            <div className="ck__meta">
              <span>{price?.status === "priced" && price.book === "test" ? "Test price" : "Your bag"} · <strong>{priceText}</strong>{res?.depositMinor && price?.status === "priced" ? ` · deposit ${formatMoney(res.depositMinor, price.currency)}` : ""}</span>
              <select aria-label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
