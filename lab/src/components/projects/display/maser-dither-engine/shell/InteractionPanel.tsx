"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  INTERACTION_MODES,
  createDefaultLights,
  DEFAULT_INTERACTION_CONFIG,
} from "../engine/interaction";
import type {
  FalloffType,
  HoldBehaviorId,
  InteractionEngineConfig,
  InteractionModeId,
  ReleaseBehaviorId,
  RippleStyleId,
  TrailModeId,
} from "../engine/interaction/types";
import { cn } from "@/lib/utils";

type InteractionPanelProps = {
  value: InteractionEngineConfig;
  onChange: (next: InteractionEngineConfig) => void;
  idPrefix?: string;
};

function formatValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2);
}

const HOLD_OPTIONS: { id: HoldBehaviorId; label: string }[] = [
  { id: "none", label: "None" },
  { id: "charge", label: "Charge" },
  { id: "accumulate", label: "Accumulate" },
  { id: "grow-radius", label: "Grow Radius" },
  { id: "contrast", label: "Contrast" },
  { id: "bloom", label: "Bloom" },
  { id: "ripples", label: "Ripples" },
  { id: "density", label: "Density" },
  { id: "pulse", label: "Pulse" },
];

const RELEASE_OPTIONS: { id: ReleaseBehaviorId; label: string }[] = [
  { id: "fade", label: "Fade" },
  { id: "ripple", label: "Ripple" },
  { id: "shockwave", label: "Shockwave" },
  { id: "bloom", label: "Bloom" },
  { id: "collapse", label: "Collapse" },
  { id: "elastic", label: "Elastic" },
];

const TRAIL_OPTIONS: { id: TrailModeId; label: string }[] = [
  { id: "none", label: "None" },
  { id: "light", label: "Light" },
  { id: "density", label: "Density" },
  { id: "heat", label: "Heat" },
  { id: "gradient", label: "Gradient" },
  { id: "ghost", label: "Ghost" },
  { id: "motion-blur", label: "Motion Blur" },
];

const RIPPLE_OPTIONS: { id: RippleStyleId; label: string }[] = [
  { id: "none", label: "None" },
  { id: "single", label: "Single" },
  { id: "repeating", label: "Repeating" },
  { id: "noise", label: "Noise" },
  { id: "directional", label: "Directional" },
  { id: "pressure", label: "Pressure" },
];

const FALLOFF_OPTIONS: { id: FalloffType; label: string }[] = [
  { id: "linear", label: "Linear" },
  { id: "smooth", label: "Smooth" },
  { id: "gaussian", label: "Gaussian" },
  { id: "exponential", label: "Exponential" },
  { id: "power", label: "Power" },
];

/**
 * Interaction / lighting / physics controls — catalog-driven sections.
 */
