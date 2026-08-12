"use client";

import { useEffect, useRef } from "react";
import {
  COLLAPSE_BLAST_END,
  COLLAPSE_MERGE_END,
  COLLAPSE_VANISH_END,
  PIXEL_PLATE_FILL_AT,
  PIXEL_PLATE_SOLID_AT,
  TRIGGER_RADIUS,
  TRIGGER_SIZE,
} from "./constants";
import type { PixelInfoPhase, PixelInfoTheme } from "./types";

type PixelParticle = {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  mx: number;
  my: number;
  /** Render width/height — matches snapped cell footprint. */
  drawSize: number;
  opacity: number;
  delay: number;
  seed: number;
};

type PixelAssembleCanvasProps = {
  active: boolean;
  progress: number;
  phase: PixelInfoPhase;
  theme: PixelInfoTheme;
  pixelSize: number;
  pixelDensity: number;
  cardRadius: number;
  cardWidth: number;
  cardHeight: number;
  triggerSize: number;
  /** Squircle center in stage/canvas CSS pixels (not stage midpoint — label offsets it). */
  originX: number;
  originY: number;
  /** Changes each open so burst paths / midpoints reshuffle. */
  motionSeed: number;
  /** DOM card is visible — stop drawing the canvas plate to avoid a seam line. */
  domCardVisible?: boolean;
  className?: string;
};

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function easeInCubic(t: number): number {
  return t * t * t;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function hash2(a: number, b: number): number {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/** Deterministic 0–1 from indices + per-open motion seed. */
function hashSeeded(a: number, b: number, seed: number): number {
  return hash2(a + seed * 0.7133, b + seed * 1.6181);
}

function pointInRoundedRect(
  lx: number,
  ly: number,
  w: number,
  h: number,
  r: number,
): boolean {
  const radius = Math.min(r, w / 2, h / 2);
  if (lx >= radius && lx <= w - radius) return ly >= 0 && ly <= h;
  if (ly >= radius && ly <= h - radius) return lx >= 0 && lx <= w;
  const cx = lx < radius ? radius : w - radius;
  const cy = ly < radius ? radius : h - radius;
  const dx = lx - cx;
  const dy = ly - cy;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Hash-only stagger — no center-out bias (that clusters visible fill in the middle).
 */
function computeAssembleDelay(h: number): number {
  return h * 0.22;
}

/** Solid squircle cell centers (fills the whole shape — no hollow middle). */
function squircleCellCenters(
  ox: number,
  oy: number,
  side: number,
  step: number,
  radius: number,
): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  const cols = Math.max(1, Math.floor(side / step));
  const rows = Math.max(1, Math.floor(side / step));
  const gridW = cols * step;
  const gridH = rows * step;
  const left = ox - gridW / 2;
  const top = oy - gridH / 2;
  const half = step / 2 - 0.5;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = left + col * step + step / 2;
      const cy = top + row * step + step / 2;
      const lx = cx - (ox - side / 2);
      const ly = cy - (oy - side / 2);
      if (
        pointInRoundedRect(lx - half, ly - half, side, side, radius) &&
        pointInRoundedRect(lx + half, ly - half, side, side, radius) &&
        pointInRoundedRect(lx - half, ly + half, side, side, radius) &&
        pointInRoundedRect(lx + half, ly + half, side, side, radius)
      ) {
        cells.push({ x: cx - step / 2, y: cy - step / 2 });
      }
    }
  }
  return cells;
}

type CardGrid = {
  plateLeft: number;
  plateTop: number;
  plateW: number;
  plateH: number;
  step: number;
  cols: number;
  rows: number;
  gridLeft: number;
  gridTop: number;
};

/** Integer-aligned plate + pixel grid — shared by particles and canvas plate. */
function computeCardGrid(
  cx: number,
  cy: number,
  cardW: number,
  cardH: number,
  pixelSize: number,
): CardGrid {
  const { left: plateLeft, top: plateTop, width: plateW, height: plateH } =
    cardPlateRect(cx, cy, cardW, cardH);
  const step = Math.max(1, Math.round(pixelSize));
  const cols = Math.max(1, Math.floor(plateW / step));
  const rows = Math.max(1, Math.floor(plateH / step));
  const gridW = cols * step;
  const gridH = rows * step;
  return {
    plateLeft,
    plateTop,
    plateW,
    plateH,
    step,
    cols,
    rows,
    gridLeft: plateLeft + Math.floor((plateW - gridW) / 2),
    gridTop: plateTop + Math.floor((plateH - gridH) / 2),
  };
}

