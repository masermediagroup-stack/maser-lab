"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createRendererOptions } from "@/three/utils/renderer";
import { sanitizeHex } from "./curtain-style";
import { paintPageSample } from "./paint-page-sample";
import type { PageSample, PixelColorMode, TransitionSettings } from "./types";

type PixelWormholeSceneProps = {
  settings: TransitionSettings;
  playKey: number;
  reducedMotion: boolean;
  running: boolean;
  holdMs: number;
  fromSample: PageSample;
  toSample: PageSample;
  /** Fired once the wormhole has fully covered the stage (mid-transition). */
  onCovered?: () => void;
};

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInCubic(t: number) {
  return t * t * t;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = sanitizeHex(hex, "#10a4ff").slice(1);
  const n = Number.parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function resolvePixelColor(
  mode: PixelColorMode,
  sampled: [number, number, number],
  u: number,
  v: number,
  colorA: string,
  colorB: string,
): [number, number, number] {
  if (mode === "preserve") return sampled;
  if (mode === "white") return [255, 255, 255];
  const [ar, ag, ab] = hexToRgb(colorA);
  if (mode === "solid") return [ar, ag, ab];
  const [br, bg, bb] = hexToRgb(colorB);
  const t = (u + v) * 0.5;
  return [
    Math.round(ar + (br - ar) * t),
    Math.round(ag + (bg - ag) * t),
    Math.round(ab + (bb - ab) * t),
  ];
}

const planeVertexShader = /* glsl */ `
  attribute vec3 instanceColorAttr;
  attribute float instanceSeed;
  varying vec3 vColor;
  varying float vGlow;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vColor = instanceColorAttr;
    vGlow = 0.55 + instanceSeed * 0.45;
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const planeFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vGlow;
  varying vec2 vUv;
  uniform float uGlowBoost;
  uniform float uOpacity;

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float d = max(abs(uv.x), abs(uv.y));
    float core = 1.0 - smoothstep(0.42, 0.98, d);
    float halo = 1.0 - smoothstep(0.15, 1.2, length(uv));
    float alpha = (core * 0.9 + halo * 0.5 * uGlowBoost) * uOpacity;
    if (alpha < 0.02) discard;
    vec3 col = vColor * (1.0 + uGlowBoost * vGlow * 0.9);
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`;

type ParticleData = {
  start: Float32Array;
  end: Float32Array;
  delay: Float32Array;
  seed: Float32Array;
  count: number;
  cols: number;
  rows: number;
};

function buildParticles(
  cols: number,
  rows: number,
  aspect: number,
  fromCanvas: HTMLCanvasElement,
  toCanvas: HTMLCanvasElement,
  mode: PixelColorMode,
  colorA: string,
  colorB: string,
): {
  from: ParticleData;
  to: ParticleData;
  fromColors: Float32Array;
  toColors: Float32Array;
} {
  const count = cols * rows;
  const worldW = aspect * 2;
  const worldH = 2;
  const cellW = worldW / cols;
  const cellH = worldH / rows;

  const fromCtx = fromCanvas.getContext("2d", { willReadFrequently: true });
  const toCtx = toCanvas.getContext("2d", { willReadFrequently: true });
  const fromImg = fromCtx?.getImageData(0, 0, fromCanvas.width, fromCanvas.height);
  const toImg = toCtx?.getImageData(0, 0, toCanvas.width, toCanvas.height);

  const start = new Float32Array(count * 3);
  const end = new Float32Array(count * 3);
  const delay = new Float32Array(count);
  const seed = new Float32Array(count);
  const fromColors = new Float32Array(count * 3);
  const toColors = new Float32Array(count * 3);

  const sample = (
    img: ImageData | undefined,
    u: number,
    v: number,
  ): [number, number, number] => {
    if (!img) return [16, 164, 255];
    const x = Math.min(img.width - 1, Math.max(0, Math.floor(u * (img.width - 1))));
    const y = Math.min(img.height - 1, Math.max(0, Math.floor(v * (img.height - 1))));
    const i = (y * img.width + x) * 4;
    return [img.data[i] ?? 16, img.data[i + 1] ?? 164, img.data[i + 2] ?? 255];
  };

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      const u = (col + 0.5) / cols;
      const v = (row + 0.5) / rows;
      const x = -aspect + cellW * col + cellW / 2;
      const y = 1 - cellH * row - cellH / 2;

      start[i * 3] = x;
      start[i * 3 + 1] = y;
      start[i * 3 + 2] = 0;

      // Corner → center delay (Chebyshev distance from nearest corner, inverted)
      const dCorner = Math.min(u, 1 - u, v, 1 - v);
      // Edges/corners first: low dCorner → early. Center last.
      delay[i] = dCorner; // 0 at edge/corner-ish… actually min(u,1-u) is 0 at edge
      // Wait: at corner u=0,v=0 → min=0 → first. At center u=0.5 → min=0.5 → last. Good.
      seed[i] = (Math.sin(col * 12.9898 + row * 78.233) * 43758.5453) % 1;
      if (seed[i] < 0) seed[i] += 1;

      // Spiral target near origin for suck phase
      const angle = Math.atan2(y, x) + seed[i] * 1.2;
      const radius = 0.02 + seed[i] * 0.04;
      end[i * 3] = Math.cos(angle) * radius;
      end[i * 3 + 1] = Math.sin(angle) * radius;
      end[i * 3 + 2] = -0.4 - seed[i] * 0.6;

      const fromSampled = sample(fromImg, u, v);
      const toSampled = sample(toImg, u, v);
      const fc = resolvePixelColor(mode, fromSampled, u, v, colorA, colorB);
      const tc = resolvePixelColor(mode, toSampled, u, v, colorA, colorB);
      fromColors[i * 3] = fc[0] / 255;
      fromColors[i * 3 + 1] = fc[1] / 255;
      fromColors[i * 3 + 2] = fc[2] / 255;
      toColors[i * 3] = tc[0] / 255;
      toColors[i * 3 + 1] = tc[1] / 255;
      toColors[i * 3 + 2] = tc[2] / 255;
    }
  }

  const base: ParticleData = {
    start,
    end,
    delay,
    seed,
    count,
    cols,
    rows,
  };

  return {
    from: base,
    to: {
      start: start.slice(),
      end: end.slice(),
      delay: delay.slice(),
      seed: seed.slice(),
      count,
      cols,
      rows,
    },
    fromColors,
    toColors,
  };
}