export function InteractionPanel({
  value,
  onChange,
  idPrefix = "mde-ix",
}: InteractionPanelProps) {
  const physics = value.physics;
  const falloff = value.falloff;
  const trail = value.trail;
  const ripple = value.ripple;
  const showPhysics = value.modeId !== "none";
  const showTrail = trail.mode !== "none";
  const showRipple =
    ripple.style !== "none" || value.modeId === "ripple";

  const patch = (partial: Partial<InteractionEngineConfig>) => {
    onChange({
      ...value,
      ...partial,
      physics: partial.physics
        ? { ...value.physics, ...partial.physics }
        : value.physics,
      falloff: partial.falloff
        ? { ...value.falloff, ...partial.falloff }
        : value.falloff,
      trail: partial.trail ? { ...value.trail, ...partial.trail } : value.trail,
      ripple: partial.ripple
        ? { ...value.ripple, ...partial.ripple }
        : value.ripple,
      hold: partial.hold ? { ...value.hold, ...partial.hold } : value.hold,
      release: partial.release
        ? { ...value.release, ...partial.release }
        : value.release,
      lights: partial.lights ?? value.lights,
    });
  };

  return (
    <div className="mde-ix-panel">
      <div className="mde-field">
        <span className="mde-field__label">Interaction Mode</span>
        <div className="mde-anim-modes" role="listbox" aria-label="Interaction modes">
          {INTERACTION_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="option"
              aria-selected={value.modeId === m.id}
              className={cn(
                "mde-chip",
                value.modeId === m.id && "mde-chip--active",
              )}
              title={m.purpose}
              onClick={() => patch({ modeId: m.id as InteractionModeId })}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mde-anim-panel__hint">
          {INTERACTION_MODES.find((m) => m.id === value.modeId)?.purpose}
        </p>
        <label className="mde-check">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) => patch({ enabled: e.target.checked })}
          />
          Enabled
        </label>
        <label className="mde-check">
          <input
            type="checkbox"
            checked={value.debug}
            onChange={(e) => patch({ debug: e.target.checked })}
          />
          Debug overlay
        </label>
      </div>

      <div className="mde-anim-panel__section">
        <span className="mde-field__label">Pointer</span>
        <SliderField
          id={`${idPrefix}-inf`}
          label="Pointer Influence"
          tip="Global pointer contribution to interaction lights and tug. Single owner — no longer multiplied with a material cursor slider."
          min={0}
          max={1}
          step={0.01}
          value={value.influence}
          onChange={(influence) => patch({ influence })}
        />
        <label className="mde-check">
          <input
            type="checkbox"
            checked={value.responsiveScale}
            onChange={(e) => patch({ responsiveScale: e.target.checked })}
          />
          Responsive radius scaling
        </label>
      </div>

      {showPhysics ? (
        <div className="mde-anim-panel__section">
          <span className="mde-field__label">Physics</span>
          {(
            [
              ["interpolation", "Interpolation", 0, 1, 0.01],
              ["easing", "Easing", 0, 1, 0.01],
              ["springStrength", "Spring Strength", 1, 40, 0.5],
              ["mass", "Mass", 0.2, 3, 0.05],
              ["friction", "Friction", 0.5, 20, 0.1],
              ["velocityInfluence", "Velocity Influence", 0, 1, 0.01],
              ["acceleration", "Acceleration", 1, 40, 0.5],
              ["maxSpeed", "Max Speed", 0.2, 5, 0.05],
              ["deadZone", "Dead Zone", 0, 0.08, 0.001],
              ["smoothing", "Smoothing", 0, 1, 0.01],
            ] as const
          ).map(([key, label, min, max, step]) => (
            <SliderField
              key={key}
              id={`${idPrefix}-${key}`}
              label={label}
              min={min}
              max={max}
              step={step}
              value={physics[key]}
              onChange={(v) => patch({ physics: { ...physics, [key]: v } })}
            />
          ))}
        </div>
      ) : null}

      <div className="mde-anim-panel__section">
        <span className="mde-field__label">Lighting</span>
        <p className="mde-anim-panel__hint">
          Up to 8 procedural lights — toggle roles below.
        </p>
        {value.lights.map((light, index) => (
          <div key={light.id} className="mde-ix-light">
            <label className="mde-check">
              <input
                type="checkbox"
                checked={light.enabled}
                onChange={(e) => {
                  const lights = value.lights.map((l, i) =>
                    i === index ? { ...l, enabled: e.target.checked } : l,
                  );
                  patch({ lights });
                }}
              />
              {light.role} ({light.id})
            </label>
            {light.enabled && light.role !== "pointer" ? (
              <>
                <SliderField
                  id={`${idPrefix}-l${index}-r`}
                  label="Radius"
                  min={0.05}
                  max={1.2}
                  step={0.01}
                  value={light.radius}
                  onChange={(radius) => {
                    const lights = value.lights.map((l, i) =>
                      i === index ? { ...l, radius } : l,
                    );
                    patch({ lights });
                  }}
                />
                <SliderField
                  id={`${idPrefix}-l${index}-i`}
                  label="Intensity"
                  min={0}
                  max={1.5}
                  step={0.01}
                  value={light.intensity}
                  onChange={(intensity) => {
                    const lights = value.lights.map((l, i) =>
                      i === index ? { ...l, intensity } : l,
                    );
                    patch({ lights });
                  }}
                />
              </>
            ) : null}
            {light.enabled && light.role === "pointer" ? (
              <SliderField
                id={`${idPrefix}-l${index}-i`}
                label="Pointer Intensity"
                min={0}
                max={1.5}
                step={0.01}
                value={light.intensity}
                onChange={(intensity) => {
                  const lights = value.lights.map((l, i) =>
                    i === index ? { ...l, intensity } : l,
                  );
                  patch({ lights });
                }}
              />
            ) : null}
          </div>
        ))}
        <button
          type="button"
          className="mde-chip"
          onClick={() => patch({ lights: createDefaultLights() })}
        >
          Reset lights
        </button>
      </div>

      <div className="mde-anim-panel__section">
        <span className="mde-field__label">Falloff</span>
        <ChipRow
          options={FALLOFF_OPTIONS}
          value={falloff.type}
          onChange={(type) => patch({ falloff: { ...falloff, type } })}
        />
        <SliderField
          id={`${idPrefix}-fr`}
          label="Radius"
          min={0.08}
          max={1.2}
          step={0.01}
          value={falloff.radius}
          onChange={(radius) => patch({ falloff: { ...falloff, radius } })}
        />
        <SliderField
          id={`${idPrefix}-fs`}
          label="Softness"
          min={0}
          max={1}
          step={0.01}
          value={falloff.softness}
          onChange={(softness) => patch({ falloff: { ...falloff, softness } })}
        />
        <SliderField
          id={`${idPrefix}-fp`}
          label="Power"
          min={0.5}
          max={4}
          step={0.05}
          value={falloff.power}
          onChange={(power) => patch({ falloff: { ...falloff, power } })}
        />
      </div>

      <div className="mde-anim-panel__section">
        <span className="mde-field__label">Trails</span>
        <ChipRow
          options={TRAIL_OPTIONS}
          value={trail.mode}
          onChange={(mode) => patch({ trail: { ...trail, mode } })}
        />
        {showTrail ? (
          <>
            <SliderField
              id={`${idPrefix}-tl`}
              label="Length"
              min={0.1}
              max={1}
              step={0.01}
              value={trail.length}
              onChange={(length) => patch({ trail: { ...trail, length } })}
            />
            <SliderField
              id={`${idPrefix}-ti`}
              label="Intensity"
              min={0}
              max={1}
              step={0.01}
              value={trail.intensity}
              onChange={(intensity) =>
                patch({ trail: { ...trail, intensity } })
              }
            />
            <SliderField
              id={`${idPrefix}-tw`}
              label="Width"
              min={0.01}
              max={0.2}
              step={0.005}
              value={trail.width}
              onChange={(width) => patch({ trail: { ...trail, width } })}
            />
            <SliderField
              id={`${idPrefix}-td`}
              label="Decay"
              min={0.4}
              max={0.98}
              step={0.01}
              value={trail.decay}
              onChange={(decay) => patch({ trail: { ...trail, decay } })}
            />
          </>
        ) : null}
      </div>

      <div className="mde-anim-panel__section">
        <span className="mde-field__label">Ripples</span>
        <ChipRow
          options={RIPPLE_OPTIONS}
          value={ripple.style}
          onChange={(style) => patch({ ripple: { ...ripple, style } })}
        />
        {showRipple ? (
          <>
            <SliderField
              id={`${idPrefix}-ra`}
              label="Amplitude"
              min={0}
              max={0.5}
              step={0.01}
              value={ripple.amplitude}
              onChange={(amplitude) =>
                patch({ ripple: { ...ripple, amplitude } })
              }
            />
            <SliderField
              id={`${idPrefix}-rf`}
              label="Frequency"
              min={2}
              max={24}
              step={0.5}
              value={ripple.frequency}
              onChange={(frequency) =>
                patch({ ripple: { ...ripple, frequency } })
              }
            />
            <SliderField
              id={`${idPrefix}-rd`}
              label="Decay"
              min={0.2}
              max={3}
              step={0.05}
              value={ripple.decay}
              onChange={(decay) => patch({ ripple: { ...ripple, decay } })}
            />
            <SliderField
              id={`${idPrefix}-re`}
              label="Expansion"
              min={0.1}
              max={1.5}
              step={0.05}
              value={ripple.expansionSpeed}
              onChange={(expansionSpeed) =>
                patch({ ripple: { ...ripple, expansionSpeed } })
              }
            />
          </>
        ) : null}
      </div>

      <div className="mde-anim-panel__section">
        <span className="mde-field__label">Hold</span>
        <ChipRow
          options={HOLD_OPTIONS}
          value={value.hold.behavior}
          onChange={(behavior) =>
            patch({ hold: { ...value.hold, behavior } })
          }
        />
        <SliderField
          id={`${idPrefix}-hc`}
          label="Charge Rate"
          min={0.05}
          max={2}
          step={0.05}
          value={value.hold.chargeRate}
          onChange={(chargeRate) =>
            patch({ hold: { ...value.hold, chargeRate } })
          }
        />
      </div>

      <div className="mde-anim-panel__section">
        <span className="mde-field__label">Release</span>
        <ChipRow
          options={RELEASE_OPTIONS}
          value={value.release.behavior}
          onChange={(behavior) =>
            patch({ release: { ...value.release, behavior } })
          }
        />
        <SliderField
          id={`${idPrefix}-rs`}
          label="Strength"
          min={0}
          max={1.5}
          step={0.05}
          value={value.release.strength}
          onChange={(strength) =>
            patch({ release: { ...value.release, strength } })
          }
        />
        <SliderField
          id={`${idPrefix}-rdur`}
          label="Duration"
          min={0.1}
          max={2}
          step={0.05}
          value={value.release.duration}
          onChange={(duration) =>
            patch({ release: { ...value.release, duration } })
          }
        />
      </div>

      <button
        type="button"
        className="mde-chip"
        onClick={() =>
          onChange({
            ...DEFAULT_INTERACTION_CONFIG,
            physics: { ...DEFAULT_INTERACTION_CONFIG.physics },
            falloff: { ...DEFAULT_INTERACTION_CONFIG.falloff },
            trail: { ...DEFAULT_INTERACTION_CONFIG.trail },
            ripple: { ...DEFAULT_INTERACTION_CONFIG.ripple },
            hold: { ...DEFAULT_INTERACTION_CONFIG.hold },
            release: { ...DEFAULT_INTERACTION_CONFIG.release },
            lights: createDefaultLights(),
          })
        }
      >
        Reset interaction
      </button>
    </div>
  );
}

function SliderField({
  id,
  label,
  tip,
  min,
  max,
  step,
  value,
  onChange,
}: {
  id: string;
  label: string;
  tip?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mde-field">
      <div className="mde-field__row">
        <Label htmlFor={id} title={tip}>
          {label}
        </Label>
        <span>{formatValue(value)}</span>
      </div>
      {tip ? <p className="mde-field__hint">{tip}</p> : null}
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

function ChipRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mde-preset-row">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className={cn("mde-chip", value === o.id && "mde-chip--active")}
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
