"use client";

import { useSyncExternalStore } from "react";
import type { PerformanceStore } from "../lib/performance-store";
import { QUALITY_PROFILES } from "../lib/transition-utils";

/**
 * Subscribes straight to the perf store, so the ~2 Hz telemetry updates
 * re-render this readout and nothing else.
 */
export function PerformanceReadout({ store }: { store: PerformanceStore }) {
  const sample = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  const rows: [string, string][] = [
    ["FPS", sample.looping ? String(sample.fps) : "idle"],
    ["DPR", sample.dpr.toFixed(2)],
    ["Buffer", `${sample.renderWidth} × ${sample.renderHeight}`],
    ["Quality", QUALITY_PROFILES[sample.quality].label],
    ["Phase", sample.phase],
    ["Loop", sample.looping ? "running" : "paused"],
  ];

  return (
    <dl className="tgt-perf">
      {rows.map(([label, value]) => (
        <div key={label} className="tgt-perf__row">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
