import type {
  EngineMaterialId,
  MaterialEngineConfig,
  MaterialLayer,
  MaterialSpecificParams,
  MaterialUniformPayload,
} from "./types";
import {
  DEFAULT_MATERIAL_CONFIG,
  DEFAULT_MATERIAL_PARAMS,
  createDefaultLayers,
  idleMaterialPayload,
} from "./types";
import { applyMaterialDefaults } from "./catalog";
import { packMaterialUniforms } from "./pack";

/**
 * Owns procedural material uniforms. Structure ≠ palette.
 */
export class MaterialController {
  private config: MaterialEngineConfig;
  private payload = idleMaterialPayload();

  constructor(initial?: Partial<MaterialEngineConfig>) {
    this.config = this.merge(DEFAULT_MATERIAL_CONFIG, initial);
  }

  getConfig(): Readonly<MaterialEngineConfig> {
    return this.config;
  }

  syncFromProps(next?: Partial<MaterialEngineConfig>): void {
    if (!next) return;
    this.config = this.merge(this.config, next);
  }

  setMaterialId(id: EngineMaterialId): void {
    const params = {
      ...DEFAULT_MATERIAL_PARAMS,
      ...applyMaterialDefaults(id),
      ...this.pickShared(this.config.params),
    };
    this.config = {
      materialId: id,
      params,
      layers: createDefaultLayers(id),
      lowQuality: this.config.lowQuality,
    };
  }

  setParams(partial: Partial<MaterialSpecificParams>): void {
    this.config = {
      ...this.config,
      params: { ...this.config.params, ...partial },
    };
  }

  setLayers(layers: MaterialLayer[]): void {
    this.config = { ...this.config, layers };
  }

  setLowQuality(lowQuality: boolean): void {
    this.config = { ...this.config, lowQuality };
  }

  tick(reducedMotion: boolean): MaterialUniformPayload {
    const c = this.config;
    let params = c.params;
    // Accessibility: mute CRT flicker under reduced motion
    if (reducedMotion && c.materialId === "crt" && params.flicker > 0) {
      params = { ...params, flicker: 0 };
    }
    const packed = packMaterialUniforms(
      c.materialId,
      params,
      c.layers,
      c.lowQuality,
    );
    // Mute structure when structure layer bypassed
    const structLayer = c.layers.find((l) => l.id === "structure");
    if (structLayer && (structLayer.bypass || !structLayer.enabled)) {
      packed.structureAmount = 0;
    }
    Object.assign(this.payload, packed);
    return this.payload;
  }

  private pickShared(
    params: MaterialSpecificParams,
  ): Partial<MaterialSpecificParams> {
    return {
      interactionResponse: params.interactionResponse,
    };
  }

  private merge(
    base: MaterialEngineConfig,
    patch?: Partial<MaterialEngineConfig>,
  ): MaterialEngineConfig {
    if (!patch) return { ...base, params: { ...base.params }, layers: [...base.layers] };
    const materialId = patch.materialId ?? base.materialId;
    const switching = patch.materialId && patch.materialId !== base.materialId;
    const params = switching
      ? {
          ...DEFAULT_MATERIAL_PARAMS,
          ...applyMaterialDefaults(materialId),
          ...patch.params,
          interactionResponse:
            patch.params?.interactionResponse ??
            base.params.interactionResponse,
        }
      : { ...base.params, ...patch.params };
    const layers =
      patch.layers ??
      (switching ? createDefaultLayers(materialId) : [...base.layers]);
    return {
      materialId,
      params,
      layers,
      lowQuality: patch.lowQuality ?? base.lowQuality,
    };
  }
}
