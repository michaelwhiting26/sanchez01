"use client";

import { useState } from "react";
import type { PartId } from "@/lib/bag/engine";
import { FINISHES, HARDWARE_PALETTE, PART_PALETTE, type BagConfig, type Finish, type PartKey, type Parts } from "@/lib/configurator/schema";

/**
 * Build by parts, inside the build dock. The hierarchy, simple first and deep on demand:
 *   zones (Body, Top, Straps, Bottom, Details)
 *     -> parts in the zone; paired parts (the two panels, the two domes, the four straps) are linked by default, "Edit each" splits them
 *       -> colour swatches (+ custom colour), then finish.
 * Colourways set every part at once. Tapping a part on the 3D bag opens it here (the cockpit passes `active`).
 */
export interface Zone {
  readonly id: "body" | "top" | "straps" | "bottom" | "details";
  readonly label: string;
  readonly hint: string;
  readonly parts: readonly PartKey[];
  /** Parts that move together while linked. */
  readonly linked?: readonly PartKey[];
}

export const ZONES: readonly Zone[] = [
  { id: "body", label: "Body", hint: "Each side is separate: make it two-tone", parts: ["panelL", "panelR"], linked: ["panelL", "panelR"] },
  { id: "top", label: "Top", hint: "Top domes and waistband", parts: ["domeL", "domeR", "bandTop"], linked: ["domeL", "domeR"] },
  { id: "straps", label: "Straps", hint: "Four straps, each on its own", parts: ["strap1", "strap2", "strap3", "strap4"], linked: ["strap1", "strap2", "strap3", "strap4"] },
  { id: "bottom", label: "Bottom", hint: "The band around the base", parts: ["bandBottom"] },
  { id: "details", label: "Details", hint: "Badge, stitching and hardware", parts: ["patch", "stitching", "hardware"] },
];

export const PART_NAMES: Readonly<Record<PartKey, string>> = {
  panelL: "Left panel", panelR: "Right panel", domeL: "Top dome, left", domeR: "Top dome, right", bandTop: "Top waistband",
  strap1: "Strap 1", strap2: "Strap 2", strap3: "Strap 3", strap4: "Strap 4", bandBottom: "Bottom waistband",
  patch: "Badge patch", stitching: "Stitching", hardware: "Chain and hardware",
};
const LINKED_NAME: Partial<Record<Zone["id"], string>> = { body: "Both panels", top: "Both domes", straps: "All four straps" };

const FINISH_NAME: Readonly<Record<Finish, string>> = { gloss: "Gloss vinyl", satin: "Satin", matte: "Matte", metallic: "Metallic" };

/** Colourways that set every part at once (the same starting points as the Sanchez Custom presets). */
const COLOURWAYS: ReadonlyArray<{ name: string; left: string; right: string; trim: string }> = [
  { name: "Royal Blue", left: "#1f6fd1", right: "#1f6fd1", trim: "#eeece6" },
  { name: "Fight Red", left: "#d7331f", right: "#d7331f", trim: "#eeece6" },
  { name: "Gold & Black", left: "#d4a93a", right: "#111316", trim: "#eeece6" },
  { name: "Green & Red", left: "#1c6b3c", right: "#d7331f", trim: "#eeece6" },
  { name: "Midnight", left: "#172a4d", right: "#172a4d", trim: "#d4a93a" },
];

export const zoneOf = (p: PartKey): Zone => ZONES.find((z) => z.parts.includes(p)) ?? (ZONES[0] as Zone);

