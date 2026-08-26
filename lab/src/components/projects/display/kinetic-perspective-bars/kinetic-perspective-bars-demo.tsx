"use client";

import { useCallback, useState } from "react";
import {
  DemoBackButton,
  DemoControlMenu,
  LabButton,
  LabColor,
  LabControlGroup,
  LabRange,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { ExportCodeDrawer } from "./components/ExportCodeDrawer";
import { KineticBarsApp } from "./KineticBarsApp";
import {
  DEFAULT_PARAMS,
  MODE_LABELS,
  MODE_ORDER,
  PARAM_RANGES,
  PROJECT_DESCRIPTION,
  PROJECT_TITLE,
} from "./lib/constants";
import type { KineticBarsParams, MotionMode } from "./types/kinetic-bars";
import "./tokens.css";

export function KineticPerspectiveBarsDemo() {
  const [params, setParams] = useState<KineticBarsParams>(DEFAULT_PARAMS);
  const [exportOpen, setExportOpen] = useState(false);
  const [forceReduced, setForceReduced] = useState(false);

  const patch = useCallback((partial: Partial<KineticBarsParams>) => {
    setParams((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleReset = useCallback(() => {
    setParams((prev) => ({
      ...DEFAULT_PARAMS,
      animationMode: prev.animationMode,
    }));
    window.dispatchEvent(new Event("kinetic-bars:reset"));
  }, []);

  return (
    <>
      <DemoControlMenu>
        <DemoBackButton />
        <div>
          <p className="font-mono text-xs text-[var(--lab-text-secondary)]">
            {PROJECT_TITLE}
          </p>
          <p className="mt-1 font-mono text-[10px] leading-relaxed text-[var(--lab-text-muted)]">
            {PROJECT_DESCRIPTION}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <LabButton
            type="button"
            variant="outline"
            aria-label={params.paused ? "Play animation" : "Pause animation"}
            onClick={() => patch({ paused: !params.paused })}
          >
            {params.paused ? "Play" : "Pause"}
          </LabButton>
          <LabButton type="button" variant="outline" onClick={handleReset}>
            Reset
          </LabButton>
          <LabButton type="button" variant="outline" onClick={() => setExportOpen(true)}>
            Export
          </LabButton>
          <ReducedMotionToggle
            enabled={forceReduced}
            onToggle={() => {
              setForceReduced((v) => !v);
              patch({ reducedMotionPreview: !forceReduced });
            }}
          />
        </div>
        <LabControlGroup label="Motion mode">
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Animation mode">
            {MODE_ORDER.map((mode) => (
              <LabButton
                key={mode}
                type="button"
                variant={params.animationMode === mode ? "accent" : "ghost"}
                aria-pressed={params.animationMode === mode}
                onClick={() => patch({ animationMode: mode as MotionMode })}
              >
                {MODE_LABELS[mode]}
              </LabButton>
            ))}
          </div>
        </LabControlGroup>
        <LabControlGroup label="Formation">
          <LabRange
            id="kb-count"
            label="Bar count"
            min={PARAM_RANGES.barCount.min}
            max={PARAM_RANGES.barCount.max}
            step={PARAM_RANGES.barCount.step}
            value={params.barCount}
            display={String(params.barCount)}
            onChange={(barCount) => patch({ barCount })}
          />
          <LabRange
            id="kb-width"
            label="Bar width"
            min={PARAM_RANGES.barWidth.min}
            max={PARAM_RANGES.barWidth.max}
            step={PARAM_RANGES.barWidth.step}
            value={params.barWidth}
            display={params.barWidth.toFixed(2)}
            onChange={(barWidth) => patch({ barWidth })}
          />
          <LabRange
            id="kb-thickness"
            label="Thickness"
            min={PARAM_RANGES.barThickness.min}
            max={PARAM_RANGES.barThickness.max}
            step={PARAM_RANGES.barThickness.step}
            value={params.barThickness}
            display={params.barThickness.toFixed(3)}
            onChange={(barThickness) => patch({ barThickness })}
          />
          <LabRange
            id="kb-gap"
            label="Gap"
            min={PARAM_RANGES.gap.min}
            max={PARAM_RANGES.gap.max}
            step={PARAM_RANGES.gap.step}
            value={params.gap}
            display={params.gap.toFixed(3)}
            onChange={(gap) => patch({ gap })}
          />
          <LabRange
            id="kb-min-h"
            label="Min height"
            min={PARAM_RANGES.minHeight.min}
            max={PARAM_RANGES.minHeight.max}
            step={PARAM_RANGES.minHeight.step}
            value={params.minHeight}
            display={params.minHeight.toFixed(2)}
            onChange={(minHeight) => patch({ minHeight })}
          />
          <LabRange
            id="kb-max-h"
            label="Max height"
            min={PARAM_RANGES.maxHeight.min}
            max={PARAM_RANGES.maxHeight.max}
            step={PARAM_RANGES.maxHeight.step}
            value={params.maxHeight}
            display={params.maxHeight.toFixed(2)}
            onChange={(maxHeight) => patch({ maxHeight })}
          />
          <LabRange
            id="kb-radius"
            label="Corner radius"
            min={PARAM_RANGES.cornerRadius.min}
            max={PARAM_RANGES.cornerRadius.max}
            step={PARAM_RANGES.cornerRadius.step}
            value={params.cornerRadius}
            display={params.cornerRadius.toFixed(3)}
            onChange={(cornerRadius) => patch({ cornerRadius })}
          />
          <LabRange
            id="kb-angle"
            label="Perspective"
            min={-1.2}
            max={0.2}
            step={0.01}
            value={params.perspectiveAngle}
            display={params.perspectiveAngle.toFixed(2)}
            onChange={(perspectiveAngle) =>
              patch({
                perspectiveAngle,
                groupRotation: [
                  DEFAULT_PARAMS.groupRotation[0],
                  perspectiveAngle,
                  DEFAULT_PARAMS.groupRotation[2],
                ],
              })
            }
          />
          <LabRange
            id="kb-scale"
            label="Group scale"
            min={PARAM_RANGES.groupScale.min}
            max={PARAM_RANGES.groupScale.max}
            step={PARAM_RANGES.groupScale.step}
            value={params.groupScale}
            display={params.groupScale.toFixed(2)}
            onChange={(groupScale) => patch({ groupScale })}
          />
        </LabControlGroup>
        <LabControlGroup label="Motion">
          <LabRange
            id="kb-lift"
            label="Lift"
            min={PARAM_RANGES.liftAmplitude.min}
            max={PARAM_RANGES.liftAmplitude.max}
            step={PARAM_RANGES.liftAmplitude.step}
            value={params.liftAmplitude}
            display={params.liftAmplitude.toFixed(2)}
            onChange={(liftAmplitude) => patch({ liftAmplitude })}
          />
          <LabRange
            id="kb-speed"
            label="Wave speed"
            min={PARAM_RANGES.waveSpeed.min}
            max={PARAM_RANGES.waveSpeed.max}
            step={PARAM_RANGES.waveSpeed.step}
            value={params.waveSpeed}
            display={params.waveSpeed.toFixed(2)}
            onChange={(waveSpeed) => patch({ waveSpeed })}
          />
          <LabRange
            id="kb-phase"
            label="Phase"
            min={PARAM_RANGES.phaseOffset.min}
            max={PARAM_RANGES.phaseOffset.max}
            step={PARAM_RANGES.phaseOffset.step}
            value={params.phaseOffset}
            display={params.phaseOffset.toFixed(2)}
            onChange={(phaseOffset) => patch({ phaseOffset })}
          />
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Wave direction">
            <LabButton
              type="button"
              variant={params.waveDirection === 1 ? "accent" : "ghost"}
              aria-pressed={params.waveDirection === 1}
              onClick={() => patch({ waveDirection: 1 })}
            >
              Forward
            </LabButton>
            <LabButton
              type="button"
              variant={params.waveDirection === -1 ? "accent" : "ghost"}
              aria-pressed={params.waveDirection === -1}
              onClick={() => patch({ waveDirection: -1 })}
            >
              Reverse
            </LabButton>
          </div>
          <LabButton
            type="button"
            variant={params.cameraDrift ? "accent" : "ghost"}
            aria-pressed={params.cameraDrift}
            onClick={() => patch({ cameraDrift: !params.cameraDrift })}
          >
            Camera drift: {params.cameraDrift ? "on" : "off"}
          </LabButton>
        </LabControlGroup>
        <LabControlGroup label="Interaction">
          <LabRange
            id="kb-hover"
            label="Hover strength"
            min={PARAM_RANGES.hoverStrength.min}
            max={PARAM_RANGES.hoverStrength.max}
            step={PARAM_RANGES.hoverStrength.step}
            value={params.hoverStrength}
            display={params.hoverStrength.toFixed(2)}
            onChange={(hoverStrength) => patch({ hoverStrength })}
          />
          <LabRange
            id="kb-hover-r"
            label="Hover radius"
            min={PARAM_RANGES.hoverRadius.min}
            max={PARAM_RANGES.hoverRadius.max}
            step={PARAM_RANGES.hoverRadius.step}
            value={params.hoverRadius}
            display={params.hoverRadius.toFixed(1)}
            onChange={(hoverRadius) => patch({ hoverRadius })}
          />
          <LabRange
            id="kb-ripple"
            label="Ripple strength"
            min={PARAM_RANGES.rippleStrength.min}
            max={PARAM_RANGES.rippleStrength.max}
            step={PARAM_RANGES.rippleStrength.step}
            value={params.rippleStrength}
            display={params.rippleStrength.toFixed(2)}
            onChange={(rippleStrength) => patch({ rippleStrength })}
          />
          <LabRange
            id="kb-ripple-s"
            label="Ripple speed"
            min={PARAM_RANGES.rippleSpeed.min}
            max={PARAM_RANGES.rippleSpeed.max}
            step={PARAM_RANGES.rippleSpeed.step}
            value={params.rippleSpeed}
            display={params.rippleSpeed.toFixed(1)}
            onChange={(rippleSpeed) => patch({ rippleSpeed })}
          />
          <LabRange
            id="kb-ripple-d"
            label="Ripple decay"
            min={PARAM_RANGES.rippleDecay.min}
            max={PARAM_RANGES.rippleDecay.max}
            step={PARAM_RANGES.rippleDecay.step}
            value={params.rippleDecay}
            display={params.rippleDecay.toFixed(2)}
            onChange={(rippleDecay) => patch({ rippleDecay })}
          />
        </LabControlGroup>
        <LabControlGroup label="Look">
          <LabRange
            id="kb-edge"
            label="Edge brightness"
            min={PARAM_RANGES.edgeBrightness.min}
            max={PARAM_RANGES.edgeBrightness.max}
            step={PARAM_RANGES.edgeBrightness.step}
            value={params.edgeBrightness}
            display={params.edgeBrightness.toFixed(2)}
            onChange={(edgeBrightness) => patch({ edgeBrightness })}
          />
          <LabRange
            id="kb-fill"
            label="Fill opacity"
            min={PARAM_RANGES.fillOpacity.min}
            max={PARAM_RANGES.fillOpacity.max}
            step={PARAM_RANGES.fillOpacity.step}
            value={params.fillOpacity}
            display={params.fillOpacity.toFixed(2)}
            onChange={(fillOpacity) => patch({ fillOpacity })}
          />
          <LabRange
            id="kb-zoom"
            label="Camera zoom"
            min={PARAM_RANGES.cameraZoom.min}
            max={PARAM_RANGES.cameraZoom.max}
            step={PARAM_RANGES.cameraZoom.step}
            value={params.cameraZoom}
            display={params.cameraZoom.toFixed(2)}
            onChange={(cameraZoom) => patch({ cameraZoom })}
          />
          <LabRange
            id="kb-cam-x"
            label="Cam X"
            min={1}
            max={10}
            step={0.1}
            value={params.cameraPosition[0]}
            display={params.cameraPosition[0].toFixed(1)}
            onChange={(x) =>
              patch({
                cameraPosition: [x, params.cameraPosition[1], params.cameraPosition[2]],
              })
            }
          />
          <LabRange
            id="kb-cam-y"
            label="Cam Y"
            min={0.5}
            max={8}
            step={0.1}
            value={params.cameraPosition[1]}
            display={params.cameraPosition[1].toFixed(1)}
            onChange={(y) =>
              patch({
                cameraPosition: [params.cameraPosition[0], y, params.cameraPosition[2]],
              })
            }
          />
          <LabRange
            id="kb-cam-z"
            label="Cam Z"
            min={2}
            max={12}
            step={0.1}
            value={params.cameraPosition[2]}
            display={params.cameraPosition[2].toFixed(1)}
            onChange={(z) =>
              patch({
                cameraPosition: [params.cameraPosition[0], params.cameraPosition[1], z],
              })
            }
          />
          <LabColor
            id="kb-bg"
            label="Background"
            value={params.backgroundColor}
            onChange={(backgroundColor) => patch({ backgroundColor })}
          />
        </LabControlGroup>
      </DemoControlMenu>
      <KineticBarsApp params={params} forceReducedMotion={forceReduced} />
      <ExportCodeDrawer
        open={exportOpen}
        onOpenChange={setExportOpen}
        params={params}
      />
    </>
  );
}
