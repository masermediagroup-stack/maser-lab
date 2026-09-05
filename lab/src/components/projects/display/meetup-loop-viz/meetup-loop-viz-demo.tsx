"use client";

import { useState } from "react";
import {
  DemoBackButton,
  DemoControlMenu,
  LabSelect,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { LOOP_STEPS } from "./constants";
import { MeetupLoopViz } from "./meetup-loop-viz";
import type { LoopFocus } from "./types";
import { LOOP_STEP_IDS } from "./types";

const FOCUS_OPTIONS: { value: LoopFocus; label: string }[] = [
  { value: "all", label: "All steps" },
  ...LOOP_STEPS.map((step) => ({
    value: step.id,
    label: step.title,
  })),
];

export function MeetupLoopVizDemo() {
  const [forceReducedMotion, setForceReducedMotion] = useState(false);
  const [focusedStep, setFocusedStep] = useState<LoopFocus>("all");
  const [showGrootSpur, setShowGrootSpur] = useState(false);

  return (
    <div className="relative min-h-screen max-sm:has-[.lab-dock-open]:overflow-visible">
      <DemoControlMenu>
        <DemoBackButton />
        <p className="font-mono text-xs text-[var(--lab-text-secondary)]">
          Meetup loop visualization
        </p>
        <LabSelect
          id="meetup-loop-step-focus"
          label="Step focus"
          value={focusedStep}
          options={FOCUS_OPTIONS}
          onChange={(value) => {
            if (value === "all" || LOOP_STEP_IDS.includes(value as typeof LOOP_STEP_IDS[number])) {
              setFocusedStep(value as LoopFocus);
            }
          }}
        />
        <label className="lab-type-label flex min-h-11 items-center gap-2 text-[var(--lab-text-primary)]">
          <input
            type="checkbox"
            checked={showGrootSpur}
            onChange={() => setShowGrootSpur((v) => !v)}
          />
          Groot spur
        </label>
        <ReducedMotionToggle
          enabled={forceReducedMotion}
          onToggle={() => setForceReducedMotion((v) => !v)}
        />
      </DemoControlMenu>

      <div className="lab-demo-field">
        <MeetupLoopViz
          focusedStep={focusedStep}
          showGrootSpur={showGrootSpur}
          forceReducedMotion={forceReducedMotion}
        />
      </div>
    </div>
  );
}
