"use client";

import { MaterialCatalog } from "../materials/catalog";
import type { AppRoute } from "../types";

type MaterialsPageProps = {
  onNavigate: (route: AppRoute) => void;
};

export function MaterialsPage({ onNavigate }: MaterialsPageProps) {
  const materials = MaterialCatalog.list();

  return (
    <div className="mde-page">
      <header className="mde-page__header">
        <h1>Materials</h1>
        <p>
          Shared material catalog. Only Monochrome is ready — stubs reserve the
          architecture for Gradient, Noise, Chrome, Paper, Velvet, Aurora, Water,
          and Smoke.
        </p>
      </header>
      <div className="mde-list">
        {materials.map((m) => (
          <article key={m.id} className="mde-list__item">
            <div className="mde-comp-card__row">
              <h2>{m.label}</h2>
              <span className="mde-pill">{m.status}</span>
            </div>
            <p>{m.description}</p>
            {m.status === "ready" ? (
              <button
                type="button"
                className="mde-btn"
                onClick={() => onNavigate({ view: "component", id: "card" })}
              >
                Open in Card playground
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
