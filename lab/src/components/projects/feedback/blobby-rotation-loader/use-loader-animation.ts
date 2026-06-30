"use client";

import { useEffect, useRef } from "react";
import {
  LOADER_COLOR_DEFAULTS,
  type BlobbyLoaderColors,
  type DrawLoaderOptions,
} from "./constants";
import { getStrokeWidth, sampleSuperellipseArc, traceArcPath } from "./shape-path";

function resolveColors(colors?: BlobbyLoaderColors) {
  return {
    core: colors?.core ?? LOADER_COLOR_DEFAULTS.core,
    warm: colors?.aberrationWarm ?? LOADER_COLOR_DEFAULTS.aberrationWarm,
    cool: colors?.aberrationCool ?? LOADER_COLOR_DEFAULTS.aberrationCool,
  };
}

function drawStrokeLayer(
  ctx: CanvasRenderingContext2D,
  options: DrawLoaderOptions,
  offsetX: number,
  offsetY: number,
  color: string,
  alpha: number,
) {
  const { power, corner, size, rotation } = options;
  const points = sampleSuperellipseArc({ power, corner, size });
  const strokeWidth = getStrokeWidth({ power, corner, size });

  ctx.save();
  ctx.translate(size / 2 + offsetX, size / 2 + offsetY);
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  traceArcPath(ctx, points);
  ctx.stroke();
  ctx.restore();
}

export function drawBlobbyLoader(
  ctx: CanvasRenderingContext2D,
  options: DrawLoaderOptions,
) {
  const { blur, chromaticAberration, size } = options;
  const colors = resolveColors(options.colors);
  const dpr = window.devicePixelRatio || 1;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const aberration = chromaticAberration * 0.85;
  const blurPx = blur;

  ctx.save();
  if (blurPx > 0) {
    ctx.filter = `blur(${blurPx}px)`;
  }

  if (aberration > 0) {
    drawStrokeLayer(ctx, options, -aberration, aberration * 0.35, colors.warm, 0.85);
    drawStrokeLayer(ctx, options, aberration, -aberration * 0.35, colors.cool, 0.85);
    drawStrokeLayer(ctx, options, 0, 0, colors.core, 1);
  } else {
    drawStrokeLayer(ctx, options, 0, 0, colors.core, 1);
  }

  ctx.restore();
}

export type LoaderAnimationRefs = {
  rotationRef: React.RefObject<number>;
  rafRef: React.RefObject<number | null>;
  lastTimeRef: React.RefObject<number | null>;
};

export function useLoaderAnimationLoop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: DrawLoaderOptions,
  speed: number,
  paused: boolean,
  reducedMotion: boolean,
) {
  const rotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const effectiveSpeed = reducedMotion ? speed * 0.05 : speed;

    const tick = (time: number) => {
      if (lastTimeRef.current !== null && !paused) {
        const delta = (time - lastTimeRef.current) / 1000;
        rotationRef.current += delta * effectiveSpeed * Math.PI * 2;
      }
      lastTimeRef.current = time;

      const dpr = window.devicePixelRatio || 1;
      const { size } = optionsRef.current;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      drawBlobbyLoader(ctx, {
        ...optionsRef.current,
        rotation: rotationRef.current,
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      lastTimeRef.current = null;
    };
  }, [canvasRef, speed, paused, reducedMotion]);
}
