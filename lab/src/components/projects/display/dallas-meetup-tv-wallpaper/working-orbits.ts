/**
 * Kick lines around the black Grok disc only.
 *
 * Thinking weight: even hairline stroke, sparse nest, spread around the disc.
 * Not thick Working capsules. Not a tapered mid-arc.
 * Centerline hugs the disc so clipped front lines actually paint.
 */

import type { KickRibbonPlan } from "./grok-cycle";
import { IDLE_EYE } from "./grok-eyes";

/** Thinking lock: ~1% of face height. ~3px at a 300px face. Even weight. */
export const ORBIT_STROKE_FACE_RATIO = 0.01;

export function orbitStrokePx(faceDiameter: number): number {
  return faceDiameter * ORBIT_STROKE_FACE_RATIO;
}

/** Sparse wrap. 2–4 thin lines. */
export const WORKING_ORBIT_COUNT = 3;

/** Shallow equatorial plane. Degrees. */
export const ORBIT_PLANE_DEG = -15;

/** Default y-bias when the caller does not pass the current gaze. */
export const ORBIT_Y_FACE = IDLE_EYE.cy;

/**
 * Centerline as a fraction of the face radius. Must stay on the disc
 * so clipped front bands actually paint.
 */
export const ORBIT_RADIUS_FACE = 0.9;

/** Arc length of one traveling line (radians). Wrap, not a closed halo. */
export const ORBIT_ARC_LEN = 1.85;

/** Extra plane spread between bands (radians). Open the nest a bit. */
export const ORBIT_PLANE_SPREAD = 0.32;

/** Extra angular spacing between band heads (radians). */
export const ORBIT_PHASE_SPREAD = 1.12;

export function orbitRadius(bodyR: number, faceD?: number): number {
  void faceD;
  return bodyR * ORBIT_RADIUS_FACE;
}

type Vec3 = { x: number; y: number; z: number };

function orbitPoint(theta: number, radius: number, planeTilt: number): Vec3 {
  const x0 = radius * Math.cos(theta);
  const z0 = radius * Math.sin(theta);
  const ct = Math.cos(planeTilt);
  const st = Math.sin(planeTilt);
  return {
    x: x0 * ct,
    y: x0 * st,
    z: z0,
  };
}

function strokeArc(
  ctx: CanvasRenderingContext2D,
  layer: "back" | "front",
  radius: number,
  planeTilt: number,
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
    const p = orbitPoint(theta, radius, planeTilt);
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
 * Kick lines on the Grok disc. Skip when energy is ~0 (Idle rest, settle, leave).
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
  const radius = orbitRadius(bodyR, faceD);
  const alpha = energy;
  const baseTilt = (ORBIT_PLANE_DEG * Math.PI) / 180;
  const head0 = Math.PI * 1.25 - ribbonPhase;
  const mid = (WORKING_ORBIT_COUNT - 1) / 2;
  const yBias0 = bodyR * eyeYFace;

  for (let i = 0; i < WORKING_ORBIT_COUNT; i += 1) {
    const band = plan[i % plan.length];
    if (!band) continue;
    const planeTilt = baseTilt + (i - mid) * ORBIT_PLANE_SPREAD + band.planeJitter;
    const head = head0 - i * ORBIT_PHASE_SPREAD + band.phaseJitter;
    const r = radius * (1 + (i - mid) * 0.12 + band.radiusJitter);
    const arcLen = ORBIT_ARC_LEN + band.arcJitter;
    const yBias = yBias0 + bodyR * band.yJitter;
    strokeArc(
      ctx,
      layer,
      r,
      planeTilt,
      head,
      arcLen,
      strokePx,
      band.hue,
      alpha,
      yBias,
    );
  }
}
