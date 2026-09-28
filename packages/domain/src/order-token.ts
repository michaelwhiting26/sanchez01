/**
 * Signed, expiring order-link tokens for /order/[token] (spec 04 §7.3). Server-only (node:crypto).
 *
 * Format: base64url(JSON payload) "." base64url(HMAC-SHA256(secret, DOMAIN_TAG + payloadB64))
 * The signature is compared with crypto.timingSafeEqual.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { err, ok, type Result } from "./result";

const DOMAIN_TAG = "sanchez.order-link.v1.";
const MIN_SECRET_LENGTH = 32;
const MAX_TOKEN_LENGTH = 1024;
const B64URL = /^[A-Za-z0-9_-]+$/;

const PayloadSchema = z
  .object({
    v: z.literal(1),
    oid: z.string().min(1).max(128),
    exp: z.number().int().positive(),
  })
  .strict();

export interface OrderTokenClaims {
  readonly orderId: string;
  readonly expiresAt: Date;
}

export type OrderTokenError =
  | { readonly type: "malformed" }
  | { readonly type: "bad_signature" }
  | { readonly type: "expired"; readonly expiredAt: Date };

export class OrderTokenConfigError extends Error {
  override readonly name = "OrderTokenConfigError";
}

function assertSecret(secret: string): void {
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new OrderTokenConfigError(
      `ORDER_LINK_SECRET must be at least ${MIN_SECRET_LENGTH} characters`,
    );
  }
}

const sign = (payloadB64: string, secret: string): Buffer =>
  createHmac("sha256", secret)
    .update(DOMAIN_TAG + payloadB64)
    .digest();

export function signOrderToken(claims: OrderTokenClaims, secret: string): string {
  assertSecret(secret);
  const exp = Math.floor(claims.expiresAt.getTime() / 1000);
  const payload = PayloadSchema.parse({ v: 1, oid: claims.orderId, exp });
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${payloadB64}.${sign(payloadB64, secret).toString("base64url")}`;
}

export function verifyOrderToken(
  token: string,
  secret: string,
  now: Date = new Date(),
): Result<OrderTokenClaims, OrderTokenError> {
  assertSecret(secret);
  if (token.length === 0 || token.length > MAX_TOKEN_LENGTH) return err({ type: "malformed" });
  const parts = token.split(".");
  if (parts.length !== 2) return err({ type: "malformed" });
  const [payloadB64 = "", sigB64 = ""] = parts;
  if (!B64URL.test(payloadB64) || !B64URL.test(sigB64)) return err({ type: "malformed" });

  const expected = sign(payloadB64, secret);
  const provided = Buffer.from(sigB64, "base64url");
  // Length check first (timingSafeEqual requires equal lengths); the length of an HMAC is not secret.
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return err({ type: "bad_signature" });
  }

  let json: unknown;
  try {
    json = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return err({ type: "malformed" });
  }
  const parsed = PayloadSchema.safeParse(json);
  if (!parsed.success) return err({ type: "malformed" });

  const expiresAt = new Date(parsed.data.exp * 1000);
  if (now.getTime() >= expiresAt.getTime()) return err({ type: "expired", expiredAt: expiresAt });
  return ok({ orderId: parsed.data.oid, expiresAt });
}
