import { describe, expect, it, vi } from "vitest";
import {
  CATALOGUE_IS_PII_FREE,
  createClientTracker,
  createConsoleAdapter,
  createGa4Adapter,
  createGoogleAdsAdapter,
  createMetaCapiAdapter,
  createPostHogAdapter,
  createServerTracker,
  EVENT_CHANNEL,
  EVENT_NAMES,
  findPii,
  toConsentModeV2,
  type AnyTrackedEvent,
} from "./index";
import { hashEmail, hashPhone } from "./server";

const at = new Date("2026-09-28T10:00:00.000Z");
let n = 0;
const ids = () => `evt-${++n}`;

function recordingAdapters() {
  const seen: Record<string, AnyTrackedEvent[]> = {
    posthog: [],
    ga4: [],
    meta_capi: [],
    google_ads: [],
  };
  const rec = (id: string) => (e: AnyTrackedEvent) => void seen[id]!.push(e);
  return {
    seen,
    adapters: [
      createPostHogAdapter({ transport: rec("posthog") }),
      createGa4Adapter({ transport: rec("ga4") }),
      createMetaCapiAdapter({ transport: rec("meta_capi") }),
      createGoogleAdsAdapter({ transport: rec("google_ads") }),
    ],
  };
}

const configStarted = { product_type: "bag", entry_point: "home_hero" } as const;

describe("event catalogue", () => {
  it("has exactly the 16 events from spec 04 §11.1", () => {
    expect(EVENT_NAMES.sort()).toEqual(
      [
        "page_viewed",
        "story_station_viewed",
        "video_progress",
        "config_started",
        "config_option_changed",
        "config_logo_uploaded",
        "config_step_completed",
        "config_abandoned",
        "config_shared",
        "price_viewed",
        "gym_builder_item_added",
        "quote_submitted",
        "checkout_started",
        "express_pay_clicked",
        "order_paid",
        "ambassador_code_used",
      ].sort(),
    );
    expect(EVENT_NAMES.filter((e) => EVENT_CHANNEL[e] === "server").sort()).toEqual([
      "ambassador_code_used",
      "order_paid",
    ]);
    expect(CATALOGUE_IS_PII_FREE).toBe(true);
  });

  it("props are statically typed per event", () => {
    const t = createClientTracker({
      adapters: [],
      consent: { analytics: "granted", marketing: "granted" },
    });
    t.track("config_started", configStarted);
    // @ts-expect-error wrong prop type
    t.track("config_started", { product_type: "spaceship", entry_point: "x" });
    // @ts-expect-error missing required prop
    t.track("express_pay_clicked", {});
    // @ts-expect-error server-only events cannot be sent from the client tracker
    t.track("order_paid", { order_id: "o", value: 1, currency: "AUD", attribution: null });
    // @ts-expect-error unknown event
    t.track("made_up_event", {});
    expect(true).toBe(true);
  });
});

