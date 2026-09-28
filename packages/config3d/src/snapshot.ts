/**
 * Orders snapshot the exact schema version and config (CLAUDE.md "Configs"). The snapshot embeds
 * the full schema document so an order can be re-validated, re-priced and re-printed forever,
 * even after the live schema changes.
 */
import type { ProductConfiguration } from "./schema";
import type { NormalizedSelection } from "./selection";
import type { PriceQuote } from "./pricing";

export interface ConfigSnapshot {
  readonly schemaId: string;
  readonly schemaVersion: string;
  readonly schemaFormat: ProductConfiguration["format"];
  readonly schema: ProductConfiguration;
  readonly selection: NormalizedSelection;
  readonly quote: PriceQuote;
  readonly capturedAt: string;
}

export class SnapshotMismatchError extends Error {
  override readonly name = "SnapshotMismatchError";
}

export function createConfigSnapshot(
  schema: ProductConfiguration,
  selection: NormalizedSelection,
  quote: PriceQuote,
  at: Date,
): ConfigSnapshot {
  if (
    selection.schemaId !== schema.id ||
    selection.schemaVersion !== schema.version ||
    quote.schemaVersion !== schema.version
  ) {
    throw new SnapshotMismatchError("selection/quote were not produced from this schema version");
  }
  return {
    schemaId: schema.id,
    schemaVersion: schema.version,
    schemaFormat: schema.format,
    schema: structuredClone(schema),
    selection: structuredClone(selection),
    quote: structuredClone(quote),
    capturedAt: at.toISOString(),
  };
}
