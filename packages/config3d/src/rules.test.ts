import { describe, expect, it } from "vitest";
import { computePrice, validateSelection, type Issue, type ValidationResult } from "./index";
import { bagSchema, bagWallSchema, placeholderRetailPriceBook, ringSchema } from "./seeds";
import { validBag, validRing, validWall } from "./fixtures.test-helpers";

const codes = (r: ValidationResult): string[] => r.issues.map((i) => i.code);
const find = (r: ValidationResult, code: string): Issue | undefined =>
  r.issues.find((i) => i.code === code);

describe("§10 ceiling < bag length + 0.8 m", () => {
  it("blocks a 5ft bag under a 2.2 m ceiling and suggests the longest bag that fits", () => {
    const r = validateSelection(bagSchema, validBag, {
      room: { lengthM: 10, widthM: 8, ceilingM: 2.2 },
    });
    expect(r.ok).toBe(false);
    expect(find(r, "ceiling_too_low")?.fixes).toEqual([
      { type: "set_option", option: "length", value: "ft4" },
    ]);
  });
  it("is exact at the boundary (integer millimetres, no float drift)", () => {
    // 5 ft = 1524 mm; + 800 mm = 2324 mm
    expect(
      validateSelection(bagSchema, validBag, { room: { lengthM: 10, widthM: 8, ceilingM: 2.324 } })
        .ok,
    ).toBe(true);
    expect(
      validateSelection(bagSchema, validBag, { room: { lengthM: 10, widthM: 8, ceilingM: 2.323 } })
        .ok,
    ).toBe(false);
  });
  it("is skipped when no ceiling height is known, and for bags without a length", () => {
    expect(validateSelection(bagSchema, validBag).ok).toBe(true);
    expect(
      validateSelection(
        bagSchema,
        { bag_type: "angle", fill: "filled", panel_colours: ["#000000"] },
        { room: { lengthM: 3, widthM: 3, ceilingM: 1 } },
      ).ok,
    ).toBe(true);
  });
  it("uses the wall's own ceiling option and offers the wall-arm alternative", () => {
    const r = validateSelection(bagWallSchema, {
      ...validWall,
      mount: "ceiling_track",
      ceiling_m: 2.5,
      bag_length: "ft7",
    });
    expect(find(r, "ceiling_too_low")?.fixes).toEqual([
      { type: "set_option", option: "bag_length", value: "ft5" },
      { type: "set_option", option: "mount", value: "wall_arms" },
    ]);
  });
  it("does not suggest the alternative when it is already selected", () => {
    const r = validateSelection(bagWallSchema, { ...validWall, ceiling_m: 2.5, bag_length: "ft7" });
    expect(find(r, "ceiling_too_low")?.fixes).toEqual([
      { type: "set_option", option: "bag_length", value: "ft5" },
    ]);
  });
});

describe("§10 stud wall + wall arms", () => {
  it("forces a backing-plate line item and prices it", () => {
    const sel = { ...validWall, wall: "timber_stud" };
    const r = validateSelection(bagWallSchema, sel);
    expect(r.ok).toBe(true);
    expect(r.lineItems.map((l) => l.id)).toEqual(["backing_plate"]);
    expect(find(r, "backing_plate_required")?.severity).toBe("warning");
    const q = computePrice(bagWallSchema, sel, placeholderRetailPriceBook, "AUD");
    expect(
      q.ok && q.value.lines.some((l) => l.id === "backing_plate" && l.kind === "line_item"),
    ).toBe(true);
  });
  it("does nothing for concrete walls or non-wall mounts", () => {
    expect(validateSelection(bagWallSchema, validWall).lineItems).toEqual([]);
    expect(
      validateSelection(bagWallSchema, { ...validWall, wall: "timber_stud", mount: "gantry" })
        .lineItems,
    ).toEqual([]);
  });
  it("warns (without forcing) when the wall construction is unknown", () => {
    const r = validateSelection(bagWallSchema, { ...validWall, wall: "unknown" });
    expect(r.ok).toBe(true);
    expect(r.lineItems).toEqual([]);
    expect(find(r, "wall_construction_unknown")?.fixes.map((f) => f.type)).toEqual([
      "offer_line_item",
      "contact_us",
    ]);
  });
});

