import type { HeatmapReadStatus } from "./types";
import type { DepthOutcome } from "./types";

/**
 * Reading the image. is in-flight only. It always resolves to silence.
 * Depth is gone; there is no Rough read line.
 */
export function readStatusAfterDepth(_outcome: DepthOutcome): HeatmapReadStatus {
  return "idle";
}
