"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createRendererOptions } from "@/three/utils/renderer";
import { paintCurtainTexture } from "./curtain-style";
import type { TransitionSettings } from "./types";

type CurtainFallSceneProps = {
  settings: TransitionSettings;
  playKey: number;
  reducedMotion: boolean;
  running: boolean;
  holdMs: number;
};

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function easeInCubic(t: number) {
  return t * t * t;
}

/**
 * Opaque curtains: fall in to cover, hold, then fall out downward.
 * Destination page is the DOM layer underneath — not painted on the mesh.
 * Strip fill uses Color A / B + solid or gradient mode from settings.
 */
export function CurtainFallScene({
  settings,
  playKey,
  reducedMotion,
  running,
  holdMs,
}: CurtainFallSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !running) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width < 8 || height < 8) return;

    const curtains = Math.max(3, Math.min(16, Math.round(settings.curtains)));

    const renderer = new THREE.WebGLRenderer(createRendererOptions());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
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
    const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
    camera.position.z = 2;

    const worldHeight = 2.08;
    const worldWidth = aspect * 2;
    const stripWidth = worldWidth / curtains;
    const overlap = stripWidth * 0.12;

    const dropStart = reducedMotion ? 0 : worldHeight * 1.15;
    const dropEnd = reducedMotion ? 0 : -worldHeight * 1.15;

    const paintCanvas = paintCurtainTexture(
      settings.curtainColorA,
      settings.curtainColorB,
      settings.curtainGradient,
      64,
      256,
    );
    const texture = new THREE.CanvasTexture(paintCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    const meshes: THREE.Mesh[] = [];
    const geometries: THREE.PlaneGeometry[] = [];
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: false,
      depthWrite: false,
    });

    for (let i = 0; i < curtains; i++) {
      const geometry = new THREE.PlaneGeometry(stripWidth + overlap, worldHeight, 1, 1);
      geometries.push(geometry);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = -aspect + stripWidth * i + stripWidth / 2;
      mesh.position.y = dropStart;
      scene.add(mesh);
      meshes.push(mesh);
    }

    let raf = 0;
    const start = performance.now();
    const inMs = reducedMotion ? 140 : settings.duration;
    const outMs = reducedMotion ? 140 : settings.duration;
    const hold = reducedMotion ? 0 : holdMs;
    const stagger = reducedMotion ? 0 : settings.stagger;

    const tick = (now: number) => {
      let allDone = true;

      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        if (!mesh) continue;
        const local = now - start - i * stagger;
        const inT = Math.min(1, Math.max(0, local / inMs));
        const outLocal = local - inMs - hold;
        const outT = Math.min(1, Math.max(0, outLocal / outMs));

        if (local < inMs) {
          mesh.position.y = dropStart + (0 - dropStart) * easeInOutCubic(inT);
          allDone = false;
        } else if (local < inMs + hold) {
          mesh.position.y = 0;
          allDone = false;
        } else if (outT < 1) {
          mesh.position.y = 0 + (dropEnd - 0) * easeInCubic(outT);
          allDone = false;
        } else {
          mesh.position.y = dropEnd;
        }
      }

      renderer.render(scene, camera);
      if (!allDone) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const onResize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      const nextAspect = w / h;
      camera.left = -nextAspect;
      camera.right = nextAspect;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      for (const mesh of meshes) scene.remove(mesh);
      for (const geometry of geometries) geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    settings.curtains,
    settings.duration,
    settings.stagger,
    settings.intensity,
    settings.curtainColorA,
    settings.curtainColorB,
    settings.curtainGradient,
    playKey,
    reducedMotion,
    running,
    holdMs,
  ]);

  return (
    <div
      ref={containerRef}
      className="ptl-curtain-canvas"
      aria-hidden="true"
      data-running={running}
    />
  );
}
