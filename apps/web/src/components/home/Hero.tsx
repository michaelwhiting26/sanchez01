import { SIGNATURE_PATHS, SIGNATURE_VIEWBOX } from "./signature-paths";
import { HeroField } from "./HeroField";

/** The hero: the field canvas (client) plus the static "Custom" signature and the dark pool behind it. */
export function Hero() {
  return (
    <section className="wm-hero wm-hero--rings" aria-label="Sanchez" data-hero-rings>
      <h1 className="visually-hidden">Sanchez Custom Boxing</h1>
      <HeroField />
      <div className="wm-hero__static" aria-hidden="true">SANCHEZ</div>
      <div className="wm-hero__pool" aria-hidden="true" />
      <div className="wm-hero__sig" aria-hidden="true">
        <svg className="sig" viewBox={SIGNATURE_VIEWBOX} role="img" aria-label="Custom">
          {SIGNATURE_PATHS.map((d, i) => (
            <path key={i} className="sig__p" style={{ "--i": i } as React.CSSProperties} pathLength={1} d={d} />
          ))}
        </svg>
      </div>
      <div className="wm-hero__glass" aria-hidden="true" />
    </section>
  );
}
