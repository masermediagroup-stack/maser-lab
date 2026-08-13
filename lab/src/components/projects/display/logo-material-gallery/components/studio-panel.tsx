"use client";

import { PARAM_RANGE } from "../constants";
import type { MaterialId, StudioParams } from "../types";
import { MATERIAL_LABEL, MATERIAL_ORDER } from "../constants";

type StudioPanelProps = {
  material: MaterialId;
  params: StudioParams;
  exporting: boolean;
  onMaterial: (id: MaterialId) => void;
  onParams: (patch: Partial<StudioParams>) => void;
  onExport: () => void;
  onReset: () => void;
};

function formatValue(key: keyof typeof PARAM_RANGE, value: number): string {
  if (key === "spinSpeed") return value.toFixed(2);
  if (key === "depth" || key === "scale") return value.toFixed(2);
  return value.toFixed(2);
}

function Slider({
  label,
  paramKey,
  value,
  onChange,
}: {
  label: string;
  paramKey: keyof typeof PARAM_RANGE;
  value: number;
  onChange: (value: number) => void;
}) {
  const range = PARAM_RANGE[paramKey];
  const id = `lmg-${paramKey}`;
  return (
    <div className="lmg-slider">
      <label className="lmg-slider-head" htmlFor={id}>
        <span>{label}</span>
        <span>{formatValue(paramKey, value)}</span>
      </label>
      <input
        id={id}
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

export function StudioPanel({
  material,
  params,
  exporting,
  onMaterial,
  onParams,
  onExport,
  onReset,
}: StudioPanelProps) {
  return (
    <aside className="lmg-panel" aria-label="Studio controls">
      <p className="lmg-panel-kicker">Material</p>
      <div className="lmg-mats" role="group" aria-label="Material">
        {MATERIAL_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            className="lmg-mat"
            aria-pressed={material === id}
            onClick={() => onMaterial(id)}
          >
            {MATERIAL_LABEL[id]}
          </button>
        ))}
      </div>

      <div className="lmg-sliders">
        <div className="lmg-spin-row">
          <Slider
            label="Spin"
            paramKey="spinSpeed"
            value={params.spinSpeed}
            onChange={(spinSpeed) => onParams({ spinSpeed })}
          />
          <button
            type="button"
            className="lmg-text-btn"
            aria-pressed={params.paused}
            onClick={() => onParams({ paused: !params.paused })}
          >
            {params.paused ? "Resume" : "Pause"}
          </button>
        </div>
        <Slider
          label="Scale"
          paramKey="scale"
          value={params.scale}
          onChange={(scale) => onParams({ scale })}
        />
        <Slider
          label="Depth"
          paramKey="depth"
          value={params.depth}
          onChange={(depth) => onParams({ depth })}
        />
        <Slider
          label="Key light"
          paramKey="keyLight"
          value={params.keyLight}
          onChange={(keyLight) => onParams({ keyLight })}
        />
        <Slider
          label="Environment"
          paramKey="envIntensity"
          value={params.envIntensity}
          onChange={(envIntensity) => onParams({ envIntensity })}
        />
      </div>

      <div className="lmg-actions">
        <button
          type="button"
          className="lmg-text-btn"
          onClick={onExport}
          disabled={exporting}
        >
          {exporting ? "Exporting" : "Export png"}
        </button>
        <button type="button" className="lmg-text-btn" onClick={onReset}>
          Reset
        </button>
      </div>
    </aside>
  );
}
