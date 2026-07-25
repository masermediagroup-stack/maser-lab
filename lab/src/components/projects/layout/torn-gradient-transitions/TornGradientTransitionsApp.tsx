"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { DEMO_PAGES } from "./components/demo-pages";
import { PerformanceReadout } from "./components/performance-readout";
import { TransitionControls } from "./components/transition-controls";
import { TransitionExportPanel } from "./components/transition-export-panel";
import {
  TransitionPreview,
  type PreviewController,
} from "./components/transition-preview";
import { usePrefersReducedMotion } from "./hooks/use-reduced-motion";
import { PerformanceStore } from "./lib/performance-store";
import {
  DEFAULT_PRESET_ID,
  TRANSITION_PRESETS,
  findPreset,
  presetSettings,
  randomizeSettings,
} from "./lib/transition-presets";
import { scrubFrame } from "./lib/transition-state-machine";
import type {
  QualityMode,
  SettingKey,
  TornTransitionPreset,
  TornTransitionSettings,
  TransitionOrigin,
} from "./lib/transition-types";
import { buildSearch, readUrlState } from "./lib/transition-url-state";
import { QUALITY_PROFILES, detectQuality } from "./lib/transition-utils";
import "./tokens.css";

const CUSTOM_PRESET_KEY = "torn-gradient-transitions:presets:v1";

type MotionPreference = "system" | "full" | "reduced";

function readCustomPresets(): TornTransitionPreset[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PRESET_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TornTransitionPreset[]) : [];
  } catch {
    return [];
  }
}

const noopSubscribe = () => () => {};

/** False during SSR and the hydration pass, true from the first client render. */
function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * Shell + hydration gate. The lab body reads `window.location.search`,
 * `localStorage`, and the GPU on first render, so it is only mounted once
 * hydration is done — that keeps the initial markup identical on both sides
 * and lets the body seed its state lazily instead of via setState-in-effect.
 */
export function TornGradientTransitionsApp() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="tgt-app">
        <Header />
        <div className="tgt-layout">
          <main className="tgt-main">
            <div className="tgt-preview tgt-preview--placeholder" aria-hidden />
          </main>
          <aside className="tgt-side" aria-hidden />
        </div>
      </div>
    );
  }

  return <TornLab />;
}

function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="tgt-header">
      <div className="tgt-header__brand">
        <Link href="/" className="tgt-back">
          ← Maser-Lab
        </Link>
        <h1 className="tgt-title">Torn Gradient Transitions</h1>
        <p className="tgt-subtitle">
          A shader-driven page-transition lab where a thick, bubbled sheet of
          gradient paper tears across the viewport and the route changes
          underneath it.
        </p>
      </div>
      <div className="tgt-header__actions">{children}</div>
    </header>
  );
}

