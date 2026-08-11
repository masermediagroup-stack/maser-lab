"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import type { CSSProperties } from "react";
import { AssetGrid } from "./asset-grid";
import { BeforeAfterSlider } from "./before-after-slider";
import { PaletteStrip } from "./palette-strip";
import { TypeSpecimens } from "./type-specimens";
import type { NormalizedCaseStudy } from "../types";

type CasePresentationProps = {
  study: NormalizedCaseStudy;
  variant?: "studio" | "public";
  onBack?: () => void;
  onEdit?: () => void;
  shareUrl?: string | null;
  onPublish?: () => void;
  onCopyShareLink?: () => void;
  onExportPdf?: () => void;
  reducedMotion?: boolean;
};

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function CasePresentation({
  study,
  variant = "studio",
  onBack,
  onEdit,
  shareUrl,
  onPublish,
  onCopyShareLink,
  onExportPdf,
  reducedMotion = false,
}: CasePresentationProps) {
  const prefersReduced = useReducedMotion();
  const reduce = reducedMotion || !!prefersReduced;
  const duration = reduce ? 0 : 0.45;
  const isPublic = variant === "public";

  return (
    <article
      className="bcs-presentation min-h-screen"
      style={{ "--bcs-accent": study.accentColor } as CSSProperties}
      aria-label={`${study.client} case study presentation`}
    >
      {!isPublic ? (
        <header className="bcs-no-print sticky top-0 z-20 border-b border-[var(--bcs-border)] bg-[var(--bcs-bg)]/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-[var(--bcs-pad)] py-3">
            <button type="button" className="bcs-btn bcs-btn--ghost" onClick={onBack}>
              ← All cases
            </button>
            <p className="hidden truncate text-sm text-[var(--bcs-fg-muted)] sm:block">
              {study.client} · {study.projectTitle}
            </p>
            <div className="flex flex-wrap gap-2">
              {onExportPdf ? (
                <button type="button" className="bcs-btn" onClick={onExportPdf}>
                  Export PDF
                </button>
              ) : null}
              {onCopyShareLink && shareUrl ? (
                <button type="button" className="bcs-btn" onClick={onCopyShareLink}>
                  Copy share link
                </button>
              ) : null}
              {onPublish ? (
                <button type="button" className="bcs-btn bcs-btn--primary" onClick={onPublish}>
                  {study.published ? "Update publish" : "Publish"}
                </button>
              ) : null}
              <button type="button" className="bcs-btn" onClick={onEdit}>
                Edit intake
              </button>
            </div>
          </div>
          {shareUrl && study.published ? (
            <p className="bcs-no-print mx-auto max-w-6xl px-[var(--bcs-pad)] pb-3 font-mono text-xs text-[var(--bcs-success)]">
              Live at {shareUrl}
            </p>
          ) : null}
        </header>
      ) : null}

      <section className="relative min-h-[70vh] overflow-hidden bg-[var(--bcs-fg)] text-white">
        {study.hero.src ? (
          <>
            <Image
              src={study.hero.src}
              alt={study.hero.alt}
              fill
              priority
              className="object-cover opacity-70"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bcs-fg)] via-[var(--bcs-fg)]/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[var(--bcs-accent)]" />
        )}
        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-[var(--bcs-pad)] pb-[calc(3rem*var(--bcs-space-scale))] pt-32">
          <motion.div
            initial={reduce ? "visible" : "hidden"}
            animate="visible"
            variants={reveal}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              {study.client}
              {study.year ? ` · ${study.year}` : ""}
            </p>
            <h1 className="bcs-display mt-4 max-w-4xl text-5xl text-white sm:text-6xl lg:text-7xl">
              {study.displayTitle}
            </h1>
            {study.tagline ? (
              <p className="mt-4 max-w-2xl text-lg text-white/85 sm:text-xl">{study.tagline}</p>
            ) : null}
            {study.services.length > 0 ? (
              <ul className="mt-6 flex flex-wrap gap-2">
                {study.services.map((service) => (
                  <li
                    key={service}
                    className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide"
                  >
                    {service}
                  </li>
                ))}
              </ul>
            ) : null}
          </motion.div>
        </div>
      </section>

      {study.summary ? (
        <motion.section
          className="mx-auto max-w-3xl px-[var(--bcs-pad)] py-[calc(3rem*var(--bcs-space-scale))]"
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={reveal}
          transition={{ duration: duration * 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="bcs-kicker">Summary</p>
          <p className="bcs-display mt-4 text-2xl leading-snug text-[var(--bcs-fg)] sm:text-3xl">
            {study.summary}
          </p>
        </motion.section>
      ) : null}

      {study.sectionOrder.map((section) =>
        section.body.trim() ? (
          <motion.section
            key={section.id}
            className="border-t border-[var(--bcs-border)]"
            initial={reduce ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={reveal}
            transition={{ duration: duration * 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto grid max-w-6xl gap-8 px-[var(--bcs-pad)] py-[calc(3rem*var(--bcs-space-scale))] md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <h2 className="bcs-display text-3xl sm:text-4xl">{section.title}</h2>
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-[var(--bcs-fg-muted)]">
                {section.body}
              </p>
            </div>
          </motion.section>
        ) : null,
      )}

      {study.comparison?.before.src && study.comparison?.after.src ? (
        <section className="border-t border-[var(--bcs-border)] bg-[var(--bcs-bg-elevated)]">
          <div className="mx-auto max-w-6xl px-[var(--bcs-pad)] py-[calc(3rem*var(--bcs-space-scale))]">
            <p className="bcs-kicker mb-6">Before & after</p>
            <BeforeAfterSlider
              before={study.comparison.before}
              after={study.comparison.after}
              reducedMotion={reduce}
            />
          </div>
        </section>
      ) : null}

      {study.palette.length > 0 ? (
        <section className="border-t border-[var(--bcs-border)]">
          <div className="mx-auto max-w-6xl px-[var(--bcs-pad)] py-[calc(3rem*var(--bcs-space-scale))]">
            <p className="bcs-kicker mb-6">Color palette</p>
            <PaletteStrip colors={study.palette} accentColor={study.accentColor} />
          </div>
        </section>
      ) : null}

      {study.typography.length > 0 ? (
        <section className="border-t border-[var(--bcs-border)] bg-[var(--bcs-bg-elevated)]">
          <div className="mx-auto max-w-6xl px-[var(--bcs-pad)] py-[calc(3rem*var(--bcs-space-scale))]">
            <p className="bcs-kicker mb-6">Typography</p>
            <TypeSpecimens specimens={study.typography} />
          </div>
        </section>
      ) : null}

      {study.featuredAssets.length > 0 ? (
        <section className="border-t border-[var(--bcs-border)]">
          <div className="mx-auto max-w-6xl px-[var(--bcs-pad)] py-[calc(3rem*var(--bcs-space-scale))]">
            <p className="bcs-kicker mb-6">Brand assets</p>
            <AssetGrid assets={study.featuredAssets} accentColor={study.accentColor} />
          </div>
        </section>
      ) : null}

      <footer className="border-t border-[var(--bcs-border)] bg-[var(--bcs-fg)] px-[var(--bcs-pad)] py-12 text-center text-sm text-white/60">
        <p>
          {study.client} — {study.projectTitle}
        </p>
        <p className="mt-1 font-mono text-xs">Prepared with Brand Case Studio</p>
      </footer>
    </article>
  );
}
