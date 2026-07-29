"use client";

import { SurfaceCard } from "../../surfaces/SurfaceCard";
import type { DitherAdapterProps } from "../../types";

export function DitherCard({ params, animation, reducedMotion, className }: DitherAdapterProps) {
  return (
    <SurfaceCard
      title="Print Density"
      description="Ordered dither media plane — shared engine, card adapter."
      buttonLabel="Explore"
      params={params}
      animation={animation}
      reducedMotion={reducedMotion}
      className={className}
    />
  );
}
