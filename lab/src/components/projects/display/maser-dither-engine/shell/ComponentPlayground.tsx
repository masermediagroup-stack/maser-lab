"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MONOCHROME_DEFAULTS,
  STORAGE_KEYS,
} from "../constants";
import {
  DEFAULT_PANEL_STATE,
  loadPanelState,
  savePanelState,
} from "../lib/persistence";
import { generateExportCode } from "../docs/content";
import { adapters, ComponentCatalog } from "../components/registry";
import { presetsForComponent, getPresetById } from "../presets/catalog";
import { createMonochromeMaterial } from "../engine/materials/MonochromeMaterial";
import {
  DEFAULT_ANIMATION_CONFIG,
  defaultModeParams,
} from "../engine/animation";
import type { AnimationEngineConfig } from "../engine/animation/types";
import {
  DEFAULT_INTERACTION_CONFIG,
  createDefaultLights,
} from "../engine/interaction";
import type { InteractionEngineConfig } from "../engine/interaction/types";
import {
  DEFAULT_COLOR_MATERIAL,
} from "../engine/color/types";
import type { ColorMaterialConfig } from "../engine/color/types";
import {
  DEFAULT_LIGHT_SHAPE,
} from "../engine/lighting";
import type { LightShapeConfig } from "../engine/lighting/types";
import {
  DEFAULT_DITHER_CONFIG,
  type DitherConfig,
} from "../engine/dither";
import {
  DEFAULT_COMPONENT_CONTENT,
  type ComponentContent,
} from "../content/types";
import type {
  ComponentId,
  ControlDensityMode,
  ControlGroupId,
  ControlGroupState,
  MaterialId,
  MonochromeParams,
  WorkspaceMode,
} from "../types";
import {
  applySnapshot,
  canRedo,
  canUndo,
  captureSnapshot,
  createHistory,
  createUserProjectId,
  getProject,
  pushHistory,
  redoHistory,
  searchControls,
  undoHistory,
  upsertUserProject,
  setProjectFavorite as setProjectFavoriteLib,
  setDockOrder as setDockOrderLib,
  setWorkspaceMode as persistWorkspaceMode,
  type HistoryStack,
  type ProjectLibraryState,
  type ProjectRecord,
  type ProjectSnapshot,
} from "../projects";
import {
  createInitialMaterialConfig,
} from "./ProceduralMaterialPanel";
import { type SourceImageValue } from "./SourceImageField";
import type { MaterialEngineConfig } from "../engine/material/types";
import {
  BottomSheet,
  FitStage,
  MaterialDock,
  MobileBottomNav,
  QuickActions,
  type MobileTabId,
  type SheetSnap,
} from "./studio";
import {
  renderControlPanels,
  type ControlPanelBundle,
} from "./PlaygroundControlPanels";
import { cn } from "@/lib/utils";

type ComponentPlaygroundProps = {
  componentId: ComponentId;
  reducedMotion: boolean;
  onBack: () => void;
  projectId?: string | null;
  library?: ProjectLibraryState;
  onLibraryChange?: (next: ProjectLibraryState) => void;
  onOpenStudio?: () => void;
  onProjectConsumed?: () => void;
};

function captureStageThumbnail(root: HTMLElement | null): string | null {
  if (!root) return null;
  const canvas = root.querySelector("canvas");
  if (!canvas) return null;
  try {
    return canvas.toDataURL("image/jpeg", 0.72);
  } catch {
    return null;
  }
}


function initialParams(componentId: ComponentId): MonochromeParams {
  const definition = ComponentCatalog.get(componentId)!;
  const preset = getPresetById(definition.defaultPresetId);
  return createMonochromeMaterial(preset?.params);
}

function initialAnimation(): AnimationEngineConfig {
  return {
    ...DEFAULT_ANIMATION_CONFIG,
    modeParams: defaultModeParams(DEFAULT_ANIMATION_CONFIG.modeId),
    timeline: { ...DEFAULT_ANIMATION_CONFIG.timeline },
  };
}

