"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { NoToneMapping } from "three";
import { getClampedPixelRatio } from "@/three/utils/capabilities";
import { TYPE_WORLD_CAMERA, TYPE_WORLD_GL } from "./constants";
import { TypographicSphere } from "./TypographicSphere";
import type { DragRotationApi } from "./useDragRotation";
import type { RefObject } from "react";

type TypeWorldCanvasProps = {
  quote: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  reducedMotion: boolean;
  revealEnd: number;
  overshoot: number;
  progressRef: RefObject<number>;
  drag: DragRotationApi;
  narrow: boolean;
};

export function TypeWorldCanvas({
  quote,
  textColor,
  backgroundColor,
  fontFamily,
  reducedMotion,
  revealEnd,
  overshoot,
  progressRef,
  drag,
  narrow,
}: TypeWorldCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.02 },
    );
    io.observe(host);
    return () => io.disconnect();
  }, []);

  const dpr = useMemo(() => {
    if (typeof window === "undefined") return 1;
    return getClampedPixelRatio(narrow ? 1.5 : 2);
  }, [narrow]);

  const gl = useMemo(
    () => ({
      ...TYPE_WORLD_GL,
      toneMapping: NoToneMapping,
    }),
    [],
  );

  return (
    <div ref={hostRef} className="type-world__canvas">
      <Canvas
        dpr={dpr}
        gl={gl}
        camera={TYPE_WORLD_CAMERA}
        frameloop={inView ? "always" : "demand"}
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          touchAction: "pan-y",
          background: backgroundColor,
        }}
      >
        <TypographicSphere
          quote={quote}
          textColor={textColor}
          fontFamily={fontFamily}
          reducedMotion={reducedMotion}
          revealEnd={revealEnd}
          overshoot={overshoot}
          progressRef={progressRef}
          drag={drag}
          narrow={narrow}
        />
      </Canvas>
    </div>
  );
}
