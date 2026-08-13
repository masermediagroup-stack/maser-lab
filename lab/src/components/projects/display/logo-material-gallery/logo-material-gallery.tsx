"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { StaticFallback } from "@/three/fallbacks/static-fallback";
import { isWebGLAvailable } from "@/three/utils/capabilities";
import {
  DEFAULT_STUDIO_PARAMS,
  MATERIAL_LABEL,
  MATERIAL_ORDER,
} from "./constants";
import { StudioPanel } from "./components/studio-panel";
import type { LogoGalleryEngine } from "./scene/logo-gallery-engine";
import type {
  GalleryMode,
  LogoMaterialGalleryProps,
  MaterialId,
  StudioParams,
} from "./types";
import "./tokens.css";

const GalleryCanvas = dynamic(
  () =>
    import("./components/gallery-canvas").then((mod) => mod.GalleryCanvas),
  { ssr: false },
);

export type LogoMaterialGalleryAppProps = LogoMaterialGalleryProps & {
  headerStart?: ReactNode;
  headerEnd?: ReactNode;
};

function padIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function LogoMaterialGallery({
  reducedMotion = false,
  className = "",
  headerStart,
  headerEnd,
}: LogoMaterialGalleryAppProps) {
  const labelId = useId();
  const engineRef = useRef<LogoGalleryEngine | null>(null);
  const stageRefs = useRef<Partial<Record<MaterialId, HTMLElement | null>>>({});
  const studioStageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [mode, setMode] = useState<GalleryMode>("gallery");
  const [material, setMaterial] = useState<MaterialId>("gold");
  const [params, setParams] = useState<StudioParams>(DEFAULT_STUDIO_PARAMS);
  const [exporting, setExporting] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const [engineVersion, setEngineVersion] = useState(0);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  const title =
    mode === "studio" ? MATERIAL_LABEL[material] : "Material gallery";

  const handleEngine = useCallback((engine: LogoGalleryEngine | null) => {
    engineRef.current = engine;
    setEngineVersion((value) => value + 1);
  }, []);

  const syncEngine = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setReducedMotion(reducedMotion);
    engine.setStudioMaterial(material);
    engine.setParams(params);
    engine.setMode(mode);
    engine.setStudioElement(studioStageRef.current);
    engine.setGalleryTargets(
      MATERIAL_ORDER.flatMap((id) => {
        const element = stageRefs.current[id];
        return element ? [{ id, element }] : [];
      }),
    );
  }, [material, mode, params, reducedMotion]);

  useLayoutEffect(() => {
    syncEngine();
  }, [syncEngine, engineVersion]);

  useEffect(() => {
    const onResize = () => syncEngine();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [syncEngine]);

  useEffect(() => {
    if (mode !== "studio") return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMode("gallery");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  const openStudio = (id: MaterialId) => {
    setMaterial(id);
    setMode("studio");
    setLiveMessage(`${MATERIAL_LABEL[id]} studio`);
  };

  const closeStudio = () => {
    setMode("gallery");
    setLiveMessage("Material gallery");
  };

  const patchParams = (patch: Partial<StudioParams>) => {
    setParams((prev) => ({ ...prev, ...patch }));
  };

  const handleExport = async () => {
    const engine = engineRef.current;
    if (!engine) return;
    setExporting(true);
    setLiveMessage("Exporting png");
    try {
      const blob = await engine.exportPng();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const slug = MATERIAL_LABEL[material].toLowerCase().replace(/\s+/g, "-");
      anchor.href = url;
      anchor.download = `maser-logo-${slug}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      setLiveMessage(`Saved maser-logo-${slug}.png`);
    } catch {
      setLiveMessage("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    setParams({ ...DEFAULT_STUDIO_PARAMS });
    setLiveMessage("Studio reset");
  };

  useEffect(() => {
    setWebgl(isWebGLAvailable());
  }, []);

  const fallback = useMemo(
    () => (
      <div className="lmg-gallery lmg-fallback-grid">
        <div className="lmg-grid">
          {MATERIAL_ORDER.map((id, index) => (
            <figure key={id} className="lmg-card">
              <div className="lmg-stage">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/maser-mm-mark.svg"
                  alt=""
                  className="lmg-fallback-mark"
                />
              </div>
              <figcaption className="lmg-caption">
                <span className="lmg-index">{padIndex(index)}</span>
                <span className="lmg-name">{MATERIAL_LABEL[id]}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <StaticFallback
          title="WebGL required"
          description="This gallery needs WebGL to render the 3D mark and export a transparent PNG."
        />
      </div>
    ),
    [],
  );

  return (
    <div
      className={`lmg${reducedMotion ? " is-reduced" : ""}${className ? ` ${className}` : ""}`}
      aria-labelledby={labelId}
    >
      <p className="lmg-sr" id={labelId}>
        Maser logo material gallery. Six procedural materials. Click a work to
        inspect and export a transparent PNG.
      </p>
      <p className="lmg-live" aria-live="polite">
        {liveMessage}
      </p>

      <header className="lmg-header">
        <div className="lmg-header-start">
          {mode === "studio" ? (
            <button
              ref={closeRef}
              type="button"
              className="lmg-back"
              onClick={closeStudio}
            >
              ← Gallery
            </button>
          ) : (
            headerStart
          )}
        </div>
        <h1 className="lmg-title">{title}</h1>
        <div className="lmg-header-end">{headerEnd}</div>
      </header>

      {webgl === false ? (
        fallback
      ) : (
        <>
          {webgl === true ? <GalleryCanvas onEngine={handleEngine} /> : null}

          {mode === "gallery" ? (
            <div className="lmg-gallery">
              <div className="lmg-grid">
                {MATERIAL_ORDER.map((id, index) => (
                  <button
                    key={id}
                    type="button"
                    className="lmg-card"
                    onClick={() => openStudio(id)}
                    aria-label={`View ${MATERIAL_LABEL[id]}`}
                  >
                    <div
                      className="lmg-stage"
                      ref={(node) => {
                        stageRefs.current[id] = node;
                      }}
                    />
                    <span className="lmg-caption">
                      <span className="lmg-index">{padIndex(index)}</span>
                      <span className="lmg-name">{MATERIAL_LABEL[id]}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="lmg-studio">
              <div ref={studioStageRef} className="lmg-studio-stage" />
              <StudioPanel
                material={material}
                params={params}
                exporting={exporting}
                onMaterial={setMaterial}
                onParams={patchParams}
                onExport={() => {
                  void handleExport();
                }}
                onReset={handleReset}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
