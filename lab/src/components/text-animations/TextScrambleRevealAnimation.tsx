"use client";

import { useEffect, useMemo, useState } from "react";
import {
  cn,
  splitChars,
  usePrefersReducedMotion,
  type AnimationPhase,
  type BaseAnimationProps,
} from "./shared";

const GLYPHS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*_+-=<>?/\\|";

export type TextScrambleRevealProps = BaseAnimationProps & {
  scrambleSpeed?: number;
  settleDelay?: number;
  cyclesPerChar?: number;
  startDelay?: number;
};

function placeholderFor(chars: string[], phase: AnimationPhase): string {
  if (phase === "out") return chars.join("");
  return chars.map((c) => (c === " " ? " " : "·")).join("");
}

/**
 * Decode / scramble reveal — characters flicker through random glyphs then settle.
 * `phase="out"` scrambles away from the resolved text.
 */
export function TextScrambleRevealAnimation({
  text,
  playKey = 0,
  compact = false,
  className,
  phase = "in",
  scrambleSpeed = 28,
  settleDelay = 40,
  cyclesPerChar = 4,
  startDelay = 120,
}: TextScrambleRevealProps) {
  const reduced = usePrefersReducedMotion();
  const chars = useMemo(() => splitChars(text), [text]);
  const resolvedPhase: AnimationPhase = phase === "out" ? "out" : "in";
  const [display, setDisplay] = useState(() =>
    placeholderFor(chars, resolvedPhase),
  );

  useEffect(() => {
    if (reduced) return;

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    const boot = window.setTimeout(() => {
      if (cancelled) return;
      setDisplay(placeholderFor(chars, resolvedPhase));

      chars.forEach((char, i) => {
        if (char === " " && resolvedPhase === "in") return;

        const startAt =
          resolvedPhase === "out"
            ? (chars.length - 1 - i) * settleDelay
            : i * settleDelay;

        timeouts.push(
          setTimeout(() => {
            if (cancelled) return;
            let cycles = 0;
            const id = setInterval(() => {
              if (cancelled) return;
              cycles += 1;
              setDisplay((prev) => {
                const next = [...prev.padEnd(chars.length, " ")];
                if (resolvedPhase === "out") {
                  next[i] =
                    cycles >= cyclesPerChar
                      ? " "
                      : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
                } else {
                  next[i] =
                    cycles >= cyclesPerChar
                      ? char
                      : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
                }
                return next.join("").slice(0, chars.length);
              });
              if (cycles >= cyclesPerChar) clearInterval(id);
            }, scrambleSpeed);
            intervals.push(id);
          }, startAt),
        );
      });
    }, startDelay);

    return () => {
      cancelled = true;
      clearTimeout(boot);
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [
    chars,
    cyclesPerChar,
    playKey,
    reduced,
    resolvedPhase,
    scrambleSpeed,
    settleDelay,
    startDelay,
  ]);

  const shown = reduced ? text : display;

  return (
    <span
      className={cn(
        "inline-block font-mono font-medium tracking-tight text-white",
        compact ? "text-lg" : "text-3xl md:text-4xl",
        className,
      )}
      aria-label={text}
    >
      {shown}
    </span>
  );
}
