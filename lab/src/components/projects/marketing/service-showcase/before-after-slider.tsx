"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/utils";
import type { ServiceMedia } from "./types";

type BeforeAfterSliderProps = {
  before: ServiceMedia;
  after: ServiceMedia;
  borderRadiusPx: number;
  reducedMotion: boolean;
  priority?: boolean;
  className?: string;
};

export function BeforeAfterSlider({
  before,
  after,
  borderRadiusPx,
  reducedMotion,
  priority = false,
  className,
}: BeforeAfterSliderProps) {
  const prefersReduced = useReducedMotion();
  const reduce = reducedMotion || !!prefersReduced;
  const labelId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState(50);
  const [visible, setVisible] = useState(reduce);

  useEffect(() => {
    if (reduce) return;
    const node = trackRef.current;
    if (!node) return;

    let introTimer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        setPosition(42);
        introTimer = window.setTimeout(() => setPosition(50), 420);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (introTimer !== undefined) window.clearTimeout(introTimer);
    };
  }, [reduce]);

  const updateFromClientX = useCallback((clientX: number) => {
    const node = trackRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, next)));
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    draggingRef.current = true;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromClientX(event.clientX);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateFromClientX(event.clientX);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPosition((p) => Math.max(0, p - step));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setPosition((p) => Math.min(100, p + step));
    } else if (event.key === "Home") {
      event.preventDefault();
      setPosition(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setPosition(100);
    }
  };

  return (
    <motion.div
      ref={trackRef}
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden border border-[var(--ss-border)] bg-[var(--ss-hover)]",
        "touch-none select-none",
        className,
      )}
      style={{ borderRadius: borderRadiusPx }}
      initial={reduce ? false : { opacity: 0.92, scale: 0.985 }}
      animate={
        visible || reduce
          ? { opacity: 1, scale: 1 }
          : { opacity: 0.92, scale: 0.985 }
      }
      transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      role="group"
      aria-labelledby={labelId}
    >
      <span id={labelId} className="sr-only">
        Before and after image comparison
      </span>

      <div className="absolute inset-0">
        <Image
          src={after.src}
          alt={after.alt}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          priority={priority}
          className="object-cover"
        />
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-white backdrop-blur-sm">
          After
        </span>
      </div>

      <div
        className="absolute inset-0 overflow-hidden will-change-[clip-path]"
        style={{
          clipPath: `inset(0 ${100 - position}% 0 0)`,
          transition:
            reduce || dragging
              ? undefined
              : "clip-path 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <Image
          src={before.src}
          alt={before.alt}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          priority={priority}
          className="object-cover"
        />
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-white backdrop-blur-sm">
          Before
        </span>
      </div>

      <div
        className="absolute inset-0 z-[5] cursor-ew-resize"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white"
        style={{
          left: `${position}%`,
          transform: "translateX(-50%)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
          transition:
            reduce || dragging
              ? undefined
              : "opacity 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        aria-hidden
      />

      <div
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-valuetext={`${Math.round(position)}% before visible`}
        aria-label="Comparison position"
        className={cn(
          "service-showcase__ba-handle absolute top-1/2 z-20",
          "flex size-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center",
          "rounded-full border border-white/80 bg-white",
          "shadow-[0_4px_18px_rgba(0,0,0,0.18)]",
          "touch-none",
        )}
        style={{ left: `${position}%` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <span className="flex items-center gap-0.5 text-[var(--ss-fg)]" aria-hidden>
          <ChevronLeftIcon />
          <ChevronRightIcon />
        </span>
      </div>
    </motion.div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="M6.25 2.25 3.5 5l2.75 2.75"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="M3.75 2.25 6.5 5 3.75 7.75"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
