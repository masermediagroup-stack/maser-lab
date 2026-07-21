import type { ColorMode, GradientAxis, PixelPiece } from "./types";

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "").trim();
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned.padEnd(6, "0").slice(0, 6);
  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num)) return { r: 255, g: 255, b: 255 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function hslToHex(h: number, s: number, l: number): string {
  const sat = clamp01(s);
  const light = clamp01(l);
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

export type ColorAssignOptions = {
  colorMode: ColorMode;
  color: string;
  rainbowSaturation: number;
  rainbowBrightness: number;
  rainbowSpread: number;
  hueSpeed: number;
  gradientAxis: GradientAxis;
  gridWidth: number;
  gridHeight: number;
  timeMs?: number;
};

export function assignPieceColors(
  pieces: PixelPiece[],
  options: ColorAssignOptions,
): PixelPiece[] {
  const {
    colorMode,
    color,
    rainbowSaturation,
    rainbowBrightness,
    rainbowSpread,
    hueSpeed,
    gradientAxis,
    gridWidth,
    gridHeight,
    timeMs = 0,
  } = options;

  const n = Math.max(pieces.length, 1);

  return pieces.map((piece, index) => {
    let fill = color;
    if (colorMode === "solid") {
      fill = color;
    } else if (colorMode === "rainbow") {
      const hue = ((index / n) * 360 * rainbowSpread) % 360;
      fill = hslToHex(hue, rainbowSaturation, rainbowBrightness * 0.5);
    } else if (colorMode === "animated-rainbow") {
      const base = ((index / n) * 360 * rainbowSpread) % 360;
      const hue = (base + timeMs * hueSpeed * 0.06) % 360;
      fill = hslToHex(hue, rainbowSaturation, rainbowBrightness * 0.5);
    } else if (colorMode === "gradient") {
      const cx =
        piece.cells.reduce((s, c) => s + c.x, 0) / piece.cells.length + piece.targetX;
      const cy =
        piece.cells.reduce((s, c) => s + c.y, 0) / piece.cells.length + piece.targetY;
      const t =
        gradientAxis === "horizontal"
          ? cx / Math.max(gridWidth - 1, 1)
          : cy / Math.max(gridHeight - 1, 1);
      const hue = clamp01(t) * 280 * rainbowSpread;
      fill = hslToHex(hue, rainbowSaturation, rainbowBrightness * 0.5);
    }

    return {
      ...piece,
      color: fill,
      glowColor: fill,
    };
  });
}

export function animatedColorForPiece(
  pieceIndex: number,
  pieceCount: number,
  options: ColorAssignOptions,
): string {
  if (options.colorMode === "solid") return options.color;
  if (options.colorMode !== "animated-rainbow") {
    // For static modes, color is already assigned on the piece
    return options.color;
  }
  const n = Math.max(pieceCount, 1);
  const base = ((pieceIndex / n) * 360 * options.rainbowSpread) % 360;
  const hue = (base + (options.timeMs ?? 0) * options.hueSpeed * 0.06) % 360;
  return hslToHex(hue, options.rainbowSaturation, options.rainbowBrightness * 0.5);
}
