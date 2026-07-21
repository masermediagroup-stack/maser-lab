import {
  densityToLogicalCellPx,
  EDGE_COVERAGE_HYSTERESIS,
  INK_ALPHA_FLOOR,
  preferredRenderCellPx,
  QUALITY_SUPERSAMPLE,
  resolveRenderCellSize,
  type CoverageThresholds,
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

/**
 * Area coverage for one logical cell.
 * Only source pixels at/above inkFloor count as occupied alpha — faint AA haze
 * contributes little so inter-glyph speckles do not pass edge thresholds.
 */
function coverageForCell(
  data: Uint8ClampedArray,
  canvasW: number,
  canvasH: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  inkFloor: number,
  subSamples: number,
): number {
  const xStart = Math.max(0, Math.floor(x0));
  const yStart = Math.max(0, Math.floor(y0));
  const xEnd = Math.min(canvasW, Math.ceil(x1));
  const yEnd = Math.min(canvasH, Math.ceil(y1));
  if (xEnd <= xStart || yEnd <= yStart) return 0;

  let occupiedAlpha = 0;
  let totalPossibleAlpha = 0;

  for (let sy = 0; sy < subSamples; sy++) {
    for (let sx = 0; sx < subSamples; sx++) {
      const px = Math.min(
        canvasW - 1,
        Math.floor(xStart + ((sx + 0.5) / subSamples) * (xEnd - xStart)),
      );
      const py = Math.min(
        canvasH - 1,
        Math.floor(yStart + ((sy + 0.5) / subSamples) * (yEnd - yStart)),
      );
      const a = data[(py * canvasW + px) * 4 + 3] ?? 0;
      occupiedAlpha += a >= inkFloor ? a : 0;
      totalPossibleAlpha += 255;
    }
  }

  const step = Math.max(1, Math.floor(Math.min(xEnd - xStart, yEnd - yStart) / 8));
  let areaOcc = 0;
  let areaTot = 0;
  for (let py = yStart; py < yEnd; py += step) {
    for (let px = xStart; px < xEnd; px += step) {
      areaTot += 255;
      const a = data[(py * canvasW + px) * 4 + 3] ?? 0;
      areaOcc += a >= inkFloor ? a : 0;
    }
  }

  const probe = totalPossibleAlpha > 0 ? occupiedAlpha / totalPossibleAlpha : 0;
  const area = areaTot > 0 ? areaOcc / areaTot : 0;
  return areaTot > 0 ? 0.65 * area + 0.35 * probe : probe;
}

/**
 * Two-threshold hysteresis occupancy:
 * - Core cells (coverage >= core) always occupy
 * - Edge cells (coverage >= edge) occupy only if 4-connected to a core cell
 * Then drop components with no core, and fill 1-cell holes inside solid strokes.
 */
function resolveOccupancyHysteresis(
  coverage: Float32Array,
  width: number,
  height: number,
  thresholds: CoverageThresholds,
): { occupied: Uint8Array; core: Uint8Array } {
  const { core: coreT, edge: edgeT } = thresholds;
  const core = new Uint8Array(width * height);
  const candidate = new Uint8Array(width * height);

  for (let i = 0; i < coverage.length; i++) {
    const c = coverage[i]!;
    if (c >= coreT) {
      core[i] = 1;
      candidate[i] = 1;
    } else if (c >= edgeT) {
      candidate[i] = 1;
    }
  }

  const occupied = new Uint8Array(width * height);
  const stack: number[] = [];
  for (let i = 0; i < core.length; i++) {
    if (!core[i]) continue;
    occupied[i] = 1;
    stack.push(i);
  }

  const tryVisit = (nx: number, ny: number) => {
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;
    const ni = ny * width + nx;
    if (!candidate[ni] || occupied[ni]) return;
    occupied[ni] = 1;
    stack.push(ni);
  };

  while (stack.length) {
    const i = stack.pop()!;
    const x = i % width;
    const y = (i / width) | 0;
    tryVisit(x - 1, y);
    tryVisit(x + 1, y);
    tryVisit(x, y - 1);
    tryVisit(x, y + 1);
  }

  const seen = new Uint8Array(width * height);
  for (let start = 0; start < occupied.length; start++) {
    if (!occupied[start] || seen[start]) continue;
    const component: number[] = [];
    const q = [start];
    seen[start] = 1;
    let hasCore = false;
    while (q.length) {
      const i = q.pop()!;
      component.push(i);
      if (core[i]) hasCore = true;
      const x = i % width;
      const y = (i / width) | 0;
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ] as const) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        if (!occupied[ni] || seen[ni]) continue;
        seen[ni] = 1;
        q.push(ni);
      }
    }
    if (!hasCore) {
      for (const i of component) occupied[i] = 0;
    }
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (occupied[i]) continue;
      const n =
        (occupied[i - 1] ? 1 : 0) +
        (occupied[i + 1] ? 1 : 0) +
        (occupied[i - width] ? 1 : 0) +
        (occupied[i + width] ? 1 : 0);
      if (n >= 4) {
        occupied[i] = 1;
        core[i] = 1;
      }
    }
  }

  return { occupied, core };
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
    alphaThreshold = INK_ALPHA_FLOOR,
    edgeDetail = 0.85,
    targetWidthRatio = 0.82,
  } = options;

  const requestedFontSize = options.fontSize ?? 120;
  // Prefer the designer-requested size. Physical size grows with fontSize; density
  // controls cell count. Stage fit happens via renderCellPx, not by coarsening glyphs.
  const fontSize = Math.round(Math.max(28, Math.min(420, requestedFontSize)));
  void targetWidthRatio;
  void edgeDetail;

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

  const baseHysteresis = EDGE_COVERAGE_HYSTERESIS[edgeDetailLevel];
  // Legacy single coverageThreshold overrides the edge gate when > 0; core stays stricter.
  const thresholds: CoverageThresholds =
    options.coverageThreshold && options.coverageThreshold > 0
      ? {
          core: Math.min(0.85, options.coverageThreshold * 1.75),
          edge: options.coverageThreshold,
        }
      : { ...baseHysteresis };

  const inkFloor = Math.max(INK_ALPHA_FLOOR, alphaThreshold);
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
  // Prefer crisp glyph edges when the browser supports it
  if ("textRendering" in ctx) {
    (ctx as CanvasRenderingContext2D & { textRendering: string }).textRendering =
      "geometricPrecision";
  }
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
      if (a < inkFloor) continue;
      if (px < inkMinX) inkMinX = px;
      if (py < inkMinY) inkMinY = py;
      if (px > inkMaxX) inkMaxX = px;
      if (py > inkMaxY) inkMaxY = py;
    }
  }

  if (inkMaxX < 0) {
    return empty(
      fontReady
        ? "No pixels sampled — try a larger font or Maximum edge detail."
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
        inkFloor,
        subSamples,
      );
    }
  }

  const { occupied: occupiedMask } = resolveOccupancyHysteresis(
    raw,
    contentCellsW,
    contentCellsH,
    thresholds,
  );
  const cells = new Set<string>();
  const unique: Cell[] = [];
  const coverageMap = new Map<string, number>();
  const targetCells: TargetCell[] = [];

  for (let gy = 0; gy < contentCellsH; gy++) {
    for (let gx = 0; gx < contentCellsW; gx++) {
      const idx = gy * contentCellsW + gx;
      if (!occupiedMask[idx]) continue;
      const cov = raw[idx]!;
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
    return empty("Coverage thresholds discarded all cells — try Maximum edge detail.");
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
