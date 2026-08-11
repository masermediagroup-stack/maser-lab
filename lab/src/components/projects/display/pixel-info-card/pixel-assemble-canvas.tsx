"use client";

import { useEffect, useRef } from "react";
import {
  COLLAPSE_BLAST_END,
  COLLAPSE_EXPAND_MIN_SCALE,
  COLLAPSE_EXPAND_START,
  COLLAPSE_MERGE_END,
  COLLAPSE_SWARM_FADE_SPAN,
  PIXEL_PLATE_FILL_AT,
  PIXEL_PLATE_SOLID_AT,
  SQUIRCLE_DOM_REVEAL_GROW,
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
  snakeDensity: number;
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

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Extra inset for burst particles — drawable margin inside the stage (no oversized canvas). */
const STAGE_BURST_INSET = 0.22;

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
 * Stagger from center outward — same density/opacity rules everywhere (no edge ring).
 */
function computeAssembleDelay(
  col: number,
  row: number,
  cols: number,
  rows: number,
  h: number,
): number {
  const maxDist = Math.hypot(cols / 2, rows / 2) || 1;
  const dist = Math.hypot(col - (cols - 1) / 2, row - (rows - 1) / 2);
  return Math.min(0.28, h * 0.12 + (dist / maxDist) * 0.1);
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

/**
 * Build assemble particles for the card silhouette.
 *
 * Footprint rules:
 * - Grid stretches across the full cardW × cardH.
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
  const cx = width / 2;
  const cy = height / 2;
  const ox = Number.isFinite(originX) && originX > 0 ? originX : cx;
  const oy = Number.isFinite(originY) && originY > 0 ? originY : cy;
  const left = cx - cardW / 2;
  const top = cy - cardH / 2;
  const step = Math.max(3, Math.round(pixelSize));
  const seed = motionSeed || 1;

  // Integer grid — each cell is exactly `step` px, edge-to-edge (no overlap).
  const cols = Math.max(1, Math.floor(cardW / step));
  const rows = Math.max(1, Math.floor(cardH / step));
  const gridW = cols * step;
  const gridH = rows * step;
  const gridLeft = left + (cardW - gridW) / 2;
  const gridTop = top + (cardH - gridH) / 2;

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

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tx = gridLeft + col * step;
      const ty = gridTop + row * step;
      const lx = tx - left + step / 2;
      const ly = ty - top + step / 2;

      // Center-in-shape so edge cells still land on the card silhouette
      if (!pointInRoundedRect(lx, ly, cardW, cardH, cardRadius)) continue;

      const h = hashSeeded(col + 1, row + 3, seed);
      const h2 = hashSeeded(row + 7, col + 11, seed);
      const h3 = hashSeeded(col * 13 + 2, row * 17 + 5, seed);

      // Boost keep rate in top/bottom bands only (not a perimeter ring) so every
      // seed reaches full card height before the DOM handoff.
      const rowT = rows <= 1 ? 0.5 : row / (rows - 1);
      const verticalBand = rowT < 0.14 || rowT > 0.86;
      const keepCutoff = density * 0.92 + 0.08 - (verticalBand ? 0.24 : 0);
      if (h > keepCutoff) continue;

      // Map each card cell to a filled squircle cell (solid plate, no ring hole)
      const home = squircleCells[
        Math.floor(h * squircleCells.length) % squircleCells.length
      ]!;

      const burstAngle = h2 * Math.PI * 2;
      const maxBurst =
        Math.min(width, height) * STAGE_BURST_INSET;
      const u = Math.min(0.999, Math.max(0, h3));
      // Strong center bias: core / mid / outer bands (never a hollow ring)
      let diskR: number;
      if (h < 0.3) {
        diskR = maxBurst * 0.2 * Math.sqrt(u);
      } else if (h < 0.58) {
        diskR = maxBurst * (0.12 + 0.48 * Math.sqrt(u));
      } else {
        diskR = maxBurst * Math.sqrt(u);
      }

      const drawSize = step;

      particles.push({
        tx,
        ty,
        sx: home.x,
        sy: home.y,
        mx: ox + Math.cos(burstAngle) * diskR - drawSize / 2,
        my: oy + Math.sin(burstAngle) * diskR - drawSize / 2,
        drawSize,
        opacity: 0.45 + h * 0.55,
        delay: computeAssembleDelay(col, row, cols, rows, h),
        seed: h3,
      });
    }
  }

  // Spread mid-flight cluster on the same step grid (no stacked overlaps at origin)
  const centerFill = Math.min(48, Math.floor(particles.length * 0.22));
  const spreadCols = 7;
  for (let i = 0; i < centerFill; i++) {
    const p = particles[i]!;
    const spreadCol = (i % spreadCols) - Math.floor(spreadCols / 2);
    const spreadRow = Math.floor(i / spreadCols) - 2;
    p.mx = ox + spreadCol * step - step / 2;
    p.my = oy + spreadRow * step - step / 2;
  }
  const pinCount = Math.min(8, particles.length);
  for (let i = 0; i < pinCount; i++) {
    const p = particles[particles.length - 1 - i]!;
    const spreadCol = (i % 3) - 1;
    const spreadRow = Math.floor(i / 3) - 1;
    p.mx = ox + spreadCol * step - step / 2;
    p.my = oy + spreadRow * step - step / 2;
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
  // Jitter only while in transit — snap to grid targets so neighbors touch, not stack
  const jitterScale = t < 0.82 ? 1 - t / 0.82 : 0;
  const jitter = jitterScale * (p.seed - 0.5) * 2;
  return {
    x: p.mx + (p.tx - p.mx) * t + jitter,
    y: p.my + (p.ty - p.my) * t + jitter * 0.55,
  };
}

/**
 * Collapse: card → filled-disk blast → all pixels merge to one center point.
 * Squircle expansion is drawn separately after merge.
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
    // Shrink the filled disk toward center (ease-out keeps the core dense)
    const t = easeOutCubic(
      (collapseT - COLLAPSE_BLAST_END) /
        (COLLAPSE_MERGE_END - COLLAPSE_BLAST_END),
    );
    return {
      x: p.mx + (centerX - p.mx) * t,
      y: p.my + (centerY - p.my) * t,
    };
  }

  return { x: centerX, y: centerY };
}

/**
 * Canvas overlay: assemble densifies into a card plate; collapse blasts into a
 * filled disk, merges to one pixel, then expands that pixel into the squircle.
 */
export function PixelAssembleCanvas({
  active,
  progress,
  phase,
  theme,
  pixelSize,
  snakeDensity,
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
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const ox = originX > 0 ? originX : stageW / 2;
      const oy = originY > 0 ? originY : stageH / 2;

      particlesRef.current = buildParticles(
        stageW,
        stageH,
        cardW,
        cardH,
        cardRadius,
        pixelSize,
        snakeDensity,
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
    snakeDensity,
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

    const { w, h, cardW, cardH } = sizeRef.current;
    ctx.clearRect(0, 0, w || canvas.width, h || canvas.height);

    if (!active) return;
    if (progress <= 0.001 && phase !== "collapsing") return;

    const isDark = theme === "dark";
    const rgb = isDark ? "255,255,255" : "0,0,0";
    const fill = isDark ? "#ffffff" : "#000000";
    const particles = particlesRef.current;
    const cx = w / 2;
    const cy = h / 2;
    const ox = originX > 0 ? originX : w / 2;
    const oy = originY > 0 ? originY : h / 2;
    const side = triggerSize || TRIGGER_SIZE;
    const triggerRadius = side * (TRIGGER_RADIUS / TRIGGER_SIZE);
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

      // After merge: grow merged core into squircle, crossfading the swarm out
      if (collapseT >= COLLAPSE_EXPAND_START) {
        const expandSpan = Math.max(0.001, 1 - COLLAPSE_EXPAND_START);
        const grow = easeInOutCubic(
          clamp01((collapseT - COLLAPSE_EXPAND_START) / expandSpan),
        );
        const domT =
          grow < SQUIRCLE_DOM_REVEAL_GROW
            ? 0
            : clamp01(
                (grow - SQUIRCLE_DOM_REVEAL_GROW) /
                  (1 - SQUIRCLE_DOM_REVEAL_GROW),
              );
        const canvasAlpha = 1 - easeOutCubic(domT);
        const swarmFade = easeOutCubic(
          clamp01(
            1 - (collapseT - COLLAPSE_EXPAND_START) / COLLAPSE_SWARM_FADE_SPAN,
          ),
        );

        // Match merged pixel cluster (~3 cells) so grow doesn't pop from a dot
        const clusterSize =
          particles.length > 0
            ? Math.max(
                particles[0]!.drawSize * 2.8,
                side * COLLAPSE_EXPAND_MIN_SCALE,
              )
            : side * COLLAPSE_EXPAND_MIN_SCALE;
        const grown = clusterSize + (side - clusterSize) * grow;
        const radius = triggerRadius * (grown / side);

        if (canvasAlpha > 0.02) {
          ctx.save();
          ctx.globalAlpha = canvasAlpha;
          ctx.fillStyle = fill;
          roundRect(
            ctx,
            ox - grown / 2,
            oy - grown / 2,
            grown,
            grown,
            radius,
          );
          ctx.fill();
          ctx.restore();
        }

        if (swarmFade > 0.02) {
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i]!;
            const { x, y } = sampleCollapsePath(p, collapseT, ox, oy);
            const ds = p.drawSize;
            ctx.fillStyle = `rgba(${rgb},${(p.opacity * swarmFade * canvasAlpha).toFixed(3)})`;
            ctx.fillRect(Math.round(x), Math.round(y), ds, ds);
          }
        }
        return;
      }

      // Flying pixels: filled-disk blast → converge to center (draw all — no hole)
      const explodeAlpha = cardShatter > 0.5 ? Math.max(0.55, 1 - cardShatter) : 1;
      if (explodeAlpha > 0.02) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          const { x, y } = sampleCollapsePath(p, collapseT, ox, oy);
          const ds = p.drawSize;
          ctx.fillStyle = `rgba(${rgb},${(p.opacity * explodeAlpha).toFixed(3)})`;
          ctx.fillRect(Math.round(x), Math.round(y), ds, ds);
        }
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
      ctx.fillRect(Math.round(x), Math.round(y), ds, ds);
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
