"use client";

import { useControls, folder, button } from "leva";
import { useEffect, useRef } from "react";
import { DEFAULT_PARAMS, PARAM_RANGES } from "../lib/constants";
import type { KineticBarsParams, MotionMode } from "../types/kinetic-bars";

type KineticBarsControlsProps = {
  onChange: (patch: Partial<KineticBarsParams>) => void;
  onReset: () => void;
};

/**
 * Leva development panel — collapsible, separate from artwork chrome.
 * Writes patches to React state only when Leva values change (not per-frame).
 */
export function KineticBarsControls({
  onChange,
  onReset,
}: KineticBarsControlsProps) {
  const values = useControls({
    Formation: folder({
      barCount: {
        value: DEFAULT_PARAMS.barCount,
        min: PARAM_RANGES.barCount.min,
        max: PARAM_RANGES.barCount.max,
        step: PARAM_RANGES.barCount.step,
      },
      barWidth: {
        value: DEFAULT_PARAMS.barWidth,
        min: PARAM_RANGES.barWidth.min,
        max: PARAM_RANGES.barWidth.max,
        step: PARAM_RANGES.barWidth.step,
      },
      barThickness: {
        value: DEFAULT_PARAMS.barThickness,
        min: PARAM_RANGES.barThickness.min,
        max: PARAM_RANGES.barThickness.max,
        step: PARAM_RANGES.barThickness.step,
      },
      gap: {
        value: DEFAULT_PARAMS.gap,
        min: PARAM_RANGES.gap.min,
        max: PARAM_RANGES.gap.max,
        step: PARAM_RANGES.gap.step,
      },
      minHeight: {
        value: DEFAULT_PARAMS.minHeight,
        min: PARAM_RANGES.minHeight.min,
        max: PARAM_RANGES.minHeight.max,
        step: PARAM_RANGES.minHeight.step,
      },
      maxHeight: {
        value: DEFAULT_PARAMS.maxHeight,
        min: PARAM_RANGES.maxHeight.min,
        max: PARAM_RANGES.maxHeight.max,
        step: PARAM_RANGES.maxHeight.step,
      },
      cornerRadius: {
        value: DEFAULT_PARAMS.cornerRadius,
        min: PARAM_RANGES.cornerRadius.min,
        max: PARAM_RANGES.cornerRadius.max,
        step: PARAM_RANGES.cornerRadius.step,
      },
      perspectiveAngle: {
        value: DEFAULT_PARAMS.perspectiveAngle,
        min: -1.2,
        max: 0.2,
        step: 0.01,
      },
      groupScale: {
        value: DEFAULT_PARAMS.groupScale,
        min: PARAM_RANGES.groupScale.min,
        max: PARAM_RANGES.groupScale.max,
        step: PARAM_RANGES.groupScale.step,
      },
    }),
    Motion: folder({
      liftAmplitude: {
        value: DEFAULT_PARAMS.liftAmplitude,
        min: PARAM_RANGES.liftAmplitude.min,
        max: PARAM_RANGES.liftAmplitude.max,
        step: PARAM_RANGES.liftAmplitude.step,
      },
      waveSpeed: {
        value: DEFAULT_PARAMS.waveSpeed,
        min: PARAM_RANGES.waveSpeed.min,
        max: PARAM_RANGES.waveSpeed.max,
        step: PARAM_RANGES.waveSpeed.step,
      },
      phaseOffset: {
        value: DEFAULT_PARAMS.phaseOffset,
        min: PARAM_RANGES.phaseOffset.min,
        max: PARAM_RANGES.phaseOffset.max,
        step: PARAM_RANGES.phaseOffset.step,
      },
      waveDirection: {
        options: { Forward: 1, Reverse: -1 },
        value: DEFAULT_PARAMS.waveDirection,
      },
      animationMode: {
        options: {
          "Traveling Wave": "traveling",
          "Reverse Wave": "reverse",
          Breathing: "breathing",
          "Pulse Sweep": "pulse",
        },
        value: DEFAULT_PARAMS.animationMode,
      },
      paused: DEFAULT_PARAMS.paused,
      reducedMotionPreview: DEFAULT_PARAMS.reducedMotionPreview,
      cameraDrift: DEFAULT_PARAMS.cameraDrift,
    }),
    Interaction: folder({
      hoverStrength: {
        value: DEFAULT_PARAMS.hoverStrength,
        min: PARAM_RANGES.hoverStrength.min,
        max: PARAM_RANGES.hoverStrength.max,
        step: PARAM_RANGES.hoverStrength.step,
      },
      hoverRadius: {
        value: DEFAULT_PARAMS.hoverRadius,
        min: PARAM_RANGES.hoverRadius.min,
        max: PARAM_RANGES.hoverRadius.max,
        step: PARAM_RANGES.hoverRadius.step,
      },
      rippleStrength: {
        value: DEFAULT_PARAMS.rippleStrength,
        min: PARAM_RANGES.rippleStrength.min,
        max: PARAM_RANGES.rippleStrength.max,
        step: PARAM_RANGES.rippleStrength.step,
      },
      rippleSpeed: {
        value: DEFAULT_PARAMS.rippleSpeed,
        min: PARAM_RANGES.rippleSpeed.min,
        max: PARAM_RANGES.rippleSpeed.max,
        step: PARAM_RANGES.rippleSpeed.step,
      },
      rippleDecay: {
        value: DEFAULT_PARAMS.rippleDecay,
        min: PARAM_RANGES.rippleDecay.min,
        max: PARAM_RANGES.rippleDecay.max,
        step: PARAM_RANGES.rippleDecay.step,
      },
    }),
    Look: folder({
      edgeBrightness: {
        value: DEFAULT_PARAMS.edgeBrightness,
        min: PARAM_RANGES.edgeBrightness.min,
        max: PARAM_RANGES.edgeBrightness.max,
        step: PARAM_RANGES.edgeBrightness.step,
      },
      fillOpacity: {
        value: DEFAULT_PARAMS.fillOpacity,
        min: PARAM_RANGES.fillOpacity.min,
        max: PARAM_RANGES.fillOpacity.max,
        step: PARAM_RANGES.fillOpacity.step,
      },
      backgroundColor: {
        value: DEFAULT_PARAMS.backgroundColor,
      },
      cameraZoom: {
        value: DEFAULT_PARAMS.cameraZoom,
        min: PARAM_RANGES.cameraZoom.min,
        max: PARAM_RANGES.cameraZoom.max,
        step: PARAM_RANGES.cameraZoom.step,
      },
      camX: {
        value: DEFAULT_PARAMS.cameraPosition[0],
        min: 1,
        max: 10,
        step: 0.1,
      },
      camY: {
        value: DEFAULT_PARAMS.cameraPosition[1],
        min: 0.5,
        max: 8,
        step: 0.1,
      },
      camZ: {
        value: DEFAULT_PARAMS.cameraPosition[2],
        min: 2,
        max: 12,
        step: 0.1,
      },
    }),
    "Reset sculpture": button(onReset),
  });

  const lastSerializedRef = useRef("");

  useEffect(() => {
    const v = values as Record<string, unknown>;
    const patch: Partial<KineticBarsParams> = {
      barCount: v.barCount as number,
      barWidth: v.barWidth as number,
      barThickness: v.barThickness as number,
      gap: v.gap as number,
      minHeight: v.minHeight as number,
      maxHeight: v.maxHeight as number,
      cornerRadius: v.cornerRadius as number,
      perspectiveAngle: v.perspectiveAngle as number,
      groupScale: v.groupScale as number,
      liftAmplitude: v.liftAmplitude as number,
      waveSpeed: v.waveSpeed as number,
      phaseOffset: v.phaseOffset as number,
      waveDirection: v.waveDirection as 1 | -1,
      animationMode: v.animationMode as MotionMode,
      paused: v.paused as boolean,
      reducedMotionPreview: v.reducedMotionPreview as boolean,
      cameraDrift: v.cameraDrift as boolean,
      hoverStrength: v.hoverStrength as number,
      hoverRadius: v.hoverRadius as number,
      rippleStrength: v.rippleStrength as number,
      rippleSpeed: v.rippleSpeed as number,
      rippleDecay: v.rippleDecay as number,
      edgeBrightness: v.edgeBrightness as number,
      fillOpacity: v.fillOpacity as number,
      backgroundColor: v.backgroundColor as string,
      cameraZoom: v.cameraZoom as number,
      cameraPosition: [v.camX as number, v.camY as number, v.camZ as number],
      groupRotation: [
        DEFAULT_PARAMS.groupRotation[0],
        v.perspectiveAngle as number,
        DEFAULT_PARAMS.groupRotation[2],
      ],
    };
    const serialized = JSON.stringify(patch);
    if (serialized === lastSerializedRef.current) return;
    lastSerializedRef.current = serialized;
    onChange(patch);
  }, [values, onChange]);

  return null;
}
