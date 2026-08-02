"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { DEFAULT_COMPONENT_CONTENT } from "../../content/types";
import { cn } from "@/lib/utils";

export function DitherAvatar({
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
  return (
    <div
      className={cn("mde-adapter mde-adapter--avatar", className)}
      role="img"
      aria-label={`Avatar ${c.avatarInitials}`}
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
      />
      <span className="mde-adapter-avatar__initials" aria-hidden>
        {c.avatarInitials}
      </span>
    </div>
  );
}
