"use client";

import { useEffect, useRef } from "react";
import { mountBagLetters, type BagLettersHandle } from "@/lib/bag-letters";

/** Full-screen stage for the seven-bag SANCHEZ morph. `?t=<seconds>` freezes it at that moment (used for screenshots). */
export function BagLetters() {
  const stage = useRef<HTMLDivElement>(null);
  const handle = useRef<BagLettersHandle | null>(null);

  useEffect(() => {
    const host = stage.current;
    if (!host) return;
    const t = new URLSearchParams(window.location.search).get("t");
    handle.current = mountBagLetters(host, t === null ? null : Number.parseFloat(t));
    return () => handle.current?.destroy();
  }, []);

  return (
    <main style={{ position: "relative", blockSize: "100svh", minBlockSize: 420, background: "#0d0a08", color: "#f3eadc" }}>
      <div ref={stage} role="img" aria-label="Seven boxing bags spin and turn into the letters S A N C H E Z, one after another" style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "absolute", insetInline: 0, insetBlockEnd: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", pointerEvents: "none" }}>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: ".28em", textTransform: "uppercase", opacity: 0.6 }}>Designed in Sydney. Handmade in Pattaya.</p>
        <button
          type="button"
          onClick={() => handle.current?.replay()}
          style={{ pointerEvents: "auto", font: "inherit", fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: "#f3eadc", background: "transparent", border: "1px solid rgba(243,234,220,.45)", padding: "12px 22px", cursor: "pointer" }}
        >
          Replay
        </button>
      </div>
    </main>
  );
}
