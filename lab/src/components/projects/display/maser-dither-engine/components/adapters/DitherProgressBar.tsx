"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { cn } from "@/lib/utils";

export function DitherProgressBar({
  params,
  animation,
  interaction,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const value = 64;
  return (
    <div
      className={cn("mde-adapter mde-adapter--progress", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label="Progress"
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
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
      <span className="mde-adapter-progress__value">{value}%</span>
    </div>
  );
}
