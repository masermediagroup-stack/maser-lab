import { Quaternion, Vector3 } from "three";
import type { AnimationSettings } from "../types";

const AXIS_MAP: Record<"x" | "y" | "z", Vector3> = {
  x: new Vector3(1, 0, 0),
  y: new Vector3(0, 1, 0),
  z: new Vector3(0, 0, 1),
};

export function resolveSpinAxis(settings: AnimationSettings): Vector3 {
  if (settings.axis === "custom") {
    const axis = new Vector3(
      settings.customAxis.x,
      settings.customAxis.y,
      settings.customAxis.z,
    );
    if (axis.lengthSq() < 1e-8) return AXIS_MAP.y.clone();
    return axis.normalize();
  }
  return AXIS_MAP[settings.axis].clone();
}

export function spinSign(direction: AnimationSettings["direction"]): number {
  return direction === "cw" ? -1 : 1;
}

export function applyEasing(t: number, easing: AnimationSettings["easing"]): number {
  const x = Math.min(1, Math.max(0, t));
  if (easing === "linear") return x;
  if (easing === "smooth") {
    return x * x * (3 - 2 * x);
  }
  return x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2;
}

export function rotationForFrame(options: {
  start: Quaternion;
  settings: AnimationSettings;
  frameIndex: number;
  totalFrames: number;
}): Quaternion {
  const { start, settings, frameIndex, totalFrames } = options;
  const t = totalFrames <= 1 ? 0 : frameIndex / totalFrames;
  const eased = applyEasing(t, settings.easing);
  const angle =
    spinSign(settings.direction) * eased * settings.turns * Math.PI * 2;
  const q = start.clone();
  q.multiply(new Quaternion().setFromAxisAngle(resolveSpinAxis(settings), angle));
  return q;
}

export function sequenceFrameCount(fps: number, duration: number): number {
  return Math.max(1, Math.round(fps * duration));
}
