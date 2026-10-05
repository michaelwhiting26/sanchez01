import { z } from "zod";
import { STORE_EVENTS } from "./types";

const Value = z.union([z.string().max(128), z.number().finite(), z.boolean(), z.null()]);

/** What the browser may send to POST /api/storefront/events. Strict and small: unknown events and oversized batches are refused. */
export const eventBatchSchema = z
  .object({
    sessionId: z.uuid(),
    events: z
      .array(z.object({ name: z.enum(STORE_EVENTS), properties: z.record(z.string().max(32), Value).default({}), at: z.iso.datetime() }).strict())
      .min(1)
      .max(50),
  })
  .strict();
export type EventBatch = z.infer<typeof eventBatchSchema>;
