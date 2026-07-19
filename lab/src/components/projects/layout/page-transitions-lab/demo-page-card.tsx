import type { CSSProperties } from "react";
import type { PageSample } from "./types";

function FakeNav({ brand }: { brand: string }) {
  return (
    <div className="ptl-wire-nav" aria-hidden="true">
      <span className="ptl-wire-nav__brand">{brand}</span>
      <span className="ptl-wire-nav__links">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

export function DemoPageCard({
  sample,
  variant = "default",
}: {
  sample: PageSample;
  variant?: "default" | "outgoing" | "incoming";
}) {
  const className = `ptl-page-card ptl-page-card--${sample.kind} ptl-page-card--${variant}`;
  const style = { "--ptl-page-accent": sample.accent } as CSSProperties;

  if (sample.kind === "article") {
    return (
      <article className={className} data-page={sample.id} style={style}>
        <FakeNav brand={sample.brand} />
        <div className="ptl-wire-article">
          <p className="ptl-wire-article__meta" aria-hidden="true">
            Journal · 6 min
          </p>
          <h2>{sample.title}</h2>
          <div className="ptl-wire-article__body" aria-hidden="true">
            <span className="ptl-wire-line ptl-wire-line--wide" />
            <span className="ptl-wire-line ptl-wire-line--wide" />
            <span className="ptl-wire-line" />
            <span className="ptl-wire-line ptl-wire-line--wide" />
            <span className="ptl-wire-line" />
            <span className="ptl-wire-line ptl-wire-line--mid" />
          </div>
          <div className="ptl-wire-article__aside" aria-hidden="true">
            <span />
            <span />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={className} data-page={sample.id} style={style}>
      <FakeNav brand={sample.brand} />
      <div className="ptl-wire-hero" aria-hidden="true">
        <div className="ptl-wire-hero__copy">
          <span className="ptl-wire-eyebrow" />
          <strong>{sample.title}</strong>
          <span className="ptl-wire-line ptl-wire-line--wide" />
          <span className="ptl-wire-line" />
          <span className="ptl-wire-cta" />
        </div>
        <div className="ptl-wire-hero__media">
          <span />
        </div>
      </div>
      <div className="ptl-wire-features" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </article>
  );
}
