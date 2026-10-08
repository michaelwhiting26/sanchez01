import "server-only";
import { getDb } from "./db";
import type { QuoteInput } from "./quote";

/**
 * Where quote requests go: Postgres (lib/db), one row per request.
 * Still open (owner): who is told when one arrives. Nothing is emailed yet; requests are read from the quote_requests table.
 */
export type QuoteEntry = Omit<QuoteInput, "company"> & { receivedAt: string };

/**
 * A deployment with no DATABASE_URL runs on an in-memory database that is wiped on restart (lib/db). A quote request kept there would be lost
 * while the visitor is told it was sent, so the endpoint refuses instead.
 */
export const quotesAreKept = (): boolean => process.env.NODE_ENV !== "production" || Boolean(process.env.DATABASE_URL);

export async function addQuote(e: QuoteEntry): Promise<void> {
  const db = await getDb();
  await db.query("INSERT INTO quote_requests (name, contact, product, details, created_at) VALUES ($1,$2,$3,$4,$5)", [e.name, e.contact, e.product, e.details, e.receivedAt]);
}
