"use client";

import { useMemo } from "react";
import {
  cn,
  phaseDirection,
  splitChars,
  usePrefersReducedMotion,
  type AnimationPhase,
  type BaseAnimationProps,
  type EaseOption,
} from "./shared";
import "./text-animations.css";

export type LetterFlipFrameProps = BaseAnimationProps & {
  flipSpeed?: number;
  stagger?: number;
  flipAxis?: "x" | "y" | "z";
  perspective?: number;
  ease?: EaseOption;
  direction?: "forward" | "reverse";
};

export function LetterFlipFrame({
  text,
  playKey = 0,
  compact = false,
  className,
  phase = "in",
  flipSpeed = 600,
  stagger = 60,
  flipAxis = "x",
  perspective = 800,
  ease = "cubic-bezier(0.22, 1, 0.36, 1)",
  direction = "forward",
}: LetterFlipFrameProps) {
  const reduced = usePrefersReducedMotion();
  const chars = useMemo(() => splitChars(text), [text]);
  const resolvedPhase: AnimationPhase = phase === "out" ? "out" : "in";

  const rotateFrom =
    flipAxis === "x" ? "rotateX(90deg)" : flipAxis === "y" ? "rotateY(90deg)" : "rotateZ(90deg)";

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center justify-center gap-0 font-medium tracking-tight text-white",
        compact ? "text-lg" : "text-3xl md:text-4xl",
        className,
      )}
      style={{ perspective }}
      aria-label={text}
    >
      {chars.map((char, i) => {
        const indexOrder = direction === "forward" ? i : chars.length - 1 - i;
        const delay =
          resolvedPhase === "out"
            ? (chars.length - 1 - indexOrder) * stagger
            : indexOrder * stagger;
        const display = char === " " ? "\u00A0" : char;

        if (reduced) {
          return (
            <span key={`${playKey}-${i}`} className="inline-block">
              {display}
            </span>
          );
        }

        return (
          <span
            key={`${playKey}-${resolvedPhase}-${i}-${char}`}
            className="tal-animate-letter-flip inline-block origin-center"
            style={{
              animationDuration: `${flipSpeed}ms`,
              animationTimingFunction: ease,
              animationDelay: `${delay}ms`,
              animationDirection: phaseDirection(resolvedPhase),
              ["--tal-flip-from" as string]: rotateFrom,
            }}
          >
            {display}
          </span>
        );
      })}
    </span>
  );
}
