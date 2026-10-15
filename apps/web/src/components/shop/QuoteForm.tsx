"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { QUOTE_PRODUCTS, quoteSchema, type QuoteField, type QuoteResult } from "@/lib/quote";
import { clearDesign, readDesign, type DesignHandoff } from "@/lib/quote-handoff";
import { DIRECT_MESSAGE_HREF, startText } from "@/lib/shop/journey";
import { trackEvent } from "@/lib/track";

const FIELDS: readonly QuoteField[] = ["name", "contact", "product", "details"];

/**
 * The quote request on /contact: name, a way to reply, the product and what is wanted. Checked here and again on the server (/api/quote).
 * A visitor arriving from a 3D builder finds the product chosen and the design written in; one arriving from "Order this one",
 * "This, but different" or "Tell Jesse" (?product=&start=&piece=) finds the product chosen and a few prompts to fill in.
 * If the server cannot take the request, nothing is lost: the visitor gets it written out to copy and send to Jesse on Instagram.
 */
export function QuoteForm() {
  const id = useId();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; field?: QuoteField } | null>(null);
  const [design, setDesign] = useState<DesignHandoff | null>(null);
  const [prefill, setPrefill] = useState<{ product: string; details: string } | null>(null);
  const [direct, setDirect] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const saved = readDesign(); // session storage is only there in the browser, so the design arrives after the first paint
    setDesign(saved);
    if (saved) return;
    const sp = new URLSearchParams(window.location.search);
    const asked = sp.get("product") ?? "";
    const product = QUOTE_PRODUCTS.some((p) => p.value === asked) ? asked : "";
    const details = startText(sp.get("start"), sp.get("piece"));
    if (product || details) setPrefill({ product, details });
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const el = e.currentTarget;
    const form = new FormData(el);
    const field = (name: string): string => {
      const v = form.get(name);
      return typeof v === "string" ? v : "";
    };
    const fail = (message: string, at?: QuoteField): void => {
      setError(at ? { message, field: at } : { message });
      if (at) el.querySelector<HTMLElement>(`[name="${at}"]`)?.focus();
    };
    const candidate = { name: field("name"), contact: field("contact"), product: field("product"), details: field("details"), company: field("company") };
    const parsed = quoteSchema.safeParse(candidate);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      fail(issue?.message ?? "Please check the form.", FIELDS.find((f) => f === issue?.path[0]));
      return;
    }
    setError(null);
    setBusy(true);
    const label = QUOTE_PRODUCTS.find((p) => p.value === candidate.product)?.label ?? candidate.product;
    const written = `Sanchez quote request\nName: ${candidate.name.trim()}\nReply to: ${candidate.contact.trim()}\nProduct: ${label}\n\n${candidate.details.trim()}`;
    try {
      const res = await fetch("/api/quote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(candidate) });
      const json = (await res.json()) as QuoteResult;
      if (!json.ok) {
        if (json.field) fail(json.message, json.field);
        else {
          setDirect(written); // the server could not take it: hand it to the visitor to send to Jesse directly
          trackEvent("quote_fallback", { product: candidate.product });
        }
        return;
      }
      clearDesign();
      setDone(true);
      trackEvent("quote_sent", { product: candidate.product });
    } catch {
      setDirect(written);
      trackEvent("quote_fallback", { product: candidate.product });
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
              trackEvent("quote_copy");
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

  if (done) {
    return (
      <div className="sh-form sh-form--done" role="status">
        <h2>Request sent.</h2>
        <p>Thank you. Jesse has what you asked for and will reply to the contact you gave.</p>
        <p>
          Got photos or a logo?{" "}
          <a href={DIRECT_MESSAGE_HREF} target="_blank" rel="noopener noreferrer">
            Send them to Jesse on Instagram
          </a>{" "}
          with your name.
        </p>
      </div>
    );
  }

  const invalid = (f: QuoteField) => (error?.field === f ? { "aria-invalid": true, "aria-describedby": `${id}-msg` } : {});

  return (
    <form
      key={design ? "design" : prefill ? "prefill" : "blank"}
      className="sh-form"
      onSubmit={(e) => void onSubmit(e)}
      onFocusCapture={() => {
        if (started.current) return;
        started.current = true;
        trackEvent("quote_form_start");
      }}
      noValidate
    >
      {design ? <p className="sh-form__design">Your 3D design is filled in below. Add anything else Jesse should know, such as size or weight.</p> : null}
      <div className="sh-form__field">
        <label htmlFor={`${id}-name`}>Name</label>
        <input id={`${id}-name`} name="name" type="text" autoComplete="name" maxLength={120} required {...invalid("name")} />
      </div>
      <div className="sh-form__field">
        <label htmlFor={`${id}-contact`}>Email or Instagram</label>
        <input id={`${id}-contact`} name="contact" type="text" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} required {...invalid("contact")} />
      </div>
      <div className="sh-form__field">
        <label htmlFor={`${id}-product`}>Product</label>
        <select id={`${id}-product`} name="product" defaultValue={design?.product ?? prefill?.product ?? ""} required {...invalid("product")}>
          <option value="" disabled>
            Choose one
          </option>
          {QUOTE_PRODUCTS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="sh-form__field">
        <label htmlFor={`${id}-details`}>What do you want made?</label>
        <textarea id={`${id}-details`} name="details" rows={design || prefill ? 10 : 6} maxLength={4000} defaultValue={design?.details ?? prefill?.details ?? ""} required {...invalid("details")} />
      </div>
      <div className="sh-form__trap" aria-hidden="true">
        <label htmlFor={`${id}-company`}>Company</label>
        <input id={`${id}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="sh-form__msg" id={`${id}-msg`} role="alert">
        {error?.message ?? ""}
      </p>
      <button className="sh-btn" type="submit" disabled={busy}>
        {busy ? "Sending" : "Send request"}
      </button>
    </form>
  );
}
