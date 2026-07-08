"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createRendererOptions } from "@/three/utils/renderer";
import { paintPageTexture } from "./paint-page-texture";
import type { PageSample, TransitionSettings } from "./types";

type CurtainFallSceneProps = {
  toSample: PageSample;
  settings: TransitionSettings;
  playKey: number;
  reducedMotion: boolean;
  running: boolean;
};

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function makeStripGeometry(stripWidth: number, worldHeight: number, index: number, count: number) {
  const geometry = new THREE.PlaneGeometry(stripWidth * 1.02, worldHeight, 1, 1);
  const uvs = geometry.attributes.uv;
  if (!uvs) return geometry;

  // Remap plane UVs to a vertical slice of the destination texture
  const u0 = index / count;
  const u1 = (index + 1) / count;
  // PlaneGeometry UV order: (0,1), (1,1), (0,0), (1,0)
  uvs.setXY(0, u0, 1);
  uvs.setXY(1, u1, 1);
  uvs.setXY(2, u0, 0);
  uvs.setXY(3, u1, 0);
  uvs.needsUpdate = true;
  return geometry;
}

/**
 * Vertical curtains fall one-by-one. Each strip shows a UV slice of the
 * destination page texture painted onto a canvas.
 */
export function CurtainFallScene({
  toSample,
  settings,
  playKey,
  reducedMotion,
  running,
}: CurtainFallSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !running) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    // Skip when host is hidden / zero-sized (e.g. mobile CSS display:none).
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

    const paintCanvas = document.createElement("canvas");
    paintPageTexture(paintCanvas, toSample, width, height);
    const texture = new THREE.CanvasTexture(paintCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    const worldHeight = 2;
    const worldWidth = aspect * 2;
    const stripWidth = worldWidth / curtains;
    // Keep drop distance short enough that strips enter the frame early
    // (orthographic y spans [-1, 1]; overshooting too far looks like a blank stage).
    const dropStart = reducedMotion
      ? 0
      : worldHeight * (0.55 + settings.intensity / 250);

    const meshes: THREE.Mesh[] = [];
    const geometries: THREE.PlaneGeometry[] = [];
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });

    const gap = stripWidth * 0.02;

    for (let i = 0; i < curtains; i++) {
      const geometry = makeStripGeometry(
        Math.max(stripWidth - gap, stripWidth * 0.92),
        worldHeight,
        i,
        curtains,
      );
      geometries.push(geometry);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = -aspect + stripWidth * i + stripWidth / 2;
      mesh.position.y = dropStart;
      scene.add(mesh);
      meshes.push(mesh);
    }

    let raf = 0;
    const start = performance.now();
    const duration = reducedMotion ? 140 : settings.duration;
    const stagger = reducedMotion ? 0 : settings.stagger;

    const tick = (now: number) => {
      let allDone = true;

      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        if (!mesh) continue;
        const localT = Math.min(
          1,
          Math.max(0, (now - start - i * stagger) / duration),
        );
        mesh.position.y = dropStart * (1 - easeOutCubic(localT));
        if (localT < 1) allDone = false;
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
      for (const mesh of meshes) {
        scene.remove(mesh);
      }
      for (const geometry of geometries) geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    toSample,
    settings.curtains,
    settings.duration,
    settings.stagger,
    settings.intensity,
    playKey,
    reducedMotion,
    running,
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
