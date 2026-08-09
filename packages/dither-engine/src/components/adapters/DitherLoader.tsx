"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import {
  DEFAULT_COMPONENT_CONTENT,
  LOADER_SIZE_PX,
} from "../../content/types";
import { cn } from "../../lib/utils";

/**
 * Spinning dither ring — material fills a conic-masked arc that rotates.
 * Rounded caps, no track stroke; spin speed from content.loaderSpeed.
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
  const spin = reducedMotion
    ? 0
    : Math.max(0.25, Math.min(3, c.loaderSpeed ?? 1));
  // Base period 1.05s at speed 1
  const durationSec = spin > 0 ? 1.05 / spin : 0;

  return (
    <div
      className={cn("mde-adapter mde-adapter--loader", className)}
      role="status"
      aria-busy={!reducedMotion}
      aria-label={c.loaderLabel}
      data-size={c.loaderSize}
      style={{
        ["--mde-loader-size" as string]: `${size}px`,
        ["--mde-loader-duration" as string]: `${durationSec}s`,
      }}
    >
      <div className="mde-adapter-loader__stage" aria-hidden>
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
