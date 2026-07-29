"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { cn } from "@/lib/utils";

export function DitherBadge({
  params,
  animation,
  interaction,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  return (
    <span className={cn("mde-adapter mde-adapter--badge", className)}>
      <span className="mde-adapter-badge__fill" aria-hidden>
        <SurfaceCanvas
          params={params}
          animation={animation}
          interaction={interaction}
          reducedMotion={reducedMotion}
        />
      </span>
      <span className="mde-adapter-badge__label">Live</span>
    </span>
  );
}
