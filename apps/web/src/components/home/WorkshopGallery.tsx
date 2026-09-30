"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { FilmHelix } from "@/lib/film";
import { GALLERY_SLIDES } from "./gallery-slides";

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const smooth = (v: number): number => v * v * (3 - 2 * v);

// the lightbox is fetched only when first wanted (or warmed on first touch of a card), so it adds nothing to first load
const loadLightbox = () => import("./GalleryLightbox");
const GalleryLightbox = dynamic(loadLightbox, { ssr: false });

interface Card {
  readonly el: HTMLElement;
  readonly video: HTMLVideoElement | null;
  centre: number; // offsetLeft + half width, in strip coordinates (cached at measure)
  focus: number;
  z: number;
}

/**
 * The workshop gallery, as a pinned horizontal scroll (the mechanic from MR-2): the section pins to the screen, and vertical scroll maps one to one onto a
 * sideways move of the strip, so the visitor scrolls at their own pace, fast or slow, with nothing to wait for or catch up. When the last slide has been
 * reached the page carries on down. The card nearest the centre grows and brightens; videos play only while their card is in focus.
 * The film strips and the spotlight (lib/film.ts) sit behind it and read the track's position.
 *
 * Steadiness: the strip's sideways move runs on the compositor as a CSS scroll-driven animation where the browser supports it (no JS in the path at all);
 * otherwise a rAF loop writes one transform per frame. Either way the per-frame JS reads scrollY once and works from geometry cached at measure(),
 * never getBoundingClientRect, and writes only what changed.
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
  const lockedRef = useRef(false); // lightbox open: videos stay paused
  const kickRef = useRef<() => void>(() => undefined);
  const openerRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState<{ index: number; origin: DOMRect | null } | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    const vp = viewportRef.current;
    const strip = stripRef.current;
    if (!track || !pin || !vp || !strip) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const film = new FilmHelix({ track, reduced });
    if (process.env.NODE_ENV !== "production") (window as Window & { __film?: FilmHelix }).__film = film;
    const els = Array.from(strip.querySelectorAll<HTMLElement>("[data-card]"));
    if (reduced) {
      // no scroll-jacking: a plain sideways-scrolling strip
      track.style.height = "auto";
      vp.style.overflowX = "auto";
      els.forEach((c) => c.style.setProperty("--focus", "1"));
      return () => film.destroy();
    }

    const cards: Card[] = els.map((el) => ({ el, video: el.querySelector("video"), centre: 0, focus: -1, z: -1 }));
    const scrollDriven = typeof CSS !== "undefined" && CSS.supports("animation-timeline: scroll()");
    if (scrollDriven) track.dataset.pgSd = ""; // switches on the compositor-driven CSS animation (home.css)

    let travel = 0;
    let f0 = 0.5; // where on screen (0..1) the highlight sits at the start: the first card's centre
    let f1 = 0.5; // and at the end: the last card's centre once the strip stops (flush right)
    let start = 0; // track's top in document coordinates
    let trackH = 0;
    let vw = window.innerWidth || 1;
    let vh = window.innerHeight || 1;
    let lastTx = Number.NaN;
    let lastLeave = -1;
    let lastBar = -1;
    let best = -1;
    let raf = 0;

    const frame = (): void => {
      raf = 0;
      const y = window.scrollY; // the one read of the frame
      const d = travel > 0 ? clamp01((y - start) / travel) : 0;
      // the counter, bar and title are gone (faded, not just scrolled) before the section releases, so nothing of the gallery is left on screen for the next section
      const leave = smooth(clamp01((start + trackH - y - vh * 0.55) / (vh * 0.45)));
      if (Math.abs(leave - lastLeave) > 0.004) {
        lastLeave = leave;
        const o = leave.toFixed(3);
        if (hudRef.current) hudRef.current.style.opacity = o;
        if (titleRef.current) titleRef.current.style.opacity = o;
      }
      if (!scrollDriven) {
        const tx = Math.round(-travel * d * 10) / 10;
        if (tx !== lastTx) {
          lastTx = tx;
          strip.style.transform = `translate3d(${tx}px,0,0)`;
        }
      }
      const shift = travel * d;
      const fx = f0 + (f1 - f0) * d; // the focal point travels with the scroll, so the first card leads at the start and slide 6 at the end
      let bestI = 0;
      let bestF = -1;
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        if (!c) continue;
        const s = clamp01((c.centre - shift) / vw);
        const focus = smooth(clamp01(1 - 2 * Math.abs(s - fx)));
        if (Math.abs(focus - c.focus) > 0.004) {
          c.focus = focus;
          c.el.style.setProperty("--focus", focus.toFixed(3));
        }
        const z = 1 + Math.round(focus * 10);
        if (z !== c.z) {
          c.z = z;
          c.el.style.zIndex = String(z);
        }
        const v = c.video;
        if (v) {
          if (lockedRef.current) {
            if (!v.paused) v.pause();
          } else if (focus > 0.55 && v.paused) void v.play().catch(() => undefined);
          else if (focus <= 0.4 && !v.paused) v.pause();
        }
        if (focus > bestF) {
          bestF = focus;
          bestI = i;
        }
      }
      if (Math.abs(d - lastBar) > 0.0005) {
        lastBar = d;
        if (barRef.current) barRef.current.style.transform = `scaleX(${d.toFixed(4)})`;
      }
      if (bestI !== best) {
        best = bestI; // HUD text only changes when the leading card does
        if (titleRef.current) titleRef.current.textContent = GALLERY_SLIDES[bestI]?.title ?? "";
        if (countRef.current) countRef.current.textContent = `${String(bestI + 1).padStart(2, "0")} / ${String(GALLERY_SLIDES.length).padStart(2, "0")}`;
      }
    };
    const kick = (): void => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    kickRef.current = kick;

    const measure = (): void => {
      vw = window.innerWidth || 1;
      vh = window.innerHeight || 1;
      const stage = pin.offsetHeight;
      // stop with the last card (slide 6) flush right, leaving a right margin equal to the gap between cards. Not strip.scrollWidth: the sprocket rails
      // (::before/::after) reach 100vw past the strip's ends and would add a whole screen of empty travel after the last slide
      const lastCard = cards[cards.length - 1]?.el;
      const gap = parseFloat(getComputedStyle(strip).columnGap) || 0;
      travel = lastCard ? Math.max(0, lastCard.offsetLeft + lastCard.offsetWidth + gap + lastCard.offsetWidth * 0.05 - vp.clientWidth)   /* + 5% of a card: the neighbour is drawn smaller, so the visible gap is wider than the CSS gap */ : Math.max(0, strip.scrollWidth - vp.clientWidth);
      const h = stage + travel + Math.round(vh * 0.2); // the pinned stage + one pixel of scroll per pixel of sideways travel + a short tail
      if (track.style.height !== `${h}px`) track.style.height = `${h}px`;
      trackH = h;
      start = track.getBoundingClientRect().top + window.scrollY;
      cards.forEach((c) => {
        c.centre = c.el.offsetLeft + c.el.offsetWidth / 2;
        c.focus = -1;
      });
      const firstC = cards[0]?.centre ?? vw / 2;
      const lastC = cards[cards.length - 1]?.centre ?? vw / 2;
      f0 = Math.min(1, Math.max(0, firstC / vw));
      f1 = Math.min(1, Math.max(0, (lastC - travel) / vw));
      track.style.setProperty("--pg-travel", travel.toFixed(1));
      track.style.setProperty("--pg-start", start.toFixed(1));
      lastTx = Number.NaN;
      lastLeave = -1;
      lastBar = -1;
      frame();
    };
    let timer = 0;
    const measureSoon = (): void => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 120);
    };
    // iOS fires resize as the toolbar collapses; only a real width change or a big height change needs re-measuring
    const onResize = (): void => {
      if (Math.abs(window.innerWidth - vw) > 1 || Math.abs(window.innerHeight - vh) > 150) measureSoon();
    };

    // live only while near the viewport: promote the strip to its own layer then, and not otherwise
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) track.dataset.live = "";
        else delete track.dataset.live;
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(track);
    // something above the gallery changing height moves its start; images have explicit aspect so nothing inside it does
    const ro = new ResizeObserver(measureSoon);
    ro.observe(document.body);

    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", measureSoon);
    void document.fonts?.ready.then(measureSoon);
    measure();
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", measureSoon);
      io.disconnect();
      ro.disconnect();
      film.destroy();
    };
  }, []);

  const openAt = useCallback((i: number, el: HTMLElement): void => {
    openerRef.current = el;
    lockedRef.current = true;
    trackRef.current?.querySelectorAll("video").forEach((v) => v.pause());
    setOpen({ index: i, origin: el.getBoundingClientRect() });
  }, []);
  const closeBox = useCallback((): void => {
    lockedRef.current = false;
    setOpen(null);
    openerRef.current?.focus({ preventScroll: true });
    kickRef.current();
  }, []);
  const onCardKey = (e: KeyboardEvent<HTMLElement>, i: number): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openAt(i, e.currentTarget);
    }
  };

  return (
    <div className="lgc-track pg-track" data-lgc-track ref={trackRef}>
      <section className="lgc-section pg-stage" aria-label="From the workshop" ref={pinRef}>
        <p className="pg-title" ref={titleRef} aria-hidden="true">
          {GALLERY_SLIDES[0]?.title}
        </p>
        <div className="pg-viewport" ref={viewportRef}>
          <div className="pg-strip" ref={stripRef}>
            {GALLERY_SLIDES.map((s, i) => (
              <figure
                key={s.src}
                className="pg-card"
                data-card=""
                role="button"
                tabIndex={0}
                aria-label={`Open ${s.title}`}
                style={{ "--ar": s.aspect } as React.CSSProperties}
                onClick={(e) => openAt(i, e.currentTarget)}
                onKeyDown={(e) => onCardKey(e, i)}
                onPointerEnter={() => void loadLightbox()}
                onTouchStart={() => void loadLightbox()}
              >
                {s.video ? <video src={s.video} poster={s.src} muted loop playsInline preload="metadata" /> : <img src={s.src} alt={s.title} loading="lazy" decoding="async" />}
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
      {open ? <GalleryLightbox index={open.index} origin={open.origin} onIndex={(i) => setOpen({ index: i, origin: null })} onClose={closeBox} /> : null}
    </div>
  );
}
