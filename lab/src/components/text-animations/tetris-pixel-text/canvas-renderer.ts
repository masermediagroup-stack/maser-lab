import { getDrawnCells, type ControllerState } from "./animation-controller";
import { hexToRgb } from "./colors";
import type { TetrisPixelSettings } from "./types";

export type RenderContext = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  dpr: number;
  cssWidth: number;
  cssHeight: number;
  cellSize: number;
  offsetX: number;
  offsetY: number;
};

export function setupCanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
): RenderContext | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(cssWidth * dpr));
  canvas.height = Math.max(1, Math.floor(cssHeight * dpr));
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  return {
    canvas,
    ctx,
    dpr,
    cssWidth,
    cssHeight,
    cellSize: 8,
    offsetX: 0,
    offsetY: 0,
  };
}

export function layoutStage(
  render: RenderContext,
  gridWidth: number,
  gridHeight: number,
  cellSize: number,
): void {
  render.cellSize = cellSize;
  const stageW = gridWidth * cellSize;
  const stageH = gridHeight * cellSize;
  render.offsetX = Math.floor((render.cssWidth - stageW) / 2);
  render.offsetY = Math.floor((render.cssHeight - stageH) / 2);
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  scaleY: number,
): void {
  const h = size * scaleY;
  const oy = (size - h) / 2;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y + oy), size, Math.max(1, Math.round(h)));
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  cells: Array<{ x: number; y: number }>,
  offsetX: number,
  offsetY: number,
  cellSize: number,
  color: string,
  intensity: number,
  radius: number,
): void {
  if (intensity <= 0.01) return;
  const rgb = hexToRgb(color);
  ctx.save();
  for (const c of cells) {
    const px = offsetX + c.x * cellSize;
    const py = offsetY + c.y * cellSize;
    const r = cellSize * (0.6 + radius * 0.35);
    const g = ctx.createRadialGradient(
      px + cellSize / 2,
      py + cellSize / 2,
      cellSize * 0.15,
      px + cellSize / 2,
      py + cellSize / 2,
      r,
    );
    g.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${0.55 * intensity})`);
    g.addColorStop(0.45, `rgba(${rgb.r},${rgb.g},${rgb.b},${0.18 * intensity})`);
    g.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(px - r, py - r, cellSize + r * 2, cellSize + r * 2);
  }
  ctx.restore();
}

export function renderFrame(
  render: RenderContext,
  state: ControllerState,
  settings: TetrisPixelSettings,
): void {
  const { ctx, cssWidth, cssHeight, cellSize, offsetX, offsetY } = render;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = settings.background;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  // Word-level glow behind completed pieces
  if (state.wordGlow > 0.02) {
    ctx.save();
    for (const p of state.pieces) {
      if (!p.visible || !p.landed) continue;
      const cells = getDrawnCells(p);
      drawGlow(
        ctx,
        cells,
        offsetX,
        offsetY,
        cellSize,
        p.glowColor,
        state.wordGlow * 0.35,
        settings.glowRadius * 0.8,
      );
    }
    ctx.restore();
  }

  // Landing glows (under pixels)
  for (const p of state.pieces) {
    if (!p.visible || p.glowAlpha <= 0.01) continue;
    const cells = getDrawnCells(p);
    drawGlow(
      ctx,
      cells,
      offsetX,
      offsetY,
      cellSize,
      p.glowColor,
      p.glowAlpha,
      settings.glowRadius,
    );
  }

  // Pieces
  for (const p of state.pieces) {
    if (!p.visible) continue;
    const cells = getDrawnCells(p);
    const scaleY = p.bounceScaleY;

    // Impact flash
    let color = p.color;
    if (p.impactFlash > 0.01) {
      const rgb = hexToRgb(p.color);
      const f = p.impactFlash;
      color = `rgb(${Math.min(255, rgb.r + 80 * f)},${Math.min(255, rgb.g + 80 * f)},${Math.min(255, rgb.b + 80 * f)})`;
    }

    for (const c of cells) {
      const px = offsetX + c.x * cellSize;
      const py = offsetY + c.y * cellSize;
      drawCell(ctx, px, py, cellSize, color, scaleY);
    }

    // Sparse pixel sparks on recent land
    if (p.impactFlash > 0.2 && settings.impactFlash > 0.2) {
      const rgb = hexToRgb(p.color);
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${p.impactFlash * 0.7})`;
      for (let s = 0; s < Math.min(3, cells.length); s++) {
        const c = cells[s]!;
        const px = offsetX + c.x * cellSize + cellSize * 0.5;
        const py = offsetY + c.y * cellSize - cellSize * 0.4 * p.impactFlash;
        ctx.fillRect(Math.round(px), Math.round(py), 2, 2);
      }
    }
  }
}
