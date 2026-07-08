/**
 * Shared curtain fill helpers — CSS background + Three.js canvas texture.
 */

import type { CurtainGradientMode } from "./types";

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

/** Paint a small canvas used as a Three.js strip texture. */
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

export function hexToCssNumber(hex: string): number {
  const clean = sanitizeHex(hex, "#071018").slice(1);
  return Number.parseInt(clean, 16);
}
