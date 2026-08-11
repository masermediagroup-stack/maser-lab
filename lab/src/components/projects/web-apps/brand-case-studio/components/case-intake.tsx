"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { uploadMediaFile } from "../upload-media";
import type { BrandAsset, CaseStudy, CaseStudySection } from "../types";
import { AssetListEditor } from "./asset-list-editor";

type CaseIntakeProps = {
  draft: CaseStudy;
  onChange: (next: CaseStudy) => void;
  onSave: () => void;
  onSyncCloud?: () => void;
  onCancel: () => void;
  onPreview: () => void;
  notice?: { kind: "success" | "error"; message: string } | null;
};

function updateSection(
  sections: CaseStudySection[],
  id: string,
  patch: Partial<CaseStudySection>,
): CaseStudySection[] {
  return sections.map((s) => (s.id === id ? { ...s, ...patch } : s));
}

export function CaseIntake({
  draft,
  onChange,
  onSave,
  onSyncCloud,
  onCancel,
  onPreview,
  notice,
}: CaseIntakeProps) {
  const heroInputRef = useRef<HTMLInputElement>(null);
  const assetInputRef = useRef<HTMLInputElement>(null);
  const [servicesText, setServicesText] = useState(draft.services.join(", "));
  const [paletteText, setPaletteText] = useState(draft.palette.join(", "));

  const patch = (partial: Partial<CaseStudy>) => {
    onChange({ ...draft, ...partial, updatedAt: Date.now() });
  };

  const uploadHero = async (file: File) => {
    const { url } = await uploadMediaFile(file);
    patch({
      hero: { src: url, alt: draft.hero.alt || `${draft.client} hero` },
    });
  };

  const addAsset = async (file: File) => {
    const { url } = await uploadMediaFile(file);
    const asset: BrandAsset = {
      id: `asset-${crypto.randomUUID().slice(0, 8)}`,
      kind: "photo",
      title: file.name.replace(/\.[^.]+$/, ""),
      src: url,
      alt: file.name,
    };
    patch({ assets: [...draft.assets, asset] });
  };

  const addTypography = () => {
    patch({
      typography: [
        ...draft.typography,
        {
          id: `type-${crypto.randomUUID().slice(0, 8)}`,
          role: "Display",
          family: "Instrument Serif",
          sample: "Brand voice",
        },
      ],
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-[var(--bcs-pad)] py-[calc(2rem*var(--bcs-space-scale))]">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="bcs-kicker">Intake studio</p>
          <h1 className="bcs-display mt-1 text-3xl sm:text-4xl">
            {draft.client || "New case study"}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="bcs-btn bcs-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="bcs-btn" onClick={onPreview}>
            Preview
          </button>
          <button type="button" className="bcs-btn bcs-btn--primary" onClick={onSave}>
            Save
          </button>
          {onSyncCloud ? (
            <button type="button" className="bcs-btn" onClick={onSyncCloud}>
              Sync to cloud
            </button>
          ) : null}
        </div>
      </header>

      {notice ? (
        <p
          className={`bcs-notice mb-6 ${notice.kind === "success" ? "bcs-notice--success" : "bcs-notice--error"}`}
          role="status"
        >
          {notice.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-10">
        <section aria-labelledby="intake-client-heading">
          <h2 id="intake-client-heading" className="bcs-display mb-4 text-2xl">
            Client & project
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="bcs-field sm:col-span-2">
              <span className="bcs-label">Client name</span>
              <input
                className="bcs-input"
                value={draft.client}
                onChange={(e) => patch({ client: e.target.value })}
                placeholder="SummitPath Trail Co."
              />
            </label>
            <label className="bcs-field sm:col-span-2">
              <span className="bcs-label">Project title</span>
              <input
                className="bcs-input"
                value={draft.projectTitle}
                onChange={(e) => patch({ projectTitle: e.target.value })}
                placeholder="Brand identity system"
              />
            </label>
            <label className="bcs-field">
              <span className="bcs-label">Tagline</span>
              <input
                className="bcs-input"
                value={draft.tagline}
                onChange={(e) => patch({ tagline: e.target.value })}
              />
            </label>
            <label className="bcs-field">
              <span className="bcs-label">Year</span>
              <input
                className="bcs-input"
                value={draft.year ?? ""}
                onChange={(e) => patch({ year: e.target.value })}
              />
            </label>
            <label className="bcs-field sm:col-span-2">
              <span className="bcs-label">Summary</span>
              <textarea
                className="bcs-textarea"
                value={draft.summary}
                onChange={(e) => patch({ summary: e.target.value })}
                placeholder="One paragraph for the presentation hero…"
              />
            </label>
            <label className="bcs-field sm:col-span-2">
              <span className="bcs-label">Services (comma-separated)</span>
              <input
                className="bcs-input"
                value={servicesText}
                onChange={(e) => {
                  setServicesText(e.target.value);
                  patch({
                    services: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  });
                }}
                placeholder="Brand strategy, Visual identity"
              />
            </label>
          </div>
        </section>

        <section aria-labelledby="intake-hero-heading">
          <h2 id="intake-hero-heading" className="bcs-display mb-4 text-2xl">
            Hero image
          </h2>
          <div className="bcs-card overflow-hidden">
            <div className="relative aspect-[21/9] bg-[var(--bcs-border)]">
              {draft.hero.src ? (
                <Image
                  src={draft.hero.src}
                  alt={draft.hero.alt}
                  fill
                  className="object-cover"
                  sizes="768px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--bcs-fg-soft)]">
                  Upload a hero image for the case study
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 border-t border-[var(--bcs-border)] p-4">
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadHero(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className="bcs-btn"
                onClick={() => heroInputRef.current?.click()}
              >
                Upload image
              </button>
              <label className="bcs-field flex-1 min-w-[200px]">
                <span className="bcs-label">Or image URL</span>
                <input
                  className="bcs-input"
                  value={draft.hero.src.startsWith("data:") ? "" : draft.hero.src}
                  onChange={(e) =>
                    patch({ hero: { ...draft.hero, src: e.target.value } })
                  }
                  placeholder="https://…"
                />
              </label>
            </div>
          </div>
        </section>

        <section aria-labelledby="intake-narrative-heading">
          <h2 id="intake-narrative-heading" className="bcs-display mb-4 text-2xl">
            Narrative sections
          </h2>
          <div className="flex flex-col gap-6">
            {draft.sections.map((section) => (
              <div key={section.id} className="bcs-card p-5">
                <label className="bcs-field mb-3">
                  <span className="bcs-label">{section.type}</span>
                  <input
                    className="bcs-input"
                    value={section.title}
                    onChange={(e) =>
                      patch({
                        sections: updateSection(draft.sections, section.id, {
                          title: e.target.value,
                        }),
                      })
                    }
                  />
                </label>
                <label className="bcs-field">
                  <span className="bcs-label">Body</span>
                  <textarea
                    className="bcs-textarea"
                    value={section.body}
                    onChange={(e) =>
                      patch({
                        sections: updateSection(draft.sections, section.id, {
                          body: e.target.value,
                        }),
                      })
                    }
                  />
                </label>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="intake-brand-heading">
          <h2 id="intake-brand-heading" className="bcs-display mb-4 text-2xl">
            Brand system
          </h2>
          <label className="bcs-field mb-6">
            <span className="bcs-label">Palette (hex, comma-separated)</span>
            <input
              className="bcs-input font-mono"
              value={paletteText}
              onChange={(e) => {
                setPaletteText(e.target.value);
                patch({
                  palette: e.target.value
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean),
                });
              }}
              placeholder="#0B1F33, #E8E4DC"
            />
          </label>

          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="font-semibold">Typography</h3>
            <button type="button" className="bcs-btn" onClick={addTypography}>
              Add specimen
            </button>
          </div>
          <div className="mb-8 flex flex-col gap-4">
            {draft.typography.map((spec, index) => (
              <div key={spec.id} className="bcs-card grid gap-3 p-4 sm:grid-cols-2">
                <label className="bcs-field">
                  <span className="bcs-label">Role</span>
                  <input
                    className="bcs-input"
                    value={spec.role}
                    onChange={(e) => {
                      const next = [...draft.typography];
                      next[index] = { ...spec, role: e.target.value };
                      patch({ typography: next });
                    }}
                  />
                </label>
                <label className="bcs-field">
                  <span className="bcs-label">Family</span>
                  <input
                    className="bcs-input"
                    value={spec.family}
                    onChange={(e) => {
                      const next = [...draft.typography];
                      next[index] = { ...spec, family: e.target.value };
                      patch({ typography: next });
                    }}
                  />
                </label>
                <label className="bcs-field sm:col-span-2">
                  <span className="bcs-label">Sample text</span>
                  <input
                    className="bcs-input"
                    value={spec.sample}
                    onChange={(e) => {
                      const next = [...draft.typography];
                      next[index] = { ...spec, sample: e.target.value };
                      patch({ typography: next });
                    }}
                  />
                </label>
              </div>
            ))}
          </div>

          <AssetListEditor
            assets={draft.assets}
            onChange={(assets) => patch({ assets })}
            onUpload={() => assetInputRef.current?.click()}
          />
          <input
            ref={assetInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              void Promise.all(files.map(addAsset));
              e.target.value = "";
            }}
          />
        </section>
      </div>
    </div>
  );
}
