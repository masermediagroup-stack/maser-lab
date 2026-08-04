"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import {
  BADGE_SIZE,
  DEFAULT_COMPONENT_CONTENT,
} from "../../content/types";
import { cn } from "@/lib/utils";
import {
  chromeCornerStyle,
  overlayLabelStyle,
  useAdapterPointer,
} from "./adapterInteraction";

export function DitherBadge({
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
  const { pointer, handlers } = useAdapterPointer(reducedMotion);
  const c = { ...DEFAULT_COMPONENT_CONTENT, ...content };
  const size = BADGE_SIZE[c.badgeSize] ?? BADGE_SIZE.md;

  return (
    <span
      className={cn("mde-adapter mde-adapter--badge", className)}
      data-size={c.badgeSize}
      role="img"
      aria-label={c.badgeLabel}
      style={{
        ...chromeCornerStyle(c),
        height: size.height,
        paddingInline: size.padX,
        fontSize: size.font,
      }}
      {...handlers}
    >
      <span className="mde-adapter-badge__fill" aria-hidden>
        <SurfaceCanvas
          params={{
            ...params,
            animationSpeed: reducedMotion
              ? 0
              : Math.max(params.animationSpeed, 1),
          }}
          animation={animation}
          interaction={interaction}
          color={color}
          light={light}
          dither={dither}
          material={material}
          pointer={pointer}
          sourceUrl={sourceUrl}
          sourceLightMix={sourceLightMix}
          reducedMotion={reducedMotion}
        />
      </span>
      <span className="mde-adapter-badge__label" style={overlayLabelStyle(c)}>
        {c.badgeLabel}
      </span>
    </span>
  );
}
