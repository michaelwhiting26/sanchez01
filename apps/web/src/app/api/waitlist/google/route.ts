import { OAuth2Client } from "google-auth-library";
import { NextResponse } from "next/server";
import { z } from "zod";
import { limited } from "@/lib/rate-limit";
import { getWaitlistStore } from "@/lib/waitlist-store";

const Body = z.object({ credential: z.string().min(20).max(4096) });

/**
 * "Sign in with Google" for the waitlist. The browser gets a Google ID token; this route verifies it with Google (signature, audience = our client id,
 * expiry) and only then stores the VERIFIED email, name and Google account id. Nothing the browser says about who it is is trusted.
 * Needs NEXT_PUBLIC_GOOGLE_CLIENT_ID (an OAuth "Web application" client from the Google Cloud console).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const now = Date.now();
  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(client, now)) return NextResponse.json({ ok: false, message: "Too many tries. Please wait a minute." }, { status: 429 });

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return NextResponse.json({ ok: false, message: "Google sign-in is not connected yet." }, { status: 503 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "That request could not be read." }, { status: 400 });

  try {
    const ticket = await new OAuth2Client(clientId).verifyIdToken({ idToken: parsed.data.credential, audience: clientId });
    const p = ticket.getPayload();
    if (!p?.email || !p.email_verified || !p.sub) return NextResponse.json({ ok: false, message: "That Google account has no verified email." }, { status: 422 });
    const isGmail = /@(gmail|googlemail)\.com$/i.test(p.email);
    await getWaitlistStore().add({ email: p.email, method: isGmail ? "gmail" : "other", source: "google", name: p.name ?? null, googleSub: p.sub, receivedAt: new Date(now).toISOString() });
    return NextResponse.json({ ok: true, email: p.email }, { status: 202 });
  } catch {
    return NextResponse.json({ ok: false, message: "Google could not verify that sign-in. Please try again." }, { status: 401 });
  }
}
