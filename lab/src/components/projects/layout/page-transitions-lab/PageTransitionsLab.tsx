"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import {
  generateSettingsSummary,
  generateTransitionCode,
} from "./code-generators";
import {
  getTransitionDefinition,
  transitionDefinitions,
} from "./transition-definitions";
import type {
  PreviewPhase,
  TransitionId,
  TransitionSettings,
} from "./types";
import "./tokens.css";

const pageSamples = [
  {
    label: "Collection",
    title: "Spring Objects",
    kicker: "New arrivals",
    items: ["Stoneware Set", "Linen Overshirt", "Oak Tray"],
  },
  {
    label: "Product",
    title: "Ceramic Pour Set",
    kicker: "Featured piece",
    items: ["Matte glaze", "Ships in 2 days", "$84"],
  },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function SettingSlider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="ptl-control">
      <span>
        <span>{label}</span>
        <strong>
          {value}
          {suffix}
        </strong>
      </span>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(next) => {
          const resolved = Array.isArray(next) ? next[0] : next;
          onChange(resolved ?? min);
        }}
      />
    </label>
  );
}

function DemoPageCard({
  sample,
  variant,
}: {
  sample: (typeof pageSamples)[number];
  variant: "previous" | "next";
}) {
  return (
    <article className={`ptl-page-card ptl-page-card--${variant}`}>
      <div className="ptl-page-card__header">
        <span>{sample.label}</span>
        <span>{sample.kicker}</span>
      </div>
      <div className="ptl-product-visual" aria-hidden="true">
        <span />
      </div>
      <div>
        <p>{sample.title}</p>
        <ul>
          {sample.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function TransitionStage({
  selectedId,
  settings,
  phase,
  activePage,
}: {
  selectedId: TransitionId;
  settings: TransitionSettings;
  phase: PreviewPhase;
  activePage: 0 | 1;
}) {
  const style = {
    "--ptl-duration": `${settings.duration}ms`,
    "--ptl-intensity": settings.intensity,
    "--ptl-stagger": `${settings.stagger}ms`,
    "--ptl-radius": `${settings.radius}px`,
  } as CSSProperties;
  const previous = pageSamples[activePage];
  const next = pageSamples[activePage === 0 ? 1 : 0];

  return (
    <section
      className="ptl-stage"
      data-transition={selectedId}
      data-phase={phase}
      style={style}
      aria-label="Page transition preview stage"
    >
      <div className="ptl-browser-bar" aria-hidden="true">
        <span />
        <span />
        <span />
        <p>/shop/{phase === "animating" ? next.label : previous.label}</p>
      </div>
      <div className="ptl-route-frame">
        <div className="ptl-route-page ptl-route-page--previous">
          <DemoPageCard sample={previous} variant="previous" />
        </div>
        <div className="ptl-route-page ptl-route-page--next">
          <DemoPageCard sample={next} variant="next" />
        </div>
        <span className="ptl-transition-cover" aria-hidden="true" />
      </div>
    </section>
  );
}

function ExportDrawer({
  open,
  onOpenChange,
  selectedId,
  settings,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedId: TransitionId;
  settings: TransitionSettings;
}) {
  const [copied, setCopied] = useState(false);
  const definition = getTransitionDefinition(selectedId) ?? transitionDefinitions[0];
  const code = generateTransitionCode(definition, settings);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-white/10 bg-neutral-950 text-white sm:max-w-2xl"
      >
        <SheetHeader>
          <SheetTitle className="text-white">{definition.title}</SheetTitle>
          <SheetDescription className="text-neutral-400">
            Starter code for extracting this route transition into a client
            project.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <section className="space-y-2">
            <h3 className="ptl-drawer-label">Current settings</h3>
            <pre className="ptl-code-block">{generateSettingsSummary(settings)}</pre>
          </section>
          <section className="space-y-2">
            <h3 className="ptl-drawer-label">Dependencies</h3>
            <p className="text-sm text-neutral-300">
              {definition.dependencies.join(", ")}
            </p>
          </section>
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="ptl-drawer-label">Component starter</h3>
              <Button
                variant="outline"
                size="sm"
                className="border-white/15 bg-transparent text-white hover:bg-white/5"
                onClick={copyCode}
              >
                <Copy />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <ScrollArea className="h-[min(52vh,520px)] rounded-lg border border-white/10">
              <pre className="p-4 text-xs leading-relaxed whitespace-pre-wrap text-neutral-200">
                {code}
              </pre>
            </ScrollArea>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function PageTransitionsLab() {
  const [selectedId, setSelectedId] =
    useState<TransitionId>("editorial-wipe");
  const selected = getTransitionDefinition(selectedId) ?? transitionDefinitions[0];
  const [settings, setSettings] = useState<TransitionSettings>(
    selected.defaults,
  );
  const [phase, setPhase] = useState<PreviewPhase>("idle");
  const [activePage, setActivePage] = useState<0 | 1>(0);
  const [exportOpen, setExportOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const play = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setPhase("animating");
    const wait = reducedMotion ? 180 : settings.duration + settings.stagger + 80;
    timeoutRef.current = window.setTimeout(() => {
      setActivePage((current) => (current === 0 ? 1 : 0));
      setPhase("idle");
    }, wait);
  };

  const reset = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setPhase("idle");
    setActivePage(0);
  };

  const updateSetting = (key: keyof TransitionSettings, value: number) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  return (
    <main className="page-transitions-lab min-h-screen bg-[#f4f1ea] text-[#181714]">
      <div className="ptl-shell">
        <header className="ptl-hero">
          <Link href="/" className="ptl-back-link">
            Maser-Lab
          </Link>
          <div className="ptl-hero__grid">
            <div>
              <p className="ptl-kicker">Layout / route motion</p>
              <h1>Page Transitions Lab</h1>
              <p className="ptl-lead">
                A workspace for comparing page-to-page transition patterns,
                tuning practical settings, and exporting the chosen code for a
                client shopping site.
              </p>
            </div>
            <div className="ptl-hero__actions">
              <Button onClick={play} size="lg" disabled={phase === "animating"}>
                <Play />
                {phase === "animating" ? "Playing" : "Replay transition"}
              </Button>
              <Button variant="outline" size="lg" onClick={reset}>
                <RotateCcw />
                Reset
              </Button>
              <Button variant="outline" size="lg" onClick={() => setExportOpen(true)}>
                Export code
                <ArrowRight />
              </Button>
            </div>
          </div>
        </header>

        <section className="ptl-workspace">
          <aside className="ptl-panel ptl-panel--list" aria-label="Transition concepts">
            <div className="ptl-panel__heading">
              <p>First five</p>
              <span>Pick one to preview</span>
            </div>
            <div className="ptl-transition-list">
              {transitionDefinitions.map((transition, index) => (
                <button
                  key={transition.id}
                  type="button"
                  className="ptl-transition-option"
                  data-selected={transition.id === selectedId}
                  onClick={() => {
                    setSelectedId(transition.id);
                    setSettings(transition.defaults);
                    reset();
                  }}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{transition.title}</strong>
                  <small>{transition.eyebrow}</small>
                </button>
              ))}
            </div>
          </aside>

          <div className="ptl-preview-column">
            <TransitionStage
              selectedId={selectedId}
              settings={settings}
              phase={phase}
              activePage={activePage}
            />
            <div className="ptl-notes-grid">
              <article>
                <span>Use case</span>
                <p>{selected.useCase}</p>
              </article>
              <article>
                <span>Mechanics</span>
                <p>{selected.mechanics}</p>
              </article>
              <article>
                <span>Risk to test</span>
                <p>{selected.risk}</p>
              </article>
            </div>
          </div>

          <aside className="ptl-panel ptl-panel--controls" aria-label="Transition controls">
            <div className="ptl-panel__heading">
              <p>Controls</p>
              <span>{selected.title}</span>
            </div>
            <div className="ptl-control-stack">
              <SettingSlider
                label="Duration"
                value={settings.duration}
                min={240}
                max={900}
                step={20}
                suffix="ms"
                onChange={(value) => updateSetting("duration", value)}
              />
              <SettingSlider
                label="Intensity"
                value={settings.intensity}
                min={0}
                max={100}
                step={2}
                onChange={(value) => updateSetting("intensity", value)}
              />
              <SettingSlider
                label="Stagger"
                value={settings.stagger}
                min={0}
                max={180}
                step={10}
                suffix="ms"
                onChange={(value) => updateSetting("stagger", value)}
              />
              <SettingSlider
                label="Radius"
                value={settings.radius}
                min={0}
                max={120}
                step={2}
                suffix="px"
                onChange={(value) => updateSetting("radius", value)}
              />
            </div>
            <div className="ptl-reduced-note">
              <strong>Reduced motion</strong>
              <p>
                {reducedMotion
                  ? "Your system preference is active; previews collapse to a short opacity bridge."
                  : "The CSS includes a reduced-motion branch that removes large travel and blur."}
              </p>
            </div>
          </aside>
        </section>
      </div>

      <ExportDrawer
        open={exportOpen}
        onOpenChange={setExportOpen}
        selectedId={selectedId}
        settings={settings}
      />
    </main>
  );
}
