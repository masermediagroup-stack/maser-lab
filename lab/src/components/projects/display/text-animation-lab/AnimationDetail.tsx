"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Code2,
  Dices,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Shuffle,
} from "lucide-react";
import {
  applyPreset,
  TETRIS_PRESETS,
  type PresetId,
  type TetrisPixelSettings,
} from "@/components/text-animations";
import { Button } from "@/components/ui/button";
import type { AnimationDefinition, AnimationSettings } from "./types";
import { getDefaultSettings } from "./animation-registry";
import { AnimationControls } from "./AnimationControls";
import { AnimationPreview } from "./AnimationPreview";
import { CodeExportDrawer } from "./CodeExportDrawer";

type AnimationDetailProps = {
  definition: AnimationDefinition;
  onBack: () => void;
};

function asTetrisSettings(settings: AnimationSettings): TetrisPixelSettings {
  return settings as unknown as TetrisPixelSettings;
}

export function AnimationDetail({ definition, onBack }: AnimationDetailProps) {
  const [text, setText] = useState(definition.defaultText);
  const [settings, setSettings] = useState<AnimationSettings>(
    getDefaultSettings(definition),
  );
  const [playKey, setPlayKey] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const isTetris = definition.id === "tetris-pixel-text";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [definition.id]);

  const handleSettingChange = useCallback((key: string, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === "phase") {
      setPlayKey((k) => k + 1);
    }
  }, []);

  const handleReplay = () => {
    setSettings((prev) => ({ ...prev, paused: false }));
    setPlayKey((k) => k + 1);
  };

  const handleReset = () => {
    setText(definition.defaultText);
    setSettings(getDefaultSettings(definition));
    setPlayKey((k) => k + 1);
  };

  const playPhase = (phase: "in" | "out") => {
    setSettings((prev) => ({ ...prev, phase, paused: false }));
    setPlayKey((k) => k + 1);
  };

  const togglePause = () => {
    setSettings((prev) => ({ ...prev, paused: !prev.paused }));
  };

  const randomizePieces = () => {
    const layoutSeed = Math.floor(Math.random() * 900000) + 1000;
    const motionSeed = Math.floor(Math.random() * 900000) + 1000;
    setSettings((prev) => ({
      ...prev,
      layoutSeed,
      motionSeed,
      phase: "in",
      paused: false,
    }));
    setPlayKey((k) => k + 1);
  };

  const randomizeMotion = () => {
    const motionSeed = Math.floor(Math.random() * 900000) + 1000;
    setSettings((prev) => ({
      ...prev,
      motionSeed,
      phase: "in",
      paused: false,
    }));
    setPlayKey((k) => k + 1);
  };

  const newSeed = () => {
    randomizePieces();
  };

  const applyTetrisPreset = (id: PresetId) => {
    const next = applyPreset(id, asTetrisSettings(settings));
    setSettings({ ...next, phase: "in", paused: false });
    setPlayKey((k) => k + 1);
  };

  const isScrollReveal = definition.id === "scroll-line-reveal";
  const paused = Boolean(settings.paused);

  return (
    <div className="tal-detail">
      <div className="tal-detail__top">
        <Button
          variant="ghost"
          size="sm"
          className="text-neutral-300 hover:bg-white/5 hover:text-white"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
          Back to all animations
        </Button>

        <div className="mt-4 space-y-2">
          <h1 className="tal-detail__title">{definition.title}</h1>
          <p className="tal-detail__description">{definition.description}</p>
        </div>
      </div>

      <div className="tal-detail__layout">
        <div className="tal-detail__main">
          <div
            className="tal-detail__preview"
            data-tal-scroll-host={isScrollReveal ? "" : undefined}
          >
            <AnimationPreview
              definition={definition}
              text={text}
              settings={settings}
              playKey={playKey}
              embeddedScroll={isScrollReveal}
            />
          </div>

          {isTetris ? (
            <div className="tal-detail__actions flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/5"
                onClick={() => playPhase("in")}
              >
                <Play className="size-4" />
                Play Reveal In
              </Button>
              <Button
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/5"
                onClick={() => playPhase("out")}
              >
                <Play className="size-4" />
                Play Reveal Out
              </Button>
              <Button
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/5"
                onClick={handleReplay}
              >
                <RotateCw className="size-4" />
                Replay
              </Button>
              <Button
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/5"
                onClick={togglePause}
              >
                {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                {paused ? "Resume" : "Pause"}
              </Button>
              <Button
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/5"
                onClick={randomizePieces}
              >
                <Shuffle className="size-4" />
                Randomize Pieces
              </Button>
              <Button
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/5"
                onClick={randomizeMotion}
              >
                <Dices className="size-4" />
                Randomize Motion
              </Button>
              <Button
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/5"
                onClick={newSeed}
              >
                New Seed
              </Button>
              <Button
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/5"
                onClick={handleReset}
              >
                <RotateCcw className="size-4" />
                Reset Defaults
              </Button>
              <Button
                className="bg-white text-black hover:bg-neutral-200"
                onClick={() => setExportOpen(true)}
              >
                <Code2 className="size-4" />
                Export Code
              </Button>
            </div>
          ) : (
            <div className="tal-detail__actions">
              <Button
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/5"
                onClick={handleReplay}
              >
                <RotateCw className="size-4" />
                Replay
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
                Load / Export Code
              </Button>
            </div>
          )}

          {isTetris ? (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {TETRIS_PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    size="sm"
                    variant="outline"
                    className="border-white/15 bg-transparent text-xs text-white hover:bg-white/5"
                    onClick={() => applyTetrisPreset(preset.id)}
                    title={preset.description}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div
                className="rounded-md border border-white/10 bg-black/40 px-3 py-2"
                aria-label="Font preview"
              >
                <p className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">
                  Font preview
                </p>
                <p
                  className="truncate text-lg text-white"
                  style={{
                    fontFamily:
                      settings.fontVariant === "custom" && settings.customFontFamily
                        ? `"${String(settings.customFontFamily)}", monospace`
                        : settings.fontVariant === "geist-pixel-grid"
                          ? '"Geist Pixel Grid", "Geist Pixel", monospace'
                          : settings.fontVariant === "geist-pixel-circle"
                            ? '"Geist Pixel Circle", "Geist Pixel", monospace'
                            : settings.fontVariant === "geist-pixel-triangle"
                              ? '"Geist Pixel Triangle", "Geist Pixel", monospace'
                              : settings.fontVariant === "geist-pixel-line"
                                ? '"Geist Pixel Line", "Geist Pixel", monospace'
                                : '"Geist Pixel", "Geist Pixel Square", monospace',
                  }}
                >
                  {text || "MASER MEDIA"}
                </p>
              </div>
              <p className="font-mono text-xs text-neutral-500">
                layoutSeed: {String(settings.layoutSeed)} · motionSeed:{" "}
                {String(settings.motionSeed)} · density:{" "}
                {String(settings.textDensity)} · length:{" "}
                {String(settings.animationDuration)}s
              </p>
            </div>
          ) : null}
        </div>

        <aside className="tal-detail__panel">
          <AnimationControls
            definition={definition}
            text={text}
            settings={settings}
            onTextChange={setText}
            onSettingChange={handleSettingChange}
          />
        </aside>
      </div>

      <CodeExportDrawer
        open={exportOpen}
        onOpenChange={setExportOpen}
        definition={definition}
        text={text}
        settings={settings}
      />
    </div>
  );
}
