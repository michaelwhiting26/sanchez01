import { describe, expect, it } from "vitest";
import {
  buildFactorySpecSheet,
  computePrice,
  createConfigSnapshot,
  SnapshotMismatchError,
  SpecSheetSchemaMismatchError,
  validateSelection,
} from "./index";
import { bagSchema, bagWallSchema, placeholderRetailPriceBook } from "./seeds";
import { validBag, validWall } from "./fixtures.test-helpers";

const normalised = (schema: typeof bagSchema, sel: Record<string, unknown>) => {
  const r = validateSelection(schema, sel);
  if (!r.ok) throw new Error("fixture invalid");
  return r;
};

describe("factory spec sheet data", () => {
  it("lists every chosen option by step, bilingual with explicit translation gaps", () => {
    const v = normalised(bagSchema, {
      ...validBag,
      quantity: 12,
      extras: ["qr_tag"],
      numbering: true,
    });
    const sheet = buildFactorySpecSheet({
      orderId: "ORD-1",
      itemId: "ITEM-1",
      schema: bagSchema,
      selection: v.selection,
    });
    expect(sheet.quantity).toBe(12);
    expect(sheet.placeholder).toBe(true);
    expect(sheet.serial).toBeNull();
    expect(sheet.sections.map((s) => s.stepId)).toEqual([
      "a1_type",
      "a2_size",
      "a3_fill",
      "a4_material",
      "a5_colour",
      "a6_branding",
      "a7_hardware",
      "a8_quantity",
      "a9_extras",
    ]);
    const rows = sheet.sections.flatMap((s) => s.rows);
    expect(rows.find((r) => r.optionId === "bag_type")?.display).toEqual({
      en: "Heavy bag (classic cylinder)",
      th: null,
    });
    expect(rows.find((r) => r.optionId === "panel_colours")?.display.en).toBe("#000000 / #C8102E");
    expect(rows.find((r) => r.optionId === "quantity")?.display.en).toBe("12 count");
    expect(sheet.qc.map((q) => q.stage)).toEqual(["cut", "sew", "print", "fill", "pack"]);
    // No Thai is invented: every gap is reported so the factory can supply it.
    expect(sheet.translationGaps).toContain("bag_type");
    expect(sheet.translationGaps).toContain("qc.sew");
    expect(rows.every((r) => r.label.th === null)).toBe(true);
  });
  it("includes forced line items", () => {
    const v = normalised(bagWallSchema, { ...validWall, mount: "ceiling_track" });
    const sheet = buildFactorySpecSheet({
      orderId: "O",
      itemId: "I",
      serial: "SCB-000001",
      schema: bagWallSchema,
      selection: v.selection,
      lineItems: v.lineItems,
    });
    expect(sheet.lineItems).toEqual([
      { id: "engineer_signoff", label: { en: "Structural engineer sign-off", th: null } },
    ]);
    expect(sheet.serial).toBe("SCB-000001");
  });
  it("uses Thai labels when the schema provides them", () => {
    const schema = structuredClone(bagSchema);
    schema.label = { en: "Custom bag", th: "กระสอบทรายสั่งทำ" };
    const v = normalised(schema, validBag);
    const sheet = buildFactorySpecSheet({
      orderId: "O",
      itemId: "I",
      schema,
      selection: v.selection,
    });
    expect(sheet.product).toEqual({ en: "Custom bag", th: "กระสอบทรายสั่งทำ" });
    expect(sheet.translationGaps).not.toContain("product");
  });
  it("refuses a selection validated against another schema version", () => {
    const v = normalised(bagSchema, validBag);
    expect(() =>
      buildFactorySpecSheet({
        orderId: "O",
        itemId: "I",
        schema: { ...bagSchema, version: "0.2.0" },
        selection: v.selection,
      }),
    ).toThrow(SpecSheetSchemaMismatchError);
  });
});

describe("config snapshot", () => {
  it("embeds a deep copy of schema, selection and quote", () => {
    const v = normalised(bagSchema, validBag);
    const q = computePrice(bagSchema, validBag, placeholderRetailPriceBook, "AUD");
    if (!q.ok) throw new Error("price failed");
    const snap = createConfigSnapshot(
      bagSchema,
      v.selection,
      q.value,
      new Date("2026-09-28T00:00:00Z"),
    );
    expect(snap).toMatchObject({
      schemaId: "bag",
      schemaVersion: "0.1.0",
      schemaFormat: 1,
      capturedAt: "2026-09-28T00:00:00.000Z",
    });
    expect(snap.schema).toEqual(bagSchema);
    expect(snap.schema).not.toBe(bagSchema);
    expect(() =>
      createConfigSnapshot({ ...bagSchema, version: "9.9.9" }, v.selection, q.value, new Date()),
    ).toThrow(SnapshotMismatchError);
  });
});
