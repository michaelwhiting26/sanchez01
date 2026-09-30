"use client";

import { useEffect, useRef } from "react";
import { CITIES, LEGAL_LINKS, LOGO_SRC, ORIGIN_LINE, SOCIALS } from "@/lib/site";
import { mountFooterGlobe } from "@/lib/footer-globe";

function InstagramIcon() {
  return (
    <svg className="icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

/** The minimal home-page footer: brand block (logo with the live globe beside it, origin line, cities, Instagram), then the copyright and legal links. */
export function FooterMin() {
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = globeRef.current;
    if (!host || !("IntersectionObserver" in window)) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        void mountFooterGlobe(host)
          .then((fn) => {
            if (cancelled) fn();
            else cleanup = fn;
          })
          .catch(() => {});
      },
      { rootMargin: "700px 0px" },
    );
    io.observe(host);
    return () => {
      cancelled = true;
      io.disconnect();
      cleanup?.();
    };
  }, []);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top footer-top--min">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <img src={LOGO_SRC} alt="Sanchez Custom Boxing Equipment" width={96} height={83} loading="lazy" />
              <div className="footer-globe" ref={globeRef} aria-hidden="true" />
            </div>
            <p className="origin-line">{ORIGIN_LINE}</p>
            <ul className="footer-cities" aria-label="Where we work">
              {CITIES.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <ul className="social-links" aria-label="Instagram">
              {SOCIALS.map((s) => (
                <li key={s.handle}>
                  <a href={s.href} rel="noopener" target="_blank">
                    <InstagramIcon />
                    {s.handle}
                    <span className="visually-hidden"> on Instagram (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom footer-bottom--min">
          <p>© {new Date().getFullYear()} Sanchez Custom Boxing Equipment.</p>
          <ul className="legal-links" aria-label="Legal">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
