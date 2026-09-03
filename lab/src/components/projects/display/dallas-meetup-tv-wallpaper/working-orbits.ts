/**
 * Kick ribbons. Disc stays black and planted. These wrap, clip, then leave.
 *
 * Article Working (Benji Taylor): thickness ≈ one stadium eye-bar
 * ≈ 8% of face height (~24px at 300px). Rounded hemispherical caps.
 * Distinct paths. Flat HEX. Depth only via occlusion.
 * Tails behind bottom-left. Cross the left eye. Not a nest.
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

/** Sit the wrap on the planted Idle eye line so front ribbons cross the stadiums. */
export const ORBIT_Y_FACE = IDLE_EYE.cy;

/** Bleed past the silhouette at a 300px face. */
export const ORBIT_BLEED_AT_300 = 42;

/** Arc length of one traveling band (radians). Wrap, not a closed halo. */
export const ORBIT_ARC_LEN = 1.85;

export function orbitBleedPx(faceDiameter: number): number {
  return (faceDiameter / 300) * ORBIT_BLEED_AT_300;
}

export function orbitRadius(bodyR: number, faceD: number): number {
  return bodyR + orbitBleedPx(faceD);
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
 * Kick bands on the mark. Skip when energy is ~0 (Idle rest, settle, leave).
 * `ribbonPhase` is the traveling head — not a globe yaw of the disc.
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
  const alpha = 0.94 * energy;
  const baseTilt = (ORBIT_PLANE_DEG * Math.PI) / 180;
  // Start behind bottom-left, wrap across the face, leave.
  const head0 = Math.PI * 1.25 - ribbonPhase;
  const mid = (WORKING_ORBIT_COUNT - 1) / 2;
  const yBias = (faceD * 0.5) * ORBIT_Y_FACE;

  for (let i = 0; i < WORKING_ORBIT_COUNT; i += 1) {
    const planeTilt = baseTilt + (i - mid) * 0.05;
    const head = head0 - i * 0.38;
    const r = radius * (1 + (i - mid) * 0.035);
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
