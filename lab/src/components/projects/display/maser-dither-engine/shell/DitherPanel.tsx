"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DITHER_SIZES } from "../constants";
import {
  DITHER_ALGORITHMS,
  DEFAULT_DITHER_CONFIG,
  type DitherAlgorithmId,
  type DitherConfig,
} from "../engine/dither";
import type { DitherSize } from "../types";
import { cn } from "@/lib/utils";

type DitherPanelProps = {
  value: DitherConfig;
  onChange: (next: DitherConfig) => void;
  /** Sync matrix size into material params (shared with UniformStore). */
  onMatrixSize?: (size: DitherSize) => void;
  advanced?: boolean;
  idPrefix?: string;
  /** Optional second config for comparison mode. */
  compare?: DitherConfig | null;
  onCompareChange?: (next: DitherConfig | null) => void;
};

function formatValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2);
}

type SliderDef = {
  key: keyof DitherConfig;
  label: string;
  tip: string;
  min: number;
  max: number;
  step: number;
  algorithms: DitherAlgorithmId[] | "*";
  advanced?: boolean;
};

const SLIDERS: SliderDef[] = [
  {
    key: "patternScale",
    label: "Pattern Scale",
    tip: "On-screen period of the dither pattern. Independent of matrix size and render density.",
    min: 0.25,
    max: 4,
    step: 0.01,
    algorithms: "*",
  },
  {
    key: "thresholdBias",
    label: "Threshold Bias",
    tip: "Shifts the quantization boundary. Unlike Contrast, it does not remapping luminance first.",
    min: -1,
    max: 1,
    step: 0.01,
    algorithms: "*",
  },
  {
    key: "temporalDrift",
    label: "Temporal Drift",
    tip: "How fast thresholds evolve over time. Used by blue-noise, random, and animated algorithms.",
    min: 0,
    max: 1,
    step: 0.01,
    algorithms: ["blue-noise", "random", "animated"],
  },
  {
    key: "distribution",
    label: "Distribution Strength",
    tip: "How strongly blue-noise texture drives thresholds vs a flat mid value.",
    min: 0,
    max: 1,
    step: 0.01,
    algorithms: ["blue-noise"],
  },
  {
    key: "clusterSize",
    label: "Cluster Size",
    tip: "AM cluster cell size for clustered-dot dither.",
    min: 0,
    max: 1,
    step: 0.01,
    algorithms: ["clustered-dot"],
  },
  {
    key: "dotRoundness",
    label: "Dot Roundness",
    tip: "0 = square clusters, 1 = round clusters.",
    min: 0,
    max: 1,
    step: 0.01,
    algorithms: ["clustered-dot"],
  },
  {
    key: "coverage",
    label: "Coverage",
    tip: "Bias for how quickly clusters fill with luminance.",
    min: 0,
    max: 1,
    step: 0.01,
    algorithms: ["clustered-dot"],
  },
  {
    key: "cellSize",
    label: "Cell Size",
    tip: "Halftone screen cell size.",
    min: 0,
    max: 1,
    step: 0.01,
    algorithms: ["halftone"],
  },
  {
    key: "angle",
    label: "Screen Angle",
    tip: "Rotation of clustered / halftone / line / hatch screens (degrees).",
    min: 0,
    max: 180,
    step: 1,
    algorithms: ["clustered-dot", "halftone", "line-screen", "crosshatch"],
  },
  {
    key: "lineWidth",
    label: "Line Width",
    tip: "Engraving stroke thickness for line-screen.",
    min: 0,
    max: 1,
    step: 0.01,
    algorithms: ["line-screen"],
  },
  {
    key: "spacing",
    label: "Line Spacing",
    tip: "Distance between parallel strokes (line-screen / crosshatch).",
    min: 0,
    max: 1,
    step: 0.01,
    algorithms: ["line-screen", "crosshatch"],
  },
  {
    key: "waveDistortion",
    label: "Wave Distortion",
    tip: "Wobble along the line-screen direction.",
    min: 0,
    max: 1,
    step: 0.01,
    algorithms: ["line-screen"],
    advanced: true,
  },
  {
    key: "lineCount",
    label: "Hatch Layers",
    tip: "Number of angled stroke layers in crosshatch (1–4).",
    min: 1,
    max: 4,
    step: 1,
    algorithms: ["crosshatch"],
  },
  {
    key: "angleSeparation",
    label: "Angle Separation",
    tip: "Degrees between successive crosshatch layers.",
    min: 15,
    max: 90,
    step: 1,
    algorithms: ["crosshatch"],
  },
  {
    key: "roughness",
    label: "Roughness",
    tip: "Stochastic jitter on hatch lines.",
    min: 0,
    max: 1,
    step: 0.01,
    algorithms: ["crosshatch"],
    advanced: true,
  },
  {
    key: "secondary",
    label: "Secondary Algorithm",
    tip: "0 Bayer · 1 Blue noise · 2 Random · 3 Line · 4 Halftone — blended with Bayer in Hybrid.",
    min: 0,
    max: 4,
    step: 1,
    algorithms: ["hybrid"],
  },
  {
    key: "blendAmount",
    label: "Hybrid Blend",
    tip: "Mix between Bayer (0) and the secondary algorithm (1).",
    min: 0,
    max: 1,
    step: 0.01,
    algorithms: ["hybrid"],
  },
];

