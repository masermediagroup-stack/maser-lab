"use client";

import { useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { Maximize2, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  MONOCHROME_DEFAULTS,
  PARAM_LABELS,
  PARAM_RANGES,
  PARAM_TOOLTIPS,
  STORAGE_KEYS,
} from "../constants";
import { CONTROL_GROUPS } from "../lib/control-groups";
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
  MonochromeParams,
} from "../types";
import { AnimationPanel } from "./AnimationPanel";
import { InteractionPanel } from "./InteractionPanel";
import { MaterialPanel } from "./MaterialPanel";
import { LightingPanel } from "./LightingPanel";
import { DitherPanel } from "./DitherPanel";
import { ContentEditor } from "./ContentEditor";
import { cn } from "@/lib/utils";

type ComponentPlaygroundProps = {
  componentId: ComponentId;
  reducedMotion: boolean;
  onBack: () => void;
};

function formatValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2);
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
  const [compareDither, setCompareDither] = useState<DitherConfig | null>(null);
  const [content, setContent] = useState<ComponentContent>(initialContent);
  const [presetId, setPresetId] = useState(definition.defaultPresetId);
  const [densityMode, setDensityMode] = useState<ControlDensityMode>(() =>
    loadDensityMode(),
  );
  const [disabledPanels, setDisabledPanels] = useState<
    Partial<Record<ControlGroupId, boolean>>
  >({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const closeFullscreenButtonRef = useRef<HTMLButtonElement>(null);
  const [panels, setPanels] = useState<ControlGroupState>(() => {
    if (typeof window === "undefined") return DEFAULT_PANEL_STATE;
    return loadPanelState();
  });

  const advanced = densityMode === "advanced";

  const setDensity = (mode: ControlDensityMode) => {
    setDensityMode(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.density, mode);
    } catch {
      /* ignore */
    }
  };

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

  return (
    <div className="mde-playground">
      <header className="mde-playground__header">
        <button type="button" className="mde-btn" onClick={onBack}>
          ← Components
        </button>
        <div>
          <h1>{definition.label}</h1>
          <p>{definition.description}</p>
        </div>
        <div className="mde-playground__density" role="group" aria-label="Control density">
          <button
            type="button"
            className={cn("mde-chip", densityMode === "basic" && "mde-chip--active")}
            aria-pressed={densityMode === "basic"}
            onClick={() => setDensity("basic")}
          >
            Basic
          </button>
          <button
            type="button"
            className={cn(
              "mde-chip",
              densityMode === "advanced" && "mde-chip--active",
            )}
            aria-pressed={densityMode === "advanced"}
            onClick={() => setDensity("advanced")}
          >
            Advanced
          </button>
        </div>
        <span className="mde-pill">{definition.status}</span>
      </header>

      <div className="mde-playground__layout">
        <div className="mde-playground__stage">
          <div
            className={cn(
              "mde-playground__preview",
              isFullscreen && "mde-playground__preview--fullscreen",
            )}
            role={isFullscreen ? "dialog" : undefined}
            aria-modal={isFullscreen ? true : undefined}
            aria-label={
              isFullscreen
                ? `${definition.label} fullscreen preview`
                : undefined
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
                  onClick={() => setIsFullscreen(true)}
                  aria-label="Enter fullscreen preview"
                >
                  <Maximize2 className="size-4" />
                  <span className="mde-playground__fullscreen-label">
                    Fullscreen
                  </span>
                </Button>
              </div>
            )}
            <div className="mde-playground__preview-stage">
              {compareDither ? (
                <div className="mde-compare" aria-label="Algorithm comparison">
                  <div className="mde-compare__pane">
                    <span className="mde-compare__label">
                      A · {dither.algorithm}
                    </span>
                    <Adapter
                      params={params}
                      animation={animation}
                      interaction={interaction}
                      color={color}
                      light={light}
                      dither={dither}
                      content={content}
                      reducedMotion={reducedMotion}
                    />
                  </div>
                  <div className="mde-compare__pane">
                    <span className="mde-compare__label">
                      B · {compareDither.algorithm}
                    </span>
                    <Adapter
                      params={params}
                      animation={animation}
                      interaction={interaction}
                      color={color}
                      light={light}
                      dither={compareDither}
                      content={content}
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
                  content={content}
                  reducedMotion={reducedMotion}
                />
              )}
            </div>
          </div>
          <div className="mde-playground__perf" aria-label="Performance">
            <span>Target 120 / 60 FPS</span>
            <span>WebGL2 · DPR ≤ 2</span>
            <span>Color · anim · interaction · shared engine</span>
          </div>
        </div>

        <aside className="mde-playground__panel" aria-label="Controls">
          <Collapsible
            title="Presets"
            open={panels.presets}
            onOpenChange={(open) => setPanel("presets", open)}
          >
            <div className="mde-preset-row">
              {presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={cn(
                    "mde-chip",
                    presetId === p.id && "mde-chip--active",
                  )}
                  onClick={() => {
                    setPresetId(p.id);
                    const nextParams = createMonochromeMaterial(p.params);
                    setParams(nextParams);
                    setDither({
                      ...DEFAULT_DITHER_CONFIG,
                      ...(p.dither ?? {}),
                      matrixSize:
                        (p.dither?.matrixSize as DitherConfig["matrixSize"]) ??
                        nextParams.ditherSize,
                    });
                    if (typeof p.params.cursorInfluence === "number") {
                      setInteraction((ix) => ({
                        ...ix,
                        influence: p.params.cursorInfluence!,
                      }));
                    }
                    if (p.light) {
                      setLight({ ...DEFAULT_LIGHT_SHAPE, ...p.light });
                    } else if (p.id === "print-density") {
                      setLight({ ...DEFAULT_LIGHT_SHAPE });
                    }
                  }}
                >
                  {p.label}
                </button>
              ))}
              <button
                type="button"
                className="mde-chip"
                onClick={() => {
                  setPresetId("custom");
                  setParams(createMonochromeMaterial(MONOCHROME_DEFAULTS));
                  setAnimation(initialAnimation());
                  setInteraction(initialInteraction());
                  setColor(initialColor());
                  setLight(initialLight());
                  setDither({ ...DEFAULT_DITHER_CONFIG });
                  setCompareDither(null);
                  setContent(initialContent());
                }}
              >
                Reset
              </button>
            </div>
          </Collapsible>

          <Collapsible
            title="Content"
            open={panels.content}
            onOpenChange={(open) => setPanel("content", open)}
          >
            <ContentEditor
              componentId={componentId}
              value={content}
              onChange={setContent}
              idPrefix={`mde-${componentId}-content`}
            />
          </Collapsible>

          {CONTROL_GROUPS.map((group) => {
            const panelOff = Boolean(disabledPanels[group.id]);
            return (
            <Collapsible
              key={group.id}
              title={group.label}
              open={panels[group.id] ?? false}
              onOpenChange={(open) => setPanel(group.id, open)}
              trailing={
                <button
                  type="button"
                  className={cn("mde-chip mde-chip--tiny", panelOff && "mde-chip--active")}
                  aria-pressed={panelOff}
                  title="Temporarily disable this panel's contribution where supported"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDisabledPanels((d) => ({
                      ...d,
                      [group.id]: !d[group.id],
                    }));
                  }}
                >
                  {panelOff ? "Bypass" : "Live"}
                </button>
              }
            >
              {panelOff ? (
                <p className="mde-field__hint">
                  Panel bypassed — values retained; contribution muted in preview
                  where applicable.
                </p>
              ) : null}

              {group.id === "animation" ? (
                <>
                  {renderParamFields(group.fields, {
                    componentId,
                    params,
                    setParams,
                    advanced,
                  })}
                  {!panelOff ? (
                    <AnimationPanel
                      value={animation}
                      onChange={setAnimation}
                      idPrefix={`mde-${componentId}-anim`}
                      advanced={advanced}
                    />
                  ) : null}
                </>
              ) : group.id === "interaction" ? (
                <>
                  {renderParamFields(group.fields, {
                    componentId,
                    params,
                    setParams,
                    advanced,
                  })}
                  {!panelOff ? (
                    <InteractionPanel
                      value={
                        panelOff
                          ? { ...interaction, influence: 0, enabled: false }
                          : interaction
                      }
                      onChange={setInteraction}
                      idPrefix={`mde-${componentId}-ix`}
                    />
                  ) : null}
                </>
              ) : group.id === "colors" ? (
                <>
                  {renderParamFields(group.fields, {
                    componentId,
                    params,
                    setParams,
                    advanced,
                  })}
                  <MaterialPanel
                    value={color}
                    onChange={setColor}
                    onParamsHint={(hint) =>
                      setParams((p) => ({ ...p, ...hint }))
                    }
                    idPrefix={`mde-${componentId}-mat`}
                    advanced={advanced}
                  />
                </>
              ) : group.id === "lighting" ? (
                <>
                  <LightingPanel
                    value={light}
                    onChange={setLight}
                    idPrefix={`mde-${componentId}-ls`}
                  />
                  {renderParamFields(group.fields, {
                    componentId,
                    params,
                    setParams,
                    advanced,
                  })}
                </>
              ) : group.id === "dither" ? (
                <>
                  <DitherPanel
                    value={dither}
                    onChange={(next) => {
                      setDither(next);
                      setParams((p) => ({
                        ...p,
                        ditherSize: next.matrixSize,
                      }));
                    }}
                    onMatrixSize={(size) =>
                      setParams((p) => ({ ...p, ditherSize: size }))
                    }
                    advanced={advanced}
                    idPrefix={`mde-${componentId}-dit`}
                    compare={compareDither}
                    onCompareChange={setCompareDither}
                  />
                  {renderParamFields(group.fields, {
                    componentId,
                    params,
                    setParams,
                    advanced,
                  })}
                </>
              ) : (
                renderParamFields(group.fields, {
                  componentId,
                  params,
                  setParams,
                  advanced,
                })
              )}
            </Collapsible>
            );
          })}

          <Collapsible
            title="Export"
            open={panels.export}
            onOpenChange={(open) => setPanel("export", open)}
          >
            <pre className="mde-export">{exportCode}</pre>
            <button
              type="button"
              className="mde-btn"
              onClick={() => void navigator.clipboard?.writeText(exportCode)}
            >
              Copy code
            </button>
          </Collapsible>

          <section className="mde-docs-block" aria-label="Documentation">
            <h2>Documentation</h2>
            <p>
              <strong>Purpose.</strong> {definition.purpose}
            </p>
            <p>
              <strong>Best uses.</strong> {definition.bestUses.join(" · ")}
            </p>
            <p>
              <strong>Performance.</strong> {definition.performanceNotes}
            </p>
            <p>
              <strong>Accessibility.</strong> {definition.a11yNotes}
            </p>
            <p>
              <strong>Mobile.</strong> {definition.mobileNotes}
            </p>
            <p>
              <strong>API.</strong> Adapter props:{" "}
              <code>params</code>, <code>animation</code>,{" "}
              <code>interaction</code>, <code>color</code>,{" "}
              <code>light</code>, <code>dither</code>, <code>content</code>,{" "}
              <code>reducedMotion</code>.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function renderParamFields(
  fields: (typeof CONTROL_GROUPS)[number]["fields"],
  opts: {
    componentId: ComponentId;
    params: MonochromeParams;
    setParams: Dispatch<SetStateAction<MonochromeParams>>;
    advanced: boolean;
  },
) {
  const { componentId, params, setParams, advanced } = opts;
  return fields.map((field) => {
    if (field.kind !== "slider") return null;
    if (field.advanced && !advanced) return null;
    const range = PARAM_RANGES[field.key];
    const current = params[field.key];
    const tip = PARAM_TOOLTIPS[field.key];
    const def = MONOCHROME_DEFAULTS[field.key];
    return (
      <div key={field.key} className="mde-field">
        <div className="mde-field__row">
          <Label
            htmlFor={`mde-${componentId}-${field.key}`}
            title={tip}
          >
            {PARAM_LABELS[field.key] ?? field.key}
          </Label>
          <span className="mde-field__value-row">
            <span>{formatValue(current)}</span>
            <button
              type="button"
              className="mde-chip mde-chip--tiny"
              title={`Reset to default (${formatValue(def)})`}
              onClick={() =>
                setParams((p) => ({ ...p, [field.key]: def }))
              }
            >
              ↺
            </button>
          </span>
        </div>
        {tip ? <p className="mde-field__hint">{tip}</p> : null}
        <Slider
          id={`mde-${componentId}-${field.key}`}
          min={range.min}
          max={range.max}
          step={range.step}
          value={[current]}
          onValueChange={(vals) => {
            const next = Array.isArray(vals) ? vals[0] : vals;
            if (typeof next !== "number") return;
            setParams((p) => ({ ...p, [field.key]: next }));
          }}
        />
      </div>
    );
  });
}

function Collapsible({
  title,
  open,
  onOpenChange,
  trailing,
  children,
}: {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mde-panel">
      <div className="mde-panel__head">
        <button
          type="button"
          className="mde-panel__toggle"
          aria-expanded={open}
          onClick={() => onOpenChange(!open)}
        >
          <span>{title}</span>
          <span aria-hidden>{open ? "−" : "+"}</span>
        </button>
        {trailing}
      </div>
      {open ? <div className="mde-panel__body">{children}</div> : null}
    </div>
  );
}
