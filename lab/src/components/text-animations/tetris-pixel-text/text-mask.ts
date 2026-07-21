import type { Cell, FontVariant, OccupancyGrid } from "./types";
import { cellKey } from "./types";

const FONT_FAMILY: Record<FontVariant, string> = {
  "geist-pixel-square": '"Geist Pixel", "Geist Pixel Square", ui-monospace, monospace',
  "geist-pixel-grid": '"Geist Pixel Grid", "Geist Pixel", ui-monospace, monospace',
};

/** Primary family name for document.fonts.load (no fallbacks). */
const FONT_LOAD_NAME: Record<FontVariant, string> = {
  "geist-pixel-square": "Geist Pixel",
  "geist-pixel-grid": "Geist Pixel",
};

export type TextMaskOptions = {
  text: string;
  line2?: string;
  fontVariant?: FontVariant;
  fontSize?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: CanvasTextAlign;
  /** Logical cell size in CSS pixels. */
  cellSize: number;
  stageWidth: number;
  stageHeight: number;
  gridPadding?: number;
  /** Alpha (0–255) for counting a sample as filled. */
  alphaThreshold?: number;
  /**
   * Fraction of samples inside a logical cell that must be filled
   * for the cell to count as occupied. Default ~0.12 keeps thin strokes.
   */
  coverageThreshold?: number;
  edgeDetail?: number;
  /** Target fraction of stage width for the glyph bbox (0.75–0.9). */
  targetWidthRatio?: number;
};

export type TextMaskResult = OccupancyGrid & {
  lines: string[];
  fontFamily: string;
  fontSize: number;
  tooLong: boolean;
  message?: string;
  /** True when Geist Pixel confirmed loaded before sampling. */
  fontReady: boolean;
};

