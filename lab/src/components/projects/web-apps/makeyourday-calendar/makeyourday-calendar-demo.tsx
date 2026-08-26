"use client";

import { useState } from "react";
import {
  DemoControlMenu,
  DemoLabBrand,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { MakeYourDayCalendarApp } from "./makeyourday-calendar";

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
        <DemoControlMenu>
          <DemoLabBrand />
          <ReducedMotionToggle
            enabled={forceReducedMotion}
            onToggle={() => setForceReducedMotion((value) => !value)}
          />
        </DemoControlMenu>
      ) : null}

      <MakeYourDayCalendarApp forceReducedMotion={forceReducedMotion} />
    </div>
  );
}
