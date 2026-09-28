/**
 * Consent model (spec 04 §11.2): nothing loads before consent where it is required; Consent Mode v2.
 * TODO(business/legal): the regional policy (opt-in for EU/UK/UAE, AU recommended) — until decided
 * every region starts `pending`, i.e. opt-in everywhere (the safe default).
 */
export const CONSENT_CATEGORIES = ["analytics", "marketing"] as const;
export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];
export type ConsentStatus = "granted" | "denied" | "pending";
export type ConsentState = Readonly<Record<ConsentCategory, ConsentStatus>>;

export const INITIAL_CONSENT: ConsentState = { analytics: "pending", marketing: "pending" };

export type ConsentModeValue = "granted" | "denied";
export interface ConsentModeV2 {
  readonly analytics_storage: ConsentModeValue;
  readonly ad_storage: ConsentModeValue;
  readonly ad_user_data: ConsentModeValue;
  readonly ad_personalization: ConsentModeValue;
}

/** Google Consent Mode v2 signals. Anything not explicitly granted is denied. */
export function toConsentModeV2(state: ConsentState): ConsentModeV2 {
  const a: ConsentModeValue = state.analytics === "granted" ? "granted" : "denied";
  const m: ConsentModeValue = state.marketing === "granted" ? "granted" : "denied";
  return { analytics_storage: a, ad_storage: m, ad_user_data: m, ad_personalization: m };
}
