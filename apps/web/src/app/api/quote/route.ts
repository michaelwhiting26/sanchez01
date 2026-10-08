import { NextResponse } from "next/server";
import { quoteSchema, type QuoteField } from "@/lib/quote";
import { limited } from "@/lib/rate-limit";
import { addQuote, quotesAreKept } from "@/lib/quote-store";

const FIELDS: readonly QuoteField[] = ["name", "contact", "product", "details"];

export async function POST(request: Request): Promise<NextResponse> {
  const now = Date.now();
  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(`quote:${client}`, now)) return NextResponse.json({ ok: false, message: "Too many tries. Please wait a minute." }, { status: 429 });

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

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = FIELDS.find((f) => f === issue?.path[0]);
    return NextResponse.json({ ok: false, message: issue?.message ?? "Please check the form.", ...(field ? { field } : {}) }, { status: 422 });
  }

  if (!quotesAreKept()) {
    console.error("[quote] DATABASE_URL is not set: the request was refused, not stored.");
    return NextResponse.json({ ok: false, message: "The form cannot take requests right now. Please message Jesse on Instagram." }, { status: 503 });
  }

  const { name, contact, product, details } = parsed.data;
  try {
    await addQuote({ name, contact, product, details, receivedAt: new Date(now).toISOString() });
  } catch (error) {
    console.error("[quote] could not store the request", error);
    return NextResponse.json({ ok: false, message: "That did not go through. Please try again, or message Jesse on Instagram." }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
