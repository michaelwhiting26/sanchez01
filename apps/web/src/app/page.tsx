import Link from "next/link";
import { BuildCard } from "@/components/shop/BuildCard";
import { Motion } from "@/components/shop/Motion";
import { ShopShell } from "@/components/shop/ShopShell";
import { StickyOrder } from "@/components/shop/StickyOrder";
import { JESSE_HEADLINE, SHOP_CRAFT, SHOP_PRODUCTS } from "@/lib/shop/catalogue";
import { ORDER_STEPS, STORY } from "@/lib/shop/journey";
import { ORIGIN_LINE } from "@/lib/site";

/**
 * Home as a buying path (owner, 15 Oct 2026: "make that homepage as efficient as possible… guided back again and again to making an order").
 * Each section answers the buyer's next question and ends in the order path:
 *   1. hook: Jesse's workshop film, one main action;  2. choose: what do you want made (Jesse's pieces, three ways to order each, gym fit-out);
 *   3. how it works: six steps, then "Start your order";  4. proof: made by hand, compact, with the workshop one tap away;
 *   5. Jesse's story (film to come), then "Get yours made";  6. close.  On phones an order bar stays at the bottom after the film.
 * The craft detail, past work, key features and consultation live on /the-workshop, so they are on the site but out of the buying path.
 */
export default function HomePage() {
  return (
    <ShopShell>
      <Motion />
      <StickyOrder />

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
          <p className="sh-hero__text">Gloves, bags, pads and guards, made to order by Jesse Sanchez. {ORIGIN_LINE}</p>
          <div className="sh-actions">
            <Link className="sh-btn" href="#choose">
              Get yours made
            </Link>
            <Link className="sh-btn sh-btn--light" href="/contact?start=new">
              Tell Jesse what you want
            </Link>
          </div>
        </div>
      </section>

      <section className="sh-wrap sh-sec" id="choose" aria-labelledby="choose-h">
        <h2 className="sh-h" id="choose-h" data-reveal>
          What do you want made?
        </h2>
        <p className="sh-lede" data-reveal>
          Order one of Jesse&apos;s as it is, ask for it your way, or design your own in 3D. Every order starts with a quote from Jesse.
        </p>
        <div className="sh-builds" data-reveal-stagger>
          {SHOP_PRODUCTS.map((p) => (
            <BuildCard key={p.slug} product={p} />
          ))}
          <article className="sh-card sh-card--build sh-card--gym">
            <span className="sh-card__pic">
              <img src="/assets/store/collection/bag-range.webp" alt="Jesse Sanchez standing among a row of his heavy bags in a gym" width={560} height={560} loading="lazy" />
            </span>
            <span className="sh-card__body">
              <span className="sh-card__name">Gym fit-out</span>
              <span className="sh-card__line">Bags and gear for your gym, made to order.</span>
              <span className="sh-card__price">Price to come</span>
              <span className="sh-card__acts">
                <Link className="sh-btn sh-btn--small" href="/gym-fit-outs">
                  Kit out your gym
                </Link>
                <Link className="sh-btn sh-btn--small sh-btn--line" href="/contact?product=gym-fit-out&start=new">
                  Get a Quote
                </Link>
              </span>
            </span>
          </article>
        </div>
        <p className="sh-more" data-reveal>
          Not sure? <Link href="/contact?start=new">Tell Jesse what you want</Link> in your own words.
        </p>
      </section>

      <section className="sh-wrap sh-sec" id="how" aria-labelledby="how-h">
        <h2 className="sh-h" id="how-h" data-reveal>
          How it works
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
        <div className="sh-actions sh-actions--mid" data-reveal>
          <Link className="sh-btn" href="#choose">
            Start your order
          </Link>
        </div>
      </section>

      <section className="sh-wrap sh-sec" aria-labelledby="craft-h">
        <h2 className="sh-h" id="craft-h" data-reveal>
          Made by hand
        </h2>
        <div className="sh-craft sh-craft--compact" data-reveal-stagger>
          {SHOP_CRAFT.map((c) => (
            <figure key={c.title}>
              <img src={c.image} alt={c.alt} width={800} height={1000} loading="lazy" style={c.at ? { objectPosition: c.at } : undefined} />
              <figcaption>
                <strong>{c.title}</strong>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="sh-actions sh-actions--mid" data-reveal>
          <Link className="sh-btn" href="#choose">
            Get yours made
          </Link>
          <Link className="sh-btn sh-btn--line" href="/the-workshop">
            See the workshop
          </Link>
        </div>
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
            <div className="sh-actions">
              <Link className="sh-btn" href="#choose">
                Get yours made
              </Link>
              <a className="sh-btn sh-btn--light" href={STORY.href} target="_blank" rel="noopener noreferrer">
                {STORY.action}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="sh-wrap sh-sec sh-end">
        <h2 className="sh-h sh-h--mid" data-reveal>
          Ready when you are
        </h2>
        <div className="sh-actions sh-actions--mid">
          <Link className="sh-btn" href="#choose">
            Get yours made
          </Link>
          <Link className="sh-btn sh-btn--line" href="/contact?start=new">
            Tell Jesse what you want
          </Link>
          <Link className="sh-btn sh-btn--line" href="/gym-fit-outs">
            Gym Fit-Out
          </Link>
        </div>
      </section>
      <div className="sh-sticky-space" aria-hidden="true" />
    </ShopShell>
  );
}
