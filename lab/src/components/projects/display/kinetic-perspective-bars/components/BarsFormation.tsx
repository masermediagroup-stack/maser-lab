"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { KineticBar } from "./KineticBar";
import {
  barWorldX,
  createHeightProfile,
} from "../lib/createHeightProfile";
import { damp } from "../lib/easing";
import type { KineticBarHandle, KineticBarsParams } from "../types/kinetic-bars";
import type { useKineticWave } from "../hooks/useKineticWave";
import type { usePointerInfluence } from "../hooks/usePointerInfluence";
import type { useClickRipple } from "../hooks/useClickRipple";
import type { useMotionModeBlend } from "../hooks/useMotionModeBlend";

type BarsFormationProps = {
  params: KineticBarsParams;
  wave: ReturnType<typeof useKineticWave>;
  pointer: ReturnType<typeof usePointerInfluence>;
  ripple: ReturnType<typeof useClickRipple>;
  modeBlend: ReturnType<typeof useMotionModeBlend>;
  inView: boolean;
};

const BASE_EDGE_OPACITY = 0.22;
const BASE_FILL = "#0a0a0c";

export function BarsFormation({
  params,
  wave,
  pointer,
  ripple,
  modeBlend,
  inView,
}: BarsFormationProps) {
  const handlesRef = useRef<(KineticBarHandle | null)[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();

  const safeMin = Math.min(params.minHeight, params.maxHeight);
  const safeMax = Math.max(params.minHeight, params.maxHeight);
  const heights = useMemo(
    () => createHeightProfile(params.barCount, safeMin, safeMax),
    [params.barCount, safeMin, safeMax],
  );

  const xs = useMemo(() => {
    const arr = new Float32Array(params.barCount);
    for (let i = 0; i < params.barCount; i++) {
      arr[i] = barWorldX(i, params.barCount, params.barWidth, params.gap);
    }
    return arr;
  }, [params.barCount, params.barWidth, params.gap]);

  const register = useCallback((index: number, handle: KineticBarHandle | null) => {
    handlesRef.current[index] = handle;
  }, []);

  // Drop stale handles when bar count shrinks so raycasts never hit disposed meshes.
  useEffect(() => {
    if (handlesRef.current.length > params.barCount) {
      handlesRef.current.length = params.barCount;
    }
  }, [params.barCount]);

  useEffect(() => {
    modeBlend.syncMode(params.animationMode);
  }, [params.animationMode, modeBlend]);

  const raycasterRef = useRef(new THREE.Raycaster());
  const ndcRef = useRef(new THREE.Vector2());
  const hitTargetsRef = useRef<THREE.Object3D[]>([]);

  /**
   * Mesh-only pick: returns a bar index only when the pointer ray intersects
   * that bar’s own hit volume (matches its current height). No plane / max-height
   * fallback — empty space above short bars does not count as a hover.
   */
  const findHoveredBar = useCallback(
    (clientX: number, clientY: number): number | null => {
      const rect = gl.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;

      const ndc = ndcRef.current;
      ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );

      const raycaster = raycasterRef.current;
      raycaster.setFromCamera(ndc, camera);

      // Ensure lifted bars (group.position.y) are in the raycast world matrix.
      groupRef.current?.updateMatrixWorld(true);

      const targets = hitTargetsRef.current;
      targets.length = 0;
      for (const h of handlesRef.current) {
        if (h?.hitMesh) targets.push(h.hitMesh);
      }
      if (targets.length === 0) return null;

      const hits = raycaster.intersectObjects(targets, false);
      if (hits.length === 0) return null;

      const idx = hits[0]?.object.userData?.barIndex;
      return typeof idx === "number" ? idx : null;
    },
    [camera, gl.domElement],
  );

  useEffect(() => {
    const el = gl.domElement;

    const onPointerMove = (e: PointerEvent) => {
      const idx = findHoveredBar(e.clientX, e.clientY);
      if (idx == null) {
        pointer.setNearest(-1, false);
        el.dataset.kineticHover = "";
        return;
      }
      pointer.setNearest(idx, true);
      el.dataset.kineticHover = String(idx);
    };
    const onPointerLeave = () => {
      pointer.setNearest(-1, false);
      el.dataset.kineticHover = "";
    };
    const onPointerDown = (e: PointerEvent) => {
      const idx = findHoveredBar(e.clientX, e.clientY);
      if (idx == null) return;
      pointer.setNearest(idx, true);
      el.dataset.kineticHover = String(idx);
      ripple.trigger(idx);
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);
    el.addEventListener("pointerdown", onPointerDown);
    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      el.removeEventListener("pointerdown", onPointerDown);
    };
  }, [findHoveredBar, gl.domElement, pointer, ripple]);

  useFrame((_, delta) => {
    if (!inView) return;
    const dt = Math.min(0.05, delta);

    modeBlend.tick(dt);
    wave.advance(dt);
    ripple.setTime(wave.timeRef.current);
    pointer.tick(
      params.barCount,
      dt,
      params.hoverStrength,
      params.hoverRadius,
    );

    const edgeBase = BASE_EDGE_OPACITY + params.edgeBrightness * 0.28;
    const edgeC = 0.5 + params.edgeBrightness * 0.5;
    const edgeR = (edgeC * 190) / 255;
    const edgeG = (edgeC * 190) / 255;
    const edgeB = (edgeC * 198) / 255;

    for (let i = 0; i < params.barCount; i++) {
      const handle = handlesRef.current[i];
      if (!handle?.group) continue;

      const { y, intensity } = wave.sample(i);
      handle.group.position.y = damp(handle.group.position.y, y, 14, dt);

      if (handle.edgeMaterial) {
        handle.edgeMaterial.opacity = Math.min(0.85, edgeBase + intensity * 0.35);
        handle.edgeMaterial.color.setRGB(edgeR, edgeG, edgeB);
      }
      if (handle.fillMaterial) {
        handle.fillMaterial.opacity = Math.min(
          1,
          params.fillOpacity + intensity * 0.08,
        );
        const e = intensity * 0.04;
        handle.fillMaterial.emissive.setRGB(e, e, e * 1.05);
      }
    }
  });

  const rotY = params.perspectiveAngle;
  const [rx, , rz] = params.groupRotation;

  return (
    <group
      ref={groupRef}
      rotation={[rx, rotY, rz]}
      scale={params.groupScale}
    >
      {Array.from({ length: params.barCount }, (_, i) => (
        <KineticBar
          key={i}
          index={i}
          width={params.barWidth}
          thickness={params.barThickness}
          height={heights[i] ?? safeMin}
          x={xs[i]}
          cornerRadius={params.cornerRadius}
          register={register}
        />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <planeGeometry args={[12, 4]} />
        <meshBasicMaterial color={BASE_FILL} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
