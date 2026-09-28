/**
 * Server-authoritative pricing (spec 01 §6). The server calls computePrice on the raw, untrusted
 * selection; any client-side figure is a preview of this same function and is never trusted.
 *
 *   unit lines   = base + Σ unit modifiers            (× multiplyBy where set)
 *   goods        = Σ unit lines × quantity
 *   discount     = goods × tier discount (bps, explicit rounding)
 *   line items   = Σ line modifiers + rule-forced line items (engineer sign-off, backing plate…)
 *   subtotal     = goods − discount + line items      (always ≥ 0: prices are non-negative, discount ≤ 100%)
 *
 * Freight, duty/VAT and install-by-location are NOT computed here (TODO: rate tables, spec 04 §7.2).
 */
import {
  addMoney,
  basisPointsOf,
  err,
  getPrice,
  multiplyMoney,
  negateMoney,
  ok,
  subtractMoney,
  sumMoney,
  zeroMoney,
  type Currency,
  type Money,
  type PaymentMode,
  type PriceBook,
  type PriceLookupError,
  type Result,
} from "@sanchez/domain";
import { templateVariables, allOptions, type Label, type ProductConfiguration } from "./schema";
import type { SelectionValue } from "./selection";
import { evaluateCondition } from "./conditions";
import type { AutoLineItem, Issue } from "./issues";
import { validateSelection } from "./validate";

export interface PriceLine {
  readonly id: string;
  readonly label: Label;
  readonly kind: "base" | "modifier" | "discount" | "line_item";
  readonly priceKey: string | null;
  readonly unitAmount: Money;
  readonly quantity: number;
  readonly total: Money;
}

export type PriceDisplay =
  | { readonly kind: "exact"; readonly amount: Money }
  | { readonly kind: "range"; readonly low: Money; readonly high: Money };

export interface PriceQuote {
  readonly schemaId: string;
  readonly schemaVersion: string;
  readonly priceBookId: string;
  readonly currency: Currency;
  readonly paymentMode: PaymentMode;
  /** True if the price book or product schema is placeholder data. UIs MUST label it. */
  readonly placeholder: boolean;
  readonly quantity: number;
  readonly lines: readonly PriceLine[];
  /** Canonical amount. The display range is derived from it. */
  readonly subtotal: Money;
  readonly display: PriceDisplay;
  readonly lineItems: readonly AutoLineItem[];
  readonly issues: readonly Issue[];
}

export type PriceError =
  | { readonly type: "invalid_selection"; readonly issues: readonly Issue[] }
  | { readonly type: "price_lookup"; readonly error: PriceLookupError };

export interface ComputePriceOptions {
  readonly context?: unknown;
  /** Once the spec is locked (or for pay-in-full products) the exact amount is displayed. */
  readonly specLocked?: boolean;
}

const scalarToKeyPart = (v: SelectionValue | undefined): string[] => {
  if (v === undefined) return ["none"];
  if (Array.isArray(v)) return [...v].sort();
  return [String(v)];
};

/** Expand `{option}` placeholders. Multi-value options fan out into several keys (sorted, deterministic). */
export function expandPriceKey(
  template: string,
  values: Readonly<Record<string, SelectionValue>>,
): string[] {
  const vars = [...new Set(templateVariables(template))];
  let keys = [template];
  for (const name of vars) {
    const parts = scalarToKeyPart(values[name]);
    keys = keys.flatMap((k) => parts.map((p) => k.split(`{${name}}`).join(p)));
  }
  return keys;
}

