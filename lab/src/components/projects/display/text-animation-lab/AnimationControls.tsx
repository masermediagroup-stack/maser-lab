"use client";

import {
  LabButton,
  LabColor,
  LabControlGroup,
  LabRange,
  LabSelect,
} from "@/components/lab/demo-chrome";
import type { AnimationDefinition, AnimationSettings, ControlDefinition } from "./types";
import { CONTROL_GROUP_LABELS, CONTROL_GROUP_ORDER } from "./utils";

type AnimationControlsProps = {
  definition: AnimationDefinition;
  text: string;
  settings: AnimationSettings;
  onTextChange: (value: string) => void;
  onSettingChange: (key: string, value: string | number | boolean) => void;
};

function ControlField({
  control,
  value,
  onChange,
}: {
  control: ControlDefinition;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
}) {
  if (control.type === "text") {
    if (control.multiline) {
      return (
        <div className="flex min-w-0 flex-col gap-1">
          <label
            htmlFor={control.key}
            className="font-mono text-xs text-[var(--lab-text-secondary)]"
          >
            {control.label}
          </label>
          <textarea
            id={control.key}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="min-h-11 w-full rounded-[var(--lab-radius-sm)] border border-[var(--lab-border)] bg-[var(--lab-surface)] px-2 py-2 font-mono text-xs text-[var(--lab-text-primary)]"
          />
        </div>
      );
    }
    return (
      <div className="flex min-w-0 flex-col gap-1">
        <label
          htmlFor={control.key}
          className="font-mono text-xs text-[var(--lab-text-secondary)]"
        >
          {control.label}
        </label>
        <input
          id={control.key}
          type="text"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-11 w-full rounded-[var(--lab-radius-sm)] border border-[var(--lab-border)] bg-[var(--lab-surface)] px-2 font-mono text-xs text-[var(--lab-text-primary)]"
        />
      </div>
    );
  }

  if (control.type === "switch") {
    const checked = Boolean(value);
    return (
      <LabButton
        type="button"
        variant={checked ? "accent" : "outline"}
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
      >
        {control.label}: {checked ? "on" : "off"}
      </LabButton>
    );
  }

  if (control.type === "select") {
    return (
      <LabSelect
        id={control.key}
        label={control.label}
        value={String(value ?? "")}
        options={control.options}
        onChange={onChange}
      />
    );
  }

  if (control.type === "color") {
    const hex = String(value ?? "#ffffff");
    const normalized = hex.startsWith("#") ? hex : `#${hex}`;
    const safe = /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : "#ffffff";
    return (
      <LabColor
        id={control.key}
        label={control.label}
        value={safe}
        onChange={onChange}
      />
    );
  }

  if (control.type !== "slider") {
    return null;
  }

  const numeric = Number(value ?? control.min);
  return (
    <LabRange
      id={control.key}
      label={control.label}
      min={control.min}
      max={control.max}
      step={control.step}
      value={numeric}
      display={String(numeric)}
      onChange={onChange}
    />
  );
}

export function AnimationControls({
  definition,
  text,
  settings,
  onTextChange,
  onSettingChange,
}: AnimationControlsProps) {
  const grouped = CONTROL_GROUP_ORDER.map((group) => ({
    group,
    controls: definition.controls.filter((c) => c.group === group),
  })).filter((entry) => entry.controls.length > 0);

  return (
    <div className="tal-controls flex flex-col gap-2">
      {grouped.map(({ group, controls }) => (
        <LabControlGroup key={group} label={CONTROL_GROUP_LABELS[group]}>
          {controls.map((control) => {
            const value = control.key === "text" ? text : settings[control.key];
            return (
              <ControlField
                key={control.key}
                control={control}
                value={value}
                onChange={(v) => {
                  if (control.key === "text") onTextChange(String(v));
                  else onSettingChange(control.key, v);
                }}
              />
            );
          })}
        </LabControlGroup>
      ))}
    </div>
  );
}
