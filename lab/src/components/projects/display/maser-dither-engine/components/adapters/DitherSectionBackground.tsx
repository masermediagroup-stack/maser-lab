"use client";

import { useState } from "react";
import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { cn } from "@/lib/utils";

export function DitherSectionBackground({
  params,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  return (
    <section
      className={cn("mde-adapter mde-adapter--section", className)}
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
        className="mde-adapter-section__canvas"
        params={params}
        pointer={pointer}
        reducedMotion={reducedMotion}
        aria-label="Section dither background"
      />
      <div className="mde-adapter-section__content">
        <h3>One job per section</h3>
        <p>Material atmosphere without card clutter.</p>
      </div>
    </section>
  );
}
