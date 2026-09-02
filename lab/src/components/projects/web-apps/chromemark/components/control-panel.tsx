"use client";

import {
  ANIMATION_DEFAULTS,
  CAMERA_DEFAULTS,
  ENVIRONMENT_DEFAULTS,
  GEOMETRY_DEFAULTS,
  MATERIAL_DEFAULTS,
  TRACE_DEFAULTS,
} from "../defaults";
import { loadSavedPresets, savePresets } from "../store";
import type {
  AnimationSettings,
  CameraSettings,
  ChromeMarkSettings,
  EnvironmentSettings,
  ExportSettings,
  GeometrySettings,
  LogoInfo,
  MaterialSettings,
  PreviewBackdropId,
  SavedRendererPreset,
  TraceSettings,
  ViewPresetId,
} from "../types";
import { AnimationControls } from "./animation-controls";
import { CameraControls } from "./camera-controls";
import { ExportControls } from "./export-controls";
import { GeometryControls } from "./geometry-controls";
import { LightingControls } from "./lighting-controls";
import { MaterialControls } from "./material-controls";
import { PreviewBackdrop } from "./preview-backdrop";
import { useState } from "react";

type ControlPanelProps = {
  settings: ChromeMarkSettings;
  logo: LogoInfo | null;
  webmSupported: boolean | null;
  mp4Supported: boolean | null;
  error: string | null;
  onSettings: (next: ChromeMarkSettings) => void;
  onViewPreset: (preset: ViewPresetId) => void;
  onFit: () => void;
  onStill: () => void;
  onSequence: () => void;
  onWebM: () => void;
  onMp4: () => void;
};

export function ControlPanel({
  settings,
  logo,
  webmSupported,
  mp4Supported,
  error,
  onSettings,
  onViewPreset,
  onFit,
  onStill,
  onSequence,
  onWebM,
  onMp4,
}: ControlPanelProps) {
  const [presetName, setPresetName] = useState("Maser Mirror Chrome");
  const [presets, setPresets] = useState(loadSavedPresets);

  const patch = <K extends keyof ChromeMarkSettings>(
    key: K,
    value: ChromeMarkSettings[K],
  ) => onSettings({ ...settings, [key]: value });

  const savePreset = () => {
    const entry: SavedRendererPreset = {
      name: presetName.trim() || "Untitled",
      savedAt: Date.now(),
      geometry: settings.geometry,
      material: settings.material,
      environment: settings.environment,
      camera: settings.camera,
      animation: settings.animation,
    };
    const next = [entry, ...loadSavedPresets().filter((p) => p.name !== entry.name)];
    savePresets(next);
    setPresets(next);
  };

  const applyPreset = (preset: SavedRendererPreset) => {
    onSettings({
      ...settings,
      geometry: preset.geometry,
      material: preset.material,
      environment: preset.environment,
      camera: preset.camera,
      animation: preset.animation,
    });
  };

  const applyAnimPreset = (
    kind: "classic" | "reverse" | "coin" | "tilt" | "slow",
  ) => {
    const next: AnimationSettings = { ...settings.animation, playing: true, easing: "linear" };
    if (kind === "classic") Object.assign(next, { axis: "y", direction: "cw", speed: 0.125 });
    if (kind === "reverse") Object.assign(next, { axis: "y", direction: "ccw", speed: 0.125 });
    if (kind === "coin") Object.assign(next, { axis: "x", direction: "cw", speed: 0.2 });
    if (kind === "tilt")
      Object.assign(next, {
        axis: "custom",
        customAxis: { x: 0.4, y: 1, z: 0.15 },
        speed: 0.12,
      });
    if (kind === "slow") Object.assign(next, { axis: "y", direction: "cw", speed: 0.1 });
    patch("animation", next);
  };

  return (
    <div className="chromemark-panel-scroll">
      <h1>ChromeMark</h1>
      <p className="chromemark-lede">
        Extrude a logo into machined chrome. Preview black is CSS only. Alpha
        stays on PNG and WebM; MP4 is opaque social on the ground you pick.
      </p>
      {logo ? (
        <p className="chromemark-meta">
          {logo.filename} · {logo.kind.toUpperCase()}
          {logo.width && logo.height ? ` · ${logo.width}×${logo.height}` : ""}
        </p>
      ) : null}
      {logo?.opaqueRaster ? (
        <p className="chromemark-notice-warn">
          This raster has no transparency. A transparent SVG or PNG traces a
          cleaner silhouette.
        </p>
      ) : null}
      {error ? <p className="chromemark-error">{error}</p> : null}

      <GeometryControls
        geometry={settings.geometry}
        trace={settings.trace}
        isPng={logo?.kind === "png"}
        onGeometry={(geometry) =>
          patch("geometry", { ...settings.geometry, ...geometry } satisfies GeometrySettings)
        }
        onTrace={(trace) =>
          patch("trace", { ...settings.trace, ...trace } satisfies TraceSettings)
        }
        onReset={() => {
          patch("geometry", { ...GEOMETRY_DEFAULTS });
          patch("trace", { ...TRACE_DEFAULTS });
        }}
      />
      <MaterialControls
        material={settings.material}
        onChange={(material) =>
          patch("material", { ...settings.material, ...material } satisfies MaterialSettings)
        }
        onReset={() => patch("material", { ...MATERIAL_DEFAULTS })}
      />
      <LightingControls
        environment={settings.environment}
        onChange={(environment) =>
          patch("environment", {
            ...settings.environment,
            ...environment,
          } satisfies EnvironmentSettings)
        }
        onReset={() => patch("environment", { ...ENVIRONMENT_DEFAULTS })}
      />
      <AnimationControls
        animation={settings.animation}
        onChange={(animation) =>
          patch("animation", { ...settings.animation, ...animation })
        }
        onPreset={applyAnimPreset}
        onReset={() => patch("animation", { ...ANIMATION_DEFAULTS })}
      />
      <CameraControls
        camera={settings.camera}
        onChange={(camera) =>
          patch("camera", { ...settings.camera, ...camera } satisfies CameraSettings)
        }
        onPreset={onViewPreset}
        onFit={onFit}
        onReset={() => patch("camera", { ...CAMERA_DEFAULTS })}
      />
      <details className="chromemark-section" open>
        <summary>Preview</summary>
        <PreviewBackdrop
          value={settings.previewBackdrop}
          onChange={(previewBackdrop: PreviewBackdropId) =>
            patch("previewBackdrop", previewBackdrop)
          }
        />
      </details>
      <ExportControls
        exportSettings={settings.export}
        webmSupported={webmSupported}
        mp4Supported={mp4Supported}
        hasLogo={Boolean(logo)}
        onChange={(exportSettings) =>
          patch("export", { ...settings.export, ...exportSettings } satisfies ExportSettings)
        }
        onStill={onStill}
        onSequence={onSequence}
        onWebM={onWebM}
        onMp4={onMp4}
      />
      <details className="chromemark-section">
        <summary>Presets</summary>
        <div className="chromemark-fields">
          <label htmlFor="chromemark-preset-name">Save preset</label>
          <input
            id="chromemark-preset-name"
            type="text"
            value={presetName}
            onChange={(event) => setPresetName(event.target.value)}
          />
          <button type="button" className="chromemark-btn" onClick={savePreset}>
            Save preset
          </button>
          {presets.map((preset) => (
            <button
              key={`${preset.name}-${preset.savedAt}`}
              type="button"
              className="chromemark-btn"
              onClick={() => applyPreset(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
