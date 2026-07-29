"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { cn } from "@/lib/utils";

export function DitherLoader({
  params,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  return (
    <div
      className={cn("mde-adapter mde-adapter--loader", className)}
      role="status"
      aria-label="Loading"
    >
      <div className="mde-adapter-loader__orb">
        <SurfaceCanvas
          params={{
            ...params,
            animationSpeed: reducedMotion ? 0 : Math.max(params.animationSpeed, 0.8),
          }}
          reducedMotion={reducedMotion}
        />
      </div>
      <span className="mde-adapter-loader__label">Rendering</span>
    </div>
  );
}
