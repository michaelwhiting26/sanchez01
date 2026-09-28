/**
 * Versioned, declarative product configuration schema (spec 04 §6.1, spec 01).
 * Products are data, not code: the same document drives the HTML controls, the 3D material swaps
 * (via MaterialSlotMap), pricing, validation and the factory spec sheet.
 *
 * Versioning (docs/decisions/0004): `format` is the engine's document-format version; `version` is
 * the content revision (semver) of this product's schema. Orders snapshot both plus the full document.
 */
import { z } from "zod";
import { PaymentModeSchema, PriceKeySchema, RoundingModeSchema } from "@sanchez/domain";

export const SCHEMA_FORMAT_VERSION = 1 as const;

export const IdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9_]*$/, { message: "ids are snake_case" })
  .max(64);
export const ChoiceValueSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9_]*$/)
  .max(64);
export const HexColourSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, { message: "colour must be #RRGGBB" });
export const IsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "date must be YYYY-MM-DD" });

/** Bilingual label. Thai is optional in the schema; the spec-sheet builder reports missing translations. */
export const LabelSchema = z
  .object({ en: z.string().min(1).max(200), th: z.string().min(1).max(200).optional() })
  .strict();
export type Label = z.infer<typeof LabelSchema>;

export type Scalar = string | number | boolean;
export type Condition =
  | { option: string; eq: Scalar }
  | { option: string; in: Scalar[] }
  | { option: string; includes: string }
  | { option: string; present: boolean }
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition };

const ScalarSchema = z.union([z.string(), z.number(), z.boolean()]);
export const ConditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    z.object({ option: IdSchema, eq: ScalarSchema }).strict(),
    z.object({ option: IdSchema, in: z.array(ScalarSchema).min(1) }).strict(),
    z.object({ option: IdSchema, includes: z.string() }).strict(),
    z.object({ option: IdSchema, present: z.boolean() }).strict(),
    z.object({ all: z.array(ConditionSchema).min(1) }).strict(),
    z.object({ any: z.array(ConditionSchema).min(1) }).strict(),
    z.object({ not: ConditionSchema }).strict(),
  ]),
);

export const ChoiceSchema = z
  .object({
    value: ChoiceValueSchema,
    label: LabelSchema,
    /** Numeric/text facts the rules engine may read (e.g. lengthFt). PLACEHOLDER until confirmed by Jesse. */
    attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    /** Choice only offered when this holds (e.g. debossing only on leather). */
    availableWhen: ConditionSchema.optional(),
  })
  .strict();
export type Choice = z.infer<typeof ChoiceSchema>;

const optionBase = {
  id: IdSchema,
  label: LabelSchema,
  required: z.boolean(),
  /** Option only applies when this holds; hidden options are stripped from the selection. */
  visibleWhen: ConditionSchema.optional(),
};

export const OptionSchema = z.discriminatedUnion("kind", [
  z
    .object({
      ...optionBase,
      kind: z.literal("choice"),
      choices: z.array(ChoiceSchema).min(1),
      default: ChoiceValueSchema.optional(),
    })
    .strict(),
  z
    .object({
      ...optionBase,
      kind: z.literal("multi_choice"),
      choices: z.array(ChoiceSchema).min(1),
      minItems: z.number().int().nonnegative().optional(),
      maxItems: z.number().int().positive().optional(),
    })
    .strict(),
  z
    .object({
      ...optionBase,
      kind: z.literal("number"),
      min: z.number(),
      max: z.number(),
      integer: z.boolean(),
      unit: z.enum(["m", "mm", "ft", "kg", "count"]),
      default: z.number().optional(),
    })
    .strict(),
  z.object({ ...optionBase, kind: z.literal("boolean"), default: z.boolean().optional() }).strict(),
  z
    .object({ ...optionBase, kind: z.literal("colour"), default: HexColourSchema.optional() })
    .strict(),
  z
    .object({
      ...optionBase,
      kind: z.literal("colour_list"),
      minItems: z.number().int().nonnegative(),
      maxItems: z.number().int().positive(),
    })
    .strict(),
  z
    .object({ ...optionBase, kind: z.literal("text"), maxLength: z.number().int().positive() })
    .strict(),
  z.object({ ...optionBase, kind: z.literal("date") }).strict(),
]);
export type OptionDef = z.infer<typeof OptionSchema>;
export type OptionKind = OptionDef["kind"];

