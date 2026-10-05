import Link from "next/link";
import { LEGAL_LINKS, ORIGIN_LINE } from "@/lib/site";

/** The store's footer. "Superseded" leads to the previous scroll site, kept whole at /superseded (owner, 5 Oct 2026). */
export function StoreFooter() {
  return (
    <footer className="store-footer">
      <p className="store-footer__origin">{ORIGIN_LINE}</p>
      <ul className="store-footer__links">
        <li>
          <Link href="/superseded">Superseded</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
        {LEGAL_LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>{l.label}</Link>
          </li>
        ))}
      </ul>
      <p className="store-footer__copy">© {new Date().getFullYear()} Sanchez Custom Boxing Equipment.</p>
    </footer>
  );
}
