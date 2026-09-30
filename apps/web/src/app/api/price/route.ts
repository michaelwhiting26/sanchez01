import { NextResponse } from "next/server";
import { evaluate } from "@/lib/commerce/evaluate";
import { depositMinor } from "@/lib/commerce/money";
import { env, testPricesOn } from "@/lib/env";

/** Validate and price a bag config on the server. The browser only displays what this returns. */
export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const r = evaluate(body);
  if (!r.ok) return NextResponse.json({ error: r.error, detail: r.detail }, { status: r.status });
  const e = env();
  const percent = e.DEPOSIT_PERCENT ?? (testPricesOn(e) ? 30 : undefined);
  const deposit = r.price.status === "priced" && percent ? depositMinor(r.price.totalMinor, percent, e.DEPOSIT_ROUNDING) : null;
  return NextResponse.json({ validation: r.validation, price: r.price, depositMinor: deposit });
}
