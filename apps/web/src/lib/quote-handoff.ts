import type { QuoteProduct } from "./quote";

/**
 * A design on its way from a 3D builder to the quote form (/contact). It waits in the tab's session storage, never in the address, and is
 * cleared once the request is sent. An uploaded logo is not part of it: the file stays on the visitor's device, only its name is listed.
 */
export interface DesignHandoff {
  readonly product: QuoteProduct;
  readonly details: string;
}

const KEY = "sz.quote.design";
const DETAILS_MAX = 3600; // leaves room under the form's 4,000 for the visitor's own words

const PRODUCT_BY_SLUG: Readonly<Record<string, QuoteProduct>> = { gloves: "gloves", "heavy-bag": "heavy-bag", "head-guard": "head-guard", "groin-guard": "groin-guard", "focus-mitts": "focus-mitts" };
export const quoteProductFor = (slug: string): QuoteProduct => PRODUCT_BY_SLUG[slug] ?? "other";

/** The words that go into "What do you want made?": a heading line, then the design, one choice a line. */
export function designDetails(title: string, spec: string): string {
  return `${title}, designed in the 3D builder:\n${spec}`.slice(0, DETAILS_MAX);
}

export function stashDesign(design: DesignHandoff): boolean {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(design));
    return true;
  } catch {
    return false; // storage can be blocked: the builder says so and keeps "Copy spec"
  }
}

export function readDesign(): DesignHandoff | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v === null) return null;
    const { product, details } = v as Record<string, unknown>;
    return typeof product === "string" && typeof details === "string" ? { product: product as QuoteProduct, details } : null;
  } catch {
    return null;
  }
}

export function clearDesign(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
