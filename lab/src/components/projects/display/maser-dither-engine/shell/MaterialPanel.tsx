"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  applyBehavior,
  MATERIAL_BEHAVIORS,
} from "../engine/color/behaviors";
import {
  applyPaletteToConfig,
  MATERIAL_PALETTES,
} from "../engine/color/palettes";
import type {
  BlendModeId,
  ColorMaterialConfig,
  GradientBehaviorId,
  GradientModeId,
  MaterialBehaviorId,
  MaterialColors,
  Rgb,
} from "../engine/color/types";
import { rgbToHex, hexToRgb } from "../engine/color/types";
import { cn } from "@/lib/utils";

type MaterialPanelProps = {
  value: ColorMaterialConfig;
  onChange: (next: ColorMaterialConfig) => void;
  onParamsHint?: (hint: {
    contrast?: number;
    brightness?: number;
    bloom?: number;
    grainAmount?: number;
    softEdge?: number;
  }) => void;
  idPrefix?: string;
  advanced?: boolean;
};

const GRADIENT_MODES: { id: GradientModeId; label: string }[] = [
  { id: "single", label: "Single" },
  { id: "dual", label: "Dual" },
  { id: "triple", label: "Triple" },
  { id: "quad", label: "Quad" },
  { id: "radial", label: "Radial" },
  { id: "angular", label: "Angular" },
  { id: "linear", label: "Linear" },
  { id: "animated", label: "Animated" },
  { id: "noise", label: "Noise" },
];

const GRADIENT_BEHAVIORS: { id: GradientBehaviorId; label: string }[] = [
  { id: "none", label: "None" },
  { id: "rotate", label: "Rotate" },
  { id: "expand", label: "Expand" },
  { id: "contract", label: "Contract" },
  { id: "flow", label: "Flow" },
  { id: "pulse", label: "Pulse" },
  { id: "orbit", label: "Orbit" },
  { id: "noise-drift", label: "Noise Drift" },
  { id: "hue-cycle", label: "Hue Cycle" },
  { id: "blend", label: "Blend" },
  { id: "mirror", label: "Mirror" },
];

const BLEND_MODES: { id: BlendModeId; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "multiply", label: "Multiply" },
  { id: "screen", label: "Screen" },
  { id: "overlay", label: "Overlay" },
  { id: "soft-light", label: "Soft Light" },
  { id: "hard-light", label: "Hard Light" },
  { id: "difference", label: "Difference" },
  { id: "exclusion", label: "Exclusion" },
  { id: "color-dodge", label: "Color Dodge" },
  { id: "luminosity", label: "Luminosity" },
];

const COLOR_PICKERS_BASIC: { key: keyof MaterialColors; label: string }[] = [
  { key: "highlight", label: "Core Light" },
  { key: "shadow", label: "Outer Dark" },
  { key: "dither", label: "Dither Ink" },
  { key: "gradientStart", label: "Gradient Start" },
  { key: "gradientEnd", label: "Gradient End" },
  { key: "glow", label: "Glow" },
  { key: "background", label: "Background" },
];

const COLOR_PICKERS_ADVANCED: { key: keyof MaterialColors; label: string }[] = [
  { key: "bloom", label: "Bloom Tint" },
  { key: "ambient", label: "Ambient" },
  { key: "accent", label: "Accent Midtone" },
  { key: "gradientMid", label: "Gradient Mid" },
  { key: "gradientFourth", label: "Gradient 4th" },
  { key: "edgeTint", label: "Edge Tint" },
  { key: "noiseTint", label: "Noise Tint" },
];

const MATERIAL_PROP_SLIDERS = [
  ["exposure", "Exposure", 0.4, 1.8, "Scene luminance before dither. Unlike Light Intensity."],
  ["gamma", "Gamma", 0.4, 2.2, "Tonal curve after exposure."],
  ["threshold", "Tone Gate", 0, 0.6, "Lifts the floor of the core↔outer mix (distinct from dither threshold bias)."],
  ["density", "Dither Ink Density", 0, 1, "How strongly dither ink tints dark outer regions."],
  ["sharpness", "Tonal Sharpness", 0, 1, "Expands midtones before color mapping."],
  ["smoothness", "Tone Gate Softness", 0, 1, "Softens the tone gate transition."],
  ["blur", "Ambient Soft Mix", 0, 1, "Soft ambient plate mix for fog-like behaviors."],
  ["materialWeight", "Material Weight", 0, 1, "Compositing influence of material plate vs background."],
  ["lightScatter", "Noise Scatter", 0, 1, "Mixes noise tint into the plate — not light falloff."],
] as const;

function formatValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2);
}

/**
 * Palette studio + gradient / blend / behavior / material properties.
 */
