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

function luma(rgb: [number, number, number]): number {
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

/** White/Glow retint the glyphs but must not bleach them out of the mark. */
function glyphLook(look: CtaLogoGradientLook): CtaLogoGradientLook {
  return {
    ...look,
    highlight: look.highlight * 0.38,
    glow: look.glow * 0.22,
  };
}

function keepGlyphVisible(
  rgb: [number, number, number],
): [number, number, number] {
  const y = luma(rgb);
  if (y <= 0.58) return rgb;
  const t = Math.min(1, (y - 0.58) / 0.32);
  return mix(rgb, BLUE, t);
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

function toCss(rgb: [number, number, number]): string {
  return `rgb(${Math.round(rgb[0] * 255)} ${Math.round(rgb[1] * 255)} ${Math.round(rgb[2] * 255)})`;
}

/** Drive CSS corner colors from the integrated phase. Heading is rotation, not time. */
export function driveCssWash(
  node: HTMLElement,
  look: CtaLogoGradientLook,
  phase: number,
) {
  node.style.setProperty("--clg-tl", toCss(paletteAt(phase, look)));
  node.style.setProperty("--clg-tr", toCss(paletteAt(phase + 0.25, look)));
  node.style.setProperty("--clg-bl", toCss(paletteAt(phase + 0.5, look)));
  node.style.setProperty("--clg-br", toCss(paletteAt(phase + 0.75, look)));
  node.style.setProperty("--clg-heading", `${look.angle}deg`);
}

/** 2×2 bilinear corners. `phaseShift` 0.5 inverts the logo cycle. */
export function paintCornerWash(
  target: CanvasRenderingContext2D,
  corners: HTMLCanvasElement,
  width: number,
  height: number,
  look: CtaLogoGradientLook,
  phase: number,
  phaseShift: number,
  layer: "logo" | "glyph" = "logo",
) {
  const sample = layer === "glyph" ? glyphLook(look) : look;
  const shifted = phase + phaseShift;
  const colorAt = (offset: number) => {
    const rgb = paletteAt(shifted + offset, sample);
    return layer === "glyph" ? keepGlyphVisible(rgb) : rgb;
  };
  const ctx = corners.getContext("2d");
  if (!ctx) return;
  const image = ctx.createImageData(2, 2);
  writePixel(image.data, 0, colorAt(0));
  writePixel(image.data, 4, colorAt(0.25));
  writePixel(image.data, 8, colorAt(0.5));
  writePixel(image.data, 12, colorAt(0.75));
  ctx.putImageData(image, 0, 0);
  const heading = (look.angle * Math.PI) / 180;
  const span = Math.max(width, height) * 1.5;
  target.imageSmoothingEnabled = true;
  target.save();
  target.translate(width / 2, height / 2);
  target.rotate(heading);
  target.drawImage(corners, -span / 2, -span / 2, span, span);
  target.restore();
}
