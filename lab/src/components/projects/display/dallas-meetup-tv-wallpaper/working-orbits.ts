/**
 * Grok Bot WORKING stream — chat-line filaments that orbit the mark.
 *
 * Source: https://x.ai/news/designing-grok-bot (Benji Taylor avatar motion).
 * TV whip = Working only. Not Thinking, Waiting, Blocked, or Done.
 *
 * Filaments travel WITH the planted body (front/back wrap). Not meridians
 * through the fill. Not a wallpaper field of doodles.
 * Idle rest may show the same orbits quiet and parked.
 *
 * Flat Ver 02 HEX. Do not steal the article ribbon gradients.
 */

import { GROK_CHROMATIC_FILLS } from "./grok-cycle";

/** Chat-line stroke ~3.3% of face. ~10px at a 300px face. */
export const ORBIT_STROKE_FACE_RATIO = 0.033;

export function orbitStrokePx(faceDiameter: number): number {
  return faceDiameter * ORBIT_STROKE_FACE_RATIO;
}

/** Chat-line cluster around the mark. Not a hairline nest, not a wallpaper field. */
export const WORKING_ORBIT_COUNT = 5;

/** Shallow equatorial plane, upper-left → right. Degrees. */
export const ORBIT_PLANE_DEG = -17;

/** Bleed past the silhouette at a 300px face. */
export const ORBIT_BLEED_AT_300 = 42;

/** Arc length of one traveling filament (radians). Cluster, not a closed halo. */
export const ORBIT_ARC_LEN = 1.65;

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
 * Chat-line filaments on the mark. Energy is quiet at Idle, full at Working.
 * `spin` is the traveling head angle (one wrap during whip), not a globe yaw.
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

  const lineWidth = orbitStrokePx(faceD) * (0.55 + 0.45 * energy);
  const radius = orbitRadius(bodyR, faceD);
  const alpha = 0.22 + 0.74 * energy;
  const baseTilt = (ORBIT_PLANE_DEG * Math.PI) / 180;
  const head0 = Math.PI + 0.45 - spin;

  for (let i = 0; i < WORKING_ORBIT_COUNT; i += 1) {
    const planeTilt = baseTilt + (i - 2) * 0.028;
    const head = head0 - i * 0.22;
    const r = radius * (1 + (i - 2) * 0.03);
    const color = GROK_CHROMATIC_FILLS[i % GROK_CHROMATIC_FILLS.length]!;
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
