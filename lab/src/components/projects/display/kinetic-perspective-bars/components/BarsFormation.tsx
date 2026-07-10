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

  const heights = useMemo(
    () =>
      createHeightProfile(params.barCount, params.minHeight, params.maxHeight),
    [params.barCount, params.minHeight, params.maxHeight],
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

  useEffect(() => {
    modeBlend.syncMode(params.animationMode);
  }, [params.animationMode, modeBlend]);

  const findNearestBar = useCallback(
    (clientX: number, clientY: number): number => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(ndc, camera);

      const meshes: THREE.Object3D[] = [];
      for (const h of handlesRef.current) {
        if (h?.group) meshes.push(h.group);
      }
      const hits = raycaster.intersectObjects(meshes, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj) {
          for (let i = 0; i < handlesRef.current.length; i++) {
            if (handlesRef.current[i]?.group === obj) return i;
          }
          obj = obj.parent;
        }
      }

      // Fallback: nearest bar by local X under pointer ray.
      const hitPoint = new THREE.Vector3();
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      if (groupRef.current) {
        const n = new THREE.Vector3(0, 0, 1).applyQuaternion(
          groupRef.current.quaternion,
        );
        plane.setFromNormalAndCoplanarPoint(n, groupRef.current.position);
      }
      raycaster.ray.intersectPlane(plane, hitPoint);
      const local = hitPoint.clone();
      if (groupRef.current) groupRef.current.worldToLocal(local);

      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < params.barCount; i++) {
        const d = Math.abs(local.x - xs[i]);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      return best;
    },
    [camera, gl.domElement, params.barCount, xs],
  );

  useEffect(() => {
    const el = gl.domElement;

    const onPointerMove = (e: PointerEvent) => {
      const idx = findNearestBar(e.clientX, e.clientY);
      pointer.setNearest(idx, true);
    };
    const onPointerLeave = () => {
      pointer.setNearest(-1, false);
    };
    const onPointerDown = (e: PointerEvent) => {
      const idx = findNearestBar(e.clientX, e.clientY);
      pointer.setNearest(idx, true);
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
  }, [findNearestBar, gl.domElement, pointer, ripple]);

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

    for (let i = 0; i < params.barCount; i++) {
      const handle = handlesRef.current[i];
      if (!handle?.group) continue;

      const { y, intensity } = wave.sample(i);
      handle.group.position.y = damp(handle.group.position.y, y, 14, dt);

      if (handle.edgeMaterial) {
        handle.edgeMaterial.opacity = Math.min(0.85, edgeBase + intensity * 0.35);
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
          key={`${i}-${params.barWidth}-${params.barThickness}-${heights[i].toFixed(3)}`}
          index={i}
          width={params.barWidth}
          thickness={params.barThickness}
          height={heights[i]}
          x={xs[i]}
          cornerRadius={params.cornerRadius}
          fillOpacity={params.fillOpacity}
          edgeBrightness={params.edgeBrightness}
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
