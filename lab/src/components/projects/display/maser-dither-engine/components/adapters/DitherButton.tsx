"use client";

import { useState } from "react";
import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { cn } from "@/lib/utils";

export function DitherButton({
  params,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  return (
    <button
      type="button"
      className={cn("mde-adapter mde-adapter--button", className)}
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
      <span className="mde-adapter-button__fill" aria-hidden>
        <SurfaceCanvas
          params={{ ...params, opacity: 1 }}
          pointer={pointer}
          reducedMotion={reducedMotion}
        />
      </span>
      <span className="mde-adapter-button__label">Continue</span>
    </button>
  );
}
