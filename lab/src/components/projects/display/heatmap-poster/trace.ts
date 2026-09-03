/** Temporary pipeline probe. Kept until upload→paint is proven in preview. */
export function heatmapTrace(stage: string, detail?: Record<string, unknown>): void {
  const payload = { t: Date.now(), stage, ...(detail ?? {}) };
  if (typeof window !== "undefined") {
    const w = window as Window & { __heatmapTrace?: unknown[] };
    w.__heatmapTrace = [...(w.__heatmapTrace ?? []), payload].slice(-48);
  }
  console.info(`[heatmap] ${stage}`, detail ?? "");
}
