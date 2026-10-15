import Link from "next/link";
import { BuildCard } from "@/components/shop/BuildCard";
import { Motion } from "@/components/shop/Motion";
import { ShopShell } from "@/components/shop/ShopShell";
import { WorkGallery } from "@/components/shop/WorkGallery";
import { JESSE_CONSULTATION, JESSE_FEATURES, JESSE_HEADLINE, JESSE_QUOTE_TITLE, SHOP_CRAFT, SHOP_PRODUCTS } from "@/lib/shop/catalogue";
import { DOORS, ORDER_STEPS, STORY } from "@/lib/shop/journey";
import { ORIGIN_LINE } from "@/lib/site";

/**
 * Home (owner, 15 Oct 2026, after the competitor research): Jesse's own look kept, his workshop film playing as you land, then three ways
 * to get a piece (one of Jesse's builds, tell Jesse what you want, or design it in 3D), Jesse's builds with "Order this one" and
 * "This, but different", the craft, his story (film to come), what happens after a request, the features and the quote request.
 * Motion: Lenis smooth scroll and GSAP scroll reveals (components/shop/Motion.tsx), off for reduced motion. The 3D store is parked at /3d-store.
 */
export default function HomePage() {
  return (
    <ShopShell>
      <Motion />
      <section className="sh-hero">
        <video
          className="sh-hero__pic"
          data-hero-zoom
          src="/assets/carousel/clip1.mp4"
          poster="/assets/carousel/clip1.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Jesse Sanchez at his sewing machine in the workshop"
        />
        <div className="sh-wrap sh-hero__in">
          <p className="sh-hero__eyebrow">Sanchez Custom Boxing Equipment</p>
          <h1 className="sh-hero__title">
            <span>{JESSE_HEADLINE}</span> Handmade.
          </h1>
          <p className="sh-hero__text">{ORIGIN_LINE}</p>
          <div className="sh-actions">
            <Link className="sh-btn" href="#builds">
              See Jesse&apos;s builds
            </Link>
            <Link className="sh-btn sh-btn--light" href="/contact?start=new">
              Make one for me
            </Link>
          </div>
        </div>
      </section>

      <section className="sh-wrap sh-sec" aria-labelledby="doors-h">
        <h2 className="sh-h" id="doors-h" data-reveal>
          Three ways to get yours
        </h2>
        <div className="sh-doors" data-reveal-stagger>
          {DOORS.map((d) => (
            <article key={d.n} className="sh-door">
              <span className="sh-door__n" aria-hidden="true">
                {d.n}
              </span>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
              <Link className="sh-btn sh-btn--small sh-btn--line" href={d.href}>
                {d.action}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="sh-wrap sh-sec" id="builds" aria-labelledby="builds-h">
        <h2 className="sh-h" id="builds-h" data-reveal>
          Jesse&apos;s builds
        </h2>
        <p className="sh-lede" data-reveal>
          Pieces Jesse has made. Order one as it is, ask for it your way, or design your own in 3D.
        </p>
        <div className="sh-builds" data-reveal-stagger>
          {SHOP_PRODUCTS.map((p) => (
            <BuildCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <section className="sh-wrap sh-sec">
        <h2 className="sh-h" data-reveal>
          Made by hand
        </h2>
        <div className="sh-craft" data-reveal-stagger>
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

      <section className="sh-wrap sh-sec" data-reveal>
        <WorkGallery />
      </section>

      <section className="sh-wrap sh-sec" aria-labelledby="story-h">
        <div className="sh-story">
          <video data-parallax src="/assets/carousel/clip3.mp4" poster="/assets/carousel/clip3.jpg" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
          <div className="sh-story__in" data-reveal>
            <span className="sh-story__tag">{STORY.tag}</span>
            <h2 className="sh-h sh-h--onDark" id="story-h">
              {STORY.title}
            </h2>
            <p>{STORY.text}</p>
            <a className="sh-btn sh-btn--light" href={STORY.href} target="_blank" rel="noopener noreferrer">
              {STORY.action}
            </a>
          </div>
        </div>
      </section>

      <section className="sh-wrap sh-sec" aria-labelledby="next-h">
        <h2 className="sh-h" id="next-h" data-reveal>
          What happens next
        </h2>
        <ol className="sh-next" data-reveal-stagger>
          {ORDER_STEPS.map((s) => (
            <li key={s.n}>
              <span className="sh-next__n" aria-hidden="true">
                {s.n}
              </span>
              <b>{s.title}</b>
              <span>{s.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="sh-wrap sh-sec">
        <h2 className="sh-h" data-reveal>
          Key Features
        </h2>
        <div className="sh-feats" data-reveal-stagger>
          {JESSE_FEATURES.map((f) => (
            <article key={f.title} className="sh-feat">
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <Link href="/contact?start=new">{JESSE_CONSULTATION.action}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="sh-wrap sh-sec" data-reveal>
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

      <section className="sh-wrap sh-sec" data-reveal>
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
        <h2 className="sh-h sh-h--mid" data-reveal>
          {JESSE_QUOTE_TITLE}
        </h2>
        <div className="sh-actions sh-actions--mid">
          <Link className="sh-btn" href="/contact?start=new">
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
