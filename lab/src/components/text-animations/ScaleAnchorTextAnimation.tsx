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

export type ScaleAnchorTextAnimationProps = BaseAnimationProps & {
  scaleStart?: number;
  scaleEnd?: number;
  speed?: number;
  stagger?: number;
  ease?: EaseOption;
  anchor?:
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
};

function getTransformOrigin(
  anchor: ScaleAnchorTextAnimationProps["anchor"],
): string {
  switch (anchor) {
    case "top":
      return "center top";
    case "bottom":
      return "center bottom";
    case "left":
      return "left center";
    case "right":
      return "right center";
    case "top-left":
      return "left top";
    case "top-right":
      return "right top";
    case "bottom-left":
      return "left bottom";
    case "bottom-right":
      return "right bottom";
    default:
      return "center center";
  }
}

export function ScaleAnchorTextAnimation({
  text,
  playKey = 0,
  compact = false,
  className,
  phase = "in",
  scaleStart = 0.4,
  scaleEnd = 1,
  speed = 600,
  stagger = 100,
  ease = "cubic-bezier(0.22, 1, 0.36, 1)",
  anchor = "center",
}: ScaleAnchorTextAnimationProps) {
  const reduced = usePrefersReducedMotion();
  const words = useMemo(() => splitWords(text), [text]);
  const origin = getTransformOrigin(anchor);
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
        if (reduced) {
          return (
            <span key={`${playKey}-${i}`} className="inline-block">
              {word}
            </span>
          );
        }

        const delay =
          resolvedPhase === "out"
            ? (words.length - 1 - i) * stagger
            : i * stagger;

        return (
          <span
            key={`${playKey}-${resolvedPhase}-${i}-${word}`}
            className="tal-animate-scale inline-block"
            style={{
              animationDuration: `${speed}ms`,
              animationTimingFunction: ease,
              animationDelay: `${delay}ms`,
              animationDirection: phaseDirection(resolvedPhase),
              transformOrigin: origin,
              ["--tal-scale-start" as string]: String(scaleStart),
              ["--tal-scale-end" as string]: String(scaleEnd),
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}
