"use client";

import { useEffect, useRef } from "react";
import type { PixelInfoTheme } from "./types";

type PixelParticle = {
  /** Target position inside card (local canvas space) */
  tx: number;
  ty: number;
  /** Spawn near squircle center */
  sx: number;
  sy: number;
  opacity: number;
  /** Snake delay offset 0–1 */
  delay: number;
  /** Snake group id for correlated motion */
  snake: number;
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
  const step = Math.max(3, pixelSize);

  // Squircle spawn cluster
  const spawnR = triggerSize * 0.35;

  let snakeCounter = 0;
  for (let y = top; y < top + cardH; y += step) {
    snakeCounter += 1;
    const snake = snakeCounter % 7;
    for (let x = left; x < left + cardW; x += step) {
      // Rounded-rect mask
      const lx = x - left;
      const ly = y - top;
      const r = cardRadius;
      const inCorner = (() => {
        if (lx < r && ly < r) {
          const dx = r - lx;
          const dy = r - ly;
          return dx * dx + dy * dy <= r * r;
        }
        if (lx > cardW - r && ly < r) {
          const dx = lx - (cardW - r);
          const dy = r - ly;
          return dx * dx + dy * dy <= r * r;
        }
        if (lx < r && ly > cardH - r) {
          const dx = r - lx;
          const dy = ly - (cardH - r);
          return dx * dx + dy * dy <= r * r;
        }
        if (lx > cardW - r && ly > cardH - r) {
          const dx = lx - (cardW - r);
          const dy = ly - (cardH - r);
          return dx * dx + dy * dy <= r * r;
        }
        return true;
      })();
      if (!inCorner) continue;

      // Density + slight dither
      const hash = ((lx * 12.9898 + ly * 78.233) % 1 + 1) % 1;
      const noise = Math.abs(Math.sin(lx * 0.17 + ly * 0.31));
      if (noise > density + 0.15) continue;
      if (hash > density * 1.1) continue;

      const angle = (snake / 7) * Math.PI * 2 + lx * 0.02;
      const spawnDist = spawnR * (0.2 + noise * 0.9);
      particles.push({
        tx: x,
        ty: y,
        sx: cx + Math.cos(angle) * spawnDist + (noise - 0.5) * step,
        sy: cy + Math.sin(angle) * spawnDist + (hash - 0.5) * step,
        opacity: 0.2 + noise * 0.8,
        delay: (snake * 0.08 + (lx / cardW) * 0.35 + (ly / cardH) * 0.25) % 1,
        snake,
      });
    }
  }
  return particles;
}

/**
 * Canvas overlay that draws surface-colored pixel snakes assembling / dissolving
 * between the squircle origin and the card silhouette.
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
  const sizeRef = useRef({ w: 0, h: 0 });

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
      sizeRef.current = { w, h };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particlesRef.current = buildParticles(
        w,
        h,
        Math.min(cardWidth, w * 0.92),
        Math.min(cardHeight, h * 0.7),
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

    const { w, h } = sizeRef.current;
    ctx.clearRect(0, 0, w || canvas.width, h || canvas.height);

    if (!active || progress <= 0.001 || progress >= 0.999) {
      return;
    }

    const fill = theme === "dark" ? "255,255,255" : "0,0,0";
    const size = Math.max(2, pixelSize - 1);
    const particles = particlesRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]!;
      // Local progress with snake delay — snakes trail each other
      const local = easeOutCubic(
        Math.max(0, Math.min(1, (progress - p.delay * 0.35) / (1 - p.delay * 0.35))),
      );
      if (local <= 0) continue;

      // Snake wiggle along path
      const mid = Math.sin(local * Math.PI);
      const wiggle =
        Math.sin(local * 8 + p.snake * 1.7) * mid * (pixelSize * 1.4);

      const x = p.sx + (p.tx - p.sx) * local + wiggle;
      const y = p.sy + (p.ty - p.sy) * local + Math.cos(local * 6 + p.snake) * mid * pixelSize;

      // Fade in then hold; slight fade as card DOM takes over near the end
      const peak = p.opacity;
      const endFade = progress > 0.85 ? 1 - (progress - 0.85) / 0.15 : 1;
      const alpha = peak * Math.min(1, local * 1.4) * Math.max(0.15, endFade);

      ctx.fillStyle = `rgba(${fill},${alpha.toFixed(3)})`;
      ctx.fillRect(x, y, size, size);
    }
  }, [active, progress, theme, pixelSize]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
    />
  );
}
