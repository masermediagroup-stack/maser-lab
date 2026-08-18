"use client";

import type { GeometrySettings, TraceSettings } from "../types";
import { NumberSlider, ToggleRow } from "./control-field";

type GeometryControlsProps = {
  geometry: GeometrySettings;
  trace: TraceSettings;
  isPng: boolean;
  onGeometry: (patch: Partial<GeometrySettings>) => void;
  onTrace: (patch: Partial<TraceSettings>) => void;
  onReset: () => void;
};

export function GeometryControls({
  geometry,
  trace,
  isPng,
  onGeometry,
  onTrace,
  onReset,
}: GeometryControlsProps) {
  return (
    <details className="chromemark-section" open>
      <summary>Geometry</summary>
      <div className="chromemark-fields">
        <NumberSlider
          label="Depth"
          value={geometry.depth}
          min={0.01}
          max={0.5}
          step={0.005}
          format={(v) => v.toFixed(3)}
          onChange={(depth) => onGeometry({ depth })}
        />
        <ToggleRow
          label="Bevel"
          pressed={geometry.bevel}
          onToggle={() => onGeometry({ bevel: !geometry.bevel })}
        />
        <NumberSlider
          label="Bevel size"
          value={geometry.bevelSize}
          min={0}
          max={0.1}
          step={0.001}
          format={(v) => v.toFixed(3)}
          onChange={(bevelSize) => onGeometry({ bevelSize })}
        />
        <NumberSlider
          label="Bevel thickness"
          value={geometry.bevelThickness}
          min={0}
          max={0.1}
          step={0.001}
          format={(v) => v.toFixed(3)}
          onChange={(bevelThickness) => onGeometry({ bevelThickness })}
        />
        <NumberSlider
          label="Bevel segments"
          value={geometry.bevelSegments}
          min={4}
          max={16}
          step={1}
          format={(v) => String(Math.round(v))}
          onChange={(bevelSegments) =>
            onGeometry({ bevelSegments: Math.round(bevelSegments) })
          }
        />
        <NumberSlider
          label="Curve detail"
          value={geometry.curveDetail}
          min={16}
          max={128}
          step={1}
          format={(v) => String(Math.round(v))}
          onChange={(curveDetail) =>
            onGeometry({ curveDetail: Math.round(curveDetail) })
          }
        />
        {isPng ? (
          <>
            <NumberSlider
              label="Alpha threshold"
              value={trace.alphaThreshold}
              min={1}
              max={250}
              step={1}
              format={(v) => String(Math.round(v))}
              onChange={(alphaThreshold) =>
                onTrace({ alphaThreshold: Math.round(alphaThreshold) })
              }
            />
            <NumberSlider
              label="Trace detail"
              value={trace.traceDetail}
              min={0}
              max={1}
              step={0.01}
              format={(v) => v.toFixed(2)}
              onChange={(traceDetail) => onTrace({ traceDetail })}
            />
            <NumberSlider
              label="Smoothing"
              value={trace.smoothing}
              min={0}
              max={1}
              step={0.01}
              format={(v) => v.toFixed(2)}
              onChange={(smoothing) => onTrace({ smoothing })}
            />
          </>
        ) : null}
        <button type="button" className="chromemark-btn" onClick={onReset}>
          Reset geometry
        </button>
      </div>
    </details>
  );
}
