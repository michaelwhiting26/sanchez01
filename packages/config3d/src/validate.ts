/**
 * validateSelection: the single source of truth for config validity, shared by client and server.
 * The server always re-runs this on untrusted input; client results are advisory.
 */
import { allOptions, type OptionDef, type ProductConfiguration } from "./schema";
import {
  ConfigurationContextSchema,
  SelectionSchema,
  type ConfigurationContext,
  type NormalizedSelection,
  type SelectionValue,
} from "./selection";
import { evaluateCondition, isPresent } from "./conditions";
import { issue, type AutoLineItem, type Issue, type OptionLock } from "./issues";
import { availableChoices, checkConstraint, ruleDefaults, type RuleEnv } from "./rules";
import { parseIsoDay } from "./dates";

export type ValidationResult =
  | {
      readonly ok: true;
      readonly selection: NormalizedSelection;
      /** Warnings and info only. */
      readonly issues: readonly Issue[];
      readonly lineItems: readonly AutoLineItem[];
      readonly locks: readonly OptionLock[];
    }
  | {
      readonly ok: false;
      readonly issues: readonly Issue[];
      readonly lineItems: readonly AutoLineItem[];
      readonly locks: readonly OptionLock[];
    };

const HEX = /^#[0-9A-Fa-f]{6}$/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

type Checked = { readonly value: SelectionValue } | { readonly issue: Issue };

function checkValue(
  opt: OptionDef,
  v: SelectionValue,
  values: Record<string, SelectionValue>,
): Checked {
  const bad = (code: Parameters<typeof issue>[0], message: string): Checked => ({
    issue: issue(code, "error", [opt.id], message),
  });
  switch (opt.kind) {
    case "choice": {
      if (typeof v !== "string") return bad("invalid_type", `${opt.id} must be a choice value`);
      const choice = opt.choices.find((c) => c.value === v);
      if (!choice) return bad("invalid_choice", `"${v}" is not an option for ${opt.id}`);
      if (!availableChoices(opt, values).includes(choice))
        return bad("choice_unavailable", `"${v}" is not available with the current selection`);
      return { value: v };
    }
    case "multi_choice": {
      if (!Array.isArray(v)) return bad("invalid_type", `${opt.id} must be a list`);
      const available = new Set(availableChoices(opt, values).map((c) => c.value));
      const all = new Set(opt.choices.map((c) => c.value));
      for (const item of v) {
        if (!all.has(item))
          return bad("invalid_choice", `"${item}" is not an option for ${opt.id}`);
        if (!available.has(item))
          return bad("choice_unavailable", `"${item}" is not available with the current selection`);
      }
      const unique = [...new Set(v)].sort();
      if (opt.minItems !== undefined && unique.length < opt.minItems)
        return bad("too_few_items", `${opt.id} needs at least ${opt.minItems}`);
      if (opt.maxItems !== undefined && unique.length > opt.maxItems)
        return bad("too_many_items", `${opt.id} allows at most ${opt.maxItems}`);
      return { value: unique };
    }
    case "number": {
      if (typeof v !== "number" || !Number.isFinite(v))
        return bad("invalid_type", `${opt.id} must be a number`);
      if (opt.integer && !Number.isInteger(v))
        return bad("not_integer", `${opt.id} must be a whole number`);
      if (v < opt.min || v > opt.max)
        return bad(
          "out_of_range",
          `${opt.id} must be between ${opt.min} and ${opt.max} ${opt.unit}`,
        );
      return { value: v };
    }
    case "boolean":
      return typeof v === "boolean"
        ? { value: v }
        : bad("invalid_type", `${opt.id} must be true or false`);
    case "colour":
      if (typeof v !== "string") return bad("invalid_type", `${opt.id} must be a colour`);
      return HEX.test(v)
        ? { value: v.toUpperCase() }
        : bad("invalid_colour", `${opt.id} must be #RRGGBB`);
    case "colour_list": {
      if (!Array.isArray(v)) return bad("invalid_type", `${opt.id} must be a list of colours`);
      if (!v.every((c) => HEX.test(c)))
        return bad("invalid_colour", `${opt.id} colours must be #RRGGBB`);
      if (v.length < opt.minItems)
        return bad("too_few_items", `${opt.id} needs at least ${opt.minItems} colours`);
      if (v.length > opt.maxItems)
        return bad("too_many_items", `${opt.id} allows at most ${opt.maxItems} colours`);
      return { value: v.map((c) => c.toUpperCase()) };
    }
    case "text": {
      if (typeof v !== "string") return bad("invalid_type", `${opt.id} must be text`);
      const clean = v.replace(CONTROL_CHARS, "").trim();
      if (clean.length > opt.maxLength)
        return bad("too_long", `${opt.id} allows at most ${opt.maxLength} characters`);
      return { value: clean };
    }
    case "date":
      if (typeof v !== "string" || parseIsoDay(v) === undefined)
        return bad("invalid_date", `${opt.id} must be a valid YYYY-MM-DD date`);
      return { value: v };
  }
}

