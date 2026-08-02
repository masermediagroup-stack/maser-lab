import { DAMP_LAMBDA } from "../../constants";
import type { UniformStore } from "./UniformStore";
import type { MonochromeUniformState } from "../../types";

const DAMP_KEYS: (keyof MonochromeUniformState)[] = [
  "posterization",
  "noiseScale",
  "noiseSpeed",
  "contrast",
  "brightness",
  "gradientAngle",
  "gradientColorA",
  "gradientColorB",
  "bloom",
  "bloomRadius",
  "grainAmount",
  "pixelDensity",
  "shadowStrength",
  "highlightStrength",
  "softEdge",
  "animationSpeed",
  "cursorInfluence",
  "scrollInfluence",
  "depth",
  "lightX",
  "lightY",
  "opacity",
  "blueNoiseAmount",
  "scrollY",
];

function damp(current: number, target: number, dt: number, lambda: number): number {
  const t = 1 - Math.exp(-lambda * dt);
  return current + (target - current) * t;
}

export type AnimationLoopOptions = {
  store: UniformStore;
  onFrame: (current: MonochromeUniformState, dt: number) => void;
  /** When true, freeze time and skip pointer damp toward live targets. */
  getReducedMotion?: () => boolean;
};

/**
 * Stage 8 — motion interpolation. Owns rAF; damps targets → current.
 */
export class AnimationLoop {
  private raf = 0;
  private last = 0;
  private running = false;
  private readonly store: UniformStore;
  private readonly onFrame: AnimationLoopOptions["onFrame"];
  private readonly getReducedMotion: () => boolean;
  private timeAccumulator = 0;

  constructor(options: AnimationLoopOptions) {
    this.store = options.store;
    this.onFrame = options.onFrame;
    this.getReducedMotion = options.getReducedMotion ?? (() => false);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const tick = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.step(dt);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private step(dt: number): void {
    const { targets, current } = this.store;
    const reduced = this.getReducedMotion();

    // Discrete params snap (not interpolated) — avoids texture rebuild thrash
    current.ditherSize = targets.ditherSize;
    current.randomSeed = targets.randomSeed;

    for (const key of DAMP_KEYS) {
      const c = current[key];
      const t = targets[key];
      if (typeof c === "number" && typeof t === "number") {
        (current as Record<string, number>)[key] = damp(c, t, dt, DAMP_LAMBDA);
      }
    }

    if (!reduced) {
      this.timeAccumulator += dt * current.animationSpeed;
    }
    current.time = this.timeAccumulator;

    this.onFrame(current, dt);
  }
}
