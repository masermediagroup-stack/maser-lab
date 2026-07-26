"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import {
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

/** Slight pad so thin slabs stay hittable without expanding past bar height. */
const HIT_PAD_XZ = 1.35;

/**
 * Thin architectural slab: rounded box fill + controllable edge strokes.
 * Look props (opacity / edge brightness) are applied from the shared frame
 * loop via the registered materials — keeps GPU resources mutable without
 * React state churn.
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
  const hitMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        visible: false,
        transparent: true,
        opacity: 0,
        depthWrite: false,
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

  // Hit volume matches this bar’s height exactly; only X/Z are padded for thin slabs.
  const hitGeometry = useMemo(() => {
    const geo = new RoundedBoxGeometry(
      width * HIT_PAD_XZ,
      height,
      thickness * HIT_PAD_XZ,
      1,
      Math.min(radius, 0.02),
    );
    geo.translate(0, height / 2, 0);
    return geo;
  }, [width, height, thickness, radius]);

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
