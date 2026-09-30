import { z } from "zod";

/** Five lines the email field types for itself, built on being first and not missing out. No numbers or claims (evidence rule). */
export const WAITLIST_LINES = [
  "Be first. Everyone else waits.",
  "Your name on the first drop.",
  "Something’s coming. You’ll know first.",
  "Early access goes to the list.",
  "Don’t be the one who missed it.",
] as const;

export const WAITLIST_METHODS = ["email", "gmail", "other"] as const;
export type WaitlistMethod = (typeof WAITLIST_METHODS)[number];

const GMAIL = /@(gmail|googlemail)\.com$/i;

/** One schema for the browser and the server: the server never trusts the client's validation. */
export const waitlistSchema = z
  .object({
    email: z.string().trim().max(254).pipe(z.email()),
    method: z.enum(WAITLIST_METHODS).default("email"),
    /** Honeypot: real people never fill this hidden field. */
    company: z.string().max(0).optional(),
  })
  .refine((v) => v.method !== "gmail" || GMAIL.test(v.email), { path: ["email"], message: "Use your Gmail address." });

export type WaitlistInput = z.infer<typeof waitlistSchema>;

export type WaitlistResult = { ok: true } | { ok: false; message: string };
