import { NextResponse } from "next/server";
import { waitlistSchema } from "@/lib/waitlist";
import { getWaitlistStore } from "@/lib/waitlist-store";

// Best-effort rate limit per client (in-memory: per server instance). Replace with the shared limiter when infrastructure exists.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function limited(key: string, now: number): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request): Promise<NextResponse> {
  const now = Date.now();
  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(client, now)) return NextResponse.json({ ok: false, message: "Too many tries. Please wait a minute." }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "That request could not be read." }, { status: 400 });
  }

  const raw = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  if (typeof raw["company"] === "string" && raw["company"].length > 0) {
    return NextResponse.json({ ok: true }, { status: 202 }); // a bot filled the hidden field: pretend success, store nothing
  }

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "That email does not look right.";
    return NextResponse.json({ ok: false, message: message.startsWith("Invalid") ? "That email does not look right." : message }, { status: 422 });
  }

  await getWaitlistStore().add({ ...parsed.data, receivedAt: new Date(now).toISOString() });
  return NextResponse.json({ ok: true }, { status: 202 });
}
