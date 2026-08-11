"use client";

import Image from "next/image";
import type { CaseStudy } from "../types";

type CaseIndexProps = {
  cases: CaseStudy[];
  cloudEnabled?: boolean;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onPresent: (id: string) => void;
  onImport: () => void;
};

function formatDate(ts: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ts));
}

export function CaseIndex({
  cases,
  cloudEnabled = false,
  onCreate,
  onEdit,
  onPresent,
  onImport,
}: CaseIndexProps) {
  const sorted = [...cases].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="mx-auto max-w-5xl px-[var(--bcs-pad)] py-[calc(2rem*var(--bcs-space-scale))]">
      <header className="mb-[calc(2.5rem*var(--bcs-space-scale))] flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="bcs-kicker">Brand Case Studio</p>
          <h1 className="bcs-display mt-2 text-4xl sm:text-5xl">Client case studies</h1>
          <p className="mt-3 max-w-xl text-[var(--bcs-fg-muted)]">
            Upload brand assets and narrative once — present a polished case study to clients.
            {cloudEnabled ? " Cloud sync and share links are enabled." : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="bcs-btn bcs-btn--ghost" onClick={onImport}>
            Import JSON
          </button>
          <button type="button" className="bcs-btn bcs-btn--primary" onClick={onCreate}>
            New case study
          </button>
        </div>
      </header>

      {sorted.length === 0 ? (
        <div
          className="bcs-card flex flex-col items-center justify-center gap-4 px-8 py-16 text-center"
          aria-label="No case studies yet"
        >
          <p className="bcs-display text-2xl">Start your first case study</p>
          <p className="max-w-md text-[var(--bcs-fg-muted)]">
            Add client details, hero imagery, brand colors, typography, and deliverable assets.
            The presentation layer composes everything automatically.
          </p>
          <button type="button" className="bcs-btn bcs-btn--primary" onClick={onCreate}>
            Create case study
          </button>
        </div>
      ) : (
        <ul className="grid gap-[var(--bcs-gap)] sm:grid-cols-2">
          {sorted.map((item) => (
            <li key={item.id}>
              <article className="bcs-card bcs-card--interactive flex h-full flex-col">
                <div className="relative aspect-[16/9] bg-[var(--bcs-border)]">
                  {item.hero.src ? (
                    <Image
                      src={item.hero.src}
                      alt={item.hero.alt || item.client}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[var(--bcs-fg-soft)]">
                      No hero image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <p className="bcs-kicker">{item.client || "Untitled client"}</p>
                    <h2 className="bcs-display mt-1 text-2xl">
                      {item.projectTitle || "Untitled project"}
                    </h2>
                    {item.tagline ? (
                      <p className="mt-1 text-sm text-[var(--bcs-fg-muted)]">{item.tagline}</p>
                    ) : null}
                    {item.published ? (
                      <span className="inline-flex items-center rounded-full bg-[rgba(45,106,79,0.12)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--bcs-success)]">
                        Published
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      className="bcs-btn bcs-btn--primary"
                      onClick={() => onPresent(item.id)}
                    >
                      Present
                    </button>
                    <button type="button" className="bcs-btn" onClick={() => onEdit(item.id)}>
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-[var(--bcs-fg-soft)]">
                    Updated {formatDate(item.updatedAt)}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
