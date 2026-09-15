"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DemoBackButton,
  DemoControlMenu,
  LabButton,
  LabControlGroup,
  LabRange,
  LabSelect,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { DitherBadge } from "./components/adapters/DitherBadge";
import { DitherButton } from "./components/adapters/DitherButton";
import { DitherCard } from "./components/adapters/DitherCard";
import { SurfaceCanvas } from "./react/SurfaceCanvas";
import { DitherEngineApp } from "./shell/DitherEngineApp";
import { MONOCHROME_DEFAULTS, DITHER_SIZES } from "./constants";
import { applyPaletteToConfig } from "./engine/color";
import { DEFAULT_COLOR_MATERIAL } from "./engine/color/types";
import { DEFAULT_ANIMATION_CONFIG } from "./engine/animation";
import { DEFAULT_INTERACTION_CONFIG } from "./engine/interaction";
import { DEFAULT_LIGHT_SHAPE } from "./engine/lighting";
import { DITHER_ALGORITHMS, DEFAULT_DITHER_CONFIG, type DitherAlgorithmId } from "./engine/dither";
import {
  createDefaultLayers,
  type EngineMaterialId,
} from "./engine/material/types";
import { applyMaterialDefaults } from "./engine/material/catalog";
import { MaterialCatalog } from "./materials/catalog";
import type { DitherSize } from "./types";
import "./tokens.css";
import "./maser-dither-engine-demo.css";

type CutAdapter = "field" | "card" | "button" | "badge";
type Workspace = "cut" | "studio";

const PALETTE_OPTIONS = [
  { value: "graphite", label: "Graphite" },
  { value: "paper", label: "Paper" },
  { value: "aurora", label: "Aurora" },
  { value: "terminal", label: "Terminal" },
  { value: "chrome", label: "Chrome" },
] as const;

const ADAPTER_OPTIONS: { value: CutAdapter; label: string }[] = [
  { value: "field", label: "Full field" },
  { value: "card", label: "Card" },
  { value: "button", label: "Button" },
  { value: "badge", label: "Badge" },
];

