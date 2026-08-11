"use client";

import { type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type ControlSliderProps = {
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
  const id = `pic-slider-${label.replace(/\s+/g, "-").toLowerCase()}`;
  const display =
    formatValue?.(value) ??
    (Number.isInteger(step) ? String(value) : value.toFixed(2));

  return (
    <div className={cn("pic-slider", className)}>
      <label className="pic-slider__label" htmlFor={id}>
        {label} : {display}
      </label>
      <div
        className="pic-slider__track-wrap"
        style={{ "--thumb-percent": `${percent}%` } as CSSProperties}
      >
        <div
          className="pic-slider__fill"
          style={{ width: `${percent}%` }}
          aria-hidden
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="pic-slider__input"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>
    </div>
  );
}
