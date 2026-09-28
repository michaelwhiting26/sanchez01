/**
 * 3D material-mapping interface (spec 04 §6.1: one GLB per product family with named material slots).
 * TYPES ONLY. The future React Three Fiber layer implements a resolver against these; this package
 * must never import three.js.
 */

/** Known slot names from the spec; product GLBs may add more (string & {} keeps autocomplete). */
export type KnownMaterialSlot =
  | "panel_left"
  | "panel_right"
  | "panel_top"
  | "panel_bottom"
  | "stitch"
  | "piping"
  | "cap_top"
  | "cap_bottom"
  | "logo_decal"
  | "hardware"
  | "rope"
  | "corner_pad"
  | "canvas"
  | "apron_skirt"
  | "post"
  | "frame";
export type MaterialSlotName = KnownMaterialSlot | (string & {});

/** Renderer-agnostic material parameters (mapped to MeshStandardMaterial or similar by the 3D layer). */
export interface MaterialParams {
  readonly baseColorHex?: string;
  readonly roughness?: number;
  readonly metalness?: number;
  /** KTX2 texture set id on the CDN (e.g. "leather_grain_01"). */
  readonly textureSet?: string;
  readonly normalScale?: number;
}

export type SlotBinding =
  /** The option's value is a colour (or colour list, distributed over `slots` in order). */
  | {
      readonly kind: "colour";
      readonly optionId: string;
      readonly slots: readonly MaterialSlotName[];
    }
  /** Each choice value maps to material params for the given slots. */
  | {
      readonly kind: "choice";
      readonly optionId: string;
      readonly slots: readonly MaterialSlotName[];
      readonly byValue: Readonly<Record<string, MaterialParams>>;
    }
  /** Toggle slot visibility (e.g. anchor ring on/off). */
  | {
      readonly kind: "visibility";
      readonly optionId: string;
      readonly slots: readonly MaterialSlotName[];
      readonly visibleWhenValue: string | boolean;
    }
  /** Decal driven by the brand logo (context), placed per a placement option. */
  | { readonly kind: "decal"; readonly placementOptionId: string; readonly slot: MaterialSlotName };

export interface MaterialSlotMap {
  readonly schemaId: string;
  /** Semver range of schema versions this map supports, e.g. "^1.0.0". */
  readonly schemaVersionRange: string;
  /** GLB asset reference (hashed CDN path). */
  readonly glb: string;
  readonly bindings: readonly SlotBinding[];
}

/** What a resolver hands the renderer: final params per slot. */
export type ResolvedMaterials = Readonly<
  Record<MaterialSlotName, MaterialParams & { readonly visible?: boolean }>
>;

/** Contract for the 3D layer's resolver (implemented outside this package). */
export type MaterialResolver = (
  map: MaterialSlotMap,
  values: Readonly<Record<string, string | number | boolean | readonly string[]>>,
) => ResolvedMaterials;
