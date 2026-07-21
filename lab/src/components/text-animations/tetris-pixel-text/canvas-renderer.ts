import { getDrawnCells, type ControllerState } from "./animation-controller";
import { hexToRgb } from "./colors";
import type { PartitionValidation } from "./partitioner";
import type { OccupancyGrid, TetrisPixelSettings } from "./types";
import { cellKey } from "./types";

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

function drawPieceGlow(
  ctx: CanvasRenderingContext2D,
  cells: Array<{ x: number; y: number }>,
  offsetX: number,
  offsetY: number,
  cellSize: number,
  color: string,
  intensity: number,
  radius: number,
  highDensity: boolean,
): void {
  if (intensity <= 0.01 || cells.length === 0) return;
  const rgb = hexToRgb(color);
  ctx.save();

  // High-density / mobile: single silhouette glow instead of per-cell gradients
  if (highDensity || cells.length > 8) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const c of cells) {
      minX = Math.min(minX, c.x);
      minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x);
      maxY = Math.max(maxY, c.y);
    }
    const pad = cellSize * (0.4 + radius * 0.25);
    const x = offsetX + minX * cellSize - pad;
    const y = offsetY + minY * cellSize - pad;
    const w = (maxX - minX + 1) * cellSize + pad * 2;
    const h = (maxY - minY + 1) * cellSize + pad * 2;
    const g = ctx.createRadialGradient(
      x + w / 2,
      y + h / 2,
      Math.min(w, h) * 0.12,
      x + w / 2,
      y + h / 2,
      Math.max(w, h) * 0.55,
    );
    g.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${0.4 * intensity})`);
    g.addColorStop(0.55, `rgba(${rgb.r},${rgb.g},${rgb.b},${0.12 * intensity})`);
    g.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    for (const c of cells) {
      const px = offsetX + c.x * cellSize;
      const py = offsetY + c.y * cellSize;
      ctx.rect(px - pad * 0.35, py - pad * 0.35, cellSize + pad * 0.7, cellSize + pad * 0.7);
    }
    ctx.fill();
    ctx.restore();
    return;
  }

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

export type DebugRenderInfo = {
  mask: OccupancyGrid;
  validation: PartitionValidation;
};

export function renderFrame(
  render: RenderContext,
  state: ControllerState,
  settings: TetrisPixelSettings,
  debug?: DebugRenderInfo | null,
): void {
  const { ctx, cssWidth, cssHeight, cellSize, offsetX, offsetY } = render;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = settings.background;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  // Clip all piece drawing to the visible preview stage.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, cssWidth, cssHeight);
  ctx.clip();

  const highDensity =
    cellSize <= 3 ||
    state.pieces.reduce((n, p) => n + p.cells.length, 0) > 400 ||
    (typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches);

  if (state.wordGlow > 0.02) {
    for (const p of state.pieces) {
      if (!p.visible || p.animState === "waiting") continue;
      if (!(p.animState === "landed" || p.animState === "landing")) continue;
      const cells = getDrawnCells(p);
      drawPieceGlow(
        ctx,
        cells,
        offsetX,
        offsetY,
        cellSize,
        p.glowColor,
        state.wordGlow * 0.35,
        settings.glowRadius * 0.8,
        highDensity,
      );
    }
  }

  for (const p of state.pieces) {
    if (!p.visible || p.animState === "waiting" || p.glowAlpha <= 0.01) continue;
    const cells = getDrawnCells(p);
    drawPieceGlow(
      ctx,
      cells,
      offsetX,
      offsetY,
      cellSize,
      p.glowColor,
      p.glowAlpha,
      settings.glowRadius,
      highDensity,
    );
  }

  for (const p of state.pieces) {
    if (!p.visible || p.animState === "waiting") continue;
    const cells = getDrawnCells(p);
    const scaleY = p.bounceScaleY;

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

  if (settings.debugOverlay && debug) {
    drawDebugOverlay(ctx, render, state, debug);
  }

  ctx.restore();
}

function drawDebugOverlay(
  ctx: CanvasRenderingContext2D,
  render: RenderContext,
  state: ControllerState,
  debug: DebugRenderInfo,
): void {
  const { cellSize, offsetX, offsetY, cssWidth } = render;
  const { mask, validation } = debug;

  // Source mask cells (cyan outline)
  ctx.strokeStyle = "rgba(0, 220, 255, 0.55)";
  ctx.lineWidth = 1;
  for (const c of mask.occupied) {
    ctx.strokeRect(offsetX + c.x * cellSize, offsetY + c.y * cellSize, cellSize, cellSize);
  }

  // Missing cells (red fill)
  ctx.fillStyle = "rgba(255, 40, 40, 0.55)";
  for (const k of validation.missing) {
    const [xs, ys] = k.split(",");
    ctx.fillRect(
      offsetX + Number(xs) * cellSize,
      offsetY + Number(ys) * cellSize,
      cellSize,
      cellSize,
    );
  }

  // Duplicate cells (magenta)
  ctx.fillStyle = "rgba(255, 0, 255, 0.45)";
  for (const k of validation.duplicates) {
    const [xs, ys] = k.split(",");
    ctx.fillRect(
      offsetX + Number(xs) * cellSize,
      offsetY + Number(ys) * cellSize,
      cellSize,
      cellSize,
    );
  }

  // Target bbox
  ctx.strokeStyle = "rgba(255, 220, 0, 0.8)";
  ctx.strokeRect(
    offsetX,
    offsetY,
    state.gridWidth * cellSize,
    state.gridHeight * cellSize,
  );

  // Canvas bounds
  ctx.strokeStyle = "rgba(0, 255, 120, 0.7)";
  ctx.strokeRect(0.5, 0.5, render.cssWidth - 1, render.cssHeight - 1);

  // Spawn bounds: lowest spawn Y among pieces
  const minSpawn = Math.min(...state.pieces.map((p) => p.spawnY));
  ctx.strokeStyle = "rgba(255, 140, 0, 0.8)";
  ctx.beginPath();
  ctx.moveTo(0, offsetY + minSpawn * cellSize);
  ctx.lineTo(cssWidth, offsetY + minSpawn * cellSize);
  ctx.stroke();

  const lines = [
    `target: ${validation.targetOccupiedCellCount}`,
    `assigned: ${validation.assignedPieceCellCount}`,
    `pieces: ${validation.pieceCount}`,
    `missing: ${validation.missing.length}`,
    `dups: ${validation.duplicates.length}`,
    `ok: ${validation.ok}`,
    `maskKey sample: ${mask.cells.has(cellKey(0, 0)) ? "pad" : "—"}`,
  ];
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(8, 8, 168, 14 * lines.length + 10);
  ctx.fillStyle = "#fff";
  ctx.font = "11px ui-monospace, monospace";
  lines.forEach((line, i) => {
    ctx.fillText(line, 14, 22 + i * 14);
  });
}
