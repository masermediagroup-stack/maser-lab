"use client";

import { useState } from "react";
import { ArrowLeft, Code2, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CodeExportDrawer } from "./code-export-drawer";
import { usePrefersReducedMotion, useTransitionRunner } from "./hooks";
import { getNeighborPage, pageSamples } from "./page-samples";
import { TransitionStage } from "./transition-stage";
import type { TransitionDefinition, TransitionSettings } from "./types";

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

export function TransitionDetail({ definition, onBack }: TransitionDetailProps) {
  const [settings, setSettings] = useState<TransitionSettings>(definition.defaults);
  const [pageIndex, setPageIndex] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const fromSample = pageSamples[pageIndex] ?? pageSamples[0]!;
  const toIndex = getNeighborPage(pageIndex);
  const toSample = pageSamples[toIndex] ?? pageSamples[1]!;

  const { status, playKey, play, cancel } = useTransitionRunner({
    settings,
    reducedMotion,
    curtainCount:
      definition.id === "curtain-fall" ? settings.curtains : undefined,
    onComplete: () => {
      setPageIndex(toIndex);
    },
  });

  const handleReset = () => {
    cancel();
    setSettings(definition.defaults);
    setPageIndex(0);
  };

  const updateSetting = (key: keyof TransitionSettings, value: number) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handlePlay = () => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      document
        .getElementById("ptl-stage-anchor")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
            <SettingSlider
              key={control.key}
              label={control.label}
              value={settings[control.key]}
              min={control.min}
              max={control.max}
              step={control.step}
              suffix={control.suffix}
              onChange={(value) => updateSetting(control.key, value)}
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
