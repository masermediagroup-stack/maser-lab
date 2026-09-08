"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Color,
  ExtrudeGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  ShaderMaterial,
  Shape,
} from "three";
import { getClampedPixelRatio, isWebGLAvailable } from "@/three/utils/capabilities";
import { createCardBodyMaterial } from "./card-object-material";

/** Figma artboard. Html host is this many CSS pixels, then scaled to the mesh. */
export const CARD_FACE_PX = 1299;
const ART = 1299;
const RADIUS_N = 80;
const FIT = 0.88;

export type CardObjectPose = {
  yaw: number;
  pitch: number;
  sheenX: number;
  sheenY: number;
  shineOn: number;
  shineA: number;
  tracking: boolean;
};

const CARD_GL = {
  alpha: true,
  antialias: true,
  powerPreference: "high-performance" as const,
  premultipliedAlpha: false,
};

const CARD_CAMERA = {
  fov: 26,
  near: 0.1,
  far: 40,
  position: [0, 0, 4.6] as [number, number, number],
};

const TRACK_LERP = 0.18;
const REST_LERP = 0.11;
const EDGE_COLOR = new Color("#c4c8d0");
const EMPTY_SUBSCRIBE = () => () => {};

function lerp(current: number, target: number, amount: number) {
  return current + (target - current) * amount;
}

/** Rounded rect in XY. Three.js Y-up. CCW so the extruded front faces +Z. */
function roundedRectShape(width: number, height: number, radius: number) {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(radius, hw, hh);
  const shape = new Shape();
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.absarc(hw - r, -hh + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(hw, hh - r);
  shape.absarc(hw - r, hh - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-hw + r, hh);
  shape.absarc(-hw + r, hh - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-hw, -hh + r);
  shape.absarc(-hw + r, -hh + r, r, Math.PI, (Math.PI * 3) / 2, false);
  return shape;
}

function CardMesh({
  poseRef,
  reduced,
  shadowRef,
  children,
}: {
  poseRef: RefObject<CardObjectPose>;
  reduced: boolean;
  shadowRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const edgeRef = useRef<LineSegments>(null);
  const material = useMemo(() => createCardBodyMaterial(), []);
  const edgeMaterial = useMemo(
    () =>
      new LineBasicMaterial({
        color: EDGE_COLOR,
        transparent: true,
        opacity: 0.28,
        depthTest: true,
      }),
    [],
  );
  const { viewport } = useThree();
  const outer = Math.min(viewport.width, viewport.height) * FIT;
  const bevel = Math.max(outer * 0.012, 0.016);
  const depth = Math.max(outer * 0.036, 0.048);
  const inner = Math.max(outer - 2 * bevel, 0.05);
  const radius = inner * (RADIUS_N / ART);
  const halfZ = depth / 2 + bevel;

  const geometry = useMemo(() => {
    if (outer < 0.05) return null;
    const geo = new ExtrudeGeometry(roundedRectShape(inner, inner, radius), {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelOffset: 0,
      bevelSegments: 2,
      curveSegments: 12,
    });
    geo.translate(0, 0, -halfZ);
    return geo;
  }, [outer, inner, radius, depth, bevel, halfZ]);

  const edges = useMemo(() => {
    if (!geometry) return null;
    return new EdgesGeometry(geometry, 28);
  }, [geometry]);

  useLayoutEffect(() => {
    return () => {
      material.dispose();
      edgeMaterial.dispose();
    };
  }, [material, edgeMaterial]);

  useLayoutEffect(() => {
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);

  useLayoutEffect(() => {
    return () => {
      edges?.dispose();
    };
  }, [edges]);

  const yawRef = useRef(0);
  const pitchRef = useRef(0);

  useFrame(() => {
    const group = groupRef.current;
    const pose = poseRef.current;
    if (!group || !pose) return;

    const rest = reduced || !pose.tracking;
    const amount = rest ? REST_LERP : TRACK_LERP;
    const yawTarget = reduced ? 0 : pose.yaw;
    const pitchTarget = reduced ? 0 : pose.pitch;
    yawRef.current = lerp(yawRef.current, yawTarget, amount);
    pitchRef.current = lerp(pitchRef.current, pitchTarget, amount);
    group.rotation.x = (pitchRef.current * Math.PI) / 180;
    group.rotation.y = (yawRef.current * Math.PI) / 180;
    const shadow = shadowRef.current;
    if (shadow) {
      shadow.style.setProperty("--shadow-x", `${yawRef.current * 1.15}px`);
    }

    const mesh = meshRef.current;
    const mat = mesh?.material;
    if (mat instanceof ShaderMaterial) {
      mat.uniforms.uSheenUv.value.set(pose.sheenX, 1 - pose.sheenY);
      mat.uniforms.uShineOn.value = reduced ? 0 : pose.shineOn;
      mat.uniforms.uShineA.value = reduced ? 0 : pose.shineA;
      mat.uniforms.uHalfSize.value.set(inner / 2, inner / 2, halfZ);
    }
    const edgeMat = edgeRef.current?.material;
    if (edgeMat instanceof LineBasicMaterial) {
      edgeMat.opacity = reduced ? 0.18 : 0.22 + pose.shineOn * 0.16;
    }
  });

  if (!geometry || !edges || outer < 0.05) return null;

  /**
   * drei Html transform: 1 CSS px = (distanceFactor / 400) world units.
   * Map the 1299px host onto the inner (pre-bevel) face so the bevel rim shows.
   */
  const distanceFactor = (inner * 400) / CARD_FACE_PX;

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry} material={material} />
      <lineSegments ref={edgeRef} geometry={edges} material={edgeMaterial} />
      <Html
        transform
        occlude={false}
        position={[0, 0, halfZ + 0.002]}
        distanceFactor={distanceFactor}
        pointerEvents="auto"
        zIndexRange={[40, 10]}
        wrapperClass="maser-bot-card__html"
      >
        <div
          className="maser-bot-card__face-host"
          style={{ width: CARD_FACE_PX, height: CARD_FACE_PX }}
        >
          {children}
        </div>
      </Html>
    </group>
  );
}

type CardObjectProps = {
  poseRef: RefObject<CardObjectPose>;
  reduced: boolean;
  shadowRef: RefObject<HTMLElement | null>;
  children: ReactNode;
};

/**
 * One Three.js object: extruded rounded card + edge strokes + Html face.
 * Face, bezel, rim, and sheen share this group's transform.
 * Physical edge is one mesh + EdgesGeometry (kinetic-bars pattern), not stacked CSS planes.
 * ExtrudeGeometry (not RoundedBoxGeometry) so Figma radius 80 holds on a thin card.
 */
export function CardObject({ poseRef, reduced, shadowRef, children }: CardObjectProps) {
  const isClient = useSyncExternalStore(EMPTY_SUBSCRIBE, () => true, () => false);
  const webgl = isClient && isWebGLAvailable();

  const dpr = useMemo(() => {
    if (typeof window === "undefined") return 1;
    const max = window.innerWidth < 768 ? 1.5 : 2;
    return getClampedPixelRatio(max);
  }, []);

  if (!isClient || !webgl) {
    return <div className="maser-bot-card__object-fallback">{children}</div>;
  }

  return (
    <div className="maser-bot-card__object" data-three-canvas="">
      <Canvas
        gl={CARD_GL}
        dpr={dpr}
        camera={CARD_CAMERA}
        style={{ pointerEvents: "none" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.domElement.style.pointerEvents = "none";
        }}
      >
        <CardMesh poseRef={poseRef} reduced={reduced} shadowRef={shadowRef}>
          {children}
        </CardMesh>
      </Canvas>
    </div>
  );
}
