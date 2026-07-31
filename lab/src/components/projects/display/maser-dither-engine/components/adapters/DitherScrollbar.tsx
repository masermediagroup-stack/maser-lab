"use client";

import type { CSSProperties } from "react";
import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { DEFAULT_COMPONENT_CONTENT } from "../../content/types";
import { cn } from "@/lib/utils";

export function DitherScrollbar({
  params,
  animation,
  interaction,
  color,
  light,
  content,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const c = { ...DEFAULT_COMPONENT_CONTENT, ...content };
  return (
    <div
      className={cn("mde-adapter mde-adapter--scrollbar", className)}
      aria-hidden
      style={
        {
          "--mde-scroll-thickness": `${c.scrollbarThickness}px`,
          "--mde-scroll-radius": `${c.scrollbarRadius}px`,
        } as CSSProperties
      }
    >
      <div className="mde-adapter-scrollbar__track">
        <div className="mde-adapter-scrollbar__thumb">
          <SurfaceCanvas
            params={params}
            animation={animation}
            interaction={interaction}
            color={color}
          light={light}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
      <p className="mde-adapter-scrollbar__note">{c.scrollbarNote}</p>
    </div>
  );
}
