"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_SETTINGS } from "./defaults";
import { ChromeEngine } from "./renderer/chrome-engine";
import { prefersReducedMotion } from "@/three/utils/capabilities";
import { exportStillPng } from "./renderer/export-still";
import {
  exportPngSequence,
  zipSequenceFiles,
} from "./renderer/export-sequence";
import {
  detectAlphaWebMSupport,
  exportTransparentWebM,
} from "./renderer/export-webm";
import type {
  CameraSettings,
  ChromeMarkAppProps,
  ChromeMarkSettings,
  LogoInfo,
  ViewPresetId,
} from "./types";
import { LogoLoadError } from "./types";
import { ControlPanel } from "./components/control-panel";
import { ExportModal } from "./components/export-modal";
import { LogoUploader } from "./components/logo-uploader";
import { LogoViewport } from "./components/logo-viewport";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import "./tokens.css";

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function ChromeMarkApp({ forceReducedMotion = false }: ChromeMarkAppProps) {
  const engineRef = useRef<ChromeEngine | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [settings, setSettings] = useState<ChromeMarkSettings>(DEFAULT_SETTINGS);
  const [logo, setLogo] = useState<LogoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [webmSupported, setWebmSupported] = useState<boolean | null>(null);
  const [osReducedMotion, setOsReducedMotion] = useState(false);
  const [exportState, setExportState] = useState<{
    open: boolean;
    title: string;
    message: string;
    current?: number;
    total?: number;
    ready?: boolean;
    blob?: Blob;
    filename?: string;
  }>({ open: false, title: "", message: "" });

  useEffect(() => {
    void detectAlphaWebMSupport().then((result) => {
      setWebmSupported(result.supported);
    });
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setOsReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const reducedMotion = forceReducedMotion || osReducedMotion || prefersReducedMotion();

  const handleError = (err: unknown) => {
    if (err instanceof LogoLoadError) {
      setError(err.message);
      return;
    }
    if (err instanceof Error) {
      setError(err.message);
      return;
    }
    setError("Something went wrong.");
  };

  const handleFile = useCallback(async (file: File) => {
    const engine = engineRef.current;
    if (!engine) return;
    setBusy(true);
    setError(null);
    try {
      const info = await engine.loadFile(file);
      setLogo(info);
      const fitted = engine.fitLogo();
      setSettings((prev) => ({ ...prev, camera: fitted }));
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  }, []);

  const handleCameraChange = useCallback((camera: CameraSettings) => {
    setSettings((prev) => ({ ...prev, camera }));
  }, []);

  const handleViewPreset = (preset: ViewPresetId) => {
    const camera = engineRef.current?.applyViewPreset(preset);
    if (camera) setSettings((prev) => ({ ...prev, camera }));
  };

  const handleFit = () => {
    const camera = engineRef.current?.fitLogo();
    if (camera) setSettings((prev) => ({ ...prev, camera }));
  };

  const handleStill = async () => {
    const engine = engineRef.current;
    if (!engine || !logo) return;
    setError(null);
    try {
      const blob = await engine.withExportGeometry(() =>
        exportStillPng({
          renderer: engine.renderer,
          scene: engine.scene,
          camera: engine.camera,
          width: settings.export.width,
          height: settings.export.height,
        }),
      );
      downloadBlob(blob, "chromemark-logo.png");
    } catch (err) {
      handleError(err);
    }
  };

  const handleSequence = async () => {
    const engine = engineRef.current;
    if (!engine || !logo) return;
    const abort = new AbortController();
    abortRef.current = abort;
    setExportState({
      open: true,
      title: "Rendering sequence",
      message: "Deterministic transparent PNG frames.",
      current: 0,
      total: Math.round(settings.export.sequenceFps * settings.export.sequenceDuration),
    });
    try {
      const start = engine.getOrientation();
      const result = await engine.withExportGeometry(() =>
        exportPngSequence({
          renderer: engine.renderer,
          scene: engine.scene,
          camera: engine.camera,
          settings,
          start,
          signal: abort.signal,
          setOrientation: (q) => engine.setOrientation(q),
          onProgress: ({ current, total }) => {
            setExportState((prev) => ({
              ...prev,
              current,
              total,
              message: `Rendering ${current} / ${total} frames`,
            }));
          },
        }),
      );
      const blob = await zipSequenceFiles(result.files, result.settingsJson);
      setExportState({
        open: true,
        title: "Sequence ready",
        message: `${result.frameCount} transparent PNG frames ready`,
        current: result.frameCount,
        total: result.frameCount,
        ready: true,
        blob,
        filename: "chromemark-sequence.zip",
      });
    } catch (err) {
      setExportState({ open: false, title: "", message: "" });
      handleError(err);
    }
  };

  const handleWebM = async () => {
    const engine = engineRef.current;
    if (!engine || !logo) return;
    if (webmSupported === false) {
      setError(
        "Transparent WebM isn't supported by this browser. Export a PNG sequence instead.",
      );
      return;
    }
    const abort = new AbortController();
    abortRef.current = abort;
    const total = Math.round(
      settings.export.sequenceFps * settings.export.sequenceDuration,
    );
    setExportState({
      open: true,
      title: "Rendering WebM",
      message: "Encoding transparent video…",
      current: 0,
      total,
    });
    try {
      const start = engine.getOrientation();
      const frames: Blob[] = [];
      const result = await engine.withExportGeometry(() =>
        exportPngSequence({
          renderer: engine.renderer,
          scene: engine.scene,
          camera: engine.camera,
          settings,
          start,
          signal: abort.signal,
          setOrientation: (q) => engine.setOrientation(q),
          onProgress: ({ current, total: t }) => {
            setExportState((prev) => ({
              ...prev,
              current,
              total: t,
              message: `Frame ${current} / ${t}`,
            }));
          },
        }),
      );
      for (const bytes of Object.values(result.files)) {
        frames.push(new Blob([bytes.buffer as ArrayBuffer], { type: "image/png" }));
      }
      const blob = await exportTransparentWebM({
        width: settings.export.width,
        height: settings.export.height,
        fps: settings.export.sequenceFps,
        duration: settings.export.sequenceDuration,
        frames,
        signal: abort.signal,
      });
      downloadBlob(blob, "chromemark-logo.webm");
      setExportState({ open: false, title: "", message: "" });
    } catch (err) {
      setExportState({ open: false, title: "", message: "" });
      handleError(err);
    }
  };

  const panel = (
    <ControlPanel
      settings={settings}
      logo={logo}
      webmSupported={webmSupported}
      error={error}
      onSettings={setSettings}
      onViewPreset={handleViewPreset}
      onFit={handleFit}
      onStill={() => void handleStill()}
      onSequence={() => void handleSequence()}
      onWebM={() => void handleWebM()}
    />
  );

  return (
    <div
      className="chromemark-app"
      aria-label="ChromeMark chrome logo renderer"
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
      onDrop={() => setDragging(false)}
    >
      <div className="chromemark-shell">
        <div className="chromemark-stage">
          <LogoUploader
            logo={logo}
            busy={busy}
            onFile={(file) => void handleFile(file)}
            onReset={() => {
              setSettings(DEFAULT_SETTINGS);
              engineRef.current?.resetInteraction();
              engineRef.current?.setSettings(DEFAULT_SETTINGS);
            }}
          />
          <LogoViewport
            settings={settings}
            reducedMotion={reducedMotion}
            dragging={dragging}
            hasLogo={Boolean(logo)}
            engineRef={engineRef}
            onEngineReady={(engine) => {
              engine.setReducedMotion(reducedMotion);
              engine.setSettings(settings);
            }}
            onCameraChange={handleCameraChange}
            onDropFile={(file) => void handleFile(file)}
          />
          <div className="chromemark-mobile-bar">
            <button
              type="button"
              className="chromemark-btn"
              onClick={() => setSheetOpen(true)}
            >
              Controls
            </button>
          </div>
        </div>
        <aside className="chromemark-panel chromemark-desktop-panel">{panel}</aside>
      </div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="chromemark-app h-[min(80dvh,40rem)] bg-[var(--chromemark-panel)] p-0"
        >
          <SheetHeader>
            <SheetTitle>ChromeMark controls</SheetTitle>
          </SheetHeader>
          <div className="chromemark-panel chromemark-sheet-panel">
            {panel}
          </div>
        </SheetContent>
      </Sheet>
      <ExportModal
        open={exportState.open}
        title={exportState.title}
        message={exportState.message}
        current={exportState.current}
        total={exportState.total}
        ready={exportState.ready}
        onCancel={() => {
          abortRef.current?.abort();
          setExportState({ open: false, title: "", message: "" });
        }}
        onDownload={() => {
          if (exportState.blob && exportState.filename) {
            downloadBlob(exportState.blob, exportState.filename);
          }
        }}
      />
    </div>
  );
}
