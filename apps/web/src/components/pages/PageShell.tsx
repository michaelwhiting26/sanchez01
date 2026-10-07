import Link from "next/link";
import type { ReactNode } from "react";
import { LOGO_SRC } from "@/lib/site";
import { ShopShell } from "@/components/shop/ShopShell";
import "../../styles/pages.css";

/** A plain inner page inside the shop frame: a heading and the content. Used by every page that is not the home page, the shop or a builder. */
export function PageShell({ eyebrow, title, children }: { eyebrow?: string; title: string; children: ReactNode }) {
  return (
    <ShopShell>
      <div className="pg">
        <div className="pg__main">
          {eyebrow ? <p className="pg__eyebrow">{eyebrow}</p> : null}
          <h1 className="pg__title">{title}</h1>
          {children}
        </div>
      </div>
    </ShopShell>
  );
}

/** The builder's shell: no title block, so the bag gets the screen. A slim bar with the mark and a way back; the heading is there for screen readers only. */
export function BuildShell({ children }: { children: ReactNode }) {
  return (
    <div className="pg pg--build">
      <header className="pg__head pg__head--slim">
        <Link href="/" className="pg__brand" aria-label="Sanchez Custom Boxing Equipment, home">
          <img src={LOGO_SRC} alt="" width={64} height={55} />
        </Link>
        <Link href="/shop" className="pg__back">
          Back to shop
        </Link>
      </header>
      <main id="main">
        <h1 className="visually-hidden">Build your bag</h1>
        {children}
      </main>
    </div>
  );
}
