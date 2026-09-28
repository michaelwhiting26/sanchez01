/** User selections and the out-of-product context the rules need (brand step, delivery, room, dates). */
import { z } from "zod";
import { HexColourSchema, IsoDateSchema } from "./schema";

export const SelectionValueSchema = z.union([
  z.string().max(500),
  z.number().finite(),
  z.boolean(),
  z.array(z.string().max(64)).max(50),
]);
export type SelectionValue = z.infer<typeof SelectionValueSchema>;

/** Raw, untrusted selection: option id → value. */
export const SelectionSchema = z.record(z.string().max(64), SelectionValueSchema);
export type Selection = z.infer<typeof SelectionSchema>;

/**
 * A selection after validation: defaults applied, hidden options stripped, values type-checked.
 * Only produced by validateSelection; tied to the exact schema id + version it was checked against.
 */
export interface NormalizedSelection {
  readonly schemaId: string;
  readonly schemaVersion: string;
  readonly values: Readonly<Record<string, SelectionValue>>;
}

export const LogoInfoSchema = z.discriminatedUnion("format", [
  z.object({ format: z.literal("vector") }).strict(),
  z
    .object({
      format: z.literal("raster"),
      widthPx: z.number().int().positive(),
      heightPx: z.number().int().positive(),
    })
    .strict(),
]);
export type LogoInfo = z.infer<typeof LogoInfoSchema>;

export const ConfigurationContextSchema = z
  .object({
    /** Today's date on the server (YYYY-MM-DD). Required by the lead-time rule. */
    today: IsoDateSchema.optional(),
    destinationCountry: z
      .string()
      .regex(/^[A-Z]{2}$/)
      .optional(),
    logo: LogoInfoSchema.optional(),
    room: z
      .object({
        lengthM: z.number().positive().max(500),
        widthM: z.number().positive().max(500),
        ceilingM: z.number().positive().max(50).optional(),
      })
      .strict()
      .optional(),
    openingDate: IsoDateSchema.optional(),
    brandColours: z
      .object({
        primary: HexColourSchema,
        secondary: HexColourSchema.optional(),
        accent: HexColourSchema.optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
export type ConfigurationContext = z.infer<typeof ConfigurationContextSchema>;
