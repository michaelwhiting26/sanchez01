import type { SelectionValue } from "./selection";
import type { LineItemDef } from "./schema";

export type IssueSeverity = "error" | "warning" | "info";

export type IssueCode =
  // structural
  | "unknown_option"
  | "invalid_type"
  | "invalid_choice"
  | "choice_unavailable"
  | "required"
  | "out_of_range"
  | "not_integer"
  | "too_long"
  | "too_few_items"
  | "too_many_items"
  | "invalid_colour"
  | "invalid_date"
  | "not_applicable"
  // spec 01 §10 rules
  | "ceiling_too_low"
  | "backing_plate_required"
  | "wall_construction_unknown"
  | "engineer_signoff_required"
  | "ring_exceeds_room"
  | "room_size_needed"
  | "corner_colours_locked"
  | "low_resolution_logo"
  | "opening_date_before_lead_time"
  | "lead_time_unknown"
  | "export_unfilled_default"
  | "export_filled_selected";

/** A suggested fix: guard rails, not dead ends (spec 01 §0.4). */
export type Fix =
  | { readonly type: "set_option"; readonly option: string; readonly value: SelectionValue }
  | { readonly type: "offer_line_item"; readonly lineItem: LineItemDef }
  | { readonly type: "contact_us" };

export interface Issue {
  readonly code: IssueCode;
  readonly severity: IssueSeverity;
  readonly optionIds: readonly string[];
  readonly message: string;
  readonly fixes: readonly Fix[];
}

/** A line item a rule forces onto the configuration (priced by computePrice). */
export interface AutoLineItem {
  readonly id: string;
  readonly rule: string;
  readonly label: LineItemDef["label"];
  readonly priceKey: string;
}

/** An option whose value is locked by a rule (the UI must disable other values). */
export interface OptionLock {
  readonly option: string;
  readonly value: string;
  readonly rule: string;
}

export const issue = (
  code: IssueCode,
  severity: IssueSeverity,
  optionIds: readonly string[],
  message: string,
  fixes: readonly Fix[] = [],
): Issue => ({ code, severity, optionIds, message, fixes });
