/**
 * First- and last-touch attribution (spec 04 §11.2: every order stores first and last touch).
 *
 * Privacy: only the landing *path* and the referrer *origin + path* are kept; query strings are
 * discarded (they can carry emails or tokens). Values are trimmed, length-capped and charset-checked.
 *
 * Last-touch rule: a touch only replaces lastTouch when it carries a campaign signal (UTM, click ID,
 * ambassador code, or an external referrer). Direct visits never overwrite a paid/partner touch.
 */
import { z } from "zod";

const MAX_VALUE = 200;
const MAX_CLICK_ID = 512;

/** TODO(business): confirm the query parameter(s) ambassadors' links will use. */
export const DEFAULT_AMBASSADOR_PARAMS = ["amb", "ambassador", "ref"] as const;

const NullableShort = z.string().max(MAX_VALUE).nullable();

export const UtmSchema = z
  .object({
    source: NullableShort,
    medium: NullableShort,
    campaign: NullableShort,
    term: NullableShort,
    content: NullableShort,
  })
  .strict();
export type Utm = z.infer<typeof UtmSchema>;

export const TouchSchema = z
  .object({
    at: z.iso.datetime(),
    landingPath: z.string().max(2048),
    referrer: z.string().max(2048).nullable(),
    utm: UtmSchema,
    gclid: z.string().max(MAX_CLICK_ID).nullable(),
    fbclid: z.string().max(MAX_CLICK_ID).nullable(),
    ambassadorCode: z
      .string()
      .regex(/^[A-Z0-9_-]{2,32}$/)
      .nullable(),
  })
  .strict();
export type Touch = z.infer<typeof TouchSchema>;

export const AttributionSchema = z
  .object({ firstTouch: TouchSchema, lastTouch: TouchSchema })
  .strict();
export type Attribution = z.infer<typeof AttributionSchema>;

export const ParseTouchInputSchema = z
  .object({
    url: z.string().min(1).max(8192),
    referrer: z.string().max(8192).nullable().optional(),
    at: z.date(),
  })
  .strict();
export type ParseTouchInput = z.infer<typeof ParseTouchInputSchema>;

export interface ParseTouchOptions {
  readonly ambassadorParams?: readonly string[];
  /** Our own hostname, used to discard self-referrals when `url` is a bare path. */
  readonly siteHostname?: string;
}

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

function cleanValue(raw: string | null, lower = false): string | null {
  if (raw === null) return null;
  const v = raw.replace(CONTROL_CHARS, "").trim().slice(0, MAX_VALUE);
  if (v === "") return null;
  return lower ? v.toLowerCase() : v;
}

function cleanClickId(raw: string | null): string | null {
  if (raw === null) return null;
  const v = raw.trim();
  return v.length > 0 && v.length <= MAX_CLICK_ID && /^[A-Za-z0-9_.-]+$/.test(v) ? v : null;
}

export function normaliseAmbassadorCode(raw: string | null): string | null {
  if (raw === null) return null;
  const v = raw.trim().toUpperCase();
  return /^[A-Z0-9_-]{2,32}$/.test(v) ? v : null;
}

function safeUrl(raw: string, base?: string): URL | null {
  try {
    return base === undefined ? new URL(raw) : new URL(raw, base);
  } catch {
    return null;
  }
}

/**
 * Parse one visit into a Touch. `url` may be absolute or a path (resolved against a dummy origin).
 * Never throws: malformed input yields an empty touch.
 */
export function parseTouch(input: ParseTouchInput, options: ParseTouchOptions = {}): Touch {
  const url = safeUrl(input.url, "https://placeholder.invalid");
  const params = url?.searchParams ?? new URLSearchParams();
  const get = (k: string): string | null => params.get(k);

  let referrer: string | null = null;
  if (input.referrer) {
    const ref = safeUrl(input.referrer);
    const ownHost =
      url !== null && url.hostname !== "placeholder.invalid" ? url.hostname : options.siteHostname;
    const selfReferral = ref !== null && ownHost !== undefined && ref.hostname === ownHost;
    if (ref && (ref.protocol === "https:" || ref.protocol === "http:") && !selfReferral) {
      referrer = `${ref.origin}${ref.pathname}`.slice(0, 2048);
    }
  }

  let ambassadorCode: string | null = null;
  for (const p of options.ambassadorParams ?? DEFAULT_AMBASSADOR_PARAMS) {
    ambassadorCode = normaliseAmbassadorCode(get(p));
    if (ambassadorCode) break;
  }

  return {
    at: input.at.toISOString(),
    landingPath: (url?.pathname ?? "/").slice(0, 2048),
    referrer,
    utm: {
      source: cleanValue(get("utm_source"), true),
      medium: cleanValue(get("utm_medium"), true),
      campaign: cleanValue(get("utm_campaign")),
      term: cleanValue(get("utm_term")),
      content: cleanValue(get("utm_content")),
    },
    gclid: cleanClickId(get("gclid")),
    fbclid: cleanClickId(get("fbclid")),
    ambassadorCode,
  };
}

/** True when the touch carries anything worth attributing (so it may replace lastTouch). */
export function hasCampaignSignal(t: Touch): boolean {
  return (
    Object.values(t.utm).some((v) => v !== null) ||
    t.gclid !== null ||
    t.fbclid !== null ||
    t.ambassadorCode !== null ||
    t.referrer !== null
  );
}

/** Fold a new touch into existing attribution. First touch is immutable once set. */
export function mergeAttribution(previous: Attribution | null, touch: Touch): Attribution {
  if (previous === null) return { firstTouch: touch, lastTouch: touch };
  return {
    firstTouch: previous.firstTouch,
    lastTouch: hasCampaignSignal(touch) ? touch : previous.lastTouch,
  };
}
