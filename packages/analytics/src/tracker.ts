/**
 * Consent-gated trackers.
 * - Client tracker: only client events (compile-time + runtime). Events for adapters whose consent is
 *   `pending` are queued (or dropped, per policy) and flushed when consent is granted; `denied` drops.
 * - Server tracker: only server events. No queue (a webhook cannot wait): anything not `granted` at
 *   the time of the order is dropped. The consent snapshot must be the one stored with the order.
 */
import {
  EVENT_CHANNEL,
  EVENT_SCHEMAS,
  isConversionEvent,
  type ClientEventName,
  type EventName,
  type EventProps,
  type ServerEventName,
} from "./events";
import { findPii } from "./pii";
import { INITIAL_CONSENT, type ConsentState } from "./consent";
import type { AnalyticsAdapter, AnyTrackedEvent, HashedUserData, TrackOutcome } from "./types";

export type ErrorHandler = (
  error: unknown,
  context: { readonly adapterId: string; readonly event: string },
) => void;

interface CommonOptions {
  readonly adapters: readonly AnalyticsAdapter[];
  readonly onError?: ErrorHandler;
  readonly now?: () => Date;
  readonly newEventId?: () => string;
}

const defaultId = (): string => globalThis.crypto.randomUUID();

type Built =
  | { readonly ok: true; readonly event: AnyTrackedEvent }
  | { readonly ok: false; readonly outcome: TrackOutcome };

function buildEvent(
  name: string,
  props: unknown,
  channel: "client" | "server",
  meta: { readonly eventId: string; readonly at: Date; readonly user?: HashedUserData },
): Built {
  if (!Object.hasOwn(EVENT_SCHEMAS, name))
    return { ok: false, outcome: { status: "rejected", reason: "unknown_event", details: [name] } };
  const eventName = name as EventName; // narrowed by the hasOwn check above
  if (EVENT_CHANNEL[eventName] !== channel) {
    return {
      ok: false,
      outcome: {
        status: "rejected",
        reason: "wrong_channel",
        details: [`${name} is a ${EVENT_CHANNEL[eventName]} event`],
      },
    };
  }
  const pii = findPii(props);
  if (pii.length > 0) {
    return {
      ok: false,
      outcome: {
        status: "rejected",
        reason: "pii_detected",
        details: pii.map((p) => `${p.path}: ${p.reason}`),
      },
    };
  }
  const parsed = EVENT_SCHEMAS[eventName].safeParse(props);
  if (!parsed.success) {
    return {
      ok: false,
      outcome: {
        status: "rejected",
        reason: "invalid_props",
        details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      },
    };
  }
  // The schema for `eventName` produced `parsed.data`, so the pair is consistent; TS cannot correlate
  // the generic key with the union member, hence the single assertion.
  const event = {
    name: eventName,
    props: parsed.data,
    eventId: meta.eventId,
    timestamp: meta.at.toISOString(),
    channel,
    conversion: isConversionEvent(eventName),
    ...(meta.user ? { user: meta.user } : {}),
  } as AnyTrackedEvent;
  return { ok: true, event };
}

function safeSend(
  adapter: AnalyticsAdapter,
  event: AnyTrackedEvent,
  onError?: ErrorHandler,
): Promise<void> {
  try {
    return Promise.resolve(adapter.send(event)).catch((e: unknown) =>
      onError?.(e, { adapterId: adapter.id, event: event.name }),
    );
  } catch (e) {
    onError?.(e, { adapterId: adapter.id, event: event.name });
    return Promise.resolve();
  }
}

export interface ClientTrackerOptions extends CommonOptions {
  readonly consent?: ConsentState;
  /** What to do with events while consent is pending. Default: queue. */
  readonly pendingPolicy?: "queue" | "drop";
  readonly maxQueue?: number;
}

export interface ClientTracker {
  readonly track: <E extends ClientEventName>(name: E, props: EventProps<E>) => TrackOutcome;
  readonly setConsent: (update: Partial<ConsentState>) => void;
  readonly getConsent: () => ConsentState;
  readonly queuedCount: () => number;
}

export function createClientTracker(options: ClientTrackerOptions): ClientTracker {
  let consent: ConsentState = options.consent ?? INITIAL_CONSENT;
  const policy = options.pendingPolicy ?? "queue";
  const maxQueue = options.maxQueue ?? 200;
  const now = options.now ?? (() => new Date());
  const newId = options.newEventId ?? defaultId;
  let queue: { adapter: AnalyticsAdapter; event: AnyTrackedEvent }[] = [];

  return {
    track(name, props) {
      const built = buildEvent(name, props, "client", { eventId: newId(), at: now() });
      if (!built.ok) return built.outcome;
      const delivered: string[] = [];
      const queued: string[] = [];
      const dropped: string[] = [];
      for (const adapter of options.adapters) {
        if (!adapter.accepts(built.event)) continue;
        const status = consent[adapter.category];
        if (status === "granted") {
          void safeSend(adapter, built.event, options.onError);
          delivered.push(adapter.id);
        } else if (status === "pending" && policy === "queue") {
          queue.push({ adapter, event: built.event });
          if (queue.length > maxQueue) queue = queue.slice(queue.length - maxQueue);
          queued.push(adapter.id);
        } else {
          dropped.push(adapter.id);
        }
      }
      return { status: "accepted", eventId: built.event.eventId, delivered, queued, dropped };
    },
    setConsent(update) {
      consent = { ...consent, ...update };
      const keep: typeof queue = [];
      for (const entry of queue) {
        const status = consent[entry.adapter.category];
        if (status === "granted") void safeSend(entry.adapter, entry.event, options.onError);
        else if (status === "pending") keep.push(entry);
        // denied: dropped
      }
      queue = keep;
    },
    getConsent: () => consent,
    queuedCount: () => queue.length,
  };
}

export interface ServerTrackOptions {
  /** The consent state recorded with the order/session. */
  readonly consent: ConsentState;
  /** Reuse the client event id for deduplication when there is one. */
  readonly eventId?: string;
  readonly user?: HashedUserData;
}

export interface ServerTracker {
  readonly track: <E extends ServerEventName>(
    name: E,
    props: EventProps<E>,
    opts: ServerTrackOptions,
  ) => Promise<TrackOutcome>;
}

export function createServerTracker(options: CommonOptions): ServerTracker {
  const now = options.now ?? (() => new Date());
  const newId = options.newEventId ?? defaultId;
  return {
    async track(name, props, opts) {
      const built = buildEvent(name, props, "server", {
        eventId: opts.eventId ?? newId(),
        at: now(),
        ...(opts.user ? { user: opts.user } : {}),
      });
      if (!built.ok) return built.outcome;
      const delivered: string[] = [];
      const dropped: string[] = [];
      const sends: Promise<void>[] = [];
      for (const adapter of options.adapters) {
        if (!adapter.accepts(built.event)) continue;
        if (opts.consent[adapter.category] === "granted") {
          sends.push(safeSend(adapter, built.event, options.onError));
          delivered.push(adapter.id);
        } else {
          dropped.push(adapter.id);
        }
      }
      await Promise.all(sends);
      return { status: "accepted", eventId: built.event.eventId, delivered, queued: [], dropped };
    },
  };
}
