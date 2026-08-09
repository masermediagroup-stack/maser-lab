import type { DitherConfig, DitherUniformPayload } from "./types";
import {
  DEFAULT_DITHER_CONFIG,
  DITHER_ALGORITHM_INDEX,
  idleDitherPayload,
} from "./types";

/**
 * Owns dither algorithm uniforms. Pattern scale ≠ matrix size ≠ render density.
 */
export class DitherController {
  private config: DitherConfig;
  private payload = idleDitherPayload();

  constructor(initial?: Partial<DitherConfig>) {
    this.config = { ...DEFAULT_DITHER_CONFIG, ...initial };
  }

  getConfig(): Readonly<DitherConfig> {
    return this.config;
  }

  syncFromProps(next?: Partial<DitherConfig>): void {
    if (next) this.config = { ...this.config, ...next };
  }

  applyConfig(next: Partial<DitherConfig>): void {
    this.config = { ...this.config, ...next };
  }

  tick(): DitherUniformPayload {
    const c = this.config;
    const p = this.payload;
    p.algorithm = DITHER_ALGORITHM_INDEX[c.algorithm];
    p.matrixSize = c.matrixSize;
    p.patternScale = c.patternScale;
    p.thresholdBias = c.thresholdBias;
    p.invertResponse = c.invertResponse ? 1 : 0;
    p.temporalDrift = c.temporalDrift;
    p.distribution = c.distribution;
    p.clusterSize = c.clusterSize;
    p.dotRoundness = c.dotRoundness;
    p.angle = c.angle;
    p.coverage = c.coverage;
    p.cellSize = c.cellSize;
    p.lineWidth = c.lineWidth;
    p.spacing = c.spacing;
    p.waveDistortion = c.waveDistortion;
    p.lineCount = c.lineCount;
    p.angleSeparation = c.angleSeparation;
    p.roughness = c.roughness;
    p.secondary = c.secondary;
    p.blendAmount = c.blendAmount;
    return p;
  }
}
