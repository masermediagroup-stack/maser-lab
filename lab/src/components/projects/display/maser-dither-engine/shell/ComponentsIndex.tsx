"use client";

import { ComponentCatalog } from "../components/registry";
import type { ComponentId } from "../types";

type ComponentsIndexProps = {
  onOpen: (id: ComponentId) => void;
};

export function ComponentsIndex({ onOpen }: ComponentsIndexProps) {
  const components = ComponentCatalog.list();

  return (
    <div className="mde-page">
      <header className="mde-page__header">
        <h1>Components</h1>
        <p>
          Every adapter consumes the same SurfaceCanvas engine. Open a playground
          for live preview, grouped controls, presets, export, and docs.
        </p>
      </header>
      <div className="mde-list">
        {components.map((c) => (
          <button
            key={c.id}
            type="button"
            className="mde-list__item mde-list__item--button"
            onClick={() => onOpen(c.id)}
          >
            <div className="mde-comp-card__row">
              <h2>{c.label}</h2>
              <span className="mde-pill">{c.status}</span>
            </div>
            <p>{c.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
