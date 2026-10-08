import Link from "next/link";
import { ShopShell } from "@/components/shop/ShopShell";
import { SHOP_STEPS } from "@/lib/shop/catalogue";
import { CONTACT_HREF } from "@/lib/site";

export const metadata = { title: "How it works | Sanchez Custom Boxing" };

/** How to design a piece, in three steps. States only what the builders do today: no prices, timings or delivery promises until Jesse confirms them. */
export default function HowItWorksPage() {
  return (
    <ShopShell>
      <section className="sh-wrap sh-sec sh-sec--first">
        <p className="sh-crumb">Home / How it works</p>
        <h1 className="sh-h">How it works</h1>
        <ol className="sh-how">
          {SHOP_STEPS.map((s) => (
            <li key={s.n}>
              <span className="sh-how__n">{s.n}</span>
              <div>
                <h2>{s.title}</h2>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="sh-facts">
          <h2 className="sh-h sh-h--small">Good to know</h2>
          <ul>
            <li>Your design is saved on your own phone or computer, so you can come back to it.</li>
            <li>A logo you add stays in your browser. It is not sent anywhere.</li>
            <li>The gloves and guards in the builder are illustrative shapes until Jesse&apos;s own patterns are in.</li>
            <li>Prices, sizes and delivery times will be listed here once they are confirmed.</li>
          </ul>
        </div>
        <div className="sh-actions">
          <Link className="sh-btn" href="/shop">
            Design in 3D
          </Link>
          <Link className="sh-btn sh-btn--line" href={CONTACT_HREF}>
            Get a Quote
          </Link>
        </div>
      </section>
    </ShopShell>
  );
}
