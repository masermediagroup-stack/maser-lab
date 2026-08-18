"use client";

import type { EnvironmentSettings } from "../types";
import { NumberSlider } from "./control-field";

type LightingControlsProps = {
  environment: EnvironmentSettings;
  onChange: (patch: Partial<EnvironmentSettings>) => void;
  onReset: () => void;
};

export function LightingControls({
  environment,
  onChange,
  onReset,
}: LightingControlsProps) {
  return (
    <details className="chromemark-section" open>
      <summary>Lighting</summary>
      <div className="chromemark-fields">
        <NumberSlider
          label="Environment intensity"
          value={environment.envIntensity}
          min={0.2}
          max={4}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={(envIntensity) => onChange({ envIntensity })}
        />
        <NumberSlider
          label="Exposure"
          value={environment.exposure}
          min={0.4}
          max={2.4}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={(exposure) => onChange({ exposure })}
        />
        <NumberSlider
          label="Key reflection width"
          value={environment.keyWidth}
          min={1.5}
          max={8}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={(keyWidth) => onChange({ keyWidth })}
        />
        <NumberSlider
          label="Key reflection angle"
          value={environment.keyAngle}
          min={0}
          max={360}
          step={1}
          format={(v) => `${Math.round(v)}°`}
          onChange={(keyAngle) => onChange({ keyAngle })}
        />
        <NumberSlider
          label="Strip highlight strength"
          value={environment.stripStrength}
          min={0}
          max={2}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={(stripStrength) => onChange({ stripStrength })}
        />
        <NumberSlider
          label="Strip highlight width"
          value={environment.stripWidth}
          min={0.08}
          max={1.2}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={(stripWidth) => onChange({ stripWidth })}
        />
        <NumberSlider
          label="Dark blocker strength"
          value={environment.blockerStrength}
          min={0}
          max={1}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={(blockerStrength) => onChange({ blockerStrength })}
        />
        <NumberSlider
          label="Environment rotation"
          value={environment.envRotation}
          min={0}
          max={360}
          step={1}
          format={(v) => `${Math.round(v)}°`}
          onChange={(envRotation) => onChange({ envRotation })}
        />
        <button type="button" className="chromemark-btn" onClick={onReset}>
          Reset studio
        </button>
      </div>
    </details>
  );
}
