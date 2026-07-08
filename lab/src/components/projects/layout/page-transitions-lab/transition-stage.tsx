"use client";

import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
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
  // Desktop-only Three overlay. Mobile uses CSS cover strips.
  const useThreeOverlay = isThree && webgl && !narrow;

  useEffect(() => {
    if (!useThreeOverlay) return;
    void import("./curtain-fall-scene");
  }, [useThreeOverlay]);

  const phaseMs = reducedMotion ? 140 : settings.duration;
  const hold = reducedMotion ? 0 : holdMs;
  // Total CSS timeline = in + hold + out (cover / page layers share this clock).
  const totalMs = phaseMs * 2 + hold;

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
        <p>{running ? toSample.path : fromSample.path}</p>
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
            <div
              key={`outgoing-curtain-${playKey}`}
              className="ptl-route-page ptl-route-page--outgoing"
            >
              <DemoPageCard sample={fromSample} variant="outgoing" />
            </div>
            <div className="ptl-curtain-dim" aria-hidden="true" />
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
            {useThreeOverlay ? (
              <CurtainFallScene
                key={`curtain-gl-${playKey}`}
                settings={settings}
                playKey={playKey}
                reducedMotion={reducedMotion}
                running
                holdMs={hold}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
