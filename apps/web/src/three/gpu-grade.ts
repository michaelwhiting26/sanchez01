import type { TierResult } from "detect-gpu";

/** Where the benchmark tables are served from: a copy of `detect-gpu/dist/benchmarks` in `public/`, so no visitor calls a third-party server. */
export const GPU_BENCHMARKS_URL = "/assets/detect-gpu";

/**
 * The quality level the store starts on, before a single frame has been timed. Only a chip the tables positively name as slow (under 30 frames
 * a second) starts reduced. A chip the tables cannot identify starts full: quality is never taken away on a guess. LODController's frame timing
 * corrects the level either way once the scene is running.
 */
export function startingQuality(result: Pick<TierResult, "tier" | "type">): 0 | 1 {
  const identified = result.type === "BENCHMARK" || result.type === "BLOCKLISTED";
  return identified && result.tier <= 1 ? 1 : 0;
}
