"use client";

import { SurfaceCanvas } from "../react/SurfaceCanvas";
import type { SurfaceCardProps } from "../types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Surface card adapter — editorial card with procedural media plane.
 * Pointer tracking owned by SurfaceCanvas (accurate UV conversion).
 */
export function SurfaceCard({
  title = "Surface Print",
  subtitle,
  description = "Procedural monochrome material driven by the Maser Surface Engine.",
  buttonLabel = "Explore",
  onButtonClick,
  params,
  animation,
  interaction,
  color,
  light,
  reducedMotion = false,
  className,
}: SurfaceCardProps) {
  return (
    <article
      className={cn("mse-card", className)}
      aria-label="Maser Surface Engine card"
    >
      <div className="mse-card__media">
        <SurfaceCanvas
          className="mse-card__canvas"
          params={params}
          animation={animation}
          interaction={interaction}
          color={color}
          light={light}
          reducedMotion={reducedMotion}
          aria-label="Procedural monochrome material"
        />
      </div>
      <div className="mse-card__body">
        <h2 className="mse-card__title">{title}</h2>
        {subtitle ? <p className="mse-card__subtitle">{subtitle}</p> : null}
        <p className="mse-card__desc">{description}</p>
        <Button
          type="button"
          className="mse-card__button"
          onClick={onButtonClick}
        >
          {buttonLabel}
        </Button>
      </div>
    </article>
  );
}
