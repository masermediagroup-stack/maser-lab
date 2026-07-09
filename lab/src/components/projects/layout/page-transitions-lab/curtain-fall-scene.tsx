"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createRendererOptions } from "@/three/utils/renderer";
import {
  applyStripUVs,
  createCurtainStripGeometry,
  curtainLeadingSideIn,
  curtainLeadingSideOut,
  curtainMaxStaggerRank,
  curtainStaggerRank,
  paintCurtainTexture,
} from "./curtain-style";
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
 * Opaque curtains: enter to cover, hold, then exit to reveal.
 * Direction, stagger origin, and edge shape are independent per phase.
 * Destination page is the DOM layer underneath — not painted on the mesh.
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
    // Abut strips — any intentional overlap reads as stepped seams
    // once gradients + stagger put neighbors at different Y.
    const stripWidth = worldWidth / curtains;
    const overlap = 0;

    const travel = reducedMotion ? 0 : worldHeight * 1.15;
    const dirIn = settings.curtainDirIn;
    const dirOut = settings.curtainDirOut;
    const inStart = dirIn === "top" ? travel : -travel;
    const outEnd = dirOut === "top" ? travel : -travel;

    // Horizontal: one wide texture so A→B spans the whole stage.
    // Vertical/solid: a single strip-sized texture is enough.
    const texW =
      settings.curtainGradient === "horizontal"
        ? Math.max(64, curtains * 32)
        : 64;
    const paintCanvas = paintCurtainTexture(
      settings.curtainColorA,
      settings.curtainColorB,
      settings.curtainGradient,
      texW,
      256,
    );
    const texture = new THREE.CanvasTexture(paintCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    const meshes: THREE.Mesh[] = [];
    const geometriesIn: THREE.BufferGeometry[] = [];
    const geometriesOut: THREE.BufferGeometry[] = [];
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const edgeIn = settings.curtainEdgeIn;
    const edgeOut = settings.curtainEdgeOut;
    const sideIn = curtainLeadingSideIn(dirIn);
    const sideOut = curtainLeadingSideOut(dirOut);
    const needsOutGeo =
      edgeIn !== edgeOut || sideIn !== sideOut;

    for (let i = 0; i < curtains; i++) {
      const geoIn = createCurtainStripGeometry(
        stripWidth + overlap,
        worldHeight,
        edgeIn,
        sideIn,
        edgeIn === "flat" ? 1 : 32,
      );
      if (settings.curtainGradient === "horizontal") {
        applyStripUVs(geoIn, i, curtains);
      }
      geometriesIn.push(geoIn);

      let geoOut: THREE.BufferGeometry | null = null;
      if (needsOutGeo) {
        geoOut = createCurtainStripGeometry(
          stripWidth + overlap,
          worldHeight,
          edgeOut,
          sideOut,
          edgeOut === "flat" ? 1 : 32,
        );
        if (settings.curtainGradient === "horizontal") {
          applyStripUVs(geoOut, i, curtains);
        }
        geometriesOut.push(geoOut);
      }

      const mesh = new THREE.Mesh(geoIn, material);
      mesh.position.x = -aspect + stripWidth * i + stripWidth / 2;
      mesh.position.y = inStart;
      scene.add(mesh);
      meshes.push(mesh);
    }

    let raf = 0;
    const start = performance.now();
    const inMs = reducedMotion ? 140 : settings.duration;
    const outMs = reducedMotion ? 140 : settings.duration;
    const hold = reducedMotion ? 0 : holdMs;
    const stagger = reducedMotion ? 0 : settings.stagger;
    const fallIn = settings.curtainFallIn;
    const fallOut = settings.curtainFallOut;
    // Out phase is global: wait until every strip has finished falling in
    // (+ hold), then stagger fall-out by its own origin. Mixing origins
    // (e.g. in right→left, out left→right) no longer cancels the out wave.
    const outPhaseStart =
      curtainMaxStaggerRank(curtains, fallIn) * stagger + inMs + hold;
    let swappedToOut = false;

    const tick = (now: number) => {
      let allDone = true;
      const elapsed = now - start;

      if (needsOutGeo && !swappedToOut && elapsed >= outPhaseStart) {
        for (let i = 0; i < meshes.length; i++) {
          const mesh = meshes[i];
          const geoOut = geometriesOut[i];
          if (mesh && geoOut) mesh.geometry = geoOut;
        }
        swappedToOut = true;
      }

      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        if (!mesh) continue;
        const inDelay = curtainStaggerRank(i, curtains, fallIn) * stagger;
        const outDelay =
          outPhaseStart + curtainStaggerRank(i, curtains, fallOut) * stagger;
        const localIn = elapsed - inDelay;
        const inT = Math.min(1, Math.max(0, localIn / inMs));
        const outLocal = elapsed - outDelay;
        const outT = Math.min(1, Math.max(0, outLocal / outMs));

        if (localIn < 0) {
          mesh.position.y = inStart;
          allDone = false;
        } else if (localIn < inMs) {
          mesh.position.y = inStart + (0 - inStart) * easeInOutCubic(inT);
          allDone = false;
        } else if (elapsed < outDelay) {
          mesh.position.y = 0;
          allDone = false;
        } else if (outT < 1) {
          mesh.position.y = 0 + (outEnd - 0) * easeInCubic(outT);
          allDone = false;
        } else {
          mesh.position.y = outEnd;
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
      for (const geometry of geometriesIn) geometry.dispose();
      for (const geometry of geometriesOut) geometry.dispose();
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
    settings.curtainFallIn,
    settings.curtainFallOut,
    settings.curtainDirIn,
    settings.curtainDirOut,
    settings.curtainEdgeIn,
    settings.curtainEdgeOut,
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
