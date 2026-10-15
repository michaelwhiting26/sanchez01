import { track } from "@vercel/analytics";

/**
 * The buying-path events (owner, 15 Oct 2026: "where they are on their journey… where they're engaged, where they're dropping off").
 * Sent to Vercel Web Analytics: cookieless, no personal data, so no consent banner is needed for these. Anything that identifies a
 * person (session replay, ad pixels, cross-visit journeys) waits for a consent banner and the privacy policy (business TODO).
 */
export type FunnelEvent =
  | "hero_get_yours_made"
  | "hero_tell_jesse"
  | "card_order_this"
  | "card_this_different"
  | "card_design_3d"
  | "card_gym"
  | "how_start_order"
  | "craft_get_yours_made"
  | "craft_see_workshop"
  | "story_get_yours_made"
  | "close_get_yours_made"
  | "sticky_get_yours_made"
  | "sticky_quote"
  | "header_quote"
  | "quote_form_start"
  | "quote_sent"
  | "quote_fallback"
  | "quote_copy"
  | "quote_instagram";

export function trackEvent(name: FunnelEvent, props?: Record<string, string>): void {
  try {
    track(name, props);
  } catch {
    // analytics must never break the page
  }
}
