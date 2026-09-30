"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { RollingSubmit } from "@/components/ui/RollingButton";
import { WAITLIST_LINES, waitlistSchema, type WaitlistMethod } from "@/lib/waitlist";

const STORE_KEY = "sz.waitlist";
const METHODS: readonly { value: WaitlistMethod; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "gmail", label: "Gmail" },
  { value: "other", label: "Other" },
];

/** Types the five FOMO lines into the field's placeholder on a loop; stops the moment the field is focused, resumes when it is left empty. */
function useTypingPlaceholder(input: React.RefObject<HTMLInputElement | null>, enabled: boolean): void {
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.placeholder = WAITLIST_LINES[0];
    if (reduce || !enabled) return;
    let timer = 0;
    let line = 0;
    let chars = 0;
    let deleting = false;
    let typing = true;
    const tick = (): void => {
      if (!typing) return;
      const text = WAITLIST_LINES[line] ?? "";
      if (!deleting) {
        chars++;
        el.placeholder = `${text.slice(0, chars)}|`;
        if (chars >= text.length) {
          deleting = true;
          timer = window.setTimeout(tick, 1900);
          return;
        }
        timer = window.setTimeout(tick, 52 + Math.random() * 46);
      } else {
        chars--;
        el.placeholder = chars > 0 ? `${text.slice(0, chars)}|` : " ";
        if (chars <= 0) {
          deleting = false;
          line = (line + 1) % WAITLIST_LINES.length;
          timer = window.setTimeout(tick, 420);
          return;
        }
        timer = window.setTimeout(tick, 22);
      }
    };
    const stop = (): void => {
      typing = false;
      window.clearTimeout(timer);
      el.placeholder = WAITLIST_LINES[0];
    };
    const resume = (): void => {
      if (el.value) return;
      typing = true;
      chars = 0;
      deleting = false;
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, 400);
    };
    timer = window.setTimeout(tick, 900);
    el.addEventListener("focus", stop);
    el.addEventListener("blur", resume);
    return () => {
      typing = false;
      window.clearTimeout(timer);
      el.removeEventListener("focus", stop);
      el.removeEventListener("blur", resume);
    };
  }, [input, enabled]);
}

export function Waitlist() {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [method, setMethod] = useState<WaitlistMethod>("email");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORE_KEY)) setDone(true);
    } catch {
      /* storage can be blocked: the form simply stays open */
    }
  }, []);
  useTypingPlaceholder(inputRef, !done);

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const field = (name: string): string => {
      const v = form.get(name);
      return typeof v === "string" ? v : "";
    };
    const candidate = { email: field("email"), method, company: field("company") };
    const parsed = waitlistSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message?.startsWith("Invalid") ? "That email does not look right." : (parsed.error.issues[0]?.message ?? "That email does not look right."));
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/waitlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(candidate) });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!json.ok) {
        setError(json.message ?? "Something went wrong. Please try again.");
        return;
      }
      try {
        window.localStorage.setItem(STORE_KEY, `${parsed.data.email} (${method})`);
      } catch {
        /* ignore */
      }
      setDone(true);
    } catch {
      setError("Could not reach us. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`waitlist${done ? " is-done" : ""}`} id="waitlist" aria-labelledby={`${id}-title`}>
      <div className="waitlist__inner">
        <h2 className="waitlist__title" id={`${id}-title`}>
          Waitlist
        </h2>
        <ol className="waitlist__reveal" aria-label="What is coming">
          <li>
            <span className="waitlist__t">Bag</span>
          </li>
          <li>
            <span className="waitlist__bar" aria-hidden="true" />
            <span className="visually-hidden">Not announced</span>
          </li>
          <li>
            <span className="waitlist__bar waitlist__bar--long" aria-hidden="true" />
            <span className="visually-hidden">Not announced</span>
          </li>
        </ol>
        <form className="waitlist__form" onSubmit={(e) => void onSubmit(e)} noValidate>
          {!done && (
            <div className="waitlist__method" role="radiogroup" aria-label="Sign up with">
              {METHODS.map((m) => (
                <label key={m.value}>
                  <input type="radio" name="method" value={m.value} checked={method === m.value} onChange={() => { setMethod(m.value); setError(null); }} />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>
          )}
          <label className="waitlist__label" htmlFor={`${id}-email`}>
            Email address
          </label>
          <div className="waitlist__row">
            <input
              className="waitlist__input"
              id={`${id}-email`}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              ref={inputRef}
              required
              aria-label="Email address"
              aria-describedby={`${id}-msg`}
              aria-invalid={error ? true : undefined}
            />
            <input className="waitlist__hp" type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <RollingSubmit label="Submit" className="waitlist__btn" disabled={busy} />
          </div>
          <p className={`waitlist__msg${error ? " is-error" : ""}`} id={`${id}-msg`} role="status" aria-live="polite">
            {done ? "You are in." : (error ?? "")}
          </p>
          <a className="waitlist__priv" href="/legal/privacy">
            Privacy
          </a>
        </form>
      </div>
    </section>
  );
}
