import type { PerformanceSample } from "./transition-types";

const EMPTY: PerformanceSample = {
  fps: 0,
  dpr: 1,
  renderWidth: 0,
  renderHeight: 0,
  quality: "balanced",
  phase: "idle",
  looping: false,
};

/**
 * External store for the FPS readout.
 *
 * The animation loop writes here at most a few times a second and only the
 * readout subscribes, so per-frame telemetry never re-renders the lab, the
 * controls, or the preview.
 */
export class PerformanceStore {
  private snapshot: PerformanceSample = EMPTY;
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  getServerSnapshot = () => EMPTY;

  publish(next: Partial<PerformanceSample>) {
    const merged = { ...this.snapshot, ...next };
    const changed = (Object.keys(merged) as (keyof PerformanceSample)[]).some(
      (key) => merged[key] !== this.snapshot[key],
    );
    if (!changed) return;
    this.snapshot = merged;
    for (const listener of this.listeners) listener();
  }
}
