"use client";

import { useEffect, useMemo, useState } from "react";
import {
  cn,
  splitChars,
  usePrefersReducedMotion,
  type BaseAnimationProps,
  type EaseOption,
} from "./shared";

export type TypingAnimationProps = BaseAnimationProps & {
  typingSpeed?: number;
  startDelay?: number;
  showCursor?: boolean;
  cursorBlinkSpeed?: number;
  ease?: EaseOption;
  loop?: boolean;
};

function TypingAnimationInner({
  text,
  compact = false,
  className,
  typingSpeed = 80,
  startDelay = 400,
  showCursor = true,
  cursorBlinkSpeed = 530,
  ease = "ease-out",
  loop = false,
}: Omit<TypingAnimationProps, "playKey">) {
  const reduced = usePrefersReducedMotion();
  const chars = useMemo(() => splitChars(text), [text]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [showBlink, setShowBlink] = useState(true);
  const displayCount = reduced ? chars.length : visibleCount;

  useEffect(() => {
    if (reduced) return;

    let index = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        index += 1;
        setVisibleCount(index);
        if (index >= chars.length) {
          clearInterval(intervalId);
          if (loop) {
            setTimeout(() => {
              index = 0;
              setVisibleCount(0);
              intervalId = setInterval(() => {
                index += 1;
                setVisibleCount(index);
                if (index >= chars.length) clearInterval(intervalId);
              }, typingSpeed);
            }, 1200);
          }
        }
      }, typingSpeed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [chars, typingSpeed, startDelay, loop, reduced]);

  useEffect(() => {
    if (!showCursor || reduced) return;
    const id = setInterval(() => setShowBlink((v) => !v), cursorBlinkSpeed);
    return () => clearInterval(id);
  }, [showCursor, cursorBlinkSpeed, reduced]);

  const done = displayCount >= chars.length;

  return (
    <span
      className={cn(
        "inline-block font-medium tracking-tight text-white",
        compact ? "text-lg" : "text-3xl md:text-4xl",
        className,
      )}
      style={{ transitionTimingFunction: ease }}
      aria-label={text}
    >
      {chars.slice(0, displayCount).map((char, i) => (
        <span key={`${i}-${char}`} className="inline-block">
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
      {showCursor && !reduced ? (
        <span
          className={cn(
            "ml-0.5 inline-block w-[2px] bg-white align-middle",
            compact ? "h-4" : "h-8 md:h-10",
            done && showBlink ? "opacity-100" : done ? "opacity-0" : "opacity-100",
          )}
          aria-hidden
        />
      ) : null}
    </span>
  );
}

export function TypingAnimation({ playKey = 0, ...props }: TypingAnimationProps) {
  return <TypingAnimationInner key={playKey} {...props} />;
}
