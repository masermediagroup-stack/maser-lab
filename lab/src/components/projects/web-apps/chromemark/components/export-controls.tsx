"use client";

import { EXPORT_PRESETS } from "../defaults";
import type { ExportSettings } from "../types";
import { NumberSlider, ToggleRow } from "./control-field";

type ExportControlsProps = {
  exportSettings: ExportSettings;
  webmSupported: boolean | null;
  hasLogo: boolean;
  onChange: (patch: Partial<ExportSettings>) => void;
  onStill: () => void;
  onSequence: () => void;
  onWebM: () => void;
};

export function ExportControls({
  exportSettings,
  webmSupported,
  hasLogo,
  onChange,
  onStill,
  onSequence,
  onWebM,
}: ExportControlsProps) {
  return (
    <details className="chromemark-section" open>
      <summary>Export</summary>
      <div className="chromemark-fields">
        <div className="chromemark-btn-row" role="group" aria-label="Still size">
          {(
            [
              ["1080-square", "1080²"],
              ["1920x1080", "1920×1080"],
              ["1080x1920", "1080×1920"],
              ["2048-square", "2048²"],
              ["3840x2160", "4K"],
              ["custom", "Custom"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="chromemark-btn"
              aria-pressed={exportSettings.stillPreset === id}
              onClick={() => {
                if (id === "custom") {
                  onChange({ stillPreset: "custom" });
                  return;
                }
                const size = EXPORT_PRESETS[id];
                onChange({
                  stillPreset: id,
                  width: size.width,
                  height: size.height,
                });
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="chromemark-field-row">
          <label htmlFor="chromemark-w">Width</label>
          <input
            id="chromemark-w"
            type="number"
            min={64}
            max={8192}
            value={exportSettings.width}
            onChange={(event) => {
              const width = Number(event.target.value);
              const height = exportSettings.lockAspect
                ? Math.round(
                    width *
                      (exportSettings.height / Math.max(exportSettings.width, 1)),
                  )
                : exportSettings.height;
              onChange({ stillPreset: "custom", width, height });
            }}
          />
        </div>
        <div className="chromemark-field-row">
          <label htmlFor="chromemark-h">Height</label>
          <input
            id="chromemark-h"
            type="number"
            min={64}
            max={8192}
            value={exportSettings.height}
            onChange={(event) => {
              const height = Number(event.target.value);
              const width = exportSettings.lockAspect
                ? Math.round(
                    height *
                      (exportSettings.width / Math.max(exportSettings.height, 1)),
                  )
                : exportSettings.width;
              onChange({ stillPreset: "custom", width, height });
            }}
          />
        </div>
        <ToggleRow
          label="Lock aspect"
          pressed={exportSettings.lockAspect}
          onToggle={() => onChange({ lockAspect: !exportSettings.lockAspect })}
        />
        <div className="chromemark-btn-row" role="group" aria-label="Sequence FPS">
          {([24, 30, 60] as const).map((fps) => (
            <button
              key={fps}
              type="button"
              className="chromemark-btn"
              aria-pressed={exportSettings.sequenceFps === fps}
              onClick={() => onChange({ sequenceFps: fps })}
            >
              {fps} fps
            </button>
          ))}
        </div>
        <NumberSlider
          label="Duration (s)"
          value={exportSettings.sequenceDuration}
          min={1}
          max={12}
          step={0.5}
          format={(v) => v.toFixed(1)}
          onChange={(sequenceDuration) => onChange({ sequenceDuration })}
        />
        <NumberSlider
          label="Turns"
          value={exportSettings.sequenceTurns}
          min={0.5}
          max={2}
          step={0.5}
          format={(v) => v.toFixed(1)}
          onChange={(sequenceTurns) => onChange({ sequenceTurns })}
        />
        <button
          type="button"
          className="chromemark-btn"
          disabled={!hasLogo}
          onClick={onStill}
        >
          Download PNG
        </button>
        <button
          type="button"
          className="chromemark-btn"
          disabled={!hasLogo}
          onClick={onSequence}
        >
          PNG sequence ZIP
        </button>
        <button
          type="button"
          className="chromemark-btn"
          disabled={!hasLogo || webmSupported === false}
          onClick={onWebM}
        >
          Transparent WebM
        </button>
        {webmSupported === false ? (
          <p className="chromemark-notice">
            Transparent WebM isn&apos;t supported by this browser. Export a PNG
            sequence instead.
          </p>
        ) : null}
      </div>
    </details>
  );
}
