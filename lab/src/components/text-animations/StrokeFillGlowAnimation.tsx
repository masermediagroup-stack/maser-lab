"use client";

import { useMemo } from "react";
import {
  cn,
  splitWords,
  usePrefersReducedMotion,
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

export function StrokeFillGlowAnimation({
  text,
  playKey = 0,
  compact = false,
  className,
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
  const totalStroke = strokeDuration + fillDuration + 400;

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

        const delay = i * wordStagger;

        return (
          <span
            key={`${playKey}-${i}-${word}`}
            className="tal-animate-stroke-fill relative inline-block text-transparent"
            style={{
              WebkitTextStroke: `${strokeWidth}px white`,
              animationDuration: `${totalStroke}ms`,
              animationTimingFunction: ease,
              animationDelay: `${delay}ms`,
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
