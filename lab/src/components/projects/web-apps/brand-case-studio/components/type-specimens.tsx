"use client";

import type { TypographySpec } from "../types";

type TypeSpecimensProps = {
  specimens: TypographySpec[];
};

export function TypeSpecimens({ specimens }: TypeSpecimensProps) {
  if (specimens.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {specimens.map((spec) => (
        <div
          key={spec.id}
          className="bcs-card border-l-4 px-6 py-5"
          style={{ borderLeftColor: "var(--bcs-accent)" }}
        >
          <p className="bcs-kicker">{spec.role}</p>
          <p
            className="bcs-display mt-3 text-3xl sm:text-4xl"
            style={{ fontFamily: spec.family.includes("Serif") ? "var(--bcs-font-display)" : "var(--bcs-font-ui)" }}
          >
            {spec.sample || spec.family}
          </p>
          <p className="mt-3 font-mono text-xs text-[var(--bcs-fg-soft)]">
            {spec.family}
            {spec.weight ? ` · ${spec.weight}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