/**
 * Pixel Wormhole — page dissolves into glowing pixels (corners → center),
 * sucks into a dark wormhole with a zoom, then destination pixels emit and
 * reassemble. Same visualization on mobile and desktop when WebGL is available.
 */
export function PixelWormholeScene({
  settings,
  playKey,
  reducedMotion,
  running,
  holdMs,
  fromSample,
  toSample,
  onCovered,
}: PixelWormholeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const coveredRef = useRef(false);
  const onCoveredRef = useRef(onCovered);

  useEffect(() => {
    onCoveredRef.current = onCovered;
  }, [onCovered]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !running) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width < 8 || height < 8) return;

    coveredRef.current = false;

    const density = Math.max(
      12,
      Math.min(48, Math.round(settings.pixelDensity)),
    );
    // Keep visual identical; only clamp extreme counts on tiny stages.
    const cols = density;
    const rows = Math.max(10, Math.round(density * (height / Math.max(width, 1))));
    const count = cols * rows;

    const renderer = new THREE.WebGLRenderer(createRendererOptions());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = true;
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
    });

    const scene = new THREE.Scene();
    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(42, aspect, 0.05, 20);
    camera.position.set(0, 0, 2.35);
    camera.lookAt(0, 0, 0);

    const paintW = Math.min(512, Math.max(160, Math.round(width)));
    const paintH = Math.min(512, Math.max(160, Math.round(height)));
    const fromCanvas = paintPageSample(fromSample, paintW, paintH);
    const toCanvas = paintPageSample(toSample, paintW, paintH);

    const { from, fromColors, toColors } = buildParticles(
      cols,
      rows,
      aspect,
      fromCanvas,
      toCanvas,
      settings.pixelColorMode,
      settings.pixelColorA,
      settings.pixelColorB,
    );

    const cellW = (aspect * 2) / cols;
    const cellH = 2 / rows;
    const pixelSize = Math.min(cellW, cellH) * 0.82;

    const geometry = new THREE.PlaneGeometry(pixelSize, pixelSize);
    const colorAttr = new THREE.InstancedBufferAttribute(fromColors.slice(), 3);
    const seedAttr = new THREE.InstancedBufferAttribute(from.seed, 1);
    geometry.setAttribute("instanceColorAttr", colorAttr);
    geometry.setAttribute("instanceSeed", seedAttr);

    const material = new THREE.ShaderMaterial({
      vertexShader: planeVertexShader,
      fragmentShader: planeFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uGlowBoost: { value: 1.2 },
        uOpacity: { value: 1 },
      },
    });

    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);

    const dummy = new THREE.Object3D();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = from.start[i * 3]!;
      positions[i * 3 + 1] = from.start[i * 3 + 1]!;
      positions[i * 3 + 2] = from.start[i * 3 + 2]!;
      dummy.position.set(
        positions[i * 3]!,
        positions[i * 3 + 1]!,
        positions[i * 3 + 2]!,
      );
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // Wormhole disc + tunnel rings
    const holeGroup = new THREE.Group();
    scene.add(holeGroup);

    const holeMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.22, 48), holeMat);
    hole.position.z = -0.05;
    holeGroup.add(hole);

    const ringMats: THREE.MeshBasicMaterial[] = [];
    for (let r = 0; r < 5; r++) {
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(sanitizeHex(settings.pixelColorA, "#10a4ff")),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      ringMats.push(ringMat);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.18 + r * 0.07, 0.2 + r * 0.07, 48),
        ringMat,
      );
      ring.position.z = -0.08 - r * 0.04;
      holeGroup.add(ring);
    }

    const vignette = new THREE.Mesh(
      new THREE.PlaneGeometry(aspect * 4, 4),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    vignette.position.z = -1.2;
    scene.add(vignette);

    const intensity = settings.intensity / 100;
    const phaseMs = reducedMotion ? 160 : settings.duration;
    const floatMs = reducedMotion ? 40 : Math.round(phaseMs * 0.35);
    const suckMs = reducedMotion ? 80 : Math.round(phaseMs * 0.65);
    const tunnelMs = reducedMotion ? 40 : Math.max(120, holdMs + Math.round(phaseMs * 0.2));
    const emitMs = reducedMotion ? 80 : Math.round(phaseMs * 0.55);
    const assembleMs = reducedMotion ? 80 : Math.round(phaseMs * 0.45);
    const staggerSpread = reducedMotion ? 0 : Math.min(0.55, settings.stagger / 400);

    const tFloatEnd = floatMs;
    const tSuckEnd = tFloatEnd + suckMs;
    const tTunnelEnd = tSuckEnd + tunnelMs;
    const tEmitEnd = tTunnelEnd + emitMs;
    const tAssembleEnd = tEmitEnd + assembleMs;

    let raf = 0;
    const start = performance.now();
    let phase: "out" | "in" = "out";

    const setColors = (colors: Float32Array) => {
      const attr = geometry.getAttribute("instanceColorAttr") as THREE.InstancedBufferAttribute;
      for (let i = 0; i < count * 3; i++) {
        attr.array[i] = colors[i]!;
      }
      attr.needsUpdate = true;
    };

    const tick = (now: number) => {
      const elapsed = now - start;

      if (elapsed >= tSuckEnd && !coveredRef.current) {
        coveredRef.current = true;
        onCoveredRef.current?.();
      }

      if (elapsed >= tTunnelEnd && phase === "out") {
        phase = "in";
        setColors(toColors);
      }

      const glowBoost = material.uniforms.uGlowBoost!;
      const opacityUni = material.uniforms.uOpacity!;

      // Phase-level glow / opacity (not per-particle — shared material)
      if (elapsed < tFloatEnd) {
        const t = Math.min(1, elapsed / floatMs);
        glowBoost.value = 0.6 + t * 1.2;
        opacityUni.value = 1;
      } else if (elapsed < tSuckEnd) {
        const t = Math.min(1, (elapsed - tFloatEnd) / suckMs);
        glowBoost.value = 1.6 + t * 0.8;
        opacityUni.value = 1 - t * 0.25;
      } else if (elapsed < tTunnelEnd) {
        glowBoost.value = 0.4;
        opacityUni.value = 0.15;
      } else if (elapsed < tEmitEnd) {
        const t = Math.min(1, (elapsed - tTunnelEnd) / emitMs);
        glowBoost.value = 1.8 * (1 - t * 0.3);
        opacityUni.value = 0.4 + t * 0.6;
      } else {
        const t = easeOutCubic(
          Math.min(1, (elapsed - tEmitEnd) / Math.max(assembleMs, 1)),
        );
        glowBoost.value = 1.2 * (1 - t);
        opacityUni.value = 1 - t * 0.92;
      }

      // Camera zoom into wormhole during suck / tunnel
      let camZ = 2.35;
      let fov = 42;
      if (elapsed < tFloatEnd) {
        camZ = 2.35;
      } else if (elapsed < tSuckEnd) {
        const t = easeInCubic((elapsed - tFloatEnd) / suckMs);
        camZ = 2.35 - t * 1.55 * (0.6 + intensity * 0.4);
        fov = 42 + t * 18;
      } else if (elapsed < tTunnelEnd) {
        const t = (elapsed - tSuckEnd) / tunnelMs;
        camZ = 0.8 - t * 0.35;
        fov = 60 + Math.sin(t * Math.PI) * 8;
      } else if (elapsed < tEmitEnd) {
        const t = easeOutCubic((elapsed - tTunnelEnd) / emitMs);
        camZ = 0.45 + t * 1.9;
        fov = 58 - t * 16;
      } else {
        camZ = 2.35;
        fov = 42;
      }
      camera.position.z = camZ;
      camera.fov = fov;
      camera.updateProjectionMatrix();

      // Hole visibility
      if (elapsed < tFloatEnd) {
        holeMat.opacity = 0;
        for (const m of ringMats) m.opacity = 0;
        (vignette.material as THREE.MeshBasicMaterial).opacity = 0;
      } else if (elapsed < tSuckEnd) {
        const t = easeInOutCubic((elapsed - tFloatEnd) / suckMs);
        holeMat.opacity = t * 0.95;
        for (let i = 0; i < ringMats.length; i++) {
          ringMats[i]!.opacity = t * (0.55 - i * 0.08);
        }
        (vignette.material as THREE.MeshBasicMaterial).opacity = t * 0.55;
        holeGroup.rotation.z = elapsed * 0.0012;
      } else if (elapsed < tTunnelEnd) {
        holeMat.opacity = 1;
        for (let i = 0; i < ringMats.length; i++) {
          ringMats[i]!.opacity = 0.5 - i * 0.07;
        }
        (vignette.material as THREE.MeshBasicMaterial).opacity = 0.75;
        holeGroup.rotation.z = elapsed * 0.002;
        holeGroup.scale.setScalar(1 + Math.sin(elapsed * 0.008) * 0.04);
      } else if (elapsed < tEmitEnd) {
        const t = easeOutCubic((elapsed - tTunnelEnd) / emitMs);
        holeMat.opacity = 1 - t;
        for (let i = 0; i < ringMats.length; i++) {
          ringMats[i]!.opacity = (0.45 - i * 0.06) * (1 - t);
        }
        (vignette.material as THREE.MeshBasicMaterial).opacity = 0.65 * (1 - t);
        holeGroup.rotation.z = elapsed * 0.001;
      } else {
        holeMat.opacity = 0;
        for (const m of ringMats) m.opacity = 0;
        (vignette.material as THREE.MeshBasicMaterial).opacity = 0;
      }

      for (let i = 0; i < count; i++) {
        const d = from.delay[i]!;
        const seed = from.seed[i]!;
        const sx = from.start[i * 3]!;
        const sy = from.start[i * 3 + 1]!;
        const sz = from.start[i * 3 + 2]!;
        const ex = from.end[i * 3]!;
        const ey = from.end[i * 3 + 1]!;
        const ez = from.end[i * 3 + 2]!;

        let x = sx;
        let y = sy;
        let z = sz;
        let scale = 1;

        if (elapsed < tFloatEnd) {
          // Disintegrate: corners first → float
          const local =
            (elapsed / floatMs - d * staggerSpread) /
            Math.max(0.2, 1 - staggerSpread * 0.5);
          const t = easeOutCubic(Math.min(1, Math.max(0, local)));
          const floatAmp = 0.04 + intensity * 0.08;
          x = sx + Math.sin(now * 0.004 + seed * 6) * floatAmp * t;
          y = sy + Math.cos(now * 0.0035 + seed * 4) * floatAmp * t * 0.8;
          z = sz + t * 0.08 * seed;
          scale = 1 + t * 0.35;
        } else if (elapsed < tSuckEnd) {
          const local =
            (elapsed - tFloatEnd) / suckMs - d * staggerSpread * 0.35;
          const t = easeInCubic(Math.min(1, Math.max(0, local)));
          const swirl = t * (2.2 + seed);
          const cx = sx + (ex - sx) * t;
          const cy = sy + (ey - sy) * t;
          const cos = Math.cos(swirl);
          const sin = Math.sin(swirl);
          x = cx * cos - cy * sin * (0.35 + t * 0.65);
          y = cx * sin * (0.35 + t * 0.65) + cy * cos;
          z = sz + (ez - sz) * t;
          scale = 1.2 * (1 - t * 0.85) + 0.15;
        } else if (elapsed < tTunnelEnd) {
          x = ex + Math.sin(now * 0.01 + seed) * 0.01;
          y = ey + Math.cos(now * 0.01 + seed) * 0.01;
          z = ez;
          scale = 0.12;
        } else if (elapsed < tEmitEnd) {
          // Spit from wormhole; corners land first, then fill toward center.
          const local =
            (elapsed - tTunnelEnd) / emitMs - d * staggerSpread;
          const t = easeOutCubic(Math.min(1, Math.max(0, local)));
          const swirl = (1 - t) * (1.6 + seed);
          const cos = Math.cos(swirl);
          const sin = Math.sin(swirl);
          const px = ex + (sx - ex) * t;
          const py = ey + (sy - ey) * t;
          x = px * cos - py * sin * (1 - t);
          y = px * sin * (1 - t) + py * cos;
          z = ez + (0 - ez) * t;
          scale = 0.2 + t * 0.95;
        } else {
          const t = easeOutCubic(
            Math.min(1, (elapsed - tEmitEnd) / Math.max(assembleMs, 1)),
          );
          x = sx;
          y = sy;
          z = 0;
          scale = 1 + (1 - t) * 0.15;
        }

        dummy.position.set(x, y, z);
        dummy.scale.setScalar(scale);
        dummy.rotation.z = seed * 0.15;
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
      if (elapsed < tAssembleEnd + 40) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    const onResize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      hole.geometry.dispose();
      holeMat.dispose();
      for (const child of holeGroup.children) {
        const m = child as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
        else (m.material as THREE.Material | undefined)?.dispose();
      }
      vignette.geometry.dispose();
      (vignette.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    settings.duration,
    settings.intensity,
    settings.stagger,
    settings.pixelDensity,
    settings.pixelColorMode,
    settings.pixelColorA,
    settings.pixelColorB,
    playKey,
    reducedMotion,
    running,
    holdMs,
    fromSample,
    toSample,
  ]);

  return (
    <div
      ref={containerRef}
      className="ptl-wormhole-canvas"
      aria-hidden="true"
      data-running={running}
    />
  );
}
