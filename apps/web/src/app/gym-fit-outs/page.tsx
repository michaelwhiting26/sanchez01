import Link from "next/link";
import { ShopShell } from "@/components/shop/ShopShell";
import { JESSE_GYM } from "@/lib/shop/catalogue";

export const metadata = { title: "Gym Fit-Out | Sanchez Custom Boxing" };

/** Gym fit-outs: Jesse's own four steps, word for word from his current site. His questionnaire form is not rebuilt yet, so the action leads to contact. */
export default function GymFitOutsPage() {
  return (
    <ShopShell>
      <section className="sh-wrap sh-sec sh-sec--first">
        <p className="sh-crumb">Home / Gym Fit-Out</p>
        <h1 className="sh-h">{JESSE_GYM.title}</h1>
        <ol className="sh-how">
          {JESSE_GYM.steps.map((s, i) => (
            <li key={s.n}>
              <span className="sh-how__n" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h2>
                  <span className="visually-hidden">{s.n}: </span>
                  {s.title}
                </h2>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="sh-actions">
          <Link className="sh-btn" href="/contact">
            {JESSE_GYM.action}
          </Link>
        </div>
      </section>
    </ShopShell>
  );
}
