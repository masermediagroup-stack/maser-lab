"use client";

import { useId, useState } from "react";
import { DesktopGlassTopNav } from "./desktop-glass-top-nav";
import { MobileGlassTopNav } from "./mobile-glass-top-nav";
import { NAV_ITEM_IDS, type NavItemId, type PrismNavPlacement } from "./constants";
import "./tokens.css";

export type { PrismNavPlacement };

type LiquidGlassTopNavProps = {
  activeId: NavItemId | null;
  onNavigate: (id: NavItemId) => void;
  forceReducedMotion?: boolean;
  className?: string;
  idPrefix?: string;
  placement?: PrismNavPlacement;
};

export function LiquidGlassTopNav({
  activeId,
  onNavigate,
  forceReducedMotion,
  className,
  idPrefix: idPrefixProp,
  placement = "fixed-top",
}: LiquidGlassTopNavProps) {
  const generatedId = useId();
  const idPrefix = idPrefixProp ?? generatedId;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className="prism-nav-shell mx-auto w-full max-w-[var(--prism-nav-max-width)]"
      data-reduced-motion={forceReducedMotion ? "true" : undefined}
    >
      <MobileGlassTopNav
        activeId={activeId}
        onNavigate={onNavigate}
        isOpen={mobileOpen}
        onOpenChange={setMobileOpen}
        forceReducedMotion={forceReducedMotion}
        className={className}
        idPrefix={idPrefix}
        placement={placement}
      />
      <DesktopGlassTopNav
        activeId={activeId}
        onNavigate={onNavigate}
        forceReducedMotion={forceReducedMotion}
        className={className}
        idPrefix={idPrefix}
        placement={placement}
      />
    </div>
  );
}

export { NAV_ITEM_IDS, type NavItemId };
