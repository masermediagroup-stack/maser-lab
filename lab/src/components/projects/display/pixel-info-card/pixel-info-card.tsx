"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/components/text-animations/shared";
import {
  CARD_MAX_WIDTH,
  CARD_MIN_HEIGHT,
  DEFAULT_TITLE,
  DEMO_BODY,
  PIC_DEFAULTS,
  TRIGGER_SIZE,
} from "./constants";
import { PixelAssembleCanvas } from "./pixel-assemble-canvas";
import {
  mergeTuning,
  usePixelInfoMachine,
} from "./use-pixel-info-machine";
import type { PixelInfoCardProps, PixelInfoTheme } from "./types";
import "./tokens.css";

function themeVars(theme: PixelInfoTheme): CSSProperties {
  if (theme === "light") {
    return {
      ["--pic-surface" as string]: "#000000",
      ["--pic-accent" as string]: "#ffffff",
      ["--pic-body" as string]: "#ffffff",
      ["--pic-pixel" as string]: "#000000",
    };
  }
  return {
    ["--pic-surface" as string]: "#ffffff",
    ["--pic-accent" as string]: "#10a4ff",
    ["--pic-body" as string]: "#0a0a0a",
    ["--pic-pixel" as string]: "#ffffff",
  };
}

/**
 * Portable info trigger that pixel-snake assembles into a reversible info card.
 */
export function PixelInfoCard({
  theme = "dark",
  title = DEFAULT_TITLE,
  body = DEMO_BODY,
  className,
  tuning: tuningPartial,
  reducedMotion: reducedMotionProp,
}: PixelInfoCardProps) {
  const tuning = mergeTuning({ ...PIC_DEFAULTS, ...tuningPartial });
  const systemReduced = usePrefersReducedMotion();
  const reducedMotion = reducedMotionProp ?? systemReduced;
  const machine = usePixelInfoMachine({
    assembleMs: tuning.assembleMs,
    reducedMotion,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [cardSize, setCardSize] = useState({
    w: CARD_MAX_WIDTH,
    h: CARD_MIN_HEIGHT,
  });

  const { phase, progress, showCardDom, toggle, collapse } = machine;

  // Measure card for canvas mask (hidden measure node when idle)
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setCardSize({ w: rect.width, h: rect.height });
    }
  }, [showCardDom, body, title, tuning.cardRadius]);

  // Focus management — only move after user-driven phase changes
  const prevPhaseRef = useRef<typeof phase>(phase);
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;
    if (prev === phase) return;
    if (phase === "expanded") {
      cardRef.current?.focus({ preventScroll: true });
    } else if (phase === "idle" && (prev === "collapsing" || prev === "expanded")) {
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [phase]);

  // Escape collapses
  useEffect(() => {
    if (phase === "idle") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        collapse();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, collapse]);

  const isIdleVisual = phase === "idle" || (phase === "collapsing" && progress < 0.15);
  const triggerOpacity =
    reducedMotion
      ? phase === "idle"
        ? 1
        : 0
      : phase === "idle"
        ? 1
        : Math.max(0, 1 - progress / 0.12);
  const triggerBlur =
    reducedMotion || phase === "idle"
      ? 0
      : Math.min(12, (1 - triggerOpacity) * 16);

  const cardOpacity = (() => {
    if (reducedMotion) return phase === "expanded" || phase === "expanding" ? 1 : 0;
    if (!showCardDom) return 0;
    if (phase === "expanded") return 1;
    if (phase === "expanding") {
      return Math.max(0, Math.min(1, (progress - 0.8) / 0.2));
    }
    // collapsing — fade out with progress
    return Math.max(0, Math.min(1, (progress - 0.35) / 0.45));
  })();

  const pixelsActive =
    !reducedMotion &&
    (phase === "expanding" || phase === "collapsing") &&
    progress > 0.02 &&
    progress < 0.98;

  const onTriggerClick = useCallback(() => {
    toggle();
  }, [toggle]);

  const onCardClick = useCallback(() => {
    toggle();
  }, [toggle]);

  return (
    <div
      className={cn("pic-root", className)}
      data-theme={theme}
      data-phase={phase}
      style={
        {
          ...themeVars(theme),
          ["--pic-card-radius" as string]: `${tuning.cardRadius}px`,
          ["--pic-dissipate-ms" as string]: `${tuning.dissipateMs}ms`,
        } as CSSProperties
      }
    >
      <div className="pic-stage">
        <PixelAssembleCanvas
          className="pic-canvas"
          active={pixelsActive}
          progress={progress}
          theme={theme}
          pixelSize={tuning.pixelSize}
          snakeDensity={tuning.snakeDensity}
          cardRadius={tuning.cardRadius}
          cardWidth={cardSize.w}
          cardHeight={cardSize.h}
          triggerSize={TRIGGER_SIZE}
        />

        {/* Trigger */}
        <div
          className="pic-trigger-wrap"
          style={{
            opacity: triggerOpacity,
            filter: triggerBlur > 0 ? `blur(${triggerBlur}px)` : undefined,
            pointerEvents: triggerOpacity < 0.2 ? "none" : "auto",
            transition: reducedMotion
              ? "opacity 150ms ease"
              : `opacity var(--pic-dissipate-ms) ease-out, filter var(--pic-dissipate-ms) ease-out`,
          }}
          aria-hidden={triggerOpacity < 0.2}
        >
          <button
            ref={triggerRef}
            type="button"
            className="pic-trigger"
            onClick={onTriggerClick}
            aria-expanded={phase !== "idle"}
            aria-controls={titleId}
            aria-label="Show info"
          >
            <span className="pic-squircle">
              <Info className="pic-icon" aria-hidden strokeWidth={2.25} />
            </span>
            <span className="pic-trigger-label">{title}</span>
          </button>
        </div>

        {/* Card — always in DOM for measure when expanded path; visually gated */}
        <button
          ref={cardRef}
          type="button"
          id={titleId}
          className={cn("pic-card", showCardDom && "pic-card--visible")}
          onClick={onCardClick}
          aria-label="Hide info"
          tabIndex={showCardDom && cardOpacity > 0.05 ? 0 : -1}
          style={{
            opacity: cardOpacity,
            pointerEvents: cardOpacity > 0.2 ? "auto" : "none",
            borderRadius: tuning.cardRadius,
            visibility:
              phase === "idle" && !showCardDom ? "hidden" : "visible",
            position: isIdleVisual && !showCardDom ? "absolute" : undefined,
          }}
        >
          <span className="pic-card-header">
            <Info className="pic-icon pic-icon--sm" aria-hidden strokeWidth={2.25} />
            <span className="pic-card-title">{title}</span>
          </span>
          <span
            className={cn(
              "pic-card-body",
              !reducedMotion && showCardDom && phase !== "collapsing" && "pic-card-body--in",
              !reducedMotion && phase === "collapsing" && "pic-card-body--out",
            )}
          >
            {body}
          </span>
        </button>
      </div>
    </div>
  );
}

export type { PixelInfoCardProps, PixelInfoTheme };