/**
 * Build assemble particles for the card silhouette.
 *
 * Footprint rules:
 * - Grid aligns to the same integer plate rect as the canvas/DOM card.
 * - One uniform density pass — edges are not denser, snapped, or delayed
 *   differently (that reads as a fake border during assemble).
 * - Seed only reshuffles burst paths / homes / delays.
 */
function buildParticles(
  width: number,
  height: number,
  cardW: number,
  cardH: number,
  cardRadius: number,
  pixelSize: number,
  density: number,
  triggerSize: number,
  originX: number,
  originY: number,
  motionSeed: number,
): PixelParticle[] {
  const particles: PixelParticle[] = [];
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  const ox = Number.isFinite(originX) && originX > 0 ? originX : cx;
  const oy = Number.isFinite(originY) && originY > 0 ? originY : cy;
  const seed = motionSeed || 1;

  const {
    plateLeft,
    plateTop,
    plateW,
    plateH,
    step,
    cols,
    rows,
    gridLeft,
    gridTop,
  } = computeCardGrid(cx, cy, cardW, cardH, pixelSize);

  const squircleCells = squircleCellCenters(
    ox,
    oy,
    triggerSize,
    step,
    triggerSize * (TRIGGER_RADIUS / TRIGGER_SIZE),
  );
  if (squircleCells.length === 0) {
    squircleCells.push({ x: ox - step / 2, y: oy - step / 2 });
  }

  // Collect every valid cell, then keep a stratified subset so fill is uniform
  // across the whole silhouette (per-row caps left a dense horizontal band).
  type CellCandidate = {
    row: number;
    col: number;
    tx: number;
    ty: number;
    rank: number;
    h: number;
    h2: number;
    h3: number;
  };

  const candidates: CellCandidate[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tx = gridLeft + col * step;
      const ty = gridTop + row * step;
      const lx = tx - plateLeft + step / 2;
      const ly = ty - plateTop + step / 2;

      if (!pointInRoundedRect(lx, ly, plateW, plateH, cardRadius)) continue;

      const h = hashSeeded(col + 1, row + 3, seed);
      const h2 = hashSeeded(row + 7, col + 11, seed);
      const h3 = hashSeeded(col * 13 + 2, row * 17 + 5, seed);
      const rank = hashSeeded(col * 31 + 7, row * 37 + 11, seed);

      candidates.push({ row, col, tx, ty, rank, h, h2, h3 });
    }
  }

  if (candidates.length === 0) return particles;

  candidates.sort((a, b) => a.rank - b.rank);
  const targetCount = Math.max(
    1,
    Math.round(clamp01(density) * candidates.length),
  );

  for (let i = 0; i < targetCount; i++) {
    const c = candidates[i]!;

    // Map each card cell to a filled squircle cell (solid plate, no ring hole)
    const home = squircleCells[
      Math.floor(c.h * squircleCells.length) % squircleCells.length
    ]!;

    const burstAngle = c.h2 * Math.PI * 2;
    const maxBurst = Math.min(plateW, plateH) * 0.12;
    const diskR = maxBurst * Math.sqrt(c.h3);
    const drawSize = step;
    const burstDx = Math.round(Math.cos(burstAngle) * diskR);
    const burstDy = Math.round(Math.sin(burstAngle) * diskR);

    particles.push({
      tx: c.tx,
      ty: c.ty,
      sx: home.x,
      sy: home.y,
      mx: c.tx + burstDx,
      my: c.ty + burstDy,
      drawSize,
      opacity: 0.45 + c.h * 0.55,
      delay: computeAssembleDelay(c.h),
      seed: c.h3,
    });
  }

  return particles;
}

function sampleAssemblePath(
  p: PixelParticle,
  local: number,
): { x: number; y: number } {
  if (local >= 1) {
    return { x: p.tx, y: p.ty };
  }
  if (local < 0.38) {
    const t = easeOutCubic(local / 0.38);
    return {
      x: p.sx + (p.mx - p.sx) * t,
      y: p.sy + (p.my - p.sy) * t,
    };
  }
  const t = easeInOutCubic((local - 0.38) / 0.62);
  // Integer grid targets only — no jitter (breaks edge-to-edge alignment at larger steps).
  if (t >= 1) {
    return { x: p.tx, y: p.ty };
  }
  return {
    x: Math.round(p.mx + (p.tx - p.mx) * t),
    y: Math.round(p.my + (p.ty - p.my) * t),
  };
}

