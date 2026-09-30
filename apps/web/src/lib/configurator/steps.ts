import type { FocusPart } from "../bag/engine";
import { COLOURS, type BagConfig } from "./schema";

/**
 * The build as one continuous flow that only ever asks ONE question at a time, ordered from the top of the bag to the bottom. Every question has a sensible
 * choice already selected (DEFAULT_BAG), so a visitor can simply tap Next. Each step names the part of the bag it is about and the camera flies to that
 * part and turns the bag to show it. Pure data: the cockpit renders it. Steps that do not apply to the choices so far are skipped without being asked.
 */
export type StepId =
  | "design" | "size" | "country" | "hanging" | "finish" | "caps" | "piping" | "material" | "body" | "layout" | "accent" | "stitching"
  | "method" | "placement" | "logoSize" | "text" | "font" | "mark" | "bottom" | "anchor" | "fill" | "fillType" | "extras" | "quantity" | "review";

export type GroupId = "order" | "hanging" | "crown" | "body" | "branding" | "bottom" | "inside" | "finish";

export const GROUPS: Readonly<Record<GroupId, string>> = { order: "Your bag", hanging: "Hanging", crown: "Top band", body: "Body", branding: "Branding", bottom: "Bottom", inside: "Inside", finish: "Finish" };

export type Answer =
  | { kind: "pills"; key: keyof BagConfig; options: ReadonlyArray<{ id: string | number; name: string }> }
  | { kind: "swatches"; key: "bodyColour" | "accentColour" | "capColour" | "bottomColour" }
  | { kind: "multi"; key: "extras"; options: ReadonlyArray<{ id: string; name: string }> }
  | { kind: "text"; key: "extraText" }
  | { kind: "stepper"; key: "quantity" }
  | { kind: "review" };

export interface StepDef {
  readonly id: StepId;
  readonly group: GroupId;
  readonly label: string;
  readonly question: string;
  readonly part: FocusPart;
  readonly answer: Answer;
  /** False when the choices so far make this question pointless (it is then skipped without being asked). */
  readonly applies?: (c: BagConfig) => boolean;
}

const YN = (yes: string, no: string): ReadonlyArray<{ id: string; name: string }> => [{ id: "yes", name: yes }, { id: "no", name: no }];
/** Keys held as booleans in the config but asked as yes/no pills. */
export const BOOLEAN_KEYS: readonly (keyof BagConfig)[] = ["makersMark", "anchorRing"];
const plain = (c: BagConfig): boolean => c.preset === "plain";

