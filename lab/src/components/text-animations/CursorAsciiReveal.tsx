"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  cn,
  splitChars,
  usePrefersReducedMotion,
  type BaseAnimationProps,
} from "./shared";

const ASCII_CHARS = " .:-=+*#%@";

export type CursorAsciiRevealProps = BaseAnimationProps & {
  revealRadius?: number;
  revealSoftness?: number;
  revealSpeed?: number;
  asciiDensity?: number;
  noiseAmount?: number;
  hoverMode?: boolean;
  pressMode?: boolean;
};

function noiseChar(index: number, noiseAmount: number): string {
  const seed = Math.sin(index * 127.1 + noiseAmount * 311.7) * 43758.5453;
  const t = seed - Math.floor(seed);
  const charIndex = Math.floor(t * ASCII_CHARS.length);
  return ASCII_CHARS[charIndex] ?? ".";
}

export function CursorAsciiReveal({
  text,
  playKey = 0,
  compact = false,
  className,
  revealRadius = 80,
  revealSoftness = 0.5,
  revealSpeed = 0.15,
  asciiDensity = 0.6,
  noiseAmount = 0.4,
  hoverMode = true,
  pressMode = true,
}: CursorAsciiRevealProps) {
  const reduced = usePrefersReducedMotion();
  const chars = useMemo(() => splitChars(text), [text]);
  const containerRef = useRef<HTMLSpanElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [pressed, setPressed] = useState(false);
  const revealRef = useRef<Map<number, number>>(new Map());

  const updateReveal = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      setPointer({ x, y });

      charRefs.current.forEach((el, i) => {
        if (!el) return;
        const charRect = el.getBoundingClientRect();
        const cx = charRect.left + charRect.width / 2 - rect.left;
        const cy = charRect.top + charRect.height / 2 - rect.top;
        const dist = Math.hypot(x - cx, y - cy);
        const strength = Math.max(0, 1 - dist / revealRadius);
        const eased = Math.pow(strength, 1 / Math.max(revealSoftness, 0.1));
        const current = revealRef.current.get(i) ?? 0;
        const next = Math.min(1, current + (eased - current) * revealSpeed);
        revealRef.current.set(i, next);
        el.style.opacity = String(next);
        el.style.filter = `blur(${(1 - next) * 3}px)`;
      });
    },
    [revealRadius, revealSoftness, revealSpeed],
  );

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!hoverMode && !pressed) return;
    if (e.pointerType === "touch" && !pressed) return;
    updateReveal(e.clientX, e.clientY);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!pressMode) return;
    setPressed(true);
    containerRef.current?.setPointerCapture(e.pointerId);
    updateReveal(e.clientX, e.clientY);
  };

  const handlePointerUp = () => setPressed(false);

  const handlePointerLeave = () => {
    if (!pressed) setPointer(null);
  };

  return (
    <span
      ref={containerRef}
      className={cn(
        "relative inline-flex cursor-crosshair flex-wrap items-center justify-center font-mono font-medium tracking-tight select-none touch-none",
        compact ? "text-base" : "text-2xl md:text-3xl",
        className,
      )}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      aria-label={text}
      role="img"
    >
      {chars.map((char, i) => {
        const display = char === " " ? "\u00A0" : char;
        const showAscii = (i + playKey) % Math.round(1 / Math.max(asciiDensity, 0.01)) === 0;
        const glyph = showAscii ? noiseChar(i + playKey, noiseAmount) : display;

        if (reduced) {
          return (
            <span key={`${playKey}-${i}`} className="text-white">
              {display}
            </span>
          );
        }

        return (
          <span
            key={`${playKey}-${i}-${char}`}
            ref={(el) => {
              charRefs.current[i] = el;
            }}
            className="relative inline-block text-white"
            style={{ opacity: hoverMode || pressMode ? 0.15 : 1 }}
          >
            <span className="absolute inset-0 text-neutral-500" aria-hidden>
              {glyph}
            </span>
            <span className="relative">{display}</span>
          </span>
        );
      })}
      {!compact && pointer ? (
        <span
          className="pointer-events-none absolute rounded-full border border-white/20 bg-white/5"
          style={{
            width: revealRadius * 2,
            height: revealRadius * 2,
            left: pointer.x - revealRadius,
            top: pointer.y - revealRadius,
          }}
          aria-hidden
        />
      ) : null}
    </span>
  );
}
