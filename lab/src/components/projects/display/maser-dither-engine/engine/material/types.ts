/**
 * Sprint 6 — Procedural material architecture.
 * Materials are recipes + structure, not palette aliases.
 */

import type { BlendModeId } from "../color/types";
import type { AnimationModeId } from "../animation/types";
import type { DitherAlgorithmId } from "../dither/types";
import type { ComponentId } from "../../types";

/** Core procedural material IDs (Sprint 6). */
export type ProceduralMaterialId =
  | "paper"
  | "ink"
  | "velvet"
  | "metal"
  | "smoke"
  | "fog"
  | "cloud"
  | "glass"
  | "chrome"
  | "crt";

/** Neutral / legacy + procedural. */
export type EngineMaterialId = "monochrome" | ProceduralMaterialId;

export type MaterialFamilyId =
  | "print"
  | "soft-surface"
  | "hard-surface"
  | "atmospheric"
  | "digital";

export type PerformanceTier = "lightweight" | "standard" | "advanced";

export type CompatibilityTag = "recommended" | "compatible" | "experimental";

export type MaterialLayerType =
  | "solid"
  | "gradient"
  | "noise"
  | "grain"
  | "fiber"
  | "lines"
  | "dither"
  | "light"
  | "bloom"
  | "edge"
  | "vignette"
  | "distortion"
  | "mask"
  | "interaction"
  | "scanline"
  | "texture";

export type MaterialLayer = {
  id: string;
  type: MaterialLayerType;
  label: string;
  enabled: boolean;
  opacity: number;
  blendMode: BlendModeId;
  solo: boolean;
  bypass: boolean;
};

/** Material-owned params — UI shows only keys listed in definition.supportedControls. */
export type MaterialSpecificParams = {
  fiberDensity: number;
  fiberDirection: number;
  surfaceGrain: number;
  absorption: number;
  edgeBleed: number;
  paperWarmth: number;
  inkSpread: number;
  wetness: number;
  bleed: number;
  edgePooling: number;
  smear: number;
  napDirection: number;
  sheenWidth: number;
  sheenIntensity: number;
  fiberSoftness: number;
  shadowDepth: number;
  roughness: number;
  reflectivity: number;
  brushedDirection: number;
  anisotropy: number;
  oxidation: number;
  scratches: number;
  curl: number;
  dissipation: number;
  turbulence: number;
  drift: number;
  expansion: number;
  density: number;
  softness: number;
  diffusion: number;
  visibilityThreshold: number;
  formationScale: number;
  billow: number;
  edgeBreakup: number;
  layerCount: number;
  refraction: number;
  frost: number;
  clarity: number;
  edgeThickness: number;
  tintAmount: number;
  reflectionBanding: number;
  highlightWidth: number;
  curvature: number;
  edgeBrightness: number;
  scanlineDensity: number;
  phosphorMask: number;
  flicker: number;
  crtCurvature: number;
  chromaticSep: number;
  signalNoise: number;
  /** Shared material response to pointer (0–1). */
  interactionResponse: number;
  /** How strongly structure modulates luminance before dither. */
  structureAmount: number;
};

export type MaterialControlKey = keyof MaterialSpecificParams;

export type MaterialDefinition = {
  id: EngineMaterialId;
  label: string;
  description: string;
  family: MaterialFamilyId;
  category: string;
  status: "ready" | "stub";
  performanceTier: PerformanceTier;
  defaultParams: Partial<MaterialSpecificParams>;
  supportedControls: MaterialControlKey[];
  hiddenControls: MaterialControlKey[];
  recommendedAnimations: AnimationModeId[];
  compatibleAnimations: AnimationModeId[];
  recommendedDither: DitherAlgorithmId[];
  recommendedComponents: ComponentId[];
  poorFitComponents: ComponentId[];
  lightingNotes: string;
  ditherNotes: string;
  interactionNotes: string;
  accessibilityNotes: string;
  reducedMotionNotes: string;
  mobileNotes: string;
  useCases: string[];
};

export type MaterialRecipe = {
  materialId: EngineMaterialId;
  layers: MaterialLayer[];
  recommendedPaletteId?: string;
};

export type MaterialEngineConfig = {
  materialId: EngineMaterialId;
  params: MaterialSpecificParams;
  layers: MaterialLayer[];
  /** Bitfield-friendly: when true, apply mobile simplifications. */
  lowQuality: boolean;
};

export type MaterialUniformPayload = {
  materialId: number;
  structureAmount: number;
  interactionResponse: number;
  lowQuality: number;
  /** Packed material-specific params. */
  p0: [number, number, number, number];
  p1: [number, number, number, number];
  p2: [number, number, number, number];
  p3: [number, number, number, number];
  /** Layer enable bits (bit i = layer i enabled and not bypassed). */
  layerBits: number;
};

export const MATERIAL_INDEX: Record<EngineMaterialId, number> = {
  monochrome: 0,
  paper: 1,
  ink: 2,
  velvet: 3,
  metal: 4,
  smoke: 5,
  fog: 6,
  cloud: 7,
  glass: 8,
  chrome: 9,
  crt: 10,
};

export const MAX_MATERIAL_LAYERS = 10;

