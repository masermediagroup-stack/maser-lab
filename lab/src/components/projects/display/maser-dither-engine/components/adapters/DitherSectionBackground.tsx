"use client";

import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
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

export function DitherSectionBackground({
  params,
  animation,
  interaction,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const [pointer, setPointer] = useState<Ptr | null>(null);

  return (
    <section
      className={cn("mde-adapter mde-adapter--section", className)}
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
        className="mde-adapter-section__canvas"
        params={params}
        animation={animation}
        interaction={interaction}
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
