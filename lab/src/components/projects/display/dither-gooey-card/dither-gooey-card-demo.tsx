"use client";

import { useState } from "react";
import {
  DemoBackButton,
  DemoControlBar,
  LabButton,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { DitherGooeyCard } from "./dither-gooey-card";
import { COPY, DEFAULT_BACKGROUND, DEFAULT_TEXT } from "./constants";

const COLOR_PRESETS = [
  { id: "grey", label: "Grey", background: DEFAULT_BACKGROUND, text: DEFAULT_TEXT },
  { id: "ink", label: "Ink", background: "#1c1c1f", text: "#f4f4f2" },
  { id: "cream", label: "Cream", background: "#e8e4d8", text: "#2a2a28" },
  { id: "navy", label: "Navy", background: "#1e3a5f", text: "#f4f7fb" },
] as const;

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-[var(--lab-radius-sm)] border border-[var(--lab-border)] bg-[var(--lab-surface)] px-2 py-1.5 font-mono text-xs text-[var(--lab-text-secondary)]">
      <span>{label}</span>
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
      />
    </label>
  );
}

export function DitherGooeyCardDemo() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [open, setOpen] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND);
  const [textColor, setTextColor] = useState(DEFAULT_TEXT);

  const activePreset = COLOR_PRESETS.find(
    (preset) =>
      preset.background === backgroundColor && preset.text === textColor,
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#121214] text-[#f4f4f2]">
      <DemoControlBar className="left-4 right-4 top-4 justify-between sm:left-6 sm:right-6">
        <DemoBackButton />
        <div className="flex flex-wrap items-center gap-2">
          <LabButton
            variant={open ? "accent" : "ghost"}
            aria-pressed={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Open" : "Collapsed"}
          </LabButton>
          {COLOR_PRESETS.map((preset) => (
            <LabButton
              key={preset.id}
              variant={activePreset?.id === preset.id ? "accent" : "ghost"}
              aria-pressed={activePreset?.id === preset.id}
              onClick={() => {
                setBackgroundColor(preset.background);
                setTextColor(preset.text);
              }}
            >
              {preset.label}
            </LabButton>
          ))}
          <ColorField
            label="Background"
            value={backgroundColor}
            onChange={setBackgroundColor}
          />
          <ColorField label="Text" value={textColor} onChange={setTextColor} />
          <ReducedMotionToggle
            enabled={reducedMotion}
            onToggle={() => setReducedMotion((value) => !value)}
          />
        </div>
      </DemoControlBar>

      <main className="flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-28">
        <div className="mb-8 max-w-md text-center">
          <p className="font-mono text-xs tracking-[0.18em] text-[var(--lab-text-muted,#9a9a9a)] uppercase">
            Display
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Gooey Card
          </h1>
          <p className="mt-2 text-sm text-[var(--lab-text-secondary,#c4c4c4)]">
            Grab the arrow to pull open. Press the bottom to close. Tune fill
            and ink from the bar.
          </p>
        </div>

        <DitherGooeyCard
          title={COPY.title}
          reducedMotion={reducedMotion}
          backgroundColor={backgroundColor}
          textColor={textColor}
          open={open}
          onOpenChange={setOpen}
        />
      </main>
    </div>
  );
}
