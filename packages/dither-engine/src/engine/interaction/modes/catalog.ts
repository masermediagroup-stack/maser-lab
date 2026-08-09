import type { InteractionModeId } from "../types";

export type InteractionModeDefinition = {
  id: InteractionModeId;
  label: string;
  index: number;
  purpose: string;
  approach: string;
  performance: string;
  extension: string;
};

export const INTERACTION_MODES: InteractionModeDefinition[] = [
  {
    id: "follow",
    label: "Follow",
    index: 0,
    purpose: "Premium direct tracking with critically-damped interpolation.",
    approach: "Exponential smooth toward target with dead-zone + velocity feedforward.",
    performance: "Trivial.",
    extension: "Per-axis lag asymmetry.",
  },
  {
    id: "spring",
    label: "Spring",
    index: 1,
    purpose: "Physical spring pull — VisionOS-like soft settle.",
    approach: "Hooke spring (k·Δx) − friction·v, integrated with mass.",
    performance: "Trivial.",
    extension: "Nonlinear spring curves.",
  },
  {
    id: "magnetic",
    label: "Magnetic",
    index: 2,
    purpose: "Attraction inside falloff radius; idle outside.",
    approach: "Inverse-square field toward pointer when |Δ| < radius.",
    performance: "Trivial.",
    extension: "Multipole magnets.",
  },
  {
    id: "sticky",
    label: "Sticky",
    index: 3,
    purpose: "Snap-and-hold with hysteresis release.",
    approach: "Capture when close; release only past larger exit threshold.",
    performance: "Trivial.",
    extension: "Multi-anchor sticky pads.",
  },
  {
    id: "gravity",
    label: "Gravity",
    index: 4,
    purpose: "Constant acceleration toward pointer with terminal velocity.",
    approach: "a = accel · normalize(Δ); clamp speed; friction coast.",
    performance: "Trivial.",
    extension: "Orbital gravity wells.",
  },
  {
    id: "repel",
    label: "Repel",
    index: 5,
    purpose: "Surface pushes away from contact.",
    approach: "Force = −normalize(Δ) / (r²+ε) within radius; soft restore to rest.",
    performance: "Trivial.",
    extension: "Directional wind repel.",
  },
  {
    id: "orbit-pointer",
    label: "Orbit Pointer",
    index: 6,
    purpose: "Highlight orbits the contact point.",
    approach: "Angular velocity around live target at fixed radius.",
    performance: "Trivial.",
    extension: "Elliptical orbits.",
  },
  {
    id: "elastic",
    label: "Elastic",
    index: 7,
    purpose: "Underdamped overshoot — playful but controlled.",
    approach: "Spring with low friction (ζ < 1); soft clamp max excursion.",
    performance: "Trivial.",
    extension: "Rubber-band constraints.",
  },
  {
    id: "pressure",
    label: "Pressure",
    index: 8,
    purpose: "Hold depth modulates follow radius and intensity.",
    approach: "Follow + charge accumulator drives radius multiplier.",
    performance: "Trivial.",
    extension: "True force-touch when available.",
  },
  {
    id: "ripple",
    label: "Ripple",
    index: 9,
    purpose: "Interaction biased toward ripple spawning on contact.",
    approach: "Soft follow + automatic ripple emit on move/down.",
    performance: "Low — ripple field.",
    extension: "Wave interference.",
  },
  {
    id: "none",
    label: "None",
    index: 10,
    purpose: "Disable pointer physics; lights stay scripted.",
    approach: "Hold rest pose; ignore target.",
    performance: "None.",
    extension: "Programmatic only.",
  },
];

const byId = new Map(INTERACTION_MODES.map((m) => [m.id, m]));

export function getInteractionMode(id: InteractionModeId): InteractionModeDefinition {
  const m = byId.get(id);
  if (!m) throw new Error(`Unknown interaction mode: ${id}`);
  return m;
}

export const InteractionModeCatalog = {
  list: () => INTERACTION_MODES.slice(),
  get: getInteractionMode,
};
