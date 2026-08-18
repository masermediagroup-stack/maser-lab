"use client";

import { MATERIAL_PRESETS } from "../defaults";
import type { ChromePresetId, MaterialSettings } from "../types";
import { NumberSlider } from "./control-field";

const PRESETS: { id: ChromePresetId; label: string }[] = [
  { id: "mirror-chrome", label: "Mirror Chrome" },
  { id: "polished-silver", label: "Polished Silver" },
  { id: "dark-chrome", label: "Dark Chrome" },
  { id: "brushed-steel", label: "Brushed Steel" },
];

type MaterialControlsProps = {
  material: MaterialSettings;
  onChange: (patch: Partial<MaterialSettings>) => void;
  onReset: () => void;
};

export function MaterialControls({
  material,
  onChange,
  onReset,
}: MaterialControlsProps) {
  return (
    <details className="chromemark-section" open>
      <summary>Material</summary>
      <div className="chromemark-fields">
        <div className="chromemark-btn-row" role="group" aria-label="Chrome preset">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="chromemark-btn"
              aria-pressed={material.preset === preset.id}
              onClick={() =>
                onChange({ preset: preset.id, ...MATERIAL_PRESETS[preset.id] })
              }
            >
              {preset.label}
            </button>
          ))}
        </div>
        <NumberSlider
          label="Metalness"
          value={material.metalness}
          min={0}
          max={1}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={(metalness) => onChange({ metalness })}
        />
        <NumberSlider
          label="Roughness"
          value={material.roughness}
          min={0}
          max={1}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={(roughness) => onChange({ roughness })}
        />
        <div className="chromemark-field">
          <label htmlFor="chromemark-tint">Chrome tint</label>
          <input
            id="chromemark-tint"
            type="color"
            value={material.tint}
            onChange={(event) => onChange({ tint: event.target.value })}
            aria-label="Chrome tint"
          />
        </div>
        <NumberSlider
          label="Brushed amount"
          value={material.brushedAmount}
          min={0}
          max={1}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={(brushedAmount) => onChange({ brushedAmount })}
        />
        <NumberSlider
          label="Brushed direction"
          value={material.brushedDirection}
          min={0}
          max={360}
          step={1}
          format={(v) => `${Math.round(v)}°`}
          onChange={(brushedDirection) => onChange({ brushedDirection })}
        />
        <button type="button" className="chromemark-btn" onClick={onReset}>
          Reset chrome
        </button>
      </div>
    </details>
  );
}