function resolveLines(
  text: string,
  line2: string | undefined,
  stageWidth: number,
  cellSize: number,
): string[] {
  if (line2?.trim()) {
    const fromBreaks = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const primary = fromBreaks[0] ?? text.trim();
    return [primary, line2.trim()].filter(Boolean);
  }

  const fromBreaks = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (fromBreaks.length > 1) return fromBreaks;

  const single = (fromBreaks[0] ?? text.trim()) || "A";

  // Auto two-line for long phrases on narrow stages (e.g. "MASER MEDIA")
  const approxCellsWide = Math.floor((stageWidth * 0.85) / Math.max(cellSize, 1));
  const estimatedCells = Math.ceil(single.length * 1.15);
  if (single.includes(" ") && (stageWidth < 520 || estimatedCells > approxCellsWide * 0.92)) {
    const parts = single.split(/\s+/).filter(Boolean);
    if (parts.length === 2) return parts;
    if (parts.length > 2) {
      const mid = Math.ceil(parts.length / 2);
      return [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")];
    }
  }

  return [single];
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

async function ensureFont(fontVariant: FontVariant, fontSize: number): Promise<boolean> {
  if (typeof document === "undefined" || !document.fonts) return false;
  const loadName = FONT_LOAD_NAME[fontVariant];
  const family = FONT_FAMILY[fontVariant];
  try {
    await document.fonts.ready;
    await document.fonts.load(`400 ${fontSize}px "${loadName}"`);
    await document.fonts.load(`400 ${fontSize}px ${family}`);
    // Confirm the primary face is available (not a silent fallback).
    return document.fonts.check(`400 ${fontSize}px "${loadName}"`);
  } catch {
    return false;
  }
}

/**
 * Render text to a high-res offscreen canvas and sample into a dense occupancy grid
 * using multi-point / area coverage per logical cell.
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
    gridPadding = 1,
    alphaThreshold = 24,
    coverageThreshold = 0.12,
    edgeDetail = 0.85,
    targetWidthRatio = 0.82,
  } = options;

  const lines = resolveLines(text, line2, stageWidth, cellSize);
  const validation = validateTextLength(lines);
  const fontFamily = FONT_FAMILY[fontVariant];
  const longest = Math.max(...lines.map((l) => l.length), 1);

  // Fit glyphs to ~75–85% of stage width (and height), preferring denser cells.
  const widthBudget = stageWidth * targetWidthRatio;
  const heightBudget = stageHeight * (lines.length === 1 ? 0.55 : 0.72);
  const autoFromWidth = widthBudget / (longest * 0.58);
  const autoFromHeight = heightBudget / (lines.length * lineHeight);
  const requested = options.fontSize ?? 96;
  const fontSize = Math.round(
    Math.max(28, Math.min(requested, autoFromWidth, autoFromHeight)),
  );

  const fontReady = await ensureFont(fontVariant, fontSize);

  // High-resolution mask — sample densely, then bin into logical cells.
  const sampleScale = Math.max(3, Math.min(6, Math.round(4 * (0.7 + edgeDetail * 0.4))));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(stageWidth * sampleScale));
  canvas.height = Math.max(1, Math.floor(stageHeight * sampleScale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const empty = (message?: string): TextMaskResult => ({
    width: gridPadding * 2 + 1,
    height: gridPadding * 2 + 1,
    cells: new Set(),
    occupied: [],
    lines,
    fontFamily,
    fontSize,
    tooLong: !validation.ok,
    message: message ?? validation.message,
    fontReady,
  });

  if (!ctx) return empty("Canvas unavailable");

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

  // Find ink bbox first so we only allocate logical cells over real glyphs.
  let inkMinX = canvas.width;
  let inkMinY = canvas.height;
  let inkMaxX = -1;
  let inkMaxY = -1;
  for (let py = 0; py < canvas.height; py++) {
    for (let px = 0; px < canvas.width; px++) {
      const a = data[(py * canvas.width + px) * 4 + 3] ?? 0;
      if (a < alphaThreshold) continue;
      if (px < inkMinX) inkMinX = px;
      if (py < inkMinY) inkMinY = py;
      if (px > inkMaxX) inkMaxX = px;
      if (py > inkMaxY) inkMaxY = py;
    }
  }

  if (inkMaxX < 0) {
    return empty(
      fontReady
        ? "No pixels sampled — try a larger font or shorter text."
        : "Geist Pixel font not ready — retrying may help.",
    );
  }

  const logicalCellPx = Math.max(1, cellSize * sampleScale);
  // Sub-sample grid inside each logical cell (multi-point / area coverage).
  const subSamples = Math.max(3, Math.min(8, Math.round(2 + edgeDetail * 5)));

  const contentCellsW = Math.max(1, Math.ceil((inkMaxX - inkMinX + 1) / logicalCellPx));
  const contentCellsH = Math.max(1, Math.ceil((inkMaxY - inkMinY + 1) / logicalCellPx));

  const cells = new Set<string>();
  const unique: Cell[] = [];

  for (let gy = 0; gy < contentCellsH; gy++) {
    for (let gx = 0; gx < contentCellsW; gx++) {
      const x0 = inkMinX + gx * logicalCellPx;
      const y0 = inkMinY + gy * logicalCellPx;
      const x1 = Math.min(canvas.width, x0 + logicalCellPx);
      const y1 = Math.min(canvas.height, y0 + logicalCellPx);

      let filled = 0;
      let total = 0;
      for (let sy = 0; sy < subSamples; sy++) {
        for (let sx = 0; sx < subSamples; sx++) {
          const px = Math.min(
            canvas.width - 1,
            Math.floor(x0 + ((sx + 0.5) / subSamples) * (x1 - x0)),
          );
          const py = Math.min(
            canvas.height - 1,
            Math.floor(y0 + ((sy + 0.5) / subSamples) * (y1 - y0)),
          );
          total++;
          const a = data[(py * canvas.width + px) * 4 + 3] ?? 0;
          if (a >= alphaThreshold) filled++;
        }
      }

      // Also count any dense ink via a cheap full scan when coverage is borderline
      if (total > 0 && filled / total < coverageThreshold) {
        let areaFilled = 0;
        let areaTotal = 0;
        const step = Math.max(1, Math.floor(logicalCellPx / 6));
        for (let py = y0; py < y1; py += step) {
          for (let px = x0; px < x1; px += step) {
            areaTotal++;
            if ((data[(py * canvas.width + px) * 4 + 3] ?? 0) >= alphaThreshold) {
              areaFilled++;
            }
          }
        }
        if (areaTotal > 0 && areaFilled / areaTotal >= coverageThreshold) {
          filled = areaFilled;
          total = areaTotal;
        }
      }

      if (total === 0 || filled / total < coverageThreshold) continue;

      const cell: Cell = {
        x: gx + gridPadding,
        y: gy + gridPadding,
      };
      const k = cellKey(cell.x, cell.y);
      if (cells.has(k)) continue;
      cells.add(k);
      unique.push(cell);
    }
  }

  unique.sort((a, b) => a.y - b.y || a.x - b.x);

  if (unique.length === 0) {
    return empty("Coverage threshold discarded all cells — lower coverage or cell size.");
  }

  const gridW = contentCellsW + gridPadding * 2;
  const gridH = contentCellsH + gridPadding * 2;

  // Soft warning only — never discard cells for density
  const stageCells = Math.floor((stageWidth / cellSize) * (stageHeight / cellSize));
  const dense = unique.length > stageCells * 1.2;

  return {
    width: gridW,
    height: gridH,
    cells,
    occupied: unique,
    lines,
    fontFamily,
    fontSize,
    tooLong: !validation.ok,
    fontReady,
    message: !validation.ok
      ? validation.message
      : !fontReady
        ? "Font face may still be loading — mask used best available face."
        : dense
          ? undefined
          : undefined,
  };
}

export function fontFamilyForVariant(variant: FontVariant): string {
  return FONT_FAMILY[variant];
}
