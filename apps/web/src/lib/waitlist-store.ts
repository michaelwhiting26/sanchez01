import "server-only";
import { getDb } from "./db";
import type { WaitlistInput } from "./waitlist";

/**
 * Where waitlist sign-ups go: Postgres (lib/db). One row per email (case-insensitive); signing up again with Google adds the verified name and Google id.
 * Still open (business TODO #22): the email provider, double opt-in and consent wording.
 */
export type WaitlistEntry = WaitlistInput & { receivedAt: string; source?: "form" | "google"; name?: string | null; googleSub?: string | null };

export interface WaitlistStore {
  add(entry: WaitlistEntry): Promise<void>;
}

const pgStore: WaitlistStore = {
  async add(e) {
    const db = await getDb();
    await db.query(
      `INSERT INTO waitlist_entries (email, method, source, name, google_sub, created_at)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT ((lower(email))) DO UPDATE SET
         name = COALESCE(EXCLUDED.name, waitlist_entries.name),
         google_sub = COALESCE(EXCLUDED.google_sub, waitlist_entries.google_sub),
         source = CASE WHEN EXCLUDED.source = 'google' THEN 'google' ELSE waitlist_entries.source END`,
      [e.email.toLowerCase(), e.method, e.source ?? "form", e.name ?? null, e.googleSub ?? null, e.receivedAt],
    );
  },
};

export function getWaitlistStore(): WaitlistStore {
  return pgStore;
}
