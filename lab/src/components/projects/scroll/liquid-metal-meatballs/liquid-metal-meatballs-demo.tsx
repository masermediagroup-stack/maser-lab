"use client";

import { useCallback, useRef, useState } from "react";
import {
  DemoBackButton,
  DemoControlMenu,
  LabButton,
  LabRange,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { LIQUID_METAL_MEATBALLS_DEFAULTS } from "./constants";
import { LiquidMetalMeatballs } from "./liquid-metal-meatballs";
import type { LiquidMetalLook, SequencePhase } from "./types";
import "./tokens.css";

const PHASE_COPY: Record<SequencePhase, string> = {
  idle: "Idle — scroll until the trigger is mostly in view",
  sequence: "Sequence — edge spawn, arc, merge",
  finishing: "Finishing — no new spawns, balls exit",
  still: "Still cluster — motion frozen",
};

type Ground = "dark" | "light";

const HUE_MIN = -48;
const HUE_MAX = 48;
const SAT_MIN = 0.4;
const SAT_MAX = 1.35;
const K_MIN = 8;
const K_MAX = 48;
const SPEED_MIN = 0.35;
const SPEED_MAX = 2;

function lookForGround(ground: Ground, prev?: LiquidMetalLook): LiquidMetalLook {
  return {
    hue: prev?.hue ?? LIQUID_METAL_MEATBALLS_DEFAULTS.hue,
    sat: prev?.sat ?? LIQUID_METAL_MEATBALLS_DEFAULTS.sat,
    mergeK: prev?.mergeK ?? LIQUID_METAL_MEATBALLS_DEFAULTS.mergeK,
    speed: prev?.speed ?? LIQUID_METAL_MEATBALLS_DEFAULTS.speed,
    wetness:
      ground === "light"
        ? LIQUID_METAL_MEATBALLS_DEFAULTS.wetnessSatin
        : LIQUID_METAL_MEATBALLS_DEFAULTS.wetnessWet,
  };
}

export function LiquidMetalMeatballsDemo() {
  const triggerRef = useRef<HTMLElement | null>(null);
  const phaseLiveRef = useRef<HTMLParagraphElement>(null);
  const [reduced, setReduced] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [ground, setGround] = useState<Ground>("dark");
  const [look, setLook] = useState<LiquidMetalLook>(() => lookForGround("dark"));
  const lookRef = useRef<LiquidMetalLook>(lookForGround("dark"));

  const patchLook = useCallback((partial: Partial<LiquidMetalLook>) => {
    setLook((prev) => {
      const next = { ...prev, ...partial };
      lookRef.current = next;
      return next;
    });
  }, []);

  const handleGround = useCallback((next: Ground) => {
    setGround(next);
    setLook((prev) => {
      const updated = lookForGround(next, prev);
      lookRef.current = updated;
      return updated;
    });
  }, []);

  const handlePhaseChange = useCallback((phase: SequencePhase) => {
    const node = phaseLiveRef.current;
    if (node) node.textContent = PHASE_COPY[phase];
  }, []);

  const handleReplay = useCallback(() => {
    const node = triggerRef.current;
    if (node && !reduced) {
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      /* Park the zone with a majority on screen and its bottom still below the fold. */
      const top = window.scrollY + rect.top - vh * 0.32;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
    setReplayKey((key) => key + 1);
  }, [reduced]);

  return (
    <div
      className="lmm-root relative min-h-screen bg-[var(--lmm-page)] text-[var(--lmm-text)]"
      data-ground={ground}
    >
      <LiquidMetalMeatballs
        triggerRef={triggerRef}
        forceReducedMotion={reduced}
        replayKey={replayKey}
        onPhaseChange={handlePhaseChange}
        lookRef={lookRef}
      />

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
              onClick={() => handleGround("light")}
            >
              Light
            </LabButton>
            <LabButton
              type="button"
              variant={ground === "dark" ? "accent" : "ghost"}
              aria-pressed={ground === "dark"}
              onClick={() => handleGround("dark")}
            >
              Dark
            </LabButton>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <LabButton type="button" variant="outline" onClick={handleReplay}>
            Replay
          </LabButton>
          <ReducedMotionToggle
            enabled={reduced}
            onToggle={() => setReduced((value) => !value)}
          />
        </div>
        <div
          className="flex flex-col gap-2 border-t border-[var(--lab-border)] pt-2"
          role="group"
          aria-label="Mercury look"
        >
          <LabRange
            id="lmm-hue"
            label="Hue"
            min={HUE_MIN}
            max={HUE_MAX}
            step={1}
            value={look.hue}
            display={`${look.hue > 0 ? "+" : ""}${Math.round(look.hue)}°`}
            onChange={(hue) => patchLook({ hue })}
          />
          <LabRange
            id="lmm-sat"
            label="Saturation"
            min={SAT_MIN}
            max={SAT_MAX}
            step={0.01}
            value={look.sat}
            display={look.sat.toFixed(2)}
            onChange={(sat) => patchLook({ sat })}
          />
          <LabRange
            id="lmm-merge-k"
            label="Merge k"
            min={K_MIN}
            max={K_MAX}
            step={1}
            value={look.mergeK}
            display={String(Math.round(look.mergeK))}
            onChange={(mergeK) => patchLook({ mergeK })}
          />
          <LabRange
            id="lmm-wetness"
            label="Wetness"
            min={0}
            max={1}
            step={0.01}
            value={look.wetness}
            display={look.wetness.toFixed(2)}
            onChange={(wetness) => patchLook({ wetness })}
          />
          <LabRange
            id="lmm-speed"
            label="Speed"
            min={SPEED_MIN}
            max={SPEED_MAX}
            step={0.01}
            value={look.speed}
            display={`${look.speed.toFixed(2)}×`}
            onChange={(speed) => patchLook({ speed })}
          />
        </div>
      </DemoControlMenu>

      <div className="lmm-page relative z-10">
        <header className="lmm-header mx-auto flex min-h-[85vh] max-w-3xl flex-col justify-start px-6 pb-16">
          <div className="lmm-chrome-stack" aria-hidden />
          <div className="lmm-copy">
            <p className="lmm-ink font-mono text-xs uppercase tracking-[0.22em] text-[var(--lmm-albedo)]">
              Scroll · Elite Pixel Guy
            </p>
            <h1 className="lmm-ink mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
              Mercury, not jelly.
            </h1>
            <p className="lmm-ink mt-5 max-w-xl text-base leading-relaxed text-[var(--lmm-text-muted)] sm:text-lg">
              Scroll until most of the trigger zone is on screen. Maser-blue
              chrome meatballs spawn off random edges, arc across the page, neck
              and swallow, then exit a different edge. Weight on travel. Shared
              mercury wash — color after merge.
            </p>
          </div>
        </header>

        <section
          ref={triggerRef}
          aria-label="Liquid metal meatballs trigger zone"
          className="relative mx-auto my-8 min-h-[90vh] max-w-4xl border border-dashed border-[var(--lmm-trigger-line)] px-6 py-16 sm:px-12"
        >
          <div className="lmm-copy">
            <p className="lmm-ink font-mono text-xs uppercase tracking-[0.2em] text-[var(--lmm-albedo)]">
              Trigger zone
            </p>
            <h2 className="lmm-ink mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Chrome meatballs cross the viewport here.
            </h2>
            <p className="lmm-ink mt-6 max-w-2xl text-base leading-7 text-[var(--lmm-text-muted)]">
              This block is the spawn gate — not a lava lamp. Spawning starts
              only when a majority of the zone is in view, and stops at the
              section bottom. Sticky merge happens in the SDF (quadratic smin).
              Sitting still after you leave lets remaining balls finish and die.
            </p>
            <p className="lmm-ink mt-4 max-w-2xl text-base leading-7 text-[var(--lmm-text-muted)]">
              Albedo <span className="text-[var(--lmm-albedo)]">#10a4ff</span>,
              creases <span className="text-[var(--lmm-albedo)]">#0065a3</span>,
              spec near-white. Type sits on the field. The canvas does not
              capture clicks or scroll.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-24">
          <div className="lmm-copy">
            <h2 className="lmm-ink text-2xl font-semibold tracking-tight">
              After the crossing
            </h2>
            <p className="lmm-ink mt-4 text-base leading-7 text-[var(--lmm-text-muted)]">
              Keep scrolling. New meatballs stop spawning once the trigger
              majority leaves view or the section bottom is past. Anything already
              in flight completes its exit. Reduced motion freezes a still
              cluster; turning it off restarts the loop. A hidden tab pauses the
              loop.
            </p>
            <p
              ref={phaseLiveRef}
              className="mt-4 font-mono text-sm text-[var(--lmm-albedo)]"
              aria-live="polite"
            >
              {PHASE_COPY.idle}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