function defaultOf(opt: OptionDef): SelectionValue | undefined {
  switch (opt.kind) {
    case "choice":
    case "number":
    case "boolean":
    case "colour":
      return opt.default;
    case "multi_choice":
      return []; // "nothing selected" is an explicit empty list, so price templates fan out to zero lines
    case "colour_list":
    case "text":
    case "date":
      return undefined;
  }
}

export function validateSelection(
  schema: ProductConfiguration,
  rawSelection: unknown,
  rawContext: unknown = {},
): ValidationResult {
  const issues: Issue[] = [];
  const fail = (): ValidationResult => ({ ok: false, issues, lineItems: [], locks: [] });

  const sel = SelectionSchema.safeParse(rawSelection);
  if (!sel.success) {
    issues.push(issue("invalid_type", "error", [], "Selection must be an object of option values"));
    return fail();
  }
  const ctxParsed = ConfigurationContextSchema.safeParse(rawContext);
  if (!ctxParsed.success) {
    issues.push(
      issue(
        "invalid_type",
        "error",
        [],
        `Invalid configuration context: ${ctxParsed.error.issues[0]?.message ?? "unknown"}`,
      ),
    );
    return fail();
  }
  const context: ConfigurationContext = ctxParsed.data;
  const options = allOptions(schema);
  const byId = new Map(options.map((o) => [o.id, o]));

  const userSet = new Set<string>();
  const values: Record<string, SelectionValue> = {};
  for (const [k, v] of Object.entries(sel.data)) {
    if (!byId.has(k)) {
      issues.push(issue("unknown_option", "error", [k], `Unknown option "${k}"`));
      continue;
    }
    userSet.add(k);
    values[k] = v;
  }
  for (const opt of options) {
    const d = defaultOf(opt);
    if (!userSet.has(opt.id) && d !== undefined) values[opt.id] = d;
  }
  const env = (): RuleEnv => ({ schema, options: byId, values, context, userSet });
  for (const c of schema.constraints) Object.assign(values, ruleDefaults(c, env()));

  // Strip options hidden by visibleWhen; repeat until stable because visibility can chain.
  const visible = new Set(options.map((o) => o.id));
  for (let changed = true; changed;) {
    changed = false;
    for (const opt of options) {
      if (visible.has(opt.id) && opt.visibleWhen && !evaluateCondition(opt.visibleWhen, values)) {
        visible.delete(opt.id);
        if (opt.id in values) {
          if (userSet.has(opt.id)) {
            issues.push(
              issue(
                "not_applicable",
                "info",
                [opt.id],
                `${opt.id} does not apply to this configuration and was ignored`,
              ),
            );
          }
          delete values[opt.id];
        }
        changed = true;
      }
    }
  }

  // Type/range checks, in schema order (choice availability depends on earlier values).
  for (const opt of options) {
    if (!visible.has(opt.id)) continue;
    const v = values[opt.id];
    if (v === undefined) continue;
    const checked = checkValue(opt, v, values);
    if ("issue" in checked) {
      delete values[opt.id];
      if (userSet.has(opt.id)) issues.push(checked.issue);
    } else {
      values[opt.id] = checked.value;
    }
  }
  for (const opt of options) {
    if (
      visible.has(opt.id) &&
      opt.required &&
      !isPresent(values[opt.id]) &&
      !issues.some((i) => i.optionIds[0] === opt.id && i.severity === "error")
    ) {
      issues.push(issue("required", "error", [opt.id], `${opt.label.en} is required`));
    }
  }

  const lineItems: AutoLineItem[] = [];
  const locks: OptionLock[] = [];
  for (const c of schema.constraints) {
    const out = checkConstraint(c, env());
    issues.push(...out.issues);
    lineItems.push(...out.lineItems);
    locks.push(...out.locks);
  }

  if (issues.some((i) => i.severity === "error")) return { ok: false, issues, lineItems, locks };
  const sorted = Object.fromEntries(
    Object.entries(values).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
  return {
    ok: true,
    selection: { schemaId: schema.id, schemaVersion: schema.version, values: sorted },
    issues,
    lineItems,
    locks,
  };
}
