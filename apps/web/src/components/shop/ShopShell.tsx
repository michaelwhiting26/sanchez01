import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL_LINKS, LOGO_SRC, ORIGIN_LINE, SOCIALS } from "@/lib/site";
import { SHOP_NAV, SHOP_PRODUCTS } from "@/lib/shop/catalogue";
import { ShopMenu } from "./ShopMenu";
import "../../styles/shop.css";

/** The shop's frame on every page: the origin strip, the header with the way into the 3D builders, the page, the footer. */
export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <div className="shop">
      <a className="sh-skip" href="#main">
        Skip to content
      </a>
      <p className="sh-strip">{ORIGIN_LINE}</p>
      <header className="sh-head">
        <div className="sh-wrap sh-head__in">
          <Link href="/" className="sh-brand" aria-label="Sanchez Custom Boxing Equipment, home">
            <img src={LOGO_SRC} alt="" width={64} height={55} />
            <span>
              Sanchez<small>Custom Boxing Equipment</small>
            </span>
          </Link>
          <nav className="sh-nav" aria-label="Main">
            {SHOP_NAV.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/shop" className="sh-btn sh-btn--small sh-head__cta">
            Design in 3D
          </Link>
          <ShopMenu />
        </div>
      </header>
      <main id="main">{children}</main>
      <ShopFooter />
    </div>
  );
}

function ShopFooter() {
  return (
    <footer className="sh-foot">
      <div className="sh-wrap sh-foot__in">
        <div className="sh-foot__about">
          <img src={LOGO_SRC} alt="Sanchez Custom Boxing Equipment" width={96} height={82} />
          <p>Custom boxing equipment, cut, stitched and printed by hand. {ORIGIN_LINE}</p>
        </div>
        <FootCol title="Design in 3D">
          {SHOP_PRODUCTS.map((p) => (
            <Link key={p.slug} href={p.href}>
              {p.name}
            </Link>
          ))}
        </FootCol>
        <FootCol title="Help">
          <Link href="/how-it-works">How it works</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/gym-fit-outs">Gyms and clubs</Link>
        </FootCol>
        <FootCol title="Follow">
          {SOCIALS.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">
              {s.handle}
            </a>
          ))}
        </FootCol>
      </div>
      <div className="sh-wrap sh-foot__base">
        <p>© 2026 Sanchez Custom Boxing Equipment</p>
        <p>
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </p>
      </div>
    </footer>
  );
}

function FootCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="sh-foot__col">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
