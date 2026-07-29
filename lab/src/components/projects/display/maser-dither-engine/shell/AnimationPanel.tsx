"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  ANIMATION_MODES,
  defaultModeParams,
  getAnimationMode,
} from "../engine/animation/modes/catalog";
import type {
  AnimationEngineConfig,
  AnimationModeId,
  TimelineLoopMode,
} from "../engine/animation/types";
import { cn } from "@/lib/utils";

type AnimationPanelProps = {
  value: AnimationEngineConfig;
  onChange: (next: AnimationEngineConfig) => void;
  idPrefix?: string;
};

function formatValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2);
}

/**
 * Professional animation controls — mode grid, mode-specific params, timeline.
 */
export function AnimationPanel({
  value,
  onChange,
  idPrefix = "mde-anim",
}: AnimationPanelProps) {
  const mode = getAnimationMode(value.modeId);
  const params = {
    ...defaultModeParams(value.modeId),
    ...value.modeParams,
  };

  const setMode = (modeId: AnimationModeId) => {
    onChange({
      ...value,
      modeId,
      modeParams: defaultModeParams(modeId),
    });
  };

  const setParam = (key: string, next: number) => {
    onChange({
      ...value,
      modeParams: { ...params, [key]: next },
    });
  };

  const setTimeline = (
    partial: Partial<AnimationEngineConfig["timeline"]>,
  ) => {
    onChange({
      ...value,
      timeline: { ...value.timeline, ...partial },
    });
  };

  return (
    <div className="mde-anim-panel">
      <div className="mde-field">
        <span className="mde-field__label">Animation Mode</span>
        <div className="mde-anim-modes" role="listbox" aria-label="Animation modes">
          {ANIMATION_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="option"
              aria-selected={value.modeId === m.id}
              className={cn(
                "mde-chip",
                value.modeId === m.id && "mde-chip--active",
              )}
              title={m.purpose}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mde-anim-panel__hint">{mode.purpose}</p>
      </div>

      <div className="mde-anim-panel__section">
        <span className="mde-field__label">{mode.label} Controls</span>
        {mode.controls.map((c) => (
          <div key={c.key} className="mde-field">
            <div className="mde-field__row">
              <Label htmlFor={`${idPrefix}-${c.key}`}>{c.label}</Label>
              <span>{formatValue(params[c.key] ?? c.defaultValue)}</span>
            </div>
            <Slider
              id={`${idPrefix}-${c.key}`}
              min={c.min}
              max={c.max}
              step={c.step}
              value={[params[c.key] ?? c.defaultValue]}
              onValueChange={(vals) => {
                const next = Array.isArray(vals) ? vals[0] : vals;
                if (typeof next !== "number") return;
                setParam(c.key, next);
              }}
            />
          </div>
        ))}
      </div>

      <div className="mde-anim-panel__section">
        <span className="mde-field__label">Blend</span>
        <div className="mde-field">
          <div className="mde-field__row">
            <Label htmlFor={`${idPrefix}-blend`}>Transition Duration</Label>
            <span>{formatValue(value.blendDuration)}s</span>
          </div>
          <Slider
            id={`${idPrefix}-blend`}
            min={0.05}
            max={2.5}
            step={0.05}
            value={[value.blendDuration]}
            onValueChange={(vals) => {
              const next = Array.isArray(vals) ? vals[0] : vals;
              if (typeof next !== "number") return;
              onChange({ ...value, blendDuration: next });
            }}
          />
        </div>
      </div>

      <div className="mde-anim-panel__section">
        <span className="mde-field__label">Timeline</span>
        <div className="mde-anim-timeline" role="toolbar" aria-label="Timeline">
          <button
            type="button"
            className={cn(
              "mde-chip",
              value.timeline.playing && "mde-chip--active",
            )}
            onClick={() => setTimeline({ playing: !value.timeline.playing })}
          >
            {value.timeline.playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            className="mde-chip"
            onClick={() =>
              onChange({
                ...value,
                restartToken: (value.restartToken ?? 0) + 1,
                timeline: { ...value.timeline, playing: true },
              })
            }
          >
            Restart
          </button>
          <button
            type="button"
            className={cn(
              "mde-chip",
              value.timeline.direction === -1 && "mde-chip--active",
            )}
            onClick={() =>
              setTimeline({
                direction: value.timeline.direction === 1 ? -1 : 1,
              })
            }
          >
            Reverse
          </button>
        </div>
        <div className="mde-preset-row" role="group" aria-label="Loop mode">
          {(
            [
              ["loop", "Loop"],
              ["once", "Once"],
              ["pingpong", "Ping Pong"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={cn(
                "mde-chip",
                value.timeline.loopMode === id && "mde-chip--active",
              )}
              aria-pressed={value.timeline.loopMode === id}
              onClick={() => setTimeline({ loopMode: id as TimelineLoopMode })}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mde-field">
          <div className="mde-field__row">
            <Label htmlFor={`${idPrefix}-speed`}>Playback Speed</Label>
            <span>{formatValue(value.timeline.playbackSpeed)}×</span>
          </div>
          <Slider
            id={`${idPrefix}-speed`}
            min={0}
            max={3}
            step={0.05}
            value={[value.timeline.playbackSpeed]}
            onValueChange={(vals) => {
              const next = Array.isArray(vals) ? vals[0] : vals;
              if (typeof next !== "number") return;
              setTimeline({ playbackSpeed: next });
            }}
          />
        </div>
        <div className="mde-field">
          <div className="mde-field__row">
            <Label htmlFor={`${idPrefix}-scale`}>Time Scale</Label>
            <span>{formatValue(value.timeline.timeScale)}×</span>
          </div>
          <Slider
            id={`${idPrefix}-scale`}
            min={0}
            max={3}
            step={0.05}
            value={[value.timeline.timeScale]}
            onValueChange={(vals) => {
              const next = Array.isArray(vals) ? vals[0] : vals;
              if (typeof next !== "number") return;
              setTimeline({ timeScale: next });
            }}
          />
        </div>
      </div>
    </div>
  );
}
