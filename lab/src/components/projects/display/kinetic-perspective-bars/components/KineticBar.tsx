"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import {
  BoxGeometry,
  DoubleSide,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import type { KineticBarHandle } from "../types/kinetic-bars";

type KineticBarProps = {
  index: number;
  width: number;
  thickness: number;
  height: number;
  x: number;
  cornerRadius: number;
  register: (index: number, handle: KineticBarHandle | null) => void;
};

/** Pad X/Z so thin slabs stay hittable; height stays exact to the visible bar. */
const HIT_PAD_XZ = 1.6;

/**
 * Thin architectural slab: rounded box fill + controllable edge strokes.
 * Look props are applied from the shared frame loop via registered materials.
 */
export function KineticBar({
  index,
  width,
  thickness,
  height,
  x,
  cornerRadius,
  register,
}: KineticBarProps) {
  const groupRef = useRef<Group>(null);
  const hitMeshRef = useRef<Mesh>(null);

  const fillMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#0a0a0c",
        roughness: 0.94,
        metalness: 0.06,
        transparent: true,
        opacity: 0.92,
        depthWrite: true,
      }),
    [],
  );
  const edgeMaterial = useMemo(
    () =>
      new LineBasicMaterial({
        color: "#96969e",
        transparent: true,
        opacity: 0.32,
        depthTest: true,
      }),
    [],
  );
  // Keep mesh.visible true so Raycaster can hit it; hide via transparent material.
  const hitMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: DoubleSide,
      }),
    [],
  );

  const radius = Math.min(
    cornerRadius,
    Math.min(width, thickness, height) * 0.35,
  );

  const geometry = useMemo(() => {
    const geo = new RoundedBoxGeometry(width, height, thickness, 2, radius);
    geo.translate(0, height / 2, 0);
    return geo;
  }, [width, height, thickness, radius]);

  const edgesGeo = useMemo(() => new EdgesGeometry(geometry, 18), [geometry]);

  // Simple box hit volume matching this bar’s height (not formation max height).
  const hitGeometry = useMemo(() => {
    const geo = new BoxGeometry(
      width * HIT_PAD_XZ,
      height,
      Math.max(thickness * HIT_PAD_XZ, 0.08),
    );
    geo.translate(0, height / 2, 0);
    return geo;
  }, [width, height, thickness]);

  useLayoutEffect(() => {
    const hit = hitMeshRef.current;
    if (hit) hit.userData.barIndex = index;
    register(index, {
      group: groupRef.current,
      hitMesh: hit,
      fillMaterial,
      edgeMaterial,
      baseY: 0,
      index,
      height,
    });
    return () => {
      register(index, null);
    };
  }, [index, register, fillMaterial, edgeMaterial, height, hitGeometry]);

  useLayoutEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useLayoutEffect(() => {
    return () => {
      edgesGeo.dispose();
    };
  }, [edgesGeo]);

  useLayoutEffect(() => {
    return () => {
      hitGeometry.dispose();
    };
  }, [hitGeometry]);

  useLayoutEffect(() => {
    return () => {
      fillMaterial.dispose();
      edgeMaterial.dispose();
      hitMaterial.dispose();
    };
  }, [fillMaterial, edgeMaterial, hitMaterial]);

  return (
    <group ref={groupRef} position={[x, 0, 0]}>
      <mesh geometry={geometry} material={fillMaterial} />
      <lineSegments geometry={edgesGeo} material={edgeMaterial} />
      <mesh
        ref={hitMeshRef}
        geometry={hitGeometry}
        material={hitMaterial}
        userData={{ barIndex: index }}
      />
    </group>
  );
}
