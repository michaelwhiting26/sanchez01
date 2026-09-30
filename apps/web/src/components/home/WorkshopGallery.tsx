"use client";

import { useEffect, useRef } from "react";
import { FilmHelix } from "@/lib/film";
import { GALLERY_SLIDES } from "./gallery-slides";

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const smooth = (v: number): number => v * v * (3 - 2 * v);

/**
 * The workshop gallery, as a pinned horizontal scroll (the mechanic from MR-2): the section pins to the screen, and vertical scroll maps one to one onto a
 * sideways move of the strip, so the visitor scrolls at their own pace, fast or slow, with nothing to wait for or catch up. When the last slide has been
 * reached the page carries on down. The card nearest the centre grows and brightens; videos play only while their card is in focus.
 * The film strips and the spotlight (lib/film.ts) sit behind it and read the track's position.
 */
export function WorkshopGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    const vp = viewportRef.current;
    const strip = stripRef.current;
    if (!track || !pin || !vp || !strip) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const film = new FilmHelix({ track, reduced });
    if (process.env.NODE_ENV !== "production") (window as Window & { __film?: FilmHelix }).__film = film;
    const cards = Array.from(strip.querySelectorAll<HTMLElement>("[data-card]"));
    if (reduced) {
      // no scroll-jacking: a plain sideways-scrolling strip
      track.style.height = "auto";
      vp.style.overflowX = "auto";
      cards.forEach((c) => c.style.setProperty("--focus", "1"));
      return () => film.destroy();
    }

    let travel = 0;

    const update = (): void => {
      const tr = track.getBoundingClientRect();
      const d = travel > 0 ? clamp01(-tr.top / travel) : 0; // read live: nothing above the gallery can throw it off
      // the counter, bar and title are gone (faded, not just scrolled) before the section releases, so nothing of the gallery is left on screen for the next section
      const vhNow = window.innerHeight || 1;
      const leave = smooth(clamp01((tr.bottom - vhNow * 0.55) / (vhNow * 0.45)));
      if (hudRef.current) hudRef.current.style.opacity = leave.toFixed(3);
      if (titleRef.current) titleRef.current.style.opacity = leave.toFixed(3);
      strip.style.transform = `translate3d(${(-travel * d).toFixed(1)}px,0,0)`;
      const vw = window.innerWidth || 1;
      let best = 0;
      let bestF = -1;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const s = clamp01((r.left + r.width / 2) / vw);
        const focus = smooth(clamp01(1 - 2 * Math.abs(s - 0.5)));
        c.style.setProperty("--focus", focus.toFixed(3));
        c.style.zIndex = String(1 + Math.round(focus * 10));
        const v = c.querySelector("video");
        if (v) {
          if (focus > 0.55 && v.paused) void v.play().catch(() => undefined);
          else if (focus <= 0.4 && !v.paused) v.pause();
        }
        if (focus > bestF) {
          bestF = focus;
          best = i;
        }
      });
      if (barRef.current) barRef.current.style.transform = `scaleX(${d.toFixed(4)})`;
      if (titleRef.current) titleRef.current.textContent = GALLERY_SLIDES[best]?.title ?? "";
      if (countRef.current) countRef.current.textContent = `${String(best + 1).padStart(2, "0")} / ${String(GALLERY_SLIDES.length).padStart(2, "0")}`;
    };
    const schedule = (): void => update(); // six cards: cheap enough to run on every scroll event, so it never lags the finger
    const measure = (): void => {
      const stage = pin.offsetHeight;
      travel = Math.max(0, strip.scrollWidth - vp.clientWidth);
      track.style.height = `${stage + travel + Math.round(window.innerHeight * 0.2)}px`; // the pinned stage + one pixel of scroll per pixel of sideways travel + a short tail
      update();
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(strip);
    strip.querySelectorAll("img").forEach((im) => im.addEventListener("load", measure, { once: true }));
    void document.fonts?.ready.then(measure);
    measure();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
      ro.disconnect();
      film.destroy();
    };
  }, []);

  return (
    <div className="lgc-track pg-track" data-lgc-track ref={trackRef}>
      <section className="lgc-section pg-stage" aria-label="From the workshop" ref={pinRef}>
        <p className="pg-title" ref={titleRef} aria-hidden="true">
          {GALLERY_SLIDES[0]?.title}
        </p>
        <div className="pg-viewport" ref={viewportRef}>
          <div className="pg-strip" ref={stripRef}>
            {GALLERY_SLIDES.map((s, i) => (
              <figure key={s.src} className="pg-card" data-card="" style={{ "--ar": s.aspect } as React.CSSProperties}>
                {s.video ? <video src={s.video} poster={s.src} muted loop playsInline preload="metadata" /> : <img src={s.src} alt={s.title} loading="lazy" />}
                <figcaption>
                  <span>{String(i + 1).padStart(2, "0")}</span> {s.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div className="pg-hud" aria-hidden="true" ref={hudRef}>
          <p ref={countRef}>01 / {String(GALLERY_SLIDES.length).padStart(2, "0")}</p>
          <div className="pg-bar">
            <div ref={barRef} />
          </div>
        </div>
      </section>
    </div>
  );
}
