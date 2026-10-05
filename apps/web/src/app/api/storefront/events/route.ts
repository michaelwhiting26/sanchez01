import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { eventBatchSchema } from "@/lib/storefront/events-schema";

/** Receives the store's funnel events. Always answers quickly; a storage problem must never be visible to the visitor. */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = eventBatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 422 });
  try {
    const db = await getDb();
    await db.query("INSERT INTO store_sessions (id, anonymous_id) VALUES ($1::uuid, $2::text) ON CONFLICT (id) DO NOTHING", [parsed.data.sessionId, parsed.data.sessionId]);
    for (const e of parsed.data.events) {
      await db.query("INSERT INTO experience_events (session_id, event_name, properties, occurred_at) VALUES ($1::uuid, $2::text, $3::jsonb, $4::timestamptz)", [parsed.data.sessionId, e.name, JSON.stringify(e.properties), e.at]);
    }
  } catch (error) {
    console.error("[storefront/events] could not store events", error);
  }
  return NextResponse.json({ ok: true }, { status: 202 });
}
