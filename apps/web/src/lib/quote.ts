import { z } from "zod";

/** What a visitor can ask for a quote on: the range on the home page slider, plus a catch-all. Labels only; no price or lead time is implied. */
export const QUOTE_PRODUCTS = [
  { value: "gloves", label: "Gloves" },
  { value: "heavy-bag", label: "Heavy bag" },
  { value: "focus-mitts", label: "Focus mitts" },
  { value: "head-guard", label: "Head guard" },
  { value: "groin-guard", label: "Groin guard" },
  { value: "gym-fit-out", label: "Gym fit-out" },
  { value: "other", label: "Something else" },
] as const;
export type QuoteProduct = (typeof QUOTE_PRODUCTS)[number]["value"];
const PRODUCT_VALUES = QUOTE_PRODUCTS.map((p) => p.value) as [QuoteProduct, ...QuoteProduct[]];

/** An Instagram handle: letters, numbers, full stops and underscores, up to 30, with or without the @. */
const INSTAGRAM = /^@?[A-Za-z0-9._]{2,30}$/;

/** One schema for the browser and the server: the server never trusts the client's validation. */
export const quoteSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(120, "That name is too long."),
  contact: z
    .string()
    .trim()
    .min(1, "Give an email or an Instagram handle so Jesse can reply.")
    .max(254, "That is too long.")
    .refine((v) => z.email().safeParse(v).success || INSTAGRAM.test(v), "That does not look like an email or an Instagram handle."),
  product: z.enum(PRODUCT_VALUES, "Choose a product."),
  details: z.string().trim().min(1, "Tell us what you want made.").max(4000, "Please keep it under 4,000 characters."),
  /** Honeypot: real people never fill this hidden field. */
  company: z.string().max(0).optional(),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type QuoteField = "name" | "contact" | "product" | "details";
export type QuoteResult = { ok: true } | { ok: false; message: string; field?: QuoteField };