export const DEFAULT_MATERIAL_PARAMS: MaterialSpecificParams = {
  fiberDensity: 0.45,
  fiberDirection: 0.15,
  surfaceGrain: 0.35,
  absorption: 0.4,
  edgeBleed: 0.25,
  paperWarmth: 0.2,
  inkSpread: 0.4,
  wetness: 0.35,
  bleed: 0.3,
  edgePooling: 0.4,
  smear: 0.15,
  napDirection: 0.35,
  sheenWidth: 0.35,
  sheenIntensity: 0.55,
  fiberSoftness: 0.7,
  shadowDepth: 0.55,
  roughness: 0.35,
  reflectivity: 0.7,
  brushedDirection: 0.25,
  anisotropy: 0.55,
  oxidation: 0.15,
  scratches: 0.2,
  curl: 0.45,
  dissipation: 0.35,
  turbulence: 0.5,
  drift: 0.3,
  expansion: 0.4,
  density: 0.5,
  softness: 0.6,
  diffusion: 0.55,
  visibilityThreshold: 0.35,
  formationScale: 0.45,
  billow: 0.5,
  edgeBreakup: 0.4,
  layerCount: 0.5,
  refraction: 0.35,
  frost: 0.25,
  clarity: 0.7,
  edgeThickness: 0.4,
  tintAmount: 0.25,
  reflectionBanding: 0.55,
  highlightWidth: 0.3,
  curvature: 0.45,
  edgeBrightness: 0.6,
  scanlineDensity: 0.55,
  phosphorMask: 0.4,
  flicker: 0.08,
  crtCurvature: 0.25,
  chromaticSep: 0.2,
  signalNoise: 0.25,
  interactionResponse: 0.45,
  structureAmount: 0.65,
};

export function idleMaterialPayload(): MaterialUniformPayload {
  return {
    materialId: 0,
    structureAmount: 0,
    interactionResponse: 0,
    lowQuality: 0,
    p0: [0, 0, 0, 0],
    p1: [0, 0, 0, 0],
    p2: [0, 0, 0, 0],
    p3: [0, 0, 0, 0],
    layerBits: 0xffff,
  };
}

export function createDefaultLayers(materialId: EngineMaterialId): MaterialLayer[] {
  const base: MaterialLayer[] = [
    {
      id: "base",
      type: "solid",
      label: "Base Color",
      enabled: true,
      opacity: 1,
      blendMode: "normal",
      solo: false,
      bypass: false,
    },
    {
      id: "gradient",
      type: "gradient",
      label: "Gradient Field",
      enabled: true,
      opacity: 0.85,
      blendMode: "normal",
      solo: false,
      bypass: false,
    },
    {
      id: "structure",
      type: "texture",
      label: "Material Structure",
      enabled: true,
      opacity: 1,
      blendMode: "overlay",
      solo: false,
      bypass: false,
    },
    {
      id: "light",
      type: "light",
      label: "Lighting",
      enabled: true,
      opacity: 1,
      blendMode: "normal",
      solo: false,
      bypass: false,
    },
    {
      id: "dither",
      type: "dither",
      label: "Dither",
      enabled: true,
      opacity: 1,
      blendMode: "normal",
      solo: false,
      bypass: false,
    },
    {
      id: "grain",
      type: "grain",
      label: "Grain / Texture",
      enabled: true,
      opacity: 0.7,
      blendMode: "overlay",
      solo: false,
      bypass: false,
    },
    {
      id: "interaction",
      type: "interaction",
      label: "Interaction",
      enabled: true,
      opacity: 1,
      blendMode: "normal",
      solo: false,
      bypass: false,
    },
    {
      id: "edge",
      type: "edge",
      label: "Edge Treatment",
      enabled: true,
      opacity: 0.8,
      blendMode: "screen",
      solo: false,
      bypass: false,
    },
    {
      id: "bloom",
      type: "bloom",
      label: "Bloom / Glow",
      enabled: true,
      opacity: 1,
      blendMode: "screen",
      solo: false,
      bypass: false,
    },
    {
      id: "finish",
      type: "texture",
      label: "Final Finish",
      enabled: true,
      opacity: 1,
      blendMode: "normal",
      solo: false,
      bypass: false,
    },
  ];

  // CRT scanlines live in structure + finish GLSL (keep fixed layer indices)
  if (materialId === "crt") {
    const finish = base.find((l) => l.id === "finish");
    if (finish) {
      finish.type = "scanline";
      finish.label = "CRT Finish / Scanlines";
    }
  }
  if (materialId === "paper" || materialId === "ink") {
    const fiber = base.find((l) => l.id === "structure");
    if (fiber) {
      fiber.type = "fiber";
      fiber.label = "Fiber / Ink Structure";
    }
  }
  if (materialId === "smoke" || materialId === "fog" || materialId === "cloud") {
    const s = base.find((l) => l.id === "structure");
    if (s) {
      s.type = "noise";
      s.label = "Volumetric Density";
    }
  }
  if (materialId === "glass" || materialId === "chrome") {
    const s = base.find((l) => l.id === "structure");
    if (s) {
      s.type = "distortion";
      s.label = "Reflection / Refraction";
    }
  }

  return base.slice(0, MAX_MATERIAL_LAYERS);
}

export const DEFAULT_MATERIAL_CONFIG: MaterialEngineConfig = {
  materialId: "monochrome",
  params: { ...DEFAULT_MATERIAL_PARAMS, structureAmount: 0 },
  layers: createDefaultLayers("monochrome"),
  lowQuality: false,
};
