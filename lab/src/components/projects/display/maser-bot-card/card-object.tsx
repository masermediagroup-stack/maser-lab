"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  NoToneMapping,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  Vector2,
} from "three";
import {
  getClampedPixelRatio,
  isWebGLAvailable,
} from "@/three/utils/capabilities";
import {
  createCardFaceTextures,
  type CardFaceTextures,
} from "./face-maps";
import {
  createMarkTickState,
  lookFromCardFace,
  makeEngine,
  MARK_SLOT,
  paintBotFrame,
  plantMark,
  tickBotMark,
  type MarkLookPointer,
} from "./grok-bot-mark";
import type { MaserBotCardFace } from "./types";

const ART = 1299;
const RADIUS_N = 80;
/** Mesh and face overlay share this fraction of the square stack. */
export const CARD_FIT = 0.88;
export const CARD_FOV = 26;
/** Thickness as a fraction of face width — weight on tilt/flip, not a slab. */
const DEPTH_FIT = 0.05;
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

export type CardShine = {
  on: boolean;
  x: number;
  y: number;
  amount: number;
};

export const REST_SHINE: CardShine = {
  on: false,
  x: 0.5,
  y: 0.5,
  amount: 0,
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

/** Map lid x/y into 0–1 so the type texture sits on the face, not in world units. */
function cardUVGenerator(outer: number) {
  const scale = 1 / outer;
  return {
    generateTopUV(
      _geometry: ExtrudeGeometry,
      vertices: number[],
      indexA: number,
      indexB: number,
      indexC: number,
    ) {
      const uv = (index: number) =>
        new Vector2(
          vertices[index * 3]! * scale + 0.5,
          vertices[index * 3 + 1]! * scale + 0.5,
        );
      return [uv(indexA), uv(indexB), uv(indexC)];
    },
    generateSideWallUV() {
      return [
        new Vector2(0, 0),
        new Vector2(1, 0),
        new Vector2(1, 1),
        new Vector2(0, 1),
      ];
    },
  };
}

/**
 * ExtrudeGeometry groups: 0 = both lids, 1 = sides.
 * Split the lids so front and back can carry different type maps.
 */
function regroupCardCaps(geometry: ExtrudeGeometry) {
  const lid = geometry.groups[0];
  const sides = geometry.groups[1];
  if (!lid || !sides || lid.count % 2 !== 0) return;
  const half = lid.count / 2;
  geometry.clearGroups();
  geometry.addGroup(lid.start, half, 2);
  geometry.addGroup(lid.start + half, half, 1);
  geometry.addGroup(sides.start, sides.count, 0);
  const uv = geometry.attributes.uv;
  if (!uv) return;
  for (let i = lid.start; i < lid.start + half; i += 1) {
    uv.setX(i, 1 - uv.getX(i));
  }
  uv.needsUpdate = true;
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

function CardMark({
  outer,
  halfZ,
  reduced,
  live,
  lookPointerRef,
  faceRef,
}: {
  outer: number;
  halfZ: number;
  reduced: boolean;
  live: boolean;
  lookPointerRef: RefObject<MarkLookPointer | null>;
  faceRef: RefObject<HTMLElement | null>;
}) {
  const slotW = outer * (MARK_SLOT.w / MARK_SLOT.art);
  const slotH = outer * (MARK_SLOT.h / MARK_SLOT.art);
  const x = ((MARK_SLOT.x + MARK_SLOT.w / 2) / MARK_SLOT.art - 0.5) * outer;
  const y = -((MARK_SLOT.y + MARK_SLOT.h / 2) / MARK_SLOT.art - 0.5) * outer;
  const z = -halfZ - 0.004;
  const engine = useMemo(() => makeEngine(), []);
  const tickState = useMemo(() => createMarkTickState(), []);
  const clockRef = useRef(0);
  const lastRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<CanvasTexture | null>(null);
  const material = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = MARK_SLOT.w * 2;
    canvas.height = MARK_SLOT.h * 2;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    return new MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
  }, []);

  useLayoutEffect(() => {
    const texture = material.map;
    canvasRef.current =
      texture instanceof CanvasTexture &&
      texture.image instanceof HTMLCanvasElement
        ? texture.image
        : null;
    textureRef.current = texture instanceof CanvasTexture ? texture : null;
    return () => {
      material.dispose();
      if (texture instanceof CanvasTexture) texture.dispose();
      canvasRef.current = null;
      textureRef.current = null;
    };
  }, [material]);

  useEffect(() => {
    if (reduced) {
      clockRef.current = 0;
      lastRef.current = 0;
      plantMark(engine, 0);
      return;
    }
    if (clockRef.current < 0) clockRef.current = 0;
  }, [engine, reduced]);

  useFrame(() => {
    const canvas = canvasRef.current;
    const texture = textureRef.current;
    if (!canvas || !texture) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (reduced) {
      if (clockRef.current !== 0) return;
      plantMark(engine, 0);
      paintBotFrame(ctx, engine.sample(0), canvas.width, canvas.height);
      texture.needsUpdate = true;
      clockRef.current = -1;
      return;
    }
    if (!live) {
      lastRef.current = 0;
      if (clockRef.current === 0) {
        plantMark(engine, 0);
        paintBotFrame(ctx, engine.sample(0), canvas.width, canvas.height);
        texture.needsUpdate = true;
        clockRef.current = 0.0001;
      }
      return;
    }
    const now = performance.now();
    const dt = lastRef.current
      ? Math.min((now - lastRef.current) / 1000, 0.064)
      : 0;
    lastRef.current = now;
    clockRef.current = Math.max(clockRef.current, 0) + dt;
    const pointer = lookPointerRef.current;
    const faceBox = faceRef.current?.getBoundingClientRect() ?? null;
    const look =
      pointer?.tracking && faceBox
        ? lookFromCardFace(pointer, faceBox)
        : null;
    const frame = tickBotMark(
      engine,
      clockRef.current,
      tickState,
      true,
      look,
    );
    paintBotFrame(ctx, frame, canvas.width, canvas.height);
    texture.needsUpdate = true;
  });

  if (outer < 0.05) return null;

  return (
    <mesh
      position={[x, y, z]}
      rotation={[0, Math.PI, 0]}
      material={material}
      renderOrder={2}
    >
      <planeGeometry args={[slotW, slotH]} />
    </mesh>
  );
}

