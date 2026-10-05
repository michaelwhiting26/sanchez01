import { describe, expect, it } from "vitest";
import { eventBatchSchema } from "./events-schema";

const ok = { sessionId: "3f2b8c1e-6d4a-4f0b-9a57-0c1d2e3f4a5b", events: [{ name: "product_viewed", properties: { productId: "gloves", index: 0, dwellMs: 5230 }, at: "2026-10-05T08:00:00.000Z" }] };

describe("store event batch", () => {
  it("accepts a funnel event", () => expect(eventBatchSchema.safeParse(ok).success).toBe(true));
  it("refuses an event that is not in the catalogue", () => expect(eventBatchSchema.safeParse({ ...ok, events: [{ ...ok.events[0], name: "clicked_something" }] }).success).toBe(false));
  it("refuses a missing or malformed session", () => expect(eventBatchSchema.safeParse({ ...ok, sessionId: "abc" }).success).toBe(false));
  it("refuses oversized batches", () => expect(eventBatchSchema.safeParse({ ...ok, events: Array.from({ length: 51 }, () => ok.events[0]) }).success).toBe(false));
});
