"use client";

import { useEffect, useRef } from "react";
import { attachDepthTilt } from "@/lib/depth-card";
import { StitchOverlay } from "@/lib/stitch-overlay";

interface Card {
  readonly href: string;
  readonly image: string;
  readonly title: string;
  readonly caption: string;
}

/** Real cards only: the copy is grounded (no claims). The links are the configurator, the fit-out page and the parts configurator. */
const CARDS: readonly Card[] = [
  { href: "/configure", image: "/assets/depth/tiger.jpg", title: "Tiger", caption: "One-off artwork, stitched in" },
  { href: "/gym-fit-outs", image: "/assets/depth/workshop.jpg", title: "The workshop", caption: "Cut, sewn and printed by hand" },
  { href: "/configure/parts", image: "/assets/depth/bag.jpg", title: "Your bag", caption: "Every panel, your colours" },
];

/** Three photo cards: depth tilt, plus the interaction-only stitched-thread overlay. The captions slide in when the row scrolls into view. */
export function FeatureCards() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cleanups: Array<() => void> = [];
    section.querySelectorAll<HTMLElement>("[data-depth-card]").forEach((card, index) => {
      cleanups.push(attachDepthTilt(card));
      const canvas = card.querySelector<HTMLCanvasElement>("canvas.depth-card__px");
      const overlay = canvas ? StitchOverlay.attach(card, canvas, index) : null;
      if (overlay) cleanups.push(() => overlay.destroy());
    });
    // staggered caption reveal when the row scrolls into view
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(section);
    cleanups.push(() => io.disconnect());
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section className="depth-cards" aria-label="Featured" ref={sectionRef}>
      {CARDS.map((c, i) => (
        <a key={c.href} className="depth-card" data-depth-card="" href={c.href} style={{ "--i": i } as React.CSSProperties}>
          <span className="depth-card__img" data-depth="-1" style={{ backgroundImage: `url(${c.image})` }} />
          <span className="depth-card__shade" />
          <canvas className="depth-card__px" aria-hidden="true" />
          <span className="depth-card__cap" data-depth="1.2">
            <span className="depth-card__t">{c.title}</span>
            <span className="depth-card__s">{c.caption}</span>
          </span>
          <span className="depth-card__spot" />
        </a>
      ))}
    </section>
  );
}
