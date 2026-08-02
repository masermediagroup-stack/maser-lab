import type { ColorMaterialConfig, ColorUniformPayload } from "./types";
import {
  BEHAVIOR_INDEX,
  BLEND_MODE_INDEX,
  COLOR_SLOT_ORDER,
  DEFAULT_COLOR_MATERIAL,
  GRADIENT_BEHAVIOR_INDEX,
  GRADIENT_MODE_INDEX,
  idleColorPayload,
} from "./types";
import { getBehavior } from "./behaviors";

/**
 * Owns color/gradient/blend/behavior uniforms.
 * Emits GPU payload each frame — no React involvement.
 */
export class ColorMaterialController {
  private config: ColorMaterialConfig;
  private payload = idleColorPayload();

  constructor(initial?: Partial<ColorMaterialConfig>) {
    this.config = this.merge(DEFAULT_COLOR_MATERIAL, initial);
  }

  getConfig(): Readonly<ColorMaterialConfig> {
    return this.config;
  }

  syncFromProps(next?: Partial<ColorMaterialConfig>): void {
    if (next) this.config = this.merge(this.config, next);
  }

  applyConfig(next: Partial<ColorMaterialConfig>): void {
    this.config = this.merge(this.config, next);
  }

  tick(_dt: number, reducedMotion: boolean): ColorUniformPayload {
    const cfg = this.config;
    const p = this.payload;
    const behavior = getBehavior(cfg.behavior);

    p.colorEnabled = cfg.colorEnabled ? 1 : 0;
    p.gradientMode = GRADIENT_MODE_INDEX[cfg.gradientMode];
    p.gradientBehavior = reducedMotion
      ? 0
      : GRADIENT_BEHAVIOR_INDEX[cfg.gradientBehavior];
    p.gradientSpeed = reducedMotion
      ? 0
      : cfg.gradientSpeed * (behavior.gradientSpeedMul ?? 1);
    p.gradientOffset = cfg.gradientOffset;
    p.blendMode = BLEND_MODE_INDEX[cfg.blendMode];
    p.behavior = BEHAVIOR_INDEX[cfg.behavior];

    const props = { ...cfg.properties, ...behavior.properties };
    p.exposure = props.exposure;
    p.gamma = props.gamma;
    p.threshold = props.threshold;
    p.density = props.density;
    p.sharpness = props.sharpness;
    p.smoothness = props.smoothness;
    p.blur = props.blur;
    p.materialWeight = props.materialWeight;
    p.lightScatter = props.lightScatter;

    let i = 0;
    for (const key of COLOR_SLOT_ORDER) {
      const c = cfg.colors[key];
      p.colors[i++] = c.r;
      p.colors[i++] = c.g;
      p.colors[i++] = c.b;
    }

    return p;
  }

  private merge(
    base: ColorMaterialConfig,
    partial?: Partial<ColorMaterialConfig>,
  ): ColorMaterialConfig {
    if (!partial) {
      return {
        ...base,
        colors: { ...base.colors },
        properties: { ...base.properties },
      };
    }
    return {
      ...base,
      ...partial,
      colors: { ...base.colors, ...partial.colors },
      properties: { ...base.properties, ...partial.properties },
    };
  }
}
