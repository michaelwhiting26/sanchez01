"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SHOP_NAV } from "@/lib/shop/catalogue";

/** The phone menu: a button that opens the same links as the desktop bar. It closes itself when the page changes. */
export function ShopMenu() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  return (
    <div className="sh-menu">
      <button type="button" className="sh-menu__btn" aria-expanded={open} aria-controls="sh-menu-list" onClick={() => setOpen((o) => !o)}>
        <span className="visually-hidden">{open ? "Close menu" : "Open menu"}</span>
        <span className="sh-menu__bars" aria-hidden="true" data-open={open || undefined} />
      </button>
      <nav id="sh-menu-list" className="sh-menu__list" hidden={!open} aria-label="Main">
        {SHOP_NAV.map((l) => (
          <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
