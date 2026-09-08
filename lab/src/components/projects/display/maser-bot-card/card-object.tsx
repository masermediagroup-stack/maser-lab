"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type RefObject,
} from "react";
import {
  Color,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  NoToneMapping,
  Shape,
} from "three";
import {
  getClampedPixelRatio,
  isWebGLAvailable,
} from "@/three/utils/capabilities";
import type { MaserBotCardFace } from "./types";

const ART = 1299;
const RADIUS_N = 80;
/** Mesh and face overlay share this fraction of the square stack. */
export const CARD_FIT = 0.88;
export const CARD_FOV = 26;
/** Thickness as a fraction of face width — weight, not a slab. */
const DEPTH_FIT = 0.022;
const FLIP_MS = 520;
const TRACK_LERP = 0.18;
const REST_LERP = 0.11;
const FILL = new Color("#000000");
const EMPTY_SUBSCRIBE = () => () => {};

export type CardObjectPose = {
  yaw: number;
  pitch: number;
  tracking: boolean;
};

const CARD_GL = {
  alpha: true,
  antialias: true,
  powerPreference: "high-performance" as const,
  premultipliedAlpha: false,
};

const CARD_CAMERA = {
  fov: CARD_FOV,
  near: 0.1,
  far: 40,
  position: [0, 0, 4.6] as [number, number, number],
};

function lerp(current: number, target: number, amount: number) {
  return current + (target - current) * amount;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/** Shortest signed delta in (-π, π]. One half-turn, never a second spin. */
function shortestDelta(from: number, to: number) {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta <= -Math.PI) delta += Math.PI * 2;
  return delta;
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
  face,
  reduced,
  shadowRef,
  faceTiltRef,
}: {
  poseRef: RefObject<CardObjectPose>;
  face: MaserBotCardFace;
  reduced: boolean;
  shadowRef: RefObject<HTMLElement | null>;
  faceTiltRef: RefObject<HTMLElement | null>;
}) {
  const tiltRef = useRef<Group>(null);
  const flipRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: FILL,
        roughness: 0.62,
        metalness: 0.04,
      }),
    [],
  );
  const { viewport } = useThree();
  const outer = Math.min(viewport.width, viewport.height) * CARD_FIT;
  const depth = Math.max(outer * DEPTH_FIT, 0.028);
  const radius = outer * (RADIUS_N / ART);
  const halfZ = depth / 2;

  const geometry = useMemo(() => {
    if (outer < 0.05) return null;
    // Official ExtrudeGeometry: bevelEnabled defaults true — keep it off so
    // the edge is the cuboid side, not a lip around the type.
    const geo = new ExtrudeGeometry(roundedRectShape(outer, outer, radius), {
      depth,
      bevelEnabled: false,
      curveSegments: 16,
      steps: 1,
    });
    geo.translate(0, 0, -halfZ);
    geo.computeVertexNormals();
    return geo;
  }, [outer, radius, depth, halfZ]);

  useLayoutEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useLayoutEffect(() => {
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);

  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const flipCurrentRef = useRef(0);
  const flipFromRef = useRef(0);
  const flipTargetRef = useRef(0);
  const flipStartRef = useRef(0);
  const flipDurRef = useRef(FLIP_MS);
  const flippingRef = useRef(false);

  useEffect(() => {
    if (reduced) {
      flipCurrentRef.current = 0;
      flipTargetRef.current = 0;
      flippingRef.current = false;
      const group = flipRef.current;
      if (group) group.rotation.y = 0;
      const faceTilt = faceTiltRef.current;
      if (faceTilt) faceTilt.style.setProperty("--card-flip", "0deg");
      return;
    }
    const target = face === "back" ? Math.PI : 0;
    const from = flipCurrentRef.current;
    const delta = shortestDelta(from, target);
    if (Math.abs(delta) < 0.0008) {
      flipCurrentRef.current = target;
      flipTargetRef.current = target;
      flippingRef.current = false;
      return;
    }
    flipFromRef.current = from;
    flipTargetRef.current = target;
    flipStartRef.current = performance.now();
    flipDurRef.current = Math.max(180, (Math.abs(delta) / Math.PI) * FLIP_MS);
    flippingRef.current = true;
  }, [face, reduced, faceTiltRef]);

  useFrame(() => {
    const tilt = tiltRef.current;
    const pose = poseRef.current;
    if (!tilt || !pose) return;

    const rest = reduced || !pose.tracking;
    const amount = rest ? REST_LERP : TRACK_LERP;
    const yawTarget = reduced ? 0 : pose.yaw;
    const pitchTarget = reduced ? 0 : pose.pitch;
    yawRef.current = lerp(yawRef.current, yawTarget, amount);
    pitchRef.current = lerp(pitchRef.current, pitchTarget, amount);
    tilt.rotation.x = (pitchRef.current * Math.PI) / 180;
    tilt.rotation.y = (yawRef.current * Math.PI) / 180;

    const flip = flipRef.current;
    if (flip) {
      if (reduced) {
        flipCurrentRef.current = 0;
        flip.rotation.y = 0;
      } else if (flippingRef.current) {
        const t = Math.min(
          1,
          (performance.now() - flipStartRef.current) / flipDurRef.current,
        );
        const eased = easeOutCubic(t);
        const delta = shortestDelta(flipFromRef.current, flipTargetRef.current);
        flipCurrentRef.current = flipFromRef.current + delta * eased;
        flip.rotation.y = flipCurrentRef.current;
        if (t >= 1) {
          flipCurrentRef.current = flipTargetRef.current;
          flip.rotation.y = flipTargetRef.current;
          flippingRef.current = false;
        }
      } else {
        flip.rotation.y = flipCurrentRef.current;
      }
    }

    const faceTilt = faceTiltRef.current;
    if (faceTilt) {
      const layer = faceTilt.parentElement;
      if (layer) {
        const height = faceTilt.offsetHeight;
        if (height > 0) {
          const persp =
            height / (2 * Math.tan(((CARD_FOV / 2) * Math.PI) / 180));
          layer.style.perspective = `${persp}px`;
        }
      }
      faceTilt.style.setProperty("--card-pitch", `${pitchRef.current}deg`);
      faceTilt.style.setProperty("--card-yaw", `${yawRef.current}deg`);
      faceTilt.style.setProperty(
        "--card-flip",
        reduced ? "0deg" : `${(flipCurrentRef.current * 180) / Math.PI}deg`,
      );
    }

    const shadow = shadowRef.current;
    if (shadow) {
      shadow.style.setProperty("--shadow-x", `${yawRef.current * 1.15}px`);
    }
  });

  if (!geometry || outer < 0.05) return null;

  return (
    <>
      {/* World lights so the cuboid side catches on tilt/flip. Not on the overlay type. */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[3.4, 0.2, 1.15]} intensity={0.95} />
      <directionalLight position={[-2.8, 0.55, 0.7]} intensity={0.38} />
      <group ref={tiltRef}>
        <group ref={flipRef}>
          <mesh ref={meshRef} geometry={geometry} material={material} />
        </group>
      </group>
    </>
  );
}

