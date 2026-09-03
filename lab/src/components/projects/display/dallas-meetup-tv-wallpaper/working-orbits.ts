/**
 * Idle→Working kick bands. Sparse. Wrap the body, travel with the spin, leave.
 *
 * Source: https://x.ai/news/designing-grok-bot (Benji Taylor avatar motion).
 * TV kick = Working wrap only. Not Thinking, Waiting, Blocked, or Done.
 * Not a held nest. Idle rest has NO orbits. Cube stays clean.
 *
 * 2–3 thick Ver 02 bands, front/back. Not meridians through the fill.
 * Not a wallpaper field of doodles. Flat HEX — no article ribbon gradients.
 */

import { VER02_ORBIT_HUES } from "./grok-cycle";

/** Thick wrap: 8–14px at a 300px face. ~11px. */
export const ORBIT_STROKE_FACE_RATIO = 0.037;

export function orbitStrokePx(faceDiameter: number): number {
  return faceDiameter * ORBIT_STROKE_FACE_RATIO;
}

/** Sparse wrap. Not a 5-filament chat-line cluster. */
export const WORKING_ORBIT_COUNT = 3;

/** Shallow equatorial plane, upper-left → right. Degrees. */
export const ORBIT_PLANE_DEG = -17;

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
 * Kick bands on the mark. Skip when energy is ~0 (Idle rest, settle, leave).
 * `spin` is the traveling head angle (one wrap during whip), not a globe yaw.
 * Thickness stays full; leave by fading, not by thinning into a nest.
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
  const alpha = 0.94 * energy;
  const baseTilt = (ORBIT_PLANE_DEG * Math.PI) / 180;
  const head0 = Math.PI + 0.45 - spin;
  const mid = (WORKING_ORBIT_COUNT - 1) / 2;

  for (let i = 0; i < WORKING_ORBIT_COUNT; i += 1) {
    const planeTilt = baseTilt + (i - mid) * 0.05;
    const head = head0 - i * 0.38;
    const r = radius * (1 + (i - mid) * 0.035);
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
