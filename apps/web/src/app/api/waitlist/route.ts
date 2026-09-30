import { NextResponse } from "next/server";
import { waitlistSchema } from "@/lib/waitlist";
import { limited } from "@/lib/rate-limit";
import { getWaitlistStore } from "@/lib/waitlist-store";

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
