import type { LightShapeConfig, LightUniformPayload } from "./types";
import {
  DEFAULT_LIGHT_SHAPE,
  FALLOFF_CURVE_INDEX,
  LIGHT_SHAPE_INDEX,
  idleLightPayload,
} from "./types";

/**
 * Owns light-shape uniforms. Luminance only — no color.
 */
export class LightShapeController {
  private config: LightShapeConfig;
  private payload = idleLightPayload();

  constructor(initial?: Partial<LightShapeConfig>) {
    this.config = { ...DEFAULT_LIGHT_SHAPE, ...initial };
  }

  getConfig(): Readonly<LightShapeConfig> {
    return this.config;
  }

  syncFromProps(next?: Partial<LightShapeConfig>): void {
    if (next) this.config = { ...this.config, ...next };
  }

  applyConfig(next: Partial<LightShapeConfig>): void {
    this.config = { ...this.config, ...next };
  }

  tick(_dt: number, reducedMotion: boolean): LightUniformPayload {
    const c = this.config;
    const p = this.payload;
    p.shape = LIGHT_SHAPE_INDEX[c.shape];
    p.centerX = c.centerX;
    p.centerY = c.centerY;
    p.radius = c.radius;
    p.stretchX = c.stretchX;
    p.stretchY = c.stretchY;
    p.rotation = c.rotation;
    p.coreBrightness = c.coreBrightness;
    p.edgeDarkness = c.edgeDarkness;
    p.falloff = c.falloff;
    p.falloffCurve = FALLOFF_CURVE_INDEX[c.falloffCurve];
    p.lightContrast = c.lightContrast;
    p.ditherResponse = c.ditherResponse;
    p.gradientFollowsLight = c.gradientFollowsLight ? 1 : 0;
    p.pointerFollow = reducedMotion ? 0 : c.pointerFollow;
    return p;
  }
}
