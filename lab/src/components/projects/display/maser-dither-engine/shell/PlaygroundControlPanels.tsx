"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { CONTROL_GROUPS } from "../lib/control-groups";
import {
  MONOCHROME_DEFAULTS,
  PARAM_LABELS,
  PARAM_RANGES,
  PARAM_TOOLTIPS,
} from "../constants";
import { createMonochromeMaterial } from "../engine/materials/MonochromeMaterial";
import { DEFAULT_DITHER_CONFIG, type DitherConfig } from "../engine/dither";
import { DEFAULT_LIGHT_SHAPE } from "../engine/lighting";
import type { LightShapeConfig } from "../engine/lighting/types";
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
import { DEFAULT_COLOR_MATERIAL } from "../engine/color/types";
import type { ColorMaterialConfig } from "../engine/color/types";
import type { MaterialEngineConfig } from "../engine/material/types";
import {
  DEFAULT_COMPONENT_CONTENT,
  type ComponentContent,
} from "../content/types";
import type {
  ComponentId,
  ControlGroupId,
  ControlGroupState,
  MonochromeParams,
  PresetDefinition,
} from "../types";
import { AnimationPanel } from "./AnimationPanel";
import { InteractionPanel } from "./InteractionPanel";
import { MaterialPanel } from "./MaterialPanel";
import {
  ProceduralMaterialPanel,
  createInitialMaterialConfig,
} from "./ProceduralMaterialPanel";
import { LightingPanel } from "./LightingPanel";
import { DitherPanel } from "./DitherPanel";
import { ContentEditor } from "./ContentEditor";
import type { SourceImageValue } from "./SourceImageField";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export type ControlPanelBundle = {
  beginner: boolean;
  advanced: boolean;
  panels: ControlGroupState;
  setPanel: (id: ControlGroupId, open: boolean) => void;
  presets: PresetDefinition[];
  presetId: string;
  setPresetId: (id: string) => void;
  params: MonochromeParams;
  setParams: Dispatch<SetStateAction<MonochromeParams>>;
  animation: AnimationEngineConfig;
  setAnimation: Dispatch<SetStateAction<AnimationEngineConfig>>;
  interaction: InteractionEngineConfig;
  setInteraction: Dispatch<SetStateAction<InteractionEngineConfig>>;
  color: ColorMaterialConfig;
  setColor: Dispatch<SetStateAction<ColorMaterialConfig>>;
  light: LightShapeConfig;
  setLight: Dispatch<SetStateAction<LightShapeConfig>>;
  dither: DitherConfig;
  setDither: Dispatch<SetStateAction<DitherConfig>>;
  material: MaterialEngineConfig;
  setMaterial: Dispatch<SetStateAction<MaterialEngineConfig>>;
  content: ComponentContent;
  setContent: Dispatch<SetStateAction<ComponentContent>>;
  source: SourceImageValue;
  setSource: Dispatch<SetStateAction<SourceImageValue>>;
  compareDither: DitherConfig | null;
  setCompareDither: Dispatch<SetStateAction<DitherConfig | null>>;
  compareMaterial: MaterialEngineConfig | null;
  setCompareMaterial: Dispatch<SetStateAction<MaterialEngineConfig | null>>;
  disabledPanels: Partial<Record<ControlGroupId, boolean>>;
  setDisabledPanels: Dispatch<
    SetStateAction<Partial<Record<ControlGroupId, boolean>>>
  >;
  componentId: ComponentId;
  definition: {
    purpose: string;
    bestUses: string[];
    performanceNotes: string;
    a11yNotes: string;
    mobileNotes: string;
  };
  exportCode: string;
  focusGroup?: ControlGroupId | "presets" | "content" | "export";
};

function formatValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2);
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

function initialContent(): ComponentContent {
  return {
    ...DEFAULT_COMPONENT_CONTENT,
    navItems: [...DEFAULT_COMPONENT_CONTENT.navItems],
  };
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
          <Label htmlFor={`mde-${componentId}-${field.key}`} title={tip}>
            {PARAM_LABELS[field.key] ?? field.key}
          </Label>
          <span className="mde-field__value-row">
            <span>{formatValue(current)}</span>
            <button
              type="button"
              className="mde-chip mde-chip--tiny"
              title={`Reset to default (${formatValue(def)})`}
              onClick={() => setParams((p) => ({ ...p, [field.key]: def }))}
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

export function renderControlPanels(bundle: ControlPanelBundle) {
  const {
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
    setCompareMaterial,
    disabledPanels,
    setDisabledPanels,
    componentId,
    definition,
    exportCode,
    focusGroup,
  } = bundle;

  return (
    <>
      {(!focusGroup || focusGroup === "presets") ? (
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
          if (p.material) {
            setMaterial(
              createInitialMaterialConfig(
                p.material.materialId ?? p.materialId ?? "monochrome",
              ),
            );
            setMaterial((m) => ({
              ...m,
              ...p.material,
              params: {
                ...m.params,
                ...(p.material?.params ?? {}),
              },
              layers: p.material?.layers ?? m.layers,
            }));
          } else if (p.materialId && p.materialId !== "monochrome") {
            setMaterial(createInitialMaterialConfig(p.materialId));
          }
          if (p.color) {
            setColor((c) => ({
              ...c,
              ...p.color,
              colors: { ...c.colors, ...(p.color?.colors ?? {}) },
              properties: {
                ...c.properties,
                ...(p.color?.properties ?? {}),
              },
            }));
          }
          if (p.animation) {
            setAnimation((a) => ({ ...a, ...p.animation }));
          }
          if (p.interaction) {
            setInteraction((ix) => ({ ...ix, ...p.interaction }));
          }
          setCompareMaterial(null);
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
      }}
    >
      Reset
    </button>
  </div>
</Collapsible>


      ) : null}
      {(!focusGroup || focusGroup === "content") ? (
<Collapsible
  title="Content"
  open={panels.content}
  onOpenChange={(open) => setPanel("content", open)}
>
  <ContentEditor
    componentId={componentId}
    value={content}
    onChange={setContent}
    source={source}
    onSourceChange={setSource}
    idPrefix={`mde-${componentId}-content`}
  />
</Collapsible>


      ) : null}
{CONTROL_GROUPS.filter((group) => {
            if (focusGroup && focusGroup !== group.id) return false;
            if (
              beginner &&
              !focusGroup &&
              (group.id === "noise" ||
                group.id === "rendering" ||
                group.id === "finish")
            ) {
              return false;
            }
            return true;
          }).map((group) => {
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

    {group.id === "material" ? (
      <ProceduralMaterialPanel
        value={
          panelOff
            ? {
                ...material,
                params: {
                  ...material.params,
                  structureAmount: 0,
                },
              }
            : material
        }
        onChange={(next) => {
          setMaterial(next);
          setCompareMaterial(null);
        }}
        idPrefix={`mde-${componentId}-proc`}
        advanced={advanced}
      />
    ) : group.id === "animation" ? (
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


      {(!focusGroup || focusGroup === "export") ? (
<>
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
    <code>light</code>, <code>dither</code>, <code>material</code>,{" "}
    <code>content</code>, <code>reducedMotion</code>.
  </p>
</section>
</>
      ) : null}

    </>
  );
}
