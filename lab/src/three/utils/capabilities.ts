"use client";

/**
 * Probe WebGL support and user motion preferences.
 * Does not require the `three` package.
 */

/** Cached so we never allocate a throwaway WebGL context per React render. */
let webglAvailability: boolean | undefined;

/**
 * Returns whether WebGL is available. Result is cached for the page lifetime.
 * The probe canvas immediately loses its context so it does not consume a
 * browser WebGL context slot (limit is typically ~8–16).
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  if (webglAvailability !== undefined) return webglAvailability;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    webglAvailability = Boolean(gl);
    if (gl && typeof (gl as WebGLRenderingContext).getExtension === "function") {
      (gl as WebGLRenderingContext)
        .getExtension("WEBGL_lose_context")
        ?.loseContext();
    }
    return webglAvailability;
  } catch {
    webglAvailability = false;
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
