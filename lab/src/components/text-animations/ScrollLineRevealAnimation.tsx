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
  /** When true, uses internal scroll container for gallery/detail preview */
  embedded?: boolean;
};

function getRevealOffset(direction: ScrollLineRevealAnimationProps["revealDirection"]) {
  switch (direction) {
    case "down":
      return { y: -28 };
    case "left":
      return { x: 40 };
    case "right":
      return { x: -40 };
    default:
      return { y: 28 };
  }
}

/**
 * GSAP ScrollTrigger line reveal. In embedded mode, spacers keep lines
 * below the fold so scrub triggers fire while scrolling the host.
 */
export function ScrollLineRevealAnimation({
  text,
  playKey = 0,
  compact = false,
  className,
  scrollStart = "top 80%",
  scrollEnd = "top 25%",
  scrubAmount = 1,
  lineStagger = 0.12,
  revealDirection = "up",
  blur = 6,
  opacityFade = true,
  pinSection = false,
  embedded = false,
}: ScrollLineRevealAnimationProps) {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const linesWrapRef = useRef<HTMLDivElement>(null);
  const lines = text.split("\n").filter(Boolean);
  const displayLines = lines.length > 0 ? lines : [text];

  useEffect(() => {
    if (reduced || !rootRef.current || !linesWrapRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const root = rootRef.current;
    const linesWrap = linesWrapRef.current;
    const scroller = embedded
      ? (root.closest("[data-tal-scroll-host]") as HTMLElement | null)
      : null;

    const ctx = gsap.context(() => {
      const offset = getRevealOffset(revealDirection);
      const lineEls = linesWrap.querySelectorAll<HTMLElement>("[data-tal-line]");

      if (lineEls.length === 0) return;

      gsap.set(lineEls, {
        ...offset,
        opacity: opacityFade ? 0 : 1,
        filter: blur > 0 ? `blur(${blur}px)` : "none",
      });

      const tween = gsap.to(lineEls, {
        x: 0,
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        ease: "none",
        stagger: lineStagger,
        scrollTrigger: {
          trigger: linesWrap,
          scroller: scroller ?? undefined,
          start: scrollStart,
          end: scrollEnd,
          scrub: scrubAmount > 0 ? scrubAmount : false,
          invalidateOnRefresh: true,
        },
      });

      if (pinSection && !embedded) {
        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "+=120%",
          pin: true,
          pinSpacing: true,
        });
      }

      // Layout may settle after paint (fonts, flex). Refresh once.
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }, root);

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

  const spacerClass = compact
    ? "h-24 shrink-0"
    : "h-[min(42vh,220px)] shrink-0";

  return (
    <div
      ref={rootRef}
      className={cn(
        "font-medium tracking-tight text-white",
        compact ? "text-lg" : "text-3xl md:text-4xl",
        embedded ? "flex flex-col" : "",
        className,
      )}
      aria-label={text}
    >
      {embedded ? (
        <div aria-hidden className={spacerClass} data-tal-scroll-spacer />
      ) : null}

      <div ref={linesWrapRef} className="relative py-2">
        {embedded ? (
          <p className="mb-3 text-[10px] font-normal tracking-[0.16em] text-neutral-500 uppercase">
            Scroll to reveal
          </p>
        ) : null}
        {displayLines.map((line, i) => (
          <p
            key={`${playKey}-${i}-${line}`}
            data-tal-line
            className={cn("will-change-transform leading-tight", i > 0 ? "mt-2" : "")}
          >
            {line}
          </p>
        ))}
      </div>

      {embedded ? (
        <div aria-hidden className={spacerClass} data-tal-scroll-spacer />
      ) : null}
    </div>
  );
}