/**
 * Algorithm + matrix / pattern / contextual dither controls.
 */
export function DitherPanel({
  value,
  onChange,
  onMatrixSize,
  advanced = false,
  idPrefix = "mde-dit",
  compare = null,
  onCompareChange,
}: DitherPanelProps) {
  const patch = (partial: Partial<DitherConfig>) => {
    onChange({ ...value, ...partial });
  };

  const setMatrix = (size: DitherSize) => {
    patch({ matrixSize: size });
    onMatrixSize?.(size);
  };

  const visibleSliders = SLIDERS.filter((s) => {
    if (s.advanced && !advanced) return false;
    if (s.algorithms === "*") return true;
    return s.algorithms.includes(value.algorithm);
  });

  const showMatrix =
    value.algorithm === "bayer" ||
    value.algorithm === "posterized" ||
    value.algorithm === "hybrid" ||
    value.algorithm === "animated" ||
    advanced;

  return (
    <div className="mde-dit-panel">
      <div className="mde-field">
        <span className="mde-field__label">Algorithm</span>
        <p className="mde-field__hint">
          Each family uses distinct threshold math — not aliases of Bayer.
        </p>
        <div className="mde-preset-row" role="listbox" aria-label="Dither algorithm">
          {DITHER_ALGORITHMS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="option"
              aria-selected={value.algorithm === a.id}
              className={cn(
                "mde-chip",
                value.algorithm === a.id && "mde-chip--active",
              )}
              title={a.description}
              onClick={() => patch({ algorithm: a.id })}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {showMatrix ? (
        <div className="mde-field">
          <span className="mde-field__label">Matrix Size</span>
          <p className="mde-field__hint">
            Bayer LUT complexity. Distinct from Pattern Scale (period) and
            Render Density (internal resolution).
          </p>
          <div className="mde-preset-row">
            {DITHER_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className={cn(
                  "mde-chip",
                  value.matrixSize === size && "mde-chip--active",
                )}
                aria-pressed={value.matrixSize === size}
                onClick={() => setMatrix(size)}
              >
                {size}×{size}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mde-field">
        <div className="mde-field__row">
          <Label htmlFor={`${idPrefix}-invert`}>Invert Light Response</Label>
          <button
            type="button"
            id={`${idPrefix}-invert`}
            className={cn(
              "mde-chip",
              value.invertResponse && "mde-chip--active",
            )}
            aria-pressed={value.invertResponse}
            title="Default: bright core → lighter coverage. Invert densifies the core."
            onClick={() => patch({ invertResponse: !value.invertResponse })}
          >
            {value.invertResponse ? "Inverted" : "Normal"}
          </button>
        </div>
      </div>

      {visibleSliders.map((s) => {
        const raw = value[s.key];
        const current = typeof raw === "number" ? raw : 0;
        return (
          <div key={s.key} className="mde-field">
            <div className="mde-field__row">
              <Label htmlFor={`${idPrefix}-${s.key}`} title={s.tip}>
                {s.label}
              </Label>
              <span>{formatValue(current)}</span>
            </div>
            <p className="mde-field__hint">{s.tip}</p>
            <Slider
              id={`${idPrefix}-${s.key}`}
              min={s.min}
              max={s.max}
              step={s.step}
              value={[current]}
              onValueChange={(vals) => {
                const next = Array.isArray(vals) ? vals[0] : vals;
                if (typeof next === "number") patch({ [s.key]: next });
              }}
            />
          </div>
        );
      })}

      {onCompareChange ? (
        <div className="mde-field">
          <div className="mde-field__row">
            <Label htmlFor={`${idPrefix}-compare`}>Algorithm Compare</Label>
            <button
              type="button"
              id={`${idPrefix}-compare`}
              className={cn("mde-chip", compare && "mde-chip--active")}
              aria-pressed={Boolean(compare)}
              onClick={() => {
                if (compare) onCompareChange(null);
                else
                  onCompareChange({
                    ...DEFAULT_DITHER_CONFIG,
                    ...value,
                    algorithm:
                      value.algorithm === "bayer" ? "halftone" : "bayer",
                  });
              }}
            >
              {compare ? "On" : "Off"}
            </button>
          </div>
          <p className="mde-field__hint">
            Side-by-side preview uses the same lighting, color, and animation.
          </p>
          {compare ? (
            <div className="mde-preset-row">
              {DITHER_ALGORITHMS.map((a) => (
                <button
                  key={`cmp-${a.id}`}
                  type="button"
                  className={cn(
                    "mde-chip",
                    compare.algorithm === a.id && "mde-chip--active",
                  )}
                  onClick={() =>
                    onCompareChange({ ...compare, algorithm: a.id })
                  }
                >
                  B: {a.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mde-field">
        <button
          type="button"
          className="mde-btn"
          onClick={() => {
            onChange({ ...DEFAULT_DITHER_CONFIG });
            onMatrixSize?.(DEFAULT_DITHER_CONFIG.matrixSize);
          }}
        >
          Reset dither
        </button>
      </div>
    </div>
  );
}
