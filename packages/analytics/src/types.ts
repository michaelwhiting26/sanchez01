import type { ConsentCategory } from "./consent";
import type { EventName, EventProps } from "./events";

declare const sha256Brand: unique symbol;
/** Lowercase hex SHA-256. Only obtainable via hashEmail/hashPhone in ./server. */
export type Sha256Hex = string & { readonly [sha256Brand]: true };

/** Hashed identifiers for ad-platform matching (Meta CAPI, Google enhanced conversions). */
export interface HashedUserData {
  readonly em?: Sha256Hex;
  readonly ph?: Sha256Hex;
}

export interface TrackedEvent<E extends EventName> {
  readonly name: E;
  readonly props: EventProps<E>;
  /** Shared across client/server sends for ad-platform deduplication. */
  readonly eventId: string;
  readonly timestamp: string;
  readonly channel: "client" | "server";
  readonly conversion: boolean;
  /** Server conversion events only; never part of props. */
  readonly user?: HashedUserData;
}

export type AnyTrackedEvent = { [E in EventName]: TrackedEvent<E> }[EventName];

export type Transport = (event: AnyTrackedEvent) => void | Promise<void>;

export interface AnalyticsAdapter {
  readonly id: string;
  /** Consent category that must be granted before this adapter receives anything. */
  readonly category: ConsentCategory;
  readonly accepts: (event: AnyTrackedEvent) => boolean;
  readonly send: (event: AnyTrackedEvent) => void | Promise<void>;
}

export type TrackOutcome =
  | {
      readonly status: "rejected";
      readonly reason: "unknown_event" | "invalid_props" | "pii_detected" | "wrong_channel";
      readonly details: readonly string[];
    }
  | {
      readonly status: "accepted";
      readonly eventId: string;
      readonly delivered: readonly string[];
      readonly queued: readonly string[];
      readonly dropped: readonly string[];
    };
