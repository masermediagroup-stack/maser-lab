import { getLightingPreset } from "../engine/lighting";
import type { PresetDefinition } from "../types";

const CENTER_BLOOM = getLightingPreset("center-bloom")!.config;

export const PRESETS: PresetDefinition[] = [
  {
    id: "print-density",
    label: "Print Density",
    description:
      "Editorial Bayer print with a clear centered procedural light and denser outer dither.",
    materialId: "monochrome",
    componentIds: "*",
    params: {
      ditherSize: 8,
      contrast: 1.28,
      bloom: 0.52,
      bloomRadius: 0.18,
      blueNoiseAmount: 0.16,
      grainAmount: 0.06,
      lightX: 0.5,
      lightY: 0.5,
      cursorInfluence: 0.45,
      shadowStrength: 0.32,
      highlightStrength: 0.55,
      brightness: 0.02,
    },
    light: { ...CENTER_BLOOM },
  },
  {
    id: "soft-film",
    label: "Soft Film",
    description: "Lower contrast with more grain and blue-noise.",
    materialId: "monochrome",
    componentIds: "*",
    params: {
      ditherSize: 8,
      contrast: 0.95,
      brightness: 0.06,
      grainAmount: 0.18,
      blueNoiseAmount: 0.45,
      bloom: 0.2,
      softEdge: 0.7,
    },
  },
  {
    id: "hard-ink",
    label: "Hard Ink",
    description: "Crisp 4×4 dither, strong shadows, minimal bloom.",
    materialId: "monochrome",
    componentIds: "*",
    params: {
      ditherSize: 4,
      contrast: 1.45,
      shadowStrength: 0.55,
      bloom: 0.1,
      grainAmount: 0.04,
      blueNoiseAmount: 0.08,
      posterization: 0,
    },
  },
  {
    id: "poster-16",
    label: "Poster 16",
    description: "Posterized luminance with fine 16×16 matrix.",
    materialId: "monochrome",
    componentIds: "*",
    params: {
      ditherSize: 32,
      posterization: 6,
      pixelDensity: 1.4,
      contrast: 1.2,
      bloom: 0.25,
    },
  },
  {
    id: "ambient-glow",
    label: "Ambient Glow",
    description: "Soft bloom-forward material for heroes and loaders.",
    materialId: "monochrome",
    componentIds: ["hero-background", "loader", "section-background", "card"],
    params: {
      ditherSize: 8,
      bloom: 0.7,
      bloomRadius: 0.22,
      highlightStrength: 0.65,
      animationSpeed: 0.85,
      cursorInfluence: 0.55,
    },
  },
  {
    id: "ui-chrome",
    label: "UI Chrome",
    description: "Subtle density for buttons, badges, and inputs.",
    materialId: "monochrome",
    componentIds: ["button", "badge", "input", "navigation", "avatar"],
    params: {
      ditherSize: 8,
      contrast: 1.05,
      bloom: 0.15,
      grainAmount: 0.05,
      cursorInfluence: 0.25,
      animationSpeed: 0.4,
      softEdge: 0.4,
    },
  },
];

export function getPresetById(id: string): PresetDefinition | undefined {
  return PRESETS.find((p) => p.id === id);
}

export function presetsForComponent(componentId: string): PresetDefinition[] {
  return PRESETS.filter(
    (p) => p.componentIds === "*" || p.componentIds.includes(componentId as never),
  );
}

export const PresetCatalog = {
  list: () => PRESETS.slice(),
  get: getPresetById,
  forComponent: presetsForComponent,
};
