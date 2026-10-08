"use client";

import { useId, useState, type FormEvent } from "react";
import { QUOTE_PRODUCTS, quoteSchema, type QuoteField, type QuoteResult } from "@/lib/quote";

const FIELDS: readonly QuoteField[] = ["name", "contact", "product", "details"];

/** The quote request on /contact: name, a way to reply, the product and what is wanted. Checked here and again on the server (/api/quote). */
export function QuoteForm() {
  const id = useId();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; field?: QuoteField } | null>(null);

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
    try {
      const res = await fetch("/api/quote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(candidate) });
      const json = (await res.json()) as QuoteResult;
      if (!json.ok) {
        fail(json.message, json.field);
        return;
      }
      setDone(true);
    } catch {
      fail("Could not reach us. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="sh-form sh-form--done" role="status">
        <h2>Request sent.</h2>
        <p>Thank you. Jesse has what you asked for and will reply to the contact you gave.</p>
      </div>
    );
  }

  const invalid = (f: QuoteField) => (error?.field === f ? { "aria-invalid": true, "aria-describedby": `${id}-msg` } : {});

  return (
    <form className="sh-form" onSubmit={(e) => void onSubmit(e)} noValidate>
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
        <select id={`${id}-product`} name="product" defaultValue="" required {...invalid("product")}>
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
        <textarea id={`${id}-details`} name="details" rows={6} maxLength={4000} required {...invalid("details")} />
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
