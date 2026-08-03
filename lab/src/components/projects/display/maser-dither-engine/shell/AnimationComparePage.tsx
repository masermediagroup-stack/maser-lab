"use client";

import { useMemo, useState } from "react";
import { SurfaceCanvas } from "../react/SurfaceCanvas";
import { useAnimationThumbCache } from "../react/useLiveThumbCache";
import { ANIMATION_MODES } from "../engine/animation/modes/catalog";
import type { AnimationModeId } from "../engine/animation/types";
import { DEFAULT_ANIMATION_CONFIG } from "../engine/animation/types";
import { DEFAULT_COLOR_MATERIAL } from "../engine/color/types";
import { DEFAULT_LIGHT_SHAPE } from "../engine/lighting";
import { DEFAULT_DITHER_CONFIG } from "../engine/dither";
import {
  DEFAULT_MATERIAL_CONFIG,
  DEFAULT_MATERIAL_PARAMS,
  createDefaultLayers,
} from "../engine/material";
import { applyMaterialDefaults } from "../engine/material/catalog";
import { MONOCHROME_DEFAULTS } from "../constants";
import type { AppRoute } from "../types";
import { cn } from "@/lib/utils";

type AnimationComparePageProps = {
  onNavigate: (route: AppRoute) => void;
};

/**
 * Animation identity board — identical material / palette / light.
 * Grid uses shared blit thumbs (one WebGL context); one live detail canvas.
 */
export function AnimationComparePage({ onNavigate }: AnimationComparePageProps) {
  const [selected, setSelected] = useState<AnimationModeId>("spiral");
  const modeIds = useMemo(
    () => ANIMATION_MODES.map((m) => m.id) as AnimationModeId[],
    [],
  );

  const scene = useMemo(
    () => ({
      params: {
        ...MONOCHROME_DEFAULTS,
        contrast: 1.3,
        bloom: 0.4,
        grainAmount: 0.06,
      },
      color: {
        ...DEFAULT_COLOR_MATERIAL,
        colorEnabled: true,
        paletteId: "aurora",
      },
      light: { ...DEFAULT_LIGHT_SHAPE },
      dither: { ...DEFAULT_DITHER_CONFIG, algorithm: "bayer" as const },
      animation: { ...DEFAULT_ANIMATION_CONFIG, blendDuration: 0 },
    }),
    [],
  );

  const thumbs = useAnimationThumbCache(modeIds, scene, "anim-compare-v2");

  const material = useMemo(
    () => ({
      ...DEFAULT_MATERIAL_CONFIG,
      materialId: "paper" as const,
      params: {
        ...DEFAULT_MATERIAL_PARAMS,
        ...applyMaterialDefaults("paper"),
      },
      layers: createDefaultLayers("paper"),
    }),
    [],
  );

  const active = ANIMATION_MODES.find((m) => m.id === selected)!;

  return (
    <div className="mde-page mde-anim-compare">
      <header className="mde-page__header">
        <h1>Animation compare</h1>
        <p>
          Every mode captured with the same Paper material, Aurora palette,
          lighting, and dither — differences come from procedural math only.
        </p>
        <div className="mde-preset-row">
          <button
            type="button"
            className="mde-btn"
            onClick={() => onNavigate({ view: "materials" })}
          >
            Materials
          </button>
          <button
            type="button"
            className="mde-btn"
            onClick={() => onNavigate({ view: "component", id: "card" })}
          >
            Open playground
          </button>
        </div>
      </header>

      <div className="mde-anim-compare__layout">
        <div className="mde-anim-compare__grid">
          {ANIMATION_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={cn(
                "mde-anim-compare__card",
                selected === m.id && "mde-anim-compare__card--active",
              )}
              aria-pressed={selected === m.id}
              onClick={() => setSelected(m.id)}
            >
              <div className="mde-anim-compare__preview" aria-hidden>
                {thumbs[m.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- blit data URL
                  <img src={thumbs[m.id]} alt="" />
                ) : (
                  <div className="mde-mat-thumb__swatch mde-mat-thumb__swatch--loading" />
                )}
              </div>
              <h2>{m.label}</h2>
              <p className="mde-anim-compare__purpose">{m.purpose}</p>
            </button>
          ))}
        </div>

        <aside className="mde-anim-compare__detail" aria-label="Live animation">
          <div className="mde-anim-compare__live mde-anim-compare__live--detail">
            <SurfaceCanvas
              params={scene.params}
              color={scene.color}
              light={scene.light}
              dither={scene.dither}
              material={material}
              animation={{
                modeId: active.id,
                modeParams: Object.fromEntries(
                  active.controls.map((c) => [c.key, c.defaultValue]),
                ),
                blendDuration: 0,
                timeline: {
                  ...DEFAULT_ANIMATION_CONFIG.timeline,
                  playing: true,
                },
              }}
              aria-label={`${active.label} live compare`}
              reducedMotion={false}
            />
          </div>
          <h2>{active.label}</h2>
          <p className="mde-anim-compare__purpose">{active.purpose}</p>
          <p className="mde-field__hint">{active.approach}</p>
          <ul className="mde-anim-compare__controls">
            {active.controls.map((c) => (
              <li key={c.key}>
                {c.label} · default {c.defaultValue}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mde-btn"
            onClick={() => onNavigate({ view: "component", id: "card" })}
          >
            Try in playground
          </button>
        </aside>
      </div>
    </div>
  );
}