export const StepSchema = z
  .object({ id: IdSchema, label: LabelSchema, options: z.array(OptionSchema) })
  .strict();
export type Step = z.infer<typeof StepSchema>;

/** A line item a rule can force or offer (e.g. engineer sign-off). Priced from the price book by `priceKey`. */
export const LineItemDefSchema = z
  .object({ id: IdSchema, label: LabelSchema, priceKey: PriceKeySchema })
  .strict();
export type LineItemDef = z.infer<typeof LineItemDefSchema>;

const SetOptionSchema = z.object({ option: IdSchema, value: ChoiceValueSchema }).strict();

/** Declarative constraint rules (spec 01 §10). Each entry names a built-in rule and its parameters. */
export const ConstraintSchema = z.discriminatedUnion("rule", [
  z
    .object({
      rule: z.literal("ceiling_vs_bag_length"),
      lengthOption: IdSchema,
      lengthFtAttribute: z.string().min(1),
      /** Selection option holding ceiling height in metres; falls back to context.room.ceilingM. */
      ceilingOption: IdSchema.optional(),
      clearanceM: z.number().nonnegative(),
      alternative: SetOptionSchema.optional(),
    })
    .strict(),
  z
    .object({
      rule: z.literal("stud_wall_backing"),
      wallOption: IdSchema,
      studValues: z.array(ChoiceValueSchema).min(1),
      unknownValues: z.array(ChoiceValueSchema),
      mountOption: IdSchema,
      mountValues: z.array(ChoiceValueSchema).min(1),
      lineItem: LineItemDefSchema,
    })
    .strict(),
  z
    .object({
      rule: z.literal("ceiling_mount_engineer"),
      mountOption: IdSchema,
      mountValues: z.array(ChoiceValueSchema).min(1),
      lineItem: LineItemDefSchema,
    })
    .strict(),
  z
    .object({
      rule: z.literal("ring_room_clearance"),
      sizeOption: IdSchema,
      sizeFtAttribute: z.string().min(1),
      apronOption: IdSchema,
      apronMAttribute: z.string().min(1),
      clearanceM: z.number().nonnegative(),
      roomLengthOption: IdSchema.optional(),
      roomWidthOption: IdSchema.optional(),
      alternative: SetOptionSchema.optional(),
    })
    .strict(),
  z
    .object({
      rule: z.literal("competition_corner_lock"),
      purposeOption: IdSchema,
      competitionValues: z.array(ChoiceValueSchema).min(1),
      cornerOption: IdSchema,
      lockedValue: ChoiceValueSchema,
    })
    .strict(),
  z
    .object({
      rule: z.literal("low_res_logo"),
      minLongestSidePx: z.number().int().positive(),
      offer: LineItemDefSchema.optional(),
    })
    .strict(),
  z
    .object({
      rule: z.literal("opening_date_lead_time"),
      /** Selection option holding the opening date; falls back to context.openingDate. */
      openingDateOption: IdSchema.optional(),
      offers: z.array(LineItemDefSchema),
    })
    .strict(),
  z
    .object({
      rule: z.literal("export_unfilled_default"),
      fillOption: IdSchema,
      unfilledValue: ChoiceValueSchema,
      /** ISO 3166-1 alpha-2 codes that count as "local delivery" (filled allowed by default). */
      homeCountries: z.array(z.string().regex(/^[A-Z]{2}$/)).min(1),
    })
    .strict(),
]);
export type Constraint = z.infer<typeof ConstraintSchema>;
export type ConstraintRuleName = Constraint["rule"];

/**
 * Price keys may contain `{option_id}` placeholders, expanded from the selection. A missing/hidden
 * option expands to `none`; a multi_choice expands to one line per selected value.
 */
