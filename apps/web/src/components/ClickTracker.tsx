"use client";

import { useEffect } from "react";
import { trackEvent, type FunnelEvent } from "@/lib/track";

/**
 * One listener for the whole site: any link or button with data-track="<event>" (and optional data-track-product) is counted when tapped.
 * Server components only add the attributes; nothing else on the page needs to be a client component for tracking.
 */
export function ClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent): void => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      const name = el?.dataset.track;
      if (!el || !name) return;
      const product = el.dataset.trackProduct;
      trackEvent(name as FunnelEvent, product ? { product } : undefined);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
