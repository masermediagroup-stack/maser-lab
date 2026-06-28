"use client";

import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { AnimatedText } from "./animated-text";
import { NAV_ITEMS, type NavItemId } from "./constants";
import { PlotlineTabNav } from "./tab-nav";

const SECTION_COPY: Record<
  NavItemId,
  { title: string; lead: string; accent: string }
> = {
  features: {
    title: "Curves that tell the story",
    lead: "Plotline turns noisy metrics into readable arcs — so your team spots inflection points before the quarter ends.",
    accent: "Live trend folding · Anomaly arcs · Team snapshots",
  },
  faq: {
    title: "Answers without the scroll",
    lead: "Common questions about imports, privacy, and pricing — structured the way your stakeholders actually ask them.",
    accent: "SOC2-ready · CSV & API · Cancel anytime",
  },
  updates: {
    title: "What shipped this month",
    lead: "Bubble annotations, shared dashboards, and a faster curve renderer — see the changelog without leaving the chart.",
    accent: "v2.4 bubble nav · Shared views · 40% faster render",
  },
  integrations: {
    title: "Plug in your stack",
    lead: "Connect warehouse, sheets, or webhooks. Plotline normalizes the curve on ingest so labels stay honest.",
    accent: "Snowflake · Google Sheets · REST hooks",
  },
  pricing: {
    title: "Scale with your curves",
    lead: "Start free, upgrade when your team needs shared bubbles, SSO, and unlimited retained snapshots.",
    accent: "Free tier · Team $29 · Enterprise custom",
  },
};

function FakeChart() {
  return (
    <div
      className="plotline-glass relative mt-10 h-48 w-full overflow-hidden rounded-3xl md:h-56"
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 180"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="plotline-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(155, 27, 92, 0.45)" />
            <stop offset="100%" stopColor="rgba(155, 27, 92, 0)" />
          </linearGradient>
        </defs>
        <path
          d="M0 140 Q80 120 120 90 T200 70 T280 100 T400 40 V180 H0 Z"
          fill="url(#plotline-fill)"
        />
        <path
          d="M0 140 Q80 120 120 90 T200 70 T280 100 T400 40"
          fill="none"
          stroke="var(--pl-pink-light)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {[28, 52, 71, 88].map((left) => (
        <motion.div
          key={left}
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[var(--pl-pink-light)] shadow-[0_0_16px_var(--pl-pink-light)]"
          style={{ left: `${left}%` }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            delay: left * 0.02,
          }}
        />
      ))}
    </div>
  );
}

export function PlotlineTabNavDemo() {
  const [activeId, setActiveId] = useState<NavItemId>("features");
  const [forceReducedMotion, setForceReducedMotion] = useState(false);
  const sectionRefs = useRef<Partial<Record<NavItemId, HTMLElement>>>({});

  const handleNavigate = useCallback((id: NavItemId) => {
    setActiveId(id);
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const copy = SECTION_COPY[activeId];

  return (
    <div
      className="plotline-nav relative min-h-screen overflow-x-hidden bg-[#0a0610] text-[var(--pl-text)]"
      data-reduced-motion={forceReducedMotion ? "true" : undefined}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-80"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(155, 27, 92, 0.35), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(245, 184, 212, 0.08), transparent 50%)",
        }}
      />

      <PlotlineTabNav
        activeId={activeId}
        onNavigate={handleNavigate}
        forceReducedMotion={forceReducedMotion}
      />

      {/* Demo controls */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-wrap gap-2 rounded-2xl border border-[var(--pl-glass-border)] bg-[var(--pl-glass-bg)] p-2 backdrop-blur-md">
        <span className="w-full px-2 text-[10px] uppercase tracking-widest text-[var(--pl-text-muted)]">
          Demo controls
        </span>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavigate(item.id)}
            className={`rounded-lg px-2 py-1 text-xs ${
              activeId === item.id
                ? "bg-[var(--pl-pink-dark)] text-[var(--pl-pink-light)]"
                : "text-[var(--pl-text-muted)] hover:text-[var(--pl-pink-light)]"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setForceReducedMotion((value) => !value)}
          className="rounded-lg border border-[var(--pl-glass-border)] px-2 py-1 text-xs text-[var(--pl-text-muted)]"
        >
          Reduced motion: {forceReducedMotion ? "on" : "off"}
        </button>
      </div>

      <main className="relative px-4 pb-24 pt-28 md:px-8 md:pt-32">
        <motion.section
          key={activeId}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          ref={(node) => {
            sectionRefs.current[activeId] = node ?? undefined;
          }}
          className="mx-auto max-w-3xl"
        >
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--pl-pink-muted)]">
            <AnimatedText>{copy.accent}</AnimatedText>
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
            <AnimatedText variant="heading">{copy.title}</AnimatedText>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--pl-text-muted)]">
            <AnimatedText variant="body">{copy.lead}</AnimatedText>
          </p>
          <FakeChart />
        </motion.section>

        {/* Hidden anchors for scroll targets */}
        <div className="sr-only">
          {NAV_ITEMS.filter((item) => item.id !== activeId).map((item) => (
            <section
              key={item.id}
              ref={(node) => {
                sectionRefs.current[item.id] = node ?? undefined;
              }}
              id={item.id}
              aria-hidden
            />
          ))}
        </div>
      </main>
    </div>
  );
}
