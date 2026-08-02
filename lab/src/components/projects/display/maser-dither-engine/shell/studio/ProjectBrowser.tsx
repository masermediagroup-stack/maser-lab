"use client";

import { useMemo, useState } from "react";
import { PROCEDURAL_MATERIALS } from "../../engine/material/catalog";
import {
  listAllProjects,
  type ProjectBrowserFilters,
  type ProjectLibraryState,
  type ProjectRecord,
  type ProjectSortKey,
} from "../../projects";
import type { AppRoute, MaterialId } from "../../types";
import { cn } from "@/lib/utils";

type ProjectBrowserProps = {
  library: ProjectLibraryState;
  onOpen: (project: ProjectRecord) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onFavorite: (id: string, favorite: boolean) => void;
  onImport: (raw: string) => void;
  onExport: (project: ProjectRecord) => void;
  onNavigate: (route: AppRoute) => void;
  onViewChange: (view: "grid" | "list") => void;
};

function sortProjects(
  items: ProjectRecord[],
  sort: ProjectSortKey,
): ProjectRecord[] {
  const copy = [...items];
  switch (sort) {
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "created":
      return copy.sort((a, b) => b.createdAt - a.createdAt);
    case "favorites":
      return copy.sort(
        (a, b) => Number(b.favorite) - Number(a.favorite) || b.updatedAt - a.updatedAt,
      );
    case "material":
      return copy.sort((a, b) => a.materialId.localeCompare(b.materialId));
    case "recent":
    default:
      return copy.sort((a, b) => b.updatedAt - a.updatedAt || a.name.localeCompare(b.name));
  }
}

/**
 * Preset Studio / Project Browser — system presets (read-only) + user projects.
 */
export function ProjectBrowser({
  library,
  onOpen,
  onDuplicate,
  onDelete,
  onRename,
  onFavorite,
  onImport,
  onExport,
  onNavigate,
  onViewChange,
}: ProjectBrowserProps) {
  const [filters, setFilters] = useState<ProjectBrowserFilters>({
    query: "",
    origin: "all",
    favoritesOnly: false,
    materialId: "all",
    sort: "recent",
  });

  const projects = useMemo(() => {
    let list = listAllProjects(library);
    if (filters.origin !== "all") {
      list = list.filter((p) => p.origin === filters.origin);
    }
    if (filters.favoritesOnly) {
      list = list.filter((p) => p.favorite);
    }
    if (filters.materialId !== "all") {
      list = list.filter((p) => p.materialId === filters.materialId);
    }
    const q = filters.query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return sortProjects(list, filters.sort);
  }, [library, filters]);

  return (
    <div className="mde-page mde-studio">
      <header className="mde-page__header">
        <h1>Preset Studio</h1>
        <p>
          System presets are protected. Duplicate into a User Project to edit,
          save, favorite, and export. Thumbnails update on save.
        </p>
      </header>

      <div className="mde-studio__toolbar">
        <input
          type="search"
          className="mde-studio__search"
          placeholder="Search presets & projects…"
          value={filters.query}
          onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
          aria-label="Search projects"
        />
        <select
          value={filters.origin}
          aria-label="Origin filter"
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              origin: e.target.value as ProjectBrowserFilters["origin"],
            }))
          }
        >
          <option value="all">All</option>
          <option value="system">System Presets</option>
          <option value="user">User Projects</option>
        </select>
        <select
          value={filters.materialId}
          aria-label="Material filter"
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              materialId: e.target.value as MaterialId | "all",
            }))
          }
        >
          <option value="all">All materials</option>
          {PROCEDURAL_MATERIALS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          value={filters.sort}
          aria-label="Sort"
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              sort: e.target.value as ProjectSortKey,
            }))
          }
        >
          <option value="recent">Recently edited</option>
          <option value="created">Recently created</option>
          <option value="name">Name</option>
          <option value="favorites">Favorites</option>
          <option value="material">Material</option>
        </select>
        <label className="mde-studio__check">
          <input
            type="checkbox"
            checked={filters.favoritesOnly}
            onChange={(e) =>
              setFilters((f) => ({ ...f, favoritesOnly: e.target.checked }))
            }
          />
          Favorites
        </label>
        <div className="mde-studio__view" role="group" aria-label="View mode">
          <button
            type="button"
            className={cn(
              "mde-chip",
              library.browserView === "grid" && "mde-chip--active",
            )}
            aria-pressed={library.browserView === "grid"}
            onClick={() => onViewChange("grid")}
          >
            Grid
          </button>
          <button
            type="button"
            className={cn(
              "mde-chip",
              library.browserView === "list" && "mde-chip--active",
            )}
            aria-pressed={library.browserView === "list"}
            onClick={() => onViewChange("list")}
          >
            List
          </button>
        </div>
        <label className="mde-btn">
          Import JSON
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              onImport(text);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div
        className={cn(
          "mde-studio__browser",
          library.browserView === "list" && "mde-studio__browser--list",
        )}
      >
        {projects.map((p) => (
          <article
            key={p.id}
            className={cn(
              "mde-studio__card",
              p.origin === "system" && "mde-studio__card--system",
            )}
          >
            <button
              type="button"
              className="mde-studio__thumb"
              onClick={() => onOpen(p)}
              aria-label={`Open ${p.name}`}
            >
              {p.thumbnailDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- data URL thumbnails
                <img src={p.thumbnailDataUrl} alt="" />
              ) : (
                <span className="mde-studio__thumb-fallback" data-material={p.materialId} />
              )}
            </button>
            <div className="mde-studio__meta">
              <div className="mde-comp-card__row">
                <h2>{p.name}</h2>
                <span className="mde-pill">
                  {p.origin === "system" ? "System" : "User"}
                </span>
              </div>
              <p>{p.description}</p>
              <p className="mde-muted">
                {p.materialId}
                {p.updatedAt
                  ? ` · Edited ${new Date(p.updatedAt).toLocaleString()}`
                  : " · Built-in"}
                {p.favorite ? " · ★" : ""}
              </p>
              <div className="mde-studio__actions">
                <button type="button" className="mde-btn" onClick={() => onOpen(p)}>
                  Open
                </button>
                <button
                  type="button"
                  className="mde-btn"
                  onClick={() => onDuplicate(p.id)}
                >
                  Duplicate
                </button>
                {p.origin === "user" ? (
                  <>
                    <button
                      type="button"
                      className="mde-btn"
                      onClick={() => {
                        const name = window.prompt("Rename project", p.name);
                        if (name) onRename(p.id, name);
                      }}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className="mde-btn"
                      onClick={() => onFavorite(p.id, !p.favorite)}
                    >
                      {p.favorite ? "Unfavorite" : "Favorite"}
                    </button>
                    <button
                      type="button"
                      className="mde-btn"
                      onClick={() => onExport(p)}
                    >
                      Export
                    </button>
                    <button
                      type="button"
                      className="mde-btn"
                      onClick={() => {
                        if (window.confirm(`Delete “${p.name}”?`)) {
                          onDelete(p.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="mde-btn"
                    onClick={() =>
                      onNavigate({
                        view: "component",
                        id: p.snapshot.componentId,
                      })
                    }
                  >
                    Try in playground
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
