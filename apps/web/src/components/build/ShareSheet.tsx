"use client";

import { useEffect, useRef, useState } from "react";
import { SHARE_ICONS } from "./share-icons";
import { start as startScroll, stop as stopScroll } from "@/lib/scroll";

interface Target {
  readonly id: keyof typeof SHARE_ICONS;
  readonly label: string;
  readonly colour: string;
  readonly href: (url: string, text: string) => string;
  /** App-only links (no web fallback): shown on phones only. */
  readonly mobileOnly?: boolean;
}

const enc = encodeURIComponent;
const TARGETS: readonly Target[] = [
  { id: "whatsapp", label: "WhatsApp", colour: "#25D366", href: (u, t) => `https://wa.me/?text=${enc(`${t} ${u}`)}` },
  { id: "messages", label: "Messages", colour: "#34C759", href: (u, t) => `sms:?&body=${enc(`${t} ${u}`)}`, mobileOnly: true },
  { id: "messenger", label: "Messenger", colour: "#0084FF", href: (u) => `fb-messenger://share?link=${enc(u)}`, mobileOnly: true },
  { id: "telegram", label: "Telegram", colour: "#26A5E4", href: (u, t) => `https://t.me/share/url?url=${enc(u)}&text=${enc(t)}` },
  { id: "facebook", label: "Facebook", colour: "#0866FF", href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}` },
  { id: "x", label: "X", colour: "#000000", href: (u, t) => `https://x.com/intent/post?text=${enc(t)}&url=${enc(u)}` },
  { id: "gmail", label: "Email", colour: "#EA4335", href: (u, t) => `mailto:?subject=${enc("My Sanchez custom bag")}&body=${enc(`${t}\n\n${u}`)}` },
];

/** "Share your build": a bottom sheet with the messaging apps, copy link, and the phone's own share menu where there is one. */
export function ShareSheet({ url, open, onClose }: { url: string; open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const text = "Look at the bag I've designed with Sanchez Custom:";

  useEffect(() => {
    setMobile(window.matchMedia("(pointer: coarse)").matches);
    setCanNative(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    stopScroll("share-sheet"); // lib/scroll.ts: the page behind the sheet does not move; keyed, so it never releases another modal's lock
    const releaseScroll = (): void => startScroll("share-sheet");
    setCopied(false);
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      releaseScroll();
      window.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [open, onClose]);

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      field.current?.select(); // no clipboard access (e.g. plain http on a phone): select the link so a long-press copies it
      document.execCommand?.("copy");
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  async function native(): Promise<void> {
    try {
      await navigator.share({ title: "My Sanchez custom bag", text, url });
      onClose();
    } catch {
      /* cancelled */
    }
  }

  if (!open) return null;
  const targets = TARGETS.filter((t) => mobile || !t.mobileOnly);
  return (
    <div className="shs" role="presentation" onClick={onClose}>
      <div className="shs__panel" role="dialog" aria-modal="true" aria-labelledby="shs-title" tabIndex={-1} ref={panel} onClick={(e) => e.stopPropagation()}>
        <span className="shs__grab" aria-hidden="true" />
        <p className="shs__eyebrow">Sanchez Custom</p>
        <h2 className="shs__title" id="shs-title">
          Share your build
        </h2>
        <p className="shs__lede">Send your bag to a friend, a coach or the gym. The link opens exactly this design.</p>
        <ul className="shs__grid">
          {targets.map((t) => (
            <li key={t.id}>
              <a className="shs__app" href={t.href(url, text)} target={t.href(url, text).startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" onClick={() => window.setTimeout(onClose, 300)}>
                <span className="shs__icon" style={{ background: t.colour }}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d={SHARE_ICONS[t.id]} fill="#fff" />
                  </svg>
                </span>
                <span className="shs__label">{t.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="shs__link">
          <input ref={field} readOnly value={url} aria-label="Link to your build" onFocus={(e) => e.currentTarget.select()} />
          <button type="button" className={`shs__copy${copied ? " is-done" : ""}`} onClick={() => void copy()}>
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
        {canNative && (
          <button type="button" className="shs__more" onClick={() => void native()}>
            More options…
          </button>
        )}
        <button type="button" className="shs__close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
