import type {
  AnimationControlDef,
  AnimationModeDefinition,
  AnimationModeId,
  AnimationModeParams,
} from "../types";

function ctrl(
  key: string,
  label: string,
  min: number,
  max: number,
  step: number,
  defaultValue: number,
): AnimationControlDef {
  return { key, label, min, max, step, defaultValue };
}

function mode(
  partial: Omit<AnimationModeDefinition, "controls"> & {
    controls: AnimationControlDef[];
  },
): AnimationModeDefinition {
  return partial;
}

/**
 * Animation mode catalog — each entry is independently documented.
 * Shader branches by `index`. Add a new mode by appending here + a GLSL branch.
 */
export const ANIMATION_MODES: AnimationModeDefinition[] = [
  mode({
    id: "linear-horizontal",
    label: "Linear Horizontal",
    index: 0,
    purpose: "Steady lateral print drift — premium UI chrome motion.",
    approach: "Phase-shifted luminance band along aspect-corrected X with soft envelope.",
    performance: "Trivial ALU.",
    extension: "Add multi-band harmonics.",
    controls: [
      ctrl("speed", "Speed", 0.05, 3, 0.01, 0.85),
      ctrl("amplitude", "Amplitude", 0, 0.45, 0.01, 0.16),
      ctrl("softness", "Softness", 0.1, 1.5, 0.01, 0.7),
      ctrl("phase", "Phase", 0, 6.28, 0.01, 0),
    ],
  }),
  mode({
    id: "linear-vertical",
    label: "Linear Vertical",
    index: 1,
    purpose: "Vertical wash — editorial column reveals.",
    approach: "Sinusoidal curtain along Y with independent falloff (not rotated horizontal).",
    performance: "Trivial ALU.",
    extension: "Staggered columns.",
    controls: [
      ctrl("speed", "Speed", 0.05, 3, 0.01, 0.7),
      ctrl("amplitude", "Amplitude", 0, 0.45, 0.01, 0.18),
      ctrl("bias", "Bias", -0.3, 0.3, 0.01, 0.05),
      ctrl("shear", "Shear", 0, 0.4, 0.01, 0.12),
    ],
  }),
  mode({
    id: "diagonal",
    label: "Diagonal",
    index: 2,
    purpose: "Oblique print stroke with traveling highlight.",
    approach: "Skewed UV domain + traveling front (≠ 45° rotation of linear).",
    performance: "Trivial ALU.",
    extension: "Cross-hatch dual fronts.",
    controls: [
      ctrl("speed", "Speed", 0.05, 3, 0.01, 0.9),
      ctrl("amplitude", "Amplitude", 0, 0.4, 0.01, 0.2),
      ctrl("skew", "Skew", 0.2, 2.5, 0.01, 1.15),
      ctrl("sharpness", "Sharpness", 0.5, 4, 0.01, 1.8),
    ],
  }),
  mode({
    id: "radial-pulse",
    label: "Radial Pulse",
    index: 3,
    purpose: "Heartbeat energy from a focus — loaders and CTAs.",
    approach: "Expanding radial envelope with exponential decay rings.",
    performance: "Low — distance + exp.",
    extension: "Multi-focus pulses.",
    controls: [
      ctrl("speed", "Pulse Speed", 0.1, 3, 0.01, 1.1),
      ctrl("radius", "Radius", 0.1, 1.2, 0.01, 0.55),
      ctrl("decay", "Decay", 0.5, 4, 0.01, 1.8),
      ctrl("strength", "Strength", 0, 0.5, 0.01, 0.28),
    ],
  }),
  mode({
    id: "ripple",
    label: "Ripple",
    index: 4,
    purpose: "Water-like concentric expansion.",
    approach: "Dispersion relation ω(k) via sin(k·r − ωt)/√r amplitude falloff.",
    performance: "Low — length + sin.",
    extension: "Obstacle reflections.",
    controls: [
      ctrl("speed", "Speed", 0.1, 3, 0.01, 1.2),
      ctrl("frequency", "Frequency", 2, 18, 0.1, 8),
      ctrl("amplitude", "Amplitude", 0, 0.35, 0.01, 0.14),
      ctrl("damping", "Damping", 0.2, 3, 0.01, 1.1),
    ],
  }),
  mode({
    id: "wave",
    label: "Wave",
    index: 5,
    purpose: "Soft flowing print — default premium feel.",
    approach: "Sum of incommensurate traveling waves (not a single sinusoid).",
    performance: "Low — 3 sines.",
    extension: "Gerstner-style crest sharpening.",
    controls: [
      ctrl("speed", "Speed", 0.05, 3, 0.01, 0.75),
      ctrl("amplitude", "Amplitude", 0, 0.4, 0.01, 0.18),
      ctrl("frequency", "Frequency", 0.5, 6, 0.01, 2.2),
      ctrl("phase", "Phase", 0, 6.28, 0.01, 0.4),
      ctrl("direction", "Direction Mix", 0, 1, 0.01, 0.35),
    ],
  }),
  mode({
    id: "spiral",
    label: "Spiral",
    index: 6,
    purpose: "Armature twist — distinctive angular identity.",
    approach: "Polar θ + log-radius phase (Archimedean spiral field).",
    performance: "atan + length.",
    extension: "Multi-arm interference.",
    controls: [
      ctrl("speed", "Speed", 0.05, 3, 0.01, 0.65),
      ctrl("arms", "Arms", 1, 8, 0.1, 2.5),
      ctrl("tightness", "Tightness", 0.5, 4, 0.01, 1.6),
      ctrl("amplitude", "Amplitude", 0, 0.4, 0.01, 0.2),
    ],
  }),
  mode({
    id: "orbit",
    label: "Orbit",
    index: 7,
    purpose: "Satellites of light orbiting a barycenter.",
    approach: "Two orbiting Gaussians with independent angular velocities.",
    performance: "Low — 2 distance fields.",
    extension: "Elliptical orbits.",
    controls: [
      ctrl("radius", "Radius", 0.05, 0.55, 0.01, 0.28),
      ctrl("angular", "Angular Velocity", 0.1, 3, 0.01, 0.9),
      ctrl("offset", "Offset", 0, 3.14, 0.01, 1.2),
      ctrl("strength", "Strength", 0, 0.5, 0.01, 0.3),
    ],
  }),
  mode({
    id: "breathing",
    label: "Breathing",
    index: 8,
    purpose: "Subtle premium UI inhale/exhale.",
    approach: "Smoothstep envelope on soft radial scale (ease-in-out, no snap).",
    performance: "Trivial.",
    extension: "Asymmetric inhale/exhale curves.",
    controls: [
      ctrl("speed", "Speed", 0.05, 2, 0.01, 0.45),
      ctrl("depth", "Depth", 0, 0.35, 0.01, 0.12),
      ctrl("center", "Center Softness", 0.1, 1.2, 0.01, 0.55),
      ctrl("hold", "Hold", 0, 0.8, 0.01, 0.25),
    ],
  }),
  mode({
    id: "bloom",
    label: "Bloom",
    index: 9,
    purpose: "Expanding energy bloom (distinct from material bloom stage).",
    approach: "Time-gated radial energy with delayed secondary wave.",
    performance: "Low.",
    extension: "Color-channel stagger when color materials arrive.",
    controls: [
      ctrl("speed", "Speed", 0.1, 2.5, 0.01, 0.8),
      ctrl("amount", "Bloom Amount", 0, 0.55, 0.01, 0.32),
      ctrl("radius", "Radius", 0.15, 1.2, 0.01, 0.6),
      ctrl("delay", "Secondary Delay", 0, 1.5, 0.01, 0.45),
    ],
  }),
  mode({
    id: "noise-drift",
    label: "Noise Drift",
    index: 10,
    purpose: "Slow organic drift via value-noise domain warp.",
    approach: "FBM domain offset evolving in time (simplex-style hash noise).",
    performance: "Moderate — few noise taps.",
    extension: "True simplex gradients.",
    controls: [
      ctrl("scale", "Noise Scale", 0.5, 6, 0.01, 2.2),
      ctrl("strength", "Noise Strength", 0, 0.35, 0.01, 0.14),
      ctrl("evolution", "Evolution Speed", 0.05, 2, 0.01, 0.55),
      ctrl("octaves", "Detail", 1, 4, 0.1, 2.5),
    ],
  }),
  mode({
    id: "flow-field",
    label: "Flow Field",
    index: 11,
    purpose: "Natural directional advection.",
    approach: "Curl-like flow from finite-difference noise gradients (divergence-free feel).",
    performance: "Moderate — 4 noise samples.",
    extension: "Bake vector field texture.",
    controls: [
      ctrl("strength", "Flow Strength", 0, 0.4, 0.01, 0.16),
      ctrl("scale", "Field Scale", 0.4, 5, 0.01, 1.8),
      ctrl("rotation", "Rotation", 0, 6.28, 0.01, 0.7),
      ctrl("velocity", "Velocity", 0.05, 2.5, 0.01, 0.85),
    ],
  }),
  mode({
    id: "magnetic",
    label: "Magnetic",
    index: 12,
    purpose: "Field distortion toward / away from poles.",
    approach: "Dipole potential ∇(1/r) style warp between two poles.",
    performance: "Low.",
    extension: "Multipole fields.",
    controls: [
      ctrl("strength", "Strength", 0, 0.45, 0.01, 0.22),
      ctrl("separation", "Pole Separation", 0.1, 0.8, 0.01, 0.35),
      ctrl("spin", "Spin", 0, 2, 0.01, 0.55),
      ctrl("falloff", "Falloff", 0.5, 3, 0.01, 1.4),
    ],
  }),
  mode({
    id: "aurora",
    label: "Aurora",
    index: 13,
    purpose: "Organic atmospheric curtains.",
    approach: "Vertical sheets warped by layered noise with slow vertical scroll.",
    performance: "Moderate.",
    extension: "Ribbon secondary sheets.",
    controls: [
      ctrl("speed", "Speed", 0.05, 2, 0.01, 0.4),
      ctrl("warp", "Warp", 0, 0.45, 0.01, 0.22),
      ctrl("bands", "Bands", 1, 6, 0.1, 3.2),
      ctrl("drift", "Drift", 0, 1.5, 0.01, 0.65),
    ],
  }),
  mode({
    id: "turbulence",
    label: "Turbulence",
    index: 14,
    purpose: "Chaotic but controlled agitation.",
    approach: "Domain-warped FBM with incommensurate time channels.",
    performance: "Higher — nested noise.",
    extension: "LOD reduce octaves on mobile.",
    controls: [
      ctrl("scale", "Scale", 0.5, 5, 0.01, 2.4),
      ctrl("strength", "Strength", 0, 0.4, 0.01, 0.18),
      ctrl("speed", "Speed", 0.1, 2.5, 0.01, 0.95),
      ctrl("roughness", "Roughness", 0.3, 1.2, 0.01, 0.72),
    ],
  }),
  mode({
    id: "lava-lamp",
    label: "Lava Lamp",
    index: 15,
    purpose: "Dense organic metaballs.",
    approach: "Sum of rising soft blobs with soft-min merge (metaball field).",
    performance: "Moderate — N blobs.",
    extension: "GPU particle seeds.",
    controls: [
      ctrl("speed", "Speed", 0.05, 2, 0.01, 0.5),
      ctrl("count", "Blob Density", 2, 7, 0.1, 4),
      ctrl("size", "Size", 0.08, 0.4, 0.01, 0.2),
      ctrl("merge", "Merge", 0.2, 1.5, 0.01, 0.75),
    ],
  }),
];

