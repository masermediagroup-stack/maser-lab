"use client";

import { useEffect, useRef } from "react";
import {
  COLLAPSE_BLAST_END,
  COLLAPSE_EXPAND_START,
  COLLAPSE_MERGE_END,
  ASSEMBLE_FOOTPRINT_RULES,
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
  className?: string;
};

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Extra canvas margin past the stage so blast pixels aren't clipped. */
const CANVAS_BLEED = 0.34;

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
 * Footprint rules (see ASSEMBLE_FOOTPRINT_RULES):
 * - Grid stretches across the full cardW × cardH (settled pixels reach the plate).
 * - Perimeter ring is never density-skipped — seed cannot thin the outline.
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
  const perimeter = Math.max(1, ASSEMBLE_FOOTPRINT_RULES.perimeterCells);

  // Span the full card — never a floor()'d smaller grid that leaves a thin outline
  const cols = Math.max(1, Math.round(cardW / step));
  const rows = Math.max(1, Math.round(cardH / step));
  const cellW = cardW / cols;
  const cellH = cardH / rows;

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
      const cellX = left + col * cellW + cellW / 2;
      const cellY = top + row * cellH + cellH / 2;
      const lx = cellX - left;
      const ly = cellY - top;

      // Center-in-shape so edge cells still land on the card silhouette
      if (!pointInRoundedRect(lx, ly, cardW, cardH, cardRadius)) continue;

      const onPerimeter =
        col < perimeter ||
        row < perimeter ||
        col >= cols - perimeter ||
        row >= rows - perimeter;

      const h = hashSeeded(col + 1, row + 3, seed);
      const h2 = hashSeeded(row + 7, col + 11, seed);
      const h3 = hashSeeded(col * 13 + 2, row * 17 + 5, seed);

      // Density may thin the interior only — never the outer ring
      if (!onPerimeter && h > density * 0.92 + 0.08) continue;

      // Map each card cell to a filled squircle cell (solid plate, no ring hole)
      const home = squircleCells[
        Math.floor(h * squircleCells.length) % squircleCells.length
      ]!;

      const burstAngle = h2 * Math.PI * 2;
      // Cap vs canvas so the swarm stays inside the padded viewport
      const maxBurst = Math.min(width, height) * 0.22;
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

      const drawSize = Math.min(cellW, cellH);
      particles.push({
        tx: cellX - drawSize / 2,
        ty: cellY - drawSize / 2,
        sx: home.x,
        sy: home.y,
        mx: ox + Math.cos(burstAngle) * diskR - drawSize / 2,
        my: oy + Math.sin(burstAngle) * diskR - drawSize / 2,
        opacity: onPerimeter ? Math.max(0.72, 0.55 + h * 0.45) : 0.45 + h * 0.55,
        delay: Math.min(
          0.28,
          onPerimeter
            ? h * 0.12
            : h * 0.22 + Math.hypot(col - cols / 2, row - rows / 2) * 0.01,
        ),
        seed: h3,
      });
    }
  }

  const half = Math.max(3, Math.round(pixelSize)) / 2;
  const maxBurst = Math.min(width, height) * 0.22;
  // Dense core cluster (~22%) so mid-flight never shows a center hole
  const centerFill = Math.min(48, Math.floor(particles.length * 0.22));
  for (let i = 0; i < centerFill; i++) {
    const p = particles[i]!;
    const a = hashSeeded(i + 3, i + 9, seed) * Math.PI * 2;
    const r = maxBurst * Math.sqrt(hashSeeded(i + 1, 5, seed) * 0.14);
    p.mx = ox + Math.cos(a) * r - half;
    p.my = oy + Math.sin(a) * r - half;
  }
  // Pin a few midpoints exactly on the origin
  const pinCount = Math.min(8, particles.length);
  for (let i = 0; i < pinCount; i++) {
    const p = particles[particles.length - 1 - i]!;
    p.mx = ox - half;
    p.my = oy - half;
  }

  return particles;
}

