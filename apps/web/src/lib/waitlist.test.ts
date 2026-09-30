import { describe, expect, it } from "vitest";
import { WAITLIST_LINES, waitlistSchema } from "./waitlist";

describe("waitlistSchema", () => {
  it("accepts a normal email and defaults the method", () => {
    const r = waitlistSchema.safeParse({ email: "  me@example.com " });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("me@example.com");
      expect(r.data.method).toBe("email");
    }
  });
  it("rejects a malformed email", () => {
    expect(waitlistSchema.safeParse({ email: "nope" }).success).toBe(false);
    expect(waitlistSchema.safeParse({ email: "a@b" }).success).toBe(false);
  });
  it("requires a Gmail address when Gmail is chosen", () => {
    expect(waitlistSchema.safeParse({ email: "me@example.com", method: "gmail" }).success).toBe(false);
    expect(waitlistSchema.safeParse({ email: "me@gmail.com", method: "gmail" }).success).toBe(true);
    expect(waitlistSchema.safeParse({ email: "me@googlemail.com", method: "gmail" }).success).toBe(true);
  });
  it("rejects a filled honeypot field", () => {
    expect(waitlistSchema.safeParse({ email: "me@example.com", company: "spam" }).success).toBe(false);
  });
  it("rejects an unknown method and an over-long address", () => {
    expect(waitlistSchema.safeParse({ email: "me@example.com", method: "fax" }).success).toBe(false);
    expect(waitlistSchema.safeParse({ email: `${"a".repeat(250)}@example.com` }).success).toBe(false);
  });
  it("ships five placeholder lines and no invented numbers", () => {
    expect(WAITLIST_LINES).toHaveLength(5);
    for (const l of WAITLIST_LINES) expect(l).not.toMatch(/\d/);
  });
});
