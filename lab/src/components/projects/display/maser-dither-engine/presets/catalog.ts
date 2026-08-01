import { getLightingPreset } from "../engine/lighting";
import { migratePreset } from "../engine/dither/migrate";
import type { PresetDefinition } from "../types";

const CENTER_BLOOM = getLightingPreset("center-bloom")!.config;

const RAW_PRESETS: PresetDefinition[] = [
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
    dither: {
      algorithm: "bayer",
      matrixSize: 8,
      patternScale: 1,
      thresholdBias: 0,
    },
  },
  {
    id: "soft-film",
    label: "Soft Film",
    description: "Lower contrast with blue-noise dither and grain.",
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
    dither: {
      algorithm: "blue-noise",
      matrixSize: 8,
      patternScale: 1.15,
      distribution: 0.9,
      temporalDrift: 0.2,
    },
  },
  {
    id: "hard-ink",
    label: "Hard Ink",
    description: "Crisp 4×4 Bayer, strong shadows, minimal bloom.",
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
    dither: {
      algorithm: "bayer",
      matrixSize: 4,
      patternScale: 1,
      thresholdBias: 0.12,
    },
  },
  {
    id: "poster-32",
    label: "Poster 32",
    description:
      "Posterized luminance with a fine 32×32 Bayer matrix (renamed from poster-16).",
    materialId: "monochrome",
    componentIds: "*",
    params: {
      ditherSize: 32,
      posterization: 6,
      pixelDensity: 1.4,
      contrast: 1.2,
      bloom: 0.25,
    },
    dither: {
      algorithm: "posterized",
      matrixSize: 32,
      patternScale: 0.9,
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
    dither: {
      algorithm: "halftone",
      matrixSize: 8,
      cellSize: 0.35,
      angle: 22,
      patternScale: 1.1,
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
    dither: {
      algorithm: "bayer",
      matrixSize: 8,
      patternScale: 1.25,
      thresholdBias: -0.05,
    },
  },
  {
    id: "line-etch",
    label: "Line Etch",
    description: "Engraving-style line screen for editorial chrome.",
    materialId: "monochrome",
    componentIds: "*",
    params: {
      ditherSize: 8,
      contrast: 1.2,
      bloom: 0.18,
      grainAmount: 0.04,
    },
    dither: {
      algorithm: "line-screen",
      angle: 35,
      lineWidth: 0.4,
      spacing: 0.42,
      waveDistortion: 0.15,
      patternScale: 1,
    },
  },
  {
    id: "cross-print",
    label: "Cross Print",
    description: "Layered crosshatch tonal build for dense print looks.",
    materialId: "monochrome",
    componentIds: ["card", "image-frame", "section-background"],
    params: {
      ditherSize: 8,
      contrast: 1.3,
      shadowStrength: 0.4,
      bloom: 0.12,
    },
    dither: {
      algorithm: "crosshatch",
      lineCount: 3,
      angleSeparation: 60,
      spacing: 0.5,
      roughness: 0.3,
      patternScale: 1.05,
    },
  },
];

export const PRESETS: PresetDefinition[] = RAW_PRESETS.map(migratePreset);

export function getPresetById(id: string): PresetDefinition | undefined {
  if (id === "poster-16") return PRESETS.find((p) => p.id === "poster-32");
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
