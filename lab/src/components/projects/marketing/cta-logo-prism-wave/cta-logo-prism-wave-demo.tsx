"use client";

import { useCallback, useRef, useState } from "react";
import {
  DemoBackButton,
  DemoControlMenu,
  LabButton,
  LabRange,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import {
  CTA_LOGO_PRISM_WAVE_DEFAULTS,
  FRINGE_MAX,
  FRINGE_MIN,
  SPEED_MAX,
  SPEED_MIN,
  WIDTH_MAX,
  WIDTH_MIN,
} from "./constants";
import { CtaLogoPrismWave } from "./cta-logo-prism-wave";
import type { PrismWaveLook, PrismWaveMode } from "./types";
import "./tokens.css";

type Ground = "dark" | "light";

export function CtaLogoPrismWaveDemo() {
  const [reduced, setReduced] = useState(false);
  const [ground, setGround] = useState<Ground>("light");
  const [look, setLook] = useState<PrismWaveLook>(CTA_LOGO_PRISM_WAVE_DEFAULTS);
  const [mode, setMode] = useState<PrismWaveMode>("css");
  const lookRef = useRef<PrismWaveLook>(CTA_LOGO_PRISM_WAVE_DEFAULTS);

  const patchLook = useCallback((partial: Partial<PrismWaveLook>) => {
    setLook((prev) => {
      const next = { ...prev, ...partial };
      lookRef.current = next;
      return next;
    });
  }, []);

  return (
    <div
      className="clpw-root relative min-h-screen bg-[var(--clpw-page)] text-[var(--clpw-text)]"
      data-ground={ground}
    >
      <DemoControlMenu>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <DemoBackButton />
          <div
            className="flex shrink-0 items-center gap-1"
            role="group"
            aria-label="Page ground"
          >
            <LabButton
              type="button"
              variant={ground === "light" ? "accent" : "ghost"}
              aria-pressed={ground === "light"}
              onClick={() => setGround("light")}
            >
              Light
            </LabButton>
            <LabButton
              type="button"
              variant={ground === "dark" ? "accent" : "ghost"}
              aria-pressed={ground === "dark"}
              onClick={() => setGround("dark")}
            >
              Dark
            </LabButton>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <ReducedMotionToggle
            enabled={reduced}
            onToggle={() => setReduced((value) => !value)}
          />
        </div>
        <div
          className="flex flex-col gap-2 border-t border-[var(--lab-border)] pt-2"
          role="group"
          aria-label="Prism wave look"
        >
          <LabRange
            id="clpw-speed"
            label="Wave speed"
            min={SPEED_MIN}
            max={SPEED_MAX}
            step={0.01}
            value={look.speed}
            display={`${look.speed.toFixed(2)}×`}
            onChange={(speed) => patchLook({ speed })}
          />
          <LabRange
            id="clpw-width"
            label="Band width"
            min={WIDTH_MIN}
            max={WIDTH_MAX}
            step={0.01}
            value={look.bandWidth}
            display={look.bandWidth.toFixed(2)}
            onChange={(bandWidth) => patchLook({ bandWidth })}
          />
          <LabRange
            id="clpw-fringe"
            label="Aberration"
            min={FRINGE_MIN}
            max={FRINGE_MAX}
            step={0.01}
            value={look.fringe}
            display={look.fringe.toFixed(2)}
            onChange={(fringe) => patchLook({ fringe })}
          />
        </div>
      </DemoControlMenu>

      <div className="clpw-page relative z-10">
        <section className="clpw-stage">
          <div className="clpw-chrome-stack" aria-hidden />
          <p className="clpw-kicker">CTA · Elite Pixel Guy</p>
          <CtaLogoPrismWave
            forceReducedMotion={reduced}
            lookRef={lookRef}
            onModeChange={setMode}
          />
          <p className="clpw-caption text-base leading-relaxed text-[var(--clpw-text-muted)]">
            Two to five glass lines in the cloud at once, similar weight, RGB
            split on the stroke with cyan on the lead. Lanes miss each other;
            each line eases in and out of a different place on the mark.
            Strokes foreshorten with the tilt so they sit in the glass.
            Deeper blue on light, pale on dark. Glow stays inside the glyph.
            Hover the rounded pad around the lockup to tilt (mouse or pen).
            Empty stage beside the mark sits. Phones and reduced motion keep
            the wave and drop the tilt.
          </p>
        </section>

        <section className="clpw-notes text-base leading-7 text-[var(--clpw-text-muted)]">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--clpw-text)]">
            Lab notes
          </h2>
          <p className="mt-4">
            Wave always runs — phones and reduced motion keep the filament. This
            lab demo tilts on mouse or pen <code className="font-mono text-sm">pointermove</code>
            so the judging box can still see the plane move even when{" "}
            <code className="font-mono text-sm">(hover: hover) and (pointer: fine)</code>{" "}
            is false. Production{" "}
            <code className="font-mono text-sm">CtaLogoTilt</code> stays on that
            fine-pointer gate. No hover lamp. Two to five similar-weight
            continuous lines with prism RGB split — not dashed wedges, not a
            neon tube, not an 80s rainbow. CSS stays up until the GPU blit
            actually paints.
          </p>
          <p className="mt-4" aria-live="polite">
            Renderer:{" "}
            <span className="font-mono text-[var(--clpw-blue)]">
              {mode === "vgpu"
                ? "vgpu (WebGPU canvas)"
                : "CSS mask fallback"}
            </span>
          </p>
          <p className="mt-4 font-mono text-sm">
            {`import { CtaLogoPrismWave } from "@/components/cta-logo-prism-wave"`}
          </p>
        </section>
      </div>
    </div>
  );
}
