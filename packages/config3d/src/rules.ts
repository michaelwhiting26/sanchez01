/**
 * Built-in constraint rules (spec 01 §10). Parameters come from the schema document; the logic
 * lives here. Pure functions; no three.js, no I/O.
 */
import type { Choice, Constraint, OptionDef, ProductConfiguration } from "./schema";
import type { ConfigurationContext, SelectionValue } from "./selection";
import { evaluateCondition, type Values } from "./conditions";
import { issue, type AutoLineItem, type Fix, type Issue, type OptionLock } from "./issues";
import { formatIsoDay, parseIsoDay } from "./dates";

const FT_TO_MM = 304.8;
const toMm = (m: number): number => Math.round(m * 1000);

export interface RuleEnv {
  readonly schema: ProductConfiguration;
  readonly options: ReadonlyMap<string, OptionDef>;
  readonly values: Values;
  readonly context: ConfigurationContext;
  /** Option ids the user set explicitly (rule defaults never override these). */
  readonly userSet: ReadonlySet<string>;
}

export interface RuleOutcome {
  readonly issues: Issue[];
  readonly lineItems: AutoLineItem[];
  readonly locks: OptionLock[];
}

const empty = (): RuleOutcome => ({ issues: [], lineItems: [], locks: [] });

export function availableChoices(opt: OptionDef, values: Values): Choice[] {
  if (opt.kind !== "choice" && opt.kind !== "multi_choice") return [];
  return opt.choices.filter((c) => !c.availableWhen || evaluateCondition(c.availableWhen, values));
}

function selectedChoice(env: RuleEnv, optionId: string): Choice | undefined {
  const opt = env.options.get(optionId);
  const v = env.values[optionId];
  if (!opt || opt.kind !== "choice" || typeof v !== "string") return undefined;
  return opt.choices.find((c) => c.value === v);
}

