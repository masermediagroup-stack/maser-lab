import type { HeatmapReadStatus } from "./types";

/**
 * Reading the image. is the silhouette + pack pass only.
 * It always resolves to silence. There is no Rough read line.
 */
export function readStatusAfterPack(): HeatmapReadStatus {
  return "idle";
}
