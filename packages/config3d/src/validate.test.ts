import { describe, expect, it } from "vitest";
import { validateSelection } from "./index";
import { bagSchema, bagWallSchema } from "./seeds";
import { validBag, validWall } from "./fixtures.test-helpers";

const errorCodes = (sel: unknown, ctx: unknown = {}) =>
  validateSelection(bagSchema, sel, ctx)
    .issues.filter((i) => i.severity === "error")
    .map((i) => `${i.code}:${i.optionIds.join(",")}`);

describe("validateSelection structure", () => {
  it("accepts a minimal valid bag and applies defaults", () => {
    const r = validateSelection(bagSchema, validBag);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.selection.schemaId).toBe("bag");
    expect(r.selection.schemaVersion).toBe("0.1.0");
    expect(r.selection.values).toMatchObject({
      material: "vinyl",
      quantity: 1,
      makers_mark: true,
      fill_type: "shredded_textile",
    });
    expect(r.selection.values["panel_colours"]).toEqual(["#000000", "#C8102E"]); // normalised to upper case
  });
  it("output keys are sorted and independent of input order", () => {
    const a = validateSelection(bagSchema, validBag);
    const b = validateSelection(bagSchema, Object.fromEntries(Object.entries(validBag).reverse()));
    expect(a).toEqual(b);
    expect(a.ok && Object.keys(a.selection.values)).toEqual(
      a.ok && [...Object.keys(a.selection.values)].sort(),
    );
  });
  it("rejects non-object input and invalid context", () => {
    expect(validateSelection(bagSchema, "nope").ok).toBe(false);
    expect(validateSelection(bagSchema, [1, 2]).ok).toBe(false);
    expect(validateSelection(bagSchema, validBag, { destinationCountry: "australia" }).ok).toBe(
      false,
    );
    expect(validateSelection(bagSchema, validBag, { hacker: true }).ok).toBe(false);
  });
  it("rejects unknown options (e.g. a client-supplied price)", () => {
    expect(errorCodes({ ...validBag, price: 1 })).toEqual(["unknown_option:price"]);
  });
  it("rejects invalid choices, types and ranges", () => {
    expect(errorCodes({ ...validBag, material: "gold" })).toEqual(["invalid_choice:material"]);
    expect(errorCodes({ ...validBag, material: 3 })).toEqual(["invalid_type:material"]);
    expect(errorCodes({ ...validBag, quantity: 0 })).toEqual(["out_of_range:quantity"]);
    expect(errorCodes({ ...validBag, quantity: 2.5 })).toEqual(["not_integer:quantity"]);
    expect(errorCodes({ ...validBag, numbering: "yes" })).toEqual(["invalid_type:numbering"]);
    expect(errorCodes({ ...validBag, cap_top: "red" })).toEqual(["invalid_colour:cap_top"]);
    expect(errorCodes({ ...validBag, panel_colours: [] })).toEqual(["too_few_items:panel_colours"]);
    expect(errorCodes({ ...validBag, panel_colours: Array(7).fill("#000000") })).toEqual([
      "too_many_items:panel_colours",
    ]);
    expect(errorCodes({ ...validBag, extra_text: "x".repeat(31) })).toEqual([
      "too_long:extra_text",
    ]);
    expect(errorCodes({ ...validBag, extras: ["qr_tag", "gloves"] })).toEqual([
      "invalid_choice:extras",
    ]);
  });
  it("enforces availableWhen on choices (length depends on bag type; debossing needs leather)", () => {
    expect(errorCodes({ ...validBag, length: "ft7" })).toEqual(["choice_unavailable:length"]);
    expect(errorCodes({ ...validBag, branding_method: "debossed_leather" })).toEqual([
      "choice_unavailable:branding_method",
    ]);
    expect(
      errorCodes({ ...validBag, material: "leather", branding_method: "debossed_leather" }),
    ).toEqual([]);
  });
  it("reports missing required options", () => {
    expect(errorCodes({ bag_type: "heavy" })).toEqual([
      "required:length",
      "required:fill",
      "required:panel_colours",
    ]);
  });
  it("strips hidden options with an info issue (double-end bag has no length or fill)", () => {
    const r = validateSelection(bagSchema, {
      bag_type: "double_end",
      length: "ft5",
      fill: "filled",
      panel_colours: ["#000000"],
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.selection.values["length"]).toBeUndefined();
    expect(r.selection.values["fill_type"]).toBeUndefined(); // chained visibility: fill hidden → fill_type hidden
    expect(r.issues.filter((i) => i.code === "not_applicable").map((i) => i.optionIds[0])).toEqual([
      "length",
      "fill",
    ]);
  });
  it("trims text and deduplicates multi-choice", () => {
    const r = validateSelection(bagSchema, {
      ...validBag,
      extra_text: "  Legends \u0007 Gym ",
      extras: ["qr_tag", "qr_tag", "protective_cover"],
    });
    expect(r.ok && r.selection.values["extra_text"]).toBe("Legends  Gym");
    expect(r.ok && r.selection.values["extras"]).toEqual(["protective_cover", "qr_tag"]);
  });
  it("validates numbers on the wall", () => {
    const r = validateSelection(bagWallSchema, { ...validWall, stations: 0 });
    expect(r.ok).toBe(false);
  });
});
