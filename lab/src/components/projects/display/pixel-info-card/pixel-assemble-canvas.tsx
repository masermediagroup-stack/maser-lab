"use client";

import { useEffect, useRef } from "react";
import {
  COLLAPSE_BLAST_END,
  COLLAPSE_EXPAND_START,
  COLLAPSE_MERGE_END,
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
): PixelParticle[] {
  const particles: PixelParticle[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const ox = Number.isFinite(originX) && originX > 0 ? originX : cx;
  const oy = Number.isFinite(originY) && originY > 0 ? originY : cy;
  const left = cx - cardW / 2;
  const top = cy - cardH / 2;
  const step = Math.max(3, Math.round(pixelSize));

  const cols = Math.max(1, Math.floor(cardW / step));
  const rows = Math.max(1, Math.floor(cardH / step));
  const gridW = cols * step;
  const gridH = rows * step;
  const gridLeft = cx - gridW / 2;
  const gridTop = cy - gridH / 2;

  const squircleCells = squircleCellCenters(
    ox,
    oy,
    triggerSize,
    step,
    TRIGGER_RADIUS,
  );
  if (squircleCells.length === 0) {
    squircleCells.push({ x: ox - step / 2, y: oy - step / 2 });
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellX = gridLeft + col * step + step / 2;
      const cellY = gridTop + row * step + step / 2;
      const lx = cellX - left;
      const ly = cellY - top;

      const half = step / 2 - 0.5;
      const insetOk =
        pointInRoundedRect(lx - half, ly - half, cardW, cardH, cardRadius) &&
        pointInRoundedRect(lx + half, ly - half, cardW, cardH, cardRadius) &&
        pointInRoundedRect(lx - half, ly + half, cardW, cardH, cardRadius) &&
        pointInRoundedRect(lx + half, ly + half, cardW, cardH, cardRadius);
      if (!insetOk) continue;

      const h = hash2(col + 1, row + 3);
      const h2 = hash2(row + 7, col + 11);
      const h3 = hash2(col * 13 + 2, row * 17 + 5);
      if (h > density * 0.92 + 0.08) continue;

      // Map each card cell to a filled squircle cell (solid plate, no ring hole)
      const home = squircleCells[
        Math.floor(h * squircleCells.length) % squircleCells.length
      ]!;

      const burstAngle = h2 * Math.PI * 2;
      // Variable radius → filled disk blast (not a hollow ring)
      const burstDist =
        Math.max(cardW, cardH) * (0.08 + h3 * 0.72) + pixelSize * 2;

      particles.push({
        tx: cellX - step / 2,
        ty: cellY - step / 2,
        sx: home.x,
        sy: home.y,
        mx: ox + Math.cos(burstAngle) * burstDist - step / 2,
        my: oy + Math.sin(burstAngle) * burstDist - step / 2,
        opacity: 0.45 + h * 0.55,
        delay: Math.min(
          0.32,
          h * 0.22 + Math.hypot(col - cols / 2, row - rows / 2) * 0.01,
        ),
        seed: h3,
      });
    }
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
    const t = easeInCubic(
      (collapseT - COLLAPSE_BLAST_END) /
        (COLLAPSE_MERGE_END - COLLAPSE_BLAST_END),
    );
    const snappy = t * t;
    return {
      x: p.mx + (centerX - p.mx) * snappy,
      y: p.my + (centerY - p.my) * snappy,
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
  className,
}: PixelAssembleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<PixelParticle[]>([]);
  const sizeRef = useRef({ w: 0, h: 0, cardW: 0, cardH: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      const cardW = Math.min(cardWidth, w * 0.92);
      const cardH = Math.min(cardHeight, h * 0.7);
      sizeRef.current = { w, h, cardW, cardH };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const ox = originX > 0 ? originX : w / 2;
      const oy = originY > 0 ? originY : h / 2;

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
    const size = Math.max(2, Math.round(pixelSize));
    const particles = particlesRef.current;
    const cx = w / 2;
    const cy = h / 2;
    const ox = originX > 0 ? originX : cx;
    const oy = originY > 0 ? originY : cy;
    const side = triggerSize || TRIGGER_SIZE;
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

      // After merge: one pixel → grow into squircle (no early full plate)
      if (collapseT >= COLLAPSE_EXPAND_START) {
        const grow = easeOutCubic(
          clamp01(
            (collapseT - COLLAPSE_EXPAND_START) / (1 - COLLAPSE_EXPAND_START),
          ),
        );
        if (grow < 0.02) {
          // Single merged pixel at the squircle center
          ctx.fillStyle = fill;
          ctx.fillRect(
            Math.round(ox - size / 2),
            Math.round(oy - size / 2),
            size,
            size,
          );
        } else {
          const grown = size + (side - size) * grow;
          const radius = TRIGGER_RADIUS * (grown / side);
          ctx.save();
          ctx.globalAlpha = 1;
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
