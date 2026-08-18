"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  DemoControlBar,
  DemoLabBrand,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";

const ChromeMarkApp = dynamic(
  () => import("./chromemark-app").then((mod) => mod.ChromeMarkApp),
  { ssr: false },
);

type ChromeMarkDemoProps = {
  minimal?: boolean;
};

export function ChromeMarkDemo({ minimal = false }: ChromeMarkDemoProps) {
  const [forceReducedMotion, setForceReducedMotion] = useState(false);

  return (
    <div
      className="maser-lab chromemark min-h-screen bg-[#0a0a0a] text-[#f3f3f3]"
      data-reduced-motion={forceReducedMotion ? "true" : undefined}
    >
      {!minimal ? (
        <DemoControlBar className="left-4 right-4 top-4 z-20 justify-between gap-2">
          <DemoLabBrand />
          <ReducedMotionToggle
            enabled={forceReducedMotion}
            onToggle={() => setForceReducedMotion((value) => !value)}
          />
        </DemoControlBar>
      ) : null}
      <ChromeMarkApp forceReducedMotion={forceReducedMotion} />
    </div>
  );
}
