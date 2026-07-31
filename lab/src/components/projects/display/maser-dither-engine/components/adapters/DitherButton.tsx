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
 * Label overlays the canvas — drive pointer from the button bounds.
 */
export function DitherButton({
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
    <button
      type="button"
      className={cn("mde-adapter mde-adapter--button", className)}
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
      <span className="mde-adapter-button__fill" aria-hidden>
        <SurfaceCanvas
          animation={animation}
          interaction={interaction}
          color={color}
          params={{ ...params, opacity: 1 }}
          pointer={pointer}
          reducedMotion={reducedMotion}
        />
      </span>
      <span className="mde-adapter-button__label">
        {c.buttonLabel}
        {c.buttonIcon ? (
          <span className="mde-adapter-button__icon" aria-hidden>
            {" "}
            {c.buttonIcon}
          </span>
        ) : null}
      </span>
    </button>
  );
}
