"use client";

import type { PreviewBackdropId } from "../types";

const OPTIONS: { id: PreviewBackdropId; label: string }[] = [
  { id: "black", label: "Black" },
  { id: "charcoal", label: "Charcoal" },
  { id: "white", label: "White" },
  { id: "checker", label: "Checker" },
  { id: "transparent", label: "Transparent" },
];

type PreviewBackdropProps = {
  value: PreviewBackdropId;
  onChange: (value: PreviewBackdropId) => void;
};

export function PreviewBackdrop({ value, onChange }: PreviewBackdropProps) {
  return (
    <div className="chromemark-fields">
      <p className="chromemark-notice">
        Preview only. Exports always stay transparent.
      </p>
      <div className="chromemark-btn-row" role="group" aria-label="Preview background">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className="chromemark-btn"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
