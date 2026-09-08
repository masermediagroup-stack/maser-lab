"use client";

import { useEffect, useState } from "react";
import {
  DOTS_PER_CONNECTOR,
  GROOT_SPUR_LABEL,
  GROOT_SPUR_LINE,
  LOOP_STEPS,
} from "./constants";
import { GrokBotMark } from "./grok-bot-mark";
import { StepIcon } from "./step-icon";
import type { MeetupLoopVizProps } from "./types";
import "./tokens.css";

function useOsReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

function FlowDots() {
  return (
    <div className="meetup-loop-viz__dots" aria-hidden="true">
      {Array.from({ length: DOTS_PER_CONNECTOR }, (_, dot) => (
        <span key={dot} className="meetup-loop-viz__dot" />
      ))}
    </div>
  );
}

function GapDots({
  slot,
}: {
  slot: "c1" | "c2" | "c3" | "c4" | "row";
}) {
  return (
    <div
      className="meetup-loop-viz__gap"
      data-gap={slot}
      aria-hidden="true"
    >
      <FlowDots />
    </div>
  );
}

export function MeetupLoopViz({
  focusedStep = "all",
  showGrootSpur = false,
  forceReducedMotion = false,
}: MeetupLoopVizProps) {
  const osReduced = useOsReducedMotion();
  const reduced = forceReducedMotion || osReduced;

  return (
    <section
      className="meetup-loop-viz"
      aria-label="GrokBot Loop Demo Visual"
      data-reduced-motion={reduced ? "true" : undefined}
    >
      <div className="meetup-loop-viz__stage">
        <GrokBotMark reduced={reduced} />
        <div className="meetup-loop-viz__board">
          <ol className="meetup-loop-viz__spine">
            {LOOP_STEPS.map((step) => {
              const dimmed = focusedStep !== "all" && focusedStep !== step.id;
              const showSpurHere = showGrootSpur && step.id === "shape";

              return (
                <li
                  key={step.id}
                  className="meetup-loop-viz__block"
                  data-step={step.id}
                >
                  <div
                    className="meetup-loop-viz__step"
                    data-dimmed={dimmed ? "true" : undefined}
                  >
                    <div className="meetup-loop-viz__heading">
                      <StepIcon step={step.id} />
                      <h2 className="meetup-loop-viz__title">{step.title}</h2>
                    </div>
                    <p className="meetup-loop-viz__line">{step.line}</p>
                    {showSpurHere ? (
                      <p className="meetup-loop-viz__spur">
                        <span className="meetup-loop-viz__spur-label">
                          {GROOT_SPUR_LABEL}
                        </span>
                        {` — ${GROOT_SPUR_LINE}`}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
          <GapDots slot="c1" />
          <GapDots slot="c2" />
          <GapDots slot="c3" />
          <GapDots slot="c4" />
          <GapDots slot="row" />
        </div>
      </div>
    </section>
  );
}