export const PriceModifierSchema = z
  .object({
    id: IdSchema,
    label: LabelSchema,
    priceKey: z.string().min(1).max(160),
    when: ConditionSchema.optional(),
    /** unit: × quantity before tier discount. line: once per configured item, after discount. */
    scope: z.enum(["unit", "line"]),
    /** Multiply by a numeric option (e.g. number of stations). */
    multiplyBy: IdSchema.optional(),
  })
  .strict();
export type PriceModifier = z.infer<typeof PriceModifierSchema>;

export const PricingSchema = z
  .object({
    base: z.object({ priceKey: z.string().min(1).max(160), label: LabelSchema }).strict(),
    modifiers: z.array(PriceModifierSchema),
    quantity: z
      .object({
        option: IdSchema,
        tiers: z
          .array(
            z
              .object({
                minQty: z.number().int().positive(),
                discountBps: z.number().int().min(0).max(10_000),
              })
              .strict(),
          )
          .min(1),
      })
      .strict()
      .optional(),
    /** Displayed range half-width in basis points while the spec is not locked (spec 01 §6: ±15%). */
    rangeBps: z.number().int().min(0).max(5_000),
    rounding: RoundingModeSchema,
  })
  .strict();
export type Pricing = z.infer<typeof PricingSchema>;

