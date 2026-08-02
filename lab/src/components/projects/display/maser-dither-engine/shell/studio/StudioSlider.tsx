"use client";

import { useId, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type StudioSliderProps = {
  id?: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  hint?: string;
  defaultValue?: number;
  onChange: (next: number) => void;
  className?: string;
};

function formatValue(v: number, step: number): string {
  if (Number.isInteger(step) && Number.isInteger(v)) return String(v);
  const digits = Math.min(3, Math.max(0, String(step).split(".")[1]?.length ?? 2));
  return v.toFixed(digits);
}

/**
 * Touch-first slider: visible value, numeric edit, ± steps, reset, double-tap reset.
 */
export function StudioSlider({
  id: idProp,
  label,
  value,
  min,
  max,
  step,
  unit,
  hint,
  defaultValue,
  onChange,
  className,
}: StudioSliderProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => formatValue(value, step));
  const lastTap = useRef(0);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const beginEdit = () => {
    setDraft(formatValue(value, step));
    setEditing(true);
  };

  const commitDraft = () => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed)) {
      setDraft(formatValue(value, step));
      setEditing(false);
      return;
    }
    onChange(clamp(parsed));
    setEditing(false);
  };

  const nudge = (dir: -1 | 1) => {
    onChange(clamp(value + dir * step));
  };

  const reset = () => {
    if (typeof defaultValue === "number") onChange(defaultValue);
  };

  const onLabelPointer = () => {
    const now = Date.now();
    if (now - lastTap.current < 350 && typeof defaultValue === "number") {
      reset();
    }
    lastTap.current = now;
  };

  return (
    <div className={cn("mde-studio-slider", className)}>
      <div className="mde-studio-slider__row">
        <Label htmlFor={id} onPointerDown={onLabelPointer}>
          {label}
        </Label>
        <div className="mde-studio-slider__value-row">
          {editing ? (
            <input
              className="mde-studio-slider__input"
              value={draft}
              inputMode="decimal"
              aria-label={`${label} numeric value`}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitDraft}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitDraft();
                if (e.key === "Escape") {
                  setDraft(formatValue(value, step));
                  setEditing(false);
                }
              }}
              autoFocus
            />
          ) : (
            <button
              type="button"
              className="mde-studio-slider__value"
              onClick={beginEdit}
              aria-label={`Edit ${label} value`}
            >
              {formatValue(value, step)}
              {unit ? <span className="mde-muted"> {unit}</span> : null}
            </button>
          )}
          <button
            type="button"
            className="mde-chip mde-chip--tiny"
            aria-label={`Decrease ${label}`}
            onClick={() => nudge(-1)}
          >
            −
          </button>
          <button
            type="button"
            className="mde-chip mde-chip--tiny"
            aria-label={`Increase ${label}`}
            onClick={() => nudge(1)}
          >
            +
          </button>
          {typeof defaultValue === "number" ? (
            <button
              type="button"
              className="mde-chip mde-chip--tiny"
              aria-label={`Reset ${label}`}
              onClick={reset}
            >
              ↺
            </button>
          ) : null}
        </div>
      </div>
      {hint ? <p className="mde-field__hint">{hint}</p> : null}
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(vals) => {
          const next = Array.isArray(vals) ? vals[0] : vals;
          if (typeof next === "number") onChange(next);
        }}
      />
    </div>
  );
}
