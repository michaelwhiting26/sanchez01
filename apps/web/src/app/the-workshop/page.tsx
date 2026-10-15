import Link from "next/link";
import { ShopShell } from "@/components/shop/ShopShell";
import { WorkGallery } from "@/components/shop/WorkGallery";
import { JESSE_CONSULTATION, JESSE_FEATURES, SHOP_CRAFT } from "@/lib/shop/catalogue";

export const metadata = { title: "The workshop | Sanchez Custom Boxing" };

/**
 * The workshop (owner, 15 Oct 2026): everything about how Jesse makes it, moved off the home page so the home page stays a straight
 * path to ordering. The craft, his past work on the range slider, the four key features and his design consultation, then back to ordering.
 */
export default function WorkshopPage() {
  return (
    <ShopShell>
      <section className="sh-wrap sh-sec sh-sec--first">
        <p className="sh-crumb">
          <Link href="/">Home</Link> / The workshop
        </p>
        <h1 className="sh-h">The workshop</h1>
        <p className="sh-lede">How Jesse makes it, and pieces he has made. When you are ready, it all starts with a request.</p>
        <div className="sh-actions sh-actions--mid">
          <Link className="sh-btn" href="/#choose">
            Get yours made
          </Link>
          <Link className="sh-btn sh-btn--line" href="/contact?start=new">
            Get a Quote
          </Link>
        </div>
      </section>

      <section className="sh-wrap sh-sec">
        <h2 className="sh-h">Made by hand</h2>
        <div className="sh-craft">
          {SHOP_CRAFT.map((c) => (
            <figure key={c.title}>
              <img src={c.image} alt={c.alt} width={800} height={1000} loading="lazy" style={c.at ? { objectPosition: c.at } : undefined} />
              <figcaption>
                <strong>{c.title}</strong>
                <span>{c.text}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="sh-wrap sh-sec">
        <WorkGallery />
      </section>

      <section className="sh-wrap sh-sec">
        <h2 className="sh-h">Key Features</h2>
        <div className="sh-feats">
          {JESSE_FEATURES.map((f) => (
            <article key={f.title} className="sh-feat">
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <Link href="/contact?start=new">{JESSE_CONSULTATION.action}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="sh-wrap sh-sec">
        <div className="sh-dark">
          <div>
            <h2 className="sh-h sh-h--onDark">{JESSE_CONSULTATION.title}</h2>
            <ul className="sh-ticks">
              {JESSE_CONSULTATION.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <Link className="sh-btn" href="/contact?start=new">
              {JESSE_CONSULTATION.action}
            </Link>
          </div>
          <div className="sh-dark__pics" aria-hidden="true">
            <img src="/assets/carousel/clip2.jpg" alt="" loading="lazy" />
            <img src="/assets/carousel/clip3.jpg" alt="" loading="lazy" />
            <img src="/assets/carousel/clip5.jpg" alt="" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="sh-wrap sh-sec sh-end">
        <h2 className="sh-h sh-h--mid">Ready when you are</h2>
        <div className="sh-actions sh-actions--mid">
          <Link className="sh-btn" href="/#choose">
            Get yours made
          </Link>
          <Link className="sh-btn sh-btn--line" href="/contact?start=new">
            Tell Jesse what you want
          </Link>
        </div>
      </section>
    </ShopShell>
  );
}
