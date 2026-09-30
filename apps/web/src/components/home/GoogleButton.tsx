"use client";

import { useEffect, useRef, useState } from "react";

interface GoogleId {
  initialize(o: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: "popup" | "redirect" }): void;
  renderButton(el: HTMLElement, o: Record<string, unknown>): void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
let script: Promise<void> | null = null;
function loadGsi(): Promise<void> {
  script ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Google sign-in could not load"));
    document.head.appendChild(s);
  });
  return script;
}

/** Google's own sign-in button (Google Identity Services). The credential it returns is verified on the server: see /api/waitlist/google. */
export function GoogleButton({ onCredential }: { onCredential: (credential: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const cb = useRef(onCredential);
  cb.current = onCredential;
  const [state, setState] = useState<"loading" | "ready" | "off" | "failed">(CLIENT_ID ? "loading" : "off");

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadGsi()
      .then(() => {
        const gid = window.google?.accounts.id;
        if (cancelled || !gid || !host.current) return;
        gid.initialize({ client_id: CLIENT_ID, callback: (r) => cb.current(r.credential), ux_mode: "popup" });
        gid.renderButton(host.current, { theme: "filled_black", size: "large", shape: "pill", text: "continue_with", width: 280 });
        setState("ready");
      })
      .catch(() => !cancelled && setState("failed"));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="waitlist__google">
      <div ref={host} aria-label="Continue with Google" />
      {state === "off" && <p className="waitlist__gnote">Google sign-in is not connected yet (needs a Google client ID).</p>}
      {state === "failed" && <p className="waitlist__gnote">Google sign-in could not load. Use your email instead.</p>}
    </div>
  );
}
