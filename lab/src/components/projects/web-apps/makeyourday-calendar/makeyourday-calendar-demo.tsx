"use client";

import { useState } from "react";
import {
  DemoControlBar,
  DemoLabBrand,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { MakeYourDayCalendarApp } from "./makeyourday-calendar";
import "./tokens.css";

type MakeYourDayCalendarDemoProps = {
  minimal?: boolean;
};

export function MakeYourDayCalendarDemo({
  minimal = false,
}: MakeYourDayCalendarDemoProps) {
  const [forceReducedMotion, setForceReducedMotion] = useState(false);

  return (
    <div
      className="maser-lab makeyourday-calendar min-h-screen bg-[var(--myd-bg)] text-[var(--myd-text)]"
      data-reduced-motion={forceReducedMotion ? "true" : undefined}
    >
      {!minimal ? (
        <DemoControlBar className="left-4 right-4 top-4 justify-between gap-2">
          <DemoLabBrand />
          <ReducedMotionToggle
            enabled={forceReducedMotion}
            onToggle={() => setForceReducedMotion((value) => !value)}
          />
        </DemoControlBar>
      ) : null}

      <MakeYourDayCalendarApp forceReducedMotion={forceReducedMotion} />
    </div>
  );
}