export const PRODUCT_TYPES = ["bag", "bag_wall", "ring"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

const TEMPLATE_VAR = /\{([a-z][a-z0-9_]*)\}/g;
export const templateVariables = (template: string): string[] =>
  [...template.matchAll(TEMPLATE_VAR)].map((m) => m[1] ?? "");

function conditionOptions(c: Condition): string[] {
  if ("all" in c) return c.all.flatMap(conditionOptions);
  if ("any" in c) return c.any.flatMap(conditionOptions);
  if ("not" in c) return conditionOptions(c.not);
  return [c.option];
}

function constraintOptions(c: Constraint): string[] {
  switch (c.rule) {
    case "ceiling_vs_bag_length":
      return [
        c.lengthOption,
        ...(c.ceilingOption ? [c.ceilingOption] : []),
        ...(c.alternative ? [c.alternative.option] : []),
      ];
    case "stud_wall_backing":
      return [c.wallOption, c.mountOption];
    case "ceiling_mount_engineer":
      return [c.mountOption];
    case "ring_room_clearance":
      return [
        c.sizeOption,
        c.apronOption,
        ...(c.roomLengthOption ? [c.roomLengthOption] : []),
        ...(c.roomWidthOption ? [c.roomWidthOption] : []),
        ...(c.alternative ? [c.alternative.option] : []),
      ];
    case "competition_corner_lock":
      return [c.purposeOption, c.cornerOption];
    case "low_res_logo":
      return [];
    case "opening_date_lead_time":
      return c.openingDateOption ? [c.openingDateOption] : [];
    case "export_unfilled_default":
      return [c.fillOption];
  }
}

export const ProductConfigurationSchema = z
  .object({
    format: z.literal(SCHEMA_FORMAT_VERSION),
    id: IdSchema,
    version: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/, { message: "version must be semver MAJOR.MINOR.PATCH" }),
    productType: z.enum(PRODUCT_TYPES),
    label: LabelSchema,
    /** True while options/dimensions are unconfirmed by Jesse (spec 01 header). */
    placeholder: z.boolean(),
    paymentMode: PaymentModeSchema,
    /** Factory lead time in days; null = unknown (TODO(business): factory capacity table). */
    leadTimeDays: z.number().int().positive().nullable(),
    steps: z.array(StepSchema).min(1),
    constraints: z.array(ConstraintSchema),
    pricing: PricingSchema,
  })
  .strict()
  .superRefine((schema, ctx) => {
    const options = new Map<string, OptionDef>();
    for (const step of schema.steps) {
      for (const opt of step.options) {
        if (options.has(opt.id))
          ctx.addIssue({
            code: "custom",
            path: ["steps"],
            message: `duplicate option id "${opt.id}"`,
          });
        options.set(opt.id, opt);
        if (opt.kind === "choice" || opt.kind === "multi_choice") {
          const values = new Set<string>();
          for (const ch of opt.choices) {
            if (values.has(ch.value))
              ctx.addIssue({
                code: "custom",
                path: ["steps"],
                message: `duplicate choice "${ch.value}" in "${opt.id}"`,
              });
            values.add(ch.value);
          }
          if (opt.kind === "choice" && opt.default !== undefined && !values.has(opt.default)) {
            ctx.addIssue({
              code: "custom",
              path: ["steps"],
              message: `default "${opt.default}" is not a choice of "${opt.id}"`,
            });
          }
        }
        if (opt.kind === "number" && opt.min > opt.max) {
          ctx.addIssue({ code: "custom", path: ["steps"], message: `min > max on "${opt.id}"` });
        }
      }
    }
    const refs: { where: string; option: string }[] = [];
    for (const step of schema.steps) {
      for (const opt of step.options) {
        if (opt.visibleWhen)
          conditionOptions(opt.visibleWhen).forEach((o) =>
            refs.push({ where: `visibleWhen of ${opt.id}`, option: o }),
          );
        if (opt.kind === "choice" || opt.kind === "multi_choice") {
          for (const ch of opt.choices) {
            if (ch.availableWhen)
              conditionOptions(ch.availableWhen).forEach((o) =>
                refs.push({ where: `availableWhen of ${opt.id}.${ch.value}`, option: o }),
              );
          }
        }
      }
    }
    schema.constraints.forEach((c) =>
      constraintOptions(c).forEach((o) => refs.push({ where: `constraint ${c.rule}`, option: o })),
    );
    templateVariables(schema.pricing.base.priceKey).forEach((o) =>
      refs.push({ where: "pricing.base", option: o }),
    );
    for (const m of schema.pricing.modifiers) {
      templateVariables(m.priceKey).forEach((o) =>
        refs.push({ where: `modifier ${m.id}`, option: o }),
      );
      if (m.when)
        conditionOptions(m.when).forEach((o) =>
          refs.push({ where: `modifier ${m.id}`, option: o }),
        );
      if (m.multiplyBy) {
        const target = options.get(m.multiplyBy);
        if (target && !(target.kind === "number" && target.integer)) {
          ctx.addIssue({
            code: "custom",
            path: ["pricing"],
            message: `multiplyBy "${m.multiplyBy}" must be an integer number option`,
          });
        }
        refs.push({ where: `modifier ${m.id}`, option: m.multiplyBy });
      }
    }
    if (schema.pricing.quantity) {
      const q = options.get(schema.pricing.quantity.option);
      if (q && !(q.kind === "number" && q.integer)) {
        ctx.addIssue({
          code: "custom",
          path: ["pricing", "quantity"],
          message: "quantity option must be an integer number option",
        });
      }
      refs.push({ where: "pricing.quantity", option: schema.pricing.quantity.option });
      const mins = schema.pricing.quantity.tiers.map((t) => t.minQty);
      if (mins[0] !== 1 || mins.some((m, i) => i > 0 && m <= (mins[i - 1] ?? 0))) {
        ctx.addIssue({
          code: "custom",
          path: ["pricing", "quantity"],
          message: "tiers must start at minQty 1 and be strictly ascending",
        });
      }
    }
    for (const r of refs) {
      if (!options.has(r.option))
        ctx.addIssue({
          code: "custom",
          path: [],
          message: `${r.where} references unknown option "${r.option}"`,
        });
    }
  });

export type ProductConfiguration = z.infer<typeof ProductConfigurationSchema>;

/** Parse and validate a schema document (e.g. from Payload `configSchemas`). */
export const parseProductConfiguration = (input: unknown) =>
  ProductConfigurationSchema.safeParse(input);

/** Flatten all options in step order. */
export const allOptions = (schema: ProductConfiguration): OptionDef[] =>
  schema.steps.flatMap((s) => s.options);
