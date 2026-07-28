"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DITHER_SIZES, PARAM_RANGES } from "../constants";
import type { DitherSize, MonochromeParams } from "../types";
import { cn } from "@/lib/utils";

type MaterialControlsProps = {
  value: MonochromeParams;
  onChange: (next: MonochromeParams) => void;
  className?: string;
};

const SLIDER_KEYS = Object.keys(PARAM_RANGES) as (keyof typeof PARAM_RANGES)[];

const LABELS: Partial<Record<keyof MonochromeParams, string>> = {
  posterization: "Posterization",
  noiseScale: "Noise Scale",
  noiseSpeed: "Noise Speed",
  contrast: "Contrast",
  brightness: "Brightness",
  gradientAngle: "Gradient Angle",
  gradientColorA: "Gradient Dark",
  gradientColorB: "Gradient Light",
  bloom: "Bloom",
  bloomRadius: "Bloom Radius",
  grainAmount: "Grain Amount",
  pixelDensity: "Pixel Density",
  shadowStrength: "Shadow Strength",
  highlightStrength: "Highlight Strength",
  softEdge: "Soft Edge",
  randomSeed: "Random Seed",
  animationSpeed: "Animation Speed",
  cursorInfluence: "Cursor Influence",
  scrollInfluence: "Scroll Influence",
  depth: "Depth",
  lightX: "Light X",
  lightY: "Light Y",
  opacity: "Opacity",
  blueNoiseAmount: "Blue Noise",
};

function formatValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2);
}

/**
 * Lab-only realtime material controls (not part of product barrel).
 */
export function MaterialControls({
  value,
  onChange,
  className,
}: MaterialControlsProps) {
  return (
    <div
      className={cn("mse-controls", className)}
      role="group"
      aria-label="Material controls"
    >
      <div className="mse-controls__group">
        <span className="mse-controls__heading">Dither Size</span>
        <div className="mse-controls__dither" role="group" aria-label="Dither matrix size">
          {DITHER_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={cn(
                "mse-controls__chip",
                value.ditherSize === size && "mse-controls__chip--active",
              )}
              aria-pressed={value.ditherSize === size}
              onClick={() => onChange({ ...value, ditherSize: size as DitherSize })}
            >
              {size}×{size}
            </button>
          ))}
        </div>
      </div>

      {SLIDER_KEYS.map((key) => {
        const range = PARAM_RANGES[key];
        const current = value[key];
        return (
          <div key={key} className="mse-controls__row">
            <div className="mse-controls__label-row">
              <Label htmlFor={`mse-${key}`} className="mse-controls__label">
                {LABELS[key] ?? key}
              </Label>
              <span className="mse-controls__value">{formatValue(current)}</span>
            </div>
            <Slider
              id={`mse-${key}`}
              min={range.min}
              max={range.max}
              step={range.step}
              value={[current]}
              onValueChange={(vals) => {
                const next = Array.isArray(vals) ? vals[0] : vals;
                if (typeof next !== "number") return;
                onChange({ ...value, [key]: next });
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
