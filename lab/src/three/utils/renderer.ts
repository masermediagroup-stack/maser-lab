/**
 * WebGLRenderer factory — requires `three` package.
 * Install: `npm install three @types/three`
 *
 * ```ts
 * import { WebGLRenderer } from "three";
 * import { createRendererOptions, applyRendererSize } from "./renderer";
 * ```
 */

export type RendererSizeOptions = {
  width: number;
  height: number;
  pixelRatio?: number;
};

export function createRendererOptions(): {
  alpha: boolean;
  antialias: boolean;
  powerPreference: WebGLPowerPreference;
} {
  return {
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  };
}

export function applyRendererSize(
  setSize: (width: number, height: number, updateStyle?: boolean) => void,
  setPixelRatio: (ratio: number) => void,
  { width, height, pixelRatio = 2 }: RendererSizeOptions,
): void {
  setPixelRatio(Math.min(window.devicePixelRatio, pixelRatio));
  setSize(width, height, false);
}
