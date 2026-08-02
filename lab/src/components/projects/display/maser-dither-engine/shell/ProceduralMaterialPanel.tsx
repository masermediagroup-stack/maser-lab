"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  MATERIAL_FAMILIES,
  PROCEDURAL_MATERIALS,
  getMaterialDefinition,
  applyMaterialDefaults,
} from "../engine/material/catalog";
import {
  DEFAULT_MATERIAL_PARAMS,
  createDefaultLayers,
  type EngineMaterialId,
  type MaterialControlKey,
  type MaterialEngineConfig,
  type MaterialLayer,
  type MaterialSpecificParams,
} from "../engine/material/types";
import { cn } from "@/lib/utils";

type ProceduralMaterialPanelProps = {
  value: MaterialEngineConfig;
  onChange: (next: MaterialEngineConfig) => void;
  idPrefix?: string;
  advanced?: boolean;
};

const CONTROL_LABELS: Partial<Record<MaterialControlKey, string>> = {
  structureAmount: "Structure Amount",
  interactionResponse: "Interaction Response",
  fiberDensity: "Fiber Density",
  fiberDirection: "Fiber Direction",
  surfaceGrain: "Surface Grain",
  absorption: "Absorption",
  edgeBleed: "Edge Bleed",
  paperWarmth: "Paper Warmth",
  inkSpread: "Ink Spread",
  wetness: "Wetness",
  bleed: "Bleed",
  edgePooling: "Edge Pooling",
  smear: "Smear",
  density: "Density",
  napDirection: "Nap Direction",
  sheenWidth: "Sheen Width",
  sheenIntensity: "Sheen Intensity",
  fiberSoftness: "Fiber Softness",
  shadowDepth: "Shadow Depth",
  roughness: "Roughness",
  reflectivity: "Reflectivity",
  brushedDirection: "Brushed Direction",
  anisotropy: "Anisotropy",
  oxidation: "Oxidation",
  scratches: "Scratches",
  curl: "Curl",
  dissipation: "Dissipation",
  turbulence: "Turbulence",
  drift: "Drift",
  expansion: "Expansion",
  softness: "Softness",
  diffusion: "Diffusion",
  visibilityThreshold: "Visibility Threshold",
  formationScale: "Formation Scale",
  billow: "Billow",
  edgeBreakup: "Edge Breakup",
  layerCount: "Layer Count",
  refraction: "Refraction",
  frost: "Frost",
  clarity: "Clarity",
  edgeThickness: "Edge Thickness",
  tintAmount: "Tint",
  reflectionBanding: "Reflection Banding",
  highlightWidth: "Highlight Width",
  curvature: "Curvature",
  edgeBrightness: "Edge Brightness",
  scanlineDensity: "Scanline Density",
  phosphorMask: "Phosphor Mask",
  flicker: "Flicker",
  crtCurvature: "CRT Curvature",
  chromaticSep: "Chromatic Separation",
  signalNoise: "Signal Noise",
};

function formatValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2);
}

/**
 * Material structure controls — only shows params for the active material.
 * Does not duplicate Color panel palette / exposure controls.
 */
