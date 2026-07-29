"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { cn } from "@/lib/utils";

export function DitherScrollbar({
  params,
  animation,
  interaction,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  return (
    <div
      className={cn("mde-adapter mde-adapter--scrollbar", className)}
      aria-hidden
    >
      <div className="mde-adapter-scrollbar__track">
        <div className="mde-adapter-scrollbar__thumb">
          <SurfaceCanvas
            params={params}
            animation={animation}
            interaction={interaction}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
      <p className="mde-adapter-scrollbar__note">Visual scrollbar chrome</p>
    </div>
  );
}
