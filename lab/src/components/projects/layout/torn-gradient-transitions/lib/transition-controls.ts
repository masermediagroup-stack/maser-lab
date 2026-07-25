import { DIRECTION_OPTIONS } from "./transition-state-machine";
import { EASING_OPTIONS } from "./transition-easing";
import type { ControlDefinition, ControlGroupId } from "./transition-types";
import {
  COSINE_PALETTE_OPTIONS,
  EDGE_PROFILE_OPTIONS,
  PALETTE_MODE_OPTIONS,
  REVEAL_MODE_OPTIONS,
} from "./transition-utils";

export const CONTROL_GROUP_ORDER: ControlGroupId[] = [
  "motion",
  "shape",
  "bubbles",
  "paper",
  "depth",
  "gradient",
  "finishing",
];

export const CONTROL_GROUP_LABELS: Record<ControlGroupId, string> = {
  motion: "Motion",
  shape: "Shape",
  bubbles: "Bubbles",
  paper: "Paper",
  depth: "Depth & lighting",
  gradient: "Gradient",
  finishing: "Texture & finishing",
};

export const CONTROL_GROUP_HINTS: Record<ControlGroupId, string> = {
  motion: "Timing, direction and when the page underneath is allowed to swap.",
  shape: "The silhouette of the tear itself, from broad shape to fibre breakup.",
  bubbles: "Voronoi cell field that inflates the sheet near the leading edge.",
  paper: "Micro surface — fibres, pulp, wrinkles and density variation.",
  depth: "How the height field is lit. This is what makes the sheet look solid.",
  gradient: "Colour formation through the material, including distortion by height.",
  finishing: "Grain, dither and post effects applied after shading.",
};

const s = (
  key: Extract<ControlDefinition, { kind: "slider" }>["key"],
  label: string,
  group: ControlGroupId,
  min: number,
  max: number,
  step: number,
  hint?: string,
  unit?: string,
): ControlDefinition => ({
  kind: "slider",
  key,
  label,
  group,
  min,
  max,
  step,
  hint,
  unit,
});

