"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import {
  DEFAULT_COMPONENT_CONTENT,
  LOADER_SIZE_PX,
} from "../../content/types";
import { cn } from "@/lib/utils";

/**
 * Spinning dither ring — material fills a conic-masked arc that rotates.
 * Not an avatar orb: reads as an indeterminate loader.
 */
export function DitherLoader({
  params,
  animation,
  interaction,
  color,
  light,
  dither,
  material,
  content,
  sourceUrl,
  sourceLightMix,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const c = { ...DEFAULT_COMPONENT_CONTENT, ...content };
  const size = LOADER_SIZE_PX[c.loaderSize] ?? 56;
  const speed = reducedMotion ? 0 : Math.max(params.animationSpeed, 1);

  return (
    <div
      className={cn("mde-adapter mde-adapter--loader", className)}
      role="status"
      aria-busy={!reducedMotion}
      aria-label={c.loaderLabel}
      data-size={c.loaderSize}
      style={{ ["--mde-loader-size" as string]: `${size}px` }}
    >
      <div className="mde-adapter-loader__stage" aria-hidden>
        <div className="mde-adapter-loader__track" />
        <div
          className={cn(
            "mde-adapter-loader__spin",
            reducedMotion && "mde-adapter-loader__spin--static",
          )}
        >
          <div className="mde-adapter-loader__material">
            <SurfaceCanvas
              animation={animation}
              interaction={interaction}
              color={color}
              light={light}
              dither={dither}
              material={material}
              params={{
                ...params,
                animationSpeed: speed,
              }}
              sourceUrl={sourceUrl}
              sourceLightMix={sourceLightMix}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>
      </div>
      <span className="mde-adapter-loader__label">{c.loaderLabel}</span>
    </div>
  );
}
