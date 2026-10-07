import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopShell } from "@/components/shop/ShopShell";
import { SHOP_PRODUCTS, SHOP_STEPS, SHOP_TILES } from "@/lib/shop/catalogue";
import { LOGO_SRC, ORIGIN_LINE } from "@/lib/site";

/**
 * Home: a plain shop (owner, 7 Oct 2026). Top to bottom: hero, the products you can design in 3D, the range, who makes it, three steps,
 * fully custom work, what is true of every piece, and the ways onward. The 3D store it replaces is parked whole at /3d-store.
 */
export default function HomePage() {
  return (
    <ShopShell>
      <section className="sh-hero">
        <img className="sh-hero__pic" src="/assets/carousel/clip1.jpg" alt="Jesse Sanchez at his sewing machine in the workshop" width={1280} height={720} fetchPriority="high" />
        <div className="sh-wrap sh-hero__in">
          <p className="sh-hero__eyebrow">Sanchez Custom Boxing Equipment</p>
          <h1 className="sh-hero__title">
            <span>Make it</span> yours
          </h1>
          <p className="sh-hero__text">Pick your gear, colour every panel, add your logo and your name, and see it in 3D before it is made.</p>
          <div className="sh-actions">
            <Link className="sh-btn" href="/shop">
              Design in 3D
            </Link>
            <Link className="sh-btn sh-btn--light" href="/how-it-works">
              How it works
            </Link>
          </div>
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

      <section className="sh-wrap sh-sec">
        <h2 className="sh-h">Our range</h2>
        <div className="sh-tiles">
          {SHOP_TILES.map((t) => (
            <Link key={t.id} href={t.href} className="sh-tile" data-fill={t.fill || undefined}>
              <img src={t.image} alt={t.alt} loading="lazy" />
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="sh-wrap sh-sec sh-split">
        <div>
          <h2 className="sh-h">Made by hand, one piece at a time</h2>
          <p className="sh-lead">Sanchez Custom Boxing Equipment is Jesse Sanchez&apos;s workshop.</p>
          <p>Every piece is cut, stitched and printed by hand, in your colours, with your name and your logo on it.</p>
          <p className="sh-strong">{ORIGIN_LINE}</p>
        </div>
        <img className="sh-split__logo" src={LOGO_SRC} alt="" width={420} height={360} loading="lazy" />
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
            <h2 className="sh-h sh-h--onDark">Fully custom, on request</h2>
            <p>Want something the builder does not cover? Tell us what you have in mind and Jesse will tell you what can be made.</p>
            <ul className="sh-ticks">
              <li>Cut and stitched by hand</li>
              <li>Printed to your design</li>
              <li>Your colours, your logo, your name</li>
            </ul>
            <Link className="sh-btn" href="/contact">
              Get in touch
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

      <section className="sh-wrap sh-sec sh-end">
        <p>Design your own gear in 3D today, or talk to us about kitting out a whole gym.</p>
        <div className="sh-actions sh-actions--mid">
          <Link className="sh-btn" href="/shop">
            Design in 3D
          </Link>
          <Link className="sh-btn sh-btn--line" href="/gym-fit-outs">
            Gyms and clubs
          </Link>
          <Link className="sh-btn sh-btn--line" href="/contact">
            Contact
          </Link>
        </div>
      </section>
    </ShopShell>
  );
}