function initialInteraction(): InteractionEngineConfig {
  return {
    ...DEFAULT_INTERACTION_CONFIG,
    physics: { ...DEFAULT_INTERACTION_CONFIG.physics },
    falloff: { ...DEFAULT_INTERACTION_CONFIG.falloff },
    trail: { ...DEFAULT_INTERACTION_CONFIG.trail },
    ripple: { ...DEFAULT_INTERACTION_CONFIG.ripple },
    hold: { ...DEFAULT_INTERACTION_CONFIG.hold },
    release: { ...DEFAULT_INTERACTION_CONFIG.release },
    lights: createDefaultLights(),
  };
}

function initialColor(): ColorMaterialConfig {
  return {
    ...DEFAULT_COLOR_MATERIAL,
    colors: { ...DEFAULT_COLOR_MATERIAL.colors },
    properties: { ...DEFAULT_COLOR_MATERIAL.properties },
  };
}

function initialLight(): LightShapeConfig {
  return { ...DEFAULT_LIGHT_SHAPE };
}

function initialDither(componentId: ComponentId): DitherConfig {
  const definition = ComponentCatalog.get(componentId)!;
  const preset = getPresetById(definition.defaultPresetId);
  return {
    ...DEFAULT_DITHER_CONFIG,
    ...(preset?.dither ?? {}),
    matrixSize:
      (preset?.dither?.matrixSize as DitherConfig["matrixSize"] | undefined) ??
      (preset?.params.ditherSize as DitherConfig["matrixSize"] | undefined) ??
      DEFAULT_DITHER_CONFIG.matrixSize,
  };
}

function initialContent(): ComponentContent {
  return {
    ...DEFAULT_COMPONENT_CONTENT,
    navItems: [...DEFAULT_COMPONENT_CONTENT.navItems],
  };
}

function loadDensityMode(): ControlDensityMode {
  if (typeof window === "undefined") return "basic";
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.density);
    return raw === "advanced" ? "advanced" : "basic";
  } catch {
    return "basic";
  }
}


