"use client";

import { useState } from "react";
import { Code2, RotateCcw, RotateCw } from "lucide-react";
import {
  DemoBackButton,
  DemoControlMenu,
  LabButton,
  LabColor,
  LabRange,
  LabSelect,
} from "@/components/lab/demo-chrome";
import { Button } from "@/components/ui/button";
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
    const raw = settings[control.key];
    const safe = sanitizeHex(raw, "#071018");
    return (
      <LabColor
        id={`ptl-${control.key}`}
        label={control.label}
        value={safe}
        onChange={(value) => onColor(control.key, value)}
      />
    );
  }

  if (control.type === "select") {
    return (
      <LabSelect
        id={`ptl-${control.key}`}
        label={control.label}
        value={settings[control.key]}
        options={control.options}
        onChange={(value) => onSelect(control.key, value)}
      />
    );
  }

  const value = settings[control.key];
  return (
    <LabRange
      id={`ptl-${control.key}`}
      label={control.label}
      value={value}
      min={control.min}
      max={control.max}
      step={control.step}
      display={`${value}${control.suffix ?? ""}`}
      onChange={(next) => onNumber(control.key, next)}
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
    <div className="ptl-detail lab-demo-inset">
      <DemoControlMenu>
        <DemoBackButton />
        <LabButton type="button" variant="outline" onClick={onBack}>
          All transitions
        </LabButton>
        <p className="font-mono text-xs text-[var(--lab-text-secondary)]">
          {definition.title}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <LabButton
            type="button"
            variant="outline"
            onClick={handlePlay}
            disabled={status === "running"}
          >
            {status === "running" ? "Playing" : "Replay"}
          </LabButton>
          <LabButton type="button" variant="outline" onClick={handleReset}>
            Reset
          </LabButton>
          <LabButton type="button" variant="outline" onClick={() => setExportOpen(true)}>
            Export
          </LabButton>
        </div>
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
          <p className="font-mono text-[10px] leading-relaxed text-[var(--lab-text-muted)]">
            Reduced motion on — previews use a short opacity bridge.
          </p>
        ) : null}
      </DemoControlMenu>

      <div className="ptl-detail__intro">
        <p className="text-xs tracking-[0.14em] text-[var(--ptl-blue)] uppercase">
          {definition.eyebrow}
          {definition.engine === "three" ? " · 3D" : " · CSS"}
        </p>
        <h1 className="ptl-detail__title">{definition.title}</h1>
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
