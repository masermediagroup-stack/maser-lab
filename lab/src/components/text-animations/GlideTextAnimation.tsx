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

export type GlideTextAnimationProps = BaseAnimationProps & {
  direction?: "left" | "right" | "top" | "bottom" | "diagonal";
  glideDistance?: number;
  speed?: number;
  stagger?: number;
  blur?: number;
  ease?: EaseOption;
};

function getGlideFrom(
  direction: "left" | "right" | "top" | "bottom" | "diagonal",
  distance: number,
): string {
  switch (direction) {
    case "left":
      return `translateX(-${distance}px)`;
    case "right":
      return `translateX(${distance}px)`;
    case "top":
      return `translateY(-${distance}px)`;
    case "bottom":
      return `translateY(${distance}px)`;
    case "diagonal":
      return `translate(${distance * 0.7}px, ${distance * 0.7}px)`;
  }
}

export function GlideTextAnimation({
  text,
  playKey = 0,
  compact = false,
  className,
  direction = "left",
  glideDistance = 48,
  speed = 650,
  stagger = 120,
  blur = 4,
  ease = "cubic-bezier(0.22, 1, 0.36, 1)",
}: GlideTextAnimationProps) {
  const reduced = usePrefersReducedMotion();
  const words = useMemo(() => splitWords(text), [text]);
  const glideFrom = getGlideFrom(direction, glideDistance);

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

        return (
          <span
            key={`${playKey}-${i}-${word}`}
            className="tal-animate-glide inline-block"
            style={{
              animationDuration: `${speed}ms`,
              animationTimingFunction: ease,
              animationDelay: `${i * stagger}ms`,
              ["--tal-glide-from" as string]: glideFrom,
              ["--tal-glide-blur" as string]: `${blur}px`,
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}
