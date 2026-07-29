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
  description = "Procedural monochrome material driven by the Maser Surface Engine.",
  buttonLabel = "Explore",
  onButtonClick,
  params,
  animation,
  interaction,
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
          reducedMotion={reducedMotion}
          aria-label="Procedural monochrome material"
        />
      </div>
      <div className="mse-card__body">
        <h2 className="mse-card__title">{title}</h2>
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
