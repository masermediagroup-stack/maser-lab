"use client";

import { useEffect, useRef } from "react";
import { LogoGalleryEngine } from "../scene/logo-gallery-engine";

type GalleryCanvasProps = {
  onEngine: (engine: LogoGalleryEngine | null) => void;
};

export function GalleryCanvas({ onEngine }: GalleryCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new LogoGalleryEngine(canvas);
    engine.start();
    onEngine(engine);
    return () => {
      engine.dispose();
      onEngine(null);
    };
  }, [onEngine]);

  return <canvas ref={canvasRef} className="lmg-canvas" aria-hidden="true" />;
}
