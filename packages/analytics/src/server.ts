/** Server-only analytics helpers (node:crypto). Never import from client components. */
import { createHash } from "node:crypto";
import type { Sha256Hex } from "./types";

export * from "./index";

const sha256 = (s: string): Sha256Hex =>
  // Brand assertion: this is the single place a Sha256Hex is minted, from a real digest.
  createHash("sha256").update(s, "utf8").digest("hex") as Sha256Hex;

/** Normalise (trim, lowercase) then SHA-256, per Meta CAPI / Google enhanced-conversions rules. */
export function hashEmail(email: string): Sha256Hex {
  return sha256(email.trim().toLowerCase());
}

/** Digits only (E.164 without "+"), then SHA-256. Caller must supply the country code. */
export function hashPhone(phoneE164: string): Sha256Hex {
  return sha256(phoneE164.replace(/\D/g, ""));
}
