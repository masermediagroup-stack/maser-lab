"use client";

import { useEffect, useRef } from "react";
import { PIXEL_PLATE_FILL_AT, PIXEL_PLATE_SOLID_AT } from "./constants";
import type { PixelInfoTheme } from "./types";

type PixelParticle = {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  /** Random mid waypoint — burst away from center before settling */
  mx: number;
  my: number;
  opacity: number;
  delay: number;
  seed: number;
};

type PixelAssembleCanvasProps = {
  active: boolean;
  progress: number;
  theme: PixelInfoTheme;
  pixelSize: number;
  snakeDensity: number;
  cardRadius: number;
  cardWidth: number;
  cardHeight: number;
  triggerSize: number;
  className?: string;
};

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** Deterministic 0–1 hash from integers */
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
  // Corner circles
  const cx = lx < radius ? radius : w - radius;
  const cy = ly < radius ? radius : h - radius;
  const dx = lx - cx;
  const dy = ly - cy;
  return dx * dx + dy * dy <= radius * radius;
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
): PixelParticle[] {
  const particles: PixelParticle[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const left = cx - cardW / 2;
  const top = cy - cardH / 2;
  const step = Math.max(3, Math.round(pixelSize));

  // Integer grid that tiles the card without overhang
  const cols = Math.max(1, Math.floor(cardW / step));
  const rows = Math.max(1, Math.floor(cardH / step));
  const gridW = cols * step;
  const gridH = rows * step;
  const gridLeft = cx - gridW / 2;
  const gridTop = cy - gridH / 2;

  const spawnR = triggerSize * 0.28;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellX = gridLeft + col * step + step / 2;
      const cellY = gridTop + row * step + step / 2;
      const lx = cellX - left;
      const ly = cellY - top;

      // Require the full pixel square inside the rounded plate (no corner strays)
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
      // Density thins the swarm; always keep enough cells for a readable plate
      if (h > density * 0.92 + 0.08) continue;

      // Spawn tightly behind the squircle; burst in a unique random direction
      const spawnAngle = h * Math.PI * 2;
      const burstAngle = h2 * Math.PI * 2;
      const burstDist =
        Math.max(cardW, cardH) * (0.22 + h3 * 0.7) + triggerSize * 4;
      const spawnJitter = spawnR * (0.35 + h3 * 0.9);

      particles.push({
        tx: cellX - step / 2,
        ty: cellY - step / 2,
        sx: cx + Math.cos(spawnAngle) * spawnJitter - step / 2,
        sy: cy + Math.sin(spawnAngle) * spawnJitter * (0.7 + h * 0.5) - step / 2,
        mx: cx + Math.cos(burstAngle) * burstDist - step / 2,
        my: cy + Math.sin(burstAngle) * burstDist - step / 2,
        opacity: 0.4 + h * 0.6,
        // Per-pixel stagger (matrix rain feel), lightly biased from center
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

function samplePath(
  p: PixelParticle,
  local: number,
): { x: number; y: number } {
  // Phase A: burst from behind squircle in random directions (0–0.38)
  // Phase B: curve into final grid cell (0.38–1)
  if (local < 0.38) {
    const t = easeOutCubic(local / 0.38);
    return {
      x: p.sx + (p.mx - p.sx) * t,
      y: p.sy + (p.my - p.sy) * t,
    };
  }
  const t = easeInOutCubic((local - 0.38) / 0.62);
  // Residual wander dies as they lock to the integer grid
  const jitter = (1 - t) * (p.seed - 0.5) * 5;
  return {
    x: p.mx + (p.tx - p.mx) * t + jitter,
    y: p.my + (p.ty - p.my) * t + jitter * 0.55,
  };
}

/**
 * Canvas overlay: pixels burst from the squircle on random paths, then lock
 * into a card grid and densify into a solid plate before the DOM card takes over.
 */
export function PixelAssembleCanvas({
  active,
  progress,
  theme,
  pixelSize,
  snakeDensity,
  cardRadius,
  cardWidth,
  cardHeight,
  triggerSize,
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

      particlesRef.current = buildParticles(
        w,
        h,
        cardW,
        cardH,
        cardRadius,
        pixelSize,
        snakeDensity,
        triggerSize,
      );
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [cardWidth, cardHeight, cardRadius, pixelSize, snakeDensity, triggerSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h, cardW, cardH } = sizeRef.current;
    ctx.clearRect(0, 0, w || canvas.width, h || canvas.height);

    // Stay drawn through the solid-plate handoff; clear only when fully done
    if (!active && (progress <= 0.001 || progress >= 0.999)) {
      return;
    }
    if (progress <= 0.001) return;

    const isDark = theme === "dark";
    const rgb = isDark ? "255,255,255" : "0,0,0";
    // Match particle draw size to the integer grid step (no leftover gaps)
    const size = Math.max(2, Math.round(pixelSize));
    const particles = particlesRef.current;
    const cx = w / 2;
    const cy = h / 2;

    // Solid plate fills to full opacity by PIXEL_PLATE_SOLID_AT (before DOM handoff)
    const plateSpan = Math.max(0.001, PIXEL_PLATE_SOLID_AT - PIXEL_PLATE_FILL_AT);
    const plateT = clamp01((progress - PIXEL_PLATE_FILL_AT) / plateSpan);
    if (plateT > 0) {
      const left = cx - cardW / 2;
      const top = cy - cardH / 2;
      ctx.save();
      ctx.globalAlpha = easeOutCubic(plateT);
      ctx.fillStyle = isDark ? "#ffffff" : "#000000";
      roundRect(ctx, left, top, cardW, cardH, cardRadius);
      ctx.fill();
      ctx.restore();
    }

    // Pixels dissolve into the plate — gone before DOM card appears
    const pixelFade =
      plateT > 0.35 ? clamp01(1 - (plateT - 0.35) / 0.55) : 1;
    if (pixelFade <= 0.02) return;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]!;
      const span = 1 - p.delay;
      const local = easeOutCubic(
        clamp01((progress - p.delay) / Math.max(0.001, span)),
      );
      if (local <= 0) continue;

      const { x, y } = samplePath(p, local);
      const alpha = p.opacity * Math.min(1, local * 2.4) * pixelFade;

      ctx.fillStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
      // Snap to device pixels so the settled grid stays crisp
      ctx.fillRect(Math.round(x), Math.round(y), size, size);
    }
  }, [active, progress, theme, pixelSize, cardRadius]);

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
