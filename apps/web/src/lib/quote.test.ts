import { describe, expect, it } from "vitest";
import { QUOTE_PRODUCTS, quoteSchema } from "./quote";

const good = { name: " Sam ", contact: "sam@example.com", product: "gloves", details: "16 oz, black and gold." };

describe("quoteSchema", () => {
  it("accepts a full request and trims it", () => {
    const r = quoteSchema.safeParse(good);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe("Sam");
  });
  it("accepts an Instagram handle in place of an email, with or without the @", () => {
    expect(quoteSchema.safeParse({ ...good, contact: "@sam.boxing_1" }).success).toBe(true);
    expect(quoteSchema.safeParse({ ...good, contact: "sam.boxing_1" }).success).toBe(true);
  });
  it("rejects a contact that is neither", () => {
    expect(quoteSchema.safeParse({ ...good, contact: "sam at example" }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...good, contact: "sam@" }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...good, contact: "  " }).success).toBe(false);
  });
  it("requires every field", () => {
    expect(quoteSchema.safeParse({ ...good, name: "" }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...good, details: "   " }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...good, product: undefined }).success).toBe(false);
  });
  it("accepts every listed product and no other", () => {
    for (const p of QUOTE_PRODUCTS) expect(quoteSchema.safeParse({ ...good, product: p.value }).success).toBe(true);
    expect(quoteSchema.safeParse({ ...good, product: "thai-pads" }).success).toBe(false);
  });
  it("rejects a filled honeypot field and an over-long message", () => {
    expect(quoteSchema.safeParse({ ...good, company: "spam" }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...good, details: "x".repeat(4001) }).success).toBe(false);
  });
});