export const CONTROL_DEFINITIONS: ControlDefinition[] = [
  // ── Motion ───────────────────────────────────────────────────────────────
  {
    kind: "select",
    key: "direction",
    label: "Direction",
    group: "motion",
    options: DIRECTION_OPTIONS,
  },
  s("duration", "Duration", "motion", 300, 2600, 10, undefined, "ms"),
  s("outroDuration", "Outro duration", "motion", 300, 2600, 10, undefined, "ms"),
  {
    kind: "select",
    key: "easing",
    label: "Easing",
    group: "motion",
    options: EASING_OPTIONS,
  },
  s(
    "swapMidpoint",
    "Route-swap midpoint",
    "motion",
    0.5,
    1,
    0.01,
    "Fraction of the intro that must elapse before the page underneath changes.",
  ),
  s("startDelay", "Start delay", "motion", 0, 600, 10, undefined, "ms"),
  {
    kind: "select",
    key: "revealMode",
    label: "Reveal mode",
    group: "motion",
    options: REVEAL_MODE_OPTIONS,
  },
  s(
    "edgeVelocity",
    "Edge velocity",
    "motion",
    0.5,
    2.5,
    0.01,
    "Above 1 the edge loiters then whips across; below 1 it leaps then drifts.",
  ),
  s("overshoot", "Overshoot", "motion", 0, 1, 0.01),
  s("coveredHold", "Covered hold", "motion", 0, 800, 10, undefined, "ms"),
  s("settleDuration", "Settle duration", "motion", 0, 600, 10, undefined, "ms"),

  // ── Shape ────────────────────────────────────────────────────────────────
  {
    kind: "select",
    key: "edgeProfile",
    label: "Edge profile",
    group: "shape",
    options: EDGE_PROFILE_OPTIONS,
  },
  s("bandWidth", "Band width", "shape", 0.04, 0.5, 0.005),
  s("tearAmplitude", "Tear amplitude", "shape", 0, 0.3, 0.005),
  s("tearFrequency", "Tear frequency", "shape", 0.2, 4, 0.02),
  s("edgeRoughness", "Edge roughness", "shape", 0, 1.5, 0.01),
  s("edgeSharpness", "Edge sharpness", "shape", 0, 1, 0.01),
  s("edgeThickness", "Edge thickness", "shape", 0, 0.5, 0.005),
  s("secondaryEdgeOffset", "Secondary edge offset", "shape", 0, 0.16, 0.002),
  s("fragmentAmount", "Fragment amount", "shape", 0, 0.9, 0.01),
  s("holeAmount", "Hole amount", "shape", 0, 0.6, 0.01),
  s("directionalStretch", "Directional stretch", "shape", 0.4, 6, 0.05),
  s("foldAmount", "Fold amount", "shape", 0, 1, 0.01),

  // ── Bubbles ──────────────────────────────────────────────────────────────
  s("bubbleAmount", "Bubble amount", "bubbles", 0, 1.4, 0.01),
  s("bubbleScale", "Bubble scale", "bubbles", 1.5, 12, 0.1, "Cells per unit — higher is smaller bubbles."),
  s("bubbleVariation", "Bubble variation", "bubbles", 0, 1, 0.01),
  s("bubbleInflation", "Bubble inflation", "bubbles", 0.3, 2, 0.01),
  s("bubbleMerge", "Bubble merge", "bubbles", 0, 1, 0.01),
  s("bubbleSpeed", "Bubble speed", "bubbles", 0, 2, 0.01),
  s("bubbleEdgeConcentration", "Edge concentration", "bubbles", 0, 1, 0.01),
  s("pointerInfluence", "Pointer influence", "bubbles", 0, 1.5, 0.01),

  // ── Paper ────────────────────────────────────────────────────────────────
  s("fiberAmount", "Fibre amount", "paper", 0, 1.4, 0.01),
  s("fiberLength", "Fibre length", "paper", 0.6, 5, 0.05),
  s("fiberDirection", "Fibre direction", "paper", 0, 3.14, 0.01, undefined, "rad"),
  s("pulpGrain", "Pulp grain", "paper", 0, 1.2, 0.01),
  s("speckleAmount", "Speckle", "paper", 0, 1, 0.01),
  s("wrinkleAmount", "Wrinkle amount", "paper", 0, 1.2, 0.01),
  s("wrinkleScale", "Wrinkle scale", "paper", 0.4, 6, 0.05),
  s("paperDensity", "Paper density", "paper", 0, 1.2, 0.01),
  s("deckleStrength", "Deckled edge", "paper", 0, 1, 0.01),

  // ── Depth & lighting ─────────────────────────────────────────────────────
  s("surfaceDepth", "Surface depth", "depth", 0, 3, 0.01, "0 is printed paper; 3 is deep inflated foam."),
  s("displacementStrength", "Displacement strength", "depth", 0, 2, 0.01),
  s("lightX", "Light X", "depth", -1, 1, 0.01),
  s("lightY", "Light Y", "depth", -1, 1, 0.01),
  s("lightHeight", "Light height", "depth", 0.1, 2, 0.01),
  s("diffuseStrength", "Diffuse", "depth", 0, 2, 0.01),
  s("rimStrength", "Rim light", "depth", 0, 1.5, 0.01),
  s("specularStrength", "Specular", "depth", 0, 1.5, 0.01),
  s("roughness", "Roughness", "depth", 0, 1, 0.01),
  s("cavityShadow", "Cavity shadow", "depth", 0, 1, 0.01),
  s("castShadowStrength", "Cast shadow", "depth", 0, 1, 0.01),
  s("edgeHighlight", "Edge highlight", "depth", 0, 1.5, 0.01),
  s("undersideDarkness", "Underside darkness", "depth", 0, 0.95, 0.01),

  // ── Gradient ─────────────────────────────────────────────────────────────
  {
    kind: "select",
    key: "paletteMode",
    label: "Palette mode",
    group: "gradient",
    options: PALETTE_MODE_OPTIONS,
  },
  {
    kind: "select",
    key: "cosinePalette",
    label: "Cosine palette",
    group: "gradient",
    options: COSINE_PALETTE_OPTIONS,
    hint: "Used when palette mode is Cosine palette.",
  },
  s("stopCount", "Colour stops", "gradient", 2, 4, 1),
  { kind: "color", key: "color1", label: "Colour 1", group: "gradient" },
  { kind: "color", key: "color2", label: "Colour 2", group: "gradient" },
  { kind: "color", key: "color3", label: "Colour 3", group: "gradient" },
  { kind: "color", key: "color4", label: "Colour 4", group: "gradient" },
  s("gradientAngle", "Gradient angle", "gradient", 0, 3.14, 0.01, undefined, "rad"),
  s("gradientScale", "Gradient scale", "gradient", 0.1, 3, 0.01),
  s("gradientMotion", "Gradient motion", "gradient", 0, 2, 0.01),
  s("hueTravel", "Hue travel", "gradient", 0, 1.5, 0.01),
  s("saturation", "Saturation", "gradient", 0, 2, 0.01),
  s("brightness", "Brightness", "gradient", 0.2, 2, 0.01),
  s("contrast", "Contrast", "gradient", 0.4, 2, 0.01),
  s("colorDistortion", "Colour distortion", "gradient", 0, 2, 0.01, "How much the height field bends the gradient."),
  s("iridescence", "Iridescence", "gradient", 0, 1.2, 0.01),

  // ── Texture & finishing ──────────────────────────────────────────────────
  s("grain", "Grain", "finishing", 0, 0.6, 0.005),
  s("dither", "Dither", "finishing", 0, 2, 0.01, "Breaks up gradient banding at 8-bit output."),
  s("blur", "Blur", "finishing", 0, 1, 0.01, "Softens micro detail and widens the edge feather."),
  s("edgeGlow", "Edge glow", "finishing", 0, 1.2, 0.01),
  s("chromaticSeparation", "Chromatic separation", "finishing", 0, 1, 0.01),
  s("vignette", "Vignette", "finishing", 0, 1, 0.01),
  s("alpha", "Alpha", "finishing", 0.2, 1, 0.01),
  s("textureScale", "Texture scale", "finishing", 0.2, 3, 0.01),
  s("animationSpeed", "Animation speed", "finishing", 0, 3, 0.01),
];

export const CONTROLS_BY_GROUP: Record<ControlGroupId, ControlDefinition[]> =
  CONTROL_GROUP_ORDER.reduce(
    (acc, group) => {
      acc[group] = CONTROL_DEFINITIONS.filter((c) => c.group === group);
      return acc;
    },
    {} as Record<ControlGroupId, ControlDefinition[]>,
  );
