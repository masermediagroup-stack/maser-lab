"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LOADER_DEFAULTS,
  type BlobbyLoaderColors,
} from "./constants";
import { useLoaderAnimationLoop } from "./use-loader-animation";

export type BlobbyRotationLoaderProps = {
  blur?: number;
  corner?: number;
  power?: number;
  tail?: number;
  chromaticAberration?: number;
  colors?: BlobbyLoaderColors;
  drawSize?: number;
  speed?: number;
  paused?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function BlobbyRotationLoader({
  blur = LOADER_DEFAULTS.blur,
  corner = LOADER_DEFAULTS.corner,
  power = LOADER_DEFAULTS.power,
  tail = LOADER_DEFAULTS.tail,
  chromaticAberration = LOADER_DEFAULTS.chromaticAberration,
  colors,
  drawSize = LOADER_DEFAULTS.drawSize,
  speed = 0.5,
  paused = false,
  className,
  "aria-label": ariaLabel = "Loading",
}: BlobbyRotationLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced = useReducedMotion() ?? false;
  const shouldPause = paused || prefersReduced;
  const resolvedSpeed = prefersReduced ? 0 : speed;

  useLoaderAnimationLoop(
    canvasRef,
    {
      blur,
      corner,
      power,
      tail,
      chromaticAberration,
      drawSize,
      rotation: 0,
      colors,
    },
    resolvedSpeed,
    shouldPause,
  );

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      aria-busy={!shouldPause}
      className={cn("blobby-loader-canvas", className)}
    />
  );
}
