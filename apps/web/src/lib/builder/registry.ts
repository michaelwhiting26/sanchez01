import { GLOVE_PRODUCT } from "../gloves/schema";
import { GROINGUARD_PRODUCT } from "../groinguard/schema";
import { HEADGUARD_PRODUCT } from "../headguard/schema";
import type { BuilderProduct } from "./product";

/** The products that have a panel builder, by their address (`/build/<slug>`). */
export const BUILDER_PRODUCTS: Readonly<Record<string, BuilderProduct>> = { gloves: GLOVE_PRODUCT, "head-guard": HEADGUARD_PRODUCT, "groin-guard": GROINGUARD_PRODUCT };
export const builderFor = (slug: string): BuilderProduct | null => BUILDER_PRODUCTS[slug] ?? null;
