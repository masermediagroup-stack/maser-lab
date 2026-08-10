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
  TRIGGER_BLUR_MAX,
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
      ["--pic-label" as string]: "#000000",
      ["--pic-body" as string]: "#ffffff",
      ["--pic-pixel" as string]: "#000000",
    };
  }
  return {
    ["--pic-surface" as string]: "#ffffff",
    ["--pic-accent" as string]: "#10a4ff",
    ["--pic-label" as string]: "#10a4ff",
    ["--pic-body" as string]: "#0a0a0a",
    ["--pic-pixel" as string]: "#ffffff",
  };
}

/**
 * Portable info trigger that pixel-bursts from a squircle into a reversible info card.
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

  const { phase, progress, showCardDom, showCardContent, toggle, collapse } =
    machine;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setCardSize({ w: rect.width, h: rect.height });
    }
  }, [showCardDom, body, title, tuning.cardRadius]);

  const prevPhaseRef = useRef<typeof phase>(phase);
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;
    if (prev === phase) return;
    if (phase === "expanded") {
      cardRef.current?.focus({ preventScroll: true });
    } else if (
      phase === "idle" &&
      (prev === "collapsing" || prev === "expanded")
    ) {
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [phase]);

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

  // Fast, light dissipate — mostly opacity, tiny blur
  const triggerOpacity = (() => {
    if (reducedMotion) return phase === "idle" ? 1 : 0;
    if (phase === "idle") return 1;
    return Math.max(0, 1 - progress / 0.08);
  })();

  const triggerBlur = (() => {
    if (reducedMotion || phase === "idle") return 0;
    return Math.min(TRIGGER_BLUR_MAX, (1 - triggerOpacity) * TRIGGER_BLUR_MAX);
  })();

  /**
   * Card plate: snap on only at handoff. Never crossfade with flying pixels.
   */
  const cardOpacity = (() => {
    if (reducedMotion) {
      return phase === "expanded" || phase === "expanding" ? 1 : 0;
    }
    if (phase === "expanded") return 1;
    if (phase === "expanding" && showCardDom) return 1;
    // Collapse: hide DOM immediately so canvas owns the reverse dissolve
    return 0;
  })();

  // Canvas owns the pixel→plate story; clear the same beat the DOM card appears
  const pixelsActive =
    !reducedMotion &&
    phase !== "idle" &&
    phase !== "expanded" &&
    !showCardDom &&
    progress > 0.01 &&
    progress < 0.995;

  const onTriggerClick = useCallback(() => {
    toggle();
  }, [toggle]);

  const onCardClick = useCallback(() => {
    toggle();
  }, [toggle]);

  const contentVisible = reducedMotion
    ? phase === "expanded" || phase === "expanding"
    : showCardContent;

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

        <div
          className="pic-trigger-wrap"
          style={{
            opacity: triggerOpacity,
            filter: triggerBlur > 0 ? `blur(${triggerBlur}px)` : undefined,
            pointerEvents: triggerOpacity < 0.2 ? "none" : "auto",
            transition: reducedMotion
              ? "opacity 120ms ease"
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

        {(phase !== "idle" || showCardDom) && (
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
              pointerEvents: cardOpacity > 0.5 ? "auto" : "none",
              borderRadius: tuning.cardRadius,
            }}
          >
            <span
              className={cn(
                "pic-card-header",
                contentVisible && !reducedMotion && "pic-card-content--in",
                !contentVisible && "pic-card-content--hidden",
              )}
            >
              <Info
                className="pic-icon pic-icon--sm"
                aria-hidden
                strokeWidth={2.25}
              />
              <span className="pic-card-title">{title}</span>
            </span>
            <span
              className={cn(
                "pic-card-body",
                contentVisible && !reducedMotion && "pic-card-content--in",
                !contentVisible && "pic-card-content--hidden",
              )}
            >
              {body}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export type { PixelInfoCardProps, PixelInfoTheme };
