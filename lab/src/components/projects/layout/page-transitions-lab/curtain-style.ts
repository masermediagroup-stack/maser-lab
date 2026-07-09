/**
 * Shared curtain fill helpers — CSS background + Three.js canvas texture.
 */

import {
  BufferAttribute,
  type BufferGeometry,
  PlaneGeometry,
} from "three";
import type {
  CurtainDirection,
  CurtainEdge,
  CurtainGradientMode,
  CurtainOrigin,
} from "./types";

/** How far decorative tips hang past the cover line, as a fraction of cover height. */
export const CURTAIN_HEM_RATIO = 0.14;

/** Leading hem side while entering from `dir`. */
export function curtainLeadingSideIn(
  dir: CurtainDirection,
): "top" | "bottom" {
  // From top → traveling down → bottom hem. From bottom → traveling up → top hem.
  return dir === "top" ? "bottom" : "top";
}

/** Leading hem side while exiting toward `dir`. */
export function curtainLeadingSideOut(
  dir: CurtainDirection,
): "top" | "bottom" {
  // Toward top → traveling up → top hem. Toward bottom → traveling down → bottom hem.
  return dir === "top" ? "top" : "bottom";
}

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

/**
 * Hang amount (0..1) along the strip width for a decorative hem.
 * 0 = valley (cover line), 1 = tip (maximum hang past the cover).
 */
export function curtainEdgeProfile(edge: CurtainEdge, u: number): number {
  const x = Math.min(1, Math.max(0, u));
  if (edge === "flat") return 0;
  if (edge === "curve") {
    // Soft flowing wave across the strip.
    return 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(x * Math.PI * 2));
  }
  if (edge === "diamond") {
    const teeth = 3;
    const t = (x * teeth) % 1;
    return t < 0.5 ? t * 2 : (1 - t) * 2;
  }
  // circle — one beveled semicircle across the full strip width
  const nx = x * 2 - 1;
  return Math.sqrt(Math.max(0, 1 - nx * nx));
}

/**
 * CSS clip-path for the leading hem on `side` (cut into the strip).
 * Tips sit on the strip edge; valleys cut inward so height can stay 100%
 * and the hold still seals. Used by the CSS fallback renderer.
 */
export function curtainEdgeClipPath(
  edge: CurtainEdge,
  side: "top" | "bottom" = "bottom",
): string | undefined {
  if (edge === "flat") return undefined;

  const samples = 25;
  const hem = CURTAIN_HEM_RATIO * 100;

  if (side === "bottom") {
    const bottom: string[] = [];
    for (let i = samples; i >= 0; i--) {
      const u = i / samples;
      // tip (1) → 100%; valley (0) → 100% - hem
      const y = 100 - hem * (1 - curtainEdgeProfile(edge, u));
      bottom.push(`${(u * 100).toFixed(2)}% ${y.toFixed(2)}%`);
    }
    return `polygon(0% 0%, 100% 0%, ${bottom.join(", ")})`;
  }

  const top: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    // tip (1) → 0%; valley (0) → hem
    const y = hem * (1 - curtainEdgeProfile(edge, u));
    top.push(`${(u * 100).toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(${top.join(", ")}, 100% 100%, 0% 100%)`;
}

/**
 * Plane geometry with an optional decorative hem on `side`.
 * Tips hang past the flat cover line; valleys stay on it so the hold seals.
 */
export function createCurtainStripGeometry(
  width: number,
  height: number,
  edge: CurtainEdge,
  side: "top" | "bottom" = "bottom",
  widthSegs = 32,
): PlaneGeometry {
  if (edge === "flat") {
    return new PlaneGeometry(width, height, 1, 1);
  }

  const geometry = new PlaneGeometry(width, height, widthSegs, 1);
  const pos = geometry.attributes.position as BufferAttribute;
  const halfW = width / 2;
  const halfH = height / 2;
  const hem = height * CURTAIN_HEM_RATIO;
  const eps = height * 0.001;

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const x = pos.getX(i);
    const u = (x + halfW) / Math.max(width, 1e-6);
    const hang = hem * curtainEdgeProfile(edge, u);
    if (side === "bottom" && y <= -halfH + eps) {
      pos.setY(i, y - hang);
    } else if (side === "top" && y >= halfH - eps) {
      pos.setY(i, y + hang);
    }
  }
  pos.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
