import {
  densityToLogicalCellPx,
  EDGE_COVERAGE,
  preferredRenderCellPx,
  QUALITY_SUPERSAMPLE,
  resolveRenderCellSize,
  type EdgeDetailLevel,
  type RenderQuality,
  type TextDensity,
} from "./density";
import {
  resolveAndLoadFont,
  type BuiltInFontId,
} from "./fonts";
import type { Cell, FontVariant, OccupancyGrid, TargetCell } from "./types";
import { cellKey } from "./types";

export type TextMaskOptions = {
  text: string;
  line2?: string;
  fontVariant?: FontVariant;
  customFontFamily?: string;
  customFontUrl?: string;
  customFontWeight?: string;
  customFontStyle?: "normal" | "italic";
  fontSize?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: CanvasTextAlign;
  textDensity?: TextDensity;
  renderQuality?: RenderQuality;
  edgeDetailLevel?: EdgeDetailLevel;
  /** Legacy render-cell override; 0 = auto. */
  cellSize?: number;
  stageWidth: number;
  stageHeight: number;
  gridPadding?: number;
  alphaThreshold?: number;
  coverageThreshold?: number;
  edgeDetail?: number;
  targetWidthRatio?: number;
};

export type TextMaskResult = OccupancyGrid & {
  lines: string[];
  fontFamily: string;
  fontSize: number;
  tooLong: boolean;
  message?: string;
  fontReady: boolean;
  fontError?: string;
  targetCells: TargetCell[];
  logicalCellPx: number;
  renderCellPx: number;
};

function resolveLines(
  text: string,
  line2: string | undefined,
  stageWidth: number,
  approxCellPx: number,
): string[] {
  if (line2?.trim()) {
    const fromBreaks = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const primary = fromBreaks[0] ?? text.trim();
    return [primary, line2.trim()].filter(Boolean);
  }

  const fromBreaks = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (fromBreaks.length > 1) return fromBreaks;

  const single = (fromBreaks[0] ?? text.trim()) || "A";

  const approxCellsWide = Math.floor((stageWidth * 0.85) / Math.max(approxCellPx, 1));
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
  if (chars > 24) {
    return { ok: false, message: "Keep text to about 1–24 characters for best results." };
  }
  if (chars === 0) {
    return { ok: false, message: "Enter at least one character." };
  }
  return { ok: true };
}

function coverageForCell(
  data: Uint8ClampedArray,
  canvasW: number,
  canvasH: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  alphaThreshold: number,
  subSamples: number,
): number {
  let occupiedAlpha = 0;
  let totalPossibleAlpha = 0;

  for (let sy = 0; sy < subSamples; sy++) {
    for (let sx = 0; sx < subSamples; sx++) {
      const px = Math.min(
        canvasW - 1,
        Math.floor(x0 + ((sx + 0.5) / subSamples) * (x1 - x0)),
      );
      const py = Math.min(
        canvasH - 1,
        Math.floor(y0 + ((sy + 0.5) / subSamples) * (y1 - y0)),
      );
      const a = data[(py * canvasW + px) * 4 + 3] ?? 0;
      occupiedAlpha += a;
      totalPossibleAlpha += 255;
    }
  }

  // Area accumulation for thin strokes
  const step = Math.max(1, Math.floor(Math.min(x1 - x0, y1 - y0) / 8));
  let areaOcc = 0;
  let areaTot = 0;
  for (let py = y0; py < y1; py += step) {
    for (let px = x0; px < x1; px += step) {
      areaTot += 255;
      areaOcc += data[(py * canvasW + px) * 4 + 3] ?? 0;
    }
  }

  const probe = totalPossibleAlpha > 0 ? occupiedAlpha / totalPossibleAlpha : 0;
  const area = areaTot > 0 ? areaOcc / areaTot : 0;
  // Soft-count near-threshold alpha as partial coverage
  void alphaThreshold;
  return Math.max(probe, area);
}

/**
 * Connectivity cleanup:
 * - Fill accidental 1-cell holes (3+ orthogonal neighbors)
 * - Drop isolated exterior noise (0 neighbors + low coverage)
 */
function cleanupCoverage(
  coverage: Float32Array,
  width: number,
  height: number,
  threshold: number,
): Float32Array {
  const out = new Float32Array(coverage);
  const at = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < width && y < height ? out[y * width + x]! : 0;
  const on = (x: number, y: number) => at(x, y) >= threshold;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (on(x, y)) continue;
      let n = 0;
      if (on(x - 1, y)) n++;
      if (on(x + 1, y)) n++;
      if (on(x, y - 1)) n++;
      if (on(x, y + 1)) n++;
      if (n >= 3) out[y * width + x] = Math.max(out[y * width + x]!, threshold);
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = out[y * width + x]!;
      if (c < threshold) continue;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          if (on(x + dx, y + dy)) n++;
        }
      }
      if (n === 0 && c < threshold + 0.22) {
        out[y * width + x] = 0;
      }
    }
  }

  return out;
}

