"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
        <Textarea
          id={control.key}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="border-white/10 bg-black text-white placeholder:text-neutral-500"
        />
      );
    }
    return (
      <Input
        id={control.key}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        className="border-white/10 bg-black text-white placeholder:text-neutral-500"
      />
    );
  }

  if (control.type === "switch") {
    return (
      <Switch
        id={control.key}
        checked={Boolean(value)}
        onCheckedChange={(checked) => onChange(checked)}
      />
    );
  }

  if (control.type === "select") {
    return (
      <Select
        value={String(value ?? "")}
        onValueChange={(v) => {
          if (v != null) onChange(v);
        }}
      >
        <SelectTrigger className="border-white/10 bg-black text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-neutral-950 text-white">
          {control.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (control.type === "color") {
    const hex = String(value ?? "#ffffff");
    const normalized = hex.startsWith("#") ? hex : `#${hex}`;
    const safe = /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : "#ffffff";
    const r = Number.parseInt(safe.slice(1, 3), 16);
    const g = Number.parseInt(safe.slice(3, 5), 16);
    const b = Number.parseInt(safe.slice(5, 7), 16);
    const setRgb = (nr: number, ng: number, nb: number) => {
      const to = (n: number) =>
        Math.max(0, Math.min(255, Math.round(n)))
          .toString(16)
          .padStart(2, "0");
      onChange(`#${to(nr)}${to(ng)}${to(nb)}`);
    };
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <input
            id={control.key}
            type="color"
            value={safe}
            onChange={(e) => onChange(e.target.value)}
            className="size-9 cursor-pointer rounded border border-white/15 bg-black p-0.5"
            aria-label={`${control.label} picker`}
          />
          <Input
            value={normalized}
            onChange={(e) => {
              const next = e.target.value.trim();
              onChange(next.startsWith("#") ? next : `#${next}`);
            }}
            className="border-white/10 bg-black font-mono text-xs text-white"
            aria-label={`${control.label} hex`}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["R", r, (v: number) => setRgb(v, g, b)],
              ["G", g, (v: number) => setRgb(r, v, b)],
              ["B", b, (v: number) => setRgb(r, g, v)],
            ] as const
          ).map(([label, channel, setter]) => (
            <label key={label} className="space-y-1">
              <span className="text-[10px] tracking-wider text-neutral-500 uppercase">
                {label}
              </span>
              <Input
                type="number"
                min={0}
                max={255}
                value={channel}
                onChange={(e) => setter(Number(e.target.value) || 0)}
                className="border-white/10 bg-black font-mono text-xs text-white"
              />
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (control.type !== "slider") {
    return null;
  }

  const numeric = Number(value ?? control.min);
  return (
    <div className="space-y-2">
      <Slider
        id={control.key}
        min={control.min}
        max={control.max}
        step={control.step}
        value={[numeric]}
        onValueChange={(next) => {
          const resolved = Array.isArray(next) ? next[0] : next;
          onChange(resolved ?? control.min);
        }}
        className="py-1"
      />
      <div className="text-xs text-neutral-500">{numeric}</div>
    </div>
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
    <div className="tal-controls space-y-6">
      {grouped.map(({ group, controls }) => (
        <section key={group} className="space-y-4">
          <h3 className="text-xs font-medium tracking-[0.14em] text-neutral-400 uppercase">
            {CONTROL_GROUP_LABELS[group]}
          </h3>
          <div className="space-y-4">
            {controls.map((control) => {
              const value =
                control.key === "text" ? text : settings[control.key];

              return (
                <div key={control.key} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor={control.key} className="text-sm text-neutral-200">
                      {control.label}
                    </Label>
                    {control.type === "switch" ? (
                      <ControlField
                        control={control}
                        value={value}
                        onChange={(v) => {
                          if (control.key === "text") onTextChange(String(v));
                          else onSettingChange(control.key, v);
                        }}
                      />
                    ) : null}
                  </div>
                  {control.type !== "switch" ? (
                    <ControlField
                      control={control}
                      value={value}
                      onChange={(v) => {
                        if (control.key === "text") onTextChange(String(v));
                        else onSettingChange(control.key, v);
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
          <Separator className="bg-white/10" />
        </section>
      ))}
    </div>
  );
}
