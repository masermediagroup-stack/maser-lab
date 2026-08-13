"use client";

import { useEffect, useRef } from "react";
import { LogoGalleryEngine } from "../scene/logo-gallery-engine";

type GalleryCanvasProps = {
  onEngine: (engine: LogoGalleryEngine | null) => void;
};

export function GalleryCanvas({ onEngine }: GalleryCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onEngineRef = useRef(onEngine);
  onEngineRef.current = onEngine;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new LogoGalleryEngine(canvas);
    engine.start();
    onEngineRef.current(engine);
    return () => {
      engine.dispose();
      onEngineRef.current(null);
    };
  }, []);

  return <canvas ref={canvasRef} className="lmg-canvas" aria-hidden="true" />;
}