function useOsReducedMotion(): boolean {
  const [os, setOs] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setOs(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return os;
}

function materialConfig(id: EngineMaterialId) {
  return {
    materialId: id,
    params: applyMaterialDefaults(id),
    layers: createDefaultLayers(id),
    lowQuality: false,
  };
}

export function MaserDitherEngineDemo() {
  const osReduced = useOsReducedMotion();
  const [forceReduced, setForceReduced] = useState(false);
  const reducedMotion = osReduced || forceReduced;

  const [workspace, setWorkspace] = useState<Workspace>("cut");
  const [adapter, setAdapter] = useState<CutAdapter>("field");
  const [materialId, setMaterialId] = useState<EngineMaterialId>("paper");
  const [algorithm, setAlgorithm] = useState<DitherAlgorithmId>("bayer");
  const [matrixSize, setMatrixSize] = useState<DitherSize>(8);
  const [paletteId, setPaletteId] = useState<string>("graphite");
  const [grain, setGrain] = useState(MONOCHROME_DEFAULTS.grainAmount);
  const [bloom, setBloom] = useState(MONOCHROME_DEFAULTS.bloom);
  const [patternScale, setPatternScale] = useState(1);

  const params = useMemo(
    () => ({
      ...MONOCHROME_DEFAULTS,
      ditherSize: matrixSize,
      grainAmount: grain,
      bloom,
    }),
    [matrixSize, grain, bloom],
  );

  const dither = useMemo(
    () => ({
      ...DEFAULT_DITHER_CONFIG,
      algorithm,
      matrixSize,
      patternScale,
    }),
    [algorithm, matrixSize, patternScale],
  );

  const material = useMemo(() => materialConfig(materialId), [materialId]);

  const color = useMemo(
    () => applyPaletteToConfig(paletteId, DEFAULT_COLOR_MATERIAL),
    [paletteId],
  );

  const animation = useMemo(
    () => ({
      ...DEFAULT_ANIMATION_CONFIG,
      modeId: "wave" as const,
    }),
    [],
  );

  const interaction = DEFAULT_INTERACTION_CONFIG;
  const light = DEFAULT_LIGHT_SHAPE;

  const materials = MaterialCatalog.ready();

  const reset = useCallback(() => {
    setAdapter("field");
    setMaterialId("paper");
    setAlgorithm("bayer");
    setMatrixSize(8);
    setPaletteId("graphite");
    setGrain(MONOCHROME_DEFAULTS.grainAmount);
    setBloom(MONOCHROME_DEFAULTS.bloom);
    setPatternScale(1);
    setWorkspace("cut");
  }, []);

  const adapterProps = {
    params,
    animation,
    interaction,
    color,
    light,
    dither,
    material,
    reducedMotion,
  };

  return (
    <>
      <DemoControlMenu>
        <DemoBackButton />
        <div>
          <p className="lab-type-title text-[var(--lab-text-primary)]">
            Maser dither engine
          </p>
          <p className="lab-type-caption mt-1 text-[var(--lab-text-secondary)]">
            Shared WebGL2 dither pipeline — not Three.js. Knobs stay in this
            dock; the canvas is the product.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <LabButton type="button" variant="outline" onClick={reset}>
            Reset
          </LabButton>
          <LabButton
            type="button"
            variant={workspace === "studio" ? "accent" : "outline"}
            aria-pressed={workspace === "studio"}
            onClick={() =>
              setWorkspace((w) => (w === "cut" ? "studio" : "cut"))
            }
          >
            {workspace === "studio" ? "Close studio" : "Open studio"}
          </LabButton>
          <ReducedMotionToggle
            enabled={forceReduced}
            onToggle={() => setForceReduced((v) => !v)}
          />
        </div>
        <LabControlGroup label="Surface">
          <LabSelect
            id="mde-adapter"
            label="Adapter"
            value={adapter}
            options={ADAPTER_OPTIONS}
            onChange={(value) => setAdapter(value as CutAdapter)}
          />
          <LabSelect
            id="mde-material"
            label="Material"
            value={materialId}
            options={materials.map((m) => ({ value: m.id, label: m.label }))}
            onChange={(value) => setMaterialId(value as EngineMaterialId)}
          />
          <LabSelect
            id="mde-palette"
            label="Palette"
            value={paletteId}
            options={PALETTE_OPTIONS.map((p) => ({ ...p }))}
            onChange={setPaletteId}
          />
        </LabControlGroup>
        <LabControlGroup label="Dither">
          <LabSelect
            id="mde-algorithm"
            label="Algorithm"
            value={algorithm}
            options={DITHER_ALGORITHMS.map((a) => ({
              value: a.id,
              label: a.label,
            }))}
            onChange={(value) => setAlgorithm(value as DitherAlgorithmId)}
          />
          <LabSelect
            id="mde-matrix"
            label="Matrix size"
            value={String(matrixSize)}
            options={DITHER_SIZES.map((size) => ({
              value: String(size),
              label: `${size}×${size}`,
            }))}
            onChange={(value) => setMatrixSize(Number(value) as DitherSize)}
          />
          <LabRange
            id="mde-pattern-scale"
            label="Pattern scale"
            value={patternScale}
            min={0.35}
            max={2.5}
            step={0.01}
            display={patternScale.toFixed(2)}
            onChange={setPatternScale}
          />
          <LabRange
            id="mde-grain"
            label="Grain"
            value={grain}
            min={0}
            max={0.5}
            step={0.01}
            display={grain.toFixed(2)}
            onChange={setGrain}
          />
          <LabRange
            id="mde-bloom"
            label="Bloom"
            value={bloom}
            min={0}
            max={1}
            step={0.01}
            display={bloom.toFixed(2)}
            onChange={setBloom}
          />
        </LabControlGroup>
        <p className="lab-type-caption text-[var(--lab-text-muted)]">
          Engine {params.ditherSize} matrix · DPR capped at 2 · rAF pauses
          offscreen. Studio is lab-only authoring, not the product barrel.
        </p>
      </DemoControlMenu>

      {workspace === "studio" ? (
        <div
          className="lab-demo-field mde-lab-cut mde-lab-cut--studio"
          aria-label="Maser dither engine studio"
        >
          <DitherEngineApp forceReducedMotion={forceReduced} embedded />
        </div>
      ) : (
        <section
          className="lab-demo-field mde-lab-cut"
          aria-label="Maser dither engine"
        >
          {adapter === "field" ? (
            <SurfaceCanvas
              className="mde-lab-cut__canvas"
              params={params}
              animation={animation}
              interaction={interaction}
              color={color}
              light={light}
              dither={dither}
              material={material}
              reducedMotion={reducedMotion}
              aria-label="Live dither field"
            />
          ) : (
            <div className="mde-lab-cut__stage">
              {adapter === "card" ? <DitherCard {...adapterProps} /> : null}
              {adapter === "button" ? <DitherButton {...adapterProps} /> : null}
              {adapter === "badge" ? <DitherBadge {...adapterProps} /> : null}
            </div>
          )}
        </section>
      )}
    </>
  );
}