export function computePrice(
  schema: ProductConfiguration,
  selection: unknown,
  priceBook: PriceBook,
  currency: Currency,
  options: ComputePriceOptions = {},
): Result<PriceQuote, PriceError> {
  const validation = validateSelection(schema, selection, options.context ?? {});
  if (!validation.ok) return err({ type: "invalid_selection", issues: validation.issues });
  const values = validation.selection.values;
  const { pricing } = schema;

  const lookup = (key: string): Result<Money, PriceError> => {
    const r = getPrice(priceBook, key, currency);
    return r.ok ? r : err({ type: "price_lookup", error: r.error });
  };

  const qtyValue = pricing.quantity ? values[pricing.quantity.option] : 1;
  const quantity = typeof qtyValue === "number" ? qtyValue : 1;

  const multiplierFor = (optionId: string | undefined): number => {
    if (optionId === undefined) return 1;
    const v = values[optionId];
    return typeof v === "number" ? v : 0;
  };

  const unitLines: PriceLine[] = [];
  const lineLines: PriceLine[] = [];

  for (const key of expandPriceKey(pricing.base.priceKey, values)) {
    const p = lookup(key);
    if (!p.ok) return p;
    unitLines.push({
      id: "base",
      label: pricing.base.label,
      kind: "base",
      priceKey: key,
      unitAmount: p.value,
      quantity,
      total: multiplyMoney(p.value, quantity),
    });
  }

  for (const m of pricing.modifiers) {
    if (m.when && !evaluateCondition(m.when, values)) continue;
    const multiplier = multiplierFor(m.multiplyBy);
    if (multiplier === 0) continue;
    for (const key of expandPriceKey(m.priceKey, values)) {
      const p = lookup(key);
      if (!p.ok) return p;
      if (m.scope === "unit") {
        const unitAmount = multiplyMoney(p.value, multiplier);
        unitLines.push({
          id: m.id,
          label: m.label,
          kind: "modifier",
          priceKey: key,
          unitAmount,
          quantity,
          total: multiplyMoney(unitAmount, quantity),
        });
      } else {
        lineLines.push({
          id: m.id,
          label: m.label,
          kind: "modifier",
          priceKey: key,
          unitAmount: p.value,
          quantity: multiplier,
          total: multiplyMoney(p.value, multiplier),
        });
      }
    }
  }

  const goods = sumMoney(
    unitLines.map((l) => l.total),
    currency,
  );
  const discountLines: PriceLine[] = [];
  if (pricing.quantity) {
    const tier = [...pricing.quantity.tiers].reverse().find((t) => quantity >= t.minQty);
    if (tier && tier.discountBps > 0) {
      const discount = basisPointsOf(goods, tier.discountBps, pricing.rounding);
      discountLines.push({
        id: "quantity_discount",
        label: { en: `Quantity discount (${tier.minQty}+)` },
        kind: "discount",
        priceKey: null,
        unitAmount: negateMoney(discount),
        quantity: 1,
        total: negateMoney(discount),
      });
    }
  }

  const itemLines: PriceLine[] = [];
  for (const li of validation.lineItems) {
    const p = lookup(li.priceKey);
    if (!p.ok) return p;
    itemLines.push({
      id: li.id,
      label: li.label,
      kind: "line_item",
      priceKey: li.priceKey,
      unitAmount: p.value,
      quantity: 1,
      total: p.value,
    });
  }

  const lines = [...unitLines, ...discountLines, ...lineLines, ...itemLines];
  const subtotal = lines.reduce((acc, l) => addMoney(acc, l.total), zeroMoney(currency));

  let display: PriceDisplay;
  if (schema.paymentMode === "full" || options.specLocked === true || pricing.rangeBps === 0) {
    display = { kind: "exact", amount: subtotal };
  } else {
    const delta = basisPointsOf(subtotal, pricing.rangeBps, pricing.rounding);
    display = {
      kind: "range",
      low: subtractMoney(subtotal, delta),
      high: addMoney(subtotal, delta),
    };
  }

  return ok({
    schemaId: schema.id,
    schemaVersion: schema.version,
    priceBookId: priceBook.id,
    currency,
    paymentMode: schema.paymentMode,
    placeholder: priceBook.placeholder || schema.placeholder,
    quantity,
    lines,
    subtotal,
    display,
    lineItems: validation.lineItems,
    issues: validation.issues,
  });
}

/**
 * Every price key the schema could ask for (a superset: it ignores availableWhen/visibleWhen
 * combinations). Used to check price-book coverage in tests and in the admin.
 */
export function requiredPriceKeys(schema: ProductConfiguration): string[] {
  const byId = new Map(allOptions(schema).map((o) => [o.id, o]));
  const domainOf = (id: string): string[] => {
    const o = byId.get(id);
    if (!o) return ["none"];
    const optional = !o.required || o.visibleWhen !== undefined;
    switch (o.kind) {
      case "choice":
        return [...o.choices.map((c) => c.value), ...(optional ? ["none"] : [])];
      case "multi_choice":
        return o.choices.map((c) => c.value);
      case "boolean":
        return ["true", "false", ...(optional ? ["none"] : [])];
      case "number":
      case "colour":
      case "colour_list":
      case "text":
      case "date":
        return ["{unenumerable}"];
    }
  };
  const expandAll = (template: string): string[] => {
    let keys = [template];
    for (const name of new Set(templateVariables(template))) {
      const parts = domainOf(name);
      keys = keys.flatMap((k) => parts.map((p) => k.split(`{${name}}`).join(p)));
    }
    return keys;
  };
  const keys = new Set<string>();
  expandAll(schema.pricing.base.priceKey).forEach((k) => keys.add(k));
  schema.pricing.modifiers.forEach((m) => expandAll(m.priceKey).forEach((k) => keys.add(k)));
  for (const c of schema.constraints) {
    if (c.rule === "stud_wall_backing" || c.rule === "ceiling_mount_engineer")
      keys.add(c.lineItem.priceKey);
    if (c.rule === "low_res_logo" && c.offer) keys.add(c.offer.priceKey);
    if (c.rule === "opening_date_lead_time") c.offers.forEach((o) => keys.add(o.priceKey));
  }
  return [...keys].sort();
}
