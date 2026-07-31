"use client";

import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { DEFAULT_COMPONENT_CONTENT } from "../../content/types";
import { cn } from "@/lib/utils";

type Ptr = { x: number; y: number; down: boolean };

function readPtr(e: ReactPointerEvent<HTMLElement>, down: boolean): Ptr {
  const r = e.currentTarget.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) / r.width,
    y: (e.clientY - r.top) / r.height,
    down,
  };
}

/**
 * Copy overlays the canvas — external pointer keeps interaction first-class.
 */
export function DitherHeroBackground({
  params,
  animation,
  interaction,
  color,
  content,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const [pointer, setPointer] = useState<Ptr | null>(null);
  const c = { ...DEFAULT_COMPONENT_CONTENT, ...content };

  return (
    <div
      className={cn("mde-adapter mde-adapter--hero", className)}
      onPointerMove={(e) => {
        if (reducedMotion) return;
        setPointer(readPtr(e, pointer?.down ?? e.buttons > 0));
      }}
      onPointerDown={(e) => {
        if (reducedMotion) return;
        setPointer(readPtr(e, true));
      }}
      onPointerUp={(e) => {
        if (reducedMotion) return;
        setPointer(readPtr(e, false));
      }}
      onPointerLeave={() => setPointer(null)}
    >
      <SurfaceCanvas
        className="mde-adapter-hero__canvas"
        params={params}
        animation={animation}
        interaction={interaction}
        color={color}
        pointer={pointer}
        reducedMotion={reducedMotion}
        aria-label="Hero dither background"
      />
      <div className="mde-adapter-hero__copy">
        <p className="mde-adapter-hero__eyebrow">{c.heroEyebrow}</p>
        <h3 className="mde-adapter-hero__title">{c.heroTitle}</h3>
        <p className="mde-adapter-hero__support">{c.heroDescription}</p>
      </div>
    </div>
  );
}
