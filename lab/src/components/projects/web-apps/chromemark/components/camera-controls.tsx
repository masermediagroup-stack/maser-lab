"use client";

import type { CameraSettings, ViewPresetId } from "../types";
import { NumberSlider } from "./control-field";

type CameraControlsProps = {
  camera: CameraSettings;
  onChange: (patch: Partial<CameraSettings>) => void;
  onPreset: (preset: ViewPresetId) => void;
  onFit: () => void;
  onReset: () => void;
};

export function CameraControls({
  camera,
  onChange,
  onPreset,
  onFit,
  onReset,
}: CameraControlsProps) {
  return (
    <details className="chromemark-section">
      <summary>Camera</summary>
      <div className="chromemark-fields">
        <div className="chromemark-btn-row">
          <button type="button" className="chromemark-btn" onClick={() => onPreset("front")}>
            Front
          </button>
          <button
            type="button"
            className="chromemark-btn"
            onClick={() => onPreset("three-quarter-left")}
          >
            3/4 left
          </button>
          <button
            type="button"
            className="chromemark-btn"
            onClick={() => onPreset("three-quarter-right")}
          >
            3/4 right
          </button>
          <button
            type="button"
            className="chromemark-btn"
            onClick={() => onPreset("slight-top")}
          >
            Slight top
          </button>
        </div>
        <NumberSlider
          label="FOV"
          value={camera.fov}
          min={15}
          max={70}
          step={1}
          format={(v) => `${Math.round(v)}°`}
          onChange={(fov) => onChange({ fov })}
        />
        <NumberSlider
          label="Zoom / distance"
          value={camera.distance}
          min={0.7}
          max={12}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={(distance) => onChange({ distance })}
        />
        <NumberSlider
          label="Camera X (pan)"
          value={camera.panX}
          min={-2}
          max={2}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={(panX) => onChange({ panX })}
        />
        <NumberSlider
          label="Camera Y (pan)"
          value={camera.panY}
          min={-2}
          max={2}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={(panY) => onChange({ panY })}
        />
        <NumberSlider
          label="Object rotation X"
          value={camera.objectRotX}
          min={-180}
          max={180}
          step={1}
          format={(v) => `${Math.round(v)}°`}
          onChange={(objectRotX) => onChange({ objectRotX })}
        />
        <NumberSlider
          label="Object rotation Y"
          value={camera.objectRotY}
          min={-180}
          max={180}
          step={1}
          format={(v) => `${Math.round(v)}°`}
          onChange={(objectRotY) => onChange({ objectRotY })}
        />
        <NumberSlider
          label="Object rotation Z"
          value={camera.objectRotZ}
          min={-180}
          max={180}
          step={1}
          format={(v) => `${Math.round(v)}°`}
          onChange={(objectRotZ) => onChange({ objectRotZ })}
        />
        <div className="chromemark-btn-row">
          <button type="button" className="chromemark-btn" onClick={onFit}>
            Fit logo
          </button>
          <button type="button" className="chromemark-btn" onClick={onReset}>
            Reset camera
          </button>
        </div>
      </div>
    </details>
  );
}
