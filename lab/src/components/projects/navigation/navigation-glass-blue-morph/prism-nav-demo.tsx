"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useId, useState } from "react";
import { BRAND_NAME, NAV_ITEMS, type NavItemId } from "./constants";
import { GlassBottomNav } from "./glass-bottom-nav";
import "./tokens.css";

const SECTION_COPY: Record<
  NavItemId,
  { title: string; lead: string; accent: string }
> = {
  home: {
    title: "Your creative home base",
    lead: "Recent generations, saved styles, and quick actions — all in one calm view.",
    accent: "12 new renders · 3 styles pinned",
  },
  explore: {
    title: "Discover what’s trending",
    lead: "Curated prompts and community styles updated daily for Prism creators.",
    accent: "Trending · Surreal landscapes · Neon portraits",
  },
  library: {
    title: "Your prompt library",
    lead: "Organize seeds, negative prompts, and style presets you reuse across projects.",
    accent: "48 saved prompts · 6 collections",
  },
  gallery: {
    title: "Gallery album",
    lead: "Browse finished pieces in a soft grid — tap any tile to upscale or remix.",
    accent: "Album · Coastal dusk series · 24 images",
  },
  profile: {
    title: "Profile & settings",
    lead: "Manage your plan, export preferences, and connected apps.",
    accent: "Pro plan · 2.4k credits remaining",
  },
};

function DemoMesh() {
  return (
    <div
      className="pointer-events-none fixed inset-0"
      aria-hidden
      style={{
        background: `
          radial-gradient(ellipse 70% 50% at 20% 20%, rgba(14, 165, 233, 0.22), transparent 55%),
          radial-gradient(ellipse 60% 45% at 85% 30%, rgba(29, 78, 216, 0.18), transparent 50%),
          radial-gradient(ellipse 50% 40% at 50% 90%, rgba(30, 58, 138, 0.25), transparent 55%),
          var(--prism-bg)
        `,
      }}
    />
  );
}

function FakeGrid() {
  return (
    <div
      className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-4"
      aria-hidden
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-2xl opacity-80"
          style={{
            background: `linear-gradient(135deg, rgba(56,189,248,${0.15 + (i % 3) * 0.08}) 0%, rgba(30,58,138,0.35) 100%)`,
            border: "1px solid rgba(147, 197, 253, 0.12)",
          }}
        />
      ))}
    </div>
  );
}

export function PrismNavDemo() {
  const panelId = useId();
  const [activeId, setActiveId] = useState<NavItemId>("gallery");
  const [forceReducedMotion, setForceReducedMotion] = useState(false);

  const handleNavigate = useCallback((id: NavItemId) => {
    setActiveId(id);
  }, []);

  const copy = SECTION_COPY[activeId];

  return (
    <div
      className="prism-nav relative min-h-screen overflow-x-hidden text-[var(--prism-text)]"
      data-reduced-motion={forceReducedMotion ? "true" : undefined}
      style={{ background: "var(--prism-bg)" }}
    >
      <DemoMesh />

      <Link
        href="/"
        className="fixed left-4 top-4 z-50 rounded-full border border-[var(--prism-glass-border)] bg-[var(--prism-glass-bg)] px-3 py-1.5 text-xs text-[var(--prism-text-muted)] backdrop-blur-md transition-colors hover:text-[var(--prism-blue-bright)]"
      >
        ← Lab
      </Link>

      <div className="fixed left-4 top-14 z-50 flex max-w-[200px] flex-col gap-2 rounded-2xl border border-[var(--prism-glass-border)] bg-[var(--prism-glass-bg)] p-2 backdrop-blur-md">
        <span className="px-2 text-[10px] uppercase tracking-widest text-[var(--prism-text-muted)]">
          Demo controls
        </span>
        <div className="flex flex-wrap gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigate(item.id)}
              className={`rounded-lg px-2 py-1 text-[10px] ${
                activeId === item.id
                  ? "bg-[var(--prism-blue-deep)] text-[var(--prism-blue-bright)]"
                  : "text-[var(--prism-text-muted)] hover:text-[var(--prism-blue-bright)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setForceReducedMotion((v) => !v)}
          className="rounded-lg border border-[var(--prism-glass-border)] px-2 py-1 text-[10px] text-[var(--prism-text-muted)]"
        >
          Reduced motion: {forceReducedMotion ? "on" : "off"}
        </button>
      </div>

      <main className="relative mx-auto max-w-lg px-6 pb-32 pt-20">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--prism-blue-mid)]">
          {BRAND_NAME}
        </p>
        <motion.section
          key={activeId}
          id={`${panelId}-panel-${activeId}`}
          role="tabpanel"
          aria-labelledby={`${panelId}-tab-${activeId}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mt-3 text-sm text-[var(--prism-blue-bright)]">
            {copy.accent}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">
            {copy.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--prism-text-muted)]">
            {copy.lead}
          </p>
          {(activeId === "gallery" || activeId === "explore") && <FakeGrid />}
        </motion.section>
      </main>

      <GlassBottomNav
        activeId={activeId}
        onNavigate={handleNavigate}
        forceReducedMotion={forceReducedMotion}
        idPrefix={panelId}
      />
    </div>
  );
}
