"use client";

import { useState } from "react";
import {
  DemoBackButton,
  DemoControlBar,
  LabButton,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { DitherGooeyCard } from "./dither-gooey-card";
import { COPY } from "./constants";

const ACCENT_SWATCHES = [
  { id: "none", label: "B&W", value: "" },
  { id: "blue", label: "Blue", value: "#7eb8ff" },
  { id: "amber", label: "Amber", value: "#e8c37a" },
  { id: "mint", label: "Mint", value: "#8ee0c8" },
] as const;

export function DitherGooeyCardDemo() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [open, setOpen] = useState(false);
  const [accentId, setAccentId] = useState<(typeof ACCENT_SWATCHES)[number]["id"]>(
    "none",
  );

  const accent = ACCENT_SWATCHES.find((s) => s.id === accentId)?.value ?? "";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#121214] text-[#f4f4f2]">
      <DemoControlBar className="left-4 right-4 top-4 justify-between sm:left-6 sm:right-6">
        <DemoBackButton />
        <div className="flex flex-wrap items-center gap-2">
          <LabButton
            variant={open ? "accent" : "ghost"}
            aria-pressed={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Open" : "Collapsed"}
          </LabButton>
          {ACCENT_SWATCHES.map((swatch) => (
            <LabButton
              key={swatch.id}
              variant={accentId === swatch.id ? "accent" : "ghost"}
              aria-pressed={accentId === swatch.id}
              onClick={() => setAccentId(swatch.id)}
            >
              {swatch.label}
            </LabButton>
          ))}
          <ReducedMotionToggle
            enabled={reducedMotion}
            onToggle={() => setReducedMotion((v) => !v)}
          />
        </div>
      </DemoControlBar>

      <main className="flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-28">
        <div className="mb-8 max-w-md text-center">
          <p className="font-mono text-xs tracking-[0.18em] text-[var(--lab-text-muted,#9a9a9a)] uppercase">
            Display
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Dither Gooey Card
          </h1>
          <p className="mt-2 text-sm text-[var(--lab-text-secondary,#c4c4c4)]">
            Pull the handle to open. Press the bottom to close. Dither pulse plus
            liquid-gooey morph.
          </p>
        </div>

        <DitherGooeyCard
          title={COPY.title}
          pullHint={COPY.pullHint}
          reducedMotion={reducedMotion}
          accentColor={accent}
          open={open}
          onOpenChange={setOpen}
        />
      </main>
    </div>
  );
}
