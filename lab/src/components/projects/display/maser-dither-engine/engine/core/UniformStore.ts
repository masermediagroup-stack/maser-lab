import { MONOCHROME_DEFAULTS } from "../../constants";
import type { MonochromeParams, MonochromeUniformState } from "../../types";

function createState(
  partial?: Partial<MonochromeParams>,
): MonochromeUniformState {
  return {
    ...MONOCHROME_DEFAULTS,
    ...partial,
    time: 0,
    pointerX: 0.5,
    pointerY: 0.5,
    scrollY: 0,
    resolutionX: 1,
    resolutionY: 1,
    dpr: 1,
  };
}

/**
 * Dual-buffer material state: React / UI writes targets;
 * AnimationLoop damps current toward targets (no React involvement).
 */
export class UniformStore {
  readonly targets: MonochromeUniformState;
  readonly current: MonochromeUniformState;

  constructor(initial?: Partial<MonochromeParams>) {
    this.targets = createState(initial);
    this.current = createState(initial);
  }

  setParams(partial: Partial<MonochromeParams>): void {
    Object.assign(this.targets, partial);
  }

  setPointer(x: number, y: number): void {
    this.targets.pointerX = x;
    this.targets.pointerY = y;
  }

  setScroll(y: number): void {
    this.targets.scrollY = y;
  }

  setResolution(width: number, height: number, dpr: number): void {
    this.targets.resolutionX = width;
    this.targets.resolutionY = height;
    this.targets.dpr = dpr;
    this.current.resolutionX = width;
    this.current.resolutionY = height;
    this.current.dpr = dpr;
  }

  snapCurrentToTargets(): void {
    Object.assign(this.current, this.targets);
  }
}
