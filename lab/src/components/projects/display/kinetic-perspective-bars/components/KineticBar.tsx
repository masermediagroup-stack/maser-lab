"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import {
  EdgesGeometry,
  Group,
  LineBasicMaterial,
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
  fillOpacity: number;
  edgeBrightness: number;
  register: (index: number, handle: KineticBarHandle | null) => void;
};

/**
 * Thin architectural slab: rounded box fill + controllable edge strokes.
 */
export function KineticBar({
  index,
  width,
  thickness,
  height,
  x,
  cornerRadius,
  fillOpacity,
  edgeBrightness,
  register,
}: KineticBarProps) {
  const groupRef = useRef<Group>(null);

  const radius = Math.min(
    cornerRadius,
    Math.min(width, thickness, height) * 0.35,
  );

  const geometry = useMemo(() => {
    const geo = new RoundedBoxGeometry(
      width,
      height,
      thickness,
      2,
      radius,
    );
    geo.translate(0, height / 2, 0);
    return geo;
  }, [width, height, thickness, radius]);

  const edgesGeo = useMemo(() => new EdgesGeometry(geometry, 18), [geometry]);

  const fillMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#0a0a0c",
        roughness: 0.94,
        metalness: 0.06,
        transparent: true,
        opacity: fillOpacity,
        depthWrite: true,
      }),
    [fillOpacity],
  );

  const edgeMaterial = useMemo(() => {
    const c = 0.5 + edgeBrightness * 0.5;
    return new LineBasicMaterial({
      color: `rgb(${Math.round(c * 190)}, ${Math.round(c * 190)}, ${Math.round(c * 198)})`,
      transparent: true,
      opacity: 0.16 + edgeBrightness * 0.38,
      depthTest: true,
    });
  }, [edgeBrightness]);

  useLayoutEffect(() => {
    register(index, {
      group: groupRef.current,
      fillMaterial,
      edgeMaterial,
      baseY: 0,
      index,
      height,
    });
    return () => {
      register(index, null);
      geometry.dispose();
      edgesGeo.dispose();
      fillMaterial.dispose();
      edgeMaterial.dispose();
    };
  }, [
    index,
    register,
    geometry,
    edgesGeo,
    fillMaterial,
    edgeMaterial,
    height,
  ]);

  return (
    <group ref={groupRef} position={[x, 0, 0]}>
      <mesh geometry={geometry} material={fillMaterial} />
      <lineSegments geometry={edgesGeo} material={edgeMaterial} />
    </group>
  );
}
