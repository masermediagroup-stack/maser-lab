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

export type UnderlineDrawRevealProps = BaseAnimationProps & {
  speed?: number;
  stagger?: number;
  underlineThickness?: number;
  underlineOffset?: number;
  drawFrom?: "left" | "right" | "center";
  ease?: EaseOption;
};

/**
 * Words fade/rise while an underline draws under each — CTA and link treatments.
 */
export function UnderlineDrawRevealAnimation({
  text,
  playKey = 0,
  compact = false,
  className,
  phase = "in",
  speed = 650,
  stagger = 110,
  underlineThickness = 2,
  underlineOffset = 4,
  drawFrom = "left",
  ease = "cubic-bezier(0.22, 1, 0.36, 1)",
}: UnderlineDrawRevealProps) {
  const reduced = usePrefersReducedMotion();
  const words = useMemo(() => splitWords(text), [text]);
  const resolvedPhase: AnimationPhase = phase === "out" ? "out" : "in";
  const origin =
    drawFrom === "center"
      ? "center"
      : drawFrom === "right"
        ? "right center"
        : "left center";

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center justify-center gap-x-4 font-medium tracking-tight text-white",
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
            <span
              key={`${playKey}-${i}`}
              className="relative inline-block"
              style={{
                boxShadow: `inset 0 -${underlineThickness}px 0 #fff`,
                paddingBottom: underlineOffset,
              }}
            >
              {word}
            </span>
          );
        }

        return (
          <span
            key={`${playKey}-${resolvedPhase}-${i}-${word}`}
            className="relative inline-block"
            style={{ paddingBottom: underlineOffset }}
          >
            <span
              className="tal-animate-underline-word inline-block"
              style={{
                animationDuration: `${speed}ms`,
                animationTimingFunction: ease,
                animationDelay: `${delay}ms`,
                animationDirection: phaseDirection(resolvedPhase),
              }}
            >
              {word}
            </span>
            <span
              aria-hidden
              className="tal-animate-underline-draw pointer-events-none absolute right-0 left-0 bg-white"
              style={{
                bottom: 0,
                height: underlineThickness,
                animationDuration: `${Math.round(speed * 0.85)}ms`,
                animationTimingFunction: ease,
                animationDelay: `${delay + Math.round(speed * 0.15)}ms`,
                animationDirection: phaseDirection(resolvedPhase),
                ["--tal-underline-origin" as string]: origin,
              }}
            />
          </span>
        );
      })}
    </span>
  );
}
