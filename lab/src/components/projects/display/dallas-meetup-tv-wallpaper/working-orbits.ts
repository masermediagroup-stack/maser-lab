/**
 * Product Working orbit STREAM (x.ai/news/designing-grok-bot).
 *
 * Official Working is 2–5 thick ribbons, rounded caps, true wrap front/back
 * that CROSS THE EYES, then a gap, then they come back. That loop is Working.
 * Frames with no ribbons are the GAP, not Idle, not “Working has no orbits.”
 *
 * TV loop does not hold Working: Idle → one kick (one stream wraps and leaves)
 * → Idle. Do not park bands after the kick. Do not run the stream through rest.
 *
 * Craft from the Working frames, not the blank beat. Flat Ver 02 HEX — do not
 * steal the article ribbon gradients.
 */

import { VER02_ORBIT_HUES } from "./grok-cycle";

/** ~4.5% of face ≈ one eye-bar. 12–15px at a 300px face. */
export const ORBIT_STROKE_FACE_RATIO = 0.045;

export function orbitStrokePx(faceDiameter: number): number {
  return faceDiameter * ORBIT_STROKE_FACE_RATIO;
}

/** Sparse stream: 2–4, not a hairline nest. */
export const WORKING_ORBIT_COUNT = 4;

type Vec3 = { x: number; y: number; z: number };

function ringPoint(
  theta: number,
  radius: number,
  inclination: number,
  yaw: number,
): Vec3 {
  const x0 = radius * Math.cos(theta);
  const z0 = radius * Math.sin(theta);
  const ci = Math.cos(inclination);
  const si = Math.sin(inclination);
  const y1 = -z0 * si;
  const z1 = z0 * ci;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  return {
    x: x0 * cy + z1 * sy,
    y: y1,
    z: -x0 * sy + z1 * cy,
  };
}

function drawRibbonPass(
  ctx: CanvasRenderingContext2D,
  layer: "back" | "front",
  radius: number,
  inclination: number,
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
    const p = ringPoint(theta, radius, inclination, yaw);
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
 * One Working stream. Energy 0 = skip (Idle rest, settle, and the Working gap
 * at the ends of the kick). Draw back, then body+eyes, then front OVER the face.
 * `bodyR` is the current silhouette's max radius in pixels.
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
  const radius = bodyR * 0.96;
  const alpha = 0.88 + 0.12 * energy;

  for (let i = 0; i < WORKING_ORBIT_COUNT; i += 1) {
    const inclination = 0.32 + i * 0.29;
    const yaw = spin + i * 0.7;
    const color = VER02_ORBIT_HUES[i % VER02_ORBIT_HUES.length]!;
    drawRibbonPass(
      ctx,
      layer,
      radius,
      inclination,
      yaw,
      lineWidth,
      color,
      alpha,
    );
  }
}
