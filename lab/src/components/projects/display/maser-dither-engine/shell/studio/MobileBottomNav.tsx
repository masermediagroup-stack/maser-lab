"use client";

import { cn } from "@/lib/utils";

export type MobileTabId =
  | "preview"
  | "materials"
  | "animation"
  | "lighting"
  | "interaction"
  | "components"
  | "projects"
  | "settings";

const TABS: { id: MobileTabId; label: string }[] = [
  { id: "preview", label: "Preview" },
  { id: "materials", label: "Materials" },
  { id: "animation", label: "Anim" },
  { id: "lighting", label: "Light" },
  { id: "interaction", label: "Touch" },
  { id: "components", label: "Comps" },
  { id: "projects", label: "Projects" },
  { id: "settings", label: "More" },
];

type MobileBottomNavProps = {
  active: MobileTabId;
  onChange: (id: MobileTabId) => void;
};

export function MobileBottomNav({ active, onChange }: MobileBottomNavProps) {
  return (
    <nav className="mde-mobile-nav" aria-label="Mobile workspace">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={cn(
            "mde-mobile-nav__item",
            active === tab.id && "mde-mobile-nav__item--active",
          )}
          aria-current={active === tab.id ? "page" : undefined}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
