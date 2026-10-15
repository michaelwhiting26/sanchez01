"use client";

import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";
import { quoteSchema, type QuoteProduct, type QuoteResult } from "@/lib/quote";
import type { Colourway, TickGroup } from "@/lib/shop/pieces";
import { DIRECT_MESSAGE_HREF } from "@/lib/shop/journey";
import { trackEvent } from "@/lib/track";

type Mode = "as-is" | "change";

interface Props {
  readonly slug: string;
  readonly name: string;
  readonly quoteProduct: QuoteProduct;
  readonly colourways: readonly Colourway[];
  readonly palette: ReadonlyArray<{ readonly name: string; readonly hex: string }>;
  readonly extras: readonly TickGroup[];
  readonly builderHref: string | null;
}

const QTY = ["1", "2", "3 to 5", "6 or more"] as const;
const WHEN = ["No rush", "Within a month", "For a fight date"] as const;
const CHANGES = ["Colours", "Add a name", "Add a logo", "Size or weight", "Something else"] as const;
const AS_PHOTOS = "As in the photos";

/**
 * The order page's request (owner, 15 Oct 2026: "a literal tick box exercise… they don't have to lift a finger").
 * Two flows on one form: "Order this one" (quantity, colourway, any product choices, when) and "This, but different"
 * (tick what changes; only the ticked things open a small field). Typing is limited to a name and a way to reply.
 * Sends to /api/quote like the long form; if the server cannot take it, the request is handed over to send on Instagram.
 */
