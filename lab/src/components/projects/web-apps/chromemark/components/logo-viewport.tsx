"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { ThreeCanvas } from "@/three/components/three-canvas";
import { StaticFallback } from "@/three/fallbacks/static-fallback";
import type { CameraSettings, ChromeMarkSettings } from "../types";
import { ChromeEngine } from "../renderer/chrome-engine";

type LogoViewportProps = {
  settings: ChromeMarkSettings;
  reducedMotion: boolean;
  dragging: boolean;
  hasLogo: boolean;
  engineRef: MutableRefObject<ChromeEngine | null>;
  onEngineReady: (engine: ChromeEngine) => void;
  onCameraChange: (camera: CameraSettings) => void;
  onDropFile: (file: File) => void;
};

export function LogoViewport({
  settings,
  reducedMotion,
  dragging,
  hasLogo,
  engineRef,
  onEngineReady,
  onCameraChange,
  onDropFile,
}: LogoViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const backdropClass = `chromemark-backdrop-${settings.previewBackdrop}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const engine = new ChromeEngine();
    engine.onCameraChange = onCameraChange;
    engine.attach(container);
    engineRef.current = engine;
    onEngineReady(engine);
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
    // Mount once; settings stream in via setSettings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setReducedMotion(reducedMotion);
  }, [engineRef, reducedMotion]);

  useEffect(() => {
    engineRef.current?.setSettings(settings);
  }, [engineRef, settings]);

  return (
    <ThreeCanvas
      className="chromemark-viewport"
      fallback={
        <StaticFallback
          title="WebGL unavailable"
          description="ChromeMark needs WebGL to extrude and render chrome logos."
        />
      }
    >
      <div
        className={`chromemark-viewport-host ${backdropClass}${dragging ? " chromemark-drop" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) onDropFile(file);
        }}
      >
        <div ref={containerRef} className="chromemark-canvas-slot" />
        {!hasLogo ? (
          <div className="chromemark-empty">
            <div className="chromemark-empty-card">
              <h2>Drop an SVG or PNG</h2>
              <p>
                Filled or stroked SVG paths become real extruded chrome.
                Transparent PNGs are traced into silhouettes. Preview
                backgrounds never enter PNG or WebM; MP4 uses the Export ground.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </ThreeCanvas>
  );
}
