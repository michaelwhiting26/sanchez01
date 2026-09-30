import type { FocusPart } from "../bag/engine";
import type { BagConfig } from "./schema";

/** The build, as one question at a time. Each step names the part of the bag it is about, and the camera flies to it. Pure data: the cockpit renders it. */
export type StepId = "design" | "size" | "delivery" | "material" | "body" | "layout" | "caps" | "branding" | "logo" | "hardware" | "extras" | "quantity" | "review";

export interface StepDef {
  readonly id: StepId;
  readonly label: string;
  readonly question: string;
  readonly hint: string;
  readonly part: FocusPart;
  /** The config keys this step decides (used to say what was chosen, and to find the step an error belongs to). */
  readonly keys: ReadonlyArray<keyof BagConfig>;
}

export const STEPS: readonly StepDef[] = [
  { id: "design", label: "Design", question: "Where do we start?", hint: "A design with artwork, or a plain bag in your own colours.", part: "whole", keys: ["preset"] },
  { id: "size", label: "Size", question: "How long?", hint: "Heavy bag, by length.", part: "whole", keys: ["sizeFt"] },
  { id: "delivery", label: "Delivery", question: "Where is it going?", hint: "Filled bags are for local delivery; everywhere else ships unfilled, filled on site.", part: "whole", keys: ["country", "fill"] },
  { id: "material", label: "Material", question: "What is it made of?", hint: "Premium vinyl, genuine leather or heavy canvas.", part: "body", keys: ["material"] },
  { id: "body", label: "Body", question: "Body colour", hint: "The colour of the main panel.", part: "body", keys: ["bodyColour"] },
  { id: "layout", label: "Panels", question: "Panels and accent", hint: "One colour, or split it up with an accent.", part: "body", keys: ["panelLayout", "accentColour", "stitching"] },
  { id: "caps", label: "Bands", question: "Top and bottom bands", hint: "The bands and caps that frame the bag.", part: "top", keys: ["capColour"] },
  { id: "branding", label: "Branding", question: "How is it branded?", hint: "The method, and where the logo sits.", part: "patch", keys: ["brandingMethod", "placement"] },
  { id: "logo", label: "Logo", question: "Logo size and words", hint: "How big, and up to 30 characters of your own text.", part: "patch", keys: ["logoSize", "extraText", "makersMark"] },
  { id: "hardware", label: "Hardware", question: "Hanging and hardware", hint: "How it hangs, and the finish of the metal.", part: "hardware", keys: ["hanging", "hardware"] },
  { id: "extras", label: "Extras", question: "Anything else?", hint: "Small additions.", part: "whole", keys: ["extras"] },
  { id: "quantity", label: "Quantity", question: "How many?", hint: "Order more than one and each is priced down.", part: "whole", keys: ["quantity"] },
  { id: "review", label: "Review", question: "Yours.", hint: "Made by hand, for you.", part: "whole", keys: [] },
];

/** Which step an issue (a rules-engine error) belongs to, so the cockpit can send you to fix it. */
export function stepForKey(key: string): StepId {
  return STEPS.find((s) => (s.keys as readonly string[]).includes(key))?.id ?? "review";
}

export type StepState = "answered" | "skipped" | "open";
