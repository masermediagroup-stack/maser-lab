"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  applyPaletteToConfig,
  MATERIAL_PALETTES,
} from "../engine/color/palettes";
import { MATERIAL_BEHAVIORS, applyBehavior } from "../engine/color/behaviors";
import type {
  BlendModeId,
  ColorMaterialConfig,
  GradientBehaviorId,
  GradientModeId,
  MaterialBehaviorId,
  MaterialColors,
  Rgb,
} from "../engine/color/types";
import { rgbToHex, hexToRgb, rgbToHsl, hslToRgb } from "../engine/color/types";
import { BasePlateControl } from "./BasePlateControl";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  /** When true, skip nested BasePlate (already pinned above in the playground). */
  hideBasePlate?: boolean;
};

type ColorEditMode = "hex" | "rgb" | "hsl";

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
  { id: "hue-cycle", label: "Hue Cycle / Palette" },
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

const COLOR_PICKERS: { key: keyof MaterialColors; label: string; hint: string }[] = [
  { key: "background", label: "Background", hint: "Plate behind the material" },
  { key: "ambient", label: "Material Color", hint: "Base material plate / ambient fill" },
  { key: "highlight", label: "Highlight", hint: "Core light / primary chroma" },
  { key: "shadow", label: "Shadow", hint: "Outer dark" },
  { key: "accent", label: "Accent", hint: "Midtone accent chroma" },
  { key: "dither", label: "Dither Color", hint: "Ink tint in dark regions" },
  { key: "bloom", label: "Bloom Color", hint: "Bloom tint" },
  { key: "glow", label: "Glow Color", hint: "Glow additive" },
  { key: "gradientStart", label: "Gradient Start", hint: "Gradient A" },
  { key: "gradientMid", label: "Gradient Mid", hint: "Gradient midpoint" },
  { key: "gradientEnd", label: "Gradient End", hint: "Gradient B" },
  { key: "gradientFourth", label: "Gradient 4th", hint: "Quad stop / palette cycle" },
  { key: "edgeTint", label: "Overlay Color", hint: "Edge overlay tint" },
  { key: "noiseTint", label: "Noise Tint", hint: "Scatter / grain tint" },
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
 * Palette studio + gradient / blend / color properties.
 * Procedural material structure lives in ProceduralMaterialPanel.
 */
export function MaterialPanel({
  value,
  onChange,
  onParamsHint,
  idPrefix = "mde-mat",
  advanced = false,
  hideBasePlate = false,
}: MaterialPanelProps) {
  const [colorMode, setColorMode] = useState<ColorEditMode>("hex");
  const [hexDrafts, setHexDrafts] = useState<Partial<Record<keyof MaterialColors, string>>>(
    {},
  );

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
    setHexDrafts((d) => {
      if (!(key in d)) return d;
      const nextDrafts = { ...d };
      delete nextDrafts[key];
      return nextDrafts;
    });
  };

  const setProp = (key: keyof ColorMaterialConfig["properties"], n: number) => {
    patch({ properties: { ...value.properties, [key]: n } });
  };

  return (
    <div className="mde-mat-panel">
      {!hideBasePlate ? (
        <div className="mde-field">
          <BasePlateControl
            value={value}
            onChange={onChange}
            idPrefix={`${idPrefix}-base`}
          />
        </div>
      ) : null}

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
        <span className="mde-field__label">Color behavior</span>
        <p className="mde-field__hint">
          Property presets for chroma response (structure still lives in Material).
        </p>
        <div className="mde-preset-row">
          {MATERIAL_BEHAVIORS.map((b) => (
            <button
              key={b.id}
              type="button"
              className={cn(
                "mde-chip",
                value.behavior === b.id && "mde-chip--active",
              )}
              aria-pressed={value.behavior === b.id}
              title={b.description}
              onClick={() => onChange(applyBehavior(value, b.id as MaterialBehaviorId))}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mde-field">
        <span className="mde-field__label">Material Colors</span>
        <p className="mde-field__hint">
          Full palette slots — Primary/Highlight, Secondary/Accent, gradients,
          dither, bloom, glow, overlay. Live picker + HEX / RGB / HSL editors.
        </p>
        <div className="mde-preset-row" role="group" aria-label="Color edit mode">
          {(
            [
              ["hex", "HEX"],
              ["rgb", "RGB"],
              ["hsl", "HSL"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={cn("mde-chip", colorMode === id && "mde-chip--active")}
              aria-pressed={colorMode === id}
              onClick={() => setColorMode(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mde-mat-colors">
          {COLOR_PICKERS.map(({ key, label, hint }) => {
            const c = value.colors[key];
            const hex = rgbToHex(c);
            const hsl = rgbToHsl(c);
            return (
              <div key={key} className="mde-mat-color" title={hint}>
                <span className="mde-mat-color__name">{label}</span>
                <input
                  type="color"
                  value={hex}
                  aria-label={`${label} picker`}
                  onChange={(e) => setColor(key, hexToRgb(e.target.value))}
                />
                {colorMode === "hex" ? (
                  <input
                    className="mde-mat-color__edit"
                    type="text"
                    spellCheck={false}
                    value={hexDrafts[key] ?? hex}
                    aria-label={`${label} HEX`}
                    onChange={(e) => {
                      const raw = e.target.value.trim();
                      setHexDrafts((d) => ({ ...d, [key]: raw }));
                      if (
                        /^#?[0-9a-fA-F]{6}$/.test(raw) ||
                        /^#?[0-9a-fA-F]{3}$/.test(raw)
                      ) {
                        setColor(
                          key,
                          hexToRgb(raw.startsWith("#") ? raw : `#${raw}`),
                        );
                      }
                    }}
                    onBlur={() => {
                      setHexDrafts((d) => {
                        if (!(key in d)) return d;
                        const nextDrafts = { ...d };
                        delete nextDrafts[key];
                        return nextDrafts;
                      });
                    }}
                  />
                ) : null}
                {colorMode === "rgb" ? (
                  <div className="mde-mat-color__channels" aria-label={`${label} RGB`}>
                    {(["r", "g", "b"] as const).map((ch) => (
                      <input
                        key={ch}
                        className="mde-mat-color__edit mde-mat-color__edit--ch"
                        type="number"
                        min={0}
                        max={255}
                        step={1}
                        value={Math.round(c[ch] * 255)}
                        aria-label={`${label} ${ch.toUpperCase()}`}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (!Number.isFinite(n)) return;
                          setColor(key, {
                            ...c,
                            [ch]: Math.min(255, Math.max(0, n)) / 255,
                          });
                        }}
                      />
                    ))}
                  </div>
                ) : null}
                {colorMode === "hsl" ? (
                  <div className="mde-mat-color__channels" aria-label={`${label} HSL`}>
                    <input
                      className="mde-mat-color__edit mde-mat-color__edit--ch"
                      type="number"
                      min={0}
                      max={360}
                      step={1}
                      value={Math.round(hsl.h)}
                      aria-label={`${label} H`}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (!Number.isFinite(n)) return;
                        setColor(key, hslToRgb({ ...hsl, h: n }));
                      }}
                    />
                    <input
                      className="mde-mat-color__edit mde-mat-color__edit--ch"
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round(hsl.s)}
                      aria-label={`${label} S`}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (!Number.isFinite(n)) return;
                        setColor(key, hslToRgb({ ...hsl, s: n }));
                      }}
                    />
                    <input
                      className="mde-mat-color__edit mde-mat-color__edit--ch"
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round(hsl.l)}
                      aria-label={`${label} L`}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (!Number.isFinite(n)) return;
                        setColor(key, hslToRgb({ ...hsl, l: n }));
                      }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {(advanced
        ? MATERIAL_PROP_SLIDERS
        : MATERIAL_PROP_SLIDERS.filter(
            ([key]) =>
              key === "exposure" ||
              key === "density" ||
              key === "materialWeight" ||
              key === "gamma" ||
              key === "threshold" ||
              key === "lightScatter",
          )
      ).map(([key, label, min, max, tip]) => (
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
