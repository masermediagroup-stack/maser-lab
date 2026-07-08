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
  // Parent remounts this component with key={definition.id} so defaults reset cleanly.
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

  return (
    <div className="ptl-detail">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="text-neutral-300 hover:bg-white/5 hover:text-white"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
          Back to all transitions
        </Button>

        <div className="mt-4 space-y-2">
          <p className="text-xs tracking-[0.14em] text-neutral-500 uppercase">
            {definition.eyebrow}
            {definition.engine === "three" ? " · Three.js" : " · CSS"}
          </p>
          <h1 className="ptl-detail__title">{definition.title}</h1>
          <p className="ptl-detail__description">{definition.description}</p>
        </div>
      </div>

      <div className="ptl-detail__layout">
        <div>
          <TransitionStage
            selectedId={definition.id}
            settings={settings}
            status={status}
            playKey={playKey}
            fromSample={fromSample}
            toSample={toSample}
            reducedMotion={reducedMotion}
          />

          <div className="ptl-detail__actions">
            <Button
              variant="outline"
              className="border-white/15 bg-transparent text-white hover:bg-white/5"
              onClick={play}
              disabled={status === "running"}
            >
              <RotateCw className="size-4" />
              {status === "running" ? "Playing" : "Replay"}
            </Button>
            <Button
              variant="outline"
              className="border-white/15 bg-transparent text-white hover:bg-white/5"
              onClick={handleReset}
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
            <Button
              className="bg-white text-black hover:bg-neutral-200"
              onClick={() => setExportOpen(true)}
            >
              <Code2 className="size-4" />
              Export code
            </Button>
          </div>

          <div className="ptl-notes">
            <article>
              <span>Use case</span>
              <p>{definition.useCase}</p>
            </article>
            <article>
              <span>Mechanics</span>
              <p>{definition.mechanics}</p>
            </article>
            <article>
              <span>Risk to test</span>
              <p>{definition.risk}</p>
            </article>
          </div>
        </div>

        <aside className="ptl-detail__panel" aria-label="Transition controls">
          <p className="mb-4 text-xs font-medium tracking-[0.14em] text-neutral-400 uppercase">
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
          <div className="ptl-reduced-note">
            <strong>Reduced motion</strong>
            <p>
              {reducedMotion
                ? "System preference is active — previews collapse to a short opacity bridge."
                : "A reduced-motion branch removes large travel, blur, and curtain physics."}
            </p>
          </div>
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
