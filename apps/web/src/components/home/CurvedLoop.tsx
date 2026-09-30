"use client";

import { useEffect, useRef } from "react";
import { CurvedLoop as Engine } from "@/lib/curved-loop";

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

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const loop = new Engine({ root, text, curve, speed, starSrc, reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches });
    loop.start();
    return () => loop.destroy();
  }, [text, curve, speed, starSrc]);

  return <section className="curved-loop" ref={rootRef} data-curved-loop="" />;
}
