"use client";

import { useEffect, useState } from "react";
import {
  DOTS_PER_CONNECTOR,
  GROOT_SPUR_LABEL,
  GROOT_SPUR_LINE,
  LOOP_STEPS,
} from "./constants";
import { GrokBotMark } from "./grok-bot-mark";
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
      aria-label="Meetup loop visualization"
      data-reduced-motion={reduced ? "true" : undefined}
    >
      <div className="meetup-loop-viz__stage">
        <GrokBotMark reduced={reduced} />
        <ol className="meetup-loop-viz__spine">
          {LOOP_STEPS.map((step, index) => {
            const dimmed = focusedStep !== "all" && focusedStep !== step.id;
            const isLast = index === LOOP_STEPS.length - 1;
            const showSpurHere = showGrootSpur && step.id === "shape";

            return (
              <li key={step.id} className="meetup-loop-viz__block">
                <div
                  className="meetup-loop-viz__step"
                  data-dimmed={dimmed ? "true" : undefined}
                >
                  <h2 className="meetup-loop-viz__title">{step.title}</h2>
                  <p className="meetup-loop-viz__line">{step.line}</p>
                </div>
                {isLast ? null : (
                  <div className="meetup-loop-viz__connector">
                    <div className="meetup-loop-viz__dots" aria-hidden="true">
                      {Array.from({ length: DOTS_PER_CONNECTOR }, (_, dot) => (
                        <span key={dot} className="meetup-loop-viz__dot" />
                      ))}
                    </div>
                    {showSpurHere ? (
                      <p className="meetup-loop-viz__spur">
                        <span className="meetup-loop-viz__spur-label">
                          {GROOT_SPUR_LABEL}
                        </span>
                        {` — ${GROOT_SPUR_LINE}`}
                      </p>
                    ) : null}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
