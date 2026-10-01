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
  const prevRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const card = cardRef.current;
    if (!root || !card) return;
    const mq = window.matchMedia("(min-width: 761px) and (prefers-reduced-motion: no-preference)");
    let vh = 0;
    let rootTop = 0;
    let reveal = 0;
    let delay = 0;
    let over = 0;
    let ticking = false;
    let raf = 0;

    // MR-2's structure: the panel is a fixed layer whose translate is a pure function of scroll; this section is only the scroll length under it.
    const update = (): void => {
      ticking = false;
      if (!mq.matches) return;
      const x = window.scrollY + vh - rootTop - delay; // 0 a little after the section's top edge reaches the bottom of the screen: the panel waits, so the buttons above stay readable
      const raw = Math.min(1, Math.max(0, x / reveal));
      const rise = teaseRise(raw);
      root.style.setProperty("--rise", rise.toFixed(4));
      root.style.setProperty("--more", (over > 0 ? Math.min(1, Math.max(0, (x - reveal) / over)) : 0).toFixed(4));
      card.style.visibility = rise <= 0.001 ? "hidden" : "visible";
      if (rise > 0.3) root.classList.add("is-in"); // one-shot copy reveal once the panel is well into view
    };
    const measure = (): void => {
      vh = window.innerHeight || 1;
      const prev = prevRef.current ?? (root.previousElementSibling as HTMLElement | null);
      prevRef.current = prev;
      if (!mq.matches) {
        root.style.height = "";
        root.style.marginTop = "";
        prev?.classList.remove("rise-under");
        document.documentElement.classList.remove("rise-pinned");
        root.classList.remove("is-pinned");
        root.style.setProperty("--rise", "1");
        card.style.visibility = "";
        root.classList.add("is-in");
        return;
      }
      root.classList.add("is-pinned");
      document.documentElement.classList.add("rise-pinned");
      if (prev) {
        prev.classList.add("rise-under"); // pinned while the panel rides up and over it
        prev.style.top = `${Math.min(0, vh - prev.offsetHeight)}px`;
      }
      root.style.marginTop = "";
      reveal = Math.round(vh * 1.2); // the extra scroll: rise, stall on the shaped edge, rise again
      delay = Math.round(vh * 0.55); // the pause before the panel starts to rise (the bag section stays pinned, showing its buttons)
      over = Math.max(0, card.offsetHeight - vh); // the footer is taller than the screen: scroll on through it
      root.style.setProperty("--overflow", `${over}px`);
      root.style.height = `${reveal + over + delay}px`;
      rootTop = root.getBoundingClientRect().top + window.scrollY;
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
      if (mq.matches && card.offsetHeight > 0 && Math.abs(root.offsetHeight - reveal - delay - Math.max(0, card.offsetHeight - vh)) > 2) measure();
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
      prevRef.current?.classList.remove("rise-under");
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
