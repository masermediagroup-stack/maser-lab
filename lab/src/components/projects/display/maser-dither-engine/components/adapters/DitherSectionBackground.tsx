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

export function DitherSectionBackground({
  params,
  animation,
  interaction,
  color,
  light,
  dither,
  material,
  content,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const [pointer, setPointer] = useState<Ptr | null>(null);
  const c = { ...DEFAULT_COMPONENT_CONTENT, ...content };

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
        color={color}
          light={light}
          dither={dither}
          material={material}
        pointer={pointer}
        reducedMotion={reducedMotion}
        aria-label="Section dither background"
      />
      <div className="mde-adapter-section__content">
        <h3>{c.sectionTitle}</h3>
        <p>{c.sectionBody}</p>
      </div>
    </section>
  );
}
