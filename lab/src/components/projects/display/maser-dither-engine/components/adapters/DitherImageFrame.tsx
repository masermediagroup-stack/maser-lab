"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { DEFAULT_COMPONENT_CONTENT } from "../../content/types";
import { cn } from "@/lib/utils";

export function DitherImageFrame({
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
  const c = { ...DEFAULT_COMPONENT_CONTENT, ...content };
  return (
    <figure className={cn("mde-adapter mde-adapter--frame", className)}>
      <div className="mde-adapter-frame__matte" aria-hidden>
        <SurfaceCanvas
          params={params}
          animation={animation}
          interaction={interaction}
          color={color}
          light={light}
          dither={dither}
          material={material}
          reducedMotion={reducedMotion}
        />
      </div>
      <div className="mde-adapter-frame__photo">
        <div className="mde-adapter-frame__placeholder">Image</div>
      </div>
      <figcaption>{c.imageCaption}</figcaption>
    </figure>
  );
}