/**
 * Render text to a high-res offscreen canvas and sample into a dense occupancy grid.
 * Font size and logical cell size are independent — density controls grid resolution.
 */
export async function createTextMask(options: TextMaskOptions): Promise<TextMaskResult> {
  const {
    text,
    line2 = "",
    fontVariant = "geist-pixel-square",
    customFontFamily = "",
    customFontUrl = "",
    customFontWeight = "400",
    customFontStyle = "normal",
    letterSpacing = 0,
    lineHeight = 1.05,
    textAlign = "center",
    textDensity = "high",
    renderQuality = "high",
    edgeDetailLevel = "detailed",
    cellSize = 0,
    stageWidth,
    stageHeight,
    gridPadding = 1,
    alphaThreshold = 20,
    edgeDetail = 0.85,
    targetWidthRatio = 0.82,
  } = options;

  const requestedFontSize = options.fontSize ?? 120;
  // Prefer the designer-requested size. Physical size grows with fontSize; density
  // controls cell count. Stage fit happens via renderCellPx, not by coarsening glyphs.
  const fontSize = Math.round(Math.max(28, Math.min(420, requestedFontSize)));
  void targetWidthRatio;

  const logicalCellPx = densityToLogicalCellPx(fontSize, textDensity);
  const lines = resolveLines(text, line2, stageWidth, preferredRenderCellPx(logicalCellPx, textDensity));
  const validation = validateTextLength(lines);

  const fontResult = await resolveAndLoadFont({
    fontVariant: fontVariant as BuiltInFontId,
    customFontFamily,
    customFontUrl,
    fontWeight: customFontWeight,
    fontStyle: customFontStyle,
    fontSize,
  });

  const fontFamily = fontResult.ok ? fontResult.family : fontResult.family;
  const fontReady = fontResult.ok;
  const fontError = fontResult.error;

  const threshold =
    options.coverageThreshold && options.coverageThreshold > 0
      ? options.coverageThreshold
      : EDGE_COVERAGE[edgeDetailLevel] * (0.85 + (1 - edgeDetail) * 0.2);

  const sampleScale = QUALITY_SUPERSAMPLE[renderQuality];
  const subSamples = Math.max(3, Math.min(8, sampleScale + 1));

  const empty = (message?: string): TextMaskResult => ({
    width: gridPadding * 2 + 1,
    height: gridPadding * 2 + 1,
    cells: new Set(),
    occupied: [],
    coverage: new Map(),
    targetCells: [],
    lines,
    fontFamily,
    fontSize,
    tooLong: !validation.ok,
    message: message ?? fontError ?? validation.message,
    fontReady,
    fontError,
    logicalCellPx,
    renderCellPx: preferredRenderCellPx(logicalCellPx, textDensity),
  });

  if (!fontReady) {
    return empty(fontError ?? "Selected font failed to load — keeping previous font.");
  }

  const canvas = document.createElement("canvas");
  // Rasterize in glyph space with supersampling — size from font, not stage cells.
  const pad = Math.ceil(fontSize * 0.35);
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return empty("Canvas unavailable");
  measure.font = `${customFontStyle} ${customFontWeight} ${fontSize}px ${fontFamily}`;
  if (letterSpacing !== 0 && "letterSpacing" in measure) {
    (measure as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      `${letterSpacing}px`;
  }

  const lineWidths = lines.map((line) => measure.measureText(line).width);
  const contentW = Math.max(...lineWidths, 1);
  const contentH = Math.max(1, lines.length) * fontSize * lineHeight;
  const cssW = contentW + pad * 2;
  const cssH = contentH + pad * 2;

  canvas.width = Math.max(1, Math.floor(cssW * sampleScale));
  canvas.height = Math.max(1, Math.floor(cssH * sampleScale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true, alpha: true });
  if (!ctx) return empty("Canvas unavailable");

  ctx.setTransform(sampleScale, 0, 0, sampleScale, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, cssW, cssH);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = textAlign;
  ctx.textBaseline = "middle";
  ctx.font = `${customFontStyle} ${customFontWeight} ${fontSize}px ${fontFamily}`;
  if (letterSpacing !== 0 && "letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      `${letterSpacing}px`;
  }

  const lh = fontSize * lineHeight;
  const startY = pad + contentH / 2 - ((lines.length - 1) * lh) / 2;
  const anchorX =
    textAlign === "left"
      ? pad
      : textAlign === "right"
        ? pad + contentW
        : pad + contentW / 2;

  lines.forEach((line, i) => {
    ctx.fillText(line, anchorX, startY + i * lh);
  });

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;

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
        ? "No pixels sampled — try a larger font or lower edge threshold."
        : "Font not ready.",
    );
  }

  const logicalPxScaled = Math.max(1, logicalCellPx * sampleScale);
  const contentCellsW = Math.max(1, Math.ceil((inkMaxX - inkMinX + 1) / logicalPxScaled));
  const contentCellsH = Math.max(1, Math.ceil((inkMaxY - inkMinY + 1) / logicalPxScaled));

  const raw = new Float32Array(contentCellsW * contentCellsH);
  for (let gy = 0; gy < contentCellsH; gy++) {
    for (let gx = 0; gx < contentCellsW; gx++) {
      const x0 = inkMinX + gx * logicalPxScaled;
      const y0 = inkMinY + gy * logicalPxScaled;
      const x1 = Math.min(canvas.width, x0 + logicalPxScaled);
      const y1 = Math.min(canvas.height, y0 + logicalPxScaled);
      raw[gy * contentCellsW + gx] = coverageForCell(
        data,
        canvas.width,
        canvas.height,
        x0,
        y0,
        x1,
        y1,
        alphaThreshold,
        subSamples,
      );
    }
  }

  const cleaned = cleanupCoverage(raw, contentCellsW, contentCellsH, threshold);
  const cells = new Set<string>();
  const unique: Cell[] = [];
  const coverageMap = new Map<string, number>();
  const targetCells: TargetCell[] = [];

  for (let gy = 0; gy < contentCellsH; gy++) {
    for (let gx = 0; gx < contentCellsW; gx++) {
      const cov = cleaned[gy * contentCellsW + gx]!;
      if (cov < threshold) continue;
      const cell: Cell = { x: gx + gridPadding, y: gy + gridPadding };
      const k = cellKey(cell.x, cell.y);
      if (cells.has(k)) continue;
      cells.add(k);
      unique.push(cell);
      coverageMap.set(k, cov);
      targetCells.push({ ...cell, coverage: cov });
    }
  }

  unique.sort((a, b) => a.y - b.y || a.x - b.x);
  targetCells.sort((a, b) => a.y - b.y || a.x - b.x);

  if (unique.length === 0) {
    return empty("Coverage threshold discarded all cells — try Maximum edge detail.");
  }

  const gridW = contentCellsW + gridPadding * 2;
  const gridH = contentCellsH + gridPadding * 2;
  const preferred = preferredRenderCellPx(logicalCellPx, textDensity);
  const renderCellPx = resolveRenderCellSize(
    gridW,
    gridH,
    stageWidth,
    stageHeight,
    preferred,
    cellSize > 0 ? cellSize : undefined,
  );

  return {
    width: gridW,
    height: gridH,
    cells,
    occupied: unique,
    coverage: coverageMap,
    targetCells,
    lines,
    fontFamily,
    fontSize,
    tooLong: !validation.ok,
    fontReady,
    fontError: undefined,
    message: !validation.ok ? validation.message : undefined,
    logicalCellPx,
    renderCellPx,
  };
}

