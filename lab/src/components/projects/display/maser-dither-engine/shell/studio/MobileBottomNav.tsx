"use client";

import { cn } from "@/lib/utils";

/** ≤5 destinations — see docs/roadmap/05-MOBILE-WORKSPACE.md */
export type MobileTabId =
  | "preview"
  | "look"
  | "light"
  | "content"
  | "more";

const TABS: { id: MobileTabId; label: string }[] = [
  { id: "preview", label: "Preview" },
  { id: "look", label: "Look" },
  { id: "light", label: "Light" },
  { id: "content", label: "Content" },
  { id: "more", label: "More" },
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