const byId = new Map(ANIMATION_MODES.map((m) => [m.id, m]));
const byIndex = new Map(ANIMATION_MODES.map((m) => [m.index, m]));

export function getAnimationMode(id: AnimationModeId): AnimationModeDefinition {
  const m = byId.get(id);
  if (!m) throw new Error(`Unknown animation mode: ${id}`);
  return m;
}

export function getAnimationModeByIndex(index: number): AnimationModeDefinition | undefined {
  return byIndex.get(index);
}

export function defaultModeParams(id: AnimationModeId): AnimationModeParams {
  const m = getAnimationMode(id);
  const out: AnimationModeParams = {};
  for (const c of m.controls) out[c.key] = c.defaultValue;
  return out;
}

/** Pack named controls into 8 floats (two vec4s) for the shader. */
export function packModeParams(
  id: AnimationModeId,
  params: AnimationModeParams,
): { p0: [number, number, number, number]; p1: [number, number, number, number] } {
  const m = getAnimationMode(id);
  const values = m.controls.map((c) => {
    const v = params[c.key];
    return typeof v === "number" ? v : c.defaultValue;
  });
  while (values.length < 8) values.push(0);
  return {
    p0: [values[0]!, values[1]!, values[2]!, values[3]!],
    p1: [values[4]!, values[5]!, values[6]!, values[7]!],
  };
}

export const AnimationModeCatalog = {
  list: () => ANIMATION_MODES.slice(),
  get: getAnimationMode,
  defaults: defaultModeParams,
  pack: packModeParams,
};
