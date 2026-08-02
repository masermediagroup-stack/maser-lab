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
  {
    id: "warm-newsprint",
    label: "Warm Newsprint",
    description: "Fibrous paper stock with soft Bayer print and warm absorption.",
    materialId: "paper",
    componentIds: ["card", "image-frame", "section-background", "hero-background"],
    params: {
      ditherSize: 8,
      contrast: 1.15,
      bloom: 0.22,
      grainAmount: 0.12,
      brightness: 0.04,
    },
    material: {
      materialId: "paper",
      params: {
        structureAmount: 0.75,
        fiberDensity: 0.6,
        absorption: 0.55,
        paperWarmth: 0.4,
        edgeBleed: 0.3,
      },
    },
    dither: { algorithm: "clustered-dot", matrixSize: 8, patternScale: 1.05 },
  },
  {
    id: "wet-ink",
    label: "Wet Ink",
    description: "Pooled ink with edge bleed and smear — absorbed, not just dark.",
    materialId: "ink",
    componentIds: ["card", "badge", "button", "image-frame"],
    params: {
      ditherSize: 4,
      contrast: 1.35,
      bloom: 0.18,
      grainAmount: 0.06,
    },
    material: {
      materialId: "ink",
      params: {
        structureAmount: 0.8,
        inkSpread: 0.55,
        wetness: 0.55,
        edgePooling: 0.65,
        smear: 0.25,
        density: 0.75,
      },
    },
    dither: { algorithm: "halftone", matrixSize: 8, cellSize: 0.4 },
  },
  {
    id: "black-velvet",
    label: "Black Velvet",
    description: "Directional nap sheen — lighting shifts with light angle.",
    materialId: "velvet",
    componentIds: ["card", "hero-background", "button", "section-background"],
    params: {
      ditherSize: 8,
      contrast: 1.25,
      bloom: 0.35,
      shadowStrength: 0.5,
    },
    material: {
      materialId: "velvet",
      params: {
        structureAmount: 0.85,
        sheenIntensity: 0.7,
        sheenWidth: 0.28,
        shadowDepth: 0.65,
        napDirection: 0.42,
      },
    },
    dither: { algorithm: "blue-noise", matrixSize: 8, distribution: 0.85 },
  },
  {
    id: "brushed-aluminum",
    label: "Brushed Aluminum",
    description: "Anisotropic metal with brush scratches and tight speculars.",
    materialId: "metal",
    componentIds: ["button", "badge", "navigation", "progress-bar"],
    params: {
      ditherSize: 8,
      contrast: 1.3,
      bloom: 0.28,
      highlightStrength: 0.6,
    },
    material: {
      materialId: "metal",
      params: {
        structureAmount: 0.88,
        roughness: 0.28,
        reflectivity: 0.8,
        anisotropy: 0.7,
        scratches: 0.3,
      },
    },
    dither: { algorithm: "line-screen", angle: 15, lineWidth: 0.35 },
  },
  {
    id: "dense-smoke",
    label: "Dense Smoke",
    description: "Volumetric curl and turbulence for heroes and loaders.",
    materialId: "smoke",
    componentIds: ["hero-background", "section-background", "loader"],
    params: {
      ditherSize: 8,
      contrast: 1.1,
      bloom: 0.45,
      grainAmount: 0.1,
    },
    material: {
      materialId: "smoke",
      params: {
        structureAmount: 0.75,
        curl: 0.6,
        turbulence: 0.6,
        density: 0.55,
        softness: 0.65,
      },
    },
    dither: { algorithm: "blue-noise", temporalDrift: 0.25 },
  },
  {
    id: "morning-fog",
    label: "Morning Fog",
    description: "Soft diffusion that preserves an illuminated volume.",
    materialId: "fog",
    componentIds: ["hero-background", "section-background", "card"],
    params: {
      ditherSize: 8,
      contrast: 0.95,
      bloom: 0.5,
      brightness: 0.08,
    },
    material: {
      materialId: "fog",
      params: {
        structureAmount: 0.6,
        diffusion: 0.7,
        softness: 0.85,
        visibilityThreshold: 0.28,
      },
    },
    dither: { algorithm: "blue-noise", distribution: 0.7 },
  },
  {
    id: "soft-cloud",
    label: "Soft Cloud",
    description: "Billowy multi-scale density — denser than fog.",
    materialId: "cloud",
    componentIds: ["hero-background", "section-background", "card"],
    params: {
      ditherSize: 8,
      contrast: 1.05,
      bloom: 0.4,
    },
    material: {
      materialId: "cloud",
      params: {
        structureAmount: 0.78,
        billow: 0.6,
        formationScale: 0.5,
        density: 0.55,
        layerCount: 0.65,
      },
    },
    dither: { algorithm: "clustered-dot", patternScale: 1.1 },
  },
  {
    id: "frosted-glass",
    label: "Frosted Glass",
    description: "Frosted translucent plate with soft refraction abstraction.",
    materialId: "glass",
    componentIds: ["card", "button", "badge", "navigation", "input"],
    params: {
      ditherSize: 8,
      contrast: 1.1,
      bloom: 0.3,
      softEdge: 0.55,
    },
    material: {
      materialId: "glass",
      params: {
        structureAmount: 0.65,
        frost: 0.55,
        refraction: 0.35,
        clarity: 0.55,
        edgeThickness: 0.5,
      },
    },
    dither: { algorithm: "bayer", matrixSize: 8 },
  },
  {
    id: "liquid-chrome",
    label: "Liquid Chrome",
    description: "Curved reflective banding without an environment map.",
    materialId: "chrome",
    componentIds: ["button", "badge", "progress-bar", "navigation"],
    params: {
      ditherSize: 8,
      contrast: 1.4,
      bloom: 0.35,
      highlightStrength: 0.7,
    },
    material: {
      materialId: "chrome",
      params: {
        structureAmount: 0.92,
        reflectionBanding: 0.7,
        highlightWidth: 0.25,
        curvature: 0.55,
        edgeBrightness: 0.75,
        reflectivity: 0.9,
      },
    },
    dither: { algorithm: "bayer", matrixSize: 8, patternScale: 1.2 },
  },
  {
    id: "green-phosphor-crt",
    label: "Green Phosphor CRT",
    description: "Scanlines and phosphor mask with flicker capped for a11y.",
    materialId: "crt",
    componentIds: ["card", "hero-background", "loader", "image-frame"],
    params: {
      ditherSize: 8,
      contrast: 1.2,
      bloom: 0.4,
      grainAmount: 0.08,
    },
    material: {
      materialId: "crt",
      params: {
        structureAmount: 0.88,
        scanlineDensity: 0.6,
        phosphorMask: 0.5,
        flicker: 0.04,
        crtCurvature: 0.28,
        chromaticSep: 0.22,
        signalNoise: 0.2,
      },
    },
    color: {
      colorEnabled: true,
      behavior: "none",
    },
    dither: { algorithm: "bayer", matrixSize: 8 },
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
