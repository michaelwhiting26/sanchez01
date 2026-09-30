"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

/** The deposit payment. Real Stripe Elements when the publishable key is set and the server opened a real intent; otherwise a clearly-labelled test button. */
export interface CheckoutResult {
  token: string;
  clientSecret: string;
  mode: "stripe" | "mock";
  book: "live" | "test";
  totalMinor: number;
  depositMinor: number;
  currency: string;
}

const PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = PK && /^pk_(test|live)_/.test(PK) && !PK.includes("placeholder") ? loadStripe(PK) : null;

function StripeForm({ token }: { token: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setBusy(true);
        void stripe.confirmPayment({ elements, confirmParams: { return_url: `${window.location.origin}/order/${token}` } }).then((r) => {
          if (r.error) setErr(r.error.message ?? "Payment failed");
          setBusy(false);
        });
      }}
    >
      <PaymentElement />
      <div className="pg__actions">
        <button className="pg__btn" type="submit" disabled={busy || !stripe}>
          {busy ? "Paying…" : "Pay the deposit"}
        </button>
      </div>
      {err ? <p className="pg__note" role="alert">{err}</p> : null}
    </form>
  );
}

export function PaymentStep({ checkout }: { checkout: CheckoutResult }) {
  const [busy, setBusy] = useState(false);
  if (checkout.mode === "stripe" && stripePromise) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret: checkout.clientSecret, appearance: { theme: "night" } }}>
        <StripeForm token={checkout.token} />
      </Elements>
    );
  }
  return (
    <div>
      <p className="pg__note">Payments are not connected yet. This is a test payment: it marks the deposit as paid in development only.</p>
      <div className="pg__actions">
        <button
          className="pg__btn"
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void fetch("/api/checkout/mock-pay", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: checkout.token }) }).then(() => {
              window.location.href = `/order/${checkout.token}`;
            });
          }}
        >
          {busy ? "Working…" : "Pay the deposit (test)"}
        </button>
      </div>
    </div>
  );
}
