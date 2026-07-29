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

/**
 * Mark canvas is small — nav-wide pointer drives the brand light.
 */
export function DitherNavigation({
  params,
  animation,
  interaction,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const [pointer, setPointer] = useState<Ptr | null>(null);

  return (
    <nav
      className={cn("mde-adapter mde-adapter--nav", className)}
      aria-label="Dither navigation preview"
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
      <div className="mde-adapter-nav__mark" aria-hidden>
        <SurfaceCanvas
          params={params}
          animation={animation}
          interaction={interaction}
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
