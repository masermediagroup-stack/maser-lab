"use client";

import { SurfaceCard } from "../../surfaces/SurfaceCard";
import type { DitherAdapterProps } from "../../types";
import { DEFAULT_COMPONENT_CONTENT } from "../../content/types";

export function DitherCard({
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
    <SurfaceCard
      title={c.cardTitle}
      subtitle={c.cardSubtitle}
      description={c.cardDescription}
      buttonLabel={c.cardButtonLabel}
      params={params}
      animation={animation}
      interaction={interaction}
      color={color}
      reducedMotion={reducedMotion}
      className={className}
    />
  );
}
