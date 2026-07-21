"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

type CameraRigProps = {
  position: [number, number, number];
  zoom: number;
  drift: boolean;
  reducedMotion: boolean;
};

/**
 * Fixed camera with optional imperceptible drift (a few pixels of movement).
 * No orbit controls.
 */
export function CameraRig({
  position,
  zoom,
  drift,
  reducedMotion,
}: CameraRigProps) {
  const pivotRef = useRef<Group>(null);

  useFrame(({ camera, clock }) => {
    const [x, y, z] = position;
    const invZoom = 1 / Math.max(0.5, zoom);

    if (drift && !reducedMotion) {
      const t = clock.elapsedTime;
      // ~2–4px equivalent at typical framing — nearly imperceptible.
      const dx = Math.sin(t * 0.11) * 0.012;
      const dy = Math.cos(t * 0.09) * 0.008;
      camera.position.set(x * invZoom + dx, y * invZoom + dy, z * invZoom);
    } else {
      camera.position.set(x * invZoom, y * invZoom, z * invZoom);
    }
    camera.lookAt(0, 0.9, 0);
    if ("isPerspectiveCamera" in camera && camera.isPerspectiveCamera) {
      camera.updateProjectionMatrix();
    }
  });

  return <group ref={pivotRef} />;
}
