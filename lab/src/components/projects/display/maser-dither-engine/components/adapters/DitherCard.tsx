"use client";

import { SurfaceCard } from "../../surfaces/SurfaceCard";
import type { DitherAdapterProps } from "../../types";

export function DitherCard({ params, reducedMotion, className }: DitherAdapterProps) {
  return (
    <SurfaceCard
      title="Print Density"
      description="Ordered dither media plane — shared engine, card adapter."
      buttonLabel="Explore"
      params={params}
      reducedMotion={reducedMotion}
      className={className}
    />
  );
}
