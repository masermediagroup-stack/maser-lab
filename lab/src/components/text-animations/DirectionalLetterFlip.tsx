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

export type DirectionalLetterFlipProps = BaseAnimationProps & {
  direction?: "top" | "bottom" | "left" | "right";
  flipSpeed?: number;
  stagger?: number;
  perspective?: number;
  rotationAmount?: number;
  ease?: EaseOption;
};

function getFlipTransform(
  direction: "top" | "bottom" | "left" | "right",
  amount: number,
): string {
  switch (direction) {
    case "top":
      return `rotateX(${amount}deg) translateY(-${amount / 3}px)`;
    case "bottom":
      return `rotateX(-${amount}deg) translateY(${amount / 3}px)`;
    case "left":
      return `rotateY(-${amount}deg) translateX(-${amount / 3}px)`;
    case "right":
      return `rotateY(${amount}deg) translateX(${amount / 3}px)`;
  }
}

export function DirectionalLetterFlip({
  text,
  playKey = 0,
  compact = false,
  className,
  phase = "in",
  direction = "top",
  flipSpeed = 550,
  stagger = 45,
  perspective = 900,
  rotationAmount = 90,
  ease = "cubic-bezier(0.22, 1, 0.36, 1)",
}: DirectionalLetterFlipProps) {
  const reduced = usePrefersReducedMotion();
  const chars = useMemo(() => splitChars(text), [text]);
  const flipTransform = getFlipTransform(direction, rotationAmount);
  const resolvedPhase: AnimationPhase = phase === "out" ? "out" : "in";

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center justify-center font-medium tracking-tight text-white",
        compact ? "text-lg" : "text-3xl md:text-4xl",
        className,
      )}
      style={{ perspective }}
      aria-label={text}
    >
      {chars.map((char, i) => {
        const display = char === " " ? "\u00A0" : char;
        const delay =
          resolvedPhase === "out"
            ? (chars.length - 1 - i) * stagger
            : i * stagger;

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
            className="tal-animate-directional-flip inline-block origin-center"
            style={{
              animationDuration: `${flipSpeed}ms`,
              animationTimingFunction: ease,
              animationDelay: `${delay}ms`,
              animationDirection: phaseDirection(resolvedPhase),
              ["--tal-flip-transform" as string]: flipTransform,
            }}
          >
            {display}
          </span>
        );
      })}
    </span>
  );
}
