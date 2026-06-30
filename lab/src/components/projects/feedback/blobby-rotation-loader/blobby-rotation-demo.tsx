"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { BlobbyRotationLoader } from "./blobby-rotation-loader";
import { LoaderControlSlider } from "./loader-control-slider";
import {
  CALIBRATION_PRESETS,
  LOADER_COLOR_DEFAULTS,
  LOADER_DEFAULTS,
  LOADER_PARAM_RANGES,
  speedSliderToRps,
  type BlobbyLoaderColors,
} from "./constants";
import "./tokens.css";

type LoaderParams = {
  blur: number;
  corner: number;
  power: number;
  tail: number;
  chromaticAberration: number;
  speed: number;
};

export function BlobbyRotationDemo() {
  const [params, setParams] = useState<LoaderParams>({
    blur: LOADER_DEFAULTS.blur,
    corner: LOADER_DEFAULTS.corner,
    power: LOADER_DEFAULTS.power,
    tail: LOADER_DEFAULTS.tail,
    chromaticAberration: LOADER_DEFAULTS.chromaticAberration,
    speed: LOADER_DEFAULTS.speed,
  });
  const [colors, setColors] = useState<BlobbyLoaderColors>({
    core: LOADER_COLOR_DEFAULTS.core,
    aberrationWarm: LOADER_COLOR_DEFAULTS.aberrationWarm,
    aberrationCool: LOADER_COLOR_DEFAULTS.aberrationCool,
  });
  const [showColors, setShowColors] = useState(false);

  const updateParam = useCallback(
    <K extends keyof LoaderParams>(key: K, value: LoaderParams[K]) => {
      setParams((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const applyPreset = useCallback((preset: Omit<LoaderParams, "speed">) => {
    setParams((prev) => ({ ...prev, ...preset }));
  }, []);

  const speedRps = speedSliderToRps(params.speed);

  return (
    <div className="blobby-rotation-demo">
      <div className="blobby-rotation-demo__back">
        <Link href="/" className="blobby-rotation-demo__back-link" aria-label="Back to lab">
          ‹
        </Link>
      </div>

      <header className="blobby-rotation-demo__header">
        <h1 className="blobby-rotation-demo__title">Blobby Rotation</h1>
      </header>

      <div className="blobby-rotation-demo__stage">
        <BlobbyRotationLoader
          blur={params.blur}
          corner={params.corner}
          power={params.power}
          tail={params.tail}
          chromaticAberration={params.chromaticAberration}
          colors={colors}
          drawSize={LOADER_DEFAULTS.drawSize}
          speed={speedRps}
        />
      </div>

      <div className="blobby-rotation-demo__controls">
        <div className="blobby-rotation-demo__presets">
          <button
            type="button"
            className="blobby-rotation-demo__preset-btn"
            onClick={() => applyPreset(CALIBRATION_PRESETS.tightCorner)}
          >
            Preset A
          </button>
          <button
            type="button"
            className="blobby-rotation-demo__preset-btn"
            onClick={() => applyPreset(CALIBRATION_PRESETS.softBlob)}
          >
            Preset B
          </button>
          <button
            type="button"
            className="blobby-rotation-demo__preset-btn"
            onClick={() => applyPreset(CALIBRATION_PRESETS.crispBean)}
          >
            Preset C
          </button>
        </div>

        <LoaderControlSlider
          label="Blur"
          value={params.blur}
          min={LOADER_PARAM_RANGES.blur.min}
          max={LOADER_PARAM_RANGES.blur.max}
          onChange={(v) => updateParam("blur", v)}
        />
        <LoaderControlSlider
          label="Corner"
          value={params.corner}
          min={LOADER_PARAM_RANGES.corner.min}
          max={LOADER_PARAM_RANGES.corner.max}
          onChange={(v) => updateParam("corner", v)}
        />
        <LoaderControlSlider
          label="Power"
          value={params.power}
          min={LOADER_PARAM_RANGES.power.min}
          max={LOADER_PARAM_RANGES.power.max}
          step={LOADER_PARAM_RANGES.power.step}
          onChange={(v) => updateParam("power", v)}
        />
        <LoaderControlSlider
          label="C Abr"
          value={params.chromaticAberration}
          min={LOADER_PARAM_RANGES.chromaticAberration.min}
          max={LOADER_PARAM_RANGES.chromaticAberration.max}
          onChange={(v) => updateParam("chromaticAberration", v)}
        />
        <LoaderControlSlider
          label="Tail"
          value={params.tail}
          min={LOADER_PARAM_RANGES.tail.min}
          max={LOADER_PARAM_RANGES.tail.max}
          onChange={(v) => updateParam("tail", v)}
        />
        <LoaderControlSlider
          label="Speed"
          value={params.speed}
          min={LOADER_PARAM_RANGES.speed.min}
          max={LOADER_PARAM_RANGES.speed.max}
          formatValue={() => speedRps.toFixed(1)}
          onChange={(v) => updateParam("speed", v)}
        />

        <div className="blobby-rotation-demo__colors">
          <button
            type="button"
            className="blobby-rotation-demo__colors-toggle"
            onClick={() => setShowColors((v) => !v)}
            aria-expanded={showColors}
          >
            {showColors ? "− Hide colors" : "+ Color controls"}
          </button>
          {showColors ? (
            <>
              <label className="blobby-rotation-demo__color-row">
                Core
                <input
                  type="color"
                  value={colors.core ?? LOADER_COLOR_DEFAULTS.core}
                  onChange={(e) =>
                    setColors((c) => ({ ...c, core: e.target.value }))
                  }
                />
              </label>
              <label className="blobby-rotation-demo__color-row">
                Warm fringe
                <input
                  type="color"
                  value={colors.aberrationWarm ?? LOADER_COLOR_DEFAULTS.aberrationWarm}
                  onChange={(e) =>
                    setColors((c) => ({ ...c, aberrationWarm: e.target.value }))
                  }
                />
              </label>
              <label className="blobby-rotation-demo__color-row">
                Cool fringe
                <input
                  type="color"
                  value={colors.aberrationCool ?? LOADER_COLOR_DEFAULTS.aberrationCool}
                  onChange={(e) =>
                    setColors((c) => ({ ...c, aberrationCool: e.target.value }))
                  }
                />
              </label>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
