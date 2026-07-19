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

export type BlurFocusRevealProps = BaseAnimationProps & {
  speed?: number;
  stagger?: number;
  blurAmount?: number;
  trackingStart?: number;
  ease?: EaseOption;
};

/**
 * Soft blur + tracking tighten into crisp type — common hero / editorial entrance.
 */
export function BlurFocusRevealAnimation({
  text,
  playKey = 0,
  compact = false,
  className,
  phase = "in",
  speed = 900,
  stagger = 80,
  blurAmount = 16,
  trackingStart = 0.12,
  ease = "cubic-bezier(0.22, 1, 0.36, 1)",
}: BlurFocusRevealProps) {
  const reduced = usePrefersReducedMotion();
  const words = useMemo(() => splitWords(text), [text]);
  const resolvedPhase: AnimationPhase = phase === "out" ? "out" : "in";

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center justify-center gap-x-3 font-medium tracking-tight text-white",
        compact ? "text-lg" : "text-3xl md:text-4xl",
        className,
      )}
      aria-label={text}
    >
      {words.map((word, i) => {
        const delay =
          resolvedPhase === "out"
            ? (words.length - 1 - i) * stagger
            : i * stagger;

        if (reduced) {
          return (
            <span key={`${playKey}-${i}`} className="inline-block">
              {word}
            </span>
          );
        }

        return (
          <span
            key={`${playKey}-${resolvedPhase}-${i}-${word}`}
            className="tal-animate-blur-focus inline-block"
            style={{
              animationDuration: `${speed}ms`,
              animationTimingFunction: ease,
              animationDelay: `${delay}ms`,
              animationDirection: phaseDirection(resolvedPhase),
              ["--tal-blur-amount" as string]: `${blurAmount}px`,
              ["--tal-blur-tracking" as string]: `${trackingStart}em`,
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}
