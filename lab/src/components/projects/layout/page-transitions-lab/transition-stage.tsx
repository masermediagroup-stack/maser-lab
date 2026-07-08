"use client";

import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { isWebGLAvailable } from "@/three/utils/capabilities";
import { DemoPageCard } from "./demo-page-card";
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
    () => true,
  );
}

function CssCurtainFallback({
  count,
  staggerMs,
}: {
  count: number;
  staggerMs: number;
}) {
  const strips = Math.max(3, Math.min(16, Math.round(count)));
  return (
    <div className="ptl-curtain-fallback" aria-hidden="true">
      {Array.from({ length: strips }, (_, index) => (
        <span
          key={index}
          style={{ animationDelay: `${index * staggerMs}ms` } as CSSProperties}
        />
      ))}
    </div>
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
        <p>{status === "running" ? toSample.path : fromSample.path}</p>
      </div>

      <div className="ptl-route-frame">
        <div className="ptl-route-page ptl-route-page--current">
          <DemoPageCard sample={fromSample} variant="outgoing" />
        </div>

        {status === "running" && !isThree ? (
          <div
            key={`incoming-${playKey}`}
            className="ptl-route-page ptl-route-page--incoming"
          >
            <DemoPageCard sample={toSample} variant="incoming" />
          </div>
        ) : null}

        {status === "running" && !isThree ? (
          <span
            key={`cover-${playKey}`}
            className="ptl-transition-cover"
            aria-hidden="true"
          />
        ) : null}

        {isThree && status === "running" ? (
          <>
            <div className="ptl-curtain-dim" aria-hidden="true" />
            {webgl ? (
              <CurtainFallScene
                key={`curtain-${playKey}`}
                toSample={toSample}
                settings={settings}
                playKey={playKey}
                reducedMotion={reducedMotion}
                running
              />
            ) : (
              <CssCurtainFallback
                key={`curtain-css-${playKey}`}
                count={settings.curtains}
                staggerMs={reducedMotion ? 0 : settings.stagger}
              />
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
