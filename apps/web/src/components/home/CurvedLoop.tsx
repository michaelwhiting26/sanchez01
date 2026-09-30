"use client";

import { useEffect, useRef } from "react";
import { CurvedLoop as Engine } from "@/lib/curved-loop";
import { RibbonSneak } from "@/lib/ribbon-sneak";

interface Props {
  /** Words separated by ✦. */
  text: string;
  curve?: number;
  speed?: number;
  starSrc?: string;
}

/** SANCHEZ ✦ CUSTOM ✦ on an arc. Drag to push it or reverse it. */
export function CurvedLoop({ text, curve = 140, speed = 1.6, starSrc = "/assets/brand/sparkle-3d.png" }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const loop = new Engine({ root, text, curve, speed, starSrc, reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches });
    loop.start();
    return () => loop.destroy();
  }, [text, curve, speed, starSrc]);

  // the hero's man rolls onto the ribbon and teeps across it on scroll; omitted entirely under reduced motion
  useEffect(() => {
    const root = rootRef.current;
    const actor = actorRef.current;
    if (!root || !actor || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sneak = new RibbonSneak(root, actor);
    sneak.start();
    // dev only: lets a test drive `update({ rootTop, vh })` with faked scroll positions
    if (process.env.NODE_ENV !== "production") (window as unknown as { __ribbonSneak?: RibbonSneak }).__ribbonSneak = sneak;
    return () => sneak.destroy();
  }, []);

  return (
    <section className="curved-loop" ref={rootRef} data-curved-loop="">
      <div className="ribbon-sneak" ref={actorRef} aria-hidden="true" />
    </section>
  );
}
