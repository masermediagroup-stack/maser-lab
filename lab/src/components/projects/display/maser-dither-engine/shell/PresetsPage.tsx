"use client";

import { PresetCatalog } from "../presets/catalog";
import type { AppRoute } from "../types";

type PresetsPageProps = {
  onNavigate: (route: AppRoute) => void;
};

export function PresetsPage({ onNavigate }: PresetsPageProps) {
  const presets = PresetCatalog.list();

  return (
    <div className="mde-page">
      <header className="mde-page__header">
        <h1>Presets</h1>
        <p>
          Named parameter snapshots applied across component playgrounds. Presets
          never fork the renderer — they only write MonochromeParams.
        </p>
      </header>
      <div className="mde-list">
        {presets.map((p) => (
          <article key={p.id} className="mde-list__item">
            <div className="mde-comp-card__row">
              <h2>{p.label}</h2>
              <span className="mde-pill">{p.materialId}</span>
            </div>
            <p>{p.description}</p>
            <p className="mde-muted">
              Components:{" "}
              {p.componentIds === "*"
                ? "All"
                : p.componentIds.join(", ")}
            </p>
            <button
              type="button"
              className="mde-btn"
              onClick={() =>
                onNavigate({
                  view: "component",
                  id:
                    p.componentIds === "*"
                      ? "card"
                      : p.componentIds[0] ?? "card",
                })
              }
            >
              Try preset
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