function numAttr(choice: Choice | undefined, attr: string): number | undefined {
  const v = choice?.attributes?.[attr];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function numValue(env: RuleEnv, optionId: string | undefined): number | undefined {
  if (optionId === undefined) return undefined;
  const v = env.values[optionId];
  return typeof v === "number" ? v : undefined;
}

function strValue(env: RuleEnv, optionId: string): string | undefined {
  const v = env.values[optionId];
  return typeof v === "string" ? v : undefined;
}

/** Largest available choice (by numeric attribute) satisfying `fits`. */
function largestFitting(
  env: RuleEnv,
  optionId: string,
  attr: string,
  fits: (n: number) => boolean,
): Choice | undefined {
  const opt = env.options.get(optionId);
  if (!opt) return undefined;
  return availableChoices(opt, env.values)
    .filter((c) => {
      const n = numAttr(c, attr);
      return n !== undefined && fits(n);
    })
    .sort((a, b) => (numAttr(b, attr) ?? 0) - (numAttr(a, attr) ?? 0))[0];
}

/** Suggest the rule's alternative only if it would actually change the selection. */
function alternativeFix(env: RuleEnv, alt: { option: string; value: string } | undefined): Fix[] {
  if (!alt || env.values[alt.option] === alt.value) return [];
  return [{ type: "set_option", option: alt.option, value: alt.value }];
}

/** Defaults a rule injects before validation (never over a user-set value). */
export function ruleDefaults(c: Constraint, env: RuleEnv): Record<string, SelectionValue> {
  switch (c.rule) {
    case "export_unfilled_default": {
      const dest = env.context.destinationCountry;
      if (dest !== undefined && !c.homeCountries.includes(dest) && !env.userSet.has(c.fillOption)) {
        return { [c.fillOption]: c.unfilledValue };
      }
      return {};
    }
    case "competition_corner_lock": {
      const purpose = strValue(env, c.purposeOption);
      if (
        purpose !== undefined &&
        c.competitionValues.includes(purpose) &&
        !env.userSet.has(c.cornerOption)
      ) {
        return { [c.cornerOption]: c.lockedValue };
      }
      return {};
    }
    case "ceiling_vs_bag_length":
    case "stud_wall_backing":
    case "ceiling_mount_engineer":
    case "ring_room_clearance":
    case "low_res_logo":
    case "opening_date_lead_time":
      return {};
  }
}

export function checkConstraint(c: Constraint, env: RuleEnv): RuleOutcome {
  const out = empty();
  switch (c.rule) {
    case "ceiling_vs_bag_length": {
      const lengthFt = numAttr(selectedChoice(env, c.lengthOption), c.lengthFtAttribute);
      const ceilingM = numValue(env, c.ceilingOption) ?? env.context.room?.ceilingM;
      if (lengthFt === undefined || ceilingM === undefined) return out;
      const ceilingMm = toMm(ceilingM);
      const clearanceMm = toMm(c.clearanceM);
      const neededMm = Math.round(lengthFt * FT_TO_MM) + clearanceMm;
      if (ceilingMm < neededMm) {
        const shorter = largestFitting(
          env,
          c.lengthOption,
          c.lengthFtAttribute,
          (ft) => Math.round(ft * FT_TO_MM) + clearanceMm <= ceilingMm,
        );
        out.issues.push(
          issue(
            "ceiling_too_low",
            "error",
            [c.lengthOption, ...(c.ceilingOption ? [c.ceilingOption] : [])],
            `Ceiling ${ceilingM} m is below bag length + ${c.clearanceM} m clearance (${neededMm / 1000} m needed).`,
            [
              ...(shorter
                ? [{ type: "set_option" as const, option: c.lengthOption, value: shorter.value }]
                : []),
              ...alternativeFix(env, c.alternative),
            ],
          ),
        );
      }
      return out;
    }
    case "stud_wall_backing": {
      const wall = strValue(env, c.wallOption);
      const mount = strValue(env, c.mountOption);
      if (wall === undefined || mount === undefined || !c.mountValues.includes(mount)) return out;
      if (c.studValues.includes(wall)) {
        out.lineItems.push({
          id: c.lineItem.id,
          rule: c.rule,
          label: c.lineItem.label,
          priceKey: c.lineItem.priceKey,
        });
        out.issues.push(
          issue(
            "backing_plate_required",
            "warning",
            [c.wallOption, c.mountOption],
            "Stud wall with wall-mounted arms: a backing plate / structural check has been added.",
            [],
          ),
        );
      } else if (c.unknownValues.includes(wall)) {
        out.issues.push(
          issue(
            "wall_construction_unknown",
            "warning",
            [c.wallOption],
            "Wall construction unknown: wall arms need concrete, block or steel. Confirm before production.",
            [{ type: "offer_line_item", lineItem: c.lineItem }, { type: "contact_us" }],
          ),
        );
      }
      return out;
    }
    case "ceiling_mount_engineer": {
      const mount = strValue(env, c.mountOption);
      if (mount !== undefined && c.mountValues.includes(mount)) {
        out.lineItems.push({
          id: c.lineItem.id,
          rule: c.rule,
          label: c.lineItem.label,
          priceKey: c.lineItem.priceKey,
        });
        out.issues.push(
          issue(
            "engineer_signoff_required",
            "info",
            [c.mountOption],
            "Ceiling mounts need a structural engineer sign-off; it has been added.",
            [],
          ),
        );
      }
      return out;
    }
    case "ring_room_clearance": {
      const sizeFt = numAttr(selectedChoice(env, c.sizeOption), c.sizeFtAttribute);
      const apronM = numAttr(selectedChoice(env, c.apronOption), c.apronMAttribute);
      if (sizeFt === undefined || apronM === undefined) return out;
      const lengthM = numValue(env, c.roomLengthOption) ?? env.context.room?.lengthM;
      const widthM = numValue(env, c.roomWidthOption) ?? env.context.room?.widthM;
      if (lengthM === undefined || widthM === undefined) {
        out.issues.push(
          issue(
            "room_size_needed",
            "warning",
            [
              ...(c.roomLengthOption ? [c.roomLengthOption] : []),
              ...(c.roomWidthOption ? [c.roomWidthOption] : []),
            ],
            "Enter the room size so we can check the ring, apron and clearance fit.",
          ),
        );
        return out;
      }
      const extraMm = 2 * toMm(apronM) + 2 * toMm(c.clearanceM);
      const footprintMm = Math.round(sizeFt * FT_TO_MM) + extraMm;
      const roomMm = Math.min(toMm(lengthM), toMm(widthM));
      if (footprintMm > roomMm) {
        const smaller = largestFitting(
          env,
          c.sizeOption,
          c.sizeFtAttribute,
          (ft) => Math.round(ft * FT_TO_MM) + extraMm <= roomMm,
        );
        out.issues.push(
          issue(
            "ring_exceeds_room",
            "error",
            [
              c.sizeOption,
              c.apronOption,
              ...(c.roomLengthOption ? [c.roomLengthOption] : []),
              ...(c.roomWidthOption ? [c.roomWidthOption] : []),
            ],
            `Ring + apron + ${c.clearanceM} m clearance needs ${footprintMm / 1000} m square; the room's short side is ${roomMm / 1000} m.`,
            [
              ...(smaller
                ? [{ type: "set_option" as const, option: c.sizeOption, value: smaller.value }]
                : []),
              ...alternativeFix(env, c.alternative),
            ],
          ),
        );
      }
      return out;
    }
    case "competition_corner_lock": {
      const purpose = strValue(env, c.purposeOption);
      if (purpose === undefined || !c.competitionValues.includes(purpose)) return out;
      out.locks.push({ option: c.cornerOption, value: c.lockedValue, rule: c.rule });
      const corner = strValue(env, c.cornerOption);
      if (corner !== undefined && corner !== c.lockedValue) {
        out.issues.push(
          issue(
            "corner_colours_locked",
            "error",
            [c.cornerOption, c.purposeOption],
            "Competition rings keep red, blue and neutral corners.",
            [{ type: "set_option", option: c.cornerOption, value: c.lockedValue }],
          ),
        );
      }
      return out;
    }
    case "low_res_logo": {
      const logo = env.context.logo;
      if (logo?.format === "raster" && Math.max(logo.widthPx, logo.heightPx) < c.minLongestSidePx) {
        out.issues.push(
          issue(
            "low_resolution_logo",
            "warning",
            [],
            `Logo is ${logo.widthPx}×${logo.heightPx}px; under ${c.minLongestSidePx}px it may print soft. Upload a vector or larger file, or use our vectorising service.`,
            c.offer ? [{ type: "offer_line_item", lineItem: c.offer }] : [],
          ),
        );
      }
      return out;
    }
    case "opening_date_lead_time": {
      const opening =
        (c.openingDateOption ? strValue(env, c.openingDateOption) : undefined) ??
        env.context.openingDate;
      if (opening === undefined) return out;
      const ids = c.openingDateOption ? [c.openingDateOption] : [];
      const lead = env.schema.leadTimeDays;
      const today = env.context.today !== undefined ? parseIsoDay(env.context.today) : undefined;
      const openingDay = parseIsoDay(opening);
      if (lead === null || today === undefined || openingDay === undefined) {
        out.issues.push(
          issue(
            "lead_time_unknown",
            "info",
            ids,
            "Lead time cannot be checked yet; we will confirm the handover date with you.",
          ),
        );
        return out;
      }
      const earliest = today + lead;
      if (openingDay < earliest) {
        out.issues.push(
          issue(
            "opening_date_before_lead_time",
            "warning",
            ids,
            `Opening date ${opening} is before the estimated handover ${formatIsoDay(earliest)}.`,
            c.offers.map((li) => ({ type: "offer_line_item" as const, lineItem: li })),
          ),
        );
      }
      return out;
    }
    case "export_unfilled_default": {
      const dest = env.context.destinationCountry;
      if (dest === undefined || c.homeCountries.includes(dest)) return out;
      const fill = strValue(env, c.fillOption);
      if (fill === c.unfilledValue) {
        out.issues.push(
          issue(
            "export_unfilled_default",
            "info",
            [c.fillOption],
            "Export orders ship unfilled to cut freight; fill on site. Duties/VAT may apply at destination.",
          ),
        );
      } else if (fill !== undefined) {
        out.issues.push(
          issue(
            "export_filled_selected",
            "info",
            [c.fillOption],
            "Filled bags cost much more to ship abroad. Duties/VAT may apply at destination.",
            [{ type: "set_option", option: c.fillOption, value: c.unfilledValue }],
          ),
        );
      }
      return out;
    }
  }
}
