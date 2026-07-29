"use client";

import { DOCS_TOPICS } from "../docs/content";
import { ENGINE_NAME, ENGINE_VERSION } from "../constants";

type DocsPageProps = {
  topic?: string;
};

export function DocsPage({ topic }: DocsPageProps) {
  const active = DOCS_TOPICS.find((t) => t.id === topic) ?? DOCS_TOPICS[0]!;

  return (
    <div className="mde-page mde-docs">
      <header className="mde-page__header">
        <h1>Documentation</h1>
        <p>
          {ENGINE_NAME} v{ENGINE_VERSION} — reference architecture for procedural
          material engines in Maser Lab.
        </p>
      </header>
      <div className="mde-docs__layout">
        <nav className="mde-docs__toc" aria-label="Topics">
          {DOCS_TOPICS.map((t) => (
            <a
              key={t.id}
              href={`#/docs/${t.id}`}
              className={
                t.id === active.id ? "mde-sidebar__link--active" : undefined
              }
            >
              {t.title}
            </a>
          ))}
        </nav>
        <article className="mde-docs__article">
          <h2>{active.title}</h2>
          <p>{active.body}</p>
        </article>
      </div>
    </div>
  );
}
