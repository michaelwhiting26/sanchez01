/**
 * Seed schema: Bag (spec 01 §2). PLACEHOLDER — every option list, dimension and attribute below is
 * transcribed from the draft spec and awaits Jesse's confirmation. Prices live in the placeholder
 * price book, never here. Lead time unknown (null) until the factory capacity table exists.
 */
import type { ProductConfiguration } from "../schema";
import { choice, l, whenIn } from "./helpers";

const LENGTHED = ["heavy", "banana", "teardrop", "body"];

export const bagSchema: ProductConfiguration = {
  format: 1,
  id: "bag",
  version: "0.1.0",
  productType: "bag",
  label: l("Custom bag"),
  placeholder: true,
  paymentMode: "deposit",
  leadTimeDays: null, // TODO(business): factory lead times per product
  steps: [
    {
      id: "a1_type",
      label: l("Bag type"),
      options: [
        {
          id: "bag_type",
          kind: "choice",
          label: l("Bag type"),
          required: true,
          default: "heavy",
          choices: [
            choice("heavy", "Heavy bag (classic cylinder)"),
            choice("banana", "Thai / banana bag (long)"),
            choice("teardrop", "Teardrop / uppercut bag"),
            choice("angle", "Angle / wall-uppercut bag"),
            choice("body", "Body-shot / wrecking ball"),
            choice("double_end", "Double-end / speed bag"),
          ],
        },
      ],
    },
    {
      id: "a2_size",
      label: l("Size"),
      options: [
        {
          id: "length",
          kind: "choice",
          label: l("Length"),
          required: true,
          visibleWhen: whenIn("bag_type", LENGTHED),
          // lengthFt drives the ceiling rule. Target filled weights (spec 01 §2 A2) are PLACEHOLDER and omitted.
          choices: [
            choice("ft3", "3 ft", {
              attributes: { lengthFt: 3 },
              availableWhen: whenIn("bag_type", ["heavy", "teardrop"]),
            }),
            choice("ft4", "4 ft", {
              attributes: { lengthFt: 4 },
              availableWhen: whenIn("bag_type", ["heavy", "teardrop"]),
            }),
            choice("ft5", "5 ft", {
              attributes: { lengthFt: 5 },
              availableWhen: whenIn("bag_type", ["heavy", "banana"]),
            }),
            choice("ft6", "6 ft", {
              attributes: { lengthFt: 6 },
              availableWhen: whenIn("bag_type", ["banana"]),
            }),
            choice("ft7", "7 ft", {
              attributes: { lengthFt: 7 },
              availableWhen: whenIn("bag_type", ["banana"]),
            }),
            choice("standard", "Standard", { availableWhen: whenIn("bag_type", ["body"]) }),
            choice("large", "Large", { availableWhen: whenIn("bag_type", ["body"]) }),
          ],
        },
      ],
    },
    {
      id: "a3_fill",
      label: l("Fill"),
      options: [
        {
          id: "fill",
          kind: "choice",
          label: l("Fill"),
          required: true,
          visibleWhen: whenIn("bag_type", LENGTHED.concat("angle")),
          choices: [choice("filled", "Filled"), choice("unfilled", "Unfilled, filled on site")],
        },
        {
          id: "fill_type",
          kind: "choice",
          label: l("Fill type"),
          required: false,
          visibleWhen: { option: "fill", eq: "filled" },
          default: "shredded_textile",
          choices: [
            choice("shredded_textile", "Shredded textile (standard)"),
            choice("textile_soft_top", "Textile with soft top section"),
            choice("custom", "Custom (ask)"),
          ],
        },
      ],
    },
    {
      id: "a4_material",
      label: l("Material"),
      options: [
        {
          id: "material",
          kind: "choice",
          label: l("Material"),
          required: true,
          default: "vinyl",
          choices: [
            choice("vinyl", "Premium vinyl (house material)"),
            choice("leather", "Genuine leather"),
            choice("canvas", "Heavy canvas"),
          ],
        },
      ],
    },
    {
      id: "a5_colour",
      label: l("Colour layout"),
      options: [
        {
          id: "panel_layout",
          kind: "choice",
          label: l("Panel layout"),
          required: true,
          default: "single",
          choices: [
            choice("single", "Single colour"),
            choice("two_tone_vertical", "2-tone vertical split"),
            choice("two_tone_horizontal", "2-tone horizontal bands"),
            choice("three_panel", "3-panel"),
            choice("chequer", "Chequer"),
            choice("custom_patchwork", "Custom patchwork (quote)"),
          ],
        },
        {
          id: "panel_colours",
          kind: "colour_list",
          label: l("Panel colours"),
          required: true,
          minItems: 1,
          maxItems: 6,
        },
        { id: "cap_top", kind: "colour", label: l("Top cap colour"), required: false },
        { id: "cap_bottom", kind: "colour", label: l("Bottom cap colour"), required: false },
        {
          id: "stitching",
          kind: "choice",
          label: l("Stitching colour"),
          required: true,
          default: "tonal",
          choices: [
            choice("tonal", "Tonal"),
            choice("contrast", "Contrast"),
            choice("brand_accent", "Brand accent"),
          ],
        },
        {
          id: "piping",
          kind: "choice",
          label: l("Piping / trim"),
          required: true,
          default: "none",
          choices: [choice("none", "None"), choice("contrast", "Contrast")],
        },
      ],
    },
    {
      id: "a6_branding",
      label: l("Branding"),
      options: [
        {
          id: "branding_method",
          kind: "choice",
          label: l("Branding method"),
          required: true,
          default: "silicone_screen",
          choices: [
            choice("silicone_screen", "Silicone screen print (standard)"),
            choice("embroidered_patch", "Embroidered patch"),
            choice("leather_patch", "Leather patch"),
            choice("debossed_leather", "Debossed leather", {
              availableWhen: { option: "material", eq: "leather" },
            }),
          ],
        },
        {
          id: "placement",
          kind: "choice",
          label: l("Placement"),
          required: true,
          default: "front",
          choices: [
            choice("front", "Front"),
            choice("front_back", "Front + back"),
            choice("wrap_360", "360° wrap"),
            choice("top_band", "Top band"),
            choice("bottom_band", "Bottom band"),
          ],
        },
        {
          id: "logo_size",
          kind: "choice",
          label: l("Logo size"),
          required: true,
          default: "m",
          choices: [
            choice("s", "S"),
            choice("m", "M"),
            choice("l", "L"),
            choice("full_height", "Full height"),
          ],
        },
        { id: "extra_text", kind: "text", label: l("Extra text"), required: false, maxLength: 30 },
        {
          id: "numbering",
          kind: "boolean",
          label: l("Station numbering"),
          required: false,
          default: false,
        },
        {
          id: "makers_mark",
          kind: "boolean",
          label: l("Sanchez maker's mark"),
          required: true,
          default: true,
        },
      ],
    },
    {
      id: "a7_hardware",
      label: l("Hanging and hardware"),
      options: [
        {
          id: "hang",
          kind: "choice",
          label: l("Hanging"),
          required: true,
          default: "four_point_swivel",
          choices: [
            choice("four_point_swivel", "4-point chain with swivel"),
            choice("heavy_duty_swivel", "Heavy-duty swivel"),
            choice("strap", "Strap hang"),
          ],
        },
        {
          id: "anchor_ring",
          kind: "boolean",
          label: l("Bottom anchor ring"),
          required: false,
          default: false,
        },
        {
          id: "hardware_finish",
          kind: "choice",
          label: l("Hardware finish"),
          required: true,
          default: "black",
          choices: [
            choice("black", "Black"),
            choice("silver", "Silver"),
            choice("brand_colour", "Brand colour (powder coat)"),
          ],
        },
      ],
    },
    {
      id: "a8_quantity",
      label: l("Quantity"),
      options: [
        // TODO(business): "100+" and franchise orders go to quote; the upper bound is a technical cap.
        {
          id: "quantity",
          kind: "number",
          label: l("Quantity"),
          required: true,
          min: 1,
          max: 999,
          integer: true,
          unit: "count",
          default: 1,
        },
      ],
    },
    {
      id: "a9_extras",
      label: l("Extras"),
      options: [
        {
          id: "extras",
          kind: "multi_choice",
          label: l("Extras"),
          required: false,
          // Matching gloves/pads go to quote (spec 01 §2 A9) and are not priced here.
          choices: [
            choice("qr_tag", "Serial-numbered QR tag"),
            choice("protective_cover", "Protective cover"),
            choice("spare_chain_set", "Spare chain set"),
          ],
        },
      ],
    },
  ],
  constraints: [
    {
      rule: "ceiling_vs_bag_length",
      lengthOption: "length",
      lengthFtAttribute: "lengthFt",
      clearanceM: 0.8,
    },
    {
      rule: "low_res_logo",
      minLongestSidePx: 1000,
      offer: { id: "vectorising", label: l("Logo vectorising"), priceKey: "line.vectorising" },
    },
    {
      rule: "opening_date_lead_time",
      offers: [
        { id: "express_slot", label: l("Express production slot"), priceKey: "line.express_slot" },
        { id: "phased_install", label: l("Phased install"), priceKey: "line.phased_install" },
      ],
    },
    // TODO(business): confirm which destinations count as local (AU only, or also TH).
    {
      rule: "export_unfilled_default",
      fillOption: "fill",
      unfilledValue: "unfilled",
      homeCountries: ["AU"],
    },
  ],
  pricing: {
    base: { priceKey: "bag.base.{bag_type}.{length}", label: l("Bag") },
    modifiers: [
      { id: "fill", label: l("Fill"), priceKey: "bag.fill.{fill}", scope: "unit" },
      {
        id: "fill_type",
        label: l("Fill type"),
        priceKey: "bag.fill_type.{fill_type}",
        scope: "unit",
        when: { option: "fill", eq: "filled" },
      },
      { id: "material", label: l("Material"), priceKey: "bag.material.{material}", scope: "unit" },
      {
        id: "panel_layout",
        label: l("Panel layout"),
        priceKey: "bag.layout.{panel_layout}",
        scope: "unit",
      },
      { id: "piping", label: l("Piping"), priceKey: "bag.piping.{piping}", scope: "unit" },
      {
        id: "branding",
        label: l("Branding"),
        priceKey: "bag.branding.{branding_method}.{placement}",
        scope: "unit",
      },
      {
        id: "extra_text",
        label: l("Extra text"),
        priceKey: "bag.extra_text",
        scope: "unit",
        when: { option: "extra_text", present: true },
      },
      {
        id: "makers_mark_removal",
        label: l("Maker's mark removal"),
        priceKey: "bag.makers_mark_removal",
        scope: "unit",
        when: { option: "makers_mark", eq: false },
      },
      { id: "hang", label: l("Hanging"), priceKey: "bag.hang.{hang}", scope: "unit" },
      {
        id: "anchor_ring",
        label: l("Anchor ring"),
        priceKey: "bag.anchor_ring",
        scope: "unit",
        when: { option: "anchor_ring", eq: true },
      },
      {
        id: "hardware_finish",
        label: l("Hardware finish"),
        priceKey: "bag.hardware_finish.{hardware_finish}",
        scope: "unit",
      },
      { id: "extras", label: l("Extras"), priceKey: "bag.extra.{extras}", scope: "unit" },
    ],
    quantity: {
      option: "quantity",
      // PLACEHOLDER — awaiting Jesse's price list. Tier boundaries from spec 01 §2 A8; discounts 0 until real.
      tiers: [
        { minQty: 1, discountBps: 0 },
        { minQty: 2, discountBps: 0 },
        { minQty: 6, discountBps: 0 },
        { minQty: 12, discountBps: 0 },
      ],
    },
    rangeBps: 1500,
    rounding: "half-even",
  },
};
