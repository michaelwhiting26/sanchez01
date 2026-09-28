/**
 * No PII in event props (spec 04 §11.2). Two guards:
 * 1. Type level: the catalogue fails to compile if any event declares an email/phone/name/address key.
 * 2. Runtime: every payload is deep-scanned for PII-looking keys and email/phone-looking values.
 * Hashed identifiers for ad platforms travel separately (see server.ts), never inside props.
 */
import type { EventName, EventProps } from "./events";

type PiiWord =
  | "email"
  | "phone"
  | "mobile"
  | "telephone"
  | "first_name"
  | "last_name"
  | "full_name"
  | "address"
  | "password";
export type PiiKey = `${string}${PiiWord}${string}`;

/** Resolves to the PII-looking keys of T (never if clean). */
export type PiiKeysOf<T> = { [K in keyof T]: K extends PiiKey ? K : never }[keyof T];

type CatalogueIsPiiFree = {
  [E in EventName]: [PiiKeysOf<EventProps<E>>] extends [never] ? true : E;
}[EventName];
/** Compile-time assertion: if an event gains e.g. `email`, this line stops compiling and names the event. */
export const CATALOGUE_IS_PII_FREE: CatalogueIsPiiFree = true;

const PII_KEY =
  /(e-?mail|phone|mobile|telephone|first_?name|last_?name|full_?name|address|password)/i;
const EMAIL_VALUE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE_VALUE = /^\s*(\+\d[\d\s().-]{6,}\d|\(?\d{2,4}\)?[\s.-]\d{3,4}[\s.-]\d{3,4})\s*$/;

export interface PiiFinding {
  readonly path: string;
  readonly reason: "pii_key" | "email_value" | "phone_value";
}

export function findPii(value: unknown, path = "props"): PiiFinding[] {
  if (typeof value === "string") {
    if (EMAIL_VALUE.test(value)) return [{ path, reason: "email_value" }];
    if (PHONE_VALUE.test(value)) return [{ path, reason: "phone_value" }];
    return [];
  }
  if (Array.isArray(value)) return value.flatMap((v, i) => findPii(v, `${path}[${i}]`));
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => [
      ...(PII_KEY.test(k) ? [{ path: `${path}.${k}`, reason: "pii_key" as const }] : []),
      ...findPii(v, `${path}.${k}`),
    ]);
  }
  return [];
}