/**
 * Collapse: card → filled-disk blast → merge to origin → shrink into nothing.
 * Positions stay continuous (no per-frame integer snap).
 */
function sampleCollapsePath(
  p: PixelParticle,
  collapseT: number,
  ox: number,
  oy: number,
): { x: number; y: number } {
  const centerX = ox - p.drawSize / 2;
  const centerY = oy - p.drawSize / 2;

  if (collapseT < COLLAPSE_BLAST_END) {
    const t = easeOutCubic(collapseT / COLLAPSE_BLAST_END);
    return {
      x: p.tx + (p.mx - p.tx) * t,
      y: p.ty + (p.my - p.ty) * t,
    };
  }

  if (collapseT < COLLAPSE_MERGE_END) {
    // Ease-in: stay spread while fading, then the last ghosts suck to the origin
    const t = easeInCubic(
      (collapseT - COLLAPSE_BLAST_END) /
        (COLLAPSE_MERGE_END - COLLAPSE_BLAST_END),
    );
    const spread = (1 - t) * 14;
    const jx = (p.seed - 0.5) * spread;
    const jy = (hash2(p.seed, p.delay) - 0.5) * spread;
    return {
      x: p.mx + (centerX - p.mx) * t + jx,
      y: p.my + (centerY - p.my) * t + jy,
    };
  }

  return { x: centerX, y: centerY };
}

/**
 * Recede into the page: shrink while still spread (ease-out) so stacked
 * footprints never form a mini-squircle at the origin.
 */
function collapseParticleScale(collapseT: number): number {
  if (collapseT < COLLAPSE_BLAST_END) return 1;
  if (collapseT < COLLAPSE_MERGE_END) {
    const t = easeOutCubic(
      (collapseT - COLLAPSE_BLAST_END) /
        (COLLAPSE_MERGE_END - COLLAPSE_BLAST_END),
    );
    return 1 - t;
  }
  return 0;
}

/**
 * Stay readable in flight; fade out as they converge so overlapping dots cannot
 * add up into a solid white plate.
 */
function collapseParticleAlpha(collapseT: number, base: number): number {
  if (collapseT < COLLAPSE_BLAST_END) return base;
  if (collapseT < COLLAPSE_MERGE_END) {
    const t = easeOutCubic(
      (collapseT - COLLAPSE_BLAST_END) /
        (COLLAPSE_MERGE_END - COLLAPSE_BLAST_END),
    );
    return base * (1 - t);
  }
  const vanishSpan = Math.max(0.001, COLLAPSE_VANISH_END - COLLAPSE_MERGE_END);
  const t = clamp01((collapseT - COLLAPSE_MERGE_END) / vanishSpan);
  return base * (1 - t) * 0.08;
}

/**
 * Canvas overlay: assemble densifies into a card plate; collapse blasts into a
 * filled disk, merges to the origin while shrinking to nothing, then the DOM
 * squircle emerges afterward — this canvas does not draw a solid blob.
 */
