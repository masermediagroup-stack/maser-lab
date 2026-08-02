/**
 * Core procedural material catalog — Sprint 6.
 * Each entry is visually distinct under identical shared settings.
 */

import type {
  EngineMaterialId,
  MaterialControlKey,
  MaterialDefinition,
  MaterialFamilyId,
  MaterialSpecificParams,
} from "./types";
import { DEFAULT_MATERIAL_PARAMS } from "./types";

const ALL_KEYS = Object.keys(DEFAULT_MATERIAL_PARAMS) as MaterialControlKey[];

function controls(...keys: MaterialControlKey[]): {
  supported: MaterialControlKey[];
  hidden: MaterialControlKey[];
} {
  const supported = ["structureAmount", "interactionResponse", ...keys] as MaterialControlKey[];
  const set = new Set(supported);
  return {
    supported,
    hidden: ALL_KEYS.filter((k) => !set.has(k)),
  };
}

export const MATERIAL_FAMILIES: {
  id: MaterialFamilyId;
  label: string;
  description: string;
}[] = [
  {
    id: "print",
    label: "Print",
    description: "Paper, ink, and print-stock responses.",
  },
  {
    id: "soft-surface",
    label: "Soft Surface",
    description: "Plush and atmospheric soft materials.",
  },
  {
    id: "hard-surface",
    label: "Hard Surface",
    description: "Metal, glass, and reflective hard materials.",
  },
  {
    id: "atmospheric",
    label: "Atmospheric",
    description: "Smoke, fog, and volumetric fields.",
  },
  {
    id: "digital",
    label: "Digital",
    description: "CRT and signal-driven surfaces.",
  },
];

const paperCtrl = controls(
  "fiberDensity",
  "fiberDirection",
  "surfaceGrain",
  "absorption",
  "edgeBleed",
  "paperWarmth",
);
const inkCtrl = controls(
  "inkSpread",
  "wetness",
  "bleed",
  "edgePooling",
  "smear",
  "density",
);
const velvetCtrl = controls(
  "napDirection",
  "sheenWidth",
  "sheenIntensity",
  "fiberSoftness",
  "shadowDepth",
);
const metalCtrl = controls(
  "roughness",
  "reflectivity",
  "brushedDirection",
  "anisotropy",
  "oxidation",
  "scratches",
);
const smokeCtrl = controls(
  "curl",
  "dissipation",
  "turbulence",
  "drift",
  "expansion",
  "density",
  "softness",
);
const fogCtrl = controls(
  "diffusion",
  "density",
  "softness",
  "drift",
  "visibilityThreshold",
);
const cloudCtrl = controls(
  "formationScale",
  "density",
  "billow",
  "edgeBreakup",
  "layerCount",
  "softness",
);
const glassCtrl = controls(
  "refraction",
  "frost",
  "clarity",
  "edgeThickness",
  "tintAmount",
  "softness",
);
const chromeCtrl = controls(
  "reflectionBanding",
  "highlightWidth",
  "curvature",
  "edgeBrightness",
  "reflectivity",
  "tintAmount",
);
const crtCtrl = controls(
  "scanlineDensity",
  "phosphorMask",
  "flicker",
  "crtCurvature",
  "chromaticSep",
  "signalNoise",
);

