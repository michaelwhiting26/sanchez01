/**
 * Factory spec-sheet data (spec 01 §7.2). Bilingual Thai + English. This builds DATA only; the
 * server-side PDF renderer comes later. Thai strings are never machine-invented: a missing `th`
 * label is reported in `translationGaps` so the factory can supply it.
 */
import type { Label, ProductConfiguration } from "./schema";
import type { NormalizedSelection, SelectionValue } from "./selection";
import type { AutoLineItem } from "./issues";

export interface BiText {
  readonly en: string;
  /** null = Thai translation still needed (PLACEHOLDER). */
  readonly th: string | null;
}

export interface SpecSheetRow {
  readonly optionId: string;
  readonly label: BiText;
  readonly value: SelectionValue;
  readonly display: BiText;
}

export interface SpecSheetSection {
  readonly stepId: string;
  readonly title: BiText;
  readonly rows: readonly SpecSheetRow[];
}

/** QC stages from spec 01 §7.2; each has a photo slot feeding the "watch it being made" tracker. */
export const QC_STAGES = ["cut", "sew", "print", "fill", "pack"] as const;
export type QcStage = (typeof QC_STAGES)[number];

export interface FactorySpecSheet {
  readonly format: 1;
  readonly orderId: string;
  readonly itemId: string;
  /** Assigned at QC (spec 04 §7.3); null before that. */
  readonly serial: string | null;
  readonly quantity: number;
  readonly productType: ProductConfiguration["productType"];
  readonly product: BiText;
  readonly schemaId: string;
  readonly schemaVersion: string;
  readonly placeholder: boolean;
  readonly sections: readonly SpecSheetSection[];
  readonly lineItems: readonly { readonly id: string; readonly label: BiText }[];
  readonly qc: readonly {
    readonly stage: QcStage;
    readonly label: BiText;
    readonly photoSlot: true;
  }[];
  /** Option/choice ids whose Thai label is missing. Non-empty ⇒ not yet factory-ready. */
  readonly translationGaps: readonly string[];
}

export interface BuildSpecSheetInput {
  readonly orderId: string;
  readonly itemId: string;
  readonly serial?: string | null;
  readonly schema: ProductConfiguration;
  readonly selection: NormalizedSelection;
  readonly lineItems?: readonly AutoLineItem[];
}

export class SpecSheetSchemaMismatchError extends Error {
  override readonly name = "SpecSheetSchemaMismatchError";
}

const QC_LABELS: Record<QcStage, string> = {
  cut: "Cut",
  sew: "Sew",
  print: "Print",
  fill: "Fill",
  pack: "Pack",
};

export function buildFactorySpecSheet(input: BuildSpecSheetInput): FactorySpecSheet {
  const { schema, selection } = input;
  if (selection.schemaId !== schema.id || selection.schemaVersion !== schema.version) {
    throw new SpecSheetSchemaMismatchError(
      `Selection was validated against ${selection.schemaId}@${selection.schemaVersion}, not ${schema.id}@${schema.version}`,
    );
  }
  const gaps: string[] = [];
  const bi = (label: Label, key: string): BiText => {
    if (label.th === undefined) gaps.push(key);
    return { en: label.en, th: label.th ?? null };
  };
  const literal = (s: string): BiText => ({ en: s, th: s });

  const sections: SpecSheetSection[] = [];
  for (const step of schema.steps) {
    const rows: SpecSheetRow[] = [];
    for (const opt of step.options) {
      const value = selection.values[opt.id];
      if (value === undefined || (Array.isArray(value) && value.length === 0)) continue;
      let display: BiText;
      switch (opt.kind) {
        case "choice": {
          const c = opt.choices.find((x) => x.value === value);
          display = c ? bi(c.label, `${opt.id}.${c.value}`) : literal(String(value));
          break;
        }
        case "multi_choice": {
          const labels = (Array.isArray(value) ? value : []).map((v) => {
            const c = opt.choices.find((x) => x.value === v);
            return c ? bi(c.label, `${opt.id}.${c.value}`) : literal(v);
          });
          display = {
            en: labels.map((l) => l.en).join(", "),
            th: labels.every((l) => l.th !== null) ? labels.map((l) => l.th).join(", ") : null,
          };
          break;
        }
        case "boolean":
          display = value === true ? { en: "Yes", th: null } : { en: "No", th: null };
          if (!gaps.includes("boolean.yes_no")) gaps.push("boolean.yes_no");
          break;
        case "number":
          display = literal(`${String(value)} ${opt.unit}`);
          break;
        case "colour":
        case "colour_list":
          // TODO(business): Pantone + internal swatch codes per colour (spec 01 §7.2) need the colour library.
          display = literal(Array.isArray(value) ? value.join(" / ") : String(value));
          break;
        case "text":
        case "date":
          display = literal(String(value));
          break;
      }
      rows.push({ optionId: opt.id, label: bi(opt.label, opt.id), value, display });
    }
    if (rows.length > 0)
      sections.push({ stepId: step.id, title: bi(step.label, `step.${step.id}`), rows });
  }

  const qtyOption = schema.pricing.quantity?.option;
  const qtyValue = qtyOption !== undefined ? selection.values[qtyOption] : undefined;

  return {
    format: 1,
    orderId: input.orderId,
    itemId: input.itemId,
    serial: input.serial ?? null,
    quantity: typeof qtyValue === "number" ? qtyValue : 1,
    productType: schema.productType,
    product: bi(schema.label, "product"),
    schemaId: schema.id,
    schemaVersion: schema.version,
    placeholder: schema.placeholder,
    sections,
    lineItems: (input.lineItems ?? []).map((li) => ({
      id: li.id,
      label: bi(li.label, `line_item.${li.id}`),
    })),
    // TODO(business): Thai QC stage names to be supplied by the factory.
    qc: QC_STAGES.map((stage) => ({
      stage,
      label: { en: QC_LABELS[stage], th: null },
      photoSlot: true as const,
    })),
    translationGaps: [...new Set([...gaps, ...QC_STAGES.map((s) => `qc.${s}`)])].sort(),
  };
}
