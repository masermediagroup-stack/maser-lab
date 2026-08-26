"use client";

import { useCallback, useRef, useState } from "react";
import {
  DemoBackButton,
  DemoControlBar,
  LabButton,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { LiquidMetalMeatballs } from "./liquid-metal-meatballs";
import type { SequencePhase } from "./types";
import "./tokens.css";

const PHASE_COPY: Record<SequencePhase, string> = {
  idle: "Idle — scroll into the trigger zone",
  sequence: "Sequence — edge spawn, arc, merge",
  finishing: "Finishing — no new spawns, balls exit",
  still: "Still cluster — motion frozen",
};

export function LiquidMetalMeatballsDemo() {
  const triggerRef = useRef<HTMLElement | null>(null);
  const [reduced, setReduced] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [phase, setPhase] = useState<SequencePhase>("idle");

  const handleReplay = useCallback(() => {
    const node = triggerRef.current;
    if (node && !reduced) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setReplayKey((key) => key + 1);
  }, [reduced]);

  return (
    <div className="lmm-root relative min-h-screen bg-[var(--lmm-page)] text-[var(--lmm-text)]">
      <LiquidMetalMeatballs
        triggerRef={triggerRef}
        forceReducedMotion={reduced}
        replayKey={replayKey}
        onPhaseChange={setPhase}
      />

      <DemoControlBar className="left-4 right-4 top-4 justify-between sm:left-6 sm:right-6">
        <DemoBackButton />
        <div className="flex flex-wrap items-center gap-2">
          <LabButton type="button" variant="outline" onClick={handleReplay}>
            Replay
          </LabButton>
          <ReducedMotionToggle
            enabled={reduced}
            onToggle={() => setReduced((value) => !value)}
          />
        </div>
      </DemoControlBar>

      <div className="relative z-10">
        <header className="mx-auto flex min-h-[85vh] max-w-3xl flex-col justify-end px-6 pb-16 pt-28">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--lmm-albedo)]">
            Scroll · Elite Pixel Guy
          </p>
          <h1
            className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl"
            style={{ textShadow: "0 2px 18px rgba(0,0,0,0.72)" }}
          >
            Mercury, not jelly.
          </h1>
          <p
            className="mt-5 max-w-xl text-base leading-relaxed text-[var(--lmm-text-muted)] sm:text-lg"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.65)" }}
          >
            Scroll into the trigger zone. Maser-blue chrome meatballs spawn off
            random edges, arc across the page, neck and swallow, then exit a
            different edge. Weight on travel. One key light.
          </p>
        </header>

        <section
          ref={triggerRef}
          aria-label="Liquid metal meatballs trigger zone"
          className="relative mx-auto my-8 min-h-[90vh] max-w-4xl border border-dashed border-[var(--lmm-trigger-line)] px-6 py-16 sm:px-12"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--lmm-albedo)]">
            Trigger zone
          </p>
          <h2
            className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}
          >
            Chrome meatballs cross the viewport here.
          </h2>
          <p
            className="mt-6 max-w-2xl text-base leading-7 text-[var(--lmm-text-muted)]"
            style={{ textShadow: "0 1px 10px rgba(0,0,0,0.6)" }}
          >
            This block is the spawn gate — not a lava lamp. While it intersects
            the viewport, charges appear from off-screen edges and travel on
            weighted arcs. Sticky merge happens in the SDF (quadratic smin).
            Sitting still after you leave lets remaining balls finish and die.
          </p>
          <p
            className="mt-4 max-w-2xl text-base leading-7 text-[var(--lmm-text-muted)]"
            style={{ textShadow: "0 1px 10px rgba(0,0,0,0.6)" }}
          >
            Albedo <span className="text-[var(--lmm-albedo)]">#10a4ff</span>,
            creases <span className="text-[var(--lmm-albedo)]">#0065a3</span>,
            spec near-white. Copy stays above the canvas. The field does not
            capture clicks or scroll.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-24">
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}
          >
            After the crossing
          </h2>
          <p
            className="mt-4 text-base leading-7 text-[var(--lmm-text-muted)]"
            style={{ textShadow: "0 1px 10px rgba(0,0,0,0.6)" }}
          >
            Keep scrolling. New meatballs stop spawning once the trigger leaves
            view. Anything already in flight completes its exit. Reduced motion
            freezes a still cluster. A hidden tab pauses the loop.
          </p>
          <p
            className="mt-4 font-mono text-sm text-[var(--lmm-albedo)]"
            aria-live="polite"
          >
            {PHASE_COPY[phase]}
          </p>
        </section>
      </div>
    </div>
  );
}
