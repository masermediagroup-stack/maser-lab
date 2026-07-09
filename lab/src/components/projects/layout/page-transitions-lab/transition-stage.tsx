"use client";

import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { isWebGLAvailable } from "@/three/utils/capabilities";
import { DemoPageCard } from "./demo-page-card";
import { DestinationCurtains } from "./destination-curtains";
import { curtainMaxStaggerRank } from "./curtain-style";
import { PixelWormholeFallback } from "./pixel-wormhole-fallback";
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

const PixelWormholeScene = dynamic(
  () =>
    import("./pixel-wormhole-scene").then((mod) => mod.PixelWormholeScene),
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
  const isCurtain = selectedId === "curtain-fall";
  const isWormhole = selectedId === "pixel-wormhole";
  const isThree = isCurtain || isWormhole;
  const webgl = useWebGLSupport();
  const narrow = useIsNarrowViewport();
  const running = status === "running";
  // Curtain Fall: CSS strips on narrow (chunk timing). Wormhole: same Three look everywhere.
  const useThreeOverlay =
    webgl && (isWormhole || (isCurtain && !narrow));

  const [pathPlayKey, setPathPlayKey] = useState(playKey);
  const [pathCovered, setPathCovered] = useState(false);

  if (pathPlayKey !== playKey) {
    setPathPlayKey(playKey);
    setPathCovered(false);
  }

  useEffect(() => {
    if (!useThreeOverlay) return;
    if (isCurtain) void import("./curtain-fall-scene");
    if (isWormhole) void import("./pixel-wormhole-scene");
  }, [useThreeOverlay, isCurtain, isWormhole]);

  const phaseMs = reducedMotion ? 140 : settings.duration;
  const hold = reducedMotion ? 0 : holdMs;
  // Wormhole has float + suck + tunnel + emit + assemble (~2.4× duration)
  const wormholeExtra = isWormhole ? Math.round(phaseMs * 0.4) : 0;
  const totalMs = phaseMs * 2 + hold + wormholeExtra;

  useEffect(() => {
    if (!running) return;

    const coverCompleteMs = reducedMotion
      ? 90
      : isWormhole
        ? phaseMs
        : phaseMs +
          settings.stagger *
            curtainMaxStaggerRank(settings.curtains, settings.curtainFallIn);

    const timer = window.setTimeout(() => {
      setPathCovered(true);
    }, coverCompleteMs);

    return () => window.clearTimeout(timer);
  }, [
    running,
    playKey,
    isCurtain,
    isWormhole,
    settings.curtains,
    settings.stagger,
    settings.curtainFallIn,
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

        {isCurtain && running ? (
          <>
            {!pathCovered ? (
              <div
                key={`outgoing-curtain-${playKey}`}
                className="ptl-route-page ptl-route-page--outgoing"
              >
                <DemoPageCard sample={fromSample} variant="outgoing" />
              </div>
            ) : null}
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
                fallIn={settings.curtainFallIn}
                fallOut={settings.curtainFallOut}
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

        {isWormhole && running ? (
          <>
            {!pathCovered ? (
              <div
                key={`outgoing-wormhole-${playKey}`}
                className="ptl-route-page ptl-route-page--outgoing"
              >
                <DemoPageCard sample={fromSample} variant="outgoing" />
              </div>
            ) : null}
            {useThreeOverlay ? (
              <PixelWormholeScene
                key={`wormhole-gl-${playKey}`}
                settings={settings}
                playKey={playKey}
                reducedMotion={reducedMotion}
                running
                holdMs={hold}
                fromSample={fromSample}
                toSample={toSample}
              />
            ) : (
              <PixelWormholeFallback
                key={`wormhole-css-${playKey}`}
                durationMs={settings.duration}
                holdMs={hold}
                playKey={playKey}
                reducedMotion={reducedMotion}
                colorA={settings.pixelColorA}
                colorB={settings.pixelColorB}
                colorMode={settings.pixelColorMode}
              />
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