export function PixelAssembleCanvas({
  active,
  progress,
  phase,
  theme,
  pixelSize,
  pixelDensity,
  cardRadius,
  cardWidth,
  cardHeight,
  triggerSize,
  originX,
  originY,
  motionSeed,
  domCardVisible = false,
  className,
}: PixelAssembleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<PixelParticle[]>([]);
  const sizeRef = useRef({
    w: 0,
    h: 0,
    cardW: 0,
    cardH: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const stageW = Math.max(1, Math.floor(rect.width));
      const stageH = Math.max(1, Math.floor(rect.height));
      // Match measured DOM card exactly — no stage caps that undershoot height.
      const cardW = Math.max(1, cardWidth);
      const cardH = Math.max(1, cardHeight);
      sizeRef.current = { w: stageW, h: stageH, cardW, cardH };
      canvas.width = Math.floor(stageW * dpr);
      canvas.height = Math.floor(stageH * dpr);
      canvas.style.width = `${stageW}px`;
      canvas.style.height = `${stageH}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = false;
      }

      const ox = originX > 0 ? originX : stageW / 2;
      const oy = originY > 0 ? originY : stageH / 2;

      particlesRef.current = buildParticles(
        stageW,
        stageH,
        cardW,
        cardH,
        cardRadius,
        pixelSize,
        pixelDensity,
        triggerSize,
        ox,
        oy,
        motionSeed,
      );
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [
    cardWidth,
    cardHeight,
    cardRadius,
    pixelSize,
    pixelDensity,
    triggerSize,
    originX,
    originY,
    motionSeed,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const { w, h, cardW, cardH } = sizeRef.current;
    ctx.clearRect(0, 0, w || canvas.width, h || canvas.height);

    if (!active) return;
    if (progress <= 0.001 && phase !== "collapsing") return;

    const isDark = theme === "dark";
    const rgb = isDark ? "255,255,255" : "0,0,0";
    const fill = isDark ? "#ffffff" : "#000000";
    const particles = particlesRef.current;
    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);
    const ox = originX > 0 ? originX : w / 2;
    const oy = originY > 0 ? originY : h / 2;
    const collapsing = phase === "collapsing";

    if (collapsing) {
      const collapseT = clamp01(1 - progress);

      // Brief card plate as DOM hands off
      const cardShatter = clamp01(1 - collapseT / 0.1);
      if (cardShatter > 0.02 && !domCardVisible) {
        const { left, top, width, height } = cardPlateRect(cx, cy, cardW, cardH);
        ctx.save();
        ctx.globalAlpha = easeOutCubic(cardShatter);
        ctx.fillStyle = fill;
        roundRect(ctx, left, top, width, height, cardRadius);
        ctx.fill();
        ctx.restore();
      }

      // Pixels vanish into the origin — no solid squircle plate on canvas
      if (collapseT >= COLLAPSE_VANISH_END) return;

      const explodeAlpha =
        cardShatter > 0.5 ? Math.max(0.55, 1 - cardShatter) : 1;
      if (explodeAlpha <= 0.02) return;

      const sizeScale = collapseParticleScale(collapseT);
      if (sizeScale <= 0.04) return;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        const { x, y } = sampleCollapsePath(p, collapseT, ox, oy);
        const ds = p.drawSize * sizeScale;
        if (ds < 0.45) continue;
        const drawX = x + (p.drawSize - ds) / 2;
        const drawY = y + (p.drawSize - ds) / 2;
        const alpha = collapseParticleAlpha(collapseT, p.opacity) * explodeAlpha;
        if (alpha <= 0.03) continue;
        ctx.fillStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
        ctx.fillRect(drawX, drawY, ds, ds);
      }
      return;
    }

    // ── Assemble: keep drawing plate until phase becomes expanded (no DOM flash)
    const plateSpan = Math.max(0.001, PIXEL_PLATE_SOLID_AT - PIXEL_PLATE_FILL_AT);
    const plateT = clamp01((progress - PIXEL_PLATE_FILL_AT) / plateSpan);
    if (plateT > 0 && !domCardVisible) {
      const { left, top, width, height } = cardPlateRect(cx, cy, cardW, cardH);
      ctx.save();
      ctx.globalAlpha = easeOutCubic(plateT);
      ctx.fillStyle = fill;
      roundRect(ctx, left, top, width, height, cardRadius);
      ctx.fill();
      ctx.restore();
    }

    const pixelFade =
      plateT > 0.35 ? clamp01(1 - (plateT - 0.35) / 0.65) : 1;
    if (pixelFade <= 0.02) return;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]!;
      const span = 1 - p.delay;
      const local = easeOutCubic(
        clamp01((progress - p.delay) / Math.max(0.001, span)),
      );
      if (local <= 0) continue;

      const { x, y } = sampleAssemblePath(p, local);
      const ds = p.drawSize;
      const alpha = p.opacity * Math.min(1, local * 2.4) * pixelFade;
      ctx.fillStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
      ctx.fillRect(x, y, ds, ds);
    }
  }, [
    active,
    progress,
    phase,
    theme,
    pixelSize,
    cardRadius,
    triggerSize,
    originX,
    originY,
    domCardVisible,
  ]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}

/** Integer-aligned plate rect — avoids a 1px seam vs the DOM card on handoff. */
function cardPlateRect(
  cx: number,
  cy: number,
  cardW: number,
  cardH: number,
): { left: number; top: number; width: number; height: number } {
  const width = Math.round(cardW);
  const height = Math.round(cardH);
  return {
    left: Math.round(cx - width / 2),
    top: Math.round(cy - height / 2),
    width,
    height,
  };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