function CardSheen({
  outer,
  radius,
  halfZ,
  shineRef,
}: {
  outer: number;
  radius: number;
  halfZ: number;
  shineRef: RefObject<CardShine>;
}) {
  const geometry = useMemo(() => {
    const geo = new ShapeGeometry(roundedRectShape(outer, outer, radius), 24);
    geo.computeVertexNormals();
    return geo;
  }, [outer, radius]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<CanvasTexture | null>(null);
  const materialRef = useRef<MeshBasicMaterial | null>(null);
  const material = useMemo(
    () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      return new MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        toneMapped: false,
        blending: AdditiveBlending,
        visible: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
    },
    [],
  );

  useLayoutEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useLayoutEffect(() => {
    const texture = material.map;
    canvasRef.current =
      texture instanceof CanvasTexture && texture.image instanceof HTMLCanvasElement
        ? texture.image
        : null;
    textureRef.current = texture instanceof CanvasTexture ? texture : null;
    materialRef.current = material;
    return () => {
      material.dispose();
      if (texture instanceof CanvasTexture) texture.dispose();
      canvasRef.current = null;
      textureRef.current = null;
      materialRef.current = null;
    };
  }, [material]);

  useFrame(() => {
    const canvas = canvasRef.current;
    const texture = textureRef.current;
    const sheenMat = materialRef.current;
    if (!canvas || !texture || !sheenMat) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const shine = shineRef.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, 256, 256);
    if (!shine?.on || shine.amount <= 0.001) {
      sheenMat.visible = false;
      texture.needsUpdate = true;
      return;
    }
    sheenMat.visible = true;
    const gx = shine.x * 256;
    const gy = shine.y * 256;
    const wash = ctx.createRadialGradient(gx, gy, 8, gx, gy, 210);
    wash.addColorStop(0, `rgba(255, 255, 255, ${shine.amount * 0.26})`);
    wash.addColorStop(0.36, `rgba(255, 255, 255, ${shine.amount * 0.08})`);
    wash.addColorStop(0.7, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, 256, 256);
    texture.needsUpdate = true;
  });

  if (outer < 0.05) return null;
  const lift = 0.003;

  return (
    <>
      <mesh
        geometry={geometry}
        material={material}
        position={[0, 0, halfZ + lift]}
        renderOrder={1}
      />
      <mesh
        geometry={geometry}
        material={material}
        position={[0, 0, -(halfZ + lift)]}
        rotation={[0, Math.PI, 0]}
        renderOrder={1}
      />
    </>
  );
}

