import { describe, expect, it } from "vitest";
import { quoteSchema } from "./quote";
import { designDetails, quoteProductFor } from "./quote-handoff";

describe("the 3D design hand-off", () => {
  it("names a product the quote form accepts for every builder", () => {
    for (const slug of ["gloves", "heavy-bag", "head-guard", "groin-guard", "focus-mitts", "something-new"]) {
      expect(quoteSchema.safeParse({ name: "A", contact: "a@b.com", product: quoteProductFor(slug), details: "d" }).success, slug).toBe(true);
    }
    expect(quoteProductFor("something-new")).toBe("other");
  });
  it("writes details the quote form accepts, however long the design", () => {
    const d = designDetails("Your gloves", "Cuff: #000000 Matte\n".repeat(900));
    expect(d.startsWith("Your gloves, designed in the 3D builder:\nCuff: #000000 Matte")).toBe(true);
    expect(quoteSchema.safeParse({ name: "A", contact: "a@b.com", product: "gloves", details: `${d}\n\nPlease make it 16 oz.` }).success).toBe(true);
  });
});
