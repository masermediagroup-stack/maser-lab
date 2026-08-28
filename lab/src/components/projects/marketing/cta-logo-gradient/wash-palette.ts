import { LOOP_SECONDS } from "./constants";
import type { CtaLogoGradientLook } from "./types";

const BLUE: [number, number, number] = [0.062745, 0.643137, 1.0];
const WHITE: [number, number, number] = [0.960784, 0.984314, 1.0];
const DARK: [number, number, number] = [0.031373, 0.447059, 0.768627];

function mix(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** Same clock the vgpu wash samples so glyph phase stays opposite the mark. */
export function washTimeSeconds(): number {
  return performance.now() / 1000;
}

export function washPhase(look: CtaLogoGradientLook, timeSec: number): number {
  const raw = (timeSec * look.speed) / LOOP_SECONDS + look.angle / 360;
  return raw - Math.floor(raw);
}

function paletteAt(
  t: number,
  look: CtaLogoGradientLook,
): [number, number, number] {
  const u = t - Math.floor(t);
  const seg = u * 4;
  const i = Math.floor(seg);
  const f = seg - i;
  const hiMix = mix(BLUE, WHITE, look.highlight * 0.48);
  const hi: [number, number, number] = [
    clamp01(hiMix[0] + WHITE[0] * look.glow * 0.18),
    clamp01(hiMix[1] + WHITE[1] * look.glow * 0.18),
    clamp01(hiMix[2] + WHITE[2] * look.glow * 0.18),
  ];
  const lo = mix(BLUE, DARK, look.shade * 0.82);
  let a = BLUE;
  let b = BLUE;
  if (i < 0.5) {
    a = BLUE;
    b = hi;
  } else if (i < 1.5) {
    a = hi;
    b = BLUE;
  } else if (i < 2.5) {
    a = BLUE;
    b = lo;
  } else {
    a = lo;
    b = BLUE;
  }
  const c = mix(a, b, f);
  return [clamp01(c[0]), clamp01(c[1]), clamp01(c[2])];
}

function writePixel(
  data: Uint8ClampedArray,
  offset: number,
  rgb: [number, number, number],
) {
  data[offset] = Math.round(rgb[0] * 255);
  data[offset + 1] = Math.round(rgb[1] * 255);
  data[offset + 2] = Math.round(rgb[2] * 255);
  data[offset + 3] = 255;
}

/** 2×2 bilinear corners. `phaseShift` 0.5 inverts the logo cycle. */
export function paintCornerWash(
  target: CanvasRenderingContext2D,
  corners: HTMLCanvasElement,
  width: number,
  height: number,
  look: CtaLogoGradientLook,
  timeSec: number,
  phaseShift: number,
) {
  const phase = washPhase(look, timeSec) + phaseShift;
  const ctx = corners.getContext("2d");
  if (!ctx) return;
  const image = ctx.createImageData(2, 2);
  writePixel(image.data, 0, paletteAt(phase, look));
  writePixel(image.data, 4, paletteAt(phase + 0.25, look));
  writePixel(image.data, 8, paletteAt(phase + 0.5, look));
  writePixel(image.data, 12, paletteAt(phase + 0.75, look));
  ctx.putImageData(image, 0, 0);
  target.imageSmoothingEnabled = true;
  target.drawImage(corners, 0, 0, width, height);
}