type CardObjectProps = {
  poseRef: RefObject<CardObjectPose>;
  face: MaserBotCardFace;
  reduced: boolean;
  shadowRef: RefObject<HTMLElement | null>;
  faceTiltRef: RefObject<HTMLElement | null>;
};

/**
 * Physical card body: thin rounded cuboid (ExtrudeGeometry, no bevel).
 * Type lives in a sibling overlay. Pose + one-shot flip are written here
 * so the mesh and overlay stay on the same object. No Three.js GLSL —
 * stage shaders stay vgpu.
 */
export function CardObject({
  poseRef,
  face,
  reduced,
  shadowRef,
  faceTiltRef,
}: CardObjectProps) {
  const isClient = useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    () => true,
    () => false,
  );
  const webgl = isClient && isWebGLAvailable();

  const dpr = useMemo(() => {
    if (typeof window === "undefined") return 1;
    const max = window.innerWidth < 768 ? 1.5 : 2;
    return getClampedPixelRatio(max);
  }, []);

  if (!isClient || !webgl) {
    return null;
  }

  return (
    <div className="maser-bot-card__object" data-three-canvas="" aria-hidden>
      <Canvas
        gl={CARD_GL}
        dpr={dpr}
        camera={CARD_CAMERA}
        style={{ pointerEvents: "none", overflow: "visible" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = NoToneMapping;
          gl.domElement.style.pointerEvents = "none";
        }}
      >
        <CardMesh
          poseRef={poseRef}
          face={face}
          reduced={reduced}
          shadowRef={shadowRef}
          faceTiltRef={faceTiltRef}
        />
      </Canvas>
    </div>
  );
}
