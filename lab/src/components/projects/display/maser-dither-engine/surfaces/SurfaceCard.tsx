"use client";

import { SurfaceCanvas } from "../react/SurfaceCanvas";
import type { SurfaceCardProps } from "../types";
import { cn } from "@/lib/utils";
import {
  overlayLabelStyle,
  useAdapterPointer,
} from "../components/adapters/adapterInteraction";
import type { ComponentContent } from "../content/types";
import { DEFAULT_COMPONENT_CONTENT } from "../content/types";

/**
 * Featured editorial card — full-bleed dither media, inset frame,
 * bottom scrim + copy, dithered pill CTA.
 * Media and CTA can use independent source photos.
 */
export function SurfaceCard({
  title = "Fresh density",
  subtitle = "What's printing",
  description,
  buttonLabel = "Explore",
  onButtonClick,
  params,
  animation,
  interaction,
  color,
  light,
  dither,
  material,
  sourceUrl,
  sourceLightMix,
  ctaSourceUrl,
  ctaSourceLightMix,
  reducedMotion = false,
  className,
  labelColor,
  labelBlend,
}: SurfaceCardProps) {
  const { pointer: mediaPointer, handlers: mediaHandlers } =
    useAdapterPointer(reducedMotion);
  const { pointer: ctaPointer, handlers: ctaHandlers } =
    useAdapterPointer(reducedMotion);

  const labelContent: Pick<ComponentContent, "labelColor" | "labelBlend"> = {
    labelColor: labelColor ?? DEFAULT_COMPONENT_CONTENT.labelColor,
    labelBlend: labelBlend ?? "solid",
  };

  /* Default global label is white — on a cream CTA plate, flip to ink. */
  const ctaLabelColor =
    !labelColor || labelColor.toLowerCase() === "#ffffff"
      ? "#14110e"
      : labelColor;

  const resolvedCtaUrl =
    ctaSourceUrl !== undefined && ctaSourceUrl !== null
      ? ctaSourceUrl
      : sourceUrl;
  const resolvedCtaMix =
    ctaSourceUrl !== undefined && ctaSourceUrl !== null
      ? (ctaSourceLightMix ?? sourceLightMix)
      : sourceLightMix;

  return (
    <article
      className={cn("mse-card mse-card--featured", className)}
      aria-label={title}
    >
      <div className="mse-card__frame">
        <div className="mse-card__media">
          <div className="mse-card__canvas-hit" {...mediaHandlers}>
            <SurfaceCanvas
              className="mse-card__canvas"
              params={params}
              animation={animation}
              interaction={interaction}
              color={color}
              light={light}
              dither={dither}
              material={material}
              sourceUrl={sourceUrl}
              sourceLightMix={sourceLightMix}
              pointer={mediaPointer}
              reducedMotion={reducedMotion}
              aria-label="Featured card material"
            />
          </div>
          <div className="mse-card__scrim" aria-hidden />
          <div className="mse-card__copy">
            <div className="mse-card__copy-text">
              {subtitle ? (
                <p className="mse-card__eyebrow">{subtitle}</p>
              ) : null}
              <h2 className="mse-card__title">{title}</h2>
              {description ? (
                <p className="mse-card__desc">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="mse-card__cta"
              onClick={onButtonClick}
              {...ctaHandlers}
            >
              <span className="mse-card__cta-fill" aria-hidden>
                <SurfaceCanvas
                  params={{ ...params, opacity: 1 }}
                  animation={animation}
                  interaction={interaction}
                  color={color}
                  light={light}
                  dither={dither}
                  material={material}
                  sourceUrl={resolvedCtaUrl}
                  sourceLightMix={resolvedCtaMix}
                  pointer={ctaPointer}
                  reducedMotion={reducedMotion}
                />
              </span>
              <span
                className="mse-card__cta-label"
                style={overlayLabelStyle({
                  ...labelContent,
                  labelColor: ctaLabelColor,
                })}
              >
                {buttonLabel}
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
