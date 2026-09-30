import Link from "next/link";
import { OTHER_PRODUCTS } from "@/lib/catalogue";

/** Horizontal scroll-snap carousel of the other Sanchez products. A focusable scroll region so keyboard users can arrow through it. */
export function MoreFromSanchez() {
  return (
    <section className="pg__more" aria-labelledby="more-title">
      <h2 className="pg__more-title" id="more-title">
        More from Sanchez
      </h2>
      <ul className="pg__rail" role="list" tabIndex={0} aria-label="More from Sanchez, scroll sideways">
        {OTHER_PRODUCTS.map((p) => (
          <li className="pg__card" key={p.id}>
            <div className="pg__card-media">
              {p.image ? <img src={p.image.src} alt={p.image.alt} loading="lazy" width={300} height={300} /> : <span aria-hidden="true">{p.name}</span>}
            </div>
            <h3 className="pg__card-name">{p.name}</h3>
            <p className="pg__card-sub">{p.sub}</p>
            <p className="pg__card-price">{p.price ? new Intl.NumberFormat("en", { style: "currency", currency: p.price.currency }).format(p.price.amountMinor / 100) : "Price to come"}</p>
            <Link className="pg__btn pg__btn--ghost pg__card-btn" href={p.href}>
              {p.orderable ? `View ${p.name.toLowerCase()}` : "Join the waitlist"}
              <span className="pg__sr"> for {p.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
