"use client";

import { useCallback, useState } from "react";
import {
  DemoBackButton,
  DemoControlMenu,
  LabButton,
  LabColor,
  LabControlGroup,
  LabRange,
} from "@/components/lab/demo-chrome";
import { BlobbyRotationLoader } from "./blobby-rotation-loader";
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
      <DemoControlMenu>
        <DemoBackButton />
        <p className="font-mono text-xs text-[var(--lab-text-secondary)]">
          Blobby Rotation
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Shape presets">
          <LabButton
            type="button"
            variant="outline"
            onClick={() => applyPreset(CALIBRATION_PRESETS.tightCorner)}
          >
            Preset A
          </LabButton>
          <LabButton
            type="button"
            variant="outline"
            onClick={() => applyPreset(CALIBRATION_PRESETS.softBlob)}
          >
            Preset B
          </LabButton>
          <LabButton
            type="button"
            variant="outline"
            onClick={() => applyPreset(CALIBRATION_PRESETS.crispBean)}
          >
            Preset C
          </LabButton>
        </div>
        <LabControlGroup label="Shape">
          <LabRange
            id="blobby-blur"
            label="Blur"
            min={LOADER_PARAM_RANGES.blur.min}
            max={LOADER_PARAM_RANGES.blur.max}
            step={LOADER_PARAM_RANGES.blur.step}
            value={params.blur}
            display={String(params.blur)}
            onChange={(v) => updateParam("blur", v)}
          />
          <LabRange
            id="blobby-corner"
            label="Corner"
            min={LOADER_PARAM_RANGES.corner.min}
            max={LOADER_PARAM_RANGES.corner.max}
            step={LOADER_PARAM_RANGES.corner.step}
            value={params.corner}
            display={String(params.corner)}
            onChange={(v) => updateParam("corner", v)}
          />
          <LabRange
            id="blobby-power"
            label="Power"
            min={LOADER_PARAM_RANGES.power.min}
            max={LOADER_PARAM_RANGES.power.max}
            step={LOADER_PARAM_RANGES.power.step}
            value={params.power}
            display={String(params.power)}
            onChange={(v) => updateParam("power", v)}
          />
          <LabRange
            id="blobby-abr"
            label="C Abr"
            min={LOADER_PARAM_RANGES.chromaticAberration.min}
            max={LOADER_PARAM_RANGES.chromaticAberration.max}
            step={LOADER_PARAM_RANGES.chromaticAberration.step}
            value={params.chromaticAberration}
            display={String(params.chromaticAberration)}
            onChange={(v) => updateParam("chromaticAberration", v)}
          />
          <LabRange
            id="blobby-tail"
            label="Tail"
            min={LOADER_PARAM_RANGES.tail.min}
            max={LOADER_PARAM_RANGES.tail.max}
            step={LOADER_PARAM_RANGES.tail.step}
            value={params.tail}
            display={String(params.tail)}
            onChange={(v) => updateParam("tail", v)}
          />
          <LabRange
            id="blobby-speed"
            label="Speed"
            min={LOADER_PARAM_RANGES.speed.min}
            max={LOADER_PARAM_RANGES.speed.max}
            step={LOADER_PARAM_RANGES.speed.step}
            value={params.speed}
            display={`${speedRps.toFixed(1)} rps`}
            onChange={(v) => updateParam("speed", v)}
          />
        </LabControlGroup>
        <LabControlGroup label="Color">
          <LabButton
            type="button"
            variant={showColors ? "accent" : "ghost"}
            aria-expanded={showColors}
            onClick={() => setShowColors((v) => !v)}
          >
            {showColors ? "Hide colors" : "Color controls"}
          </LabButton>
          {showColors ? (
            <>
              <LabColor
                id="blobby-core"
                label="Core"
                value={colors.core ?? LOADER_COLOR_DEFAULTS.core}
                onChange={(core) => setColors((c) => ({ ...c, core }))}
              />
              <LabColor
                id="blobby-warm"
                label="Warm fringe"
                value={colors.aberrationWarm ?? LOADER_COLOR_DEFAULTS.aberrationWarm}
                onChange={(aberrationWarm) =>
                  setColors((c) => ({ ...c, aberrationWarm }))
                }
              />
              <LabColor
                id="blobby-cool"
                label="Cool fringe"
                value={colors.aberrationCool ?? LOADER_COLOR_DEFAULTS.aberrationCool}
                onChange={(aberrationCool) =>
                  setColors((c) => ({ ...c, aberrationCool }))
                }
              />
            </>
          ) : null}
        </LabControlGroup>
      </DemoControlMenu>

      <div className="blobby-rotation-demo__stage lab-demo-inset">
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
    </div>
  );
}
