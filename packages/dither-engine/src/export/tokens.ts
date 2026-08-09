/**
 * Sprint 8 — CSS variables & design tokens.
 * Only expose properties that can safely be driven from CSS.
 */

import { rgbToHex } from "../engine/color";
import type { Rgb } from "../engine/color/types";
import type { MaserDitherRuntimeConfig } from "./types";

export type CssVarMap = Record<string, string>;

function toHex(c: Rgb | undefined, fallback: string): string {
  if (!c) return fallback;
  try {
    return rgbToHex(c);
  } catch {
    return fallback;
  }
}

/** CSS-customizable presentation tokens (not every shader uniform). */
export function buildCssVariables(
  runtime: MaserDitherRuntimeConfig,
): CssVarMap {
  const colors = runtime.color.colors;

  return {
    "--mde-background": toHex(colors?.background, "#000000"),
    "--mde-highlight": toHex(colors?.highlight, "#f5f5f5"),
    "--mde-shadow": toHex(colors?.shadow, "#111111"),
    "--mde-accent": toHex(colors?.accent, "#c8c8c8"),
    "--mde-dither-color": toHex(colors?.dither, "#ebebeb"),
    "--mde-light-color": toHex(colors?.highlight, "#ffffff"),
    "--mde-light-radius": `${Math.round((runtime.light.radius ?? 0.45) * 100)}%`,
    "--mde-animation-speed": String(runtime.params.animationSpeed ?? 1),
    "--mde-border-radius": `${runtime.content.imageRadius ?? 12}px`,
    "--mde-opacity": String(runtime.params.opacity ?? 1),
    "--mde-contrast": String(runtime.params.contrast ?? 1),
    "--mde-label-color": runtime.content.labelColor || "#ffffff",
  };
}

/**
 * Distinguishes token layers for documentation.
 * - css: safe custom properties
 * - runtime: TypeScript configuration
 * - shader: internal uniforms (do not drive from CSS)
 */
export function buildDesignTokens(runtime: MaserDitherRuntimeConfig) {
  return {
    $schema: "https://maser.media/schemas/mde-tokens-0.8.json",
    css: buildCssVariables(runtime),
    runtime: {
      materialId: runtime.material.materialId,
      ditherAlgorithm: runtime.dither.algorithm,
      animationMode: runtime.animation.modeId,
      interactionMode: runtime.interaction.modeId,
      componentId: runtime.componentId,
    },
    shaderInternal: {
      note: "These are GPU uniforms — configure via TypeScript runtime config, not CSS.",
      keys: [
        "uPosterization",
        "uDitherSize",
        "uMatId",
        "uMatP0-P3",
        "uMatLayerBits",
        "uSource",
      ],
    },
  };
}

export function buildTailwindMap(): Record<string, string> {
  return {
    "bg-mde": "var(--mde-background)",
    "text-mde-label": "var(--mde-label-color)",
    "rounded-mde": "var(--mde-border-radius)",
    "opacity-mde": "var(--mde-opacity)",
  };
}
