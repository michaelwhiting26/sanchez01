"use client";

import { useEffect, useState } from "react";
import { AutoTour as Tour } from "@/lib/tour";

/** Starts the guided tour once the hero intro has finished, and shows a small hint while it runs. Skipped for reduced motion. */
export function AutoTour() {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tour: Tour | null = null;
    const cancelEarly = (): void => window.clearTimeout(id);
    // the hero intro runs about 13 seconds; the tour begins as it finishes, and never if the visitor has already started scrolling
    const id = window.setTimeout(() => {
      for (const ev of ["wheel", "touchstart", "pointerdown", "keydown"]) window.removeEventListener(ev, cancelEarly);
      if (window.scrollY > 40) return;
      tour = new Tour(() => setRunning(false));
      setRunning(true);
      tour.start();
    }, Math.max(0, 13200 - performance.now()));
    for (const ev of ["wheel", "touchstart", "pointerdown", "keydown"]) window.addEventListener(ev, cancelEarly, { passive: true, once: true });
    return () => {
      window.clearTimeout(id);
      for (const ev of ["wheel", "touchstart", "pointerdown", "keydown"]) window.removeEventListener(ev, cancelEarly);
      tour?.stop();
    };
  }, []);

  return (
    <div className={`tour-hint${running ? " is-on" : ""}`} role="status" aria-live="polite">
      {running ? "Sit back. Scroll or tap to take control." : ""}
    </div>
  );
}
