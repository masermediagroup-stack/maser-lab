"use client";

import { useMemo } from "react";
import {
  cn,
  splitChars,
  usePrefersReducedMotion,
  type BaseAnimationProps,
  type EaseOption,
} from "./shared";
import "./text-animations.css";

export type PouredTextAnimationProps = BaseAnimationProps & {
  speed?: number;
  curveIntensity?: number;
  stagger?: number;
  verticalOffset?: number;
  horizontalOffset?: number;
  blur?: number;
  ease?: EaseOption;
};

export function PouredTextAnimation({
  text,
  playKey = 0,
  compact = false,
  className,
  speed = 700,
  curveIntensity = 40,
  stagger = 50,
  verticalOffset = -30,
  horizontalOffset = 0,
  blur = 6,
  ease = "cubic-bezier(0.22, 1, 0.36, 1)",
}: PouredTextAnimationProps) {
  const reduced = usePrefersReducedMotion();
  const chars = useMemo(() => splitChars(text), [text]);

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center justify-center font-medium tracking-tight text-white",
        compact ? "text-lg" : "text-3xl md:text-4xl",
        className,
      )}
      aria-label={text}
    >
      {chars.map((char, i) => {
        const display = char === " " ? "\u00A0" : char;
        const curve = Math.sin((i / Math.max(chars.length - 1, 1)) * Math.PI) * curveIntensity;

        if (reduced) {
          return (
            <span key={`${playKey}-${i}`} className="inline-block">
              {display}
            </span>
          );
        }

        return (
          <span
            key={`${playKey}-${i}-${char}`}
            className="tal-animate-poured inline-block"
            style={{
              animationDuration: `${speed}ms`,
              animationTimingFunction: ease,
              animationDelay: `${i * stagger}ms`,
              ["--tal-pour-y" as string]: `${verticalOffset + curve}px`,
              ["--tal-pour-x" as string]: `${horizontalOffset}px`,
              ["--tal-pour-blur" as string]: `${blur}px`,
            }}
          >
            {display}
          </span>
        );
      })}
    </span>
  );
}
