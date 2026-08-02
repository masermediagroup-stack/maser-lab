"use client";

import { useEffect, useRef } from "react";
import { cn, usePrefersReducedMotion, type BaseAnimationProps } from "./shared";

export type GlyphScanSourceMode = "text" | "svg";
export type GlyphScanDirection = "left-to-right" | "right-to-left" | "top-to-bottom" | "bottom-to-top";
export type GlyphScanSymbolSet = "blocks" | "geometry" | "mixed";

export type GlyphScanRevealProps = BaseAnimationProps & {
  sourceMode?: GlyphScanSourceMode;
  svgSource?: string;
  cellSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  foregroundIntensity?: number;
  backgroundDensity?: number;
  scanDirection?: GlyphScanDirection;
  scanSpeed?: number;
  decay?: number;
  jitter?: number;
  symbolSet?: GlyphScanSymbolSet;
};

type Cell = {
  x: number;
  y: number;
  index: number;
  insideMask: boolean;
  maskAlpha: number;
  seed: number;
};

const BACKGROUND_SYMBOLS = ["0", "1", "+", "*", "-", "/", ":", "."];
const DEFAULT_SVG_SOURCE =
  '<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><path d="M32 96c18-42 56-64 96-48 20 8 23 34 4 47-22 15-53 5-63-18M36 114c30 20 72 17 96-8" fill="none" stroke="white" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function seeded(index: number, playKey: number) {
  const value = Math.sin(index * 127.1 + playKey * 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function normalizeSvgSource(source: string) {
  const trimmed = source.trim();
  if (!trimmed) return DEFAULT_SVG_SOURCE;
  if (/^<svg[\s>]/i.test(trimmed)) return trimmed;
  if (/^</.test(trimmed)) {
    return `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">${trimmed}</svg>`;
  }
  return `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><path d="${escapeAttribute(trimmed)}" fill="white"/></svg>`;
}

function drawTextMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string,
  fontWeight: string,
) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const resolvedLines = lines.length ? lines : ["Maser"];
  const longest = Math.max(...resolvedLines.map((line) => line.length), 1);
  const fontSize = Math.max(
    32,
    Math.min(width / (longest * 0.58), height / (resolvedLines.length * 1.2), 176),
  );
  const lineHeight = fontSize * 1.05;
  const startY = height / 2 - ((resolvedLines.length - 1) * lineHeight) / 2;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  resolvedLines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });
}

