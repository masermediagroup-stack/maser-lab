/**
 * Product Working orbit STREAM (x.ai/news/designing-grok-bot).
 *
 * Official Working is 2–5 thick ribbons, rounded caps, true wrap front/back
 * that CROSS THE EYES, then a gap, then they come back. Frames with no ribbons
 * are that GAP, not Idle.
 *
 * TV: Idle → one kick (morph + ribbons + eye-whip) → Idle on the new body.
 * Body stays planted. Shallow ~−15° plane, wrap the morphing silhouette.
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
export const ORBIT_BLEED_AT_300 = 55;

export function orbitBleedPx(faceDiameter: number): number {
  return (faceDiameter / 300) * ORBIT_BLEED_AT_300;
}

export function orbitRadius(bodyR: number, faceD: number): number {
  return bodyR + orbitBleedPx(faceD);
}

type Vec3 = { x: number; y: number; z: number };

/**
 * Point on a shallow orbit: equatorial ring, tilt around Z (~−15°), then yaw Y.
 */
function orbitPoint(
  theta: number,
  radius: number,
  planeTilt: number,
  yaw: number,
): Vec3 {
  const x0 = radius * Math.cos(theta);
  const z0 = radius * Math.sin(theta);
  const ct = Math.cos(planeTilt);
  const st = Math.sin(planeTilt);
  const x1 = x0 * ct;
  const y1 = x0 * st;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  return {
    x: x1 * cy + z0 * sy,
    y: y1,
    z: -x1 * sy + z0 * cy,
  };
}

function drawRibbonPass(
  ctx: CanvasRenderingContext2D,
  layer: "back" | "front",
  radius: number,
  planeTilt: number,
  yaw: number,
  lineWidth: number,
  color: string,
  alpha: number,
): void {
  const steps = 128;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  let drawing = false;
  for (let s = 0; s <= steps; s += 1) {
    const theta = (s / steps) * Math.PI * 2;
    const p = orbitPoint(theta, radius, planeTilt, yaw);
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
  const alpha = 0.9 + 0.1 * energy;
  const baseTilt = (ORBIT_PLANE_DEG * Math.PI) / 180;

  for (let i = 0; i < WORKING_ORBIT_COUNT; i += 1) {
    const planeTilt = baseTilt + (i - 1) * 0.035;
    const yaw = spin + i * 0.22;
    const r = radius * (1 + (i - 1) * 0.04);
    const color = VER02_ORBIT_HUES[i % VER02_ORBIT_HUES.length]!;
    drawRibbonPass(ctx, layer, r, planeTilt, yaw, lineWidth, color, alpha);
  }
}