describe("client consent gate", () => {
  it("queues analytics events while consent is pending and flushes on grant", () => {
    const { seen, adapters } = recordingAdapters();
    const t = createClientTracker({ adapters, now: () => at, newEventId: ids });
    const out = t.track("config_started", configStarted);
    expect(out).toMatchObject({ status: "accepted", delivered: [], queued: ["posthog", "ga4"] });
    expect(seen["posthog"]).toHaveLength(0);
    expect(t.queuedCount()).toBe(2);
    t.setConsent({ analytics: "granted" });
    expect(seen["posthog"]!.map((e) => e.name)).toEqual(["config_started"]);
    expect(seen["ga4"]).toHaveLength(1);
    expect(t.queuedCount()).toBe(0);
  });

  it("drops queued events when consent is denied", () => {
    const { seen, adapters } = recordingAdapters();
    const t = createClientTracker({ adapters, newEventId: ids });
    t.track("config_started", configStarted);
    t.setConsent({ analytics: "denied" });
    expect(t.queuedCount()).toBe(0);
    t.setConsent({ analytics: "granted" });
    expect(seen["posthog"]).toHaveLength(0);
  });

  it("drops instead of queueing with pendingPolicy=drop", () => {
    const { adapters } = recordingAdapters();
    const t = createClientTracker({ adapters, pendingPolicy: "drop" });
    expect(t.track("config_started", configStarted)).toMatchObject({
      dropped: ["posthog", "ga4"],
      queued: [],
    });
    expect(t.queuedCount()).toBe(0);
  });

  it("caps the queue, keeping the newest events", () => {
    const { seen, adapters } = recordingAdapters();
    const t = createClientTracker({ adapters: [adapters[0]!], maxQueue: 3, newEventId: ids });
    for (let i = 0; i < 5; i++) t.track("story_station_viewed", { station: `s${i}`, dwell_ms: i });
    t.setConsent({ analytics: "granted" });
    expect(
      seen["posthog"]!.map((e) => (e.name === "story_station_viewed" ? e.props.station : "")),
    ).toEqual(["s2", "s3", "s4"]);
  });

  it("delivers immediately once granted, and never sends client events to server-conversion adapters", () => {
    const { seen, adapters } = recordingAdapters();
    const t = createClientTracker({
      adapters,
      consent: { analytics: "granted", marketing: "granted" },
      now: () => at,
      newEventId: ids,
    });
    const out = t.track("checkout_started", {
      cart_value: 125_000,
      currency: "AUD",
      payment_mode: "deposit",
    });
    expect(out).toMatchObject({ status: "accepted", delivered: ["posthog", "ga4"] });
    expect(seen["meta_capi"]).toHaveLength(0);
    expect(seen["posthog"]![0]).toMatchObject({
      channel: "client",
      conversion: false,
      timestamp: at.toISOString(),
    });
  });

  it("marketing consent does not unlock analytics adapters and vice versa", () => {
    const { adapters } = recordingAdapters();
    const t = createClientTracker({
      adapters,
      consent: { analytics: "denied", marketing: "granted" },
    });
    expect(t.track("config_started", configStarted)).toMatchObject({
      delivered: [],
      dropped: ["posthog", "ga4"],
    });
  });

  it("rejects invalid props at runtime (defence against casts)", () => {
    const t = createClientTracker({
      adapters: [],
      consent: { analytics: "granted", marketing: "granted" },
    });
    const loose = t.track as (name: string, props: unknown) => ReturnType<typeof t.track>;
    expect(loose("config_started", { product_type: "bag" })).toMatchObject({
      status: "rejected",
      reason: "invalid_props",
    });
    expect(loose("config_started", { ...configStarted, extra: 1 })).toMatchObject({
      status: "rejected",
      reason: "invalid_props",
    });
    expect(
      loose("order_paid", { order_id: "o", value: 1, currency: "AUD", attribution: null }),
    ).toMatchObject({ status: "rejected", reason: "wrong_channel" });
    expect(loose("nope", {})).toMatchObject({ status: "rejected", reason: "unknown_event" });
  });

  it("rejects PII in props (keys or email/phone-looking values)", () => {
    const t = createClientTracker({
      adapters: [],
      consent: { analytics: "granted", marketing: "granted" },
    });
    const loose = t.track as (name: string, props: unknown) => ReturnType<typeof t.track>;
    expect(loose("config_shared", { config_id: "c1", channel: "bob@example.com" })).toMatchObject({
      status: "rejected",
      reason: "pii_detected",
    });
    expect(
      loose("config_option_changed", {
        config_id: "c",
        step: "s",
        option: "o",
        value: "+61 412 345 678",
        time_on_step_ms: 1,
      }),
    ).toMatchObject({ reason: "pii_detected" });
    expect(loose("config_started", { ...configStarted, email: "x" })).toMatchObject({
      reason: "pii_detected",
    });
  });

  it("isolates adapter failures", async () => {
    const onError = vi.fn();
    const boom = { ...createPostHogAdapter(), send: () => Promise.reject(new Error("network")) };
    const sync = {
      ...createGa4Adapter(),
      send: () => {
        throw new Error("sync");
      },
    };
    const t = createClientTracker({
      adapters: [boom, sync],
      consent: { analytics: "granted", marketing: "granted" },
      onError,
    });
    expect(t.track("config_started", configStarted).status).toBe("accepted");
    await new Promise((r) => setTimeout(r, 0));
    expect(onError).toHaveBeenCalledTimes(2);
  });
});

