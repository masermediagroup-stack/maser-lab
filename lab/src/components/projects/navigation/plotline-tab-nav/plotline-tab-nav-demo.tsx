"use client";

import { useCallback, useId, useState } from "react";
import {
  DemoBackButton,
  DemoControlBar,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { type NavItemId } from "./constants";
import { PlotlineTabNav } from "./tab-nav";
import "./tokens.css";

type PlotlineTabNavDemoProps = {
  minimal?: boolean;
};

export function PlotlineTabNavDemo({ minimal = false }: PlotlineTabNavDemoProps) {
  const panelId = useId();
  const [activeId, setActiveId] = useState<NavItemId>("features");
  const [startFreeActive, setStartFreeActive] = useState(false);
  const [forceReducedMotion, setForceReducedMotion] = useState(false);

  const handleNavigate = useCallback((id: NavItemId) => {
    setActiveId(id);
    setStartFreeActive(false);
  }, []);

  const handleStartFree = useCallback(() => {
    setStartFreeActive(true);
  }, []);

  return (
    <div
      className="plotline-nav relative min-h-screen overflow-hidden bg-[#0a0610] text-[var(--pl-text)]"
      data-reduced-motion={forceReducedMotion ? "true" : undefined}
    >
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 50% 20%, rgba(155, 27, 92, 0.4), transparent 60%), radial-gradient(ellipse 70% 45% at 80% 80%, rgba(155, 27, 92, 0.15), transparent 55%), radial-gradient(ellipse 50% 35% at 10% 70%, rgba(245, 184, 212, 0.08), transparent 50%)",
          }}
        />
        <div className="absolute inset-0 bg-[#0a0610]/40" />
      </div>

      {!minimal ? (
        <DemoControlBar className="left-6 right-6 top-6 justify-between">
          <DemoBackButton />
          <ReducedMotionToggle
            enabled={forceReducedMotion}
            onToggle={() => setForceReducedMotion((v) => !v)}
          />
        </DemoControlBar>
      ) : null}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <PlotlineTabNav
          activeId={activeId}
          onNavigate={handleNavigate}
          startFreeActive={startFreeActive}
          onStartFree={handleStartFree}
          forceReducedMotion={forceReducedMotion}
          idPrefix={panelId}
          placement="center"
        />
      </div>

      {!minimal ? (
        <p
          id={`${panelId}-panel-${activeId}`}
          role="tabpanel"
          aria-labelledby={`${panelId}-tab-${activeId}`}
          className="sr-only"
        >
          {activeId} selected
        </p>
      ) : null}
    </div>
  );
}
