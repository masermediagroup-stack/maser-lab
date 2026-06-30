"use client";

import { type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type LoaderControlSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
};

export function LoaderControlSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
}: LoaderControlSliderProps) {
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("blobby-loader-slider", className)}>
      <label className="blobby-loader-slider__label" htmlFor={`slider-${label}`}>
        {label} : {Number.isInteger(step) ? value : value.toFixed(1)}
      </label>
      <div
        className="blobby-loader-slider__track-wrap"
        style={{ "--thumb-percent": `${percent}%` } as CSSProperties}
      >
        <div
          className="blobby-loader-slider__fill"
          style={{ width: `${percent}%` }}
          aria-hidden
        />
        <input
          id={`slider-${label}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="blobby-loader-slider__input"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>
    </div>
  );
}
