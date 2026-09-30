import type { FocusPart } from "../bag/engine";
import { COLOURS, type BagConfig } from "./schema";

/**
 * The build as one continuous flow that only ever asks ONE question at a time. Each step names the part of the bag it is about (the camera flies there)
 * and how it is answered. Pure data: the cockpit renders it. Steps that do not apply to the choices so far are skipped automatically.
 */
export type StepId =
  | "design" | "size" | "country" | "fill" | "material" | "body" | "layout" | "accent" | "stitching" | "caps"
  | "method" | "placement" | "logoSize" | "text" | "mark" | "hanging" | "finish" | "extras" | "quantity" | "review";

export type Answer =
  | { kind: "pills"; key: keyof BagConfig; options: ReadonlyArray<{ id: string | number; name: string }> }
  | { kind: "swatches"; key: "bodyColour" | "accentColour" | "capColour" }
  | { kind: "multi"; key: "extras"; options: ReadonlyArray<{ id: string; name: string }> }
  | { kind: "text"; key: "extraText" }
  | { kind: "stepper"; key: "quantity" }
  | { kind: "review" };

export interface StepDef {
  readonly id: StepId;
  readonly label: string;
  readonly question: string;
  readonly part: FocusPart;
  readonly answer: Answer;
  /** False when the choices so far make this question pointless (it is then skipped without being asked). */
  readonly applies?: (c: BagConfig) => boolean;
}

export const STEPS: readonly StepDef[] = [
  { id: "design", label: "Design", question: "Where do we start?", part: "whole", answer: { kind: "pills", key: "preset", options: [{ id: "plain", name: "Plain" }, { id: "tigerfull", name: "Tiger" }, { id: "monogram", name: "Monogram" }] } },
  { id: "size", label: "Length", question: "How long?", part: "whole", answer: { kind: "pills", key: "sizeFt", options: [{ id: 3, name: "3 ft" }, { id: 4, name: "4 ft" }, { id: 5, name: "5 ft" }] } },
  { id: "country", label: "Delivery", question: "Where is it going?", part: "whole", answer: { kind: "pills", key: "country", options: [{ id: "AU", name: "Australia" }, { id: "TH", name: "Thailand" }, { id: "GB", name: "United Kingdom" }, { id: "US", name: "United States" }, { id: "AE", name: "UAE" }, { id: "SG", name: "Singapore" }] } },
  { id: "fill", label: "Fill", question: "Filled or unfilled?", part: "body", answer: { kind: "pills", key: "fill", options: [{ id: "unfilled", name: "Unfilled, filled on site" }, { id: "filled", name: "Filled (local delivery)" }] } },
  { id: "material", label: "Material", question: "What is it made of?", part: "body", answer: { kind: "pills", key: "material", options: [{ id: "vinyl", name: "Premium vinyl" }, { id: "leather", name: "Genuine leather" }, { id: "canvas", name: "Heavy canvas" }] } },
  { id: "body", label: "Body", question: "Body colour", part: "body", answer: { kind: "swatches", key: "bodyColour" }, applies: (c) => c.preset === "plain" },
  { id: "layout", label: "Panels", question: "How are the panels split?", part: "body", answer: { kind: "pills", key: "panelLayout", options: [{ id: "single", name: "Single colour" }, { id: "split-vertical", name: "Vertical split" }, { id: "bands", name: "Bands" }, { id: "three-panel", name: "Three panel" }] }, applies: (c) => c.preset === "plain" },
  { id: "accent", label: "Accent", question: "Accent colour", part: "body", answer: { kind: "swatches", key: "accentColour" }, applies: (c) => c.preset === "plain" && c.panelLayout !== "single" },
  { id: "stitching", label: "Stitching", question: "Stitching", part: "body", answer: { kind: "pills", key: "stitching", options: [{ id: "tonal", name: "Tonal" }, { id: "contrast", name: "Contrast" }, { id: "accent", name: "Accent" }] } },
  { id: "caps", label: "Bands", question: "Band colour", part: "top", answer: { kind: "swatches", key: "capColour" }, applies: (c) => c.preset === "plain" },
  { id: "method", label: "Branding", question: "How is it branded?", part: "patch", answer: { kind: "pills", key: "brandingMethod", options: [{ id: "screen-print", name: "Screen print" }, { id: "embroidered-patch", name: "Embroidered patch" }, { id: "leather-patch", name: "Leather patch" }, { id: "debossed", name: "Debossed (leather)" }] } },
  { id: "placement", label: "Placement", question: "Where does it go?", part: "patch", answer: { kind: "pills", key: "placement", options: [{ id: "front", name: "Front" }, { id: "front-back", name: "Front + back" }, { id: "wrap", name: "Wrap" }, { id: "top-band", name: "Top band" }, { id: "bottom-band", name: "Bottom band" }] } },
  { id: "logoSize", label: "Logo size", question: "How big is the logo?", part: "patch", answer: { kind: "pills", key: "logoSize", options: [{ id: "S", name: "S" }, { id: "M", name: "M" }, { id: "L", name: "L" }, { id: "full", name: "Full height" }] } },
  { id: "text", label: "Words", question: "Your words (optional)", part: "patch", answer: { kind: "text", key: "extraText" } },
  { id: "mark", label: "Maker's mark", question: "Keep the Sanchez maker's mark?", part: "patch", answer: { kind: "pills", key: "makersMark", options: [{ id: "yes", name: "Keep it" }, { id: "no", name: "Remove it" }] } },
  { id: "hanging", label: "Hanging", question: "How does it hang?", part: "hardware", answer: { kind: "pills", key: "hanging", options: [{ id: "chain-4pt", name: "4-point chain" }, { id: "heavy-swivel", name: "Heavy swivel" }, { id: "strap", name: "Strap" }] } },
  { id: "finish", label: "Hardware", question: "Hardware finish", part: "hardware", answer: { kind: "pills", key: "hardware", options: [{ id: "black", name: "Black" }, { id: "silver", name: "Silver" }] } },
  { id: "extras", label: "Extras", question: "Any extras?", part: "whole", answer: { kind: "multi", key: "extras", options: [{ id: "qr-tag", name: "QR authenticity tag" }, { id: "cover", name: "Protective cover" }, { id: "spare-chain", name: "Spare chain set" }] } },
  { id: "quantity", label: "Quantity", question: "How many?", part: "whole", answer: { kind: "stepper", key: "quantity" } },
  { id: "review", label: "Review", question: "Yours.", part: "whole", answer: { kind: "review" } },
];

/** The steps that will actually be asked for this config, in order. */
export const activeSteps = (c: BagConfig): readonly StepDef[] => STEPS.filter((s) => !s.applies || s.applies(c));

/** Which step an issue (a rules-engine error) belongs to, so the cockpit can send you to fix it. */
export function stepForKey(key: string): StepId {
  const map: Record<string, StepId> = { preset: "design", sizeFt: "size", country: "country", fill: "fill", material: "material", bodyColour: "body", panelLayout: "layout", accentColour: "accent", stitching: "stitching", capColour: "caps", brandingMethod: "method", placement: "placement", logoSize: "logoSize", extraText: "text", makersMark: "mark", hanging: "hanging", hardware: "finish", extras: "extras", quantity: "quantity" };
  return map[key] ?? "review";
}

export type StepState = "answered" | "skipped" | "open";
export const colourOptions = COLOURS;
