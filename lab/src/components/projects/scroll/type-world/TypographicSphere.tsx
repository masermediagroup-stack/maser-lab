"use client";

/* ShaderMaterial.uniforms are GPU handles updated in useFrame, not React state. */
/* eslint-disable react-hooks/immutability */

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CanvasTexture, FrontSide, Group, Quaternion, ShaderMaterial, Vector3 } from "three";
import { GRADIENT_CYCLE_SECONDS, SPHERE_FIT, SPHERE_SEGMENTS, TYPE_WORLD_DEFAULTS } from "./constants";
import {
  createTypographyTexture,
  ensureFontLoaded,
  pickTextureSize,
} from "./createTypographyTexture";
import {
  createGlyphGradientUniforms,
  GLYPH_FRAG,
  GLYPH_VERT,
  type GlyphGradientUniforms,
} from "./glyphGradient";
import { sphereFitRadius } from "./math";
import type { DragRotationApi } from "./useDragRotation";
import type { TypeWorldGradient } from "./types";

type TypographicSphereProps = {
  quote: string;
  fontFamily: string;
  reducedMotion: boolean;
  drag: DragRotationApi;
  narrow: boolean;
  gradient: TypeWorldGradient;
  scale?: number;
};

export function TypographicSphere({
  quote,
  fontFamily,
  reducedMotion,
  drag,
  narrow,
  gradient,
  scale = TYPE_WORLD_DEFAULTS.scale,
}: TypographicSphereProps) {
  const groupRef = useRef<Group>(null);
  const { gl, viewport } = useThree();
  const [texture, setTexture] = useState<CanvasTexture | null>(null);
  const [material] = useState(
    () =>
      new ShaderMaterial({
        uniforms: createGlyphGradientUniforms(),
        vertexShader: GLYPH_VERT,
        fragmentShader: GLYPH_FRAG,
        transparent: true,
        depthWrite: true,
        depthTest: true,
        side: FrontSide,
        toneMapped: false,
      }),
  );
  const segments = narrow ? SPHERE_SEGMENTS.mobile : SPHERE_SEGMENTS.desktop;
  const restScale = sphereFitRadius(
    viewport.width,
    viewport.height,
    narrow ? SPHERE_FIT.mobileWidth : SPHERE_FIT.desktopWidth,
    narrow ? SPHERE_FIT.mobileHeight : SPHERE_FIT.desktopHeight,
  );
  const gradientRef = useRef(gradient);
  const reducedRef = useRef(reducedMotion);
  const yawAxis = useRef(new Vector3(0, 1, 0));
  const pitchAxis = useRef(new Vector3(1, 0, 0));
  const qYaw = useRef(new Quaternion());
  const qPitch = useRef(new Quaternion());

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useEffect(() => {
    gradientRef.current = gradient;
  }, [gradient]);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

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
    const uniforms = material.uniforms as GlyphGradientUniforms;
    uniforms.uGlyphs.value = texture;
  }, [material, texture]);

  useEffect(() => {
    const g = gradient;
    const uniforms = material.uniforms as GlyphGradientUniforms;
    uniforms.uColorA.value.set(g.color1);
    uniforms.uColorB.value.set(g.color2);
    uniforms.uColorC.value.set(g.color3);
    const rad = (g.angle * Math.PI) / 180;
    uniforms.uDir.value.set(Math.cos(rad), Math.sin(rad));
    uniforms.uSpread.value = g.spread;
  }, [gradient, material]);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    drag.tick(dt);

    const uniforms = material.uniforms as GlyphGradientUniforms;
    const g = gradientRef.current;
    const speed = reducedRef.current ? 0 : g.speed;
    const sign = g.reverse ? -1 : 1;
    const next =
      uniforms.uPhase.value + (dt * speed * sign) / GRADIENT_CYCLE_SECONDS;
    uniforms.uPhase.value = next - Math.floor(next);

    const group = groupRef.current;
    if (!group) return;

    const nextScale = Math.max(
      TYPE_WORLD_DEFAULTS.minScale,
      drag.gripRef.current * restScale * scale,
    );
    group.scale.setScalar(nextScale);
    // Yaw around world up, then nod around camera-right (world X) so the
    // facing glyphs follow the pointer on both the 0° and 180° copies.
    qYaw.current.setFromAxisAngle(yawAxis.current, drag.yawRef.current);
    qPitch.current.setFromAxisAngle(pitchAxis.current, drag.pitchRef.current);
    group.quaternion.copy(qPitch.current).multiply(qYaw.current);
  });

  return (
    <group ref={groupRef} scale={restScale * scale}>
      {texture ? (
        <mesh frustumCulled={false}>
          <sphereGeometry args={[segments[0], segments[1], segments[2]]} />
          <primitive object={material} attach="material" />
        </mesh>
      ) : null}
    </group>
  );
}
