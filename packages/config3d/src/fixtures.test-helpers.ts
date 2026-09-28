/** Shared test fixtures (not exported from the package). */
import type { Selection } from "./selection";

export const validBag: Selection = {
  bag_type: "heavy",
  length: "ft5",
  fill: "filled",
  panel_colours: ["#000000", "#c8102e"],
};

export const validWall: Selection = {
  room_length_m: 12,
  room_width_m: 8,
  ceiling_m: 3.2,
  wall: "concrete",
  ceiling_structure: "concrete_slab",
  floor: "concrete",
  mount: "wall_arms",
  stations: 12,
  arrangement: "l_shape",
  bag_length: "ft5",
  install: "sanchez_team",
};

export const validRing: Selection = {
  size: "ft18",
  platform_height: "m0_5",
  apron: "m0_75",
  steps: "two_sets",
  rope_colours: ["#C8102E", "#FFFFFF", "#FFFFFF", "#C8102E"],
  canvas_colour: "#1A1A1A",
  padding: "mm40",
  skirt_colour: "#000000",
  install: "sanchez_team",
  room_length_m: 12,
  room_width_m: 12,
};
