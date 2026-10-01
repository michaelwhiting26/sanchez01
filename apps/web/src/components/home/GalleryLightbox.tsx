"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { GALLERY_SLIDES } from "./gallery-slides";
import { scrollTo, start as startScroll, stop as stopScroll } from "@/lib/scroll";

interface Props {
  readonly index: number;
  /** Rect of the tapped card, for the scale-up from where it was. */
  readonly origin: DOMRect | null;
  readonly onIndex: (i: number) => void;
  readonly onClose: () => void;
}

const COUNT = GALLERY_SLIDES.length;
const pad = (n: number): string => String(n).padStart(2, "0");

/**
 * The full-size view of one gallery item: a native <dialog> (focus trap, Esc, backdrop for free), opened with showModal().
 * Background scroll is locked with overflow:hidden on <html> (plus a padding for the scrollbar), never position:fixed, so the pinned gallery does not move.
 */
export default function GalleryLightbox({ index, origin, onIndex, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const originRef = useRef(origin);
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
  const slide = GALLERY_SLIDES[index];

  // open once, lock scroll, animate from the card
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const root = document.documentElement;
    const y = window.scrollY;
    const prevPad = root.style.paddingRight;
    const bar = window.innerWidth - root.clientWidth; // keep the layout width identical so nothing reflows behind
    stopScroll("lightbox"); // lib/scroll.ts: Lenis stops and <html> is locked; keyed, so another modal's lock is never released by this one
    if (bar > 0) root.style.paddingRight = `${bar}px`;
    if (!dlg.open) dlg.showModal();
    const m = mediaRef.current;
    const o = originRef.current;
    if (m && o && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const r = m.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        const dx = o.left + o.width / 2 - (r.left + r.width / 2);
        const dy = o.top + o.height / 2 - (r.top + r.height / 2);
        const sc = Math.max(0.2, Math.min(1, o.width / r.width));
        m.animate([{ transform: `translate(${dx}px,${dy}px) scale(${sc})`, opacity: 0.4 }, { transform: "none", opacity: 1 }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
      }
    }
    return () => {
      startScroll("lightbox");
      root.style.paddingRight = prevPad;
      if (Math.abs(window.scrollY - y) > 0.5) scrollTo(y, { immediate: true, offset: 0 });
      if (dlg.open) dlg.close();
    };
  }, []);

  const go = (d: number): void => onIndex((index + d + COUNT) % COUNT);
  const close = (): void => dialogRef.current?.close();

  const onKey = (e: KeyboardEvent<HTMLDialogElement>): void => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };
  const down = (e: PointerEvent<HTMLDivElement>): void => {
    if ((e.target as HTMLElement).closest("video[controls]") && e.clientY > window.innerHeight * 0.6) return; // leave the video's own controls alone
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const move = (e: PointerEvent<HTMLDivElement>): void => {
    const g = drag.current;
    const shell = shellRef.current;
    if (!g || !shell) return;
    const dy = e.clientY - g.y;
    if (dy > 0 && dy > Math.abs(e.clientX - g.x)) shell.style.transform = `translateY(${dy}px)`;
  };
  const up = (e: PointerEvent<HTMLDivElement>): void => {
    const g = drag.current;
    drag.current = null;
    if (shellRef.current) shellRef.current.style.transform = "";
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (dy > 90 && dy > Math.abs(dx)) close();
    else if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };

  if (!slide) return null;
  return (
    <dialog
      ref={dialogRef}
      className="pgl"
      aria-label={slide.title}
      onKeyDown={onKey}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).hasAttribute("data-dismiss")) close();
      }}
    >
      <div className="pgl-shell" ref={shellRef} data-dismiss="">
        <div className="pgl-top" data-dismiss="">
          <p className="pgl-count" aria-live="polite">
            {pad(index + 1)} / {pad(COUNT)}
          </p>
          <button type="button" className="pgl-x" onClick={close} aria-label="Close">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>
        <div className="pgl-body" data-dismiss="">
          <div className="pgl-media" ref={mediaRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ "--ar": slide.aspect } as CSSProperties}>
            {slide.video ? (
              <video key={slide.video} src={slide.video} poster={slide.src} controls autoPlay muted loop playsInline />
            ) : (
              <img key={slide.src} src={slide.src} alt={slide.title} decoding="async" />
            )}
          </div>
          <div className="pgl-text" data-lenis-prevent="">
            <h2 className="pgl-title">{slide.title}</h2>
            {slide.caption ? <p className="pgl-caption">{slide.caption}</p> : <p className="pgl-caption pgl-caption--todo">Caption to come</p>}
            {slide.details && slide.details.length > 0 ? (
              <ul className="pgl-details">
                {slide.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        <button type="button" className="pgl-nav pgl-prev" onClick={() => go(-1)} aria-label="Previous">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M15 4l-8 8 8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>
        <button type="button" className="pgl-nav pgl-next" onClick={() => go(1)} aria-label="Next">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M9 4l8 8-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>
      </div>
    </dialog>
  );
}
