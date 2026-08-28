"use client";

import { useState } from "react";
import {
  DemoBackButton,
  DemoControlMenu,
  LabControlGroup,
  LabRange,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { CTA_LOGO_GRADIENT_DEFAULTS, LOOK_RANGES } from "./constants";
import { CtaLogoGradient } from "./cta-logo-gradient";
import type { CtaLogoGradientLook } from "./types";
import "./tokens.css";

export function CtaLogoGradientDemo() {
  const [reduced, setReduced] = useState(false);
  const [look, setLook] = useState<CtaLogoGradientLook>(
    CTA_LOGO_GRADIENT_DEFAULTS,
  );

  const patch = (partial: Partial<CtaLogoGradientLook>) => {
    setLook((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="clg-root maser-lab relative min-h-screen">
      <section
        className="lab-demo-field clg-stage"
        aria-label="Maser Media CTA logo gradient"
      >
        <CtaLogoGradient forceReducedMotion={reduced} look={look} />
      </section>

      <DemoControlMenu>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <DemoBackButton />
          <ReducedMotionToggle
            enabled={reduced}
            onToggle={() => setReduced((value) => !value)}
          />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight">
            CTA logo gradient
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-[var(--lab-text-secondary)]">
            Uniform tiny white grid on a four-corner Maser-blue wash.
            Seeded cells punch out and return. Glyphs stay `#ffffff`.
          </p>
        </div>
        <LabControlGroup label="Wash">
          <LabRange
            id="clg-speed"
            label="Speed"
            min={LOOK_RANGES.speed.min}
            max={LOOK_RANGES.speed.max}
            step={LOOK_RANGES.speed.step}
            value={look.speed}
            display={`${look.speed.toFixed(2)}×`}
            onChange={(speed) => patch({ speed })}
          />
          <LabRange
            id="clg-highlight"
            label="White"
            min={LOOK_RANGES.highlight.min}
            max={LOOK_RANGES.highlight.max}
            step={LOOK_RANGES.highlight.step}
            value={look.highlight}
            display={look.highlight.toFixed(2)}
            onChange={(highlight) => patch({ highlight })}
          />
          <LabRange
            id="clg-shade"
            label="Dark"
            min={LOOK_RANGES.shade.min}
            max={LOOK_RANGES.shade.max}
            step={LOOK_RANGES.shade.step}
            value={look.shade}
            display={look.shade.toFixed(2)}
            onChange={(shade) => patch({ shade })}
          />
          <LabRange
            id="clg-glow"
            label="Inner glow"
            min={LOOK_RANGES.glow.min}
            max={LOOK_RANGES.glow.max}
            step={LOOK_RANGES.glow.step}
            value={look.glow}
            display={look.glow.toFixed(2)}
            onChange={(glow) => patch({ glow })}
          />
          <LabRange
            id="clg-angle"
            label="Angle"
            min={LOOK_RANGES.angle.min}
            max={LOOK_RANGES.angle.max}
            step={LOOK_RANGES.angle.step}
            value={look.angle}
            display={`${Math.round(look.angle)}°`}
            onChange={(angle) => patch({ angle })}
          />
        </LabControlGroup>
        <p className="clg-notes font-mono text-[10px] leading-relaxed text-[var(--lab-text-muted)]">
          Tilt: MAX_TILT_X=14 MAX_TILT_Y=16 MAX_LIFT=14 LERP=0.12. Lamp off.
          Reduced motion drops tilt only — the wash always loops. Four
          corners cycle the locked palette. Seeded occupancy twinkle; grid
          does not drift. Same glyph scale. No footer wave, pond, RGB dust,
          bulge, or filament. White ground.
        </p>
      </DemoControlMenu>
    </div>
  );
}
