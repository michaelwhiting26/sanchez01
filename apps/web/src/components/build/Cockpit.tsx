"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BagPreview } from "./BagPreview";
import { PaymentStep, type CheckoutResult } from "./PaymentStep";
import { BagConfigSchema, COLOURS, DEFAULT_BAG, type BagConfig, type Issue, type Preset } from "@/lib/configurator/schema";
import { CURRENCIES, formatMoney, type Currency } from "@/lib/commerce/money";
import type { PriceResult } from "@/lib/configurator/pricing";
import { clearSaved, decodeShare, encodeShare, loadSaved, store } from "@/lib/configurator/save";
import { activeSteps, BOOLEAN_KEYS, GROUPS, STEPS, stepForKey, type StepDef, type StepId, type StepState } from "@/lib/configurator/steps";
import { LOGO_SRC } from "@/lib/site";
import "../../styles/cockpit.css";

const colourName = (id: string): string => COLOURS.find((c) => c.id === id)?.name ?? id;
const pad = (n: number): string => String(n).padStart(2, "0");

interface PriceResponse {
  validation: { ok: boolean; quote: boolean; issues: Issue[] };
  price: PriceResult;
  depositMinor: number | null;
}

/** What the visitor has chosen on a step, in words (for the review). */
function summary(def: StepDef, c: BagConfig): string {
  const a = def.answer;
  if (a.kind === "pills") {
    const raw = BOOLEAN_KEYS.includes(a.key) ? (c[a.key] ? "yes" : "no") : String(c[a.key]);
    return a.options.find((o) => String(o.id) === raw)?.name ?? raw;
  }
  if (a.kind === "swatches") return colourName(c[a.key]);
  if (a.kind === "multi") return c.extras.length ? c.extras.join(", ") : "none";
  if (a.kind === "text") return c.extraText || "none";
  if (a.kind === "stepper") return `×${c.quantity}`;
  return "";
}

/**
 * The build cockpit. The bag fills the screen and the camera flies to the part being decided. One continuous flow that only ever asks one question:
 * the answers are compact pills that scroll sideways in a thin dock, tapping one moves you on. Skip anything and come back to it (the track shows what is
 * answered, skipped or still open), the build saves as you go and can be shared, and the last step leads to the deposit. The server prices everything.
 */
