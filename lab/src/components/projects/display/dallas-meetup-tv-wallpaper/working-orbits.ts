/**
 * Product Working orbit STREAM (x.ai/news/designing-grok-bot).
 *
 * Sparse cluster on a FIXED shallow ~−15° plane. Bands travel around the
 * current still silhouette during the 0.6s whip (front/back), then leave.
 * Morph happens in settle with no ribbons. Do not yaw a closed ring-cage.
 *
 * Flat Ver 02 HEX. Do not steal the article ribbon gradients.
 */

import { VER02_ORBIT_HUES } from "./grok-cycle";

/** ~4.8% of face ≈ one eye-bar. 12–15px at a 300px face. */
export const ORBIT_STROKE_FACE_RATIO = 0.048;

export function orbitStrokePx(faceDiameter: number): number {
  return faceDiameter * ORBIT_STROKE_FACE_RATIO;
}

/** Sparse stream: 2–4, not a hairline nest. */
export const WORKING_ORBIT_COUNT = 3;

/** Shallow equatorial plane, upper-left → right. Degrees. */
export const ORBIT_PLANE_DEG = -17;

/** Bleed past the silhouette at a 300px face. */
export const ORBIT_BLEED_AT_300 = 48;

/** Arc length of one traveling band (radians). Cluster, not a closed halo. */
export const ORBIT_ARC_LEN = 1.85;

export function orbitBleedPx(faceDiameter: number): number {
  return (faceDiameter / 300) * ORBIT_BLEED_AT_300;
}

export function orbitRadius(bodyR: number, faceD: number): number {
  return bodyR + orbitBleedPx(faceD);
}

type Vec3 = { x: number; y: number; z: number };

/** Point on a fixed shallow orbit. No extra Y-yaw of the plane. */
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
 * One Working stream. Energy 0 = skip (Idle). Draw back, then the planted
 * morphing body, then front clipped to that body so the sweep crosses the face.
 * `spin` is the traveling head angle (one wrap), not a globe yaw of the disc.
 */
export function drawWorkingOrbits(
  ctx: CanvasRenderingContext2D,
  bodyR: number,
  faceD: number,
  energy: number,
  spin: number,
  layer: "back" | "front",
): void {
  if (energy < 0.02) return;

  const lineWidth = orbitStrokePx(faceD);
  const radius = orbitRadius(bodyR, faceD);
  const alpha = 0.92 + 0.08 * energy;
  const baseTilt = (ORBIT_PLANE_DEG * Math.PI) / 180;
  // Enter from the back-left, sweep the face, leave to the right.
  const head0 = Math.PI + 0.45 - spin;

  for (let i = 0; i < WORKING_ORBIT_COUNT; i += 1) {
    const planeTilt = baseTilt + (i - 1) * 0.03;
    const head = head0 - i * 0.2;
    const r = radius * (1 + (i - 1) * 0.035);
    const color = VER02_ORBIT_HUES[i % VER02_ORBIT_HUES.length]!;
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
    );
  }
}