export function TickOrder({ slug, name, quoteProduct, colourways, palette, extras, builderHref }: Props) {
  const id = useId();
  const [mode, setMode] = useState<Mode>("as-is");
  const [qty, setQty] = useState<string>(QTY[0]);
  const [colourway, setColourway] = useState<string>(AS_PHOTOS);
  const [changes, setChanges] = useState<readonly string[]>([]);
  const [main, setMain] = useState("");
  const [second, setSecond] = useState("");
  const [picks, setPicks] = useState<Readonly<Record<string, string>>>({});
  const [when, setWhen] = useState<string>(WHEN[0]);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [direct, setDirect] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "change") setMode("change");
  }, []);

  const changing = (c: string): boolean => changes.includes(c);
  const toggle = (c: string): void => setChanges((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  function details(form: FormData): string {
    const text = (k: string): string => {
      const v = form.get(k);
      return typeof v === "string" ? v.trim() : "";
    };
    const lines = [mode === "as-is" ? `Order this one: ${name}` : `This, but different: ${name}`, `How many: ${qty}`];
    if (mode === "as-is") lines.push(`Colourway: ${colourway}`);
    for (const g of extras) if (picks[g.id]) lines.push(`${g.label}: ${picks[g.id]}`);
    if (mode === "change") {
      if (changing("Colours")) lines.push(`Colours: main ${main || "Jesse to suggest"}${second ? `, second ${second}` : ""}`);
      if (changing("Add a name")) lines.push(`Name to add: ${text("printName") || "to confirm"}`);
      if (changing("Add a logo")) lines.push("Logo: I will send it to Jesse on Instagram");
      if (changing("Size or weight")) lines.push(`Size or weight: ${text("size") || "to confirm"}`);
      if (changing("Something else")) lines.push(`Also: ${text("other") || "to discuss"}`);
      if (changes.length === 0) lines.push("Changes: to discuss with Jesse");
    }
    const date = text("fightDate");
    lines.push(`Needed: ${when}${when === "For a fight date" && date ? ` (${date})` : ""}`);
    return lines.join("\n");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const field = (k: string): string => {
      const v = form.get(k);
      return typeof v === "string" ? v : "";
    };
    const candidate = { name: field("name"), contact: field("contact"), product: quoteProduct, details: details(form), company: field("company") };
    const parsed = quoteSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    setError("");
    setBusy(true);
    const written = `Sanchez order request\nName: ${candidate.name.trim()}\nReply to: ${candidate.contact.trim()}\n\n${candidate.details}`;
    try {
      const res = await fetch("/api/quote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(candidate) });
      const json = (await res.json()) as QuoteResult;
      if (json.ok) {
        setSent(true);
        trackEvent("piece_sent", { product: slug, mode });
      } else if (json.field) {
        setError(json.message);
      } else {
        setDirect(written);
        trackEvent("piece_fallback", { product: slug, mode });
      }
    } catch {
      setDirect(written);
      trackEvent("piece_fallback", { product: slug, mode });
    } finally {
      setBusy(false);
    }
  }

  if (direct) {
    return (
      <div className="sh-form sh-form--direct" role="status">
        <h2>Send it to Jesse directly</h2>
        <p>We could not send your request from here, so here it is, written out. Copy it and send it to Jesse on Instagram, with any photos or your logo.</p>
        <pre className="sh-form__text">{direct}</pre>
        <div className="sh-actions">
          <button
            type="button"
            className="sh-btn"
            onClick={() => {
              trackEvent("piece_copy");
              void navigator.clipboard.writeText(direct).then(
                () => setCopied(true),
                () => setCopied(false),
              );
            }}
          >
            {copied ? "Copied" : "Copy my request"}
          </button>
          <a className="sh-btn sh-btn--line" href={DIRECT_MESSAGE_HREF} target="_blank" rel="noopener noreferrer" data-track="quote_instagram">
            Message Jesse on Instagram
          </a>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="sh-form sh-form--done" role="status">
        <h2>Sent to Jesse.</h2>
        <p>He will reply with a quote to the contact you gave.</p>
        <p>
          Got photos or a logo?{" "}
          <a href={DIRECT_MESSAGE_HREF} target="_blank" rel="noopener noreferrer" data-track="quote_instagram">
            Send them to Jesse on Instagram
          </a>{" "}
          with your name.
        </p>
      </div>
    );
  }

  const chip = (group: string, value: string, checked: boolean, onChange: () => void, swatch?: readonly string[]) => (
    <label key={`${group}-${value}`} className="sh-chip">
      <input type="radio" name={`${id}-${group}`} value={value} checked={checked} onChange={onChange} />
      <span>
        {swatch ? (
          <i className="sh-sw" aria-hidden="true" style={{ background: swatch.length > 1 ? `linear-gradient(135deg, ${swatch[0]} 50%, ${swatch[1]} 50%)` : swatch[0] }} />
        ) : null}
        {value}
      </span>
    </label>
  );

  return (
    <form className="sh-form sh-tick" onSubmit={(e) => void onSubmit(e)} noValidate>
      <div className="sh-seg" role="radiogroup" aria-label="How do you want it?">
        {(["as-is", "change"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            className="sh-seg__opt"
            onClick={() => {
              setMode(m);
              trackEvent(m === "as-is" ? "piece_mode_as_is" : "piece_mode_change", { product: slug });
            }}
          >
            {m === "as-is" ? "Order this one" : "This, but different"}
          </button>
        ))}
      </div>

      <fieldset>
        <legend>How many?</legend>
        <div className="sh-chips">{QTY.map((q) => chip("qty", q, qty === q, () => setQty(q)))}</div>
      </fieldset>

      {mode === "as-is" ? (
        <fieldset>
          <legend>Colourway</legend>
          <div className="sh-chips">
            {chip("way", AS_PHOTOS, colourway === AS_PHOTOS, () => setColourway(AS_PHOTOS))}
            {colourways.map((c) => chip("way", c.name, colourway === c.name, () => setColourway(c.name), c.swatch))}
          </div>
        </fieldset>
      ) : (
        <fieldset>
          <legend>What do you want to change? Tick all that apply</legend>
          <div className="sh-chips">
            {CHANGES.map((c) => (
              <label key={c} className="sh-chip">
                <input type="checkbox" checked={changing(c)} onChange={() => toggle(c)} />
                <span>{c}</span>
              </label>
            ))}
          </div>
          {changing("Colours") ? (
            <div className="sh-tick__more">
              <p className="sh-tick__label">Main colour</p>
              <div className="sh-chips">{palette.map((c) => chip("main", c.name, main === c.name, () => setMain(c.name), [c.hex]))}</div>
              <p className="sh-tick__label">Second colour (optional)</p>
              <div className="sh-chips">{palette.map((c) => chip("second", c.name, second === c.name, () => setSecond(c.name), [c.hex]))}</div>
            </div>
          ) : null}
          {changing("Add a name") ? (
            <div className="sh-form__field sh-tick__more">
              <label htmlFor={`${id}-printName`}>Name or words to add</label>
              <input id={`${id}-printName`} name="printName" type="text" maxLength={40} />
            </div>
          ) : null}
          {changing("Add a logo") ? <p className="sh-tick__note">After you send this, send your logo to Jesse on Instagram.</p> : null}
          {changing("Size or weight") ? (
            <div className="sh-form__field sh-tick__more">
              <label htmlFor={`${id}-size`}>Size or weight</label>
              <input id={`${id}-size`} name="size" type="text" maxLength={40} />
            </div>
          ) : null}
          {changing("Something else") ? (
            <div className="sh-form__field sh-tick__more">
              <label htmlFor={`${id}-other`}>What else?</label>
              <input id={`${id}-other`} name="other" type="text" maxLength={200} />
            </div>
          ) : null}
        </fieldset>
      )}

      {extras.map((g) => (
        <fieldset key={g.id}>
          <legend>{g.label}</legend>
          <div className="sh-chips">{g.options.map((o) => chip(g.id, o, picks[g.id] === o, () => setPicks((cur) => ({ ...cur, [g.id]: o }))))}</div>
        </fieldset>
      ))}

      <fieldset>
        <legend>When do you need it?</legend>
        <div className="sh-chips">{WHEN.map((w) => chip("when", w, when === w, () => setWhen(w)))}</div>
        {when === "For a fight date" ? (
          <div className="sh-form__field sh-tick__more">
            <label htmlFor={`${id}-date`}>Fight date</label>
            <input id={`${id}-date`} name="fightDate" type="date" />
          </div>
        ) : null}
      </fieldset>

      <fieldset>
        <legend>Where should Jesse reply?</legend>
        <div className="sh-tick__two">
          <div className="sh-form__field">
            <label htmlFor={`${id}-name`}>Your name</label>
            <input id={`${id}-name`} name="name" type="text" autoComplete="name" maxLength={120} required />
          </div>
          <div className="sh-form__field">
            <label htmlFor={`${id}-contact`}>Email or Instagram</label>
            <input id={`${id}-contact`} name="contact" type="text" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} required />
          </div>
        </div>
      </fieldset>
      <div className="sh-form__trap" aria-hidden="true">
        <label htmlFor={`${id}-company`}>Company</label>
        <input id={`${id}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="sh-form__msg" role="alert">
        {error}
      </p>
      <button className="sh-btn sh-tick__send" type="submit" disabled={busy}>
        {busy ? "Sending" : "Send to Jesse for a quote"}
      </button>
      <p className="sh-tick__small">No payment now. Jesse replies with a price; you approve the design before anything is made.</p>
      {builderHref ? (
        <p className="sh-tick__small">
          Want to colour every panel yourself?{" "}
          <Link href={builderHref} data-track="piece_to_3d" data-track-product={slug}>
            Design it in 3D
          </Link>
        </p>
      ) : null}
    </form>
  );
}
