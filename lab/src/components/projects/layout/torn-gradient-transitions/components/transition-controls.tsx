"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  CONTROLS_BY_GROUP,
  CONTROL_GROUP_HINTS,
  CONTROL_GROUP_LABELS,
  CONTROL_GROUP_ORDER,
} from "../lib/transition-controls";
import type {
  ControlDefinition,
  ControlGroupId,
  SettingKey,
  TornTransitionSettings,
} from "../lib/transition-types";
import { roundTo } from "../lib/transition-utils";

type ControlsProps = {
  settings: TornTransitionSettings;
  onChange: (key: SettingKey, value: string | number) => void;
};

/** Colour stops beyond the active count are hidden rather than disabled. */
function isVisible(
  control: ControlDefinition,
  settings: TornTransitionSettings,
): boolean {
  if (control.kind === "color") {
    const index = Number(control.key.slice(-1));
    if (settings.paletteMode === "mono") return index <= 2;
    if (settings.paletteMode !== "stops") return false;
    return index <= settings.stopCount;
  }
  if (control.key === "stopCount") return settings.paletteMode === "stops";
  if (control.key === "cosinePalette") return settings.paletteMode === "cosine";
  return true;
}

function formatValue(value: number, step: number, unit?: string) {
  const text = step >= 1 ? String(Math.round(value)) : roundTo(value, step).toFixed(
    Math.min(3, Math.max(0, Math.ceil(-Math.log10(step)))),
  );
  return unit ? `${text} ${unit}` : text;
}

function ControlRow({
  control,
  settings,
  onChange,
}: {
  control: ControlDefinition;
  settings: TornTransitionSettings;
  onChange: ControlsProps["onChange"];
}) {
  const id = `tgt-${control.key}`;

  if (control.kind === "slider") {
    const value = settings[control.key];
    return (
      <div className="tgt-control">
        <div className="tgt-control__head">
          <Label htmlFor={id} className="tgt-control__label">
            {control.label}
          </Label>
          <output className="tgt-control__value" htmlFor={id}>
            {formatValue(value, control.step, control.unit)}
          </output>
        </div>
        <Slider
          id={id}
          value={[value]}
          min={control.min}
          max={control.max}
          step={control.step}
          onValueChange={(next) =>
            onChange(control.key, Array.isArray(next) ? (next[0] ?? value) : next)
          }
          aria-label={control.label}
        />
        {control.hint ? (
          <p className="tgt-control__hint">{control.hint}</p>
        ) : null}
      </div>
    );
  }

  if (control.kind === "select") {
    return (
      <div className="tgt-control">
        <Label htmlFor={id} className="tgt-control__label">
          {control.label}
        </Label>
        <Select
          value={String(settings[control.key])}
          onValueChange={(next) => next && onChange(control.key, next)}
        >
          <SelectTrigger id={id} className="tgt-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="tgt-select__content">
            {control.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {control.hint ? (
          <p className="tgt-control__hint">{control.hint}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="tgt-control tgt-control--color">
      <Label htmlFor={id} className="tgt-control__label">
        {control.label}
      </Label>
      <div className="tgt-color">
        <input
          id={id}
          type="color"
          value={settings[control.key]}
          onChange={(event) => onChange(control.key, event.target.value)}
          className="tgt-color__swatch"
        />
        <span className="tgt-color__hex">{settings[control.key]}</span>
      </div>
    </div>
  );
}

export function TransitionControls({ settings, onChange }: ControlsProps) {
  const [open, setOpen] = useState<Record<ControlGroupId, boolean>>({
    motion: true,
    shape: true,
    bubbles: false,
    paper: false,
    depth: false,
    gradient: false,
    finishing: false,
  });

  return (
    <div className="tgt-controls">
      {CONTROL_GROUP_ORDER.map((group) => {
        const controls = CONTROLS_BY_GROUP[group].filter((c) =>
          isVisible(c, settings),
        );
        const expanded = open[group];
        const panelId = `tgt-group-${group}`;

        return (
          <section key={group} className="tgt-group">
            <h3 className="tgt-group__heading">
              <button
                type="button"
                className="tgt-group__toggle"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() =>
                  setOpen((prev) => ({ ...prev, [group]: !prev[group] }))
                }
              >
                <span>{CONTROL_GROUP_LABELS[group]}</span>
                <span className="tgt-group__count">{controls.length}</span>
                <span className="tgt-group__chevron" aria-hidden>
                  {expanded ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div id={panelId} hidden={!expanded} className="tgt-group__body">
              <p className="tgt-group__hint">{CONTROL_GROUP_HINTS[group]}</p>
              {controls.map((control) => (
                <ControlRow
                  key={control.key}
                  control={control}
                  settings={settings}
                  onChange={onChange}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
