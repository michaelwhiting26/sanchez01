import { BagConfigSchema, type BagConfig } from "./schema";
import { CURRENCIES, type Currency } from "../commerce/money";
import type { StepId } from "./steps";

/** A build in progress: saved on this device as you go, and shareable as a link. Everything read back is validated again. */
export const SAVE_KEY = "sanchez-build-v1";

export interface SavedBuild {
  cfg: BagConfig;
  currency: Currency;
  step: number;
  answered: StepId[];
  skipped: StepId[];
  savedAt: string;
}

export function encodeShare(cfg: BagConfig, currency: Currency): string {
  return btoa(encodeURIComponent(JSON.stringify({ cfg, currency })));
}

export function decodeShare(hash: string): { cfg: BagConfig; currency: Currency } | null {
  try {
    const raw = JSON.parse(decodeURIComponent(atob(hash))) as { cfg?: unknown; currency?: unknown };
    const cfg = BagConfigSchema.safeParse(raw.cfg);
    const currency = (CURRENCIES as readonly unknown[]).includes(raw.currency) ? (raw.currency as Currency) : "AUD";
    return cfg.success ? { cfg: cfg.data, currency } : null;
  } catch {
    return null;
  }
}

export function loadSaved(): SavedBuild | null {
  try {
    const raw = JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "null") as Partial<SavedBuild> | null;
    const cfg = BagConfigSchema.safeParse(raw?.cfg);
    if (!raw || !cfg.success) return null;
    return { cfg: cfg.data, currency: (CURRENCIES as readonly unknown[]).includes(raw.currency) ? (raw.currency as Currency) : "AUD", step: Number(raw.step) || 0, answered: raw.answered ?? [], skipped: raw.skipped ?? [], savedAt: raw.savedAt ?? "" };
  } catch {
    return null;
  }
}

export function store(b: SavedBuild): void {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(b));
  } catch {
    /* private mode: the build simply is not remembered */
  }
}

export function clearSaved(): void {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}
