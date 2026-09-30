/** Money is integer minor units, in a named currency. No floats, no live FX. */
export const CURRENCIES = ["AUD", "AED", "SGD", "GBP", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const isCurrency = (v: unknown): v is Currency => typeof v === "string" && (CURRENCIES as readonly string[]).includes(v);

export function formatMoney(minor: number, currency: Currency): string {
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(minor / 100);
}

export type RoundingMode = "half-even" | "half-up";

/** The deposit for a total: `percent` of it, rounded to whole minor units in the chosen mode, never below 0 or above the total. Pure. */
export function depositMinor(totalMinor: number, percent: number, mode: RoundingMode = "half-even"): number {
  if (!Number.isInteger(totalMinor) || totalMinor < 0) throw new Error("depositMinor: total must be a non-negative integer");
  if (!(percent > 0 && percent <= 100)) throw new Error("depositMinor: percent must be in (0, 100]");
  const exact = (totalMinor * percent) / 100;
  const floor = Math.floor(exact);
  const rem = exact - floor;
  let out: number;
  if (Math.abs(rem - 0.5) < 1e-9) out = mode === "half-even" ? (floor % 2 === 0 ? floor : floor + 1) : floor + 1;
  else out = rem > 0.5 ? floor + 1 : floor;
  return Math.min(totalMinor, Math.max(0, out));
}