export function MaterialPanel({
  value,
  onChange,
  onParamsHint,
  idPrefix = "mde-mat",
  advanced = false,
}: MaterialPanelProps) {
  const patch = (partial: Partial<ColorMaterialConfig>) => {
    onChange({
      ...value,
      ...partial,
      colors: { ...value.colors, ...partial.colors },
      properties: { ...value.properties, ...partial.properties },
    });
  };

  const setColor = (key: keyof MaterialColors, next: Rgb) => {
    patch({ colors: { ...value.colors, [key]: next } });
  };

  const setProp = (key: keyof ColorMaterialConfig["properties"], n: number) => {
    patch({ properties: { ...value.properties, [key]: n } });
  };

  return (
    <div className="mde-mat-panel">
      <div className="mde-field">
        <div className="mde-field__row">
          <Label htmlFor={`${idPrefix}-enabled`}>Color materials</Label>
          <button
            type="button"
            id={`${idPrefix}-enabled`}
            className={cn(
              "mde-chip",
              value.colorEnabled && "mde-chip--active",
            )}
            aria-pressed={value.colorEnabled}
            onClick={() => patch({ colorEnabled: !value.colorEnabled })}
          >
            {value.colorEnabled ? "On" : "Off"}
          </button>
        </div>
      </div>

      <div className="mde-field">
        <span className="mde-field__label">Palette Studio</span>
        <div className="mde-preset-row mde-mat-palettes" role="listbox" aria-label="Palette studio">
          {MATERIAL_PALETTES.map((p) => {
            const selected = value.paletteId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={cn("mde-chip", selected && "mde-chip--active")}
                title={p.description}
                onClick={() => {
                  const next = applyPaletteToConfig(p.id, value);
                  onChange(next);
                  if (p.paramsHint) onParamsHint?.(p.paramsHint);
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mde-field">
        <span className="mde-field__label">Gradient Mode</span>
        <div className="mde-preset-row">
          {GRADIENT_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={cn(
                "mde-chip",
                value.gradientMode === m.id && "mde-chip--active",
              )}
              aria-pressed={value.gradientMode === m.id}
              onClick={() => patch({ gradientMode: m.id })}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mde-field">
        <span className="mde-field__label">Gradient Behavior</span>
        <div className="mde-preset-row">
          {GRADIENT_BEHAVIORS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={cn(
                "mde-chip",
                value.gradientBehavior === m.id && "mde-chip--active",
              )}
              aria-pressed={value.gradientBehavior === m.id}
              onClick={() => patch({ gradientBehavior: m.id })}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mde-field">
        <div className="mde-field__row">
          <Label htmlFor={`${idPrefix}-gspeed`}>Gradient Speed</Label>
          <span>{formatValue(value.gradientSpeed)}</span>
        </div>
        <Slider
          id={`${idPrefix}-gspeed`}
          min={0}
          max={2}
          step={0.01}
          value={[value.gradientSpeed]}
          onValueChange={(vals) => {
            const next = Array.isArray(vals) ? vals[0] : vals;
            if (typeof next === "number") patch({ gradientSpeed: next });
          }}
        />
      </div>

      <div className="mde-field">
        <div className="mde-field__row">
          <Label htmlFor={`${idPrefix}-goff`}>Gradient Offset</Label>
          <span>{formatValue(value.gradientOffset)}</span>
        </div>
        <Slider
          id={`${idPrefix}-goff`}
          min={-1}
          max={1}
          step={0.01}
          value={[value.gradientOffset]}
          onValueChange={(vals) => {
            const next = Array.isArray(vals) ? vals[0] : vals;
            if (typeof next === "number") patch({ gradientOffset: next });
          }}
        />
      </div>

      <div className="mde-field">
        <span className="mde-field__label">Blend Mode</span>
        <div className="mde-preset-row">
          {BLEND_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={cn(
                "mde-chip",
                value.blendMode === m.id && "mde-chip--active",
              )}
              aria-pressed={value.blendMode === m.id}
              onClick={() => patch({ blendMode: m.id })}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mde-field">
        <span className="mde-field__label">Material Behavior</span>
        <div className="mde-preset-row">
          {MATERIAL_BEHAVIORS.map((b) => (
            <button
              key={b.id}
              type="button"
              className={cn(
                "mde-chip",
                value.behavior === b.id && "mde-chip--active",
              )}
              title={b.description}
              aria-pressed={value.behavior === b.id}
              onClick={() =>
                onChange(applyBehavior(value, b.id as MaterialBehaviorId))
              }
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mde-field">
        <span className="mde-field__label">Material Colors</span>
        <div className="mde-mat-colors">
          {(advanced
            ? [...COLOR_PICKERS_BASIC, ...COLOR_PICKERS_ADVANCED]
            : COLOR_PICKERS_BASIC
          ).map(({ key, label }) => (
            <label key={key} className="mde-mat-color">
              <span>{label}</span>
              <input
                type="color"
                value={rgbToHex(value.colors[key])}
                aria-label={label}
                onChange={(e) => setColor(key, hexToRgb(e.target.value))}
              />
            </label>
          ))}
        </div>
      </div>

      {(advanced ? MATERIAL_PROP_SLIDERS : MATERIAL_PROP_SLIDERS.filter(
        ([key]) => key === "exposure" || key === "density" || key === "materialWeight",
      )).map(([key, label, min, max, tip]) => (
        <div key={key} className="mde-field">
          <div className="mde-field__row">
            <Label htmlFor={`${idPrefix}-${key}`} title={tip}>
              {label}
            </Label>
            <span>{formatValue(value.properties[key])}</span>
          </div>
          <p className="mde-field__hint">{tip}</p>
          <Slider
            id={`${idPrefix}-${key}`}
            min={min}
            max={max}
            step={0.01}
            value={[value.properties[key]]}
            onValueChange={(vals) => {
              const next = Array.isArray(vals) ? vals[0] : vals;
              if (typeof next === "number") setProp(key, next);
            }}
          />
        </div>
      ))}
    </div>
  );
}