describe("§10 ceiling mount → engineer sign-off", () => {
  it("auto-adds the engineer sign-off", () => {
    const r = validateSelection(bagWallSchema, { ...validWall, mount: "ceiling_track" });
    expect(r.lineItems.map((l) => l.id)).toEqual(["engineer_signoff"]);
    expect(codes(r)).toContain("engineer_signoff_required");
  });
  it("is absent for other mounts", () => {
    expect(codes(validateSelection(bagWallSchema, validWall))).not.toContain(
      "engineer_signoff_required",
    );
  });
});

describe("§10 ring + apron + 1 m clearance vs room", () => {
  // 18 ft = 5486 mm; apron 0.75 × 2 = 1500; clearance 1 × 2 = 2000 → 8986 mm
  it("fits exactly at the boundary", () => {
    expect(
      validateSelection(ringSchema, { ...validRing, room_length_m: 8.986, room_width_m: 20 }).ok,
    ).toBe(true);
  });
  it("rejects when the short side is too small and suggests the next size down", () => {
    const r = validateSelection(ringSchema, {
      ...validRing,
      room_length_m: 20,
      room_width_m: 8.98,
    });
    expect(r.ok).toBe(false);
    expect(find(r, "ring_exceeds_room")?.fixes).toEqual([
      { type: "set_option", option: "size", value: "ft16" },
      { type: "set_option", option: "purpose", value: "floor" },
    ]);
  });
  it("only offers the floor ring when no size fits", () => {
    const r = validateSelection(ringSchema, { ...validRing, room_length_m: 7, room_width_m: 7 });
    expect(find(r, "ring_exceeds_room")?.fixes).toEqual([
      { type: "set_option", option: "purpose", value: "floor" },
    ]);
  });
  it("falls back to the context room, and asks for a room size when unknown", () => {
    const { room_length_m: _l, room_width_m: _w, ...noRoom } = validRing;
    expect(validateSelection(ringSchema, noRoom, { room: { lengthM: 7, widthM: 7 } }).ok).toBe(
      false,
    );
    const r = validateSelection(ringSchema, noRoom);
    expect(r.ok).toBe(true);
    expect(find(r, "room_size_needed")?.severity).toBe("warning");
  });
});

describe("§10 competition ring locks corner colours", () => {
  it("defaults and locks corners to red/blue/neutral", () => {
    const r = validateSelection(ringSchema, {
      ...validRing,
      purpose: "competition",
      sanction: "wbc",
    });
    expect(r.ok).toBe(true);
    expect(r.locks).toEqual([
      { option: "corner_scheme", value: "standard", rule: "competition_corner_lock" },
    ]);
    expect(r.ok && r.selection.values["corner_scheme"]).toBe("standard");
  });
  it("rejects brand corners on a competition ring with a fix", () => {
    const r = validateSelection(ringSchema, {
      ...validRing,
      purpose: "competition",
      sanction: "wbc",
      corner_scheme: "brand",
    });
    expect(r.ok).toBe(false);
    expect(find(r, "corner_colours_locked")?.fixes).toEqual([
      { type: "set_option", option: "corner_scheme", value: "standard" },
    ]);
  });
  it("allows brand corners for training", () => {
    const r = validateSelection(ringSchema, { ...validRing, corner_scheme: "brand" });
    expect(r.ok).toBe(true);
    expect(r.locks).toEqual([]);
  });
  it("requires a sanctioning target only for competition rings", () => {
    expect(
      codes(validateSelection(ringSchema, { ...validRing, purpose: "competition" })),
    ).toContain("required");
    const r = validateSelection(ringSchema, { ...validRing, sanction: "wbc" });
    expect(r.ok).toBe(true);
    expect(find(r, "not_applicable")?.optionIds).toEqual(["sanction"]);
    expect(r.ok && "sanction" in r.selection.values).toBe(false);
  });
});

