"use client";

import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { isWebGLAvailable } from "@/three/utils/capabilities";
import { DemoPageCard } from "./demo-page-card";
import { DestinationCurtains } from "./destination-curtains";
import type {
  PageSample,
  PreviewStatus,
  TransitionId,
  TransitionSettings,
} from "./types";

const CurtainFallScene = dynamic(
  () =>
    import("./curtain-fall-scene").then((mod) => mod.CurtainFallScene),
  { ssr: false },
);

type TransitionStageProps = {
  selectedId: TransitionId;
  settings: TransitionSettings;
  status: PreviewStatus;
  playKey: number;
  fromSample: PageSample;
  toSample: PageSample;
  reducedMotion: boolean;
  holdMs: number;
};

function useWebGLSupport() {
  return useSyncExternalStore(
    () => () => {},
    () => isWebGLAvailable(),
    () => false,
  );
}

function useIsNarrowViewport() {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const query = window.matchMedia("(max-width: 1023px)");
      query.addEventListener("change", onStoreChange);
      return () => query.removeEventListener("change", onStoreChange);
    },
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches,
    () => true,
  );
}

export function TransitionStage({
  selectedId,
  settings,
  status,
  playKey,
  fromSample,
  toSample,
  reducedMotion,
  holdMs,
}: TransitionStageProps) {
  const isThree = selectedId === "curtain-fall";
  const webgl = useWebGLSupport();
  const narrow = useIsNarrowViewport();
  const running = status === "running";
  const useThreeOverlay = isThree && webgl && !narrow;

  const [pathPlayKey, setPathPlayKey] = useState(playKey);
  const [pathCovered, setPathCovered] = useState(false);

  // Reset cover flag when a new play starts (render-time state adjust).
  if (pathPlayKey !== playKey) {
    setPathPlayKey(playKey);
    setPathCovered(false);
  }

  useEffect(() => {
    if (!useThreeOverlay) return;
    void import("./curtain-fall-scene");
  }, [useThreeOverlay]);

  const phaseMs = reducedMotion ? 140 : settings.duration;
  const hold = reducedMotion ? 0 : holdMs;
  const totalMs = phaseMs * 2 + hold;

  // Swap the browser-bar path only once the cover phase has sealed the stage
  // (after in duration + curtain stagger), not at play start.
  useEffect(() => {
    if (!running) return;

    const staggerTail =
      isThree && settings.curtains > 1
        ? settings.stagger * (settings.curtains - 1)
        : 0;
    const coverCompleteMs = reducedMotion ? 90 : phaseMs + staggerTail;

    const timer = window.setTimeout(() => {
      setPathCovered(true);
    }, coverCompleteMs);

    return () => window.clearTimeout(timer);
  }, [
    running,
    playKey,
    isThree,
    settings.curtains,
    settings.stagger,
    phaseMs,
    reducedMotion,
  ]);

  const barPath =
    running && pathCovered ? toSample.path : fromSample.path;

  const style = {
    "--ptl-duration": `${phaseMs}ms`,
    "--ptl-total": `${totalMs}ms`,
    "--ptl-hold": `${hold}ms`,
    "--ptl-intensity": settings.intensity,
    "--ptl-stagger": `${reducedMotion ? 0 : settings.stagger}ms`,
    "--ptl-radius": `${settings.radius}px`,
    "--ptl-curtains": settings.curtains,
    "--ptl-in-end": phaseMs / Math.max(totalMs, 1),
    "--ptl-hold-end": (phaseMs + hold) / Math.max(totalMs, 1),
  } as CSSProperties;

  return (
    <section
      className="ptl-stage"
      data-transition={selectedId}
      data-status={status}
      data-engine={isThree ? "three" : "css"}
      data-reduced={reducedMotion ? "true" : "false"}
      style={style}
      aria-label="Page transition preview stage"
    >
      <div className="ptl-browser-bar" aria-hidden="true">
        <span />
        <span />
        <span />
        <p>{barPath}</p>
      </div>

      <div className="ptl-route-frame">
        {/* Destination sits under cover layers so out-phase reveals it. */}
        <div className="ptl-route-page ptl-route-page--current">
          <DemoPageCard
            sample={running ? toSample : fromSample}
            variant={running ? "incoming" : "outgoing"}
          />
        </div>

        {running && !isThree ? (
          <div
            key={`outgoing-${playKey}`}
            className="ptl-route-page ptl-route-page--outgoing"
          >
            <DemoPageCard sample={fromSample} variant="outgoing" />
          </div>
        ) : null}

        {running && !isThree ? (
          <span
            key={`cover-${playKey}`}
            className="ptl-transition-cover"
            aria-hidden="true"
          />
        ) : null}

        {isThree && running ? (
          <>
            {/* Keep the from-page fully opaque until cover seals, then
                drop it so the out-phase reveals the destination only. */}
            {!pathCovered ? (
              <div
                key={`outgoing-curtain-${playKey}`}
                className="ptl-route-page ptl-route-page--outgoing"
              >
                <DemoPageCard sample={fromSample} variant="outgoing" />
              </div>
            ) : null}
            {/* CSS strips only when Three isn't driving — both at once
                reads as a double curtain set, especially with gradients. */}
            {!useThreeOverlay ? (
              <DestinationCurtains
                key={`dest-curtains-${playKey}`}
                count={settings.curtains}
                staggerMs={settings.stagger}
                durationMs={settings.duration}
                holdMs={hold}
                playKey={playKey}
                reducedMotion={reducedMotion}
                colorA={settings.curtainColorA}
                colorB={settings.curtainColorB}
                gradient={settings.curtainGradient}
              />
            ) : (
              <CurtainFallScene
                key={`curtain-gl-${playKey}`}
                settings={settings}
                playKey={playKey}
                reducedMotion={reducedMotion}
                running
                holdMs={hold}
              />
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
