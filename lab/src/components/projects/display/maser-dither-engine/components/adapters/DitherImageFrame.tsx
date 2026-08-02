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
  sourceUrl,
  sourceLightMix,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const c = { ...DEFAULT_COMPONENT_CONTENT, ...content };
  const hasSource = Boolean(sourceUrl);

  return (
    <figure className={cn("mde-adapter mde-adapter--frame", className)}>
      <div
        className={cn(
          "mde-adapter-frame__matte",
          hasSource && "mde-adapter-frame__matte--sourced",
        )}
      >
        <SurfaceCanvas
          params={params}
          animation={animation}
          interaction={interaction}
          color={color}
          light={light}
          dither={dither}
          material={material}
          sourceUrl={sourceUrl}
          sourceLightMix={sourceLightMix}
          reducedMotion={reducedMotion}
          aria-label={
            hasSource
              ? "Dithered source image"
              : "Dither matte — upload an image in Content"
          }
        />
        {!hasSource ? (
          <div className="mde-adapter-frame__empty" aria-hidden>
            <span>Upload an image</span>
            <span className="mde-adapter-frame__empty-sub">
              Content panel → Source image
            </span>
          </div>
        ) : null}
      </div>
      <figcaption>
        {hasSource
          ? c.imageCaption || "Dithered source image"
          : c.imageCaption || "Upload a photo to dither"}
      </figcaption>
    </figure>
  );
}