export function ProceduralMaterialPanel({
  value,
  onChange,
  idPrefix = "mde-mat",
  advanced = false,
}: ProceduralMaterialPanelProps) {
  const def = getMaterialDefinition(value.materialId);
  const supported = def?.supportedControls ?? [
    "structureAmount",
    "interactionResponse",
  ];

  const selectMaterial = (id: EngineMaterialId) => {
    onChange({
      materialId: id,
      params: {
        ...DEFAULT_MATERIAL_PARAMS,
        ...applyMaterialDefaults(id),
        interactionResponse: value.params.interactionResponse,
      },
      layers: createDefaultLayers(id),
      lowQuality: value.lowQuality,
    });
  };

  const setParam = (key: MaterialControlKey, next: number) => {
    onChange({
      ...value,
      params: { ...value.params, [key]: next },
    });
  };

  const setLayer = (id: string, patch: Partial<MaterialLayer>) => {
    onChange({
      ...value,
      layers: value.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });
  };

  // Basic: structure + interaction + first 4 material-specific
  const materialSpecific = supported.filter(
    (k) => k !== "structureAmount" && k !== "interactionResponse",
  );
  const visibleKeys: MaterialControlKey[] = advanced
    ? supported
    : [
        "structureAmount" as MaterialControlKey,
        "interactionResponse" as MaterialControlKey,
        ...materialSpecific.slice(0, 4),
      ].filter((k, i, arr) => arr.indexOf(k) === i && supported.includes(k));

  return (
    <div className="mde-proc-mat">
      <div className="mde-field">
        <span className="mde-field__label">Material</span>
        <p className="mde-field__hint">
          Procedural structure — not a palette swap. Color lives in the Color
          panel.
        </p>
        <div className="mde-preset-row">
          {PROCEDURAL_MATERIALS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={cn(
                "mde-chip",
                value.materialId === m.id && "mde-chip--active",
              )}
              title={`${m.family} · ${m.performanceTier} · ${m.description}`}
              aria-pressed={value.materialId === m.id}
              onClick={() => selectMaterial(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {def ? (
        <div className="mde-mat-meta" aria-live="polite">
          <p>
            <strong>{def.label}</strong> · {def.family} · {def.performanceTier}
          </p>
          <p className="mde-field__hint">{def.description}</p>
          {advanced ? (
            <p className="mde-field__hint">
              Lighting: {def.lightingNotes} · Interaction: {def.interactionNotes}
            </p>
          ) : null}
        </div>
      ) : null}

      {visibleKeys.map((key) => {
        const current = value.params[key];
        const defVal = DEFAULT_MATERIAL_PARAMS[key];
        return (
          <div key={key} className="mde-field">
            <div className="mde-field__row">
              <Label htmlFor={`${idPrefix}-${key}`}>
                {CONTROL_LABELS[key] ?? key}
              </Label>
              <span className="mde-field__value-row">
                <span>{formatValue(current)}</span>
                <button
                  type="button"
                  className="mde-chip mde-chip--tiny"
                  title={`Reset (${formatValue(defVal)})`}
                  onClick={() => setParam(key, defVal)}
                >
                  ↺
                </button>
              </span>
            </div>
            <Slider
              id={`${idPrefix}-${key}`}
              min={0}
              max={1}
              step={0.01}
              value={[current]}
              onValueChange={(vals) => {
                const next = Array.isArray(vals) ? vals[0] : vals;
                if (typeof next === "number") setParam(key, next);
              }}
            />
          </div>
        );
      })}

      {advanced ? (
        <div className="mde-field">
          <span className="mde-field__label">Layer Recipe</span>
          <p className="mde-field__hint">
            Enable / bypass / solo layers. Value changes never recompile the
            shader.
          </p>
          <ul className="mde-layer-list">
            {value.layers.map((layer) => (
              <li key={layer.id} className="mde-layer-row">
                <span className="mde-layer-row__label">
                  {layer.label}
                  <em>{layer.type}</em>
                </span>
                <div className="mde-layer-row__actions">
                  <button
                    type="button"
                    className={cn(
                      "mde-chip mde-chip--tiny",
                      layer.enabled && !layer.bypass && "mde-chip--active",
                    )}
                    aria-pressed={layer.enabled && !layer.bypass}
                    onClick={() =>
                      setLayer(layer.id, {
                        enabled: !layer.enabled,
                        bypass: false,
                      })
                    }
                  >
                    On
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "mde-chip mde-chip--tiny",
                      layer.bypass && "mde-chip--active",
                    )}
                    aria-pressed={layer.bypass}
                    onClick={() =>
                      setLayer(layer.id, { bypass: !layer.bypass })
                    }
                  >
                    Bypass
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "mde-chip mde-chip--tiny",
                      layer.solo && "mde-chip--active",
                    )}
                    aria-pressed={layer.solo}
                    onClick={() => setLayer(layer.id, { solo: !layer.solo })}
                  >
                    Solo
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mde-preset-row" style={{ marginTop: 8 }}>
            <button
              type="button"
              className="mde-chip"
              onClick={() =>
                onChange({
                  ...value,
                  layers: createDefaultLayers(value.materialId),
                })
              }
            >
              Reset layers
            </button>
            <button
              type="button"
              className={cn(
                "mde-chip",
                value.lowQuality && "mde-chip--active",
              )}
              aria-pressed={value.lowQuality}
              onClick={() =>
                onChange({ ...value, lowQuality: !value.lowQuality })
              }
            >
              Low quality
            </button>
          </div>
        </div>
      ) : (
        <p className="mde-field__hint">
          Families: {MATERIAL_FAMILIES.map((f) => f.label).join(" · ")}. Switch
          to Advanced for the layer stack.
        </p>
      )}
    </div>
  );
}

export function createInitialMaterialConfig(
  materialId: EngineMaterialId = "monochrome",
): MaterialEngineConfig {
  return {
    materialId,
    params: {
      ...DEFAULT_MATERIAL_PARAMS,
      ...applyMaterialDefaults(materialId),
    },
    layers: createDefaultLayers(materialId),
    lowQuality: false,
  };
}

export type { MaterialSpecificParams };
