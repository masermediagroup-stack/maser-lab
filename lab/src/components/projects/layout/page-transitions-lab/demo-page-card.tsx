import type { CSSProperties } from "react";
import type { PageSample } from "./types";

export function DemoPageCard({
  sample,
  variant = "default",
}: {
  sample: PageSample;
  variant?: "default" | "outgoing" | "incoming";
}) {
  return (
    <article
      className={`ptl-page-card ptl-page-card--${variant}`}
      data-page={sample.id}
      style={{ "--ptl-page-accent": sample.accent } as CSSProperties}
    >
      <div className="ptl-page-card__header">
        <span>{sample.label}</span>
        <span>{sample.kicker}</span>
      </div>
      <div className="ptl-product-visual" aria-hidden="true">
        <span />
      </div>
      <p>{sample.title}</p>
    </article>
  );
}
