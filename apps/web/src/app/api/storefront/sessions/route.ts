import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/** Starts an anonymous store session and returns its id. No cookie is set and nothing personal is stored. */
export async function POST(): Promise<NextResponse> {
  const id = randomUUID();
  try {
    const db = await getDb();
    await db.query("INSERT INTO store_sessions (id, anonymous_id) VALUES ($1::uuid, $2::text)", [id, id]);
  } catch (error) {
    console.error("[storefront/sessions] could not store the session", error);
  }
  return NextResponse.json({ id }, { status: 201 });
}