export function Cockpit({ initialPreset }: { initialPreset: Preset }) {
  const [cfg, setCfg] = useState<BagConfig>({ ...DEFAULT_BAG, preset: initialPreset });
  const [currency, setCurrency] = useState<Currency>("AUD");
  const [stepId, setStepId] = useState<StepId>("design");
  const [answered, setAnswered] = useState<StepId[]>([]);
  const [skipped, setSkipped] = useState<StepId[]>([]);
  const [res, setRes] = useState<PriceResponse | null>(null);
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<ReturnType<typeof loadSaved>>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [backToReview, setBackToReview] = useState(false);
  const ready = useRef(false);
  const seq = useRef(0);
  const timer = useRef(0);

  const steps = useMemo(() => activeSteps(cfg), [cfg]);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;
  const def = (steps.find((s) => s.id === stepId) ?? steps[0]) as StepDef;
  const idx = steps.indexOf(def);
  const last = def.answer.kind === "review";
  const set = <K extends keyof BagConfig>(k: K, v: BagConfig[K]): void => setCfg((c) => ({ ...c, [k]: v }));

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
    return () => window.clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (!ready.current || resume) return;
    const id = window.setTimeout(() => {
      const at = new Date().toISOString();
      store({ cfg, currency, step: STEPS.findIndex((s) => s.id === stepId), answered, skipped, savedAt: at });
      setSavedAt(at);
    }, 400);
    return () => window.clearTimeout(id);
  }, [cfg, currency, stepId, answered, skipped, resume]);

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
  const stateOf = (id: StepId): StepState => (answered.includes(id) ? "answered" : skipped.includes(id) ? "skipped" : "open");
  const mark = (id: StepId, how: "answered" | "skipped"): void => {
    setAnswered((a) => (how === "answered" ? [...new Set([...a, id])] : a.filter((x) => x !== id)));
    setSkipped((s) => (how === "skipped" ? [...new Set([...s, id])] : s.filter((x) => x !== id)));
  };

  /** Move to the next question that applies (or back to the review if you came from it). */
  const advance = (from: StepId): void => {
    window.clearTimeout(timer.current);
    const list = stepsRef.current;
    const i = list.findIndex((s) => s.id === from);
    if (backToReview) {
      setBackToReview(false);
      setStepId("review");
      return;
    }
    const nxt = list[Math.min(list.length - 1, i + 1)];
    if (nxt) setStepId(nxt.id);
  };
  const jump = (id: StepId, fromReview = false): void => {
    window.clearTimeout(timer.current);
    setBackToReview(fromReview);
    setStepId(id);
  };
  const back = (): void => {
    window.clearTimeout(timer.current);
    const prev = steps[Math.max(0, idx - 1)];
    if (prev) setStepId(prev.id);
  };
  const skip = (): void => {
    if (!answered.includes(def.id)) mark(def.id, "skipped");
    advance(def.id);
  };
  const pick = (value: string | number): void => {
    const a = def.answer;
    if (a.kind !== "pills") return;
    if (a.key === "makersMark" || a.key === "anchorRing") setCfg((c) => ({ ...c, [a.key]: value === "yes" }));
    else if (a.key === "sizeFt") set("sizeFt", Number(value) as 3 | 4 | 5);
    else setCfg((c) => ({ ...c, [a.key]: value }));
    mark(def.id, "answered");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => advance(def.id), 420); // a beat to see the change, then on to the next question
  };
  const pickColour = (id: BagConfig["bodyColour"]): void => {
    const a = def.answer;
    if (a.kind !== "swatches") return;
    set(a.key, id);
    mark(def.id, "answered");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => advance(def.id), 420);
  };
  const done = (): void => {
    mark(def.id, "answered");
    advance(def.id);
  };

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

  const a = def.answer;
  const priceText = !price ? "…" : price.status === "priced" ? formatMoney(price.totalMinor, price.currency) : "Price to come";
  const skippedLeft = steps.filter((s) => s.answer.kind !== "review" && stateOf(s.id) === "skipped");
  const sheet = Boolean(resume) || Boolean(checkout) || last;

  return (
    <div className="ck">
      <h1 className="visually-hidden">Build your bag</h1>
      <div className="ck__stage">
        <BagPreview cfg={cfg} focus={def.part} />
      </div>

      <header className="ck__top">
        <Link href="/product" className="ck__brand" aria-label="Back to the bag"><img src={LOGO_SRC} alt="" width={44} height={38} /></Link>
        <div className="ck__mid">
          <ol className="ck__track" aria-label="Build progress">
            {steps.map((s) => (
              <li key={s.id} data-state={stateOf(s.id)} aria-current={s.id === def.id ? "step" : undefined}>
                <button type="button" aria-label={`${s.label}: ${stateOf(s.id)}`} disabled={Boolean(checkout)} onClick={() => jump(s.id)} />
              </li>
            ))}
          </ol>
          <p className="ck__price"><strong>{priceText}</strong>{res?.depositMinor && price?.status === "priced" ? <> · deposit {formatMoney(res.depositMinor, price.currency)}</> : null}{price?.status === "priced" && price.book === "test" ? " · test price" : ""}</p>
        </div>
        <button type="button" className="ck__save" onClick={() => void share()} aria-label="Copy a link to this build">{copied ? "Copied" : savedAt ? "Saved" : "Share"}</button>
      </header>

      {sheet && (
        <section className="ck__sheet" aria-label="Build summary">
          {resume ? (
            <>
              <p className="ck__tele">Saved build found</p>
              <h2 className="ck__sq">Pick up where you left off?</h2>
              <p className="ck__note">{resume.answered.length} answered, {resume.skipped.length} skipped.</p>
              <div className="ck__sheetrow">
                <button type="button" className="ck__btn ck__btn--ghost" onClick={() => { clearSaved(); setResume(null); }}>Start over</button>
                <button type="button" className="ck__btn" onClick={() => { setCfg(resume.cfg); setCurrency(resume.currency); setAnswered(resume.answered); setSkipped(resume.skipped); setStepId(STEPS[Math.min(resume.step, STEPS.length - 1)]?.id ?? "design"); setResume(null); }}>Resume</button>
              </div>
            </>
          ) : checkout ? (
            <>
              <p className="ck__tele">Deposit</p>
              <h2 className="ck__sq">Due now: {formatMoney(checkout.depositMinor, checkout.currency as Currency)}</h2>
              <p className="ck__note">of {formatMoney(checkout.totalMinor, checkout.currency as Currency)}{checkout.book === "test" ? " (test prices: synthetic, not real)" : ""}</p>
              <PaymentStep checkout={checkout} />
            </>
          ) : (
            <>
              <h2 className="ck__sq ck__sq--yours">Yours.</h2>
              <ul className="ck__list">
                {steps.filter((s) => s.answer.kind !== "review").map((s) => (
                  <li key={s.id} data-state={stateOf(s.id)}>
                    <span>{s.label}{stateOf(s.id) === "skipped" ? " · skipped" : ""}</span>
                    <span>{summary(s, cfg)}</span>
                    <button type="button" onClick={() => jump(s.id, true)}>{stateOf(s.id) === "skipped" ? "Revisit" : "Edit"}</button>
                  </li>
                ))}
              </ul>
              {skippedLeft.length > 0 && <p className="ck__note">Skipped: {skippedLeft.map((s) => s.label).join(", ")}. The defaults are in your bag.</p>}
              {errors.map((i) => <p key={i.code} className="ck__note ck__note--err" role="alert">{i.message} <button type="button" onClick={() => jump(stepForKey(i.path), true)}>Fix</button></p>)}
              {price?.status === "unpriced" && <p className="ck__note">{price.reason} Ordering opens once prices are set.</p>}
              {error && <p className="ck__note ck__note--err" role="alert">{error}</p>}
              <div className="ck__sheetrow">
                <button type="button" className="ck__btn ck__btn--ghost" onClick={back}>Back</button>
                <select aria-label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
                <button type="button" className="ck__btn ck__btn--pay" disabled={!canPay || busy} onClick={() => void startCheckout()}>{busy ? "One moment…" : `Make it mine · ${priceText}`}</button>
              </div>
            </>
          )}
        </section>
      )}

      <section className="ck__dock" aria-label="Build controls" hidden={sheet}>
        <p className="ck__ask"><span>{pad(idx + 1)}/{pad(steps.length)} · {GROUPS[def.group]}</span> {def.question}{!last && <button type="button" className="ck__skip" onClick={skip}>Skip</button>}</p>
        <div className="ck__row">
          <button type="button" className="ck__icon" onClick={back} disabled={idx === 0} aria-label="Previous question">‹</button>
          <div className="ck__scroll" role="radiogroup" aria-label={def.question}>
            {a.kind === "pills" && a.options.map((o) => {
              const cur = BOOLEAN_KEYS.includes(a.key) ? (cfg[a.key] ? "yes" : "no") : String(cfg[a.key]);
              return <button key={String(o.id)} type="button" role="radio" aria-checked={String(o.id) === cur} onClick={() => pick(o.id)}>{o.name}</button>;
            })}
            {a.kind === "swatches" && COLOURS.map((c) => (
              <button key={c.id} type="button" role="radio" className="ck__sw" aria-checked={cfg[a.key] === c.id} aria-label={c.name} title={c.name} style={{ background: c.hex }} onClick={() => pickColour(c.id)} />
            ))}
            {a.kind === "multi" && a.options.map((o) => {
              const on = cfg.extras.includes(o.id as BagConfig["extras"][number]);
              return <button key={o.id} type="button" role="checkbox" aria-checked={on} onClick={() => set("extras", on ? cfg.extras.filter((x) => x !== o.id) : [...cfg.extras, o.id as BagConfig["extras"][number]])}>{o.name}</button>;
            })}
            {a.kind === "text" && <input className="ck__input" type="text" maxLength={30} value={cfg.extraText} placeholder="Up to 30 characters" aria-label="Your words" onChange={(e) => set("extraText", e.target.value)} />}
            {a.kind === "stepper" && (
              <div className="ck__stepper" role="group" aria-label="Quantity">
                <button type="button" aria-label="One fewer" onClick={() => set("quantity", Math.max(1, cfg.quantity - 1))}>−</button>
                <output>{cfg.quantity}</output>
                <button type="button" aria-label="One more" onClick={() => set("quantity", Math.min(500, cfg.quantity + 1))}>+</button>
              </div>
            )}
          </div>
          <button type="button" className="ck__icon ck__icon--go" onClick={done} aria-label="Next question: keep what is selected">›</button>
        </div>
        {errors.filter((i) => stepForKey(i.path) === def.id).map((i) => <p key={i.code} className="ck__err" role="alert">{i.message}</p>)}
      </section>
    </div>
  );
}