async function drawSvgMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  svgSource: string,
) {
  const svg = normalizeSvgSource(svgSource);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Unable to rasterize SVG source"));
      img.src = url;
    });

    ctx.clearRect(0, 0, width, height);
    const scale = Math.min(width / img.width, height / img.height) * 0.78;
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    ctx.drawImage(img, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function waitForCanvasFont(fontFamily: string, fontWeight: string) {
  if (!("fonts" in document)) return;

  const primaryFamily = fontFamily.split(",")[0]?.trim() || fontFamily;
  if (!primaryFamily) return;

  const fontRequest = `${fontWeight} 48px ${primaryFamily}`;
  await Promise.race([
    document.fonts.load(fontRequest),
    new Promise((resolve) => setTimeout(resolve, 1200)),
  ]);
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  variant: number,
  alpha: number,
  symbolSet: GlyphScanSymbolSet,
) {
  const inset = Math.max(1, size * 0.16);
  const cx = x + size / 2;
  const cy = y + size / 2;
  const radius = Math.max(1, size / 2 - inset);

  ctx.fillStyle = `rgba(255,255,255,${alpha})`;

  if (symbolSet === "blocks" || (symbolSet === "mixed" && variant % 4 === 0)) {
    ctx.fillRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
    return;
  }

  if (variant % 4 === 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (variant % 4 === 2) {
    ctx.beginPath();
    ctx.moveTo(cx, y + inset);
    ctx.lineTo(x + size - inset, y + size - inset);
    ctx.lineTo(x + inset, y + size - inset);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (variant % 4 === 3) {
    ctx.fillRect(x + inset, cy - size * 0.12, size - inset * 2, size * 0.24);
    return;
  }

  ctx.fillRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
}

function scanAxisValue(cell: Cell, direction: GlyphScanDirection, width: number, height: number) {
  if (direction === "right-to-left") return 1 - cell.x / width;
  if (direction === "top-to-bottom") return cell.y / height;
  if (direction === "bottom-to-top") return 1 - cell.y / height;
  return cell.x / width;
}

export function GlyphScanReveal({
  text,
  playKey = 0,
  compact = false,
  className,
  sourceMode = "text",
  svgSource = DEFAULT_SVG_SOURCE,
  cellSize = 14,
  fontFamily = "\"Geist Pixel\", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontWeight = "400",
  foregroundIntensity = 1,
  backgroundDensity = 0.62,
  scanDirection = "left-to-right",
  scanSpeed = 1700,
  decay = 0.68,
  jitter = 0.8,
  symbolSet = "mixed",
}: GlyphScanRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const logicalWidth = compact ? 360 : 680;
    const logicalHeight = compact ? 220 : 380;
    const dpr = window.devicePixelRatio || 1;
    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
    const ctx = canvas.getContext("2d");

    if (!ctx || !maskCtx) return;
    const drawCtx = ctx;
    const drawMaskCtx = maskCtx;

    let frame = 0;
    let raf = 0;
    let cancelled = false;

    canvas.width = Math.floor(logicalWidth * dpr);
    canvas.height = Math.floor(logicalHeight * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    drawCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maskCanvas.width = logicalWidth;
    maskCanvas.height = logicalHeight;

    async function prepareMask() {
      try {
        if (sourceMode === "svg") {
          await drawSvgMask(drawMaskCtx, logicalWidth, logicalHeight, svgSource);
        } else {
          await waitForCanvasFont(fontFamily, fontWeight);
          drawTextMask(drawMaskCtx, logicalWidth, logicalHeight, text, fontFamily, fontWeight);
        }
      } catch {
        drawTextMask(drawMaskCtx, logicalWidth, logicalHeight, text, fontFamily, fontWeight);
      }
    }

    function buildCells() {
      const resolvedCellSize = Math.max(8, Math.min(24, cellSize));
      const cols = Math.floor(logicalWidth / resolvedCellSize);
      const rows = Math.floor(logicalHeight / resolvedCellSize);
      const image = drawMaskCtx.getImageData(0, 0, logicalWidth, logicalHeight).data;
      const cells: Cell[] = [];

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * resolvedCellSize + resolvedCellSize / 2;
          const y = row * resolvedCellSize + resolvedCellSize / 2;
          const sampleX = Math.max(0, Math.min(logicalWidth - 1, Math.floor(x)));
          const sampleY = Math.max(0, Math.min(logicalHeight - 1, Math.floor(y)));
          const alpha = image[(sampleY * logicalWidth + sampleX) * 4 + 3] / 255;
          const index = row * cols + col;

          cells.push({
            x: col * resolvedCellSize,
            y: row * resolvedCellSize,
            index,
            insideMask: alpha > 0.18,
            maskAlpha: alpha,
            seed: seeded(index, playKey),
          });
        }
      }

      return { cells, resolvedCellSize };
    }

    function render(cells: Cell[], resolvedCellSize: number, elapsed: number) {
      const duration = Math.max(600, scanSpeed);
      const isSettled = reduced || elapsed >= duration;
      const progress = isSettled ? 1 : Math.max(0, Math.min(1, elapsed / duration));
      const scanPosition = isSettled ? 1.2 : progress * 1.45 - 0.18;
      const scanBand = 0.18;

      drawCtx.clearRect(0, 0, logicalWidth, logicalHeight);
      drawCtx.fillStyle = "black";
      drawCtx.fillRect(0, 0, logicalWidth, logicalHeight);
      drawCtx.font = `${Math.floor(resolvedCellSize * 0.82)}px ${fontFamily}`;
      drawCtx.textAlign = "center";
      drawCtx.textBaseline = "middle";

      for (const cell of cells) {
        const randomGate = cell.seed < backgroundDensity || cell.insideMask;
        if (!randomGate) continue;

        const axis = scanAxisValue(cell, scanDirection, logicalWidth, logicalHeight);
        const distance = Math.abs(axis - scanPosition);
        const scanStrength = Math.max(0, 1 - distance / scanBand);
        const lingering = cell.insideMask && axis < scanPosition ? Math.max(0.2, 1 - (scanPosition - axis) * decay) : 0;
        const reveal = isSettled && cell.insideMask ? cell.maskAlpha : Math.max(scanStrength, lingering) * cell.maskAlpha;
        const offset = isSettled ? 0 : (cell.seed - 0.5) * jitter * scanStrength * 3;

        if (cell.insideMask && reveal > 0.16) {
          drawTile(
            drawCtx,
            cell.x + offset,
            cell.y - offset,
            resolvedCellSize,
            Math.floor(cell.seed * 12 + frame),
            Math.min(1, foregroundIntensity * (0.32 + reveal * 0.85)),
            symbolSet,
          );
          continue;
        }

        const symbol = BACKGROUND_SYMBOLS[(cell.index + playKey + Math.floor(cell.seed * 9)) % BACKGROUND_SYMBOLS.length];
        const alpha = 0.09 + cell.seed * 0.12 + scanStrength * 0.16;
        drawCtx.fillStyle = `rgba(255,255,255,${alpha})`;
        drawCtx.fillText(symbol, cell.x + resolvedCellSize / 2, cell.y + resolvedCellSize / 2);
      }

      const glow = drawCtx.createRadialGradient(
        logicalWidth * 0.55,
        logicalHeight * 0.52,
        logicalWidth * 0.05,
        logicalWidth * 0.55,
        logicalHeight * 0.52,
        logicalWidth * 0.64,
      );
      glow.addColorStop(0, "rgba(255,255,255,0.06)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      drawCtx.fillStyle = glow;
      drawCtx.fillRect(0, 0, logicalWidth, logicalHeight);

      frame += 1;
    }

    prepareMask().then(() => {
      if (cancelled) return;
      const { cells, resolvedCellSize } = buildCells();

      if (reduced) {
        render(cells, resolvedCellSize, scanSpeed);
        return;
      }

      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        render(cells, resolvedCellSize, elapsed);
        if (!cancelled && elapsed < Math.max(600, scanSpeed)) {
          raf = requestAnimationFrame(tick);
        }
      };
      raf = requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [
    backgroundDensity,
    cellSize,
    compact,
    decay,
    fontFamily,
    fontWeight,
    foregroundIntensity,
    jitter,
    playKey,
    reduced,
    scanDirection,
    scanSpeed,
    sourceMode,
    svgSource,
    symbolSet,
    text,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "block max-w-full rounded-md border border-white/10 bg-black shadow-[0_0_40px_rgba(255,255,255,0.06)]",
        "w-full",
        compact ? "aspect-[18/11]" : "aspect-[34/19]",
        className,
      )}
      aria-label={sourceMode === "svg" ? "Glyph scan SVG reveal" : text}
      role="img"
    />
  );
}
