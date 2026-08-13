import type {
  ColorMaterialConfig,
  MaterialBehaviorId,
  MaterialProperties,
} from "./types";
import { DEFAULT_COLOR_MATERIAL, DEFAULT_MATERIAL_PROPERTIES } from "./types";

export type BehaviorDefinition = {
  id: MaterialBehaviorId;
  label: string;
  description: string;
  properties: Partial<MaterialProperties>;
  gradientSpeedMul?: number;
  preferBlend?: ColorMaterialConfig["blendMode"];
};

export const MATERIAL_BEHAVIORS: BehaviorDefinition[] = [
  {
    id: "none",
    label: "None",
    description: "No material behavior overlay.",
    properties: {},
  },
  {
    id: "paper",
    label: "Paper",
    description: "Fibrous stock — soft grain, gentle contrast.",
    properties: {
      density: 0.4,
      sharpness: 0.35,
      smoothness: 0.55,
      materialWeight: 0.4,
      lightScatter: 0.45,
    },
    preferBlend: "multiply",
  },
  {
    id: "ink",
    label: "Ink",
    description: "Dense print — hard thresholds, high contrast.",
    properties: {
      density: 0.75,
      sharpness: 0.8,
      threshold: 0.15,
      materialWeight: 0.7,
      gamma: 1.1,
    },
    preferBlend: "multiply",
  },
  {
    id: "plastic",
    label: "Plastic",
    description: "Smooth specular surface with bloom bias.",
    properties: {
      smoothness: 0.75,
      sharpness: 0.55,
      lightScatter: 0.55,
      materialWeight: 0.5,
    },
    preferBlend: "screen",
  },
  {
    id: "velvet",
    label: "Velvet",
    description: "Plush absorption — soft edges, low scatter.",
    properties: {
      smoothness: 0.85,
      density: 0.6,
      lightScatter: 0.2,
      materialWeight: 0.65,
    },
    preferBlend: "soft-light",
  },
  {
    id: "metal",
    label: "Metal",
    description: "Hard specular — high contrast, sharp highlights.",
    properties: {
      sharpness: 0.9,
      exposure: 1.15,
      gamma: 0.95,
      lightScatter: 0.7,
      materialWeight: 0.75,
    },
    preferBlend: "overlay",
  },
  {
    id: "smoke",
    label: "Smoke",
    description: "Diffuse volumetric haze.",
    properties: {
      density: 0.35,
      blur: 0.35,
      smoothness: 0.7,
      lightScatter: 0.8,
      materialWeight: 0.35,
    },
    gradientSpeedMul: 0.7,
    preferBlend: "screen",
  },
  {
    id: "fog",
    label: "Fog",
    description: "Soft atmospheric wash.",
    properties: {
      density: 0.3,
      blur: 0.45,
      smoothness: 0.8,
      exposure: 1.05,
      lightScatter: 0.75,
    },
    preferBlend: "soft-light",
  },
  {
    id: "cloud",
    label: "Cloud",
    description: "Billowy density with soft pulse.",
    properties: {
      density: 0.45,
      smoothness: 0.75,
      blur: 0.25,
      lightScatter: 0.65,
    },
    gradientSpeedMul: 0.85,
  },
  {
    id: "glass",
    label: "Glass",
    description: "Foundation refraction feel — bright scatter, light weight.",
    properties: {
      smoothness: 0.9,
      sharpness: 0.7,
      lightScatter: 0.85,
      materialWeight: 0.3,
      exposure: 1.1,
    },
    preferBlend: "screen",
  },
];

export function getBehavior(id: MaterialBehaviorId): BehaviorDefinition {
  return (
    MATERIAL_BEHAVIORS.find((b) => b.id === id) ?? MATERIAL_BEHAVIORS[0]!
  );
}

export function applyBehavior(
  config: ColorMaterialConfig,
  behaviorId: MaterialBehaviorId,
): ColorMaterialConfig {
  const b = getBehavior(behaviorId);
  const props = {
    ...DEFAULT_MATERIAL_PROPERTIES,
    ...config.properties,
    ...b.properties,
  };
  return {
    ...config,
    behavior: behaviorId,
    properties: props,
    blendMode: b.preferBlend ?? config.blendMode,
    // Do not compound speed on repeated applies — mul is a one-shot bias from default.
    gradientSpeed:
      behaviorId === "none"
        ? config.gradientSpeed
        : Math.min(
            2,
            Math.max(
              0,
              DEFAULT_COLOR_MATERIAL.gradientSpeed * (b.gradientSpeedMul ?? 1),
            ),
          ),
  };
}

export { DEFAULT_COLOR_MATERIAL };
