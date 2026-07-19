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

export type MaskClipRevealProps = BaseAnimationProps & {
  speed?: number;
  stagger?: number;
  distance?: number;
  ease?: EaseOption;
};

/**
 * Classic overflow-mask reveal: each word rises through a clipped line box.
 * Very common for hero headlines and section titles.
 */
export function MaskClipRevealAnimation({
  text,
  playKey = 0,
  compact = false,
  className,
  phase = "in",
  speed = 700,
  stagger = 90,
  distance = 110,
  ease = "cubic-bezier(0.22, 1, 0.36, 1)",
}: MaskClipRevealProps) {
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
            className="inline-block overflow-hidden leading-none"
            style={{ paddingBottom: "0.08em" }}
          >
            <span
              className="tal-animate-mask-clip inline-block"
              style={{
                animationDuration: `${speed}ms`,
                animationTimingFunction: ease,
                animationDelay: `${delay}ms`,
                animationDirection: phaseDirection(resolvedPhase),
                ["--tal-mask-from" as string]: `${distance}%`,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </span>
  );
}
