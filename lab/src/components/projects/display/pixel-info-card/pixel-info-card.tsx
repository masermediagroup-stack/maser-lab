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
import { flushSync } from "react-dom";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlideTextAnimation } from "@/components/text-animations";
import {
  usePrefersReducedMotion,
  type AnimationPhase,
} from "@/components/text-animations/shared";
import {
  CARD_CONTENT_REVEAL_AT,
  CARD_MAX_WIDTH,
  CARD_MIN_HEIGHT,
  COLLAPSE_EXPAND_START,
  DEFAULT_TITLE,
  DEMO_BODY,
  GLIDE_BLUR_PX,
  GLIDE_DISTANCE_PX,
  GLIDE_TEXT_MS,
  PIC_DEFAULTS,
  SQUIRCLE_CHROME_REVEAL_AT,
  SQUIRCLE_ENTER_MIN_SCALE,
  SQUIRCLE_ENTER_Z_PX,
  TRIGGER_BLUR_MAX,
  TRIGGER_SIZE,
} from "./constants";
import { PixelAssembleCanvas } from "./pixel-assemble-canvas";
import {
  mergeTuning,
  usePixelInfoMachine,
} from "./use-pixel-info-machine";
import { PIC_SFX, playPicSfx } from "./sfx";
import type { PixelInfoCardProps, PixelInfoTheme } from "./types";
import "./tokens.css";

