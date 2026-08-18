"use client";

import type { AnimationSettings, SpinAxisId } from "../types";
import { NumberSlider } from "./control-field";

const AXES: { id: SpinAxisId; label: string }[] = [
  { id: "x", label: "X" },
  { id: "y", label: "Y" },
  { id: "z", label: "Z" },
  { id: "custom", label: "Custom" },
];

type AnimationControlsProps = {
  animation: AnimationSettings;
  onChange: (patch: Partial<AnimationSettings>) => void;
  onPreset: (preset: "classic" | "reverse" | "coin" | "tilt" | "slow") => void;
  onReset: () => void;
};

export function AnimationControls({
  animation,
  onChange,
  onPreset,
  onReset,
}: AnimationControlsProps) {
  const loopBreaks = animation.easing !== "linear";
  return (
    <details className="chromemark-section" open>
      <summary>Animation</summary>
      <div className="chromemark-fields">
        <div className="chromemark-btn-row">
          <button
            type="button"
            className="chromemark-btn"
            aria-pressed={animation.playing}
            onClick={() => onChange({ playing: !animation.playing })}
          >
            {animation.playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            className="chromemark-btn"
            aria-pressed={animation.direction === "cw"}
            onClick={() => onChange({ direction: "cw" })}
          >
            Clockwise
          </button>
          <button
            type="button"
            className="chromemark-btn"
            aria-pressed={animation.direction === "ccw"}
            onClick={() => onChange({ direction: "ccw" })}
          >
            Counterclockwise
          </button>
        </div>
        <NumberSlider
          label="Speed (rev/s)"
          value={animation.speed}
          min={0}
          max={2}
          step={0.005}
          format={(v) => v.toFixed(3)}
          onChange={(speed) => onChange({ speed })}
        />
        <div className="chromemark-btn-row" role="group" aria-label="Spin axis">
          {AXES.map((axis) => (
            <button
              key={axis.id}
              type="button"
              className="chromemark-btn"
              aria-pressed={animation.axis === axis.id}
              onClick={() => onChange({ axis: axis.id })}
            >
              {axis.label}
            </button>
          ))}
        </div>
        {animation.axis === "custom" ? (
          <>
            <NumberSlider
              label="Custom X"
              value={animation.customAxis.x}
              min={-1}
              max={1}
              step={0.01}
              format={(v) => v.toFixed(2)}
              onChange={(x) =>
                onChange({ customAxis: { ...animation.customAxis, x } })
              }
            />
            <NumberSlider
              label="Custom Y"
              value={animation.customAxis.y}
              min={-1}
              max={1}
              step={0.01}
              format={(v) => v.toFixed(2)}
              onChange={(y) =>
                onChange({ customAxis: { ...animation.customAxis, y } })
              }
            />
            <NumberSlider
              label="Custom Z"
              value={animation.customAxis.z}
              min={-1}
              max={1}
              step={0.01}
              format={(v) => v.toFixed(2)}
              onChange={(z) =>
                onChange({ customAxis: { ...animation.customAxis, z } })
              }
            />
          </>
        ) : null}
        <div className="chromemark-field">
          <label htmlFor="chromemark-easing">Easing</label>
          <select
            id="chromemark-easing"
            value={animation.easing}
            onChange={(event) =>
              onChange({
                easing: event.target.value as AnimationSettings["easing"],
              })
            }
          >
            <option value="linear">Linear</option>
            <option value="ease-in-out">Ease in out</option>
            <option value="smooth">Smooth</option>
          </select>
        </div>
        {loopBreaks ? (
          <p className="chromemark-notice-warn">
            Non-linear easing will hitch when a loop wraps. Use Linear for a
            seamless spin.
          </p>
        ) : null}
        <div className="chromemark-btn-row">
          <button type="button" className="chromemark-btn" onClick={() => onPreset("classic")}>
            Classic spin
          </button>
          <button type="button" className="chromemark-btn" onClick={() => onPreset("reverse")}>
            Reverse
          </button>
          <button type="button" className="chromemark-btn" onClick={() => onPreset("coin")}>
            Coin flip
          </button>
          <button type="button" className="chromemark-btn" onClick={() => onPreset("tilt")}>
            Tilted
          </button>
          <button type="button" className="chromemark-btn" onClick={() => onPreset("slow")}>
            Slow turntable
          </button>
          <button type="button" className="chromemark-btn" onClick={onReset}>
            Reset animation
          </button>
        </div>
      </div>
    </details>
  );
}
