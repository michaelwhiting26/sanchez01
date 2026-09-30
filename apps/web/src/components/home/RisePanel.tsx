"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { LOGO_SRC } from "@/lib/site";
import { teaseRise } from "@/lib/rise";
import { RollingLink } from "@/components/ui/RollingButton";

/**
 * The footer, as a raised layer that rises over the pinned page. The section is tall and its stage is position: sticky; the panel's position is a
 * pure function of scroll (--rise, 0 to 1, through teaseRise), then the stage stays pinned while you scroll on through the footer (--more).
 * Desktop and motion-allowed only; on phones and with reduced motion it is a plain block. The page scroll itself is never hijacked.
 */
export function RisePanel({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const card = cardRef.current;
    if (!root || !card) return;
    const mq = window.matchMedia("(min-width: 761px) and (prefers-reduced-motion: no-preference)");
    let vh = 0;
    let top = 0;
    let reveal = 0;
    let over = 0;
    let ticking = false;
    let raf = 0;

    const update = (): void => {
      ticking = false;
      if (!mq.matches) return;
      const raw = Math.min(1, Math.max(0, (window.scrollY - top) / reveal));
      const rise = teaseRise(raw);
      root.style.setProperty("--rise", rise.toFixed(4));
      root.style.setProperty("--more", (over > 0 ? Math.min(1, Math.max(0, (window.scrollY - top - reveal) / over)) : 0).toFixed(4));
      if (rise > 0.3) root.classList.add("is-in"); // one-shot copy reveal once the panel is well into view
    };
    const measure = (): void => {
      vh = window.innerHeight || 1;
      if (!mq.matches) {
        root.style.height = "";
        root.style.marginTop = "";
        document.documentElement.classList.remove("rise-pinned");
        root.classList.remove("is-pinned");
        root.style.setProperty("--rise", "1");
        root.classList.add("is-in");
        return;
      }
      root.classList.add("is-pinned");
      document.documentElement.classList.add("rise-pinned");
      const prev = document.getElementById("flare"); // pull up over a pinned carousel only if one is on the page
      root.style.marginTop = prev ? `${-prev.offsetHeight}px` : "";
      reveal = Math.round(vh * 1.4); // the extra scroll: rise, pause, rise again
      over = Math.max(0, card.offsetHeight - vh); // the footer is taller than the screen: scroll on through it while the stage stays pinned
      root.style.setProperty("--overflow", `${over}px`);
      root.style.height = `${vh + reveal + over}px`;
      top = root.getBoundingClientRect().top + window.scrollY;
      update();
    };
    const onScroll = (): void => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    mq.addEventListener("change", measure);
    void document.fonts?.ready.then(measure);
    measure();
    const ro = new ResizeObserver(() => {
      if (mq.matches && Math.abs(card.offsetHeight - vh - over) > 2 && card.offsetHeight > 0) measure(); // the footer fills in after load (globe, fonts)
    });
    ro.observe(card);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
      mq.removeEventListener("change", measure);
      ro.disconnect();
      document.documentElement.classList.remove("rise-pinned");
    };
  }, []);

  return (
    <section className="rise" data-rise="" aria-label="Get in touch" ref={rootRef}>
      <div className="rise__stage">
        <div className="rise__card" ref={cardRef}>
          <img className="rise__surface" src="/assets/brand/rise-card.svg?v=3" alt="" aria-hidden="true" />
          <div className="rise__panel">
            <div className="rise__hero">
              <h2 className="visually-hidden">Sanchez Custom Boxing Equipment</h2>
              <img className="rise__logo" src={LOGO_SRC} alt="Sanchez Custom Boxing Equipment" />
              <RollingLink label="Build your identity" href="/contact" className="rise__cta" />
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
