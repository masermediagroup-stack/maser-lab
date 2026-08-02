"use client";

import Image from "next/image";
import { useCallback, useId, useState } from "react";
import {
  DemoControlBar,
  DemoLabBrand,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { type NavItemId } from "./constants";
import { LiquidGlassTopNav } from "./liquid-glass-top-nav";
import "./tokens.css";

const BACKGROUND_SRC = "/images/prism-nav-landscape-bg.png";

type PrismNavDemoProps = {
  minimal?: boolean;
};

export function PrismNavDemo({ minimal = false }: PrismNavDemoProps) {
  const panelId = useId();
  const [activeId, setActiveId] = useState<NavItemId | null>(null);
  const [forceReducedMotion, setForceReducedMotion] = useState(false);

  const handleNavigate = useCallback((id: NavItemId) => {
    setActiveId(id);
  }, []);

  return (
    <div
      className="maser-lab prism-nav relative min-h-screen overflow-hidden"
      data-reduced-motion={forceReducedMotion ? "true" : undefined}
    >
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <Image
          src={BACKGROUND_SRC}
          alt=""
          fill
          priority
          className="scale-110 object-cover object-center blur-[48px]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {!minimal ? (
        <DemoControlBar className="left-4 right-4 top-4 justify-between gap-2">
          <DemoLabBrand />
          <ReducedMotionToggle
            enabled={forceReducedMotion}
            onToggle={() => setForceReducedMotion((v) => !v)}
          />
        </DemoControlBar>
      ) : null}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <LiquidGlassTopNav
          activeId={activeId}
          onNavigate={handleNavigate}
          forceReducedMotion={forceReducedMotion || undefined}
          idPrefix={panelId}
          placement="center"
        />
      </div>

      {!minimal && activeId ? (
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
