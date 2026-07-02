"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  cn,
  usePrefersReducedMotion,
  type BaseAnimationProps,
} from "./shared";

export type ScrollLineRevealAnimationProps = BaseAnimationProps & {
  scrollStart?: string;
  scrollEnd?: string;
  scrubAmount?: number;
  lineStagger?: number;
  revealDirection?: "up" | "down" | "left" | "right";
  blur?: number;
  opacityFade?: boolean;
  pinSection?: boolean;
  /** When true, uses internal scroll container for gallery preview */
  embedded?: boolean;
};

function getRevealOffset(direction: ScrollLineRevealAnimationProps["revealDirection"]) {
  switch (direction) {
    case "down":
      return { y: -24 };
    case "left":
      return { x: 32 };
    case "right":
      return { x: -32 };
    default:
      return { y: 24 };
  }
}

export function ScrollLineRevealAnimation({
  text,
  playKey = 0,
  compact = false,
  className,
  scrollStart = "top 80%",
  scrollEnd = "top 30%",
  scrubAmount = 1,
  lineStagger = 0.12,
  revealDirection = "up",
  blur = 6,
  opacityFade = true,
  pinSection = false,
  embedded = false,
}: ScrollLineRevealAnimationProps) {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const lines = text.split("\n").filter(Boolean);
  const displayLines = lines.length > 0 ? lines : [text];

  useEffect(() => {
    if (reduced || !sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const offset = getRevealOffset(revealDirection);
      const linesEls = sectionRef.current?.querySelectorAll("[data-tal-line]");

      linesEls?.forEach((line, i) => {
        gsap.fromTo(
          line,
          {
            ...offset,
            opacity: opacityFade ? 0 : 1,
            filter: blur > 0 ? `blur(${blur}px)` : "none",
          },
          {
            x: 0,
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            ease: "power2.out",
            scrollTrigger: embedded
              ? {
                  trigger: sectionRef.current,
                  scroller: sectionRef.current?.closest("[data-tal-scroll-host]") ?? undefined,
                  start: scrollStart,
                  end: scrollEnd,
                  scrub: scrubAmount,
                }
              : {
                  trigger: line,
                  start: scrollStart,
                  end: scrollEnd,
                  scrub: scrubAmount,
                },
            delay: i * lineStagger,
          },
        );
      });

      if (pinSection && sectionRef.current && !embedded) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "+=120%",
          pin: true,
          pinSpacing: true,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [
    reduced,
    playKey,
    scrollStart,
    scrollEnd,
    scrubAmount,
    lineStagger,
    revealDirection,
    blur,
    opacityFade,
    pinSection,
    embedded,
    text,
  ]);

  if (reduced) {
    return (
      <div
        className={cn(
          "font-medium tracking-tight text-white",
          compact ? "text-lg" : "text-3xl md:text-4xl",
          className,
        )}
      >
        {displayLines.map((line, i) => (
          <p key={`${playKey}-${i}`}>{line}</p>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={sectionRef}
      className={cn(
        "font-medium tracking-tight text-white",
        compact ? "text-lg" : "text-3xl md:text-4xl",
        embedded ? "min-h-[200%] py-8" : "",
        className,
      )}
      aria-label={text}
    >
      {displayLines.map((line, i) => (
        <p
          key={`${playKey}-${i}-${line}`}
          data-tal-line
          className={cn("leading-tight", i > 0 ? "mt-2" : "")}
          style={
            embedded
              ? {
                  opacity: opacityFade ? 0.2 : 1,
                  transform: `translateY(${revealDirection === "up" ? 16 : -16}px)`,
                }
              : undefined
          }
        >
          {line}
        </p>
      ))}
    </div>
  );
}
