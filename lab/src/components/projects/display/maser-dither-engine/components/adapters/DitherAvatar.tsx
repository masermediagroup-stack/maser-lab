"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { cn } from "@/lib/utils";

export function DitherAvatar({
  params,
  animation,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  return (
    <div
      className={cn("mde-adapter mde-adapter--avatar", className)}
      role="img"
      aria-label="Dither avatar"
    >
      <SurfaceCanvas params={params} animation={animation} reducedMotion={reducedMotion} />
    </div>
  );
}
