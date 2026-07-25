import type { EasingId } from "./transition-types";

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Out-biased easing family. A full-screen mask arriving with any bounce reads
 * as a rendering glitch, so `back` is the only curve with overshoot and it is
 * deliberately shallow.
 */
const EASING_FNS: Record<EasingId, (t: number) => number> = {
  linear: (t) => t,
  quad: (t) => 1 - (1 - t) ** 2,
  cubic: (t) => 1 - (1 - t) ** 3,
  quart: (t) => 1 - (1 - t) ** 4,
  quint: (t) => 1 - (1 - t) ** 5,
  expo: (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  circ: (t) => Math.sqrt(1 - (t - 1) ** 2),
  back: (t) => {
    const c1 = 1.18;
    const c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
  },
};

export const EASING_OPTIONS: { value: EasingId; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "quad", label: "Out quad" },
  { value: "cubic", label: "Out cubic" },
  { value: "quart", label: "Out quart" },
  { value: "quint", label: "Out quint" },
  { value: "expo", label: "Out expo" },
  { value: "circ", label: "Out circ" },
  { value: "back", label: "Out back" },
];

export function applyEasing(id: EasingId, t: number): number {
  return (EASING_FNS[id] ?? EASING_FNS.cubic)(clamp01(t));
}

/**
 * Reshapes an eased value so the edge can start slow and whip across, or start
 * fast and drift in. `velocity` of 1 is a no-op; >1 back-loads the travel.
 */
export function shapeVelocity(eased: number, velocity: number): number {
  if (Math.abs(velocity - 1) < 0.001) return eased;
  return clamp01(eased) ** velocity;
}

/**
 * Adds a small forward push past the target before the edge settles back.
 * Applied to the *edge position*, not the phase clock, so the sheet visibly
 * over-travels rather than the whole animation rubber-banding.
 */
export function applyOvershoot(
  value: number,
  progress: number,
  overshoot: number,
): number {
  if (overshoot <= 0.0001) return value;
  const bump = Math.sin(clamp01(progress) * Math.PI) * overshoot * 0.12;
  return value + bump;
}

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0 || 1e-6));
  return t * t * (3 - 2 * t);
};
