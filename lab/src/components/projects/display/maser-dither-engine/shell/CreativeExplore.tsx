"use client";

import { MATERIAL_PALETTES, applyPaletteToConfig } from "../engine/color/palettes";
import type { ColorMaterialConfig } from "../engine/color/types";
import { ANIMATION_MODES, defaultModeParams } from "../engine/animation/modes/catalog";
import type { AnimationEngineConfig } from "../engine/animation/types";
import { LIGHTING_PRESETS } from "../engine/lighting";
import type { LightShapeConfig } from "../engine/lighting/types";
import { PROCEDURAL_MATERIALS, applyMaterialDefaults } from "../engine/material/catalog";
import {
  createDefaultLayers,
  DEFAULT_MATERIAL_PARAMS,
  type EngineMaterialId,
  type MaterialEngineConfig,
} from "../engine/material/types";
import { cn } from "@/lib/utils";

export type CreativeLocks = {
  color: boolean;
  light: boolean;
  animation: boolean;
  material: boolean;
};

type CreativeExploreProps = {
  locks: CreativeLocks;
  onLocksChange: (locks: CreativeLocks) => void;
  color: ColorMaterialConfig;
  onColor: (next: ColorMaterialConfig) => void;
  light: LightShapeConfig;
  onLight: (next: LightShapeConfig) => void;
  animation: AnimationEngineConfig;
  onAnimation: (next: AnimationEngineConfig) => void;
  material: MaterialEngineConfig;
  onMaterial: (next: MaterialEngineConfig) => void;
};

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/**
 * Creative randomization with per-section locks.
 */
export function CreativeExplore({
  locks,
  onLocksChange,
  color,
  onColor,
  light,
  onLight,
  animation,
  onAnimation,
  material,
  onMaterial,
}: CreativeExploreProps) {
  const toggle = (key: keyof CreativeLocks) => {
    onLocksChange({ ...locks, [key]: !locks[key] });
  };

  const randomizePalette = () => {
    if (locks.color) return;
    const p = pick(MATERIAL_PALETTES);
    onColor(applyPaletteToConfig(p.id, color));
  };

  const randomizeLighting = () => {
    if (locks.light) return;
    const p = pick(LIGHTING_PRESETS);
    onLight({ ...light, ...p.config });
  };

  const randomizeAnimation = () => {
    if (locks.animation) return;
    const m = pick(ANIMATION_MODES);
    onAnimation({
      ...animation,
      modeId: m.id,
      modeParams: defaultModeParams(m.id),
      blendDuration: 0.35,
    });
  };

  const randomizeMaterial = () => {
    if (locks.material) return;
    const m = pick(PROCEDURAL_MATERIALS.filter((x) => x.status === "ready"));
    const id = m.id as EngineMaterialId;
    onMaterial({
      ...material,
      materialId: id,
      params: {
        ...DEFAULT_MATERIAL_PARAMS,
        ...applyMaterialDefaults(id),
      },
      layers: createDefaultLayers(id),
    });
  };

  const randomizeScene = () => {
    randomizePalette();
    randomizeLighting();
    randomizeAnimation();
    randomizeMaterial();
  };

  return (
    <div className="mde-creative">
      <span className="mde-field__label">Creative explore</span>
      <p className="mde-field__hint">
        Randomize sections independently. Locked sections stay put.
      </p>
      <div className="mde-creative__locks" role="group" aria-label="Locks">
        {(
          [
            ["color", "Colors"],
            ["light", "Lighting"],
            ["animation", "Animation"],
            ["material", "Material"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={cn("mde-chip", locks[key] && "mde-chip--active")}
            aria-pressed={locks[key]}
            onClick={() => toggle(key)}
            title={locks[key] ? "Unlock" : "Lock"}
          >
            {locks[key] ? "Locked · " : ""}
            {label}
          </button>
        ))}
      </div>
      <div className="mde-creative__actions">
        <button type="button" className="mde-btn" onClick={randomizePalette}>
          Randomize palette
        </button>
        <button type="button" className="mde-btn" onClick={randomizeLighting}>
          Randomize lighting
        </button>
        <button type="button" className="mde-btn" onClick={randomizeAnimation}>
          Randomize animation
        </button>
        <button type="button" className="mde-btn" onClick={randomizeMaterial}>
          Randomize material
        </button>
        <button
          type="button"
          className="mde-btn mde-btn--primary"
          onClick={randomizeScene}
        >
          Randomize scene
        </button>
      </div>
      <div className="mde-creative__palettes" role="listbox" aria-label="Quick palettes">
        {MATERIAL_PALETTES.slice(0, 10).map((p) => (
          <button
            key={p.id}
            type="button"
            role="option"
            className={cn(
              "mde-chip",
              color.paletteId === p.id && "mde-chip--active",
            )}
            aria-selected={color.paletteId === p.id}
            disabled={locks.color}
            onClick={() => onColor(applyPaletteToConfig(p.id, color))}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
