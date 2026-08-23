"use client";

import {
  COLOR_MODE_OPTIONS,
  DEFAULT_SEED,
  MODE_OPTIONS,
  NODE_COUNT_OPTIONS,
  PARAM_RANGES,
  PRESETS,
  type PresetId,
} from "../constants";
import type {
  AgentSwarmBackground,
  AgentSwarmInteraction,
  AgentSwarmNodeCount,
  AgentSwarmParams,
  AgentSwarmStatus,
} from "../types";
import { ControlSlider } from "./control-slider";

type ControlPanelProps = {
  params: AgentSwarmParams;
  seedDraft: string;
  onSeedDraft: (value: string) => void;
  onCommitSeed: () => void;
  onChange: (patch: Partial<AgentSwarmParams>) => void;
  onPreset: (id: PresetId) => void;
  onRandomize: () => void;
  onRandomizeSeed: () => void;
  onReset: () => void;
  onResetSeed: () => void;
  activePreset: PresetId | null;
};

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="agent-swarm-field" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ControlPanel({
  params,
  seedDraft,
  onSeedDraft,
  onCommitSeed,
  onChange,
  onPreset,
  onRandomize,
  onRandomizeSeed,
  onReset,
  onResetSeed,
  activePreset,
}: ControlPanelProps) {
  return (
    <div className="agent-swarm-panel">
      <div className="agent-swarm-panel__presets" role="group" aria-label="Presets">
        {(Object.keys(PRESETS) as PresetId[]).map((id) => (
          <button
            key={id}
            type="button"
            className="agent-swarm-demo__btn"
            aria-pressed={activePreset === id}
            onClick={() => onPreset(id)}
          >
            {PRESETS[id].label}
          </button>
        ))}
      </div>

      <div className="agent-swarm-panel__actions">
        <button type="button" className="agent-swarm-demo__btn" onClick={onRandomize}>
          Randomize
        </button>
        <button type="button" className="agent-swarm-demo__btn agent-swarm-demo__btn--accent" onClick={onReset}>
          Reset
        </button>
      </div>

      <details open className="agent-swarm-group">
        <summary>Formation</summary>
        <div className="agent-swarm-group__body">
          <SelectField
            id="as-count"
            label="Agent count"
            value={String(params.nodeCount)}
            options={NODE_COUNT_OPTIONS.map((count) => ({
              value: String(count),
              label: String(count),
            }))}
            onChange={(value) =>
              onChange({ nodeCount: Number(value) as AgentSwarmNodeCount })
            }
          />
          <ControlSlider
            id="as-h-space"
            label="Horizontal spacing"
            value={params.horizontalSpacing}
            {...PARAM_RANGES.horizontalSpacing}
            onChange={(horizontalSpacing) => onChange({ horizontalSpacing })}
          />
          <ControlSlider
            id="as-v-space"
            label="Vertical spacing"
            value={params.verticalSpacing}
            {...PARAM_RANGES.verticalSpacing}
            onChange={(verticalSpacing) => onChange({ verticalSpacing })}
          />
          <ControlSlider
            id="as-node-size"
            label="Node size"
            value={params.nodeSize}
            {...PARAM_RANGES.nodeSize}
            onChange={(nodeSize) => onChange({ nodeSize })}
          />
        </div>
      </details>

      <details open className="agent-swarm-group">
        <summary>Motion</summary>
        <div className="agent-swarm-group__body">
          <SelectField
            id="as-mode"
            label="Mode"
            value={params.mode}
            options={MODE_OPTIONS.map((mode) => ({
              value: mode,
              label: mode,
            }))}
            onChange={(mode) => onChange({ mode: mode as AgentSwarmParams["mode"] })}
          />
          <label className="agent-swarm-check">
            <input
              type="checkbox"
              checked={params.animation}
              onChange={(event) => onChange({ animation: event.target.checked })}
            />
            Animation
          </label>
          <ControlSlider
            id="as-speed"
            label="Speed"
            value={params.speed}
            {...PARAM_RANGES.speed}
            formatValue={(value) => `${value.toFixed(2)}×`}
            onChange={(speed) => onChange({ speed, animation: speed > 0 })}
          />
          <ControlSlider
            id="as-travel"
            label="Travel duration"
            value={params.travelDuration}
            {...PARAM_RANGES.travelDuration}
            formatValue={(value) => `${Math.round(value)}ms`}
            onChange={(travelDuration) => onChange({ travelDuration })}
          />
          <ControlSlider
            id="as-idle"
            label="Idle duration"
            value={params.idleDuration}
            {...PARAM_RANGES.idleDuration}
            formatValue={(value) => `${Math.round(value)}ms`}
            onChange={(idleDuration) => onChange({ idleDuration })}
          />
          <ControlSlider
            id="as-settle"
            label="Settle duration"
            value={params.settleDuration}
            {...PARAM_RANGES.settleDuration}
            formatValue={(value) => `${Math.round(value)}ms`}
            onChange={(settleDuration) => onChange({ settleDuration })}
          />
          <ControlSlider
            id="as-stagger"
            label="Stagger"
            value={params.stagger}
            {...PARAM_RANGES.stagger}
            onChange={(stagger) => onChange({ stagger })}
          />
          <ControlSlider
            id="as-curve"
            label="Path curvature"
            value={params.pathCurvature}
            {...PARAM_RANGES.pathCurvature}
            onChange={(pathCurvature) => onChange({ pathCurvature })}
          />
          <ControlSlider
            id="as-random"
            label="Randomness"
            value={params.randomness}
            {...PARAM_RANGES.randomness}
            onChange={(randomness) => onChange({ randomness })}
          />
          <ControlSlider
            id="as-distance"
            label="Movement distance"
            value={params.movementDistance}
            {...PARAM_RANGES.movementDistance}
            formatValue={(value) => (value < 0.35 ? "local" : value > 0.7 ? "global" : "mixed")}
            onChange={(movementDistance) => onChange({ movementDistance })}
          />
          <ControlSlider
            id="as-active"
            label="Active agents"
            value={params.activeAgentPercentage}
            {...PARAM_RANGES.activeAgentPercentage}
            formatValue={(value) => `${Math.round(value * 100)}%`}
            onChange={(activeAgentPercentage) => onChange({ activeAgentPercentage })}
          />
        </div>
      </details>

      <details open className="agent-swarm-group">
        <summary>Seed</summary>
        <div className="agent-swarm-group__body">
          <label className="agent-swarm-field" htmlFor="as-seed">
            <span>Seed</span>
            <input
              id="as-seed"
              type="text"
              value={seedDraft}
              onChange={(event) => onSeedDraft(event.target.value)}
              onBlur={onCommitSeed}
              onKeyDown={(event) => {
                if (event.key === "Enter") onCommitSeed();
              }}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <div className="agent-swarm-panel__actions">
            <button type="button" className="agent-swarm-demo__btn" onClick={onRandomizeSeed}>
              Randomize seed
            </button>
            <button
              type="button"
              className="agent-swarm-demo__btn"
              onClick={onResetSeed}
              disabled={params.seed === DEFAULT_SEED}
            >
              Reset seed
            </button>
          </div>
        </div>
      </details>

      <details className="agent-swarm-group">
        <summary>Appearance</summary>
        <div className="agent-swarm-group__body">
          <SelectField
            id="as-color"
            label="Color mode"
            value={params.colorMode}
            options={COLOR_MODE_OPTIONS.map((mode) => ({ value: mode, label: mode }))}
            onChange={(colorMode) =>
              onChange({ colorMode: colorMode as AgentSwarmParams["colorMode"] })
            }
          />
          {params.colorMode === "custom"
            ? params.customPalette.map((color, index) => (
                <label key={index} className="agent-swarm-field" htmlFor={`as-swatch-${index}`}>
                  <span>Swatch {index + 1}</span>
                  <input
                    id={`as-swatch-${index}`}
                    type="color"
                    value={color}
                    onChange={(event) => {
                      const next = params.customPalette.slice();
                      next[index] = event.target.value;
                      onChange({ customPalette: next });
                    }}
                  />
                </label>
              ))
            : null}
          <SelectField
            id="as-status"
            label="Loader status"
            value={params.status}
            options={[
              { value: "idle", label: "idle" },
              { value: "loading", label: "loading" },
              { value: "success", label: "success" },
              { value: "error", label: "error" },
            ]}
            onChange={(status) => onChange({ status: status as AgentSwarmStatus })}
          />
        </div>
      </details>

      <details className="agent-swarm-group">
        <summary>Glow</summary>
        <div className="agent-swarm-group__body">
          <ControlSlider
            id="as-glow-i"
            label="Glow intensity"
            value={params.glowIntensity}
            {...PARAM_RANGES.glowIntensity}
            onChange={(glowIntensity) => onChange({ glowIntensity })}
          />
          <ControlSlider
            id="as-glow-r"
            label="Glow radius"
            value={params.glowRadius}
            {...PARAM_RANGES.glowRadius}
            onChange={(glowRadius) => onChange({ glowRadius })}
          />
          <ControlSlider
            id="as-bloom"
            label="Bloom"
            value={params.bloomStrength}
            {...PARAM_RANGES.bloomStrength}
            onChange={(bloomStrength) => onChange({ bloomStrength })}
          />
          <ControlSlider
            id="as-core"
            label="Core brightness"
            value={params.coreBrightness}
            {...PARAM_RANGES.coreBrightness}
            onChange={(coreBrightness) => onChange({ coreBrightness })}
          />
          <ControlSlider
            id="as-atmo"
            label="Atmosphere"
            value={params.atmosphericGlow}
            {...PARAM_RANGES.atmosphericGlow}
            onChange={(atmosphericGlow) => onChange({ atmosphericGlow })}
          />
          <ControlSlider
            id="as-trail-o"
            label="Trail opacity"
            value={params.trailOpacity}
            {...PARAM_RANGES.trailOpacity}
            onChange={(trailOpacity) => onChange({ trailOpacity })}
          />
          <ControlSlider
            id="as-trail-l"
            label="Trail length"
            value={params.trailLength}
            {...PARAM_RANGES.trailLength}
            formatValue={(value) => String(Math.round(value))}
            onChange={(trailLength) => onChange({ trailLength })}
          />
        </div>
      </details>

      <details className="agent-swarm-group">
        <summary>Background</summary>
        <div className="agent-swarm-group__body">
          <SelectField
            id="as-bg"
            label="Background"
            value={params.background}
            options={[
              { value: "black", label: "black" },
              { value: "transparent", label: "transparent" },
              { value: "custom", label: "custom" },
            ]}
            onChange={(background) =>
              onChange({ background: background as AgentSwarmBackground })
            }
          />
          {params.background === "custom" ? (
            <label className="agent-swarm-field" htmlFor="as-bg-color">
              <span>Custom fill</span>
              <input
                id="as-bg-color"
                type="color"
                value={params.customBackground}
                onChange={(event) => onChange({ customBackground: event.target.value })}
              />
            </label>
          ) : null}
        </div>
      </details>

      <details className="agent-swarm-group">
        <summary>Interaction</summary>
        <div className="agent-swarm-group__body">
          <SelectField
            id="as-interact"
            label="Pointer"
            value={params.interaction}
            options={[
              { value: "off", label: "off" },
              { value: "repel", label: "repel" },
              { value: "attract", label: "attract" },
              { value: "tap-swap", label: "tap swap" },
            ]}
            onChange={(interaction) =>
              onChange({ interaction: interaction as AgentSwarmInteraction })
            }
          />
          <ControlSlider
            id="as-ptr-r"
            label="Pointer radius"
            value={params.pointerRadius}
            {...PARAM_RANGES.pointerRadius}
            formatValue={(value) => `${Math.round(value)}px`}
            onChange={(pointerRadius) => onChange({ pointerRadius })}
          />
          <ControlSlider
            id="as-ptr-s"
            label="Pointer strength"
            value={params.pointerStrength}
            {...PARAM_RANGES.pointerStrength}
            onChange={(pointerStrength) => onChange({ pointerStrength })}
          />
        </div>
      </details>

      <details className="agent-swarm-group">
        <summary>Debug</summary>
        <div className="agent-swarm-group__body">
          <label className="agent-swarm-check">
            <input
              type="checkbox"
              checked={params.debug}
              onChange={(event) => onChange({ debug: event.target.checked })}
            />
            Show anchors and trajectories
          </label>
        </div>
      </details>
    </div>
  );
}