export function fontFamilyForVariant(variant: FontVariant): string {
  if (variant === "custom") return "monospace";
  // Lazy import avoided — mirror fonts.ts labels for sync callers.
  const map: Record<Exclude<FontVariant, "custom">, string> = {
    "geist-pixel-square": '"Geist Pixel Square", "Geist Pixel", ui-monospace, monospace',
    "geist-pixel-grid": '"Geist Pixel Grid", "Geist Pixel", ui-monospace, monospace',
    "geist-pixel-circle": '"Geist Pixel Circle", "Geist Pixel", ui-monospace, monospace',
    "geist-pixel-triangle": '"Geist Pixel Triangle", "Geist Pixel", ui-monospace, monospace',
    "geist-pixel-line": '"Geist Pixel Line", "Geist Pixel", ui-monospace, monospace',
  };
  return map[variant];
}

export function maskCacheKey(parts: {
  text: string;
  line2: string;
  fontVariant: string;
  customFontFamily: string;
  customFontUrl: string;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  textAlign: string;
  textDensity: string;
  renderQuality: string;
  edgeDetailLevel: string;
  cellSize: number;
  coverageThreshold: number;
  gridPadding: number;
  stageWidth: number;
  stageHeight: number;
  layoutSeed: number;
  pieceScale: string;
}): string {
  return [
    parts.text,
    parts.line2,
    parts.fontVariant,
    parts.customFontFamily,
    parts.customFontUrl,
    parts.fontSize,
    parts.letterSpacing,
    parts.lineHeight,
    parts.textAlign,
    parts.textDensity,
    parts.renderQuality,
    parts.edgeDetailLevel,
    parts.cellSize,
    parts.coverageThreshold,
    parts.gridPadding,
    Math.round(parts.stageWidth),
    Math.round(parts.stageHeight),
    parts.layoutSeed,
    parts.pieceScale,
  ].join("|");
}
