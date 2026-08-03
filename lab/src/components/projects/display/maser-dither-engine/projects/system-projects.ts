import {
  DEFAULT_ANIMATION_CONFIG,
  defaultModeParams,
} from "../engine/animation";
import { DEFAULT_COLOR_MATERIAL } from "../engine/color/types";
import { DEFAULT_DITHER_CONFIG } from "../engine/dither";
import {
  DEFAULT_INTERACTION_CONFIG,
  createDefaultLights,
} from "../engine/interaction";
import { DEFAULT_LIGHT_SHAPE } from "../engine/lighting";
import {
  applyMaterialDefaults,
} from "../engine/material/catalog";
import {
  DEFAULT_MATERIAL_PARAMS,
  createDefaultLayers,
  type EngineMaterialId,
  type MaterialEngineConfig,
} from "../engine/material/types";
import { DEFAULT_COMPONENT_CONTENT } from "../content/types";
import { createMonochromeMaterial } from "../engine/materials/MonochromeMaterial";
import { PRESETS, getPresetById } from "../presets/catalog";
import type { PresetDefinition } from "../types";
import { PROJECT_SCHEMA_VERSION, type ProjectRecord } from "./types";

function createMaterialConfig(
  materialId: EngineMaterialId,
): MaterialEngineConfig {
  return {
    materialId,
    params: {
      ...DEFAULT_MATERIAL_PARAMS,
      ...applyMaterialDefaults(materialId),
    },
    layers: createDefaultLayers(materialId),
    lowQuality: false,
  };
}

function animationDefaults() {
  return {
    ...DEFAULT_ANIMATION_CONFIG,
    modeParams: defaultModeParams(DEFAULT_ANIMATION_CONFIG.modeId),
    timeline: { ...DEFAULT_ANIMATION_CONFIG.timeline },
  };
}

function interactionDefaults() {
  return {
    ...DEFAULT_INTERACTION_CONFIG,
    physics: { ...DEFAULT_INTERACTION_CONFIG.physics },
    falloff: { ...DEFAULT_INTERACTION_CONFIG.falloff },
    trail: { ...DEFAULT_INTERACTION_CONFIG.trail },
    ripple: { ...DEFAULT_INTERACTION_CONFIG.ripple },
    hold: { ...DEFAULT_INTERACTION_CONFIG.hold },
    release: { ...DEFAULT_INTERACTION_CONFIG.release },
    lights: createDefaultLights(),
  };
}

/** Convert a catalog preset into an immutable system ProjectRecord. */
export function presetToSystemProject(preset: PresetDefinition): ProjectRecord {
  const params = createMonochromeMaterial(preset.params);
  const materialId = preset.material?.materialId ?? preset.materialId;
  let material = createMaterialConfig(materialId);
  if (preset.material) {
    material = {
      ...material,
      ...preset.material,
      materialId,
      params: { ...material.params, ...(preset.material.params ?? {}) },
      layers: preset.material.layers ?? material.layers,
    };
  }

  const componentId =
    preset.componentIds === "*" ? "card" : (preset.componentIds[0] ?? "card");

  return {
    id: `system:${preset.id}`,
    origin: "system",
    name: preset.label,
    description: preset.description,
    notes: "Built-in system preset — duplicate to edit.",
    tags: [materialId, "system"],
    colorLabel: "none",
    favorite: false,
    materialId,
    thumbnailDataUrl: null,
    createdAt: 0,
    updatedAt: 0,
    readOnly: true,
    snapshot: {
      schemaVersion: PROJECT_SCHEMA_VERSION,
      componentId,
      params,
      animation: {
        ...animationDefaults(),
        ...(preset.animation ?? {}),
      },
      interaction: {
        ...interactionDefaults(),
        ...(preset.interaction ?? {}),
        influence:
          typeof preset.params.cursorInfluence === "number"
            ? preset.params.cursorInfluence
            : DEFAULT_INTERACTION_CONFIG.influence,
      },
      color: {
        ...DEFAULT_COLOR_MATERIAL,
        ...(preset.color ?? {}),
        colors: {
          ...DEFAULT_COLOR_MATERIAL.colors,
          ...(preset.color?.colors ?? {}),
        },
        properties: {
          ...DEFAULT_COLOR_MATERIAL.properties,
          ...(preset.color?.properties ?? {}),
        },
      },
      light: { ...DEFAULT_LIGHT_SHAPE, ...(preset.light ?? {}) },
      dither: {
        ...DEFAULT_DITHER_CONFIG,
        ...(preset.dither ?? {}),
        matrixSize:
          (preset.dither?.matrixSize as typeof DEFAULT_DITHER_CONFIG.matrixSize) ??
          params.ditherSize,
      },
      material,
      content: {
        ...DEFAULT_COMPONENT_CONTENT,
        navItems: [...DEFAULT_COMPONENT_CONTENT.navItems],
      },
      sourceUrl: null,
      sourceLightMix: 0.45,
      basePresetId: preset.id,
    },
  };
}

export const SYSTEM_PROJECTS: ProjectRecord[] = PRESETS.map(presetToSystemProject);

export function getSystemProjectByPresetId(
  presetId: string,
): ProjectRecord | undefined {
  const preset = getPresetById(presetId);
  if (!preset) return undefined;
  return SYSTEM_PROJECTS.find((p) => p.id === `system:${preset.id}`);
}
