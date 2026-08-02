"use client";

import { useMemo } from "react";
import {
  cn,
  phaseDirection,
  splitWords,
  usePrefersReducedMotion,
  type AnimationPhase,
  type BaseAnimationProps,
  type EaseOption,
} from "./shared";
import "./text-animations.css";

export type StrokeFillGlowAnimationProps = BaseAnimationProps & {
  strokeDuration?: number;
  fillDuration?: number;
  glowIntensity?: number;
  glowRadius?: number;
  wordStagger?: number;
  strokeWidth?: number;
  ease?: EaseOption;
};

/**
 * Stroke draws in first (transparent → outline), then fill, then glow.
 * Pass `phase="out"` to reverse the timeline for exit exports/previews.
 */
export function StrokeFillGlowAnimation({
  text,
  playKey = 0,
  compact = false,
  className,
  phase = "in",
  strokeDuration = 800,
  fillDuration = 600,
  glowIntensity = 0.6,
  glowRadius = 12,
  wordStagger = 200,
  strokeWidth = 1.5,
  ease = "ease-out",
}: StrokeFillGlowAnimationProps) {
  const reduced = usePrefersReducedMotion();
  const words = useMemo(() => splitWords(text), [text]);
  const totalDuration = strokeDuration + fillDuration + 400;
  const resolvedPhase: AnimationPhase = phase === "out" ? "out" : "in";

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center justify-center gap-x-3 font-medium tracking-tight",
        compact ? "text-lg" : "text-3xl md:text-4xl",
        className,
      )}
      aria-label={text}
    >
      {words.map((word, i) => {
        if (reduced) {
          return (
            <span key={`${playKey}-${i}`} className="text-white">
              {word}
            </span>
          );
        }

        const delay =
          resolvedPhase === "out"
            ? (words.length - 1 - i) * wordStagger
            : i * wordStagger;

        return (
          <span
            key={`${playKey}-${resolvedPhase}-${i}-${word}`}
            className="tal-animate-stroke-fill relative inline-block"
            style={{
              animationDuration: `${totalDuration}ms`,
              animationTimingFunction: ease,
              animationDelay: `${delay}ms`,
              animationDirection: phaseDirection(resolvedPhase),
              ["--tal-stroke-width" as string]: `${strokeWidth}px`,
              ["--tal-glow-intensity" as string]: String(glowIntensity),
              ["--tal-glow-radius" as string]: `${glowRadius}px`,
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}
