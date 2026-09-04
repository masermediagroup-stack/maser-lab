/**
 * Kick ribbons around the black Grok disc only.
 *
 * Thickness ≈ one stadium eye-bar at the fat mid-arc (~8–11% of face).
 * Taper toward rounded caps. Spread around the disc — not a tight nest.
 * Centerline hugs the disc so clipped front bands actually paint.
 */

import type { KickRibbonPlan } from "./grok-cycle";
import { IDLE_EYE } from "./grok-eyes";

/** Article lock: ~8% of face height at the mid-arc. ~24px at a 300px face. */
export const ORBIT_STROKE_FACE_RATIO = 0.08;
/** Peak width vs mid-arc lock. Caps taper below this. */
export const ORBIT_MID_SCALE = 1.35;
/** End width vs mid-arc lock, before the round cap. */
export const ORBIT_CAP_SCALE = 0.42;

export function orbitStrokePx(faceDiameter: number): number {
  return faceDiameter * ORBIT_STROKE_FACE_RATIO;
}

/** Sparse wrap. 2–4 thick bands. */
export const WORKING_ORBIT_COUNT = 3;

/** Shallow equatorial plane. Degrees. */
export const ORBIT_PLANE_DEG = -15;

/** Sit the wrap on the planted Idle eye line so front ribbons cross the stadiums. */
export const ORBIT_Y_FACE = IDLE_EYE.cy;

/**
 * Centerline as a fraction of the face radius. Must stay on the disc
 * so clipped front bands actually paint.
 */
export const ORBIT_RADIUS_FACE = 0.9;

/** Arc length of one traveling band (radians). Wrap, not a closed halo. */
export const ORBIT_ARC_LEN = 1.85;

/** Extra plane spread between bands (radians). Not a nest. */
export const ORBIT_PLANE_SPREAD = 0.2;

/** Extra angular spacing between band heads (radians). */
export const ORBIT_PHASE_SPREAD = 0.82;

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

function halfWidthAt(t: number, midWidth: number): number {
  const envelope = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI);
  const scale = ORBIT_CAP_SCALE + (ORBIT_MID_SCALE - ORBIT_CAP_SCALE) * envelope;
  return (midWidth * scale) * 0.5;
}

function drawTaperedRibbon(
  ctx: CanvasRenderingContext2D,
  layer: "back" | "front",
  radius: number,
  planeTilt: number,
  head: number,
  arcLen: number,
  midWidth: number,
  color: string,
  alpha: number,
  yBias: number,
): void {
  const steps = 48;
  type Pt = { x: number; y: number; t: number };
  const pts: Pt[] = [];
  for (let s = 0; s <= steps; s += 1) {
    const t = s / steps;
    const theta = head - t * arcLen;
    const p = orbitPoint(theta, radius, planeTilt);
    p.y += yBias;
    const onLayer = layer === "back" ? p.z <= 0 : p.z > 0;
    if (!onLayer) {
      if (pts.length > 1) {
        fillStrip(ctx, pts, midWidth, color, alpha);
        pts.length = 0;
      }
      continue;
    }
    pts.push({ x: p.x, y: p.y, t });
  }
  if (pts.length > 1) fillStrip(ctx, pts, midWidth, color, alpha);
}

function fillStrip(
  ctx: CanvasRenderingContext2D,
  pts: Array<{ x: number; y: number; t: number }>,
  midWidth: number,
  color: string,
  alpha: number,
): void {
  const left: Array<{ x: number; y: number }> = [];
  const right: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < pts.length; i += 1) {
    const prev = pts[i - 1] ?? pts[i]!;
    const next = pts[i + 1] ?? pts[i]!;
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const hw = halfWidthAt(pts[i]!.t, midWidth);
    left.push({ x: pts[i]!.x + nx * hw, y: pts[i]!.y + ny * hw });
    right.push({ x: pts[i]!.x - nx * hw, y: pts[i]!.y - ny * hw });
  }

  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(left[0]!.x, left[0]!.y);
  for (let i = 1; i < left.length; i += 1) ctx.lineTo(left[i]!.x, left[i]!.y);
  for (let i = right.length - 1; i >= 0; i -= 1) ctx.lineTo(right[i]!.x, right[i]!.y);
  ctx.closePath();
  ctx.fill();

  const startW = halfWidthAt(pts[0]!.t, midWidth);
  const endW = halfWidthAt(pts[pts.length - 1]!.t, midWidth);
  ctx.beginPath();
  ctx.arc(pts[0]!.x, pts[0]!.y, startW, 0, Math.PI * 2);
  ctx.arc(pts[pts.length - 1]!.x, pts[pts.length - 1]!.y, endW, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Kick bands on the Grok disc. Skip when energy is ~0 (Idle rest, settle, leave).
 * `ribbonPhase` is the traveling head — not a body yaw.
 * `plan` is this kick's Ver 02 assignment + placement jitter.
 */
export function drawWorkingOrbits(
  ctx: CanvasRenderingContext2D,
  bodyR: number,
  faceD: number,
  energy: number,
  ribbonPhase: number,
  layer: "back" | "front",
  plan: readonly KickRibbonPlan[],
): void {
  if (energy < 0.02) return;

  const midWidth = orbitStrokePx(faceD);
  const radius = orbitRadius(bodyR, faceD);
  const alpha = energy;
  const baseTilt = (ORBIT_PLANE_DEG * Math.PI) / 180;
  const head0 = Math.PI * 1.25 - ribbonPhase;
  const mid = (WORKING_ORBIT_COUNT - 1) / 2;
  const yBias0 = bodyR * ORBIT_Y_FACE;

  for (let i = 0; i < WORKING_ORBIT_COUNT; i += 1) {
    const band = plan[i % plan.length];
    if (!band) continue;
    const planeTilt = baseTilt + (i - mid) * ORBIT_PLANE_SPREAD + band.planeJitter;
    const head = head0 - i * ORBIT_PHASE_SPREAD + band.phaseJitter;
    const r = radius * (1 + (i - mid) * 0.07 + band.radiusJitter);
    const arcLen = ORBIT_ARC_LEN + band.arcJitter;
    const yBias = yBias0 + bodyR * band.yJitter;
    drawTaperedRibbon(
      ctx,
      layer,
      r,
      planeTilt,
      head,
      arcLen,
      midWidth,
      band.hue,
      alpha,
      yBias,
    );
  }
}
