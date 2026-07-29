"use client";

import { useState } from "react";
import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { cn } from "@/lib/utils";

export function DitherNavigation({
  params,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  return (
    <nav
      className={cn("mde-adapter mde-adapter--nav", className)}
      aria-label="Dither navigation preview"
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
      <div className="mde-adapter-nav__mark" aria-hidden>
        <SurfaceCanvas
          params={params}
          pointer={pointer}
          reducedMotion={reducedMotion}
          aria-label=""
        />
      </div>
      <span className="mde-adapter-nav__brand">Maser</span>
      <div className="mde-adapter-nav__links">
        <a href="#overview">Overview</a>
        <a href="#components">Components</a>
        <a href="#docs">Docs</a>
      </div>
    </nav>
  );
}
