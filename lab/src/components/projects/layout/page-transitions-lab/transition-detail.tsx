"use client";

import { useState } from "react";
import { ArrowLeft, Code2, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CodeExportDrawer } from "./code-export-drawer";
import { sanitizeHex } from "./curtain-style";
import { usePrefersReducedMotion, useTransitionRunner } from "./hooks";
import { getNeighborPage, pageSamples } from "./page-samples";
import { TransitionStage } from "./transition-stage";
import type {
  ControlDefinition,
  CurtainDirection,
  CurtainEdge,
  CurtainGradientMode,
  CurtainOrigin,
  PixelColorMode,
  TransitionDefinition,
  TransitionSettings,
} from "./types";

type TransitionDetailProps = {
  definition: TransitionDefinition;
  onBack: () => void;
};

function SettingSlider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="ptl-control">
      <span>
        <span>{label}</span>
        <strong>
          {value}
          {suffix}
        </strong>
      </span>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(next) => {
          const resolved = Array.isArray(next) ? next[0] : next;
          onChange(resolved ?? min);
        }}
      />
    </label>
  );
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const safe = sanitizeHex(value, "#071018");
  return (
    <label className="ptl-control ptl-control--color">
      <span>
        <span>{label}</span>
        <strong className="font-mono text-[0.75rem] tracking-normal normal-case">
          {safe}
        </strong>
      </span>
      <span className="ptl-color-row">
        <input
          type="color"
          aria-label={label}
          value={safe}
          onChange={(event) => onChange(event.target.value)}
          className="ptl-color-swatch"
        />
        <input
          type="text"
          aria-label={`${label} hex`}
          spellCheck={false}
          autoComplete="off"
          value={safe}
          onChange={(event) => {
            const next = event.target.value;
            if (next.startsWith("#") && (next.length === 4 || next.length === 7)) {
              onChange(sanitizeHex(next, safe));
            }
          }}
          className="ptl-color-hex"
        />
      </span>
    </label>
  );
}

function SelectControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="ptl-control ptl-control--select">
      <span>
        <span>{label}</span>
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="ptl-select"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ControlField({
  control,
  settings,
  onNumber,
  onColor,
  onSelect,
}: {
  control: ControlDefinition;
  settings: TransitionSettings;
  onNumber: (key: keyof TransitionSettings, value: number) => void;
  onColor: (
    key: "curtainColorA" | "curtainColorB" | "pixelColorA" | "pixelColorB",
    value: string,
  ) => void;
  onSelect: (
    key:
      | "curtainGradient"
      | "curtainFallIn"
      | "curtainFallOut"
      | "curtainDirIn"
      | "curtainDirOut"
      | "curtainEdgeIn"
      | "curtainEdgeOut"
      | "pixelColorMode",
    value: string,
  ) => void;
}) {
  if (control.type === "color") {
    return (
      <ColorControl
        label={control.label}
        value={settings[control.key]}
        onChange={(value) => onColor(control.key, value)}
      />
    );
  }

  if (control.type === "select") {
    return (
      <SelectControl
        label={control.label}
        value={settings[control.key]}
        options={control.options}
        onChange={(value) => onSelect(control.key, value)}
      />
    );
  }

  return (
    <SettingSlider
      label={control.label}
      value={settings[control.key]}
      min={control.min}
      max={control.max}
      step={control.step}
      suffix={control.suffix}
      onChange={(value) => onNumber(control.key, value)}
    />
  );
}

