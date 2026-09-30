"use client";

import { useEffect, useRef } from "react";
import { attachGalleryNote, attachGalleryRuler, attachGalleryScroll } from "./gallery-behaviours";
import { FilmHelix } from "@/lib/film";
import { GALLERY_SLIDES } from "./gallery-slides";

const BUNDLE = "/assets/carousel/lgc.bundle.js";

/** Load the vendored carousel once per page. It mounts itself on every [data-lgc] element present when it runs. */
let bundle: Promise<void> | null = null;
function loadBundle(): Promise<void> {
  bundle ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = BUNDLE;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("gallery bundle failed to load"));
    document.body.appendChild(s);
  });
  return bundle;
}

/** The pinned workshop gallery: a tall track, a sticky section, the vendored carousel, and the three behaviours around it. */
export function WorkshopGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const host = hostRef.current;
    const pin = pinRef.current;
    if (!track || !host || !pin) return;
    let cleanup: Array<() => void> = [];
    let cancelled = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // how long each slide holds: a photo a few seconds, a video its own length
    const dwell = Promise.all(
      GALLERY_SLIDES.map(
        (slide) =>
          new Promise<number>((resolve) => {
            if (!slide.video) return resolve(4500);
            const v = document.createElement("video");
            v.preload = "metadata";
            const done = (ms: number): void => resolve(Math.min(20000, Math.max(3000, ms)));
            v.onloadedmetadata = () => done(Number.isFinite(v.duration) ? v.duration * 1000 : 8000);
            v.onerror = () => done(8000);
            window.setTimeout(() => done(8000), 4000);
            v.src = slide.video;
          }),
      ),
    );
    Promise.all([loadBundle(), dwell])
      .then(([, dwellMs]) => {
        if (cancelled) return;
        const notes = new Map(GALLERY_SLIDES.map((s) => [s.title, s.note] as const));
        const hero = document.querySelector<HTMLElement>("[data-hero-rings]");
        const film = hero
          ? new FilmHelix({ start: hero, end: track, reduced })
          : null;
        if (process.env.NODE_ENV !== "production") (window as Window & { __film?: FilmHelix | null }).__film = film;
        cleanup = [attachGalleryScroll(track, host, pin, { autoplay: !reduced, dwellMs }), attachGalleryRuler(host, GALLERY_SLIDES.length), attachGalleryNote(host, notes), () => film?.destroy()];
      })
      .catch(() => {
        /* the gallery is decorative; the page stands without it */
      });
    return () => {
      cancelled = true;
      cleanup.forEach((fn) => fn());
    };
  }, []);

  return (
    <div className="lgc-track" data-lgc-track ref={trackRef}>
      <section className="lgc-section" aria-label="From the workshop" ref={pinRef}>
        <div
          className="lgc"
          data-lgc=""
          data-lgc-nowheel=""
          data-bg="#090706"
          data-panel="690"
          data-items={JSON.stringify(GALLERY_SLIDES)}
          ref={hostRef}
          suppressHydrationWarning
        />
      </section>
    </div>
  );
}