function sampleAssemblePath(
  p: PixelParticle,
  local: number,
): { x: number; y: number } {
  if (local < 0.38) {
    const t = easeOutCubic(local / 0.38);
    return {
      x: p.sx + (p.mx - p.sx) * t,
      y: p.sy + (p.my - p.sy) * t,
    };
  }
  const t = easeInOutCubic((local - 0.38) / 0.62);
  const jitter = (1 - t) * (p.seed - 0.5) * 5;
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
  pixelSize: number,
): { x: number; y: number } {
  const centerX = ox - pixelSize / 2;
  const centerY = oy - pixelSize / 2;

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
  className,
}: PixelAssembleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<PixelParticle[]>([]);
  const sizeRef = useRef({
    w: 0,
    h: 0,
    cardW: 0,
    cardH: 0,
    stageW: 0,
    stageH: 0,
    padX: 0,
    padY: 0,
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
      const padX = Math.floor(stageW * CANVAS_BLEED);
      const padY = Math.floor(stageH * CANVAS_BLEED);
      const w = stageW + padX * 2;
      const h = stageH + padY * 2;
      const cardW = Math.min(cardWidth, stageW * 0.92);
      const cardH = Math.min(cardHeight, stageH * 0.7);
      sizeRef.current = { w, h, cardW, cardH, stageW, stageH, padX, padY };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const ox =
        (originX > 0 ? originX : stageW / 2) + padX;
      const oy =
        (originY > 0 ? originY : stageH / 2) + padY;

      particlesRef.current = buildParticles(
        w,
        h,
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

    const { w, h, cardW, cardH, stageW, stageH, padX, padY } = sizeRef.current;
    ctx.clearRect(0, 0, w || canvas.width, h || canvas.height);

    if (!active) return;
    if (progress <= 0.001 && phase !== "collapsing") return;

    const isDark = theme === "dark";
    const rgb = isDark ? "255,255,255" : "0,0,0";
    const fill = isDark ? "#ffffff" : "#000000";
    const size = Math.max(2, Math.round(pixelSize));
    const particles = particlesRef.current;
    const cx = padX + (stageW || w) / 2;
    const cy = padY + (stageH || h) / 2;
    const ox = (originX > 0 ? originX : (stageW || w) / 2) + padX;
    const oy = (originY > 0 ? originY : (stageH || h) / 2) + padY;
    const side = triggerSize || TRIGGER_SIZE;
    const triggerRadius = side * (TRIGGER_RADIUS / TRIGGER_SIZE);
    const collapsing = phase === "collapsing";

    if (collapsing) {
      const collapseT = clamp01(1 - progress);

      // Brief card plate as DOM hands off
      const cardShatter = clamp01(1 - collapseT / 0.1);
      if (cardShatter > 0.02) {
        const left = cx - cardW / 2;
        const top = cy - cardH / 2;
        ctx.save();
        ctx.globalAlpha = easeOutCubic(cardShatter);
        ctx.fillStyle = fill;
        roundRect(ctx, left, top, cardW, cardH, cardRadius);
        ctx.fill();
        ctx.restore();
      }

      // After merge: one pixel → grow into the squircle, then crossfade to DOM
      if (collapseT >= COLLAPSE_EXPAND_START) {
        const grow = easeOutCubic(
          clamp01(
            (collapseT - COLLAPSE_EXPAND_START) / (1 - COLLAPSE_EXPAND_START),
          ),
        );
        // Fade canvas plate as DOM trigger takes over (same grow window)
        const domT =
          grow < SQUIRCLE_DOM_REVEAL_GROW
            ? 0
            : clamp01(
                (grow - SQUIRCLE_DOM_REVEAL_GROW) /
                  (1 - SQUIRCLE_DOM_REVEAL_GROW),
              );
        const canvasAlpha = 1 - easeOutCubic(domT);
        if (canvasAlpha < 0.02) return;

        if (grow < 0.02) {
          ctx.fillStyle = fill;
          ctx.globalAlpha = canvasAlpha;
          ctx.fillRect(
            Math.round(ox - size / 2),
            Math.round(oy - size / 2),
            size,
            size,
          );
          ctx.globalAlpha = 1;
        } else {
          const grown = size + (side - size) * grow;
          const radius = triggerRadius * (grown / side);
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
        return;
      }

      // Flying pixels: filled-disk blast → converge to center (draw all — no hole)
      const explodeAlpha = cardShatter > 0.5 ? Math.max(0.55, 1 - cardShatter) : 1;
      if (explodeAlpha > 0.02) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          // Keep the swarm in sync so the disk stays solid while sucking in
          const { x, y } = sampleCollapsePath(p, collapseT, ox, oy, size);
          ctx.fillStyle = `rgba(${rgb},${(p.opacity * explodeAlpha).toFixed(3)})`;
          ctx.fillRect(Math.round(x), Math.round(y), size, size);
        }
      }
      return;
    }

    // ── Assemble: keep drawing plate until phase becomes expanded (no DOM flash)
    const plateSpan = Math.max(0.001, PIXEL_PLATE_SOLID_AT - PIXEL_PLATE_FILL_AT);
    const plateT = clamp01((progress - PIXEL_PLATE_FILL_AT) / plateSpan);
    if (plateT > 0) {
      const left = cx - cardW / 2;
      const top = cy - cardH / 2;
      ctx.save();
      ctx.globalAlpha = easeOutCubic(plateT);
      ctx.fillStyle = fill;
      roundRect(ctx, left, top, cardW, cardH, cardRadius);
      ctx.fill();
      ctx.restore();
    }

    const pixelFade =
      plateT > 0.4 ? clamp01(1 - (plateT - 0.4) / 0.6) : 1;
    if (pixelFade <= 0.02) return;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]!;
      const span = 1 - p.delay;
      const local = easeOutCubic(
        clamp01((progress - p.delay) / Math.max(0.001, span)),
      );
      if (local <= 0) continue;

      const { x, y } = sampleAssemblePath(p, local);
      const alpha = p.opacity * Math.min(1, local * 2.4) * pixelFade;
      ctx.fillStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
      ctx.fillRect(Math.round(x), Math.round(y), size, size);
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
  ]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
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
