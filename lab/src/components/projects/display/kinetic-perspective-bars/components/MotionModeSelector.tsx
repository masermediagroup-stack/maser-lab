"use client";

import { MODE_LABELS, MODE_ORDER } from "../lib/constants";
import type { MotionMode } from "../types/kinetic-bars";

type MotionModeSelectorProps = {
  value: MotionMode;
  onChange: (mode: MotionMode) => void;
  disabled?: boolean;
};

export function MotionModeSelector({
  value,
  onChange,
  disabled,
}: MotionModeSelectorProps) {
  return (
    <div
      className="kinetic-bars-modes"
      role="radiogroup"
      aria-label="Animation mode"
    >
      {MODE_ORDER.map((mode) => {
        const selected = mode === value;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            className={`kinetic-bars-modes__btn${selected ? " is-active" : ""}`}
            onClick={() => onChange(mode)}
          >
            {MODE_LABELS[mode]}
          </button>
        );
      })}
    </div>
  );
}