function TornLab() {
  const systemReduced = usePrefersReducedMotion();

  // Seeded from the URL on the first client render — see the gate above.
  const [initial] = useState(() => readUrlState(window.location.search));

  const [presetId, setPresetId] = useState(initial.presetId);
  const [settings, setSettings] = useState<TornTransitionSettings>(
    initial.settings,
  );
  const [page, setPage] = useState(
    Math.min(initial.page, DEMO_PAGES.length - 1),
  );
  const [customPresets, setCustomPresets] = useState<TornTransitionPreset[]>(
    readCustomPresets,
  );

  const [quality, setQuality] = useState<QualityMode>(detectQuality);
  const [motionPreference, setMotionPreference] =
    useState<MotionPreference>("system");
  const [frozen, setFrozen] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [scrub, setScrub] = useState(0.5);
  const [exportOpen, setExportOpen] = useState(false);
  const [origin, setOrigin] = useState<TransitionOrigin>({ x: 0.5, y: 0.5 });

  const [perfStore] = useState(() => new PerformanceStore());
  const controllerRef = useRef<PreviewController | null>(null);

  // Settings churn on every pointer-move over a slider, so the URL is written
  // on a trailing debounce and always replaces the entry — history stays usable.
  useEffect(() => {
    const id = setTimeout(() => {
      const search = buildSearch({ presetId, settings, page });
      window.history.replaceState(
        { tgtPage: page },
        "",
        `${window.location.pathname}?${search}`,
      );
    }, 280);
    return () => clearTimeout(id);
  }, [page, presetId, settings]);

  // Back/forward moves between demo pages and plays the transition both ways.
  useEffect(() => {
    const onPop = () => {
      const state = readUrlState(window.location.search);
      const next = Math.min(state.page, DEMO_PAGES.length - 1);
      const controller = controllerRef.current;
      if (controller) controller.go(next);
      else setPage(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const commitPage = useCallback(
    (next: number) => {
      setPage(next);
      const search = buildSearch({ presetId, settings, page: next });
      window.history.pushState(
        { tgtPage: next },
        "",
        `${window.location.pathname}?${search}`,
      );
    },
    [presetId, settings],
  );

  const allPresets = useMemo(
    () => [...TRANSITION_PRESETS, ...customPresets],
    [customPresets],
  );

  const activePreset = useMemo(
    () => allPresets.find((p) => p.id === presetId) ?? TRANSITION_PRESETS[0],
    [allPresets, presetId],
  );

  const applyPreset = useCallback(
    (id: string) => {
      const preset = allPresets.find((p) => p.id === id);
      if (!preset) return;
      setPresetId(id);
      setSettings(preset.settings);
      controllerRef.current?.replay();
    },
    [allPresets],
  );

  const patch = useCallback((key: SettingKey, value: string | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reducedMotion =
    motionPreference === "system"
      ? systemReduced
      : motionPreference === "reduced";

  const hold = useMemo(() => {
    if (!inspecting) return null;
    const frame = scrubFrame(scrub);
    return { lead: frame.lead, trail: frame.trail };
  }, [inspecting, scrub]);

  const shareUrl = `${window.location.origin}${window.location.pathname}?${buildSearch(
    { presetId, settings, page },
  )}`;

  const saveCustomPreset = useCallback(
    (name: string) => {
      const id = `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      const preset: TornTransitionPreset = {
        id,
        name,
        description: "Saved in this browser from the lab controls.",
        swatch: [settings.color1, settings.color2],
        settings,
      };
      setCustomPresets((prev) => {
        const next = [...prev.filter((p) => p.id !== id), preset];
        try {
          localStorage.setItem(CUSTOM_PRESET_KEY, JSON.stringify(next));
        } catch {
          // Storage can be unavailable (private mode, quota). Keep in memory.
        }
        return next;
      });
      setPresetId(id);
    },
    [settings],
  );

  return (
    <div className="tgt-app">
      <Header>
        <Button
          size="sm"
          variant="outline"
          onClick={() => controllerRef.current?.replay()}
        >
          Replay
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSettings((prev) => randomizeSettings(prev))}
        >
          Randomise
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSettings(activePreset.settings)}
        >
          Reset
        </Button>
        <Button size="sm" onClick={() => setExportOpen(true)}>
          Export
        </Button>
      </Header>

      <div className="tgt-layout">
        <main className="tgt-main">
          <TransitionPreview
            settings={settings}
            quality={quality}
            paused={frozen}
            hold={hold}
            page={page}
            onPageChange={commitPage}
            origin={origin}
            onOriginChange={setOrigin}
            perfStore={perfStore}
            reducedMotion={reducedMotion}
            controllerRef={controllerRef}
          />

          <section className="tgt-toolbar" aria-label="Preview controls">
            <div className="tgt-toolbar__row">
              <span className="tgt-toolbar__label">Trigger</span>
              <div className="tgt-toolbar__group">
                {DEMO_PAGES.map((demo, index) => (
                  <button
                    key={demo.id}
                    type="button"
                    className="tgt-chip"
                    aria-pressed={index === page}
                    onClick={() => controllerRef.current?.go(index)}
                  >
                    {demo.label}
                  </button>
                ))}
                <button
                  type="button"
                  className="tgt-chip"
                  onClick={() => controllerRef.current?.replay()}
                >
                  Replay in place
                </button>
              </div>
            </div>

            <div className="tgt-toolbar__row">
              <span className="tgt-toolbar__label">Inspect</span>
              <div className="tgt-toolbar__group tgt-toolbar__group--inline">
                <div className="tgt-toggle">
                  <Switch
                    id="tgt-inspect"
                    checked={inspecting}
                    onCheckedChange={setInspecting}
                  />
                  <Label htmlFor="tgt-inspect">Scrub the sheet</Label>
                </div>
                <div className="tgt-toggle">
                  <Switch
                    id="tgt-freeze"
                    checked={frozen}
                    onCheckedChange={setFrozen}
                  />
                  <Label htmlFor="tgt-freeze">Freeze shader time</Label>
                </div>
              </div>
            </div>

            <div className="tgt-toolbar__row">
              <span className="tgt-toolbar__label">
                Progress
                <output className="tgt-toolbar__value">
                  {inspecting ? scrub.toFixed(2) : "live"}
                </output>
              </span>
              <Slider
                value={[scrub]}
                min={0}
                max={1}
                step={0.005}
                disabled={!inspecting}
                onValueChange={(next) =>
                  setScrub(Array.isArray(next) ? (next[0] ?? 0) : next)
                }
                aria-label="Transition progress"
              />
            </div>

            <div className="tgt-toolbar__row tgt-toolbar__row--split">
              <div className="tgt-field">
                <Label htmlFor="tgt-quality">Quality</Label>
                <Select
                  value={quality}
                  onValueChange={(v) => v && setQuality(v as QualityMode)}
                >
                  <SelectTrigger id="tgt-quality" className="tgt-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="tgt-select__content">
                    {(Object.keys(QUALITY_PROFILES) as QualityMode[]).map(
                      (mode) => (
                        <SelectItem key={mode} value={mode}>
                          {QUALITY_PROFILES[mode].label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="tgt-field">
                <Label htmlFor="tgt-motion">Motion</Label>
                <Select
                  value={motionPreference}
                  onValueChange={(v) =>
                    v && setMotionPreference(v as MotionPreference)
                  }
                >
                  <SelectTrigger id="tgt-motion" className="tgt-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="tgt-select__content">
                    <SelectItem value="system">
                      Follow system{systemReduced ? " (reduced)" : " (full)"}
                    </SelectItem>
                    <SelectItem value="full">Force full motion</SelectItem>
                    <SelectItem value="reduced">Force reduced motion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </main>

        <aside
          className="tgt-side"
          aria-label="Presets, controls and performance"
        >
          <section className="tgt-panel">
            <h2 className="tgt-panel__title">Presets</h2>
            <ul className="tgt-presets">
              {allPresets.map((preset) => (
                <li key={preset.id}>
                  <button
                    type="button"
                    className="tgt-preset"
                    aria-pressed={preset.id === presetId}
                    onClick={() => applyPreset(preset.id)}
                  >
                    <span
                      className="tgt-preset__swatch"
                      style={{
                        background: `linear-gradient(120deg, ${preset.swatch[0]}, ${preset.swatch[1]})`,
                      }}
                      aria-hidden
                    />
                    <span className="tgt-preset__text">
                      <strong>{preset.name}</strong>
                      <span>{preset.description}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="tgt-panel">
            <h2 className="tgt-panel__title">Performance</h2>
            <PerformanceReadout store={perfStore} />
          </section>

          <section className="tgt-panel tgt-panel--controls">
            <h2 className="tgt-panel__title">Controls</h2>
            <TransitionControls settings={settings} onChange={patch} />
          </section>
        </aside>
      </div>

      <TransitionExportPanel
        open={exportOpen}
        onOpenChange={setExportOpen}
        settings={settings}
        presetName={activePreset.name}
        shareUrl={shareUrl}
        onResetToPreset={() =>
          setSettings(
            findPreset(presetId)?.settings ??
              presetSettings(DEFAULT_PRESET_ID),
          )
        }
        onSaveCustomPreset={saveCustomPreset}
      />
    </div>
  );
}
