"use client";

/**
 * Probe WebGL support and user motion preferences.
 * Does not require the `three` package.
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getClampedPixelRatio(max = 2): number {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio, max);
}