export function ComponentPlayground({
  componentId,
  reducedMotion,
  onBack,
  projectId = null,
  library,
  onLibraryChange,
  onOpenStudio,
  onProjectConsumed,
}: ComponentPlaygroundProps) {
  const definition = ComponentCatalog.get(componentId)!;
  const Adapter = adapters[componentId];
  const presets = useMemo(
    () => presetsForComponent(componentId),
    [componentId],
  );

  const [params, setParams] = useState<MonochromeParams>(() =>
    initialParams(componentId),
  );
  const [animation, setAnimation] = useState<AnimationEngineConfig>(
    initialAnimation,
  );
  const [interaction, setInteraction] = useState<InteractionEngineConfig>(
    initialInteraction,
  );
  const [color, setColor] = useState<ColorMaterialConfig>(initialColor);
  const [light, setLight] = useState<LightShapeConfig>(initialLight);
  const [dither, setDither] = useState<DitherConfig>(() =>
    initialDither(componentId),
  );
  const [material, setMaterial] = useState<MaterialEngineConfig>(() =>
    createInitialMaterialConfig("monochrome"),
  );
  const [compareDither, setCompareDither] = useState<DitherConfig | null>(null);
  const [compareMaterial, setCompareMaterial] =
    useState<MaterialEngineConfig | null>(null);
  const [content, setContent] = useState<ComponentContent>(initialContent);
  const [source, setSource] = useState<SourceImageValue>({
    url: null,
    lightMix: 0.45,
  });
  const [presetId, setPresetId] = useState(definition.defaultPresetId);
  const [densityMode, setDensityMode] = useState<ControlDensityMode>(() =>
    loadDensityMode(),
  );
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(
    () => library?.workspaceMode ?? "advanced",
  );
  const [disabledPanels, setDisabledPanels] = useState<
    Partial<Record<ControlGroupId, boolean>>
  >({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const closeFullscreenButtonRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [panels, setPanels] = useState<ControlGroupState>(() => {
    if (typeof window === "undefined") return DEFAULT_PANEL_STATE;
    return loadPanelState();
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    projectId,
  );
  const [history, setHistory] = useState<HistoryStack | null>(null);
  const [controlQuery, setControlQuery] = useState("");
  const [favoriteControls, setFavoriteControls] = useState<string[]>(
    () => library?.favoriteControlIds ?? [],
  );
  const [mobileTab, setMobileTab] = useState<MobileTabId>("preview");
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>("half");
  const [isNarrow, setIsNarrow] = useState(false);
  const historyTimer = useRef<number | null>(null);
  const autosaveTimer = useRef<number | null>(null);
  const skipHistory = useRef(false);
  const loadedProject = useRef<string | null>(null);

  const advanced =
    densityMode === "advanced" ||
    workspaceMode === "advanced" ||
    workspaceMode === "debug";
  const presentation = workspaceMode === "presentation";
  const beginner = workspaceMode === "beginner";

  const buildSnapshot = useCallback((): ProjectSnapshot => {
    return captureSnapshot({
      componentId,
      params,
      animation,
      interaction,
      color,
      light,
      dither,
      material,
      content,
      sourceUrl: source.url,
      sourceLightMix: source.lightMix,
      basePresetId: presetId,
    });
  }, [
    componentId,
    params,
    animation,
    interaction,
    color,
    light,
    dither,
    material,
    content,
    source.url,
    source.lightMix,
    presetId,
  ]);

  const applyProjectSnapshot = useCallback((snapshot: ProjectSnapshot) => {
    skipHistory.current = true;
    applySnapshot(snapshot, {
      setParams,
      setAnimation,
      setInteraction,
      setColor,
      setLight,
      setDither,
      setMaterial,
      setContent,
      setSource: (v) => setSource({ url: v.url, lightMix: v.lightMix }),
      setPresetId,
    });
    setCompareDither(null);
    setCompareMaterial(null);
    setHistory(createHistory(snapshot));
    skipHistory.current = false;
  }, []);

  useEffect(() => {
    if (!projectId || !library) return;
    if (loadedProject.current === projectId) return;
    const record = getProject(library, projectId);
    if (!record) return;
    loadedProject.current = projectId;
    // External project open — apply snapshot after paint.
    queueMicrotask(() => {
      applyProjectSnapshot(record.snapshot);
      setActiveProjectId(record.id);
      onProjectConsumed?.();
    });
  }, [projectId, library, applyProjectSnapshot, onProjectConsumed]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (skipHistory.current) return;
    if (historyTimer.current != null) window.clearTimeout(historyTimer.current);
    historyTimer.current = window.setTimeout(() => {
      const snap = buildSnapshot();
      setHistory((prev) =>
        prev ? pushHistory(prev, snap) : createHistory(snap),
      );
    }, 420);
    return () => {
      if (historyTimer.current != null) {
        window.clearTimeout(historyTimer.current);
      }
    };
  }, [
    params,
    animation,
    interaction,
    color,
    light,
    dither,
    material,
    content,
    source.url,
    source.lightMix,
    presetId,
    buildSnapshot,
  ]);

  const commitLibrary = useCallback(
    (next: ProjectLibraryState) => {
      onLibraryChange?.(next);
    },
    [onLibraryChange],
  );

  const saveCurrent = useCallback(
    (opts?: { asNew?: boolean; name?: string }) => {
      if (!library || !onLibraryChange) {
        window.alert("Project library is not available.");
        return;
      }
      const snapshot = buildSnapshot();
      const thumb = captureStageThumbnail(stageRef.current);
      const existing =
        !opts?.asNew && activeProjectId
          ? getProject(library, activeProjectId)
          : undefined;

      if (existing?.origin === "system" || opts?.asNew || !existing) {
        const name =
          opts?.name?.trim() ||
          window.prompt(
            "Save project as",
            existing ? `${existing.name} Edit` : `${definition.label} Project`,
          );
        if (!name) return;
        const now = Date.now();
        const project: ProjectRecord = {
          id: createUserProjectId(),
          origin: "user",
          readOnly: false,
          name,
          description: `Saved from ${definition.label}`,
          notes: "",
          tags: [material.materialId, dither.algorithm],
          colorLabel: "none",
          favorite: false,
          materialId: material.materialId,
          thumbnailDataUrl: thumb,
          createdAt: now,
          updatedAt: now,
          snapshot,
        };
        commitLibrary(upsertUserProject(library, project));
        setActiveProjectId(project.id);
        return;
      }

      if (existing.origin !== "user" || existing.readOnly) {
        window.alert("System presets cannot be overwritten. Use Save As.");
        return;
      }

      commitLibrary(
        upsertUserProject(library, {
          ...existing,
          materialId: material.materialId,
          thumbnailDataUrl: thumb ?? existing.thumbnailDataUrl,
          updatedAt: Date.now(),
          snapshot,
        }),
      );
    },
    [
      library,
      onLibraryChange,
      buildSnapshot,
      activeProjectId,
      definition.label,
      material.materialId,
      dither.algorithm,
      commitLibrary,
    ],
  );

  useEffect(() => {
    if (!library?.autosaveEnabled || !activeProjectId || !onLibraryChange) {
      return;
    }
    const current = getProject(library, activeProjectId);
    if (!current || current.origin !== "user" || current.readOnly) return;

    if (autosaveTimer.current != null) {
      window.clearTimeout(autosaveTimer.current);
    }
    autosaveTimer.current = window.setTimeout(() => {
      const snapshot = buildSnapshot();
      const thumb = captureStageThumbnail(stageRef.current);
      commitLibrary(
        upsertUserProject(library, {
          ...current,
          materialId: material.materialId,
          thumbnailDataUrl: thumb ?? current.thumbnailDataUrl,
          updatedAt: Date.now(),
          snapshot,
        }),
      );
    }, 2200);
    return () => {
      if (autosaveTimer.current != null) {
        window.clearTimeout(autosaveTimer.current);
      }
    };
  }, [
    library,
    activeProjectId,
    onLibraryChange,
    buildSnapshot,
    material.materialId,
    params,
    animation,
    interaction,
    color,
    light,
    dither,
    content,
    source,
    commitLibrary,
  ]);

  const onUndo = useCallback(() => {
    setHistory((prev) => {
      if (!prev || !canUndo(prev)) return prev;
      const next = undoHistory(prev);
      skipHistory.current = true;
      applySnapshot(next.present, {
        setParams,
        setAnimation,
        setInteraction,
        setColor,
        setLight,
        setDither,
        setMaterial,
        setContent,
        setSource: (v) => setSource({ url: v.url, lightMix: v.lightMix }),
        setPresetId,
      });
      skipHistory.current = false;
      return next;
    });
  }, []);

  const onRedo = useCallback(() => {
    setHistory((prev) => {
      if (!prev || !canRedo(prev)) return prev;
      const next = redoHistory(prev);
      skipHistory.current = true;
      applySnapshot(next.present, {
        setParams,
        setAnimation,
        setInteraction,
        setColor,
        setLight,
        setDither,
        setMaterial,
        setContent,
        setSource: (v) => setSource({ url: v.url, lightMix: v.lightMix }),
        setPresetId,
      });
      skipHistory.current = false;
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        if (!(meta && e.key.toLowerCase() === "s")) return;
      }
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) onRedo();
        else onUndo();
      }
      if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveCurrent({ asNew: e.shiftKey });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onUndo, onRedo, saveCurrent]);

  const controlHits = useMemo(
    () => (controlQuery.trim() ? searchControls(controlQuery) : []),
    [controlQuery],
  );

  const setDensity = (mode: ControlDensityMode) => {
    setDensityMode(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.density, mode);
    } catch {
      /* ignore */
    }
  };

  const changeWorkspaceMode = (mode: WorkspaceMode) => {
    setWorkspaceMode(mode);
    if (mode === "beginner") setDensity("basic");
    if (mode === "advanced" || mode === "debug") setDensity("advanced");
    if (library && onLibraryChange) {
      commitLibrary(persistWorkspaceMode(library, mode));
    }
  };

  useEffect(() => {
    return () => {
      if (source.url?.startsWith("blob:")) {
        URL.revokeObjectURL(source.url);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup last blob on unmount
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    closeFullscreenButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullscreen]);

  const setPanel = (id: ControlGroupId, open: boolean) => {
    setPanels((prev) => {
      const next = { ...prev, [id]: open };
      savePanelState(next);
      return next;
    });
  };

  const exportCode = generateExportCode(definition, params);

  const exportProjectBundle = () => {
    const snapshot = buildSnapshot();
    const payload = {
      kind: "mde-project",
      version: 1,
      name: definition.label,
      snapshot,
      reactConfig: exportCode,
      cssVariables: {
        "--mde-contrast": String(params.contrast),
        "--mde-brightness": String(params.brightness),
        "--mde-bloom": String(params.bloom),
      },
      shaderConfig: {
        materialId: material.materialId,
        ditherAlgorithm: dither.algorithm,
        matrixSize: dither.matrixSize,
      },
    };
    void navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
  };

  const resetDemo = () => {
    setPresetId("custom");
    setParams(createMonochromeMaterial(MONOCHROME_DEFAULTS));
    setAnimation(initialAnimation());
    setInteraction(initialInteraction());
    setColor(initialColor());
    setLight(initialLight());
    setDither({ ...DEFAULT_DITHER_CONFIG });
    setMaterial(createInitialMaterialConfig("monochrome"));
    setCompareDither(null);
    setCompareMaterial(null);
    setContent(initialContent());
    setSource((prev) => {
      if (prev.url?.startsWith("blob:")) {
        URL.revokeObjectURL(prev.url);
      }
      return { url: null, lightMix: 0.45 };
    });
  };

  const sheetOpen =
    isNarrow && mobileTab !== "preview" && mobileTab !== "projects";

  const mobilePanelFocus: Partial<
    Record<MobileTabId, ControlGroupId | "presets" | "content" | "export">
  > = {
    materials: "material",
    animation: "animation",
    lighting: "lighting",
    interaction: "interaction",
    components: "content",
    settings: "export",
  };

  const panelProps: ControlPanelBundle = {
    beginner,
    advanced,
    panels,
    setPanel,
    presets,
    presetId,
    setPresetId,
    params,
    setParams,
    animation,
    setAnimation,
    interaction,
    setInteraction,
    color,
    setColor,
    light,
    setLight,
    dither,
    setDither,
    material,
    setMaterial,
    content,
    setContent,
    source,
    setSource,
    compareDither,
    setCompareDither,
    compareMaterial,
    setCompareMaterial,
    disabledPanels,
    setDisabledPanels,
    componentId,
    definition,
    exportCode,
  };

  const activeProjectLabel = activeProjectId
    ? activeProjectId.startsWith("system:")
      ? "System look"
      : library
        ? (getProject(library, activeProjectId)?.name ?? "User project")
        : "User project"
    : null;

  const sheetTitle =
    mobileTab === "materials"
      ? "Materials"
      : mobileTab === "animation"
        ? "Animation"
        : mobileTab === "lighting"
          ? "Lighting"
          : mobileTab === "interaction"
            ? "Interaction"
            : mobileTab === "components"
              ? "Component"
              : "Settings";

  const previewBody =
    compareDither || compareMaterial ? (
      <div className="mde-compare" aria-label="Comparison">
        <div className="mde-compare__pane">
          <span className="mde-compare__label">
            A · {compareDither ? dither.algorithm : material.materialId}
          </span>
          <Adapter
            params={params}
            animation={animation}
            interaction={interaction}
            color={color}
            light={light}
            dither={dither}
            material={material}
            content={content}
            sourceUrl={source.url}
            sourceLightMix={source.lightMix}
            reducedMotion={reducedMotion}
          />
        </div>
        <div className="mde-compare__pane">
          <span className="mde-compare__label">
            B ·{" "}
            {compareDither
              ? compareDither.algorithm
              : compareMaterial?.materialId}
          </span>
          <Adapter
            params={params}
            animation={animation}
            interaction={interaction}
            color={color}
            light={light}
            dither={compareDither ?? dither}
            material={compareMaterial ?? material}
            content={content}
            sourceUrl={source.url}
            sourceLightMix={source.lightMix}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
    ) : (
      <Adapter
        params={params}
        animation={animation}
        interaction={interaction}
        color={color}
        light={light}
        dither={dither}
        material={material}
        content={content}
        sourceUrl={source.url}
        sourceLightMix={source.lightMix}
        reducedMotion={reducedMotion}
      />
    );

  const previewFrame = (
    <div
      className={cn(
        "mde-playground__preview",
        isNarrow && "mde-playground__preview--mobile-fit",
        isFullscreen && "mde-playground__preview--fullscreen",
      )}
      role={isFullscreen ? "dialog" : undefined}
      aria-modal={isFullscreen ? true : undefined}
      aria-label={
        isFullscreen ? `${definition.label} fullscreen preview` : undefined
      }
    >
      {isFullscreen ? (
        <Button
          ref={closeFullscreenButtonRef}
          type="button"
          variant="ghost"
          size="icon-sm"
          className="mde-playground__fullscreen-close text-white hover:bg-white/10 hover:text-white"
          onClick={() => setIsFullscreen(false)}
          aria-label="Close fullscreen preview"
        >
          <X className="size-5" />
        </Button>
      ) : (
        <div className="mde-playground__preview-toolbar">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mde-playground__fullscreen-btn border-white/15 bg-black/70 text-white hover:bg-white/10 hover:text-white"
            onClick={() => {
              setMobileTab("preview");
              setIsFullscreen(true);
            }}
            aria-label="Enter fullscreen preview"
          >
            <Maximize2 className="size-4" />
            <span className="mde-playground__fullscreen-label">Fullscreen</span>
          </Button>
        </div>
      )}
      <div className="mde-playground__preview-stage">
        {isNarrow && !isFullscreen ? (
          <FitStage>{previewBody}</FitStage>
        ) : (
          previewBody
        )}
      </div>
    </div>
  );

  const materialDock = (
    <MaterialDock
      activeId={material.materialId}
      order={(library?.dockOrder as MaterialId[]) ?? []}
      onOrderChange={(order) => {
        if (!library) return;
        commitLibrary(setDockOrderLib(library, order));
      }}
      onSelect={(id) => {
        setMaterial(createInitialMaterialConfig(id));
        setPanel("material", true);
      }}
      onApply={(id) => {
        setMaterial(createInitialMaterialConfig(id));
      }}
      onFavorite={(id) => {
        setFavoriteControls((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
      }}
      onDuplicate={() => saveCurrent({ asNew: true })}
    />
  );

  const openControlHit = (hit: { panel: string; label: string }) => {
    setPanel(hit.panel as ControlGroupId, true);
    setFavoriteControls((prev) =>
      prev.includes(hit.label) ? prev : [...prev, hit.label],
    );
    setControlQuery("");
    if (isNarrow) {
      const tab: MobileTabId =
        hit.panel === "material"
          ? "materials"
          : hit.panel === "animation"
            ? "animation"
            : hit.panel === "lighting"
              ? "lighting"
              : hit.panel === "interaction"
                ? "interaction"
                : "settings";
      setMobileTab(tab);
      setSheetSnap("expanded");
    }
  };

  /* —— Mobile workspace shell (≤900px): topbar + stage + sheet + bottom nav —— */
  if (isNarrow) {
    return (
      <div
        className={cn(
          "mde-playground",
          "mde-playground--mobile",
          presentation && "mde-playground--presentation",
          sheetOpen && "mde-playground--sheet-open",
        )}
      >
        <header className="mde-mobile-topbar">
          <button
            type="button"
            className="mde-mobile-topbar__back"
            onClick={onBack}
            aria-label="Back to components"
          >
            ←
          </button>
          <div className="mde-mobile-topbar__title">
            <strong>{definition.label}</strong>
            {activeProjectLabel ? (
              <span className="mde-muted">{activeProjectLabel}</span>
            ) : (
              <span className="mde-muted">{material.materialId}</span>
            )}
          </div>
          <div className="mde-mobile-topbar__actions">
            <button
              type="button"
              className="mde-btn mde-btn--compact"
              disabled={!history || !canUndo(history)}
              onClick={onUndo}
              aria-label="Undo"
            >
              Undo
            </button>
            <button
              type="button"
              className="mde-btn mde-btn--compact"
              disabled={!history || !canRedo(history)}
              onClick={onRedo}
              aria-label="Redo"
            >
              Redo
            </button>
            <button
              type="button"
              className="mde-btn mde-btn--primary mde-btn--compact"
              onClick={() => saveCurrent()}
            >
              Save
            </button>
          </div>
        </header>

        <div
          className="mde-mobile-stage"
          ref={stageRef}
          data-sheet={sheetOpen ? sheetSnap : "closed"}
        >
          {previewFrame}
        </div>

        <BottomSheet
          open={sheetOpen}
          title={sheetTitle}
          snap={sheetSnap}
          onSnapChange={setSheetSnap}
          onClose={() => setMobileTab("preview")}
        >
          <div className="mde-sheet__panels">
            {mobileTab === "materials" ? (
              <div className="mde-sheet__dock">{materialDock}</div>
            ) : null}
            {mobileTab === "settings" ? (
              <div className="mde-sheet__search-block">
                <label className="mde-playground__control-search">
                  <span className="sr-only">Search controls</span>
                  <input
                    type="search"
                    placeholder="Search controls…"
                    value={controlQuery}
                    onChange={(e) => setControlQuery(e.target.value)}
                  />
                </label>
                {controlHits.length > 0 ? (
                  <div
                    className="mde-playground__control-hits"
                    role="listbox"
                  >
                    {controlHits.slice(0, 8).map((hit) => (
                      <button
                        key={hit.id}
                        type="button"
                        role="option"
                        className="mde-chip"
                        aria-selected={false}
                        onClick={() => openControlHit(hit)}
                      >
                        {hit.label}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div
                  className="mde-playground__density mde-sheet__modes"
                  role="group"
                  aria-label="Workspace mode"
                >
                  {(
                    [
                      ["beginner", "Beginner"],
                      ["advanced", "Advanced"],
                      ["presentation", "Present"],
                      ["debug", "Debug"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={cn(
                        "mde-chip",
                        workspaceMode === id && "mde-chip--active",
                      )}
                      aria-pressed={workspaceMode === id}
                      onClick={() => changeWorkspaceMode(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mde-sheet__quick-row">
                  <button
                    type="button"
                    className="mde-btn"
                    onClick={() => saveCurrent({ asNew: true })}
                  >
                    Save As
                  </button>
                  <button
                    type="button"
                    className="mde-btn"
                    onClick={resetDemo}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className="mde-btn"
                    onClick={exportProjectBundle}
                  >
                    Export
                  </button>
                  {onOpenStudio ? (
                    <button
                      type="button"
                      className="mde-btn"
                      onClick={onOpenStudio}
                    >
                      Projects
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
            {renderControlPanels({
              ...panelProps,
              focusGroup: mobilePanelFocus[mobileTab],
            })}
          </div>
        </BottomSheet>

        <MobileBottomNav
          active={mobileTab}
          onChange={(id) => {
            if (id === "projects") {
              onOpenStudio?.();
              return;
            }
            setMobileTab(id);
            if (id === "preview") return;
            setSheetSnap(id === "settings" ? "expanded" : "half");
          }}
        />
      </div>
    );
  }

  /* —— Desktop workspace (unchanged composition) —— */
  return (
    <div
      className={cn(
        "mde-playground",
        presentation && "mde-playground--presentation",
      )}
    >
      <header className="mde-playground__header">
        <button type="button" className="mde-btn" onClick={onBack}>
          ← Components
        </button>
        <div>
          <h1>{definition.label}</h1>
          <p>
            {definition.description}
            {activeProjectId ? (
              <span className="mde-muted">
                {" "}
                ·{" "}
                {activeProjectId.startsWith("system:")
                  ? "System look loaded"
                  : "User project"}
              </span>
            ) : null}
          </p>
        </div>
        <div
          className="mde-playground__density"
          role="group"
          aria-label="Workspace mode"
        >
          {(
            [
              ["beginner", "Beginner"],
              ["advanced", "Advanced"],
              ["presentation", "Present"],
              ["debug", "Debug"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={cn(
                "mde-chip",
                workspaceMode === id && "mde-chip--active",
              )}
              aria-pressed={workspaceMode === id}
              onClick={() => changeWorkspaceMode(id)}
            >
              {label}
            </button>
          ))}
        </div>
        {onOpenStudio ? (
          <button type="button" className="mde-btn" onClick={onOpenStudio}>
            Studio
          </button>
        ) : null}
        <span className="mde-pill">{definition.status}</span>
      </header>

      {!presentation ? (
        <div className="mde-playground__studio-bar">
          <label className="mde-playground__control-search">
            <span className="sr-only">Search controls</span>
            <input
              type="search"
              placeholder="Search controls… e.g. Bloom"
              value={controlQuery}
              onChange={(e) => setControlQuery(e.target.value)}
            />
          </label>
          {controlHits.length > 0 ? (
            <div className="mde-playground__control-hits" role="listbox">
              {controlHits.slice(0, 8).map((hit) => (
                <button
                  key={hit.id}
                  type="button"
                  role="option"
                  className="mde-chip"
                  aria-selected={false}
                  onClick={() => openControlHit(hit)}
                >
                  {hit.label}
                </button>
              ))}
            </div>
          ) : null}
          {favoriteControls.length > 0 ? (
            <div
              className="mde-playground__fav-controls"
              aria-label="Favorite controls"
            >
              <span className="mde-muted">My Favorites</span>
              {favoriteControls.map((id) => (
                <span key={id} className="mde-pill">
                  {id}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mde-playground__layout">
        <div className="mde-playground__stage" ref={stageRef}>
          {previewFrame}

          {!presentation ? (
            <>
              <QuickActions
                canUndo={Boolean(history && canUndo(history))}
                canRedo={Boolean(history && canRedo(history))}
                onUndo={onUndo}
                onRedo={onRedo}
                onSave={() => saveCurrent()}
                onSaveAs={() => saveCurrent({ asNew: true })}
                onDuplicate={() => saveCurrent({ asNew: true })}
                onReset={resetDemo}
                onExport={exportProjectBundle}
                onFavorite={() => {
                  if (!activeProjectId || !library) return;
                  const rec = getProject(library, activeProjectId);
                  if (!rec) return;
                  commitLibrary(
                    setProjectFavoriteLib(
                      library,
                      activeProjectId,
                      !rec.favorite,
                    ),
                  );
                }}
                onThumbnail={() => saveCurrent()}
              />
              {materialDock}
            </>
          ) : null}

          <div className="mde-playground__perf" aria-label="Performance">
            <span>Target 120 / 60 FPS</span>
            <span>WebGL2 · DPR ≤ 2</span>
            {workspaceMode === "debug" ? (
              <span>
                Debug · {material.materialId} · {dither.algorithm} ·{" "}
                {dither.matrixSize}
              </span>
            ) : (
              <span>Color · anim · interaction · shared engine</span>
            )}
          </div>
        </div>

        {!presentation ? (
          <aside className="mde-playground__panel" aria-label="Controls">
            {renderControlPanels(panelProps)}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
