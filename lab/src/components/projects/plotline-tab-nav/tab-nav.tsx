"use client";

import { useState } from "react";
import type { NavItemId } from "./constants";
import { DesktopTabNav } from "./desktop-tab-nav";
import { MobileTabNav } from "./mobile-tab-nav";
import "./tokens.css";

export type PlotlineTabNavProps = {
  activeId: NavItemId;
  onNavigate: (id: NavItemId) => void;
  forceReducedMotion?: boolean;
};

export function PlotlineTabNav({
  activeId,
  onNavigate,
  forceReducedMotion,
}: PlotlineTabNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className="plotline-nav"
      data-reduced-motion={forceReducedMotion ? "true" : undefined}
    >
      <MobileTabNav
        activeId={activeId}
        onNavigate={onNavigate}
        isOpen={mobileOpen}
        onOpenChange={setMobileOpen}
        forceReducedMotion={forceReducedMotion}
      />
      <DesktopTabNav
        activeId={activeId}
        onNavigate={onNavigate}
        forceReducedMotion={forceReducedMotion}
      />
    </div>
  );
}
