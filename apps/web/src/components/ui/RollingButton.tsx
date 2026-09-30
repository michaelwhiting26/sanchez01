import type { CSSProperties, ReactNode } from "react";

/**
 * Rolling-letter CTA (ported from the mr-2 site): every character rolls up and is replaced by an identical one from below on hover,
 * with a two-arrow "send". The visual comes from .rollBtn / .enq__* in home.css.
 */
function Arrow({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M8 7 H17 V16" />
    </svg>
  );
}

export function RollingContent({ label }: { label: string }): ReactNode {
  return (
    <>
      <span className="enq__clip" aria-hidden="true">
        <span className="enq__text">
          {Array.from(label).map((ch, i) => {
            const c = ch === " " ? " " : ch;
            return (
              <span key={i} className="enq__char" style={{ "--i": i } as CSSProperties}>
                <span className="enq__a">{c}</span>
                <span className="enq__b">{c}</span>
              </span>
            );
          })}
        </span>
      </span>
      <span className="enq__icon" aria-hidden="true">
        <Arrow className="enq__arrowA" />
        <Arrow className="enq__arrowB" />
      </span>
    </>
  );
}

export function RollingLink({ label, href, className = "" }: { label: string; href: string; className?: string }) {
  return (
    <a className={`rollBtn ${className}`.trim()} href={href} aria-label={label}>
      <RollingContent label={label} />
    </a>
  );
}

export function RollingSubmit({ label, className = "", disabled = false }: { label: string; className?: string; disabled?: boolean }) {
  return (
    <button className={`rollBtn ${className}`.trim()} type="submit" aria-label={label} disabled={disabled}>
      <RollingContent label={label} />
    </button>
  );
}
