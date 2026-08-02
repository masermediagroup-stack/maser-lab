/**
 * Pack material-specific params into GPU vec4 slots by material id.
 * Slot meaning depends on material — UI never exposes unused slots.
 */

import type {
  EngineMaterialId,
  MaterialLayer,
  MaterialSpecificParams,
  MaterialUniformPayload,
} from "./types";
import { MATERIAL_INDEX } from "./types";

export function computeLayerBits(layers: MaterialLayer[]): number {
  let bits = 0;
  const hasSolo = layers.some((l) => l.solo && l.enabled && !l.bypass);
  layers.forEach((layer, i) => {
    if (i >= 16) return;
    const active = hasSolo
      ? layer.solo && layer.enabled && !layer.bypass
      : layer.enabled && !layer.bypass;
    if (active) bits |= 1 << i;
  });
  return bits || 0xffff;
}

export function packMaterialUniforms(
  materialId: EngineMaterialId,
  params: MaterialSpecificParams,
  layers: MaterialLayer[],
  lowQuality: boolean,
): MaterialUniformPayload {
  const p = params;
  let p0: [number, number, number, number] = [0, 0, 0, 0];
  let p1: [number, number, number, number] = [0, 0, 0, 0];
  const p2: [number, number, number, number] = [0, 0, 0, 0];
  const p3: [number, number, number, number] = [0, 0, 0, 0];

  switch (materialId) {
    case "paper":
      p0 = [p.fiberDensity, p.fiberDirection, p.surfaceGrain, p.absorption];
      p1 = [p.edgeBleed, p.paperWarmth, 0, 0];
      break;
    case "ink":
      p0 = [p.inkSpread, p.wetness, p.bleed, p.edgePooling];
      p1 = [p.smear, p.density, 0, 0];
      break;
    case "velvet":
      p0 = [p.napDirection, p.sheenWidth, p.sheenIntensity, p.fiberSoftness];
      p1 = [p.shadowDepth, 0, 0, 0];
      break;
    case "metal":
      p0 = [p.roughness, p.reflectivity, p.brushedDirection, p.anisotropy];
      p1 = [p.oxidation, p.scratches, 0, 0];
      break;
    case "smoke":
      p0 = [p.curl, p.dissipation, p.turbulence, p.drift];
      p1 = [p.expansion, p.density, p.softness, 0];
      break;
    case "fog":
      p0 = [p.diffusion, p.density, p.softness, p.drift];
      p1 = [p.visibilityThreshold, 0, 0, 0];
      break;
    case "cloud":
      p0 = [p.formationScale, p.density, p.billow, p.edgeBreakup];
      p1 = [p.layerCount, p.softness, 0, 0];
      break;
    case "glass":
      p0 = [p.refraction, p.frost, p.clarity, p.edgeThickness];
      p1 = [p.tintAmount, p.softness, 0, 0];
      break;
    case "chrome":
      p0 = [p.reflectionBanding, p.highlightWidth, p.curvature, p.edgeBrightness];
      p1 = [p.reflectivity, p.tintAmount, 0, 0];
      break;
    case "crt":
      p0 = [p.scanlineDensity, p.phosphorMask, p.flicker, p.crtCurvature];
      p1 = [p.chromaticSep, p.signalNoise, 0, 0];
      break;
    default:
      break;
  }

  return {
    materialId: MATERIAL_INDEX[materialId],
    structureAmount: p.structureAmount,
    interactionResponse: p.interactionResponse,
    lowQuality: lowQuality ? 1 : 0,
    p0,
    p1,
    p2,
    p3,
    layerBits: computeLayerBits(layers),
  };
}
