"use client";

import { useRef } from "react";
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
  chromaticAberration?: number;
  colors?: BlobbyLoaderColors;
  size?: number;
  speed?: number;
  paused?: boolean;
  reducedMotion?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function BlobbyRotationLoader({
  blur = LOADER_DEFAULTS.blur,
  corner = LOADER_DEFAULTS.corner,
  power = LOADER_DEFAULTS.power,
  chromaticAberration = LOADER_DEFAULTS.chromaticAberration,
  colors,
  size = LOADER_DEFAULTS.size,
  speed = LOADER_DEFAULTS.speed,
  paused = false,
  reducedMotion = false,
  className,
  "aria-label": ariaLabel = "Loading",
}: BlobbyRotationLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLoaderAnimationLoop(
    canvasRef,
    {
      blur,
      corner,
      power,
      chromaticAberration,
      size,
      rotation: 0,
      colors,
    },
    speed,
    paused,
    reducedMotion,
  );

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      aria-busy={!paused}
      className={cn("blobby-loader-canvas", className)}
    />
  );
}