export const PROCEDURAL_MATERIALS: MaterialDefinition[] = [
  {
    id: "monochrome",
    label: "Monochrome",
    description:
      "Neutral print plate — shared lighting and dither without material structure.",
    family: "print",
    category: "Base",
    status: "ready",
    performanceTier: "lightweight",
    defaultParams: { structureAmount: 0, interactionResponse: 0.3 },
    supportedControls: ["structureAmount", "interactionResponse"],
    hiddenControls: ALL_KEYS.filter(
      (k) => k !== "structureAmount" && k !== "interactionResponse",
    ),
    recommendedAnimations: ["breathing", "noise-drift"],
    compatibleAnimations: ["linear-horizontal", "radial-pulse"],
    recommendedDither: ["bayer", "blue-noise"],
    recommendedComponents: [
      "card",
      "button",
      "badge",
      "navigation",
      "input",
      "avatar",
    ],
    poorFitComponents: [],
    lightingNotes: "Uses light shape as-is.",
    ditherNotes: "Clean Bayer / blue-noise response.",
    interactionNotes: "Subtle pointer tug only.",
    accessibilityNotes: "Highest content legibility.",
    reducedMotionNotes: "Static plate when reduced motion is on.",
    mobileNotes: "Default mobile material.",
    useCases: ["UI chrome", "baseline comparisons"],
  },
  {
    id: "paper",
    label: "Paper",
    description:
      "Fibrous stock with directional grain, absorption, and soft print bleed — matte, never glossy.",
    family: "print",
    category: "Print",
    status: "ready",
    performanceTier: "lightweight",
    defaultParams: {
      ...paperCtrl.supported.reduce(
        (acc, k) => ({ ...acc, [k]: DEFAULT_MATERIAL_PARAMS[k] }),
        {} as Partial<MaterialSpecificParams>,
      ),
      structureAmount: 0.7,
      fiberDensity: 0.55,
      absorption: 0.5,
      paperWarmth: 0.28,
    },
    supportedControls: paperCtrl.supported,
    hiddenControls: paperCtrl.hidden,
    recommendedAnimations: ["breathing", "noise-drift"],
    compatibleAnimations: ["wave", "flow-field"],
    recommendedDither: ["bayer", "clustered-dot", "posterized"],
    recommendedComponents: ["card", "image-frame", "section-background", "hero-background"],
    poorFitComponents: ["scrollbar"],
    lightingNotes: "Broad diffuse response — soft falloff.",
    ditherNotes: "Ink sits in fiber valleys; denser in absorption.",
    interactionNotes: "Pressure darkens fiber; slight displacement.",
    accessibilityNotes: "Warmth must not drop contrast below WCAG for overlays.",
    reducedMotionNotes: "Freeze fiber evolution.",
    mobileNotes: "Lower fiber density on small badges.",
    useCases: ["Editorial cards", "print mockups"],
  },
  {
    id: "ink",
    label: "Ink",
    description:
      "Wet print — spread, pooling at edges, smear, and drying variation. Absorbed, not just dark.",
    family: "print",
    category: "Print",
    status: "ready",
    performanceTier: "standard",
    defaultParams: {
      structureAmount: 0.75,
      inkSpread: 0.5,
      wetness: 0.45,
      bleed: 0.4,
      edgePooling: 0.55,
      smear: 0.2,
      density: 0.7,
      interactionResponse: 0.6,
    },
    supportedControls: inkCtrl.supported,
    hiddenControls: inkCtrl.hidden,
    recommendedAnimations: ["bloom", "lava-lamp", "ripple"],
    compatibleAnimations: ["wave", "turbulence"],
    recommendedDither: ["bayer", "halftone", "clustered-dot"],
    recommendedComponents: ["card", "badge", "button", "image-frame"],
    poorFitComponents: ["scrollbar", "progress-bar"],
    lightingNotes: "Wet areas hold highlight longer; dry areas absorb.",
    ditherNotes: "Pooling densifies dither at light edges.",
    interactionNotes: "Hold increases spread and density.",
    accessibilityNotes: "High density can obscure small text — keep overlays opaque.",
    reducedMotionNotes: "Disable smear evolution.",
    mobileNotes: "Cap smear on thin chrome.",
    useCases: ["Editorial accents", "print CTAs"],
  },
  {
    id: "velvet",
    label: "Velvet",
    description:
      "Directional nap sheen — lighting shifts dramatically with light and pointer angle.",
    family: "soft-surface",
    category: "Soft",
    status: "ready",
    performanceTier: "standard",
    defaultParams: {
      structureAmount: 0.8,
      napDirection: 0.4,
      sheenWidth: 0.3,
      sheenIntensity: 0.65,
      fiberSoftness: 0.75,
      shadowDepth: 0.6,
      interactionResponse: 0.7,
    },
    supportedControls: velvetCtrl.supported,
    hiddenControls: velvetCtrl.hidden,
    recommendedAnimations: ["wave", "orbit", "magnetic"],
    compatibleAnimations: ["breathing", "flow-field"],
    recommendedDither: ["blue-noise", "bayer"],
    recommendedComponents: ["card", "hero-background", "section-background", "button"],
    poorFitComponents: ["scrollbar", "badge"],
    lightingNotes: "Anisotropic sheen lobe follows light − nap.",
    ditherNotes: "Softer coverage in sheen; denser in nap shadow.",
    interactionNotes: "Pointer rotates nap / compresses sheen.",
    accessibilityNotes: "Sheen must not flash; keep intensity moderate.",
    reducedMotionNotes: "Freeze nap drift.",
    mobileNotes: "Widen sheen lobe so it remains visible at small sizes.",
    useCases: ["Luxury heroes", "soft CTAs"],
  },
  {
    id: "metal",
    label: "Metal",
    description:
      "Brushed anisotropic metal — narrow speculars, scratches, oxidation. Not just high contrast.",
    family: "hard-surface",
    category: "Hard",
    status: "ready",
    performanceTier: "standard",
    defaultParams: {
      structureAmount: 0.85,
      roughness: 0.3,
      reflectivity: 0.75,
      brushedDirection: 0.2,
      anisotropy: 0.65,
      oxidation: 0.12,
      scratches: 0.25,
      interactionResponse: 0.55,
    },
    supportedControls: metalCtrl.supported,
    hiddenControls: metalCtrl.hidden,
    recommendedAnimations: ["linear-horizontal", "orbit", "diagonal"],
    compatibleAnimations: ["bloom", "spiral"],
    recommendedDither: ["bayer", "line-screen"],
    recommendedComponents: ["button", "badge", "navigation", "progress-bar"],
    poorFitComponents: ["hero-background"],
    lightingNotes: "Tight specular along brush axis.",
    ditherNotes: "Fine dither in midtones; highlights stay open.",
    interactionNotes: "Specular tracks pointer.",
    accessibilityNotes: "Avoid pure white speculars over text.",
    reducedMotionNotes: "Static brush field.",
    mobileNotes: "Increase roughness slightly for legibility.",
    useCases: ["UI chrome", "toolbars"],
  },
  {
    id: "smoke",
    label: "Smoke",
    description:
      "Volumetric curl and dissipation within the 2D field — soft light, turbulent drift.",
    family: "atmospheric",
    category: "Atmosphere",
    status: "ready",
    performanceTier: "advanced",
    defaultParams: {
      structureAmount: 0.7,
      curl: 0.55,
      dissipation: 0.4,
      turbulence: 0.55,
      drift: 0.35,
      expansion: 0.45,
      density: 0.45,
      softness: 0.7,
      interactionResponse: 0.65,
    },
    supportedControls: smokeCtrl.supported,
    hiddenControls: smokeCtrl.hidden,
    recommendedAnimations: ["turbulence", "flow-field", "aurora"],
    compatibleAnimations: ["noise-drift", "spiral"],
    recommendedDither: ["blue-noise", "random", "animated"],
    recommendedComponents: ["hero-background", "section-background", "loader"],
    poorFitComponents: ["badge", "input", "avatar", "scrollbar"],
    lightingNotes: "Soft scatter; core still readable.",
    ditherNotes: "Sparse dither in thin smoke; denser in cores.",
    interactionNotes: "Pointer pushes and curls volume.",
    accessibilityNotes: "Keep content overlays solid.",
    reducedMotionNotes: "Freeze curl; keep soft static volume.",
    mobileNotes: "Reduce turbulence octaves (lowQuality).",
    useCases: ["Hero atmospheres", "loaders"],
  },
  {
    id: "fog",
    label: "Fog",
    description:
      "Diffused volume that flattens contrast while preserving an illuminated mass.",
    family: "atmospheric",
    category: "Atmosphere",
    status: "ready",
    performanceTier: "standard",
    defaultParams: {
      structureAmount: 0.55,
      diffusion: 0.65,
      density: 0.4,
      softness: 0.8,
      drift: 0.25,
      visibilityThreshold: 0.3,
      interactionResponse: 0.5,
    },
    supportedControls: fogCtrl.supported,
    hiddenControls: fogCtrl.hidden,
    recommendedAnimations: ["noise-drift", "breathing", "aurora"],
    compatibleAnimations: ["flow-field"],
    recommendedDither: ["blue-noise", "bayer"],
    recommendedComponents: ["hero-background", "section-background", "card"],
    poorFitComponents: ["badge", "button", "scrollbar"],
    lightingNotes: "Light creates a soft glowing pocket.",
    ditherNotes: "Low-contrast dither; threshold controls visibility.",
    interactionNotes: "Pointer clears a temporary path.",
    accessibilityNotes: "Raise exposure if text sits on fog.",
    reducedMotionNotes: "Static diffusion field.",
    mobileNotes: "Lower density on small cards.",
    useCases: ["Atmospheric sections"],
  },
  {
    id: "cloud",
    label: "Cloud",
    description:
      "Billowy multi-scale density — denser and more structured than fog.",
    family: "atmospheric",
    category: "Atmosphere",
    status: "ready",
    performanceTier: "advanced",
    defaultParams: {
      structureAmount: 0.75,
      formationScale: 0.5,
      density: 0.55,
      billow: 0.55,
      edgeBreakup: 0.45,
      layerCount: 0.6,
      softness: 0.55,
      interactionResponse: 0.45,
    },
    supportedControls: cloudCtrl.supported,
    hiddenControls: cloudCtrl.hidden,
    recommendedAnimations: ["lava-lamp", "noise-drift", "aurora"],
    compatibleAnimations: ["turbulence", "breathing"],
    recommendedDither: ["blue-noise", "clustered-dot"],
    recommendedComponents: ["hero-background", "section-background", "card"],
    poorFitComponents: ["badge", "input", "scrollbar"],
    lightingNotes: "Internal self-shadow in billows.",
    ditherNotes: "Breakup edges dither denser.",
    interactionNotes: "Gentle compression of billows.",
    accessibilityNotes: "Prefer dark text overlays.",
    reducedMotionNotes: "Freeze evolution; keep layered density.",
    mobileNotes: "Reduce layerCount in lowQuality.",
    useCases: ["Sky heroes", "soft cards"],
  },
  {
    id: "glass",
    label: "Glass",
    description:
      "Tinted / frosted translucent plate with edge thickness and soft refraction abstraction.",
    family: "hard-surface",
    category: "Hard",
    status: "ready",
    performanceTier: "standard",
    defaultParams: {
      structureAmount: 0.6,
      refraction: 0.4,
      frost: 0.3,
      clarity: 0.65,
      edgeThickness: 0.45,
      tintAmount: 0.3,
      softness: 0.4,
      interactionResponse: 0.5,
    },
    supportedControls: glassCtrl.supported,
    hiddenControls: glassCtrl.hidden,
    recommendedAnimations: ["ripple", "wave", "orbit"],
    compatibleAnimations: ["breathing", "bloom"],
    recommendedDither: ["bayer", "blue-noise"],
    recommendedComponents: ["card", "button", "badge", "navigation", "input"],
    poorFitComponents: [],
    lightingNotes: "Edge catch + soft internal scatter.",
    ditherNotes: "Frost increases dither; clear glass keeps open highlights.",
    interactionNotes: "Pointer warps refraction offset.",
    accessibilityNotes: "Frosted variants need stronger text contrast.",
    reducedMotionNotes: "Disable refraction wobble.",
    mobileNotes: "Lower refraction strength.",
    useCases: ["Frosted panels", "glass buttons"],
  },
  {
    id: "chrome",
    label: "Chrome",
    description:
      "Curved reflective banding and edge brightness without a real environment map.",
    family: "hard-surface",
    category: "Hard",
    status: "ready",
    performanceTier: "standard",
    defaultParams: {
      structureAmount: 0.9,
      reflectionBanding: 0.6,
      highlightWidth: 0.28,
      curvature: 0.5,
      edgeBrightness: 0.7,
      reflectivity: 0.85,
      tintAmount: 0.15,
      interactionResponse: 0.55,
    },
    supportedControls: chromeCtrl.supported,
    hiddenControls: chromeCtrl.hidden,
    recommendedAnimations: ["linear-horizontal", "orbit", "diagonal"],
    compatibleAnimations: ["spiral", "bloom"],
    recommendedDither: ["bayer", "line-screen"],
    recommendedComponents: ["button", "badge", "progress-bar", "navigation"],
    poorFitComponents: ["scrollbar", "hero-background"],
    lightingNotes: "Banded environment abstraction tracks light.",
    ditherNotes: "Fine dither in mid bands only.",
    interactionNotes: "Bands slide with pointer.",
    accessibilityNotes: "High edge brightness can glare — keep moderate.",
    reducedMotionNotes: "Static bands.",
    mobileNotes: "Widen highlightWidth for small buttons.",
    useCases: ["Metallic CTAs", "progress chrome"],
  },
  {
    id: "crt",
    label: "CRT",
    description:
      "Scanlines, phosphor mask, mild curvature, and controlled signal noise. Flicker off by default.",
    family: "digital",
    category: "Digital",
    status: "ready",
    performanceTier: "advanced",
    defaultParams: {
      structureAmount: 0.85,
      scanlineDensity: 0.55,
      phosphorMask: 0.45,
      flicker: 0.05,
      crtCurvature: 0.22,
      chromaticSep: 0.18,
      signalNoise: 0.22,
      interactionResponse: 0.4,
    },
    supportedControls: crtCtrl.supported,
    hiddenControls: crtCtrl.hidden,
    recommendedAnimations: ["noise-drift", "linear-vertical", "turbulence"],
    compatibleAnimations: ["breathing"],
    recommendedDither: ["bayer", "random", "animated"],
    recommendedComponents: ["card", "hero-background", "loader", "image-frame"],
    poorFitComponents: ["scrollbar", "badge", "avatar"],
    lightingNotes: "Phosphor bloom on bright core.",
    ditherNotes: "Scanlines modulate dither phase.",
    interactionNotes: "Pointer adds local signal distortion.",
    accessibilityNotes: "Flicker capped; respect reduced motion (no flicker).",
    reducedMotionNotes: "Disable flicker and roll; keep static scanlines.",
    mobileNotes: "Needs min height ~120px; simplify phosphor mask.",
    useCases: ["Retro terminals", "loaders"],
  },
];

const byId = new Map(PROCEDURAL_MATERIALS.map((m) => [m.id, m]));

export function getMaterialDefinition(
  id: EngineMaterialId,
): MaterialDefinition | undefined {
  return byId.get(id);
}

export function materialsByFamily(
  family: MaterialFamilyId,
): MaterialDefinition[] {
  return PROCEDURAL_MATERIALS.filter((m) => m.family === family);
}

export function listReadyMaterials(): MaterialDefinition[] {
  return PROCEDURAL_MATERIALS.filter((m) => m.status === "ready");
}

export function applyMaterialDefaults(
  id: EngineMaterialId,
): MaterialSpecificParams {
  const def = byId.get(id);
  return {
    ...DEFAULT_MATERIAL_PARAMS,
    ...(def?.defaultParams ?? {}),
  };
}
