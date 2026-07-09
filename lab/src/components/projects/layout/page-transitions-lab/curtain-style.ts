/**
 * Shared curtain fill helpers — CSS background + Three.js canvas texture.
 */

import type { BufferAttribute, BufferGeometry } from "three";
import type { CurtainGradientMode, CurtainOrigin } from "./types";

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function sanitizeHex(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!HEX.test(trimmed)) return fallback;
  if (trimmed.length === 4) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

export function curtainCssBackground(
  colorA: string,
  colorB: string,
  mode: CurtainGradientMode,
): string {
  const a = sanitizeHex(colorA, "#071018");
  const b = sanitizeHex(colorB, "#10a4ff");
  if (mode === "solid") return a;
  if (mode === "horizontal") {
    return `linear-gradient(90deg, ${a} 0%, ${b} 100%)`;
  }
  return `linear-gradient(180deg, ${a} 0%, ${b} 100%)`;
}

/**
 * Per-strip CSS fill. Horizontal gradients span the full curtain row
 * (background-size / position), so strips don't each repeat A→B.
 */
export function curtainStripCssStyle(
  colorA: string,
  colorB: string,
  mode: CurtainGradientMode,
  index: number,
  count: number,
): {
  background: string;
  backgroundSize?: string;
  backgroundPosition?: string;
} {
  const fill = curtainCssBackground(colorA, colorB, mode);
  if (mode !== "horizontal" || count <= 1) {
    return { background: fill };
  }
  return {
    background: fill,
    backgroundSize: `${count * 100}% 100%`,
    backgroundPosition: `${-index * 100}% 0`,
  };
}

/** Paint a canvas used as a Three.js strip texture (full stage width for horizontal). */
export function paintCurtainTexture(
  colorA: string,
  colorB: string,
  mode: CurtainGradientMode,
  width = 64,
  height = 256,
): HTMLCanvasElement {
  const a = sanitizeHex(colorA, "#071018");
  const b = sanitizeHex(colorB, "#10a4ff");
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(4, width);
  canvas.height = Math.max(4, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  if (mode === "solid") {
    ctx.fillStyle = a;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  }

  const gradient =
    mode === "horizontal"
      ? ctx.createLinearGradient(0, 0, canvas.width, 0)
      : ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, a);
  gradient.addColorStop(1, b);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Remap plane UVs so strip `index` samples a slice of a shared texture. */
export function applyStripUVs(
  geometry: BufferGeometry,
  index: number,
  count: number,
) {
  const uv = geometry.attributes.uv as BufferAttribute;
  const u0 = index / count;
  const span = 1 / count;
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    uv.setX(i, u0 + u * span);
  }
  uv.needsUpdate = true;
}

export function hexToCssNumber(hex: string): number {
  const clean = sanitizeHex(hex, "#071018").slice(1);
  return Number.parseInt(clean, 16);
}

/**
 * Stagger rank for strip `index` under a fall-in / fall-out origin.
 * Lower rank starts earlier. Center uses distance from the middle strip(s).
 */
export function curtainStaggerRank(
  index: number,
  count: number,
  origin: CurtainOrigin,
): number {
  if (count <= 1) return 0;
  if (origin === "right") return count - 1 - index;
  if (origin === "center") {
    const mid = (count - 1) / 2;
    return Math.abs(index - mid);
  }
  return index;
}

/** Max stagger rank for a phase — used for cover / total timing. */
export function curtainMaxStaggerRank(
  count: number,
  origin: CurtainOrigin,
): number {
  if (count <= 1) return 0;
  if (origin === "center") return Math.floor((count - 1) / 2);
  return count - 1;
}
