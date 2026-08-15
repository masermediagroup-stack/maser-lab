"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  Color,
  FrontSide,
  Group,
} from "three";
import { SPHERE_SEGMENTS, TYPE_WORLD_DEFAULTS } from "./constants";
import {
  createTypographyTexture,
  ensureFontLoaded,
  pickTextureSize,
} from "./createTypographyTexture";
import { revealScale } from "./math";
import type { DragRotationApi } from "./useDragRotation";
import type { RefObject } from "react";

type TypographicSphereProps = {
  quote: string;
  textColor: string;
  fontFamily: string;
  reducedMotion: boolean;
  revealEnd: number;
  overshoot: number;
  progressRef: RefObject<number>;
  drag: DragRotationApi;
  narrow: boolean;
};

export function TypographicSphere({
  quote,
  textColor,
  fontFamily,
  reducedMotion,
  revealEnd,
  overshoot,
  progressRef,
  drag,
  narrow,
}: TypographicSphereProps) {
  const groupRef = useRef<Group>(null);
  const { gl, viewport } = useThree();
  const [texture, setTexture] = useState<CanvasTexture | null>(null);
  const color = useMemo(() => new Color(textColor), [textColor]);
  const segments = narrow ? SPHERE_SEGMENTS.mobile : SPHERE_SEGMENTS.desktop;

  useEffect(() => {
    let cancelled = false;
    let created: CanvasTexture | undefined;

    const paint = async () => {
      await ensureFontLoaded(fontFamily);
      if (cancelled) return;
      const size = pickTextureSize();
      created = createTypographyTexture({
        quote,
        fontFamily,
        width: size.width,
        height: size.height,
      });
      created.anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy());
      if (cancelled) {
        created.dispose();
        return;
      }
      setTexture(created);
    };

    void paint();

    return () => {
      cancelled = true;
    };
  }, [fontFamily, gl, quote]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  useEffect(() => {
    color.set(textColor);
  }, [color, textColor]);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    drag.tick(dt);

    const group = groupRef.current;
    if (!group) return;

    const progress = reducedMotion ? 1 : progressRef.current;
    const reveal = reducedMotion
      ? 1
      : revealScale(
          progress,
          revealEnd,
          overshoot,
          TYPE_WORLD_DEFAULTS.minScale,
        );
    const fit = Math.min(viewport.width, viewport.height) * 0.34;
    const nextScale = Math.max(
      TYPE_WORLD_DEFAULTS.minScale,
      reveal * drag.gripRef.current * fit,
    );
    group.scale.setScalar(nextScale);
    group.rotation.order = "YXZ";
    group.rotation.y = drag.yawRef.current;
    group.rotation.x = drag.pitchRef.current;
  });

  return (
    <group ref={groupRef} scale={TYPE_WORLD_DEFAULTS.minScale}>
      {texture ? (
        <mesh frustumCulled={false}>
          <sphereGeometry args={[segments[0], segments[1], segments[2]]} />
          <meshBasicMaterial
            map={texture}
            color={color}
            transparent
            alphaTest={0.02}
            depthWrite
            depthTest
            side={FrontSide}
            toneMapped={false}
          />
        </mesh>
      ) : null}
    </group>
  );
}
