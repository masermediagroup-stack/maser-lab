import type { AnimationModeId, AnimationModeParams } from "./types";
import {
  defaultModeParams,
  getAnimationMode,
  packModeParams,
} from "./modes/catalog";

export type ModeBlendSnapshot = {
  modeA: AnimationModeId;
  modeB: AnimationModeId;
  blend: number;
  paramsA0: [number, number, number, number];
  paramsA1: [number, number, number, number];
  paramsB0: [number, number, number, number];
  paramsB1: [number, number, number, number];
};

/**
 * Crossfades between animation modes over `blendDuration` seconds.
 * Target swaps into the incoming slot; blend eases 0→1 with smoothstep.
 */
export class ModeBlender {
  private current: AnimationModeId;
  private incoming: AnimationModeId;
  private blend = 1;
  private duration: number;
  private paramsA: AnimationModeParams;
  private paramsB: AnimationModeParams;

  constructor(mode: AnimationModeId, blendDuration: number) {
    this.current = mode;
    this.incoming = mode;
    this.duration = Math.max(0.05, blendDuration);
    this.paramsA = defaultModeParams(mode);
    this.paramsB = { ...this.paramsA };
  }

  getCurrentMode(): AnimationModeId {
    return this.blend >= 1 ? this.incoming : this.current;
  }

  getIncomingMode(): AnimationModeId {
    return this.incoming;
  }

  getBlend(): number {
    return this.blend;
  }

  setBlendDuration(seconds: number): void {
    this.duration = Math.max(0.05, seconds);
  }

  setActiveParams(params: AnimationModeParams): void {
    const mode = this.incoming;
    const merged = { ...defaultModeParams(mode), ...params };
    if (this.blend >= 1) {
      this.paramsA = merged;
      this.paramsB = merged;
      this.current = mode;
    } else {
      this.paramsB = merged;
    }
  }

  requestMode(next: AnimationModeId, params?: AnimationModeParams): void {
    if (next === this.incoming && this.blend >= 1) {
      if (params) this.setActiveParams(params);
      return;
    }
    // Mid-blend retarget: promote incoming to current at current mix.
    this.current = this.incoming;
    this.paramsA = this.paramsB;
    this.incoming = next;
    this.paramsB = {
      ...defaultModeParams(next),
      ...params,
    };
    this.blend = 0;
    void getAnimationMode(next);
  }

  tick(dtSeconds: number): ModeBlendSnapshot {
    if (this.blend < 1) {
      this.blend = Math.min(1, this.blend + dtSeconds / this.duration);
      if (this.blend >= 1) {
        this.current = this.incoming;
        this.paramsA = this.paramsB;
      }
    }

    const packedA = packModeParams(this.current, this.paramsA);
    const packedB = packModeParams(this.incoming, this.paramsB);

    return {
      modeA: this.current,
      modeB: this.incoming,
      blend: this.smoothstep(this.blend),
      paramsA0: packedA.p0,
      paramsA1: packedA.p1,
      paramsB0: packedB.p0,
      paramsB1: packedB.p1,
    };
  }

  private smoothstep(t: number): number {
    const x = Math.min(1, Math.max(0, t));
    return x * x * (3 - 2 * x);
  }
}
