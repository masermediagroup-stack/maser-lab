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
}: TransitionStageProps) {
  const isThree = selectedId === "curtain-fall";
  const webgl = useWebGLSupport();
  const narrow = useIsNarrowViewport();
  const running = status === "running";
  // Desktop-only Three overlay. Mobile uses destination-painted CSS strips so
  // a display:none / 0×0 WebGL host cannot crash the page mid-play.
  const useThreeOverlay = isThree && webgl && !narrow;

  // Warm the Three.js chunk on desktop as soon as Curtain Fall is open.
  useEffect(() => {
    if (!useThreeOverlay) return;
    void import("./curtain-fall-scene");
  }, [useThreeOverlay]);

  const style = {
    "--ptl-duration": `${reducedMotion ? 140 : settings.duration}ms`,
    "--ptl-intensity": settings.intensity,
    "--ptl-stagger": `${reducedMotion ? 0 : settings.stagger}ms`,
    "--ptl-radius": `${settings.radius}px`,
    "--ptl-curtains": settings.curtains,
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
        <div className="ptl-route-page ptl-route-page--current">
          <DemoPageCard sample={fromSample} variant="outgoing" />
        </div>

        {running && !isThree ? (
          <div
            key={`incoming-${playKey}`}
            className="ptl-route-page ptl-route-page--incoming"
          >
            <DemoPageCard sample={toSample} variant="incoming" />
          </div>
        ) : null}

        {running && !isThree ? (
          <span
            key={`cover-${playKey}`}
            className="ptl-transition-cover"
            aria-hidden="true"
          />
        ) : null}

        {/* Curtain Fall: destination-painted CSS strips are the reliable
            visible path (especially mobile). Three.js overlays when ready. */}
        {isThree && running ? (
          <>
            <div className="ptl-curtain-dim" aria-hidden="true" />
            <DestinationCurtains
              key={`dest-curtains-${playKey}`}
              sample={toSample}
              count={settings.curtains}
              staggerMs={settings.stagger}
              durationMs={settings.duration}
              playKey={playKey}
              reducedMotion={reducedMotion}
            />
            {useThreeOverlay ? (
              <CurtainFallScene
                key={`curtain-gl-${playKey}`}
                toSample={toSample}
                settings={settings}
                playKey={playKey}
                reducedMotion={reducedMotion}
                running
              />
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
