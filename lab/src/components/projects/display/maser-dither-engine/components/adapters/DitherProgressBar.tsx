"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { DEFAULT_COMPONENT_CONTENT } from "../../content/types";
import { cn } from "@/lib/utils";

export function DitherProgressBar({
  params,
  animation,
  interaction,
  color,
  light,
  dither,
  content,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const c = { ...DEFAULT_COMPONENT_CONTENT, ...content };
  const value = Math.min(100, Math.max(0, c.progressValue));
  return (
    <div
      className={cn("mde-adapter mde-adapter--progress", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={c.progressLabel}
    >
      <div className="mde-adapter-progress__track">
        <div
          className="mde-adapter-progress__fill"
          style={{ width: `${value}%` }}
        >
          <SurfaceCanvas
            params={params}
            animation={animation}
            interaction={interaction}
            color={color}
          light={light}
          dither={dither}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
      <span className="mde-adapter-progress__value">{value}%</span>
    </div>
  );
}
