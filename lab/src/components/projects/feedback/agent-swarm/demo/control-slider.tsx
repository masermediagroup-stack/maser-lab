"use client";

import { type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type ControlSliderProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  onChange: (value: number) => void;
  className?: string;
};

export function ControlSlider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  formatValue,
  onChange,
  className,
}: ControlSliderProps) {
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const display =
    formatValue?.(value) ??
    (Number.isInteger(step) && step >= 1 ? String(value) : value.toFixed(2));

  return (
    <div className={cn("agent-swarm-slider", className)}>
      <label className="agent-swarm-slider__label" htmlFor={id}>
        {label}
        <span>{display}</span>
      </label>
      <div
        className="agent-swarm-slider__track"
        style={{ "--thumb-percent": `${percent}%` } as CSSProperties}
      >
        <div className="agent-swarm-slider__fill" style={{ width: `${percent}%` }} aria-hidden />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number.parseFloat(event.target.value))}
          className="agent-swarm-slider__input"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>
    </div>
  );
}
