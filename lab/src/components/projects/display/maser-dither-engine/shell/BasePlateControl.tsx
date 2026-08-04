"use client";

import { cn } from "@/lib/utils";
import {
  BASE_PLATE_OPTIONS,
  resolveBasePlate,
  withBasePlate,
  type BasePlateId,
  type ColorMaterialConfig,
} from "../engine/color";

type BasePlateControlProps = {
  value: ColorMaterialConfig;
  onChange: (next: ColorMaterialConfig) => void;
  idPrefix?: string;
  /** Compact label for the pinned playground strip. */
  compact?: boolean;
};

/**
 * First-stop foundation: component plate is Black or White before other color settings.
 */
export function BasePlateControl({
  value,
  onChange,
  idPrefix = "mde-base",
  compact = false,
}: BasePlateControlProps) {
  const active = resolveBasePlate(value.colors.background);

  const setPlate = (plate: BasePlateId) => {
    onChange(withBasePlate(value, plate));
  };

  return (
    <div className={cn("mde-base-plate", compact && "mde-base-plate--compact")}>
      <div className="mde-field__row">
        <span className="mde-field__label" id={`${idPrefix}-label`}>
          {compact ? "Background" : "Component background"}
        </span>
      </div>
      {!compact ? (
        <p className="mde-field__hint">
          Start here — Black or White plate under the material. Palettes keep this
          choice.
        </p>
      ) : null}
      <div
        className="mde-preset-row mde-base-plate__row"
        role="radiogroup"
        aria-labelledby={`${idPrefix}-label`}
      >
        {BASE_PLATE_OPTIONS.map((opt) => {
          const selected = active === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={cn(
                "mde-chip mde-base-plate__chip",
                `mde-base-plate__chip--${opt.id}`,
                selected && "mde-chip--active",
              )}
              onClick={() => setPlate(opt.id)}
            >
              <span
                className={cn(
                  "mde-base-plate__swatch",
                  `mde-base-plate__swatch--${opt.id}`,
                )}
                aria-hidden
              />
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
