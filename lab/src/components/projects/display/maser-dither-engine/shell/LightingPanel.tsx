"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  DEFAULT_LIGHT_SHAPE,
  LIGHTING_PRESETS,
} from "../engine/lighting";
import type {
  FalloffCurveId,
  LightShapeConfig,
  LightShapeId,
} from "../engine/lighting/types";
import { cn } from "@/lib/utils";

type LightingPanelProps = {
  value: LightShapeConfig;
  onChange: (next: LightShapeConfig) => void;
  idPrefix?: string;
};

const SHAPES: { id: LightShapeId; label: string }[] = [
  { id: "radial", label: "Radial" },
  { id: "ellipse", label: "Ellipse" },
  { id: "linear", label: "Linear" },
  { id: "cone", label: "Cone" },
  { id: "organic", label: "Organic" },
];

const CURVES: { id: FalloffCurveId; label: string }[] = [
  { id: "linear", label: "Linear" },
  { id: "smooth", label: "Smooth" },
  { id: "power", label: "Power" },
  { id: "gaussian", label: "Gaussian" },
];

function formatValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2);
}

function matchesPreset(value: LightShapeConfig, config: LightShapeConfig): boolean {
  return (
    value.shape === config.shape &&
    Math.abs(value.centerX - config.centerX) < 0.02 &&
    Math.abs(value.centerY - config.centerY) < 0.02 &&
    Math.abs(value.radius - config.radius) < 0.03 &&
    Math.abs(value.coreBrightness - config.coreBrightness) < 0.04 &&
    Math.abs(value.lightContrast - config.lightContrast) < 0.08
  );
}

/**
 * Light-shape luminance controls — separate from color gradients.
 */
export function LightingPanel({
  value,
  onChange,
  idPrefix = "mde-ls",
}: LightingPanelProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(() => {
    const hit = LIGHTING_PRESETS.find((p) => matchesPreset(value, p.config));
    return hit?.id ?? "center-bloom";
  });

  const patch = (partial: Partial<LightShapeConfig>) => {
    setSelectedPresetId(null);
    onChange({ ...value, ...partial });
  };

  return (
    <div className="mde-light-panel">
      <div className="mde-field">
        <span className="mde-field__label">Lighting Presets</span>
        <div className="mde-preset-row" role="listbox" aria-label="Lighting presets">
          {LIGHTING_PRESETS.map((p) => {
            const active =
              selectedPresetId === p.id || matchesPreset(value, p.config);
            return (
              <button
                key={p.id}
                type="button"
                role="option"
                className={cn("mde-chip", active && "mde-chip--active")}
                aria-selected={active}
                title={p.description}
                onClick={() => {
                  setSelectedPresetId(p.id);
                  onChange({ ...DEFAULT_LIGHT_SHAPE, ...p.config });
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mde-field">
        <span className="mde-field__label">Light Shape</span>
        <div className="mde-preset-row">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={cn(
                "mde-chip",
                value.shape === s.id && "mde-chip--active",
              )}
              aria-pressed={value.shape === s.id}
              onClick={() => patch({ shape: s.id })}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {(
        [
          ["centerX", "Light Center X", 0, 1],
          ["centerY", "Light Center Y", 0, 1],
          ["radius", "Radius", 0.08, 1],
          ["stretchX", "Stretch X", 0.35, 2],
          ["stretchY", "Stretch Y", 0.35, 2],
          ["rotation", "Rotation", 0, 360],
          ["coreBrightness", "Core Brightness", 0.4, 1],
          ["edgeDarkness", "Edge Darkness", 0, 0.55],
          ["falloff", "Falloff", 0, 1],
          ["lightContrast", "Light Contrast", 0.6, 2],
          ["ditherResponse", "Dither Response", 0, 1],
          ["pointerFollow", "Pointer Follow", 0, 1],
        ] as const
      ).map(([key, label, min, max]) => (
        <div key={key} className="mde-field">
          <div className="mde-field__row">
            <Label htmlFor={`${idPrefix}-${key}`}>{label}</Label>
            <span>{formatValue(value[key])}</span>
          </div>
          <Slider
            id={`${idPrefix}-${key}`}
            min={min}
            max={max}
            step={key === "rotation" ? 1 : 0.01}
            value={[value[key]]}
            onValueChange={(vals) => {
              const next = Array.isArray(vals) ? vals[0] : vals;
              if (typeof next === "number") patch({ [key]: next });
            }}
          />
        </div>
      ))}

      <div className="mde-field">
        <span className="mde-field__label">Falloff Curve</span>
        <div className="mde-preset-row">
          {CURVES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={cn(
                "mde-chip",
                value.falloffCurve === c.id && "mde-chip--active",
              )}
              aria-pressed={value.falloffCurve === c.id}
              onClick={() => patch({ falloffCurve: c.id })}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mde-field">
        <div className="mde-field__row">
          <Label htmlFor={`${idPrefix}-grad-follow`}>Gradient Follows Light</Label>
          <button
            type="button"
            id={`${idPrefix}-grad-follow`}
            className={cn(
              "mde-chip",
              value.gradientFollowsLight && "mde-chip--active",
            )}
            aria-pressed={value.gradientFollowsLight}
            onClick={() =>
              patch({ gradientFollowsLight: !value.gradientFollowsLight })
            }
          >
            {value.gradientFollowsLight ? "On" : "Off"}
          </button>
        </div>
      </div>
    </div>
  );
}
