"use client";

import type { ReactNode } from "react";
import { isWebGLAvailable } from "../utils/capabilities";
import { StaticFallback } from "../fallbacks/static-fallback";

type ThreeCanvasProps = {
  className?: string;
  fallback?: ReactNode;
  children: ReactNode;
};

/**
 * Shell for Three.js demos. Renders children when WebGL is available.
 * Scene code should use dynamic import with ssr: false at the demo route level.
 */
export function ThreeCanvas({
  className = "",
  fallback,
  children,
}: ThreeCanvasProps) {
  if (!isWebGLAvailable()) {
    return <>{fallback ?? <StaticFallback />}</>;
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      data-three-canvas=""
    >
      {children}
    </div>
  );
}
