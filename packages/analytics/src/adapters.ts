/**
 * Vendor adapters. Each is a no-op until a real `transport` is wired in apps/web (PostHog SDK,
 * gtag / GA4 Measurement Protocol, Meta Conversions API, Google Ads enhanced conversions).
 * Keeping vendors behind this interface means no third-party code loads before consent.
 */
import type { ConsentCategory } from "./consent";
import type { AnalyticsAdapter, AnyTrackedEvent, Transport } from "./types";

export interface VendorAdapterOptions {
  readonly transport?: Transport;
}

const make = (
  id: string,
  category: ConsentCategory,
  accepts: (e: AnyTrackedEvent) => boolean,
  transport?: Transport,
): AnalyticsAdapter => ({
  id,
  category,
  accepts,
  send: (e) => transport?.(e),
});

const isServerConversion = (e: AnyTrackedEvent): boolean => e.channel === "server" && e.conversion;

/** PostHog (client + server SDKs): all events, analytics consent. */
export const createPostHogAdapter = (o: VendorAdapterOptions = {}): AnalyticsAdapter =>
  make("posthog", "analytics", () => true, o.transport);

/** GA4 (gtag client-side, Measurement Protocol server-side): all events, analytics consent. */
export const createGa4Adapter = (o: VendorAdapterOptions = {}): AnalyticsAdapter =>
  make("ga4", "analytics", () => true, o.transport);

/** Meta Conversions API: server-side conversion events only, marketing consent. */
export const createMetaCapiAdapter = (o: VendorAdapterOptions = {}): AnalyticsAdapter =>
  make("meta_capi", "marketing", isServerConversion, o.transport);

/** Google Ads enhanced conversions: server-side conversion events only, marketing consent. */
export const createGoogleAdsAdapter = (o: VendorAdapterOptions = {}): AnalyticsAdapter =>
  make("google_ads", "marketing", isServerConversion, o.transport);

/** Development adapter: logs every event it is allowed to see. */
export function createConsoleAdapter(
  o: {
    readonly category?: ConsentCategory;
    readonly log?: (message: string, event: AnyTrackedEvent) => void;
  } = {},
): AnalyticsAdapter {
  const log = o.log ?? ((message: string, event: AnyTrackedEvent) => console.info(message, event));
  return {
    id: "console",
    category: o.category ?? "analytics",
    accepts: () => true,
    send: (e) => log(`[analytics] ${e.name}`, e),
  };
}
