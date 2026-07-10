"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState, useSyncExternalStore } from "react";
import { Leva, levaStore } from "leva";
import { ThreeCanvas } from "@/three/components/three-canvas";
import { StaticFallback } from "@/three/fallbacks/static-fallback";
import { MotionModeSelector } from "./components/MotionModeSelector";
import { KineticBarsControls } from "./components/KineticBarsControls";
import { ExportCodeDrawer } from "./components/ExportCodeDrawer";
import {
  DEFAULT_PARAMS,
  PROJECT_DESCRIPTION,
  PROJECT_TITLE,
  SR_DESCRIPTION,
} from "./lib/constants";
import type { KineticBarsParams, MotionMode } from "./types/kinetic-bars";
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

export function KineticBarsApp() {
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
  const [params, setParams] = useState<KineticBarsParams>(DEFAULT_PARAMS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const patchParams = useCallback((patch: Partial<KineticBarsParams>) => {
    setParams((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleMode = useCallback((mode: MotionMode) => {
    setParams((prev) => ({ ...prev, animationMode: mode }));
    levaStore.set({ animationMode: mode }, false);
  }, []);

  const handleReset = useCallback(() => {
    setParams((prev) => ({
      ...DEFAULT_PARAMS,
      animationMode: prev.animationMode,
    }));
    window.dispatchEvent(new Event("kinetic-bars:reset"));
  }, []);

  const togglePause = useCallback(() => {
    setParams((prev) => {
      const paused = !prev.paused;
      levaStore.set({ paused }, false);
      return { ...prev, paused };
    });
  }, []);

  // Derive responsive framing without mutating control state.
  const framedParams: KineticBarsParams = {
    ...params,
    groupScale: params.groupScale * (narrow ? 0.78 : 1),
    cameraZoom: params.cameraZoom * (narrow ? 0.92 : 1),
  };

  return (
    <div className="kinetic-bars-demo">
      <p className="kinetic-bars-demo__sr">{SR_DESCRIPTION}</p>

      <div className="kinetic-bars-demo__stage" aria-hidden={false}>
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
          <KineticBarsScene
            params={framedParams}
            reducedMotion={systemReduced}
          />
        </ThreeCanvas>
      </div>

      <div className="kinetic-bars-demo__chrome">
        <div className="kinetic-bars-demo__top">
          <div className="kinetic-bars-demo__brand">
            <Link href="/" className="kinetic-bars-demo__back">
              ← Maser-Lab
            </Link>
            <h1 className="kinetic-bars-demo__title">{PROJECT_TITLE}</h1>
            <p className="kinetic-bars-demo__desc">{PROJECT_DESCRIPTION}</p>
          </div>

          <div className="kinetic-bars-demo__actions">
            <button
              type="button"
              className="kinetic-bars-demo__icon-btn"
              aria-label={params.paused ? "Play animation" : "Pause animation"}
              onClick={togglePause}
            >
              {params.paused ? "Play" : "Pause"}
            </button>
            <button
              type="button"
              className="kinetic-bars-demo__icon-btn"
              aria-label="Reset sculpture"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              type="button"
              className="kinetic-bars-demo__icon-btn"
              aria-label="Toggle settings panel"
              aria-pressed={settingsOpen}
              onClick={() => setSettingsOpen((v) => !v)}
            >
              Settings
            </button>
            <button
              type="button"
              className="kinetic-bars-demo__icon-btn"
              aria-label="Export code"
              onClick={() => setExportOpen(true)}
            >
              Export
            </button>
          </div>
        </div>

        <div />

        <div className="kinetic-bars-demo__bottom">
          <MotionModeSelector
            value={params.animationMode}
            onChange={handleMode}
            disabled={systemReduced && !params.reducedMotionPreview}
          />
        </div>
      </div>

      <KineticBarsControls onChange={patchParams} onReset={handleReset} />

      <Leva
        hidden={!settingsOpen}
        collapsed={narrow}
        titleBar={{ title: "Kinetic Bars", filter: false }}
        theme={{
          sizes: { rootWidth: "300px" },
          colors: {
            elevation1: "#0c0c0e",
            elevation2: "#121216",
            elevation3: "#1a1a20",
            accent1: "#c8c8d0",
            accent2: "#a8a8b4",
            accent3: "#888894",
            highlight1: "#e8e8ec",
            highlight2: "#c8c8d0",
            highlight3: "#a0a0aa",
            vivid1: "#d0d0d8",
          },
        }}
      />

      <ExportCodeDrawer
        open={exportOpen}
        onOpenChange={setExportOpen}
        params={params}
      />
    </div>
  );
}
