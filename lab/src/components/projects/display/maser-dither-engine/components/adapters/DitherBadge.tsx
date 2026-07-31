"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { DEFAULT_COMPONENT_CONTENT } from "../../content/types";
import { cn } from "@/lib/utils";

export function DitherBadge({
  params,
  animation,
  interaction,
  color,
  content,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const c = { ...DEFAULT_COMPONENT_CONTENT, ...content };
  return (
    <span className={cn("mde-adapter mde-adapter--badge", className)}>
      <span className="mde-adapter-badge__fill" aria-hidden>
        <SurfaceCanvas
          params={params}
          animation={animation}
          interaction={interaction}
          color={color}
          reducedMotion={reducedMotion}
        />
      </span>
      <span className="mde-adapter-badge__label">{c.badgeLabel}</span>
    </span>
  );
}
