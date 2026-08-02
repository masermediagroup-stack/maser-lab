import type { KineticBarsParams } from "../types/kinetic-bars";
import { MODE_LABELS } from "./constants";

export function generateSettingsSummary(params: KineticBarsParams): string {
  return [
    `mode: ${MODE_LABELS[params.animationMode]}`,
    `bars: ${params.barCount}`,
    `width: ${params.barWidth}`,
    `thickness: ${params.barThickness}`,
    `gap: ${params.gap}`,
    `height: ${params.minHeight} → ${params.maxHeight}`,
    `amplitude: ${params.liftAmplitude}`,
    `speed: ${params.waveSpeed}`,
    `phase: ${params.phaseOffset}`,
    `edge: ${params.edgeBrightness}`,
    `opacity: ${params.fillOpacity}`,
    `scale: ${params.groupScale}`,
    `zoom: ${params.cameraZoom}`,
    `bg: ${params.backgroundColor}`,
  ].join("\n");
}

export function generateInstallCommand(): string {
  return "npm install three @types/three @react-three/fiber @react-three/drei";
}

/**
 * Export reflects the live control-panel values — not hardcoded demo defaults.
 */
export function generateExportCode(params: KineticBarsParams): string {
  const p = params;
  return `/**
 * Kinetic Perspective Bars — exported from Maser-Lab
 * Current mode: ${MODE_LABELS[p.animationMode]}
 */
"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  MeshStandardMaterial,
} from "three";

export type KineticBarsConfig = {
  barCount: number;
  barWidth: number;
  barThickness: number;
  gap: number;
  minHeight: number;
  maxHeight: number;
  liftAmplitude: number;
  waveSpeed: number;
  phaseOffset: number;
  edgeBrightness: number;
  fillOpacity: number;
  backgroundColor: string;
  groupScale: number;
  perspectiveAngle: number;
};

export const kineticBarsConfig: KineticBarsConfig = {
  barCount: ${p.barCount},
  barWidth: ${p.barWidth},
  barThickness: ${p.barThickness},
  gap: ${p.gap},
  minHeight: ${p.minHeight},
  maxHeight: ${p.maxHeight},
  liftAmplitude: ${p.liftAmplitude},
  waveSpeed: ${p.waveSpeed},
  phaseOffset: ${p.phaseOffset},
  edgeBrightness: ${p.edgeBrightness},
  fillOpacity: ${p.fillOpacity},
  backgroundColor: "${p.backgroundColor}",
  groupScale: ${p.groupScale},
  perspectiveAngle: ${p.perspectiveAngle},
};

function createHeightProfile(count: number, minH: number, maxH: number) {
  const heights = new Float32Array(count);
  const peakT = 0.72;
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 1 : i / (count - 1);
    const dist = (t - peakT) / (t < peakT ? peakT : 1 - peakT || 1);
    const envelope = Math.exp(-2.4 * dist * dist);
    const frontBias = Math.pow(t, 0.85);
    const shaped = envelope * (0.35 + 0.65 * frontBias);
    heights[i] = minH + (maxH - minH) * Math.max(0, Math.min(1, shaped));
  }
  return heights;
}

function shapeElevation(sine01: number, power = 2.15) {
  return Math.pow(Math.max(0, Math.min(1, sine01)), power);
}

function KineticBarMesh({
  width,
  thickness,
  height,
  x,
  fillOpacity,
  edgeBrightness,
  index,
  config,
}: {
  width: number;
  thickness: number;
  height: number;
  x: number;
  fillOpacity: number;
  edgeBrightness: number;
  index: number;
  config: KineticBarsConfig;
}) {
  const group = useRef<Group>(null);
  const fill = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#0a0a0c",
        roughness: 0.92,
        metalness: 0.08,
        transparent: true,
        opacity: fillOpacity,
      }),
    [fillOpacity],
  );
  const edge = useMemo(() => {
    const c = 0.55 + edgeBrightness * 0.45;
    return new LineBasicMaterial({
      color: \`rgb(\${Math.round(c * 200)}, \${Math.round(c * 200)}, \${Math.round(c * 205)})\`,
      transparent: true,
      opacity: 0.18 + edgeBrightness * 0.35,
    });
  }, [edgeBrightness]);
  const geo = useMemo(() => {
    const g = new BoxGeometry(width, height, thickness);
    g.translate(0, height / 2, 0);
    return g;
  }, [width, height, thickness]);
  const edges = useMemo(() => new EdgesGeometry(geo, 20), [geo]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const phase =
      clock.elapsedTime * config.waveSpeed - index * config.phaseOffset;
    const sine01 = (Math.sin(phase) + 1) * 0.5;
    const elev = shapeElevation(sine01) * config.liftAmplitude;
    group.current.position.y = elev;
    edge.opacity = Math.min(0.85, 0.22 + edgeBrightness * 0.28 + sine01 * 0.35);
  });

  return (
    <group ref={group} position={[x, 0, 0]}>
      <mesh geometry={geo} material={fill} />
      <lineSegments geometry={edges} material={edge} />
    </group>
  );
}

function Formation({ config }: { config: KineticBarsConfig }) {
  const heights = useMemo(
    () => createHeightProfile(config.barCount, config.minHeight, config.maxHeight),
    [config],
  );
  const pitch = config.barWidth + config.gap;
  const total = (config.barCount - 1) * pitch;

  return (
    <group rotation={[0, config.perspectiveAngle, 0]} scale={config.groupScale}>
      {Array.from({ length: config.barCount }, (_, i) => (
        <KineticBarMesh
          key={i}
          index={i}
          width={config.barWidth}
          thickness={config.barThickness}
          height={heights[i]}
          x={-total / 2 + i * pitch}
          fillOpacity={config.fillOpacity}
          edgeBrightness={config.edgeBrightness}
          config={config}
        />
      ))}
    </group>
  );
}

/** Usage example */
export function KineticPerspectiveBars(props: Partial<KineticBarsConfig> = {}) {
  const config = { ...kineticBarsConfig, ...props };
  return (
    <div style={{ width: "100%", height: "100%", background: config.backgroundColor }}>
      <Canvas camera={{ fov: 28, position: [${p.cameraPosition.map((n) => n.toFixed(2)).join(", ")}] }}>
        <color attach="background" args={[config.backgroundColor]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3.5, 6, 4]} intensity={0.55} />
        <Formation config={config} />
      </Canvas>
    </div>
  );
}
`;
}
