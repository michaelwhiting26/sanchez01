/**
 * Typed event catalogue (spec 04 §11.1). One Zod schema per event gives both the static type
 * (so `track("config_started", {...})` is checked at compile time) and runtime validation (strict:
 * unknown keys are rejected, which is also the first line of the no-PII rule).
 *
 * Money values are integer minor units + currency, never floats.
 */
import { z } from "zod";
import { CurrencySchema, MinorUnitsSchema } from "@sanchez/domain";

const Id = z.string().min(1).max(64);
const Short = z.string().max(128);
const Ms = z.number().int().nonnegative();
const Country = z.string().regex(/^[A-Z]{2}$/);
const ProductType = z.enum(["bag", "bag_wall", "ring", "gym_package"]);

const TouchSummary = z
  .object({
    utm_source: Short.nullable(),
    utm_medium: Short.nullable(),
    utm_campaign: Short.nullable(),
    gclid: z.string().max(512).nullable(),
    fbclid: z.string().max(512).nullable(),
    ambassador_code: z.string().max(32).nullable(),
  })
  .strict();

export const EVENT_SCHEMAS = {
  page_viewed: z
    .object({
      locale: z.enum(["en", "th", "ar", "es"]),
      currency: CurrencySchema,
      /** Origin + path only; never a full URL with query string. */
      referrer: z.string().max(2048).nullable(),
      utm_source: Short.nullable(),
      utm_medium: Short.nullable(),
      utm_campaign: Short.nullable(),
      utm_term: Short.nullable(),
      utm_content: Short.nullable(),
    })
    .strict(),
  story_station_viewed: z.object({ station: Id, dwell_ms: Ms }).strict(),
  video_progress: z
    .object({
      video_id: Id,
      percent: z.union([z.literal(25), z.literal(50), z.literal(75), z.literal(100)]),
    })
    .strict(),
  config_started: z.object({ product_type: ProductType, entry_point: Id }).strict(),
  config_option_changed: z
    .object({ config_id: Id, step: Id, option: Id, value: Short, time_on_step_ms: Ms })
    .strict(),
  config_logo_uploaded: z
    .object({
      config_id: Id,
      file_type: z.enum(["svg", "png", "pdf", "ai", "eps", "other"]),
      width: z.number().int().positive().nullable(),
      height: z.number().int().positive().nullable(),
      bg_removed: z.boolean(),
    })
    .strict(),
  config_step_completed: z.object({ config_id: Id, step: Id }).strict(),
  config_abandoned: z.object({ config_id: Id, step: Id }).strict(),
  config_shared: z.object({ config_id: Id, channel: Id }).strict(),
  price_viewed: z
    .object({
      config_id: Id.nullable(),
      low: MinorUnitsSchema,
      high: MinorUnitsSchema,
      currency: CurrencySchema,
    })
    .strict(),
  gym_builder_item_added: z
    .object({ item: Id, count: z.number().int().positive(), clearance_warning: z.boolean() })
    .strict(),
  quote_submitted: z
    .object({
      type: z.enum(["bag", "bag_wall", "ring", "gym_package", "fit_out", "wholesale", "other"]),
      value_band: Id,
      country: Country,
    })
    .strict(),
  checkout_started: z
    .object({
      cart_value: MinorUnitsSchema,
      currency: CurrencySchema,
      payment_mode: z.enum(["full", "deposit"]),
    })
    .strict(),
  express_pay_clicked: z.object({ wallet: z.enum(["apple", "google", "link"]) }).strict(),
  order_paid: z
    .object({
      order_id: Id,
      value: MinorUnitsSchema,
      currency: CurrencySchema,
      attribution: z
        .object({ first_touch: TouchSummary, last_touch: TouchSummary })
        .strict()
        .nullable(),
    })
    .strict(),
  ambassador_code_used: z
    .object({
      code: z.string().regex(/^[A-Z0-9_-]{2,32}$/),
      value: MinorUnitsSchema,
      currency: CurrencySchema,
    })
    .strict(),
} as const;

export type EventName = keyof typeof EVENT_SCHEMAS;
export type EventProps<E extends EventName> = z.infer<(typeof EVENT_SCHEMAS)[E]>;
export const EVENT_NAMES = Object.keys(EVENT_SCHEMAS) as EventName[]; // keys of a const object literal: exact.

/**
 * Where an event may originate. `server` events are emitted only from trusted code (Stripe webhook)
 * and can never be sent by the browser tracker.
 */
export const EVENT_CHANNEL = {
  page_viewed: "client",
  story_station_viewed: "client",
  video_progress: "client",
  config_started: "client",
  config_option_changed: "client",
  config_logo_uploaded: "client",
  config_step_completed: "client",
  config_abandoned: "client",
  config_shared: "client",
  price_viewed: "client",
  gym_builder_item_added: "client",
  quote_submitted: "client",
  checkout_started: "client",
  express_pay_clicked: "client",
  order_paid: "server",
  ambassador_code_used: "server",
} as const satisfies Record<EventName, "client" | "server">;

/** Conversion events are forwarded to ad platforms (Meta CAPI, Google Ads) server-side. */
export const CONVERSION_EVENTS = ["order_paid"] as const satisfies readonly EventName[];

export type ClientEventName = {
  [K in EventName]: (typeof EVENT_CHANNEL)[K] extends "client" ? K : never;
}[EventName];
export type ServerEventName = {
  [K in EventName]: (typeof EVENT_CHANNEL)[K] extends "server" ? K : never;
}[EventName];
export type ConversionEventName = (typeof CONVERSION_EVENTS)[number];

export const isConversionEvent = (name: EventName): name is ConversionEventName =>
  (CONVERSION_EVENTS as readonly EventName[]).includes(name);
