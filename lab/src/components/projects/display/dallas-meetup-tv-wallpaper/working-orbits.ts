/**
 * Kick nest around the black Grok disc only.
 *
 * EPG inspect: ~8–10 even orbits at 3% of head (~9px @ 300).
 * Wrap front and back around the whole disc. Not 2–4 Working capsules.
 * Not a tapered mid-arc (~8%/24px). Not a solid ring.
 */

import type { KickRibbonPlan } from "./grok-cycle";
import { IDLE_EYE } from "./grok-eyes";

/** EPG Thinking lock: 3% of head diameter. ~9px at a 300px face. Even weight. */
export const ORBIT_STROKE_FACE_RATIO = 0.03;

export function orbitStrokePx(faceDiameter: number): number {
  return faceDiameter * ORBIT_STROKE_FACE_RATIO;
}

/** Nest of many thin lines — article Thinking, not a 2–4 Working wrap. */
export const WORKING_ORBIT_COUNT = 9;

/** Small equatorial bias. Degrees. Inclination spread does the nest. */
export const ORBIT_PLANE_DEG = -15;

/** Total inclination span across the nest (radians). Covers the disc. */
export const ORBIT_INCL_SPAN = 2.05;

/** Default y-bias when the caller does not pass the current gaze. */
export const ORBIT_Y_FACE = IDLE_EYE.cy;

/** Inner nest radius as a fraction of the face radius. */
export const ORBIT_RADIUS_FACE = 0.92;

/** Step between the three radius families (inner / hug / outer loop). */
export const ORBIT_RADIUS_STEP = 0.18;

/** Arc length of one traveling stroke (radians). Partial — not a closed ring. */
export const ORBIT_ARC_LEN = 2.05;

/** Inclination step leftover name — tests assert the nest is open. */
export const ORBIT_PLANE_SPREAD = ORBIT_INCL_SPAN / (WORKING_ORBIT_COUNT - 1);

/** Angular spacing between band heads (radians). */
export const ORBIT_PHASE_SPREAD = 0.58;

export function orbitRadius(bodyR: number, faceD?: number): number {
  void faceD;
  return bodyR * ORBIT_RADIUS_FACE;
}

type Vec3 = { x: number; y: number; z: number };

function orbitPoint(theta: number, radius: number, incl: number, azim: number): Vec3 {
  const x0 = radius * Math.cos(theta);
  const z0 = radius * Math.sin(theta);
  const ci = Math.cos(incl);
  const si = Math.sin(incl);
  const x1 = x0 * ci;
  const y1 = x0 * si;
  const z1 = z0;
  const ca = Math.cos(azim);
  const sa = Math.sin(azim);
  return {
    x: x1 * ca + z1 * sa,
    y: y1,
    z: -x1 * sa + z1 * ca,
  };
}

function strokeArc(
  ctx: CanvasRenderingContext2D,
  layer: "back" | "front",
  radius: number,
  incl: number,
  azim: number,
  head: number,
  arcLen: number,
  strokePx: number,
  color: string,
  alpha: number,
  yBias: number,
): void {
  const steps = 48;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = strokePx;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  let started = false;
  for (let s = 0; s <= steps; s += 1) {
    const t = s / steps;
    const theta = head - t * arcLen;
    const p = orbitPoint(theta, radius, incl, azim);
    p.y += yBias;
    const onLayer = layer === "back" ? p.z <= 0 : p.z > 0;
    if (!onLayer) {
      if (started) {
        ctx.stroke();
        ctx.beginPath();
        started = false;
      }
      continue;
    }
    if (!started) {
      ctx.moveTo(p.x, p.y);
      started = true;
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }
  if (started) ctx.stroke();
  ctx.restore();
}

/**
 * Kick nest on the Grok disc. Skip when energy is ~0 (Idle rest, settle, leave).
 * `ribbonPhase` is the traveling head — not a body yaw.
 * `plan` is this kick's Ver 02 assignment + placement jitter.
 * `eyeYFace` follows the gaze pair so front lines cross the stadiums.
 */
export function drawWorkingOrbits(
  ctx: CanvasRenderingContext2D,
  bodyR: number,
  faceD: number,
  energy: number,
  ribbonPhase: number,
  layer: "back" | "front",
  plan: readonly KickRibbonPlan[],
  eyeYFace: number = ORBIT_Y_FACE,
): void {
  if (energy < 0.02) return;

  const strokePx = orbitStrokePx(faceD);
  const n = WORKING_ORBIT_COUNT;
  const alpha = energy;
  const incl0 = (ORBIT_PLANE_DEG * Math.PI) / 180;
  const yBias0 = bodyR * eyeYFace;

  for (let i = 0; i < n; i += 1) {
    const band = plan[i % plan.length];
    if (!band) continue;
    const u = n <= 1 ? 0.5 : i / (n - 1);
    const incl = incl0 + (u - 0.5) * ORBIT_INCL_SPAN + band.planeJitter;
    const azim = i * 2.399 + band.azimJitter;
    const dir = i % 2 === 0 ? 1 : -1.12;
    const head = dir * ribbonPhase + i * ORBIT_PHASE_SPREAD + band.phaseJitter;
    const r = bodyR * (ORBIT_RADIUS_FACE + (i % 3) * ORBIT_RADIUS_STEP + band.radiusJitter);
    const arcLen = ORBIT_ARC_LEN + band.arcJitter;
    const yBias = yBias0 + bodyR * band.yJitter;
    strokeArc(
      ctx,
      layer,
      r,
      incl,
      azim,
      head,
      arcLen,
      strokePx,
      band.hue,
      alpha,
      yBias,
    );
  }
}
