"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
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
  SQUIRCLE_DOM_REVEAL_AT,
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

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

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

  const stageRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const squircleRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [cardSize, setCardSize] = useState({
    w: CARD_MAX_WIDTH,
    h: CARD_MIN_HEIGHT,
  });
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  const { phase, progress, showCardDom, showCardContent, toggle, collapse } =
    machine;

  const measureOrigin = useCallback(() => {
    const stage = stageRef.current;
    const squircle = squircleRef.current;
    if (!stage || !squircle) return;
    const sr = stage.getBoundingClientRect();
    const qr = squircle.getBoundingClientRect();
    if (sr.width <= 0 || qr.width <= 0) return;
    setOrigin({
      x: qr.left + qr.width / 2 - sr.left,
      y: qr.top + qr.height / 2 - sr.top,
    });
  }, []);

  useLayoutEffect(() => {
    measureOrigin();
  }, [measureOrigin, theme, phase]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => measureOrigin());
    ro.observe(stage);
    window.addEventListener("resize", measureOrigin);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureOrigin);
    };
  }, [measureOrigin]);

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

  /**
   * Squircle surface + chrome only after canvas has grown the merged pixel
   * into the full squircle — never while the blast/suck is still running.
   */
  const triggerSurfaceOpacity = (() => {
    if (reducedMotion) return phase === "idle" ? 1 : 0;
    if (phase === "idle") return 1;
    if (phase === "expanding" || phase === "expanded") {
      return Math.max(0, 1 - progress / 0.08);
    }
    if (phase === "collapsing") {
      const t = clamp01(
        (SQUIRCLE_DOM_REVEAL_AT - progress) / SQUIRCLE_DOM_REVEAL_AT,
      );
      return easeOutCubic(t);
    }
    return 0;
  })();

  const triggerChromeOpacity = (() => {
    if (reducedMotion) return phase === "idle" ? 1 : 0;
    if (phase === "idle") return 1;
    if (phase === "expanding" || phase === "expanded") {
      return Math.max(0, 1 - progress / 0.06);
    }
    if (phase === "collapsing") {
      // Icon + label only once expand-to-squircle has finished
      return progress <= SQUIRCLE_DOM_REVEAL_AT * 0.5 ? 1 : 0;
    }
    return 0;
  })();

  const triggerBlur = (() => {
    if (reducedMotion || phase === "idle") return 0;
    if (phase === "collapsing") return 0;
    return Math.min(
      TRIGGER_BLUR_MAX,
      (1 - triggerSurfaceOpacity) * TRIGGER_BLUR_MAX,
    );
  })();

  /** DOM card only after assemble completes — canvas already shows the plate. */
  const cardOpacity = (() => {
    if (reducedMotion) {
      return phase === "expanded" || phase === "expanding" ? 1 : 0;
    }
    return phase === "expanded" ? 1 : 0;
  })();

  const pixelsActive =
    !reducedMotion &&
    (phase === "expanding" || phase === "collapsing") &&
    (phase === "collapsing" || progress > 0.01);

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
      <div className="pic-stage" ref={stageRef}>
        <PixelAssembleCanvas
          className="pic-canvas"
          active={pixelsActive}
          progress={progress}
          phase={phase}
          theme={theme}
          pixelSize={tuning.pixelSize}
          snakeDensity={tuning.snakeDensity}
          cardRadius={tuning.cardRadius}
          cardWidth={cardSize.w}
          cardHeight={cardSize.h}
          triggerSize={TRIGGER_SIZE}
          originX={origin.x}
          originY={origin.y}
        />

        <div
          className="pic-trigger-wrap"
          style={{
            opacity: Math.max(triggerSurfaceOpacity, triggerChromeOpacity),
            filter: triggerBlur > 0 ? `blur(${triggerBlur}px)` : undefined,
            pointerEvents:
              triggerSurfaceOpacity < 0.2 && triggerChromeOpacity < 0.2
                ? "none"
                : "auto",
            transition: reducedMotion
              ? "opacity 120ms ease"
              : phase === "collapsing"
                ? "none"
                : `opacity var(--pic-dissipate-ms) ease-out, filter var(--pic-dissipate-ms) ease-out`,
          }}
          aria-hidden={triggerChromeOpacity < 0.2}
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
            <span
              ref={squircleRef}
              className="pic-squircle"
              style={{ opacity: triggerSurfaceOpacity }}
            >
              <Info
                className="pic-icon"
                aria-hidden
                strokeWidth={2.25}
                style={{ opacity: triggerChromeOpacity }}
              />
            </span>
            <span
              className="pic-trigger-label"
              style={{ opacity: triggerChromeOpacity }}
            >
              {title}
            </span>
          </button>
        </div>

        {/* Always mount (hidden) so we can measure card size before open */}
        <button
          ref={cardRef}
          type="button"
          id={titleId}
          className={cn(
            "pic-card",
            showCardDom && "pic-card--visible",
            contentVisible && "pic-card--settled",
          )}
          onClick={onCardClick}
          aria-label="Hide info"
          tabIndex={showCardDom && cardOpacity > 0.05 ? 0 : -1}
          style={{
            opacity: cardOpacity,
            pointerEvents: cardOpacity > 0.5 ? "auto" : "none",
            borderRadius: tuning.cardRadius,
            visibility: showCardDom ? "visible" : "hidden",
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
      </div>
    </div>
  );
}

export type { PixelInfoCardProps, PixelInfoTheme };
