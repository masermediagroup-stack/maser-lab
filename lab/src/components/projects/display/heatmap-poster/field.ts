import {
  FIELD_CONTOUR,
  FIELD_INNER_GLOW,
  FIELD_OUTER_GLOW,
} from "./constants";

export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Paper heatmap intensity from the CPU pack.
 * R = contour-blurred gray (shape), G = outer/big blur, B = inner blur.
 * Defaults are locked: contour 0.5, innerGlow 0.5, outerGlow 0.5.
 * Not knobs.
 */
export function heatFromPaperPack(
  r: number,
  g: number,
  b: number,
  contour = FIELD_CONTOUR,
  innerGlow = FIELD_INNER_GLOW,
  outerGlow = FIELD_OUTER_GLOW,
): number {
  const shape = r;
  const outerBlur = 1 - mix(1, g, shape);
  const innerBlur = mix(g, 0, shape);
  const contourS = mix(b, 0, shape);
  let inner = 0.8 + 0.8 * innerBlur;
  inner *= mix(0, 2, innerGlow);
  inner += contour * 2 * contourS;
  inner *= 1 - shape;
  const outer =
    0.9 *
    Math.pow(Math.max(outerBlur, 0), 0.8) *
    mix(0, 5, outerGlow * outerGlow);
  return Math.min(1, Math.max(0, inner + outer));
}

/** Traveling wash. Speed and Wave already drive this. Reduced motion freezes time. */
export function waveBand(
  uvY: number,
  time: number,
  speed: number,
  wave: number,
  reduced: boolean,
): number {
  const t = reduced ? 0 : time * (0.12 + speed * 0.55);
  const freq = 0.35 + wave * 1.25;
  return 0.5 + 0.5 * Math.sin((uvY - t) * Math.PI * 2 * freq);
}

export function applyWave(heat: number, band: number): number {
  if (heat <= 0) return 0;
  return Math.min(1, Math.max(0, heat * mix(0.5, 1.12, band)));
}

export function containMap(
  uvX: number,
  uvY: number,
  canvasW: number,
  canvasH: number,
  packW: number,
  packH: number,
): { u: number; v: number; inside: boolean } {
  const canvasAspect = Math.max(canvasW, 1) / Math.max(canvasH, 1);
  const packAspect = Math.max(packW, 1) / Math.max(packH, 1);
  let u = uvX;
  let v = uvY;
  if (canvasAspect > packAspect) {
    const scale = packAspect / canvasAspect;
    u = (uvX - 0.5) / scale + 0.5;
  } else {
    const scale = canvasAspect / packAspect;
    v = (uvY - 0.5) / scale + 0.5;
  }
  return { u, v, inside: u >= 0 && u <= 1 && v >= 0 && v <= 1 };
}
