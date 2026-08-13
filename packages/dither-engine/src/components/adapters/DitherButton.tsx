"use client";

import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { DEFAULT_COMPONENT_CONTENT } from "../../content/types";
import { cn } from "../../lib/utils";
import {
  chromeCornerStyle,
  overlayLabelStyle,
  useAdapterPointer,
} from "./adapterInteraction";

/**
 * Label overlays the canvas — drive pointer from the button bounds.
 */
export function DitherButton({
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

  return (
    <button
      type="button"
      className={cn("mde-adapter mde-adapter--button", className)}
      style={chromeCornerStyle(c)}
      {...handlers}
    >
      <span className="mde-adapter-button__fill" aria-hidden>
        <SurfaceCanvas
          animation={animation}
          interaction={interaction}
          color={color}
          light={light}
          dither={dither}
          material={material}
          params={{ ...params, opacity: 1 }}
          pointer={pointer}
          sourceUrl={sourceUrl}
          sourceLightMix={sourceLightMix}
          reducedMotion={reducedMotion}
        />
      </span>
      <span className="mde-adapter-button__label" style={overlayLabelStyle(c)}>
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
