import type { Cell, FontVariant, OccupancyGrid } from "./types";
import { cellKey } from "./types";

const FONT_FAMILY: Record<FontVariant, string> = {
  "geist-pixel-square": '"Geist Pixel", "Geist Pixel Square", ui-monospace, monospace',
  "geist-pixel-grid": '"Geist Pixel Grid", "Geist Pixel", ui-monospace, monospace',
};

export type TextMaskOptions = {
  text: string;
  line2?: string;
  fontVariant?: FontVariant;
  fontSize?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: CanvasTextAlign;
  /** Logical cell size used when sampling. */
  cellSize: number;
  /** Stage width in CSS pixels. */
  stageWidth: number;
  /** Stage height in CSS pixels. */
  stageHeight: number;
  /** Extra empty cells around the mask after centering. */
  gridPadding?: number;
  /** Alpha threshold 0–255. */
  alphaThreshold?: number;
  edgeDetail?: number;
};

export type TextMaskResult = OccupancyGrid & {
  lines: string[];
  fontFamily: string;
  fontSize: number;
  tooLong: boolean;
  message?: string;
};

function resolveLines(text: string, line2?: string): string[] {
  const fromBreaks = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (line2?.trim()) {
    const primary = fromBreaks[0] ?? text.trim();
    return [primary, line2.trim()].filter(Boolean);
  }
  return fromBreaks.length ? fromBreaks : [text.trim() || "A"];
}

export function validateTextLength(lines: string[]): { ok: boolean; message?: string } {
  const joined = lines.join(" ");
  const chars = [...joined.replace(/\s/g, "")].length;
  if (lines.length > 2) {
    return { ok: false, message: "Use at most two lines for reliable results." };
  }
  if (chars > 20) {
    return { ok: false, message: "Keep text to about 1–20 characters for best results." };
  }
  if (chars === 0) {
    return { ok: false, message: "Enter at least one character." };
  }
  return { ok: true };
}

async function ensureFont(fontFamily: string, fontSize: number): Promise<void> {
  if (typeof document === "undefined" || !document.fonts?.load) return;
  try {
    await document.fonts.load(`400 ${fontSize}px ${fontFamily}`);
  } catch {
    // Font may already be available or blocked — continue with fallback.
  }
}

/**
 * Render text to an offscreen canvas and sample into a centered occupancy grid.
 */
export async function createTextMask(options: TextMaskOptions): Promise<TextMaskResult> {
  const {
    text,
    line2 = "",
    fontVariant = "geist-pixel-square",
    letterSpacing = 0,
    lineHeight = 1.05,
    textAlign = "center",
    cellSize,
    stageWidth,
    stageHeight,
    gridPadding = 2,
    alphaThreshold = 40,
    edgeDetail = 0.7,
  } = options;

  const lines = resolveLines(text, line2);
  const validation = validateTextLength(lines);
  const fontFamily = FONT_FAMILY[fontVariant];
  const longest = Math.max(...lines.map((l) => l.length), 1);

  const autoSize = Math.max(
    24,
    Math.min(
      options.fontSize ?? 72,
      (stageWidth * 0.9) / (longest * 0.62),
      (stageHeight * 0.7) / (lines.length * lineHeight),
    ),
  );
  const fontSize = Math.round(autoSize);

  await ensureFont(fontFamily, fontSize);

  const sampleScale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(stageWidth * sampleScale));
  canvas.height = Math.max(1, Math.floor(stageHeight * sampleScale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return {
      width: 1,
      height: 1,
      cells: new Set(),
      occupied: [],
      lines,
      fontFamily,
      fontSize,
      tooLong: !validation.ok,
      message: validation.message ?? "Canvas unavailable",
    };
  }

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = textAlign;
  ctx.textBaseline = "middle";
  ctx.font = `400 ${fontSize * sampleScale}px ${fontFamily}`;
  if (letterSpacing !== 0 && "letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      `${letterSpacing * sampleScale}px`;
  }

  const lh = fontSize * lineHeight * sampleScale;
  const startY = canvas.height / 2 - ((lines.length - 1) * lh) / 2;
  const anchorX =
    textAlign === "left"
      ? canvas.width * 0.08
      : textAlign === "right"
        ? canvas.width * 0.92
        : canvas.width / 2;

  lines.forEach((line, i) => {
    ctx.fillText(line, anchorX, startY + i * lh);
  });

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  const sampleStep = Math.max(1, Math.round(cellSize * sampleScale * (1.15 - edgeDetail * 0.3)));

  const raw: Cell[] = [];
  for (let py = 0; py < canvas.height; py += sampleStep) {
    for (let px = 0; px < canvas.width; px += sampleStep) {
      const idx = (py * canvas.width + px) * 4;
      const alpha = data[idx + 3] ?? 0;
      if (alpha >= alphaThreshold) {
        raw.push({
          x: Math.floor(px / sampleStep),
          y: Math.floor(py / sampleStep),
        });
      }
    }
  }

  if (raw.length === 0) {
    return {
      width: gridPadding * 2 + 1,
      height: gridPadding * 2 + 1,
      cells: new Set(),
      occupied: [],
      lines,
      fontFamily,
      fontSize,
      tooLong: !validation.ok,
      message: validation.message ?? "No pixels sampled — try a larger font or shorter text.",
    };
  }

  const minX = Math.min(...raw.map((c) => c.x));
  const maxX = Math.max(...raw.map((c) => c.x));
  const minY = Math.min(...raw.map((c) => c.y));
  const maxY = Math.max(...raw.map((c) => c.y));
  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;

  const gridW = contentW + gridPadding * 2;
  const gridH = contentH + gridPadding * 2;

  const occupied: Cell[] = raw.map((c) => ({
    x: c.x - minX + gridPadding,
    y: c.y - minY + gridPadding,
  }));

  // Deduplicate
  const cells = new Set<string>();
  const unique: Cell[] = [];
  for (const c of occupied) {
    const k = cellKey(c.x, c.y);
    if (cells.has(k)) continue;
    cells.add(k);
    unique.push(c);
  }
  unique.sort((a, b) => a.y - b.y || a.x - b.x);

  const maxCells = Math.floor((stageWidth / cellSize) * (stageHeight / cellSize) * 0.85);
  const tooDense = unique.length > maxCells;

  return {
    width: gridW,
    height: gridH,
    cells,
    occupied: unique,
    lines,
    fontFamily,
    fontSize,
    tooLong: !validation.ok || tooDense,
    message: !validation.ok
      ? validation.message
      : tooDense
        ? "Text is too dense for this canvas — reduce length or increase cell size."
        : undefined,
  };
}

export function fontFamilyForVariant(variant: FontVariant): string {
  return FONT_FAMILY[variant];
}
