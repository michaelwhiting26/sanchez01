import { NextResponse } from "next/server";
import { getStoreBootstrap } from "@/lib/storefront/config";

/** One call that starts the store: scene files, sound, voice lines with their timings, and the products in wall order. */
export function GET(): NextResponse {
  return NextResponse.json(getStoreBootstrap(), { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=600" } });
}
