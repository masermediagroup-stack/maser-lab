"use client";

import { useState } from "react";
import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { cn } from "@/lib/utils";

export function DitherHeroBackground({
  params,
  animation,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  return (
    <div
      className={cn("mde-adapter mde-adapter--hero", className)}
      onPointerMove={(e) => {
        if (reducedMotion) return;
        const r = e.currentTarget.getBoundingClientRect();
        setPointer({
          x: (e.clientX - r.left) / r.width,
          y: (e.clientY - r.top) / r.height,
        });
      }}
      onPointerLeave={() => setPointer(null)}
    >
      <SurfaceCanvas
        className="mde-adapter-hero__canvas"
        params={params}
          animation={animation}
        pointer={pointer}
        reducedMotion={reducedMotion}
        aria-label="Hero dither background"
      />
      <div className="mde-adapter-hero__copy">
        <p className="mde-adapter-hero__eyebrow">Maser</p>
        <h3 className="mde-adapter-hero__title">Engineered tone</h3>
        <p className="mde-adapter-hero__support">
          Full-bleed dither field for brand-forward heroes.
        </p>
      </div>
    </div>
  );
}
