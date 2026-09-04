/**
 * Kick ribbons around the official Grok head only.
 *
 * Thickness ≈ one stadium eye-bar ≈ 8% of face height (~24px at 300px).
 * Rounded hemispherical caps. Distinct paths. Flat HEX.
 * Centerline hugs the head so bands are visible (not a 42px halo outside clip).
 */

import { IDLE_EYE } from "./grok-eyes";

/** Article lock: ~8% of face height. ~24px at a 300px face. */
export const ORBIT_STROKE_FACE_RATIO = 0.08;

export function orbitStrokePx(faceDiameter: number): number {
  return faceDiameter * ORBIT_STROKE_FACE_RATIO;
}

/** Sparse wrap. 2–4 thick bands. */
export const WORKING_ORBIT_COUNT = 3;

/** Shallow equatorial plane. Degrees. */
export const ORBIT_PLANE_DEG = -15;

/** Sit the wrap on the planted eye line so front ribbons cross the stadiums. */
export const ORBIT_Y_FACE = IDLE_EYE.cy;

/**
 * Centerline as a fraction of the face radius. Must stay on the head
 * so clipped front bands actually paint (live never showed ribbons).
 */
export const ORBIT_RADIUS_FACE = 0.9;

/** Arc length of one traveling band (radians). Wrap, not a closed halo. */
export const ORBIT_ARC_LEN = 1.85;

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

function drawRibbonArc(
  ctx: CanvasRenderingContext2D,
  layer: "back" | "front",
  radius: number,
  planeTilt: number,
  head: number,
  arcLen: number,
  lineWidth: number,
  color: string,
  alpha: number,
  yBias: number,
): void {
  const steps = 64;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  let drawing = false;
  for (let s = 0; s <= steps; s += 1) {
    const t = s / steps;
    const theta = head - t * arcLen;
    const p = orbitPoint(theta, radius, planeTilt);
    p.y += yBias;
    const onLayer = layer === "back" ? p.z <= 0 : p.z > 0;
    if (!onLayer) {
      drawing = false;
      continue;
    }
    if (!drawing) {
      ctx.moveTo(p.x, p.y);
      drawing = true;
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Kick bands on the Grok head. Skip when energy is ~0 (Idle rest, settle, leave).
 * `ribbonPhase` is the traveling head — not a body yaw.
 * `hues` are this kick's Ver 02 chromatic assignment.
 */
export function drawWorkingOrbits(
  ctx: CanvasRenderingContext2D,
  bodyR: number,
  faceD: number,
  energy: number,
  ribbonPhase: number,
  layer: "back" | "front",
  hues: readonly string[],
): void {
  if (energy < 0.02) return;

  const lineWidth = orbitStrokePx(faceD);
  const radius = orbitRadius(bodyR, faceD);
  const alpha = energy;
  const baseTilt = (ORBIT_PLANE_DEG * Math.PI) / 180;
  const head0 = Math.PI * 1.25 - ribbonPhase;
  const mid = (WORKING_ORBIT_COUNT - 1) / 2;
  const yBias = bodyR * ORBIT_Y_FACE;

  for (let i = 0; i < WORKING_ORBIT_COUNT; i += 1) {
    const planeTilt = baseTilt + (i - mid) * 0.05;
    const head = head0 - i * 0.38;
    const r = radius * (1 + (i - mid) * 0.028);
    const color = hues[i % hues.length] ?? hues[0];
    if (!color) continue;
    drawRibbonArc(
      ctx,
      layer,
      r,
      planeTilt,
      head,
      ORBIT_ARC_LEN,
      lineWidth,
      color,
      alpha,
      yBias,
    );
  }
}
