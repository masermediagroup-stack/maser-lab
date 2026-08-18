"use client";

type NumberSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
  onChange: (value: number) => void;
};

export function NumberSlider({
  label,
  value,
  min,
  max,
  step = 0.01,
  format = (v) => String(v),
  onChange,
}: NumberSliderProps) {
  const id = `chromemark-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="chromemark-field">
      <div className="chromemark-field-row">
        <label htmlFor={id}>{label}</label>
        <span className="chromemark-value">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

type ToggleRowProps = {
  label: string;
  pressed: boolean;
  onToggle: () => void;
};

export function ToggleRow({ label, pressed, onToggle }: ToggleRowProps) {
  return (
    <div className="chromemark-field-row">
      <span className="chromemark-label">{label}</span>
      <button
        type="button"
        className="chromemark-btn"
        aria-pressed={pressed}
        onClick={onToggle}
      >
        {pressed ? "On" : "Off"}
      </button>
    </div>
  );
}
