"use client";

import { ComponentCatalog } from "../components/registry";
import {
  ENGINE_NAME,
  ENGINE_TAGLINE,
  ENGINE_VERSION,
} from "../constants";
import { MaterialCatalog } from "../materials/catalog";
import { PresetCatalog } from "../presets/catalog";
import type { AppRoute, ComponentId } from "../types";

type OverviewPageProps = {
  onOpenComponent: (id: ComponentId) => void;
  onNavigate: (route: AppRoute) => void;
};

export function OverviewPage({
  onOpenComponent,
  onNavigate,
}: OverviewPageProps) {
  const components = ComponentCatalog.list();
  const materials = MaterialCatalog.list();
  const presets = PresetCatalog.list();

  return (
    <div className="mde-overview">
      <header className="mde-overview__hero">
        <p className="mde-overview__eyebrow">Maser Lab · Procedural materials</p>
        <h1 className="mde-overview__title">{ENGINE_NAME}</h1>
        <p className="mde-overview__support">{ENGINE_TAGLINE}</p>
        <div className="mde-overview__actions">
          <button
            type="button"
            className="mde-btn mde-btn--primary"
            onClick={() => onNavigate({ view: "components" })}
          >
            Browse components
          </button>
          <button
            type="button"
            className="mde-btn"
            onClick={() => onNavigate({ view: "docs" })}
          >
            Documentation
          </button>
        </div>
      </header>

      <section className="mde-stats" aria-label="Engine statistics">
        <div className="mde-stat">
          <strong>{components.length}</strong>
          <span>Components</span>
        </div>
        <div className="mde-stat">
          <strong>{presets.length}</strong>
          <span>Presets</span>
        </div>
        <div className="mde-stat">
          <strong>{materials.length}</strong>
          <span>Materials</span>
        </div>
        <div className="mde-stat">
          <strong>v{ENGINE_VERSION}</strong>
          <span>Engine</span>
        </div>
      </section>

      <section className="mde-overview__grid-wrap">
        <div className="mde-overview__grid-head">
          <h2>Component demos</h2>
          <p>Each item opens its own playground — shared engine, dedicated page.</p>
        </div>
        <div className="mde-list mde-overview__list">
          {components.map((c) => (
            <button
              key={c.id}
              type="button"
              className="mde-list__item mde-list__item--button"
              onClick={() => onOpenComponent(c.id)}
            >
              <div className="mde-comp-card__row">
                <h3>{c.label}</h3>
                <span className="mde-pill">{c.status}</span>
              </div>
              <p>{c.description}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
