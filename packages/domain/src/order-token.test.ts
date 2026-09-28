import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { OrderTokenConfigError, signOrderToken, verifyOrderToken } from "./server";

const SECRET = "test-secret-that-is-at-least-32-chars-long!!";
const now = new Date("2026-09-28T12:00:00Z");
const expiresAt = new Date("2026-10-28T12:00:00Z");

describe("order-link tokens", () => {
  const token = signOrderToken({ orderId: "ORD-2026-000123", expiresAt }, SECRET);

  it("round-trips", () => {
    expect(verifyOrderToken(token, SECRET, now)).toEqual({
      ok: true,
      value: { orderId: "ORD-2026-000123", expiresAt },
    });
  });

  it("is URL-safe", () => {
    expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it("expires exactly at exp", () => {
    expect(verifyOrderToken(token, SECRET, new Date(expiresAt.getTime() - 1000)).ok).toBe(true);
    expect(verifyOrderToken(token, SECRET, expiresAt)).toEqual({
      ok: false,
      error: { type: "expired", expiredAt: expiresAt },
    });
  });

  it("rejects a different secret", () => {
    expect(verifyOrderToken(token, "another-secret-that-is-at-least-32-chars", now)).toEqual({
      ok: false,
      error: { type: "bad_signature" },
    });
  });

  it("rejects a tampered payload (e.g. swapped order id or extended expiry)", () => {
    const [, sig] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ v: 1, oid: "ORD-2026-000999", exp: 4_000_000_000 }),
    ).toString("base64url");
    expect(verifyOrderToken(`${forged}.${sig}`, SECRET, now)).toEqual({
      ok: false,
      error: { type: "bad_signature" },
    });
  });

  it("rejects a tampered or truncated signature", () => {
    const [payload, sig = ""] = token.split(".");
    const flipped = (sig[0] === "A" ? "B" : "A") + sig.slice(1);
    expect(verifyOrderToken(`${payload}.${flipped}`, SECRET, now).ok).toBe(false);
    expect(verifyOrderToken(`${payload}.${sig.slice(0, 10)}`, SECRET, now)).toEqual({
      ok: false,
      error: { type: "bad_signature" },
    });
  });

  it.each(["", "abc", "a.b.c", "!!.??", "x".repeat(2000)])("rejects malformed token %#", (t) => {
    expect(verifyOrderToken(t, SECRET, now)).toEqual({ ok: false, error: { type: "malformed" } });
  });

  it("rejects a correctly signed but schema-invalid payload", () => {
    const sign = (payload: unknown): string => {
      const p = Buffer.from(JSON.stringify(payload)).toString("base64url");
      return `${p}.${createHmac("sha256", SECRET).update(`sanchez.order-link.v1.${p}`).digest("base64url")}`;
    };
    expect(verifyOrderToken(sign({ v: 1, oid: "ORD-1", exp: 4_000_000_000 }), SECRET, now).ok).toBe(
      true,
    );
    expect(verifyOrderToken(sign({ v: 2, oid: "ORD-1", exp: 4_000_000_000 }), SECRET, now)).toEqual(
      { ok: false, error: { type: "malformed" } },
    );
    expect(
      verifyOrderToken(sign({ v: 1, oid: "ORD-1", exp: 4_000_000_000, admin: true }), SECRET, now)
        .ok,
    ).toBe(false);
    expect(() => signOrderToken({ orderId: "", expiresAt }, SECRET)).toThrow();
  });

  it("refuses weak secrets", () => {
    expect(() => signOrderToken({ orderId: "x", expiresAt }, "short")).toThrow(
      OrderTokenConfigError,
    );
    expect(() => verifyOrderToken(token, "short", now)).toThrow(OrderTokenConfigError);
  });
});
