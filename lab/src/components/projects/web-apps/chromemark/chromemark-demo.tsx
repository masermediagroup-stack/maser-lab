"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
    };
  }, []);

  return (
    <div
      className="maser-lab chromemark h-dvh max-h-dvh overflow-hidden bg-[#0a0a0a] text-[#f3f3f3]"
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
