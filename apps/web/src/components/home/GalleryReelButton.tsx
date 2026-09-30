"use client";

import { useEffect, useRef } from "react";
import { GalleryReel } from "@/lib/reel";
import { GALLERY_SLIDES } from "./gallery-slides";

/** "Play the film": opens the full-screen player that runs the gallery as one continuous movie. Lives on the pinned gallery section. */
export function GalleryReelButton() {
  const reel = useRef<GalleryReel | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    reel.current = new GalleryReel(GALLERY_SLIDES);
    return () => reel.current?.destroy();
  }, []);
  return (
    <button ref={btn} type="button" className="reel-play" aria-label="Play the workshop film" onClick={() => reel.current?.open(btn.current)}>
      <span className="reel-play__icon" aria-hidden="true">
        {"\u25B6"}
      </span>
      <span>Play the film</span>
    </button>
  );
}
