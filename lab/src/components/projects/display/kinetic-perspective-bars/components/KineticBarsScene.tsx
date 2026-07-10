"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { getClampedPixelRatio } from "@/three/utils/capabilities";
import { CameraRig } from "./CameraRig";
import { SceneLighting } from "./SceneLighting";
import { BarsFormation } from "./BarsFormation";
import { useKineticWave } from "../hooks/useKineticWave";
import { usePointerInfluence } from "../hooks/usePointerInfluence";
import { useClickRipple } from "../hooks/useClickRipple";
import { useMotionModeBlend } from "../hooks/useMotionModeBlend";
import type { KineticBarsParams } from "../types/kinetic-bars";

type KineticBarsSceneProps = {
  params: KineticBarsParams;
  reducedMotion: boolean;
};

function SceneInner({
  params,
  reducedMotion,
  inView,
}: KineticBarsSceneProps & { inView: boolean }) {
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const modeBlend = useMotionModeBlend(params.animationMode);
  const pointer = usePointerInfluence(32);
  const ripple = useClickRipple();

  const getParams = useCallback(
    () => ({
      barCount: paramsRef.current.barCount,
      liftAmplitude: paramsRef.current.liftAmplitude,
      waveSpeed: paramsRef.current.waveSpeed,
      phaseOffset: paramsRef.current.phaseOffset,
      waveDirection: paramsRef.current.waveDirection,
      paused: paramsRef.current.paused,
      reducedMotion:
        reducedMotion || paramsRef.current.reducedMotionPreview,
    }),
    [reducedMotion],
  );

  const getRipple = useCallback(
    (index: number) =>
      ripple.sample(
        index,
        paramsRef.current.rippleStrength,
        paramsRef.current.rippleSpeed,
        paramsRef.current.rippleDecay,
      ),
    [ripple],
  );

  const wave = useKineticWave({
    getModes: modeBlend.getModes,
    getHover: pointer.getStrength,
    getRipple,
    getParams,
  });

  // Expose reset via custom event from chrome UI.
  useEffect(() => {
    const onReset = () => {
      wave.resetTime();
      ripple.reset();
      pointer.reset();
    };
    window.addEventListener("kinetic-bars:reset", onReset);
    return () => window.removeEventListener("kinetic-bars:reset", onReset);
  }, [wave, ripple, pointer]);

  return (
    <>
      <color attach="background" args={[params.backgroundColor]} />
      <fog attach="fog" args={[params.backgroundColor, 8, 22]} />
      <SceneLighting />
      <CameraRig
        position={params.cameraPosition}
        zoom={params.cameraZoom}
        drift={params.cameraDrift}
        reducedMotion={reducedMotion || params.reducedMotionPreview}
      />
      <BarsFormation
        params={params}
        wave={wave}
        pointer={pointer}
        ripple={ripple}
        modeBlend={modeBlend}
        inView={inView}
      />
    </>
  );
}

export function KineticBarsScene({
  params,
  reducedMotion,
}: KineticBarsSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const dpr = useMemo(() => {
    if (typeof window === "undefined") return 1;
    // Clamp harder on narrow viewports (mobile).
    const max = window.innerWidth < 768 ? 1.5 : 2;
    return getClampedPixelRatio(max);
  }, []);

  return (
    <div ref={containerRef} className="kinetic-bars-canvas h-full w-full">
      <Canvas
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{
          fov: 28,
          near: 0.1,
          far: 60,
          position: params.cameraPosition,
        }}
        frameloop={inView ? "always" : "demand"}
        style={{ width: "100%", height: "100%", touchAction: "none" }}
      >
        <SceneInner
          params={params}
          reducedMotion={reducedMotion}
          inView={inView}
        />
      </Canvas>
    </div>
  );
}