export const STEPS: readonly StepDef[] = [
  // your bag
  { id: "design", group: "order", label: "Design", question: "Where do we start?", part: "whole", answer: { kind: "pills", key: "preset", options: [{ id: "plain", name: "Plain" }, { id: "tigerfull", name: "Tiger" }, { id: "monogram", name: "Monogram" }] } },
  { id: "size", group: "order", label: "Length", question: "How long?", part: "whole", answer: { kind: "pills", key: "sizeFt", options: [{ id: 3, name: "3 ft" }, { id: 4, name: "4 ft" }, { id: 5, name: "5 ft" }] } },
  { id: "country", group: "order", label: "Delivery", question: "Where is it going?", part: "whole", answer: { kind: "pills", key: "country", options: [{ id: "AU", name: "Australia" }, { id: "TH", name: "Thailand" }, { id: "GB", name: "United Kingdom" }, { id: "US", name: "United States" }, { id: "AE", name: "UAE" }, { id: "SG", name: "Singapore" }] } },
  // hanging (the top)
  { id: "hanging", group: "hanging", label: "Hanging", question: "How does it hang?", part: "hardware", answer: { kind: "pills", key: "hanging", options: [{ id: "chain-4pt", name: "4-point chain" }, { id: "heavy-swivel", name: "Heavy swivel" }, { id: "strap", name: "Strap" }] } },
  { id: "finish", group: "hanging", label: "Hardware", question: "Hardware finish", part: "hardware", answer: { kind: "pills", key: "hardware", options: [{ id: "black", name: "Black" }, { id: "silver", name: "Silver" }] } },
  // top band
  { id: "caps", group: "crown", label: "Top band", question: "Top band colour", part: "top", answer: { kind: "swatches", key: "capColour" }, applies: plain },
  { id: "piping", group: "crown", label: "Trim", question: "Piping or trim?", part: "top", answer: { kind: "pills", key: "piping", options: [{ id: "none", name: "None" }, { id: "contrast", name: "Contrast" }] } },
  // body
  { id: "material", group: "body", label: "Material", question: "What is it made of?", part: "body", answer: { kind: "pills", key: "material", options: [{ id: "vinyl", name: "Premium vinyl" }, { id: "leather", name: "Genuine leather" }, { id: "canvas", name: "Heavy canvas" }] } },
  { id: "body", group: "body", label: "Body", question: "Body colour", part: "body", answer: { kind: "swatches", key: "bodyColour" }, applies: plain },
  { id: "layout", group: "body", label: "Panels", question: "How are the panels split?", part: "body", answer: { kind: "pills", key: "panelLayout", options: [{ id: "single", name: "Single colour" }, { id: "split-vertical", name: "Vertical split" }, { id: "bands", name: "Bands" }, { id: "three-panel", name: "Three panel" }] }, applies: plain },
  { id: "accent", group: "body", label: "Accent", question: "Accent colour", part: "body", answer: { kind: "swatches", key: "accentColour" }, applies: (c) => plain(c) && c.panelLayout !== "single" },
  { id: "stitching", group: "body", label: "Stitching", question: "Stitching colour", part: "body", answer: { kind: "pills", key: "stitching", options: [{ id: "tonal", name: "Tonal" }, { id: "contrast", name: "Contrast" }, { id: "accent", name: "Accent" }] } },
  // branding (the front)
  { id: "method", group: "branding", label: "Method", question: "How is it branded?", part: "patch", answer: { kind: "pills", key: "brandingMethod", options: [{ id: "screen-print", name: "Screen print" }, { id: "embroidered-patch", name: "Embroidered patch" }, { id: "leather-patch", name: "Leather patch" }, { id: "debossed", name: "Debossed (leather)" }] } },
  { id: "placement", group: "branding", label: "Placement", question: "Where does it go?", part: "patch", answer: { kind: "pills", key: "placement", options: [{ id: "front", name: "Front" }, { id: "front-back", name: "Front + back" }, { id: "wrap", name: "Wrap" }, { id: "top-band", name: "Top band" }, { id: "bottom-band", name: "Bottom band" }] } },
  { id: "logoSize", group: "branding", label: "Logo size", question: "How big is the logo?", part: "patch", answer: { kind: "pills", key: "logoSize", options: [{ id: "S", name: "S" }, { id: "M", name: "M" }, { id: "L", name: "L" }, { id: "full", name: "Full height" }] } },
  { id: "text", group: "branding", label: "Words", question: "Your words (optional)", part: "patch", answer: { kind: "text", key: "extraText" } },
  { id: "font", group: "branding", label: "Lettering", question: "Lettering style", part: "patch", answer: { kind: "pills", key: "font", options: [{ id: "classic", name: "Classic" }, { id: "block", name: "Block" }, { id: "script", name: "Script" }, { id: "stencil", name: "Stencil" }] }, applies: (c) => c.extraText.trim().length > 0 },
  { id: "mark", group: "branding", label: "Maker's mark", question: "Keep the Sanchez maker's mark?", part: "patch", answer: { kind: "pills", key: "makersMark", options: YN("Keep it", "Remove it") } },
  // bottom
  { id: "bottom", group: "bottom", label: "Bottom band", question: "Bottom band colour", part: "bottom", answer: { kind: "swatches", key: "bottomColour" }, applies: plain },
  { id: "anchor", group: "bottom", label: "Anchor ring", question: "Bottom anchor ring?", part: "bottom", answer: { kind: "pills", key: "anchorRing", options: YN("Add a ring", "No ring") } },
  // inside
  { id: "fill", group: "inside", label: "Fill", question: "Filled or unfilled?", part: "body", answer: { kind: "pills", key: "fill", options: [{ id: "unfilled", name: "Unfilled, filled on site" }, { id: "filled", name: "Filled (local delivery)" }] } },
  { id: "fillType", group: "inside", label: "Fill type", question: "What goes inside?", part: "body", answer: { kind: "pills", key: "fillType", options: [{ id: "shredded", name: "Shredded textile" }, { id: "soft-top", name: "Textile with a soft top" }] }, applies: (c) => c.fill === "filled" },
  // finish
  { id: "extras", group: "finish", label: "Extras", question: "Any extras?", part: "whole", answer: { kind: "multi", key: "extras", options: [{ id: "qr-tag", name: "QR authenticity tag" }, { id: "cover", name: "Protective cover" }, { id: "spare-chain", name: "Spare chain set" }] } },
  { id: "quantity", group: "finish", label: "Quantity", question: "How many?", part: "whole", answer: { kind: "stepper", key: "quantity" } },
  { id: "review", group: "finish", label: "Review", question: "Yours.", part: "whole", answer: { kind: "review" } },
];

/** The steps that will actually be asked for this config, in order. */
export const activeSteps = (c: BagConfig): readonly StepDef[] => STEPS.filter((s) => !s.applies || s.applies(c));

/** Which step an issue (a rules-engine error) belongs to, so the cockpit can send you to fix it. */
export function stepForKey(key: string): StepId {
  const map: Record<string, StepId> = { preset: "design", sizeFt: "size", country: "country", hanging: "hanging", hardware: "finish", capColour: "caps", piping: "piping", material: "material", bodyColour: "body", panelLayout: "layout", accentColour: "accent", stitching: "stitching", brandingMethod: "method", placement: "placement", logoSize: "logoSize", extraText: "text", font: "font", makersMark: "mark", bottomColour: "bottom", anchorRing: "anchor", fill: "fill", fillType: "fillType", extras: "extras", quantity: "quantity" };
  return map[key] ?? "review";
}

export type StepState = "answered" | "skipped" | "open";
export const colourOptions = COLOURS;