export function PartsPanel({ cfg, setParts, active, setActive }: { cfg: BagConfig; setParts: (p: Parts) => void; active: PartKey; setActive: (p: PartKey) => void }) {
  const parts = cfg.parts as Parts;
  const zone = zoneOf(active);
  const [split, setSplit] = useState<Partial<Record<Zone["id"], boolean>>>({});
  const [more, setMore] = useState(false);
  const isSplit = !!split[zone.id];
  const look = parts[active];
  const palette = active === "hardware" ? HARDWARE_PALETTE : PART_PALETTE;
  // the parts this edit writes to: a linked group while linked, else just the one
  const targets: readonly PartKey[] = zone.linked && !isSplit && zone.linked.includes(active) ? zone.linked : [active];
  const write = (patch: Partial<{ hex: string; finish: Finish }>): void => {
    const next = { ...parts };
    for (const t of targets) next[t] = { ...next[t], ...patch };
    setParts(next);
  };
  const colourway = (w: (typeof COLOURWAYS)[number]): void => {
    const L = (hex: string, finish: Finish) => ({ hex, finish });
    setParts({
      ...parts,
      panelL: L(w.left, parts.panelL.finish), panelR: L(w.right, parts.panelR.finish), domeL: L(w.left, parts.domeL.finish), domeR: L(w.right, parts.domeR.finish),
      bandTop: L(w.trim, "satin"), strap1: L(w.trim, "satin"), strap2: L(w.trim, "satin"), strap3: L(w.trim, "satin"), strap4: L(w.trim, "satin"),
      bandBottom: L(w.trim, "satin"),
    });
  };
  const n = ZONES.flatMap((z) => z.parts).length;
  const pos = ZONES.flatMap((z) => z.parts).indexOf(active) + 1;

  return (
    <div className="pp">
      <div className="pp__zones" role="tablist" aria-label="Part of the bag">
        {ZONES.map((z) => (
          <button key={z.id} type="button" role="tab" aria-selected={z.id === zone.id} onClick={() => setActive(z.parts[0] as PartKey)}>{z.label}</button>
        ))}
      </div>
      <p className="pp__hint"><span>Part {pos} of {n}</span>{PART_NAMES[active]} · {zone.hint}</p>
      {zone.parts.length > 1 && (
        <div className="pp__parts">
          {zone.linked && (
            <button type="button" className="pp__link" aria-pressed={isSplit} onClick={() => setSplit((s) => ({ ...s, [zone.id]: !isSplit }))}>
              {isSplit ? "Edit each ✓" : `${LINKED_NAME[zone.id] ?? "Together"} · edit each`}
            </button>
          )}
          {zone.parts.filter((p) => isSplit || !zone.linked?.includes(p) || p === zone.linked?.[0]).map((p) => (
            <button key={p} type="button" aria-pressed={p === active || (!isSplit && zone.linked?.includes(p) && zone.linked.includes(active))} onClick={() => setActive(p)}>
              <i style={{ background: parts[p].hex }} />
              {!isSplit && zone.linked?.includes(p) ? LINKED_NAME[zone.id] : PART_NAMES[p]}
            </button>
          ))}
        </div>
      )}
      <div className="pp__sw" role="radiogroup" aria-label={`${PART_NAMES[active]} colour`}>
        {palette.map((c) => (
          <button key={c.hex} type="button" role="radio" aria-checked={look.hex.toLowerCase() === c.hex.toLowerCase()} aria-label={c.name} title={c.name} style={{ background: c.hex }} onClick={() => write({ hex: c.hex })} />
        ))}
        <label className="pp__custom" title="Custom colour">
          <i style={{ background: look.hex }} />
          Custom
          <input type="color" value={look.hex} aria-label="Custom colour" onChange={(e) => write({ hex: e.target.value })} />
        </label>
      </div>
      <div className="pp__more">
        <button type="button" className="pp__moretoggle" aria-expanded={more} onClick={() => setMore((v) => !v)}>{more ? "Hide finish" : `Finish · ${FINISH_NAME[look.finish]}`}</button>
        {more && (
          <div className="pp__finish" role="radiogroup" aria-label="Finish">
            {FINISHES.map((f) => <button key={f} type="button" role="radio" aria-checked={look.finish === f} onClick={() => write({ finish: f })}>{FINISH_NAME[f]}</button>)}
          </div>
        )}
      </div>
      {zone.id === "body" && (
        <div className="pp__ways" aria-label="Start from a colourway">
          {COLOURWAYS.map((w) => (
            <button key={w.name} type="button" onClick={() => colourway(w)} title={`${w.name}: sets every part`}>
              <i style={{ background: `linear-gradient(90deg, ${w.left} 50%, ${w.right} 50%)` }} />{w.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** A plain-text spec of every part (for Copy spec and the review). */
export function partsSpec(parts: Parts): string {
  return ZONES.flatMap((z) => z.parts).map((p) => `${PART_NAMES[p]}: ${parts[p].hex.toUpperCase()} ${FINISH_NAME[parts[p].finish]}`).join("\n");
}

export const asPartKey = (p: PartId): PartKey => p;
