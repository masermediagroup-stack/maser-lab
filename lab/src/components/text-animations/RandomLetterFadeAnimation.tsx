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

export type RandomLetterFadeAnimationProps = BaseAnimationProps & {
  fadeSpeed?: number;
  stagger?: number;
  randomOrder?: boolean;
  randomnessAmount?: number;
  blur?: number;
  ease?: EaseOption;
};

function buildOrder(length: number, randomOrder: boolean, randomnessAmount: number, playKey: number) {
  const indices = Array.from({ length }, (_, i) => i);
  if (!randomOrder) return indices;

  const seeded = indices.map((i) => {
    const seed = Math.sin(i * 12.9898 + playKey * 78.233) * 43758.5453;
    const rand = seed - Math.floor(seed);
    return { i, sort: rand * randomnessAmount + i * (1 - randomnessAmount) };
  });
  seeded.sort((a, b) => a.sort - b.sort);
  return seeded.map((entry) => entry.i);
}

export function RandomLetterFadeAnimation({
  text,
  playKey = 0,
  compact = false,
  className,
  phase = "in",
  fadeSpeed = 500,
  stagger = 40,
  randomOrder = true,
  randomnessAmount = 0.8,
  blur = 4,
  ease = "ease-out",
}: RandomLetterFadeAnimationProps) {
  const reduced = usePrefersReducedMotion();
  const chars = useMemo(() => splitChars(text), [text]);
  const resolvedPhase: AnimationPhase = phase === "out" ? "out" : "in";
  const order = useMemo(
    () => buildOrder(chars.length, randomOrder, randomnessAmount, playKey),
    [chars.length, randomOrder, randomnessAmount, playKey],
  );

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
        const orderIndex = order.indexOf(i);
        const delay =
          resolvedPhase === "out"
            ? (chars.length - 1 - orderIndex) * stagger
            : orderIndex * stagger;

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
            className="tal-animate-random-fade inline-block"
            style={{
              animationDuration: `${fadeSpeed}ms`,
              animationTimingFunction: ease,
              animationDelay: `${delay}ms`,
              animationDirection: phaseDirection(resolvedPhase),
              ["--tal-fade-blur" as string]: `${blur}px`,
            }}
          >
            {display}
          </span>
        );
      })}
    </span>
  );
}