export function TransitionDetail({ definition, onBack }: TransitionDetailProps) {
  const [settings, setSettings] = useState<TransitionSettings>(definition.defaults);
  const [pageIndex, setPageIndex] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const fromSample = pageSamples[pageIndex] ?? pageSamples[0]!;
  const toIndex = getNeighborPage(pageIndex);
  const toSample = pageSamples[toIndex] ?? pageSamples[1]!;

  const { status, playKey, play, cancel, holdMs } = useTransitionRunner({
    settings,
    reducedMotion,
    curtainCount:
      definition.id === "curtain-fall" ? settings.curtains : undefined,
    curtainFallIn:
      definition.id === "curtain-fall" ? settings.curtainFallIn : undefined,
    curtainFallOut:
      definition.id === "curtain-fall" ? settings.curtainFallOut : undefined,
    wormholeExtra: definition.id === "pixel-wormhole",
    onComplete: () => {
      setPageIndex(toIndex);
    },
  });

  const handleReset = () => {
    cancel();
    setSettings(definition.defaults);
    setPageIndex(0);
  };

  const updateNumber = (key: keyof TransitionSettings, value: number) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const updateColor = (
    key: "curtainColorA" | "curtainColorB" | "pixelColorA" | "pixelColorB",
    value: string,
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: sanitizeHex(value, current[key]),
    }));
  };

  const updateSelect = (
    key:
      | "curtainGradient"
      | "curtainFallIn"
      | "curtainFallOut"
      | "curtainDirIn"
      | "curtainDirOut"
      | "curtainEdgeIn"
      | "curtainEdgeOut"
      | "pixelColorMode",
    value: string,
  ) => {
    setSettings((current) => {
      if (key === "curtainGradient") {
        return { ...current, curtainGradient: value as CurtainGradientMode };
      }
      if (key === "curtainFallIn") {
        return { ...current, curtainFallIn: value as CurtainOrigin };
      }
      if (key === "curtainFallOut") {
        return { ...current, curtainFallOut: value as CurtainOrigin };
      }
      if (key === "curtainDirIn") {
        return { ...current, curtainDirIn: value as CurtainDirection };
      }
      if (key === "curtainDirOut") {
        return { ...current, curtainDirOut: value as CurtainDirection };
      }
      if (key === "curtainEdgeIn") {
        return { ...current, curtainEdgeIn: value as CurtainEdge };
      }
      if (key === "curtainEdgeOut") {
        return { ...current, curtainEdgeOut: value as CurtainEdge };
      }
      return { ...current, pixelColorMode: value as PixelColorMode };
    });
  };

  const handlePlay = () => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      document
        .getElementById("ptl-stage-anchor")
        ?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
    }
    play();
  };

  return (
    <div className="ptl-detail">
      <div className="ptl-detail__intro">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-[var(--ptl-blue)]/10 hover:text-[var(--ptl-blue)]"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
          All transitions
        </Button>

        <div className="mt-4 space-y-2">
          <p className="text-xs tracking-[0.14em] text-[var(--ptl-blue)] uppercase">
            {definition.eyebrow}
            {definition.engine === "three" ? " · 3D" : " · CSS"}
          </p>
          <h1 className="ptl-detail__title">{definition.title}</h1>
        </div>
      </div>

      <div className="ptl-detail__layout">
        <div className="ptl-detail__main">
          <div id="ptl-stage-anchor" className="ptl-detail__stage-wrap">
            <TransitionStage
              selectedId={definition.id}
              settings={settings}
              status={status}
              playKey={playKey}
              fromSample={fromSample}
              toSample={toSample}
              reducedMotion={reducedMotion}
              holdMs={holdMs}
            />
          </div>

          <div className="ptl-detail__actions">
            <Button
              variant="outline"
              className="border-[var(--ptl-blue)]/35 bg-transparent text-white hover:border-[var(--ptl-blue)] hover:bg-[var(--ptl-blue)]/10"
              onClick={handlePlay}
              disabled={status === "running"}
            >
              <RotateCw className="size-4" />
              {status === "running" ? "Playing" : "Replay"}
            </Button>
            <Button
              variant="outline"
              className="border-[var(--ptl-blue)]/35 bg-transparent text-white hover:border-[var(--ptl-blue)] hover:bg-[var(--ptl-blue)]/10"
              onClick={handleReset}
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
            <Button
              className="bg-[var(--ptl-blue)] text-white hover:bg-[var(--ptl-blue-deep)]"
              onClick={() => setExportOpen(true)}
            >
              <Code2 className="size-4" />
              Export
            </Button>
          </div>
        </div>

        <aside className="ptl-detail__panel" aria-label="Transition controls">
          <p className="mb-4 text-xs font-medium tracking-[0.14em] text-[var(--ptl-blue)] uppercase">
            Controls
          </p>
          {definition.controls.map((control) => (
            <ControlField
              key={control.key}
              control={control}
              settings={settings}
              onNumber={updateNumber}
              onColor={updateColor}
              onSelect={updateSelect}
            />
          ))}
          {reducedMotion ? (
            <div className="ptl-reduced-note">
              <strong>Reduced motion on</strong>
              <p>Previews use a short opacity bridge.</p>
            </div>
          ) : null}
        </aside>
      </div>

      <CodeExportDrawer
        open={exportOpen}
        onOpenChange={setExportOpen}
        definition={definition}
        settings={settings}
      />
    </div>
  );
}
