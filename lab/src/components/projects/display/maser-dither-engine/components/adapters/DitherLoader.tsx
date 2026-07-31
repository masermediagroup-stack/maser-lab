"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { DEFAULT_COMPONENT_CONTENT } from "../../content/types";
import { cn } from "@/lib/utils";

export function DitherLoader({
  params,
  animation,
  interaction,
  color,
  content,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const c = { ...DEFAULT_COMPONENT_CONTENT, ...content };
  return (
    <div
      className={cn("mde-adapter mde-adapter--loader", className)}
      role="status"
      aria-label={c.loaderLabel}
    >
      <div className="mde-adapter-loader__orb">
        <SurfaceCanvas
          animation={animation}
          interaction={interaction}
          color={color}
          params={{
            ...params,
            animationSpeed: reducedMotion
              ? 0
              : Math.max(params.animationSpeed, 0.8),
          }}
          reducedMotion={reducedMotion}
        />
      </div>
      <span className="mde-adapter-loader__label">{c.loaderLabel}</span>
    </div>
  );
}