const GLIDE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)" as const;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function nextMotionSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff) + 1;
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
  scale: scaleProp = 1,
}: PixelInfoCardProps) {
  const scale = Math.max(1, Math.min(3, scaleProp));
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
    w: CARD_MAX_WIDTH * scale,
    h: CARD_MIN_HEIGHT * scale,
  });
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [motionSeed, setMotionSeed] = useState(nextMotionSeed);

  const triggerSize = TRIGGER_SIZE * scale;
  const pixelSize = Math.max(2, Math.round(tuning.pixelSize * scale));
  const cardRadius = tuning.cardRadius * scale;

  const { phase, progress, showCardDom, toggle, collapse } =
    machine;

  const [glidePhase, setGlidePhase] = useState<AnimationPhase>("in");
  const [glidePlayKey, setGlidePlayKey] = useState(0);
  /** True only after layout bump so GlideText never mounts then remounts one frame later. */
  const [glideReady, setGlideReady] = useState(false);
  const [holdingForTextOut, setHoldingForTextOut] = useState(false);
  const textOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCloseRef = useRef(false);
  const textStartedRef = useRef(false);

  const clearTextOutTimer = useCallback(() => {
    if (textOutTimerRef.current != null) {
      clearTimeout(textOutTimerRef.current);
      textOutTimerRef.current = null;
    }
    pendingCloseRef.current = false;
    setHoldingForTextOut(false);
  }, []);

  useEffect(() => () => clearTextOutTimer(), [clearTextOutTimer]);

  const contentReveal =
    phase === "expanded" ||
    (phase === "expanding" && progress >= CARD_CONTENT_REVEAL_AT);

  /**
   * Start GlideText as soon as the plate is solid enough — before assemble
   * fully ends — so the card never sits blank.
   */
  useLayoutEffect(() => {
    if (holdingForTextOut) return;

    if (phase === "idle" || phase === "collapsing") {
      textStartedRef.current = false;
      setGlideReady(false);
      clearTextOutTimer();
      return;
    }

    if (contentReveal && !textStartedRef.current) {
      textStartedRef.current = true;
      setGlidePhase("in");
      setGlidePlayKey((k) => k + 1);
      setGlideReady(true);
    }
  }, [phase, contentReveal, holdingForTextOut, clearTextOutTimer]);

  /** Close: GlideText out first, then pixel collapse (+ reassemble SFX, nudged ~25ms). */
  const beginPixelCollapse = useCallback(() => {
    window.setTimeout(() => {
      playPicSfx(PIC_SFX.collapse);
    }, 25);
    collapse();
  }, [collapse]);

  const requestClose = useCallback(() => {
    if (phase === "idle") return;
    if (phase === "collapsing") {
      collapse();
      return;
    }
    if (phase === "expanding") {
      // If copy already entered, play out first; otherwise dissolve immediately
      if (textStartedRef.current && glideReady && !pendingCloseRef.current) {
        pendingCloseRef.current = true;
        setHoldingForTextOut(true);
        setGlidePhase("out");
        setGlidePlayKey((k) => k + 1);
        textOutTimerRef.current = setTimeout(() => {
          textOutTimerRef.current = null;
          pendingCloseRef.current = false;
          setHoldingForTextOut(false);
          setGlideReady(false);
          textStartedRef.current = false;
          beginPixelCollapse();
        }, GLIDE_TEXT_MS);
        return;
      }
      clearTextOutTimer();
      setGlideReady(false);
      textStartedRef.current = false;
      beginPixelCollapse();
      return;
    }
    // expanded — exit copy immediately, then dissolve
    if (pendingCloseRef.current) return;
    if (reducedMotion) {
      beginPixelCollapse();
      return;
    }
    pendingCloseRef.current = true;
    setHoldingForTextOut(true);
    setGlideReady(true);
    setGlidePhase("out");
    setGlidePlayKey((k) => k + 1);
    textOutTimerRef.current = setTimeout(() => {
      textOutTimerRef.current = null;
      pendingCloseRef.current = false;
      setHoldingForTextOut(false);
      setGlideReady(false);
      textStartedRef.current = false;
      beginPixelCollapse();
    }, GLIDE_TEXT_MS);
  }, [
    phase,
    collapse,
    beginPixelCollapse,
    clearTextOutTimer,
    reducedMotion,
    glideReady,
  ]);

  const measureCardSize = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setCardSize({
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      });
    }
  }, []);

  useLayoutEffect(() => {
    measureCardSize();
  }, [measureCardSize, body, title, cardRadius, scale]);

  const requestToggle = useCallback(() => {
    if (phase === "expanded" || holdingForTextOut || contentReveal) {
      requestClose();
      return;
    }
    clearTextOutTimer();
    setGlideReady(false);
    textStartedRef.current = false;
    flushSync(measureCardSize);
    setMotionSeed(nextMotionSeed());
    playPicSfx(PIC_SFX.assemble);
    toggle();
  }, [
    phase,
    holdingForTextOut,
    contentReveal,
    requestClose,
    clearTextOutTimer,
    toggle,
    measureCardSize,
  ]);

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
    setCardSize({
      w: CARD_MAX_WIDTH * scale,
      h: CARD_MIN_HEIGHT * scale,
    });
  }, [scale]);

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
    if (phase === "idle" && !holdingForTextOut && !contentReveal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, holdingForTextOut, contentReveal, requestClose]);

  /**
   * After pixels vanish into the origin, the squircle comes toward the viewer
   * from that same point (scale + translateZ). Ease-out so it arrives promptly
   * without the ease-in-out hang at the vanishing point.
   */
  const collapseEnter = (() => {
    if (phase !== "collapsing") return 0;
    const collapseT = 1 - progress;
    if (collapseT < COLLAPSE_EXPAND_START) return 0;
    const expandSpan = Math.max(0.001, 1 - COLLAPSE_EXPAND_START);
    return easeOutCubic(
      clamp01((collapseT - COLLAPSE_EXPAND_START) / expandSpan),
    );
  })();

  const triggerSurfaceOpacity = (() => {
    if (reducedMotion) return phase === "idle" ? 1 : 0;
    if (phase === "idle") return 1;
    if (phase === "expanding" || phase === "expanded") {
      return Math.max(0, 1 - progress / 0.1);
    }
    if (phase === "collapsing") {
      return clamp01((collapseEnter - 0.04) / 0.28);
    }
    return 0;
  })();

  const triggerChromeOpacity = (() => {
    if (phase !== "collapsing") return triggerSurfaceOpacity;
    if (collapseEnter < SQUIRCLE_CHROME_REVEAL_AT) return 0;
    return easeOutCubic(
      (collapseEnter - SQUIRCLE_CHROME_REVEAL_AT) /
        (1 - SQUIRCLE_CHROME_REVEAL_AT),
    );
  })();

  const triggerScale = (() => {
    if (reducedMotion || phase !== "collapsing") return 1;
    if (collapseEnter <= 0) return SQUIRCLE_ENTER_MIN_SCALE;
    return (
      SQUIRCLE_ENTER_MIN_SCALE +
      (1 - SQUIRCLE_ENTER_MIN_SCALE) * collapseEnter
    );
  })();

  const triggerZ = (() => {
    if (reducedMotion || phase !== "collapsing") return 0;
    return -SQUIRCLE_ENTER_Z_PX * (1 - collapseEnter);
  })();

  const triggerBlur = (() => {
    if (reducedMotion || phase === "idle" || phase === "collapsing") return 0;
    return Math.min(
      TRIGGER_BLUR_MAX,
      (1 - triggerSurfaceOpacity) * TRIGGER_BLUR_MAX,
    );
  })();

  /** DOM card + copy as soon as the plate is solid enough. */
  const cardOpacity = (() => {
    if (reducedMotion) {
      return phase === "expanded" || phase === "expanding" ? 1 : 0;
    }
    if (holdingForTextOut || contentReveal) return 1;
    return 0;
  })();

  const cardVisible = showCardDom || holdingForTextOut || contentReveal;

  const pixelsActive =
    !reducedMotion &&
    (phase === "expanding" || phase === "collapsing") &&
    (phase === "collapsing" || progress > 0.01);

  const showGlide =
    ((contentReveal || holdingForTextOut) && glideReady) ||
    (reducedMotion && phase === "expanding");

  return (
    <div
      className={cn("pic-root", className)}
      data-theme={theme}
      data-phase={phase}
      data-scale={scale === 1 ? undefined : String(scale)}
      style={
        {
          ...themeVars(theme),
          ["--pic-scale" as string]: String(scale),
          ["--pic-card-radius" as string]: `${cardRadius}px`,
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
          pixelSize={pixelSize}
          pixelDensity={tuning.pixelDensity}
          cardRadius={cardRadius}
          cardWidth={cardSize.w}
          cardHeight={cardSize.h}
          triggerSize={triggerSize}
          originX={origin.x}
          originY={origin.y}
          motionSeed={motionSeed}
          domCardVisible={cardVisible && cardOpacity > 0.05}
        />

        <div
          className="pic-trigger-wrap"
          style={{
            opacity: Math.max(triggerSurfaceOpacity, triggerChromeOpacity),
            visibility:
              phase === "collapsing" &&
              triggerSurfaceOpacity < 0.02 &&
              triggerChromeOpacity < 0.02
                ? "hidden"
                : undefined,
            filter: triggerBlur > 0 ? `blur(${triggerBlur}px)` : undefined,
            pointerEvents:
              triggerSurfaceOpacity < 0.2 && triggerChromeOpacity < 0.2
                ? "none"
                : "auto",
            // Progress-driven opacity only — CSS transitions cause the “stop then play” stutter
            transition: "none",
          }}
          aria-hidden={triggerChromeOpacity < 0.2}
        >
          <button
            ref={triggerRef}
            type="button"
            className="pic-trigger"
            onClick={requestToggle}
            aria-expanded={phase !== "idle" || holdingForTextOut}
            aria-controls={titleId}
            aria-label="Show info"
          >
            <span
              ref={squircleRef}
              className="pic-squircle"
              style={{
                opacity: triggerSurfaceOpacity,
                transform:
                  phase === "collapsing"
                    ? `perspective(280px) translateZ(${triggerZ}px) scale(${triggerScale})`
                    : undefined,
                transformOrigin: "center center",
                transition: phase === "collapsing" ? "none" : undefined,
              }}
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
            cardVisible && "pic-card--visible",
            showGlide && "pic-card--settled",
          )}
          onClick={requestClose}
          aria-label="Hide info"
          tabIndex={cardVisible && cardOpacity > 0.05 ? 0 : -1}
          style={{
            opacity: cardOpacity,
            pointerEvents: cardOpacity > 0.5 ? "auto" : "none",
            borderRadius: cardRadius,
            visibility: cardVisible ? "visible" : "hidden",
          }}
        >
          <span className="pic-card-header">
            <Info
              className="pic-icon pic-icon--sm"
              aria-hidden
              strokeWidth={2.25}
            />
            {showGlide ? (
              <GlideTextAnimation
                key={`title-${glidePlayKey}-${glidePhase}`}
                text={title}
                playKey={glidePlayKey}
                phase={glidePhase}
                direction="bottom"
                glideDistance={GLIDE_DISTANCE_PX * scale}
                speed={GLIDE_TEXT_MS}
                stagger={0}
                blur={GLIDE_BLUR_PX}
                ease={GLIDE_EASE}
                compact
                className="pic-glide-title"
              />
            ) : (
              <span className="pic-card-title">{title}</span>
            )}
          </span>
          <span className="pic-card-body">
            {showGlide ? (
              <GlideTextAnimation
                key={`body-${glidePlayKey}-${glidePhase}`}
                text={body}
                playKey={glidePlayKey}
                phase={glidePhase}
                direction="bottom"
                glideDistance={GLIDE_DISTANCE_PX * scale}
                speed={GLIDE_TEXT_MS}
                stagger={0}
                blur={GLIDE_BLUR_PX}
                ease={GLIDE_EASE}
                compact
                className="pic-glide-body"
              />
            ) : (
              body
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

export type { PixelInfoCardProps, PixelInfoTheme };
