"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { ThreeCanvas } from "@/three/components/three-canvas";
import { StaticFallback } from "@/three/fallbacks/static-fallback";
import { DEFAULT_PARAMS, SR_DESCRIPTION } from "./lib/constants";
import type { KineticBarsParams } from "./types/kinetic-bars";
import "./tokens.css";

const KineticBarsScene = dynamic(
  () =>
    import("./components/KineticBarsScene").then((m) => m.KineticBarsScene),
  { ssr: false },
);

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeNarrow(onStoreChange: () => void) {
  const mq = window.matchMedia("(max-width: 900px)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getNarrowSnapshot() {
  return window.matchMedia("(max-width: 900px)").matches;
}

type KineticBarsAppProps = {
  params?: KineticBarsParams;
  forceReducedMotion?: boolean;
};

export function KineticBarsApp({
  params = DEFAULT_PARAMS,
  forceReducedMotion,
}: KineticBarsAppProps) {
  const systemReduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
  const narrow = useSyncExternalStore(
    subscribeNarrow,
    getNarrowSnapshot,
    () => false,
  );
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const framedParams: KineticBarsParams = {
    ...params,
    groupScale: params.groupScale * (narrow ? 0.78 : 1),
    cameraZoom: params.cameraZoom * (narrow ? 0.92 : 1),
  };

  const reduced = forceReducedMotion ?? systemReduced;

  return (
    <div className="kinetic-bars-demo">
      <p className="kinetic-bars-demo__sr">{SR_DESCRIPTION}</p>
      <div className="kinetic-bars-demo__stage" aria-hidden={false}>
        {mounted ? (
          <ThreeCanvas
            fallback={
              <div className="kinetic-bars-demo__fallback">
                <StaticFallback
                  title="Kinetic sculpture unavailable"
                  description="WebGL is required for this motion study. A static description is provided for assistive technology."
                />
              </div>
            }
          >
            <KineticBarsScene params={framedParams} reducedMotion={reduced} />
          </ThreeCanvas>
        ) : (
          <div className="h-full w-full bg-[var(--kb-bg)]" aria-hidden />
        )}
      </div>
    </div>
  );
}
