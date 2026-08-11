"use client";

import { useMemo, useState } from "react";
import {
  DemoControlBar,
  DemoLabBrand,
  ReducedMotionToggle,
  ViewportModeToggle,
  DemoViewportFrame,
  type ViewportMode,
} from "@/components/lab/demo-chrome";
import { cn } from "@/lib/utils";
import { BrandCaseStudioApp } from "./brand-case-studio";
import { DESKTOP_FRAME, MOBILE_FRAME } from "./constants";

type BrandCaseStudioDemoProps = {
  minimal?: boolean;
};

export function BrandCaseStudioDemo({ minimal = false }: BrandCaseStudioDemoProps) {
  const [forceReducedMotion, setForceReducedMotion] = useState(false);
  const [viewportMode, setViewportMode] = useState<ViewportMode>("responsive");

  const frameSize = useMemo(() => {
    if (viewportMode === "mobile") return MOBILE_FRAME;
    if (viewportMode === "desktop") return DESKTOP_FRAME;
    return null;
  }, [viewportMode]);

  const app = <BrandCaseStudioApp forceReducedMotion={forceReducedMotion} />;

  return (
    <div
      className="maser-lab brand-case-studio min-h-screen bg-[var(--bcs-bg)] text-[var(--bcs-fg)]"
      data-reduced-motion={forceReducedMotion ? "true" : undefined}
    >
      {!minimal ? (
        <DemoControlBar className="left-4 right-4 top-4 justify-between gap-2">
          <DemoLabBrand />
          <div className="flex flex-wrap items-center gap-2">
            <ViewportModeToggle mode={viewportMode} onChange={setViewportMode} />
            <ReducedMotionToggle
              enabled={forceReducedMotion}
              onToggle={() => setForceReducedMotion((v) => !v)}
            />
          </div>
        </DemoControlBar>
      ) : null}

      <div
        className={cn(
          "flex min-h-screen flex-col items-center px-4 pb-16",
          minimal ? "pt-8" : "pt-[calc(var(--lab-control-bar-bottom,5.5rem)+1rem)]",
        )}
      >
        {viewportMode === "responsive" ? (
          <div className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-[var(--lab-border)] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            {app}
          </div>
        ) : frameSize ? (
          <DemoViewportFrame width={frameSize.width} height={frameSize.height}>
            {app}
          </DemoViewportFrame>
        ) : null}
      </div>
    </div>
  );
}
