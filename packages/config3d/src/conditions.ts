import type { Condition, Scalar } from "./schema";
import type { SelectionValue } from "./selection";

export type Values = Readonly<Record<string, SelectionValue | undefined>>;

export function isPresent(v: SelectionValue | undefined): boolean {
  if (v === undefined) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

const scalarEq = (v: SelectionValue | undefined, s: Scalar): boolean =>
  !Array.isArray(v) && v === s;

export function evaluateCondition(c: Condition, values: Values): boolean {
  if ("all" in c) return c.all.every((x) => evaluateCondition(x, values));
  if ("any" in c) return c.any.some((x) => evaluateCondition(x, values));
  if ("not" in c) return !evaluateCondition(c.not, values);
  const v = values[c.option];
  if ("eq" in c) return scalarEq(v, c.eq);
  if ("in" in c) return c.in.some((s) => scalarEq(v, s));
  if ("includes" in c) return Array.isArray(v) && v.includes(c.includes);
  return isPresent(v) === c.present;
}
