"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ShopProduct } from "@/lib/shop/catalogue";

type Pic = ShopProduct["image"];

/**
 * Several photographs of one piece on a product card (owner, 15 Oct 2026: dots under the picture, auto-scrolling through the angles,
 * the dots showing which photo is on). Cross-fades every 3.2 s only while the card is on screen; pauses on hover, focus or touch;
 * swipe on phones; tap a dot to jump; no auto-advance for visitors who ask for reduced motion.
 */
export function CardGallery({ images, label, children }: { images: readonly Pic[]; label: string; children?: ReactNode }) {
  const [at, setAt] = useState(0);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  const touchX = useRef<number | null>(null);
  const n = images.length;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => setOnScreen(Boolean(entries[0]?.isIntersecting)), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!onScreen || paused || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setAt((x) => (x + 1) % n), 3200);
    return () => window.clearInterval(timer);
  }, [onScreen, paused, n]);

  return (
    <span
      ref={box}
      className="sh-card__pic sh-gal"
      role="group"
      aria-roledescription="carousel"
      aria-label={`${label}: ${n} photos`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        if (start !== null && end !== undefined && Math.abs(end - start) > 40) setAt((x) => (x + (end < start ? 1 : n - 1)) % n);
        touchX.current = null;
      }}
    >
      {images.map((p, k) => (
        <img key={p.src} className="sh-gal__img" data-on={k === at || undefined} src={p.src} alt={k === at ? p.alt : ""} width={p.width} height={p.height} loading="lazy" />
      ))}
      {children}
      <span className="sh-gal__dots" hidden={n < 2}>
        {images.map((p, k) => (
          <button
            key={p.src}
            type="button"
            className="sh-gal__dot"
            aria-label={`Photo ${k + 1} of ${n}`}
            aria-current={k === at || undefined}
            onClick={() => {
              setAt(k);
              setPaused(true);
            }}
          />
        ))}
      </span>
    </span>
  );
}
