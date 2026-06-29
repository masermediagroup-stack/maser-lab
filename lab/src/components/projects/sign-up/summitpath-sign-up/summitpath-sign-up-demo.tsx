"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  DemoBackButton,
  DemoControlBar,
  DemoViewportFrame,
  LabButton,
  ReducedMotionToggle,
  ViewportModeToggle,
} from "@/components/lab/demo-chrome";
import type { ViewportMode } from "@/components/projects/sign-up/summitpath-sign-up/summitpath-sign-up-section";
import { DESKTOP_FRAME, MOBILE_FRAME } from "./constants";
import { SummitPathSignUpSection } from "./summitpath-sign-up-section";
import "./tokens.css";

type SummitPathSignUpDemoProps = {
  minimal?: boolean;
};

export function SummitPathSignUpDemo({ minimal = false }: SummitPathSignUpDemoProps) {
  const [forceReducedMotion, setForceReducedMotion] = useState(false);
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");
  const [disabled, setDisabled] = useState(false);

  const frameSize = useMemo(() => {
    if (viewportMode === "mobile") return MOBILE_FRAME;
    if (viewportMode === "desktop") return DESKTOP_FRAME;
    return null;
  }, [viewportMode]);

  return (
    <div className="maser-lab min-h-screen" data-reduced-motion={forceReducedMotion ? "true" : undefined}>
      {!minimal ? (
        <DemoControlBar className="left-4 right-4 top-4 justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <DemoBackButton />
            <Image
              src="/brand/masermedia-logo-bold-blue.png"
              alt="MaserMedia"
              width={120}
              height={28}
              className="hidden h-7 w-auto sm:block"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ViewportModeToggle mode={viewportMode} onChange={setViewportMode} />
            <LabButton
              type="button"
              variant={disabled ? "accent" : "ghost"}
              onClick={() => setDisabled((v) => !v)}
            >
              Disabled: {disabled ? "on" : "off"}
            </LabButton>
            <ReducedMotionToggle
              enabled={forceReducedMotion}
              onToggle={() => setForceReducedMotion((v) => !v)}
            />
          </div>
        </DemoControlBar>
      ) : null}

      <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-10 pt-24">
        {viewportMode === "responsive" ? (
          <div className="w-full max-w-full">
            <SummitPathSignUpSection
              forceReducedMotion={forceReducedMotion}
              viewportMode="responsive"
              formDisabled={disabled}
            />
          </div>
        ) : frameSize ? (
          <DemoViewportFrame width={frameSize.width} height={frameSize.height}>
            <SummitPathSignUpSection
              forceReducedMotion={forceReducedMotion}
              viewportMode={viewportMode}
              formDisabled={disabled}
            />
          </DemoViewportFrame>
        ) : null}
      </div>
    </div>
  );
}
