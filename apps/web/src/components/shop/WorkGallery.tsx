"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { SHOP_RANGE, SHOP_WORK, type RangeId } from "@/lib/shop/catalogue";

/**
 * The range slider and the workshop pictures under it (owner, 7 Oct 2026): a rail of stops, one per kind of product, with a pill that slides to
 * the stop in use. "Everything" shows every piece; any other stop shows only that kind. Arrow keys move along the rail, as on any slider.
 */
export function WorkGallery() {
  const [kind, setKind] = useState<RangeId>("all");
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const rail = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const place = (): void => {
      const stop = rail.current?.querySelector<HTMLElement>('[aria-checked="true"]');
      if (stop) setPill({ x: stop.offsetLeft, w: stop.offsetWidth });
    };
    place();
    void document.fonts.ready.then(place); // the stops change width when the web font arrives
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [kind]);

  const choose = (id: RangeId): void => {
    setKind(id);
    rail.current?.querySelector<HTMLElement>(`[data-stop="${id}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  };
  const step = (by: number): void => {
    const at = SHOP_RANGE.findIndex((r) => r.id === kind);
    const next = SHOP_RANGE[Math.min(SHOP_RANGE.length - 1, Math.max(0, at + by))];
    if (next && next.id !== kind) {
      choose(next.id);
      rail.current?.querySelector<HTMLElement>(`[data-stop="${next.id}"]`)?.focus();
    }
  };

  const shown = kind === "all" ? SHOP_WORK : SHOP_WORK.filter((w) => w.kind === kind);

  return (
    <>
      <div className="sh-range">
        <div
          ref={rail}
          className="sh-range__rail"
          role="radiogroup"
          aria-label="Show"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); }
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
          }}
        >
          <span className="sh-range__pill" aria-hidden="true" style={pill ? { transform: `translateX(${pill.x}px)`, inlineSize: `${pill.w}px` } : { opacity: 0 }} />
          {SHOP_RANGE.map((r) => (
            <button key={r.id} type="button" role="radio" aria-checked={kind === r.id} tabIndex={kind === r.id ? 0 : -1} data-stop={r.id} className="sh-range__stop" onClick={() => choose(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <h2 className="sh-h">From the workshop</h2>
      <div className="sh-work" aria-live="polite">
        {shown.map((w) => {
          const picture = (
            <>
              <img src={w.image} alt={w.alt} width={800} height={800} loading="lazy" data-fill={w.fill || undefined} />
              <figcaption>{w.label}</figcaption>
            </>
          );
          return (
            <figure key={w.id}>
              {w.href ? <Link href={w.href}>{picture}</Link> : picture}
            </figure>
          );
        })}
      </div>
    </>
  );
}
