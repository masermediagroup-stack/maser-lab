import { ModeBlender } from "./ModeBlender";
import { Timeline } from "./Timeline";
import type {
  AnimationEngineConfig,
  AnimationModeId,
  AnimationModeParams,
  AnimationUniformPayload,
  TimelineState,
} from "./types";
import { DEFAULT_ANIMATION_CONFIG } from "./types";
import { defaultModeParams, getAnimationMode } from "./modes/catalog";

/**
 * Owns timeline + mode blending. Emits GPU-ready animation uniforms each frame.
 * Layers (ambient / distortion / interaction / lighting) compose in the shader;
 * this controller only supplies time + mode payloads.
 */
export class ProceduralAnimationController {
  private timeline: Timeline;
  private blender: ModeBlender;
  private config: AnimationEngineConfig;
  private lastRestartToken = 0;

  constructor(initial?: Partial<AnimationEngineConfig>) {
    const modeId = initial?.modeId ?? DEFAULT_ANIMATION_CONFIG.modeId;
    const modeParams = {
      ...defaultModeParams(modeId),
      ...initial?.modeParams,
    };
    this.config = {
      ...DEFAULT_ANIMATION_CONFIG,
      ...initial,
      modeId,
      modeParams,
      timeline: {
        ...DEFAULT_ANIMATION_CONFIG.timeline,
        ...initial?.timeline,
      },
    };
    this.lastRestartToken = this.config.restartToken ?? 0;
    this.timeline = new Timeline(this.config.timeline);
    this.blender = new ModeBlender(
      this.config.modeId,
      this.config.blendDuration,
    );
    this.blender.setActiveParams(this.config.modeParams);
  }

  getConfig(): Readonly<AnimationEngineConfig> {
    return this.config;
  }

  getTimeline(): Readonly<TimelineState> {
    return this.timeline.getState();
  }

  getTime(): number {
    return this.timeline.getTime();
  }

  setMode(modeId: AnimationModeId, params?: AnimationModeParams): void {
    const merged = {
      ...defaultModeParams(modeId),
      ...params,
    };
    this.config = {
      ...this.config,
      modeId,
      modeParams: merged,
    };
    this.blender.requestMode(modeId, merged);
  }

  setModeParams(params: AnimationModeParams): void {
    this.config = {
      ...this.config,
      modeParams: { ...this.config.modeParams, ...params },
    };
    this.blender.setActiveParams(this.config.modeParams);
  }

  setBlendDuration(seconds: number): void {
    this.config = { ...this.config, blendDuration: Math.max(0.05, seconds) };
    this.blender.setBlendDuration(this.config.blendDuration);
  }

  patchTimeline(partial: Partial<TimelineState>): void {
    this.timeline.patch(partial);
    this.config = {
      ...this.config,
      timeline: { ...this.timeline.getState() },
    };
  }

  restart(): void {
    this.timeline.restart();
  }

  togglePlay(): void {
    this.timeline.togglePlay();
    this.config = {
      ...this.config,
      timeline: { ...this.timeline.getState() },
    };
  }

  toggleReverse(): void {
    this.timeline.toggleReverse();
    this.config = {
      ...this.config,
      timeline: { ...this.timeline.getState() },
    };
  }

  applyConfig(next: Partial<AnimationEngineConfig>): void {
    if (next.blendDuration !== undefined) {
      this.setBlendDuration(next.blendDuration);
    }
    if (next.timeline) {
      this.patchTimeline(next.timeline);
    }
    if (next.modeId !== undefined && next.modeId !== this.config.modeId) {
      this.setMode(next.modeId, next.modeParams);
    } else if (next.modeParams) {
      this.setModeParams(next.modeParams);
    }
    if (
      next.restartToken !== undefined &&
      next.restartToken !== this.lastRestartToken
    ) {
      this.lastRestartToken = next.restartToken;
      this.timeline.restart();
      this.config = { ...this.config, restartToken: next.restartToken };
    }
  }

  /** Sync from React props without restarting mid-blend unless mode changed. */
  syncFromProps(next: Partial<AnimationEngineConfig>): void {
    this.applyConfig(next);
  }

  tick(dtSeconds: number, reducedMotion = false): AnimationUniformPayload {
    const time = reducedMotion
      ? this.timeline.getTime()
      : this.timeline.tick(dtSeconds);
    const snap = this.blender.tick(reducedMotion ? 0 : dtSeconds);
    this.config = {
      ...this.config,
      timeline: { ...this.timeline.getState() },
      modeId: this.blender.getCurrentMode(),
    };

    return {
      time,
      modeA: getAnimationMode(snap.modeA).index,
      modeB: getAnimationMode(snap.modeB).index,
      blend: snap.blend,
      paramsA0: snap.paramsA0,
      paramsA1: snap.paramsA1,
      paramsB0: snap.paramsB0,
      paramsB1: snap.paramsB1,
    };
  }
}
