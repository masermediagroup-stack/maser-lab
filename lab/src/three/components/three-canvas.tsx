"use client";

import { useMemo, type ReactNode } from "react";
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
  // Memoize so we never re-probe (isWebGLAvailable is also cached globally).
  const available = useMemo(() => isWebGLAvailable(), []);

  if (!available) {
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
