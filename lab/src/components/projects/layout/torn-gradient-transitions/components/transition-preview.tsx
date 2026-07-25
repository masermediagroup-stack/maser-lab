"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { useTornTransition } from "../hooks/use-torn-transition";
import type { PerformanceStore } from "../lib/performance-store";
import { ORIGIN_DIRECTIONS } from "../lib/transition-state-machine";
import type {
  QualityMode,
  TornTransitionSettings,
  TransitionDirection,
  TransitionOrigin,
} from "../lib/transition-types";
import { DEMO_PAGES } from "./demo-pages";
import { TornTransitionLink } from "./torn-transition-link";
import { TornTransitionProvider } from "./torn-transition-provider";

export type PreviewController = {
  go: (index: number, direction?: TransitionDirection) => void;
  step: (delta: number) => void;
  replay: () => void;
};

type PreviewProps = {
  settings: TornTransitionSettings;
  quality: QualityMode;
  paused: boolean;
  hold: { lead: number; trail: number } | null;
  page: number;
  onPageChange: (index: number) => void;
  origin: TransitionOrigin;
  onOriginChange: (origin: TransitionOrigin) => void;
  perfStore: PerformanceStore;
  reducedMotion?: boolean;
  controllerRef: RefObject<PreviewController | null>;
};

const SWIPE_THRESHOLD = 48;

export function TransitionPreview(props: PreviewProps) {
  return (
    <TornTransitionProvider
      mode="contained"
      settings={props.settings}
      quality={props.quality}
      paused={props.paused}
      hold={props.hold}
      origin={props.origin}
      reducedMotion={props.reducedMotion}
      perfStore={props.perfStore}
      className="tgt-preview"
    >
      <PreviewStage {...props} />
    </TornTransitionProvider>
  );
}

function PreviewStage({
  settings,
  page,
  onPageChange,
  origin,
  onOriginChange,
  controllerRef,
}: PreviewProps) {
  const { startTransition, phase, reducedMotion, webglSupported } =
    useTornTransition();

  const swipeRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const draggingOrigin = useRef(false);

  const go = useCallback(
    (index: number, direction?: TransitionDirection) => {
      const target = (index + DEMO_PAGES.length) % DEMO_PAGES.length;
      if (target === page) return;
      startTransition({
        direction,
        onCovered: () => onPageChange(target),
      });
    },
    [onPageChange, page, startTransition],
  );

  const step = useCallback(
    (delta: number) => {
      // Forward moves left-to-right, back moves right-to-left, so the motion
      // always agrees with the direction of travel through the set.
      const dir: TransitionDirection = delta > 0 ? "left-right" : "right-left";
      go(page + delta, dir);
    },
    [go, page],
  );

  const replay = useCallback(() => {
    startTransition({ onCovered: () => {} });
  }, [startTransition]);

  useEffect(() => {
    controllerRef.current = { go, step, replay };
    return () => {
      controllerRef.current = null;
    };
  }, [controllerRef, go, replay, step]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
    },
    [step],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (draggingOrigin.current) return;
      swipeRef.current = {
        x: event.clientX,
        y: event.clientY,
        id: event.pointerId,
      };
    },
    [],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const start = swipeRef.current;
      swipeRef.current = null;
      if (!start || start.id !== event.pointerId) return;

      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.4) {
        return;
      }
      step(dx < 0 ? 1 : -1);
    },
    [step],
  );

  const showOrigin = ORIGIN_DIRECTIONS.includes(settings.direction);

  const handleOriginDrag = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const stage = stageRef.current;
      if (!stage) return;
      draggingOrigin.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);

      const move = (clientX: number, clientY: number) => {
        const rect = stage.getBoundingClientRect();
        onOriginChange({
          x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
          y: Math.min(1, Math.max(0, 1 - (clientY - rect.top) / rect.height)),
        });
      };

      const onMove = (e: PointerEvent) => move(e.clientX, e.clientY);
      const onUp = () => {
        draggingOrigin.current = false;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [onOriginChange],
  );

  const nudgeOrigin = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const map: Record<string, [number, number]> = {
        ArrowLeft: [-0.04, 0],
        ArrowRight: [0.04, 0],
        ArrowUp: [0, 0.04],
        ArrowDown: [0, -0.04],
      };
      const delta = map[event.key];
      if (!delta) return;
      event.preventDefault();
      event.stopPropagation();
      onOriginChange({
        x: Math.min(1, Math.max(0, origin.x + delta[0])),
        y: Math.min(1, Math.max(0, origin.y + delta[1])),
      });
    },
    [onOriginChange, origin],
  );

  const current = DEMO_PAGES[page] ?? DEMO_PAGES[0];

  return (
    <div
      ref={stageRef}
      className="tgt-stage"
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        swipeRef.current = null;
      }}
    >
      <nav className="tgt-nav" aria-label="Demo pages">
        {DEMO_PAGES.map((demo, index) => (
          <TornTransitionLink
            key={demo.id}
            href={`#${demo.id}`}
            className="tgt-nav__link"
            aria-current={index === page ? "page" : undefined}
            focusTargetId="tgt-page-region"
            originFromPointer
            onNavigate={() => onPageChange(index)}
          >
            {demo.label}
          </TornTransitionLink>
        ))}
      </nav>

      <div
        id="tgt-page-region"
        className="tgt-stage__content"
        tabIndex={-1}
        role="region"
        aria-label={`Demo page: ${current.title}`}
      >
        {current.render()}
      </div>

      <div className="tgt-stage__foot">
        <button
          type="button"
          className="tgt-step"
          onClick={() => step(-1)}
          aria-label="Previous demo page"
        >
          ←
        </button>
        <p className="tgt-stage__status" aria-live="polite">
          {page + 1} / {DEMO_PAGES.length} · {current.title}
          {reducedMotion ? " · reduced motion" : null}
          {!webglSupported ? " · WebGL unavailable" : null}
        </p>
        <button
          type="button"
          className="tgt-step"
          onClick={() => step(1)}
          aria-label="Next demo page"
        >
          →
        </button>
      </div>

      {showOrigin ? (
        <button
          type="button"
          className="tgt-origin"
          style={{
            left: `${origin.x * 100}%`,
            top: `${(1 - origin.y) * 100}%`,
          }}
          onPointerDown={handleOriginDrag}
          onKeyDown={nudgeOrigin}
          aria-label={`Transition origin, ${Math.round(origin.x * 100)} percent across, ${Math.round(origin.y * 100)} percent up. Drag or use arrow keys.`}
        >
          <span aria-hidden />
        </button>
      ) : null}

      <span className="tgt-stage__phase" aria-hidden>
        {phase}
      </span>
    </div>
  );
}
