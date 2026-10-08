import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopShell } from "@/components/shop/ShopShell";
import { WorkGallery } from "@/components/shop/WorkGallery";
import { JESSE_CONSULTATION, JESSE_FEATURES, JESSE_HEADLINE, JESSE_QUOTE_TITLE, SHOP_CRAFT, SHOP_PRODUCTS, SHOP_STEPS } from "@/lib/shop/catalogue";
import { ORIGIN_LINE } from "@/lib/site";

/**
 * Home: a plain shop (owner, 7 Oct 2026). Top to bottom: hero, the craft strip (owner, 8 Oct 2026: the maker, a finished piece, the construction,
 * the gym, before any technical detail), the range slider over the workshop pictures, four key features, three steps, his design consultation,
 * what is true of every piece, the products you can design in 3D (owner, 7 Oct 2026: at the bottom), and the quote request. Headlines are
 * Jesse's own (lib/shop/catalogue.ts). The 3D store it replaces is parked whole at /3d-store.
 */
export default function HomePage() {
  return (
    <ShopShell>
      <section className="sh-hero">
        <img className="sh-hero__pic" src="/assets/carousel/clip1.jpg" alt="Jesse Sanchez at his sewing machine in the workshop" width={1280} height={720} fetchPriority="high" />
        <div className="sh-wrap sh-hero__in">
          <p className="sh-hero__eyebrow">Sanchez Custom Boxing Equipment</p>
          <h1 className="sh-hero__title">
            <span>{JESSE_HEADLINE}</span> Handmade.
          </h1>
          <p className="sh-hero__text">{ORIGIN_LINE}</p>
          <div className="sh-actions">
            <Link className="sh-btn" href="/shop">
              Design in 3D
            </Link>
            <Link className="sh-btn sh-btn--light" href="/contact">
              {JESSE_CONSULTATION.action}
            </Link>
          </div>
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
              <Link href="/contact">{JESSE_CONSULTATION.action}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="sh-wrap sh-sec sh-simple">
        <h2 className="sh-h sh-h--boxed">As simple as 1. 2. 3.</h2>
        <ol className="sh-steps">
          {SHOP_STEPS.map((s) => (
            <li key={s.n}>
              <span className="sh-steps__n" aria-hidden="true">
                {s.n}
              </span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="sh-actions sh-actions--mid">
          <Link className="sh-btn" href="/shop">
            Design in 3D
          </Link>
          <Link className="sh-btn sh-btn--line" href="/how-it-works">
            How it works
          </Link>
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
            <Link className="sh-btn" href="/contact">
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

      <section className="sh-wrap sh-sec">
        <div className="sh-true">
          <ul>
            <li>Designed in Sydney</li>
            <li>Handmade in Pattaya</li>
            <li>Made to order, one piece at a time</li>
            <li>See it in 3D before it is made</li>
          </ul>
          <img src="/assets/store/collection/bag-range.webp" alt="Jesse Sanchez standing among a row of his heavy bags in a gym" width={560} height={560} loading="lazy" />
        </div>
      </section>

      <section className="sh-wrap sh-sec">
        <h2 className="sh-h">Design in 3D</h2>
        <div className="sh-row">
          {SHOP_PRODUCTS.map((p) => (
            <ProductCard key={p.slug} product={p} compact />
          ))}
        </div>
      </section>

      <section className="sh-wrap sh-sec sh-end">
        <h2 className="sh-h sh-h--mid">{JESSE_QUOTE_TITLE}</h2>
        <div className="sh-actions sh-actions--mid">
          <Link className="sh-btn" href="/contact">
            {JESSE_CONSULTATION.action}
          </Link>
          <Link className="sh-btn sh-btn--line" href="/shop">
            Design in 3D
          </Link>
          <Link className="sh-btn sh-btn--line" href="/gym-fit-outs">
            Gym Fit-Out
          </Link>
        </div>
      </section>
    </ShopShell>
  );
}
