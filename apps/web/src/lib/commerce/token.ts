import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Signed, expiring links for /order/[token]: base64url(payload).base64url(hmac). Payload is { o: orderId, e: expiry seconds }. */
const b64 = (b: Buffer | string): string => Buffer.from(b).toString("base64url");

export function signOrderToken(orderId: string, secret: string, ttlDays: number, now = Date.now()): string {
  const payload = b64(JSON.stringify({ o: orderId, e: Math.floor(now / 1000) + ttlDays * 86400 }));
  const mac = b64(createHmac("sha256", secret).update(payload).digest());
  return `${payload}.${mac}`;
}

export function verifyOrderToken(token: string, secret: string, now = Date.now()): string | null {
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const expect = createHmac("sha256", secret).update(payload).digest();
  let given: Buffer;
  try {
    given = Buffer.from(mac, "base64url");
  } catch {
    return null;
  }
  if (given.length !== expect.length || !timingSafeEqual(given, expect)) return null;
  try {
    const p = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { o?: string; e?: number };
    if (!p.o || !p.e || p.e * 1000 < now) return null;
    return p.o;
  } catch {
    return null;
  }
}
