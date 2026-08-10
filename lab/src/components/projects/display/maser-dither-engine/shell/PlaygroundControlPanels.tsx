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
import {
  PANEL_CATEGORY_LABELS,
  PANEL_CATEGORY_ORDER,
} from "../lib/persistence";
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
import { ComponentInspector } from "./ComponentInspector";
import { BasePlateControl } from "./BasePlateControl";
import type { SourceImageValue } from "./SourceImageField";
import { StudioSlider } from "./studio/StudioSlider";
import { cn } from "@/lib/utils";

export type ControlPanelBundle = {
  beginner: boolean;
  advanced: boolean;
  panels: ControlGroupState;
  setPanel: (id: ControlGroupId, open: boolean) => void;
  /** Exclusive category focus (desktop rail / mobile tab). */
  exclusiveCategory?: ControlGroupId;
  onSelectCategory?: (id: ControlGroupId) => void;
  /** Desktop: show single-select category list. */
  showCategoryRail?: boolean;
  /** Advanced/Debug: allow multiple panels open (stack mode). */
  expandAll?: boolean;
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
  /** When set, show these groups in addition to / instead of a single focusGroup match. */
  focusGroups?: Array<ControlGroupId | "presets" | "content" | "export">;
};

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
      <StudioSlider
        key={field.key}
        id={`mde-${componentId}-${field.key}`}
        label={PARAM_LABELS[field.key] ?? field.key}
        hint={tip}
        min={range.min}
        max={range.max}
        step={range.step}
        value={current}
        defaultValue={def}
        onChange={(next) => setParams((p) => ({ ...p, [field.key]: next }))}
      />
    );
  });
}

export function renderControlPanels(bundle: ControlPanelBundle) {
  const {
    beginner,
    advanced,
    panels,
    setPanel,
    exclusiveCategory,
    onSelectCategory,
    showCategoryRail,
    expandAll,
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
    focusGroups,
  } = bundle;

  const exclusive =
    Boolean(exclusiveCategory) && !expandAll && !focusGroups?.length && !focusGroup;

  const effectiveFocus = exclusive
    ? exclusiveCategory
    : focusGroup;
  const effectiveFocusGroups = exclusive
    ? exclusiveCategory === "colors"
      ? (["colors"] as Array<ControlGroupId>)
      : exclusiveCategory === "material"
        ? (["material"] as Array<ControlGroupId>)
        : undefined
    : focusGroups;

  const groupVisible = (id: ControlGroupId | "presets" | "content" | "export") => {
    if (effectiveFocusGroups && effectiveFocusGroups.length > 0) {
      return effectiveFocusGroups.includes(id);
    }
    if (!effectiveFocus) return true;
    return effectiveFocus === id;
  };

  const panelOpen = (id: ControlGroupId) => {
    if (exclusive || effectiveFocus || effectiveFocusGroups?.length) {
      return groupVisible(id);
    }
    return panels[id] ?? false;
  };

  /** Palette strip: Look tab (mobile), Palette category (exclusive), or legacy stack. */
  const paletteVisible = exclusive
    ? exclusiveCategory === "colors"
    : Boolean(focusGroups?.includes("colors")) ||
      effectiveFocus === "colors" ||
      (!effectiveFocus && !effectiveFocusGroups?.length);

  return (
    <>
      {showCategoryRail ? (
        <nav className="mde-category-rail" aria-label="Control categories">
          {PANEL_CATEGORY_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              className={cn(
                "mde-category-rail__item",
                (exclusiveCategory ?? "material") === id &&
                  "mde-category-rail__item--active",
              )}
              aria-current={
                (exclusiveCategory ?? "material") === id ? "true" : undefined
              }
              onClick={() => onSelectCategory?.(id)}
            >
              {PANEL_CATEGORY_LABELS[id]}
            </button>
          ))}
        </nav>
      ) : null}

      {/* Foundation choice — always first, before other settings */}
      <div className="mde-base-plate-strip">
        <BasePlateControl
          value={color}
          onChange={setColor}
          idPrefix={`mde-${componentId}-base`}
          compact
        />
      </div>

      {/* Palette — chroma only; not structure */}
      {paletteVisible ? (
        <div
          className="mde-palette-strip"
          aria-label="Palette presets and custom colors"
        >
          <span className="mde-field__label">Palette</span>
          <p className="mde-field__hint">
            Chroma only — structure looks live under Structure. Pick a palette,
            then tune slots with HEX / RGB / HSL.
          </p>
          <MaterialPanel
            value={color}
            onChange={setColor}
            onParamsHint={(hint) => setParams((p) => ({ ...p, ...hint }))}
            idPrefix={`mde-${componentId}-palette`}
            advanced={advanced}
            hideBasePlate
          />
        </div>
      ) : null}

      {groupVisible("presets") ? (
<Collapsible
  title="Presets"
  open={panelOpen("presets")}
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
      {groupVisible("content") ? (
<Collapsible
  title="Content"
  open={panelOpen("content")}
  onOpenChange={(open) => setPanel("content", open)}
>
  <ComponentInspector
    componentId={componentId}
    content={content}
    onChange={setContent}
    idPrefix={`mde-${componentId}-inspect`}
  />
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
            if (!groupVisible(group.id)) return false;
            // Color studio is Palette strip — accordion slot only for tone sliders.
            if (
              beginner &&
              !effectiveFocus &&
              !effectiveFocusGroups?.length &&
              (group.id === "noise" ||
                group.id === "rendering" ||
                group.id === "finish")
            ) {
              return false;
            }
            return true;
          }).map((group) => {
  const panelOff = Boolean(disabledPanels[group.id]);
  const title =
    group.id === "material"
      ? "Structure"
      : group.id === "colors"
        ? "Color tone"
        : group.label;
  return (
  <Collapsible
    key={group.id}
    title={title}
    open={panelOpen(group.id)}
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
        <p className="mde-field__hint">
          Palette editors are in the Palette section. These sliders adjust tone
          response only.
        </p>
        {renderParamFields(group.fields, {
          componentId,
          params,
          setParams,
          advanced,
        })}
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


      {groupVisible("export") ? (
<>
<Collapsible
  title="Export"
  open={panelOpen("export")}
  onOpenChange={(open) => setPanel("export", open)}
>
  <p className="mde-export-hint">
    Production export lives in the Export workspace — project files, presets,
    React components, packages, tokens, and shareable scenes.
  </p>
  <pre className="mde-export">{exportCode}</pre>
  <div className="mde-export-actions">
    <button
      type="button"
      className="mde-btn"
      onClick={() => void navigator.clipboard?.writeText(exportCode)}
    >
      Copy React snippet
    </button>
    <a className="mde-btn mde-btn--primary" href="#/export">
      Open Export workspace
    </a>
  </div>
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
