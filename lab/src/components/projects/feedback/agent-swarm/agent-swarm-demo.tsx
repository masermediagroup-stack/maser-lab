"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DemoLabBrand,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { AgentSwarm } from "./agent-swarm";
import {
  DEFAULT_PARAMS,
  DEFAULT_SEED,
  PRESETS,
  type PresetId,
} from "./constants";
import { ControlPanel } from "./demo/control-panel";
import type { AgentSwarmParams } from "./types";
import "./tokens.css";

function curatedRandom(): Partial<AgentSwarmParams> {
  const colorModes = ["white", "spectral", "cool", "warm"] as const;
  return {
    seed: String(10000 + Math.floor(Math.random() * 90000)),
    movementDistance: 0.14 + Math.random() * 0.5,
    pathCurvature: 0.18 + Math.random() * 0.28,
    stagger: 0.06 + Math.random() * 0.24,
    activeAgentPercentage: 0.25 + Math.random() * 0.3,
    colorMode: colorModes[Math.floor(Math.random() * colorModes.length)],
    glowIntensity: 0.75 + Math.random() * 0.5,
  };
}

export function AgentSwarmDemo() {
  const [params, setParams] = useState<AgentSwarmParams>({ ...DEFAULT_PARAMS });
  const [seedDraft, setSeedDraft] = useState(DEFAULT_PARAMS.seed);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetId | null>("spectral");

  const onChange = useCallback((patch: Partial<AgentSwarmParams>) => {
    setActivePreset(null);
    if (patch.seed !== undefined) setSeedDraft(String(patch.seed));
    setParams((prev) => ({ ...prev, ...patch }));
  }, []);

  const commitSeed = useCallback(() => {
    const next = seedDraft.trim() || DEFAULT_SEED;
    setParams((prev) => ({ ...prev, seed: next }));
    setSeedDraft(next);
    setActivePreset(null);
  }, [seedDraft]);

  const applyPreset = useCallback((id: PresetId) => {
    setActivePreset(id);
    setParams((prev) => ({ ...prev, ...PRESETS[id].patch }));
  }, []);

  const handleReset = useCallback(() => {
    setParams({ ...DEFAULT_PARAMS });
    setSeedDraft(DEFAULT_PARAMS.seed);
    setActivePreset("spectral");
  }, []);

  const handleRandomize = useCallback(() => {
    const patch = curatedRandom();
    setActivePreset(null);
    setParams((prev) => ({ ...prev, ...patch }));
    if (patch.seed) setSeedDraft(patch.seed);
  }, []);

  const handleRandomizeSeed = useCallback(() => {
    const seed = String(10000 + Math.floor(Math.random() * 90000));
    setActivePreset(null);
    setSeedDraft(seed);
    setParams((prev) => ({ ...prev, seed }));
  }, []);

  const handleResetSeed = useCallback(() => {
    setSeedDraft(DEFAULT_SEED);
    setParams((prev) => ({ ...prev, seed: DEFAULT_SEED }));
  }, []);

  const stageStyle = useMemo(
    () =>
      params.background === "transparent"
        ? { background: "radial-gradient(circle at 50% 40%, #1a1a22, #07070a 70%)" }
        : undefined,
    [params.background],
  );

  return (
    <div className="agent-swarm-demo">
      <header className="agent-swarm-demo__chrome">
        <DemoLabBrand />
        <div className="agent-swarm-demo__heading">
          <h1>Agent Swarm</h1>
          <p>Seeded multi-agent motion primitive</p>
        </div>
        <ReducedMotionToggle
          enabled={reducedMotion}
          onToggle={() => setReducedMotion((value) => !value)}
        />
      </header>

      <div className="agent-swarm-demo__stage" style={stageStyle}>
        <AgentSwarm
          params={params}
          reducedMotion={reducedMotion}
          aria-label="Agent swarm playground"
        />
      </div>

      <div className="agent-swarm-demo__controls">
        <ControlPanel
          params={params}
          seedDraft={seedDraft}
          onSeedDraft={setSeedDraft}
          onCommitSeed={commitSeed}
          onChange={onChange}
          onPreset={applyPreset}
          onRandomize={handleRandomize}
          onRandomizeSeed={handleRandomizeSeed}
          onReset={handleReset}
          onResetSeed={handleResetSeed}
          activePreset={activePreset}
        />
      </div>
    </div>
  );
}
