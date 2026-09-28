/**
 * Seed schema: Bag Wall / Rack (spec 01 §3). PLACEHOLDER — option lists and spacing figures are
 * from the draft spec and await Jesse's confirmation. The bags on the wall are configured through
 * the bag flow (spec 01 §3 B4) and priced as separate bag items; `bag_length` here only feeds the
 * ceiling-height rule. TODO: per-station bag mixes.
 */
import type { ProductConfiguration } from "../schema";
import { choice, l } from "./helpers";

export const bagWallSchema: ProductConfiguration = {
  format: 1,
  id: "bag_wall",
  version: "0.1.0",
  productType: "bag_wall",
  label: l("Bag wall / rack"),
  placeholder: true,
  paymentMode: "deposit",
  leadTimeDays: null, // TODO(business): factory lead times per product
  steps: [
    {
      id: "b1_room",
      label: l("Room"),
      options: [
        {
          id: "room_length_m",
          kind: "number",
          label: l("Room length"),
          required: true,
          min: 1,
          max: 200,
          integer: false,
          unit: "m",
        },
        {
          id: "room_width_m",
          kind: "number",
          label: l("Room width"),
          required: true,
          min: 1,
          max: 200,
          integer: false,
          unit: "m",
        },
        {
          id: "ceiling_m",
          kind: "number",
          label: l("Ceiling height"),
          required: true,
          min: 1.8,
          max: 20,
          integer: false,
          unit: "m",
        },
        {
          id: "wall",
          kind: "choice",
          label: l("Wall construction"),
          required: true,
          choices: [
            choice("concrete", "Concrete"),
            choice("masonry_block", "Masonry block"),
            choice("steel_frame", "Steel frame"),
            choice("timber_stud", "Timber stud"),
            choice("unknown", "Unknown"),
          ],
        },
        {
          id: "ceiling_structure",
          kind: "choice",
          label: l("Ceiling structure"),
          required: true,
          choices: [
            choice("concrete_slab", "Concrete slab"),
            choice("steel_beam", "Steel beam"),
            choice("timber_joist", "Timber joist"),
            choice("suspended", "Suspended ceiling"),
            choice("unknown", "Unknown"),
          ],
        },
        {
          id: "floor",
          kind: "choice",
          label: l("Floor"),
          required: true,
          choices: [
            choice("concrete", "Concrete"),
            choice("timber", "Timber"),
            choice("rubber", "Existing rubber"),
          ],
        },
      ],
    },
    {
      id: "b2_mount",
      label: l("Mount system"),
      options: [
        {
          id: "mount",
          kind: "choice",
          label: l("Mount system"),
          required: true,
          choices: [
            choice("wall_arms", "Wall-mounted arms (one per bag)"),
            choice("ceiling_track", "Ceiling beam / track"),
            choice("gantry", "Free-standing gantry frame"),
            choice("pods", "Heavy-bag station pods"),
          ],
        },
      ],
    },
    {
      id: "b3_layout",
      label: l("Layout"),
      options: [
        // TODO: suggest a maximum from room size (spec 01 §3 B3); the upper bound is a technical cap.
        {
          id: "stations",
          kind: "number",
          label: l("Number of stations"),
          required: true,
          min: 1,
          max: 100,
          integer: true,
          unit: "count",
        },
        {
          id: "spacing",
          kind: "choice",
          label: l("Spacing"),
          required: true,
          default: "standard",
          // PLACEHOLDER spacings (spec 01 §3 B3: "P, to be confirmed with Jesse").
          choices: [
            choice("compact", "Compact 1.2 m", { attributes: { spacingM: 1.2 } }),
            choice("standard", "Standard 1.5 m", { attributes: { spacingM: 1.5 } }),
            choice("premium", "Premium 1.8 m", { attributes: { spacingM: 1.8 } }),
          ],
        },
        {
          id: "arrangement",
          kind: "choice",
          label: l("Arrangement"),
          required: true,
          choices: [
            choice("single_wall", "Single wall line"),
            choice("l_shape", "L-shape"),
            choice("facing_walls", "Two facing walls"),
            choice("centre_island", "Centre island"),
            choice("grid", "Grid"),
          ],
        },
      ],
    },
    {
      id: "b4_bags",
      label: l("Bags for the wall"),
      options: [
        {
          id: "bag_mode",
          kind: "choice",
          label: l("Bag design"),
          required: true,
          default: "one_design",
          choices: [choice("one_design", "One design for all"), choice("mix", "Mix")],
        },
        {
          id: "bag_length",
          kind: "choice",
          label: l("Longest bag"),
          required: true,
          choices: [
            choice("ft3", "3 ft", { attributes: { lengthFt: 3 } }),
            choice("ft4", "4 ft", { attributes: { lengthFt: 4 } }),
            choice("ft5", "5 ft", { attributes: { lengthFt: 5 } }),
            choice("ft6", "6 ft", { attributes: { lengthFt: 6 } }),
            choice("ft7", "7 ft", { attributes: { lengthFt: 7 } }),
          ],
        },
      ],
    },
    {
      id: "b5_finish",
      label: l("Frame finish and branding"),
      options: [
        {
          id: "frame_colour",
          kind: "choice",
          label: l("Frame colour"),
          required: true,
          default: "matte_black",
          choices: [
            choice("matte_black", "Matte black"),
            choice("gloss_black", "Gloss black"),
            choice("white", "White"),
            choice("brand_colour", "Brand colour powder coat"),
          ],
        },
        {
          id: "wall_panel",
          kind: "choice",
          label: l("Wall branding panel"),
          required: true,
          default: "none",
          choices: [
            choice("none", "None"),
            choice("printed_acoustic", "Printed acoustic panel"),
            choice("painted_mural", "Painted mural (quote)"),
            choice("backlit_sign", "Backlit logo sign"),
          ],
        },
        {
          id: "station_numbers",
          kind: "boolean",
          label: l("Station number plates"),
          required: false,
          default: false,
        },
        {
          id: "lighting",
          kind: "choice",
          label: l("Lighting"),
          required: true,
          default: "none",
          choices: [
            choice("none", "None"),
            choice("led_strip", "LED strip above rack"),
            choice("spotlights", "Spotlight per bag"),
          ],
        },
        {
          id: "matting",
          kind: "choice",
          label: l("Floor matting"),
          required: true,
          default: "none",
          choices: [
            choice("none", "None"),
            choice("rubber_tiles", "Rubber tiles under bag zone"),
            choice("branded_mat", "Branded mat"),
          ],
        },
      ],
    },
    {
      id: "b6_install",
      label: l("Install"),
      options: [
        {
          id: "install",
          kind: "choice",
          label: l("Install"),
          required: true,
          choices: [
            choice("self_install", "Self-install kit + video"),
            choice("sanchez_team", "Sanchez install team"),
            choice("partner", "Partner installer"),
          ],
        },
        { id: "opening_date", kind: "date", label: l("Opening date"), required: false },
      ],
    },
  ],
  constraints: [
    {
      rule: "ceiling_vs_bag_length",
      lengthOption: "bag_length",
      lengthFtAttribute: "lengthFt",
      ceilingOption: "ceiling_m",
      clearanceM: 0.8,
      alternative: { option: "mount", value: "wall_arms" },
    },
    {
      rule: "stud_wall_backing",
      wallOption: "wall",
      studValues: ["timber_stud"],
      unknownValues: ["unknown"],
      mountOption: "mount",
      mountValues: ["wall_arms"],
      lineItem: {
        id: "backing_plate",
        label: l("Backing plate / structural check"),
        priceKey: "line.backing_plate",
      },
    },
    {
      rule: "ceiling_mount_engineer",
      mountOption: "mount",
      mountValues: ["ceiling_track"],
      lineItem: {
        id: "engineer_signoff",
        label: l("Structural engineer sign-off"),
        priceKey: "line.engineer_signoff",
      },
    },
    {
      rule: "low_res_logo",
      minLongestSidePx: 1000,
      offer: { id: "vectorising", label: l("Logo vectorising"), priceKey: "line.vectorising" },
    },
    {
      rule: "opening_date_lead_time",
      openingDateOption: "opening_date",
      offers: [
        { id: "express_slot", label: l("Express production slot"), priceKey: "line.express_slot" },
        { id: "phased_install", label: l("Phased install"), priceKey: "line.phased_install" },
      ],
    },
  ],
  pricing: {
    base: { priceKey: "wall.base.{mount}", label: l("Bag wall system") },
    modifiers: [
      {
        id: "station",
        label: l("Station hardware"),
        priceKey: "wall.station.{mount}",
        scope: "line",
        multiplyBy: "stations",
      },
      {
        id: "frame_colour",
        label: l("Frame finish"),
        priceKey: "wall.frame.{frame_colour}",
        scope: "line",
        multiplyBy: "stations",
      },
      {
        id: "wall_panel",
        label: l("Wall branding panel"),
        priceKey: "wall.panel.{wall_panel}",
        scope: "line",
      },
      {
        id: "station_numbers",
        label: l("Station number plates"),
        priceKey: "wall.station_numbers",
        scope: "line",
        multiplyBy: "stations",
        when: { option: "station_numbers", eq: true },
      },
      { id: "lighting", label: l("Lighting"), priceKey: "wall.lighting.{lighting}", scope: "line" },
      {
        id: "matting",
        label: l("Floor matting"),
        priceKey: "wall.matting.{matting}",
        scope: "line",
        multiplyBy: "stations",
      },
      { id: "install", label: l("Install"), priceKey: "wall.install.{install}", scope: "line" },
    ],
    rangeBps: 1500,
    rounding: "half-even",
  },
};
