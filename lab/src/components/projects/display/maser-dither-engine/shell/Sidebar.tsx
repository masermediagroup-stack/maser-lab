"use client";

import { useMemo, useState } from "react";
import { ComponentCatalog } from "../components/registry";
import type { AppRoute, ComponentId } from "../types";
import { cn } from "@/lib/utils";

type SidebarProps = {
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
  favorites: ComponentId[];
  recent: ComponentId[];
  onToggleFavorite: (id: ComponentId) => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
};

const NAV_PRIMARY: { route: AppRoute; label: string; shortcut: string }[] = [
  { route: { view: "overview" }, label: "Overview", shortcut: "1" },
  { route: { view: "components" }, label: "Components", shortcut: "2" },
  { route: { view: "materials" }, label: "Materials", shortcut: "3" },
  { route: { view: "presets" }, label: "Presets", shortcut: "4" },
  { route: { view: "playground" }, label: "Playground", shortcut: "5" },
  { route: { view: "docs" }, label: "Documentation", shortcut: "6" },
];

function isActive(route: AppRoute, target: AppRoute): boolean {
  if (route.view === "component" && target.view === "components") return true;
  if (route.view !== target.view) return false;
  if (route.view === "docs" && target.view === "docs") return true;
  return route.view === target.view;
}

export function Sidebar({
  route,
  onNavigate,
  favorites,
  recent,
  onToggleFavorite,
  reducedMotion,
  onToggleReducedMotion,
}: SidebarProps) {
  const [query, setQuery] = useState("");
  const components = ComponentCatalog.list();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return components;
    return components.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.includes(q),
    );
  }, [components, query]);

  return (
    <aside className="mde-sidebar" aria-label="Dither Engine navigation">
      <div className="mde-sidebar__brand">
        <span className="mde-sidebar__mark" aria-hidden />
        <div>
          <p className="mde-sidebar__title">Dither Engine</p>
          <p className="mde-sidebar__sub">Maser Lab module</p>
        </div>
      </div>

      <label className="mde-sidebar__search">
        <span className="sr-only">Search components</span>
        <input
          type="search"
          placeholder="Search… ⌘K"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      <nav className="mde-sidebar__section" aria-label="Primary">
        {NAV_PRIMARY.map((item) => (
          <button
            key={item.label}
            type="button"
            className={cn(
              "mde-sidebar__link",
              isActive(route, item.route) && "mde-sidebar__link--active",
            )}
            onClick={() => onNavigate(item.route)}
          >
            <span>{item.label}</span>
            <kbd>{item.shortcut}</kbd>
          </button>
        ))}
      </nav>

      {favorites.length > 0 ? (
        <div className="mde-sidebar__section">
          <p className="mde-sidebar__heading">Favorites</p>
          {favorites.map((id) => {
            const c = ComponentCatalog.get(id);
            if (!c) return null;
            return (
              <button
                key={id}
                type="button"
                className={cn(
                  "mde-sidebar__link",
                  route.view === "component" &&
                    route.id === id &&
                    "mde-sidebar__link--active",
                )}
                onClick={() => onNavigate({ view: "component", id })}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {recent.length > 0 ? (
        <div className="mde-sidebar__section">
          <p className="mde-sidebar__heading">Recent</p>
          {recent.map((id) => {
            const c = ComponentCatalog.get(id);
            if (!c) return null;
            return (
              <button
                key={id}
                type="button"
                className="mde-sidebar__link"
                onClick={() => onNavigate({ view: "component", id })}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mde-sidebar__section mde-sidebar__section--grow">
        <p className="mde-sidebar__heading">Components</p>
        <div className="mde-sidebar__scroll">
          {filtered.map((c) => {
            const fav = favorites.includes(c.id);
            return (
              <div key={c.id} className="mde-sidebar__row">
                <button
                  type="button"
                  className={cn(
                    "mde-sidebar__link",
                    route.view === "component" &&
                      route.id === c.id &&
                      "mde-sidebar__link--active",
                  )}
                  onClick={() => onNavigate({ view: "component", id: c.id })}
                >
                  <span>{c.label}</span>
                  <span className="mde-sidebar__meta">{c.status}</span>
                </button>
                <button
                  type="button"
                  className={cn(
                    "mde-sidebar__star",
                    fav && "mde-sidebar__star--on",
                  )}
                  aria-label={fav ? `Unfavorite ${c.label}` : `Favorite ${c.label}`}
                  onClick={() => onToggleFavorite(c.id)}
                >
                  ★
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mde-sidebar__footer">
        <button
          type="button"
          className="mde-sidebar__link"
          aria-label="Toggle reduced motion"
          aria-pressed={reducedMotion}
          onClick={onToggleReducedMotion}
        >
          Reduced motion: {reducedMotion ? "on" : "off"}
        </button>
      </div>
    </aside>
  );
}