describe("§10 low-resolution logo", () => {
  it("warns under 1000 px on the longest side and offers vectorising", () => {
    const r = validateSelection(bagSchema, validBag, {
      logo: { format: "raster", widthPx: 800, heightPx: 600 },
    });
    expect(r.ok).toBe(true);
    expect(find(r, "low_resolution_logo")?.fixes).toEqual([
      {
        type: "offer_line_item",
        lineItem: {
          id: "vectorising",
          label: { en: "Logo vectorising" },
          priceKey: "line.vectorising",
        },
      },
    ]);
    expect(r.lineItems).toEqual([]); // offered, not forced
  });
  it("does not warn for vectors or large rasters", () => {
    expect(
      codes(validateSelection(bagSchema, validBag, { logo: { format: "vector" } })),
    ).not.toContain("low_resolution_logo");
    expect(
      codes(
        validateSelection(bagSchema, validBag, {
          logo: { format: "raster", widthPx: 1000, heightPx: 200 },
        }),
      ),
    ).not.toContain("low_resolution_logo");
  });
});

describe("§10 opening date vs lead time", () => {
  const withLead = { ...bagWallSchema, leadTimeDays: 60 };
  const ctx = { today: "2026-09-28" };
  it("warns and offers express/phased when the opening is before handover", () => {
    const r = validateSelection(withLead, { ...validWall, opening_date: "2026-10-15" }, ctx);
    expect(r.ok).toBe(true);
    const i = find(r, "opening_date_before_lead_time");
    expect(i?.message).toContain("2026-11-27");
    expect(i?.fixes.map((f) => (f.type === "offer_line_item" ? f.lineItem.id : f.type))).toEqual([
      "express_slot",
      "phased_install",
    ]);
  });
  it("is fine on or after the handover date", () => {
    expect(
      codes(validateSelection(withLead, { ...validWall, opening_date: "2026-11-27" }, ctx)),
    ).not.toContain("opening_date_before_lead_time");
  });
  it("reports unknown lead time instead of guessing (seed schemas have none)", () => {
    const r = validateSelection(bagWallSchema, { ...validWall, opening_date: "2026-10-15" }, ctx);
    expect(codes(r)).toContain("lead_time_unknown");
  });
  it("uses the context opening date for products without the option", () => {
    const r = validateSelection({ ...bagSchema, leadTimeDays: 30 }, validBag, {
      today: "2026-09-28",
      openingDate: "2026-10-01",
    });
    expect(codes(r)).toContain("opening_date_before_lead_time");
  });
  it("rejects impossible dates", () => {
    expect(
      codes(validateSelection(withLead, { ...validWall, opening_date: "2026-02-30" }, ctx)),
    ).toContain("invalid_date");
  });
});

describe("§10 export destination → unfilled by default", () => {
  const { fill: _fill, ...noFill } = validBag;
  it("defaults export orders to unfilled with a duty/VAT note", () => {
    const r = validateSelection(bagSchema, noFill, { destinationCountry: "AE" });
    expect(r.ok && r.selection.values["fill"]).toBe("unfilled");
    expect(codes(r)).toContain("export_unfilled_default");
  });
  it("never overrides an explicit filled choice, but notes the cost", () => {
    const r = validateSelection(bagSchema, validBag, { destinationCountry: "GB" });
    expect(r.ok && r.selection.values["fill"]).toBe("filled");
    expect(find(r, "export_filled_selected")?.fixes).toEqual([
      { type: "set_option", option: "fill", value: "unfilled" },
    ]);
  });
  it("does not default for home delivery (fill stays required)", () => {
    expect(codes(validateSelection(bagSchema, noFill, { destinationCountry: "AU" }))).toContain(
      "required",
    );
  });
});
