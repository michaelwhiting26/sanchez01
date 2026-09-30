import Link from "next/link";
import type { ReactNode } from "react";
import { LOGO_SRC } from "@/lib/site";
import "../../styles/pages.css";

/** A plain inner page: brand mark home, a heading, the content, and one way onward. Used by every page that is not the home page. */
export function PageShell({ eyebrow, title, children }: { eyebrow?: string; title: string; children: ReactNode }) {
  return (
    <div className="pg">
      <header className="pg__head">
        <Link href="/" className="pg__brand" aria-label="Sanchez Custom Boxing Equipment, home">
          <img src={LOGO_SRC} alt="" width={64} height={55} />
        </Link>
        <Link href="/" className="pg__back">
          Back
        </Link>
      </header>
      <main className="pg__main" id="main">
        {eyebrow ? <p className="pg__eyebrow">{eyebrow}</p> : null}
        <h1 className="pg__title">{title}</h1>
        {children}
      </main>
    </div>
  );
}
