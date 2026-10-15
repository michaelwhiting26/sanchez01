"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Phone-only order bar on the home page (owner, 15 Oct 2026: "guided back again and again to making an order").
 * Appears once the visitor has scrolled past the opening film; two buttons, both into the order path.
 */
export function StickyOrder() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = (): void => setShow(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="sh-sticky" data-show={show || undefined} aria-hidden={!show}>
      <Link className="sh-btn" href="/#choose" tabIndex={show ? 0 : -1} data-track="sticky_get_yours_made">
        Get yours made
      </Link>
      <Link className="sh-btn sh-btn--line" href="/contact?start=new" tabIndex={show ? 0 : -1} data-track="sticky_quote">
        Get a Quote
      </Link>
    </div>
  );
}