describe("PII detector", () => {
  it("does not flag order or config ids", () => {
    expect(
      findPii({ order_id: "ORD-2026-000123", config_id: "CFG-2026-000123", value: 123456 }),
    ).toEqual([]);
  });
  it("finds nested PII", () => {
    expect(findPii({ attribution: { first_touch: { utm_source: "me@x.co" } } })).toEqual([
      { path: "props.attribution.first_touch.utm_source", reason: "email_value" },
    ]);
    expect(findPii({ customer_phone: "n/a" })[0]?.reason).toBe("pii_key");
  });
});

describe("server tracker", () => {
  const orderPaid = {
    order_id: "ORD-2026-000123",
    value: 450_000,
    currency: "AED",
    attribution: {
      first_touch: {
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: null,
        gclid: "abc",
        fbclid: null,
        ambassador_code: null,
      },
      last_touch: {
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        gclid: null,
        fbclid: null,
        ambassador_code: "COACH7",
      },
    },
  } as const;

  it("sends conversions to ad platforms only with marketing consent, with hashed user data and a dedupe id", async () => {
    const { seen, adapters } = recordingAdapters();
    const t = createServerTracker({ adapters, now: () => at });
    const user = { em: hashEmail("  Bob@Example.com "), ph: hashPhone("+61 412 345 678") };
    const out = await t.track("order_paid", orderPaid, {
      consent: { analytics: "granted", marketing: "granted" },
      eventId: "pi_123",
      user,
    });
    expect(out).toMatchObject({
      status: "accepted",
      eventId: "pi_123",
      delivered: ["posthog", "ga4", "meta_capi", "google_ads"],
    });
    expect(seen["meta_capi"]![0]).toMatchObject({
      name: "order_paid",
      channel: "server",
      conversion: true,
      user,
    });
    expect(user.em).toBe(hashEmail("bob@example.com"));
    expect(user.em).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(seen["meta_capi"]![0]!.props)).not.toContain("example.com");
  });

  it("treats pending consent as not granted (no queue on the server)", async () => {
    const { seen, adapters } = recordingAdapters();
    const t = createServerTracker({ adapters });
    const out = await t.track("order_paid", orderPaid, {
      consent: { analytics: "granted", marketing: "pending" },
    });
    expect(out).toMatchObject({
      delivered: ["posthog", "ga4"],
      dropped: ["meta_capi", "google_ads"],
    });
    expect(seen["google_ads"]).toHaveLength(0);
  });

  it("non-conversion server events never reach ad adapters", async () => {
    const { adapters } = recordingAdapters();
    const t = createServerTracker({ adapters, newEventId: ids });
    const out = await t.track(
      "ambassador_code_used",
      { code: "COACH7", value: 1000, currency: "GBP" },
      { consent: { analytics: "granted", marketing: "granted" } },
    );
    expect(out).toMatchObject({ delivered: ["posthog", "ga4"], dropped: [] });
  });

  it("rejects client events and PII on the server path", async () => {
    const t = createServerTracker({ adapters: [] });
    const loose = t.track as (
      name: string,
      props: unknown,
      o: Parameters<typeof t.track>[2],
    ) => ReturnType<typeof t.track>;
    const consent = { analytics: "granted", marketing: "granted" } as const;
    expect(await loose("config_started", configStarted, { consent })).toMatchObject({
      reason: "wrong_channel",
    });
    expect(
      await loose("order_paid", { ...orderPaid, order_id: "a@b.co" }, { consent }),
    ).toMatchObject({ reason: "pii_detected" });
  });
});

describe("adapters and consent mode", () => {
  it("vendor adapters are no-ops without a transport", () => {
    expect(() => createPostHogAdapter().send({} as AnyTrackedEvent)).not.toThrow();
  });
  it("console adapter logs", () => {
    const log = vi.fn();
    const t = createClientTracker({
      adapters: [createConsoleAdapter({ log })],
      consent: { analytics: "granted", marketing: "denied" },
    });
    t.track("express_pay_clicked", { wallet: "apple" });
    expect(log).toHaveBeenCalledWith(
      "[analytics] express_pay_clicked",
      expect.objectContaining({ name: "express_pay_clicked" }),
    );
  });
  it("maps to Google Consent Mode v2, denying anything not granted", () => {
    expect(toConsentModeV2({ analytics: "granted", marketing: "pending" })).toEqual({
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });
});
