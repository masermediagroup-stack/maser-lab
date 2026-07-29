"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  DITHER_SIZES,
  MONOCHROME_DEFAULTS,
  PARAM_LABELS,
  PARAM_RANGES,
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
import type {
  ComponentId,
  ControlGroupId,
  ControlGroupState,
  MonochromeParams,
} from "../types";
import { AnimationPanel } from "./AnimationPanel";
import { InteractionPanel } from "./InteractionPanel";
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
  const [presetId, setPresetId] = useState(definition.defaultPresetId);
  const [panels, setPanels] = useState<ControlGroupState>(() => {
    if (typeof window === "undefined") return DEFAULT_PANEL_STATE;
    return loadPanelState();
  });

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
        <span className="mde-pill">{definition.status}</span>
      </header>

      <div className="mde-playground__layout">
        <div className="mde-playground__stage">
          <div className="mde-playground__preview">
            <Adapter
              params={params}
              animation={animation}
              interaction={interaction}
              reducedMotion={reducedMotion}
            />
          </div>
          <div className="mde-playground__perf" aria-label="Performance">
            <span>Target 120 / 60 FPS</span>
            <span>WebGL2 · DPR ≤ 2</span>
            <span>Procedural anim · interaction · shared engine</span>
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
                    setParams(createMonochromeMaterial(p.params));
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
                }}
              >
                Reset
              </button>
            </div>
          </Collapsible>

          {CONTROL_GROUPS.map((group) => (
            <Collapsible
              key={group.id}
              title={group.label}
              open={panels[group.id]}
              onOpenChange={(open) => setPanel(group.id, open)}
            >
              {group.id === "animation" ? (
                <>
                  {group.fields.map((field) => {
                    if (field.kind !== "slider") return null;
                    const range = PARAM_RANGES[field.key];
                    const current = params[field.key];
                    return (
                      <div key={field.key} className="mde-field">
                        <div className="mde-field__row">
                          <Label htmlFor={`mde-${componentId}-${field.key}`}>
                            {PARAM_LABELS[field.key] ?? field.key}
                          </Label>
                          <span>{formatValue(current)}</span>
                        </div>
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
                  })}
                  <AnimationPanel
                    value={animation}
                    onChange={setAnimation}
                    idPrefix={`mde-${componentId}-anim`}
                  />
                </>
              ) : group.id === "interaction" ? (
                <>
                  {group.fields.map((field) => {
                    if (field.kind !== "slider") return null;
                    const range = PARAM_RANGES[field.key];
                    const current = params[field.key];
                    return (
                      <div key={field.key} className="mde-field">
                        <div className="mde-field__row">
                          <Label htmlFor={`mde-${componentId}-${field.key}`}>
                            {PARAM_LABELS[field.key] ?? field.key}
                          </Label>
                          <span>{formatValue(current)}</span>
                        </div>
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
                  })}
                  <InteractionPanel
                    value={interaction}
                    onChange={setInteraction}
                    idPrefix={`mde-${componentId}-ix`}
                  />
                </>
              ) : (
                group.fields.map((field) => {
                  if (field.kind === "ditherSize") {
                    return (
                      <div key="ditherSize" className="mde-field">
                        <span className="mde-field__label">Dither Size</span>
                        <div className="mde-preset-row">
                          {DITHER_SIZES.map((size) => (
                            <button
                              key={size}
                              type="button"
                              className={cn(
                                "mde-chip",
                                params.ditherSize === size && "mde-chip--active",
                              )}
                              aria-pressed={params.ditherSize === size}
                              onClick={() =>
                                setParams((p) => ({ ...p, ditherSize: size }))
                              }
                            >
                              {size}×{size}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  const range = PARAM_RANGES[field.key];
                  const current = params[field.key];
                  return (
                    <div key={field.key} className="mde-field">
                      <div className="mde-field__row">
                        <Label htmlFor={`mde-${componentId}-${field.key}`}>
                          {PARAM_LABELS[field.key] ?? field.key}
                        </Label>
                        <span>{formatValue(current)}</span>
                      </div>
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
                })
              )}
            </Collapsible>
          ))}

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
              <code>params: MonochromeParams</code>,{" "}
              <code>animation?: AnimationEngineConfig</code>,{" "}
              <code>interaction?: InteractionEngineConfig</code>,{" "}
              <code>reducedMotion?: boolean</code>,{" "}
              <code>className?: string</code>.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Collapsible({
  title,
  open,
  onOpenChange,
  children,
}: {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <div className="mde-panel">
      <button
        type="button"
        className="mde-panel__toggle"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        <span>{title}</span>
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open ? <div className="mde-panel__body">{children}</div> : null}
    </div>
  );
}
