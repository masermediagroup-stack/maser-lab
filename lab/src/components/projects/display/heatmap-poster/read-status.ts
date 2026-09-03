import type { HeatmapReadStatus } from "./types";
import type { DepthOutcome } from "./types";

/**
 * Reading the image. is in-flight only. It always resolves:
 * silence (unavailable / discarded / ok) or the rough-read line (model error).
 */
export function readStatusAfterDepth(outcome: DepthOutcome): HeatmapReadStatus {
  if (outcome === "error") return "rough-read";
  return "idle";
}