function CardMesh({
  poseRef,
  face,
  reduced,
  shadowRef,
  faceTiltRef,
  faceRef,
  lookPointerRef,
  shineRef,
  maps,
}: {
  poseRef: RefObject<CardObjectPose>;
  face: MaserBotCardFace;
  reduced: boolean;
  shadowRef: RefObject<HTMLElement | null>;
  faceTiltRef: RefObject<HTMLElement | null>;
  faceRef: RefObject<HTMLElement | null>;
  lookPointerRef: RefObject<MarkLookPointer | null>;
  shineRef: RefObject<CardShine>;
  maps: CardFaceTextures | null;
}) {
  const tiltRef = useRef<Group>(null);
  const flipRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const sideMaterial = useMemo(
    () =>
      // Albedo is locked #000, so PBR diffuse is 0. Phong specular is how
      // the cuboid side reads on tilt — satin, not chrome or iridescence.
      new MeshPhongMaterial({
        color: FILL,
        specular: new Color("#6e6e6e"),
        shininess: 32,
        toneMapped: false,
      }),
    [],
  );
  const frontMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: maps ? 0xffffff : FILL,
        map: maps?.front ?? null,
        toneMapped: false,
      }),
    [maps],
  );
  const backMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: maps ? 0xffffff : FILL,
        map: maps?.back ?? null,
        toneMapped: false,
      }),
    [maps],
  );
  const materials = useMemo(
    () => [sideMaterial, frontMaterial, backMaterial],
    [sideMaterial, frontMaterial, backMaterial],
  );
  const { viewport } = useThree();
  const outer = Math.min(viewport.width, viewport.height) * CARD_FIT;
  const depth = Math.max(outer * DEPTH_FIT, 0.045);
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
      UVGenerator: cardUVGenerator(outer),
    });
    geo.translate(0, 0, -halfZ);
    regroupCardCaps(geo);
    geo.computeVertexNormals();
    return geo;
  }, [outer, radius, depth, halfZ]);

  useLayoutEffect(() => {
    return () => {
      sideMaterial.dispose();
      frontMaterial.dispose();
      backMaterial.dispose();
    };
  }, [sideMaterial, frontMaterial, backMaterial]);

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
      {/* World lights so the cuboid side catches on tilt/flip. Not on the lid type. */}
      <ambientLight intensity={0.16} />
      <directionalLight position={[3.6, 0.35, 2.1]} intensity={1.55} />
      <directionalLight position={[-2.6, 1.1, 1.2]} intensity={0.7} />
      <directionalLight position={[0.2, -2.2, 1.4]} intensity={0.4} />
      <group ref={tiltRef}>
        <group ref={flipRef}>
          <mesh ref={meshRef} geometry={geometry} material={materials} />
          <CardSheen
            outer={outer}
            radius={radius}
            halfZ={halfZ}
            shineRef={shineRef}
          />
          <CardMark
            outer={outer}
            halfZ={halfZ}
            reduced={reduced}
            live={face === "back"}
            lookPointerRef={lookPointerRef}
            faceRef={faceRef}
          />
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
  faceRef: RefObject<HTMLElement | null>;
  lookPointerRef: RefObject<MarkLookPointer | null>;
  shineRef: RefObject<CardShine>;
  onFaceMapsReady?: (ready: boolean) => void;
};

/**
 * Physical card body: thin rounded cuboid (ExtrudeGeometry, no bevel).
 * Type is painted on the lid maps (flat Display Trial). Pose + one-shot
 * flip are written here so the mark, sheen, and type stay on this card.
 * No Three.js GLSL — stage shaders stay vgpu.
 */
export function CardObject({
  poseRef,
  face,
  reduced,
  shadowRef,
  faceTiltRef,
  faceRef,
  lookPointerRef,
  shineRef,
  onFaceMapsReady,
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
  const [maps, setMaps] = useState<CardFaceTextures | null>(null);

  useEffect(() => {
    if (!isClient || !webgl) {
      onFaceMapsReady?.(false);
      return;
    }
    let cancelled = false;
    let held: CardFaceTextures | null = null;
    void createCardFaceTextures()
      .then((next) => {
        if (cancelled) {
          next.front.dispose();
          next.back.dispose();
          return;
        }
        held = next;
        setMaps(next);
        onFaceMapsReady?.(true);
      })
      .catch(() => {
        if (!cancelled) onFaceMapsReady?.(false);
      });
    return () => {
      cancelled = true;
      held?.front.dispose();
      held?.back.dispose();
      setMaps(null);
    };
  }, [isClient, webgl, onFaceMapsReady]);

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
          faceRef={faceRef}
          lookPointerRef={lookPointerRef}
          shineRef={shineRef}
          maps={maps}
        />
      </Canvas>
    </div>
  );
}
