"use client";

import { useState } from "react";
import type { NavItemId } from "./constants";
import { DesktopTabNav } from "./desktop-tab-nav";
import { MobileTabNav } from "./mobile-tab-nav";
import "./tokens.css";

export type PlotlineTabNavPlacement = "fixed-top" | "inline" | "center";

export type PlotlineTabNavProps = {
  activeId: NavItemId;
  onNavigate: (id: NavItemId) => void;
  /** When true, Start free CTA uses inverted (white) selected styling. */
  startFreeActive?: boolean;
  onStartFree?: () => void;
  forceReducedMotion?: boolean;
  idPrefix?: string;
  placement?: PlotlineTabNavPlacement;
};

export function PlotlineTabNav({
  activeId,
  onNavigate,
  startFreeActive = false,
  onStartFree,
  forceReducedMotion,
  idPrefix,
  placement = "fixed-top",
}: PlotlineTabNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className="plotline-nav w-full"
      data-reduced-motion={forceReducedMotion ? "true" : undefined}
    >
      <MobileTabNav
        activeId={activeId}
        onNavigate={onNavigate}
        startFreeActive={startFreeActive}
        onStartFree={onStartFree}
        isOpen={mobileOpen}
        onOpenChange={setMobileOpen}
        forceReducedMotion={forceReducedMotion}
        idPrefix={idPrefix}
        placement={placement}
      />
      <DesktopTabNav
        activeId={activeId}
        onNavigate={onNavigate}
        startFreeActive={startFreeActive}
        onStartFree={onStartFree}
        forceReducedMotion={forceReducedMotion}
        idPrefix={idPrefix}
        placement={placement}
      />
    </div>
  );
}
