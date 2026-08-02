"use client";

import { useEffect, useRef } from "react";
import {
  cn,
  usePrefersReducedMotion,
  type AnimationPhase,
  type BaseAnimationProps,
} from "./shared";
import { isWebGLAvailable } from "@/three/utils/capabilities";
import "./text-animations.css";

export type TextFlip3DRevealProps = BaseAnimationProps & {
  flipSpeed?: number;
  stagger?: number;
  flipAxis?: "x" | "y";
  letterSpacing?: number;
  depth?: number;
};

type LetterMesh = {
  mesh: import("three").Mesh;
  startRot: number;
  delay: number;
};

function paintLetterCanvas(
  char: string,
  size: number,
  compact: boolean,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const scale = compact ? 1.4 : 2;
  const dim = Math.ceil(size * scale);
  canvas.width = dim;
  canvas.height = dim;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.clearRect(0, 0, dim, dim);
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${Math.round(dim * 0.72)}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char === " " ? "" : char, dim / 2, dim / 2 + dim * 0.04);
  return canvas;
}

function CssFlipFallback({
  text,
  playKey,
  compact,
  className,
  phase,
  flipSpeed,
  stagger,
  flipAxis,
}: {
  text: string;
  playKey: number;
  compact: boolean;
  className?: string;
  phase: AnimationPhase;
  flipSpeed: number;
  stagger: number;
  flipAxis: "x" | "y";
}) {
  const chars = [...text];
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center justify-center gap-0 font-medium tracking-tight text-white",
        compact ? "text-lg" : "text-3xl md:text-4xl",
        className,
      )}
      style={{ perspective: 900 }}
      aria-label={text}
    >
      {chars.map((char, i) => {
        const display = char === " " ? "\u00A0" : char;
        const delay =
          phase === "out" ? (chars.length - 1 - i) * stagger : i * stagger;
        return (
          <span
            key={`${playKey}-${phase}-${i}-${char}`}
            className="tal-animate-letter-flip inline-block origin-center"
            style={{
              animationDuration: `${flipSpeed}ms`,
              animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              animationDelay: `${delay}ms`,
              animationDirection: phase === "out" ? "reverse" : "normal",
              ["--tal-flip-from" as string]:
                flipAxis === "x" ? "rotateX(90deg)" : "rotateY(90deg)",
            }}
          >
            {display}
          </span>
        );
      })}
    </span>
  );
}

/**
 * Three.js letter-plane flip reveal. Each glyph is a CanvasTexture on a plane
 * that rotates into view with stagger. Falls back to a CSS 3D flip when WebGL
 * is unavailable or prefers-reduced-motion is on.
 */
export function TextFlip3DRevealAnimation({
  text,
  playKey = 0,
  compact = false,
  className,
  phase = "in",
  flipSpeed = 700,
  stagger = 55,
  flipAxis = "y",
  letterSpacing = 0.12,
  depth = 0.35,
}: TextFlip3DRevealProps) {
  const reduced = usePrefersReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const resolvedPhase: AnimationPhase = phase === "out" ? "out" : "in";

  useEffect(() => {
    if (reduced) return;

    const host = hostRef.current;
    if (!host) return;

    if (!isWebGLAvailable()) {
      if (fallbackRef.current) fallbackRef.current.hidden = false;
      host.hidden = true;
      return;
    }

    host.hidden = false;
    if (fallbackRef.current) fallbackRef.current.hidden = true;

    let disposed = false;
    let raf = 0;
    let renderer: import("three").WebGLRenderer | null = null;
    const textures: import("three").CanvasTexture[] = [];
    const geometries: import("three").BufferGeometry[] = [];
    const materials: import("three").Material[] = [];

    void (async () => {
      const THREE = await import("three");
      if (disposed || !host) return;

      const width = Math.max(host.clientWidth, 120);
      const height = Math.max(host.clientHeight, compact ? 64 : 120);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
      renderer.setClearColor(0x000000, 0);
      host.replaceChildren(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 40);
      camera.position.z = compact ? 4.2 : 5.2;

      const chars = [...text];
      const letterSize = compact ? 0.42 : 0.55;
      const gap = letterSize * (1 + letterSpacing);
      const totalWidth = Math.max(chars.length - 1, 0) * gap;
      const group = new THREE.Group();
      scene.add(group);

      const letters: LetterMesh[] = [];
      const startAngle = Math.PI / 2;

      chars.forEach((char, i) => {
        const canvas = paintLetterCanvas(char, 128, compact);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        textures.push(texture);

        const geometry = new THREE.PlaneGeometry(letterSize, letterSize);
        geometries.push(geometry);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        materials.push(material);

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = -totalWidth / 2 + i * gap;
        mesh.position.z = depth * 0.15;

        const delayMs =
          resolvedPhase === "out"
            ? (chars.length - 1 - i) * stagger
            : i * stagger;

        if (resolvedPhase === "in") {
          if (flipAxis === "x") mesh.rotation.x = startAngle;
          else mesh.rotation.y = startAngle;
          material.opacity = 0;
        } else {
          material.opacity = 1;
        }

        group.add(mesh);
        letters.push({
          mesh,
          startRot: startAngle,
          delay: delayMs,
        });
      });

      const start = performance.now();
      const duration = Math.max(flipSpeed, 200);

      const tick = (now: number) => {
        if (disposed || !renderer) return;
        const elapsed = now - start;

        for (const letter of letters) {
          const t = Math.min(1, Math.max(0, (elapsed - letter.delay) / duration));
          const eased = 1 - Math.pow(1 - t, 3);
          const mat = letter.mesh.material as import("three").MeshBasicMaterial;

          if (resolvedPhase === "in") {
            const rot = letter.startRot * (1 - eased);
            if (flipAxis === "x") letter.mesh.rotation.x = rot;
            else letter.mesh.rotation.y = rot;
            mat.opacity = eased;
            letter.mesh.position.z = depth * (1 - eased) * 0.6;
          } else {
            const rot = letter.startRot * eased;
            if (flipAxis === "x") letter.mesh.rotation.x = rot;
            else letter.mesh.rotation.y = rot;
            mat.opacity = 1 - eased;
            letter.mesh.position.z = depth * eased * 0.6;
          }
        }

        renderer.render(scene, camera);
        if (elapsed < duration + letters.length * stagger + 80) {
          raf = requestAnimationFrame(tick);
        }
      };

      raf = requestAnimationFrame(tick);

      const onResize = () => {
        if (!renderer || !host) return;
        const w = Math.max(host.clientWidth, 120);
        const h = Math.max(host.clientHeight, compact ? 64 : 120);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        renderer.render(scene, camera);
      };
      window.addEventListener("resize", onResize);

      (host as HTMLDivElement & { __tal3dCleanup?: () => void }).__tal3dCleanup =
        () => {
          window.removeEventListener("resize", onResize);
          cancelAnimationFrame(raf);
          textures.forEach((t) => t.dispose());
          geometries.forEach((g) => g.dispose());
          materials.forEach((m) => m.dispose());
          renderer?.dispose();
          host.replaceChildren();
        };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      const cleanup = (
        host as HTMLDivElement & { __tal3dCleanup?: () => void }
      ).__tal3dCleanup;
      cleanup?.();
      delete (host as HTMLDivElement & { __tal3dCleanup?: () => void })
        .__tal3dCleanup;
    };
  }, [
    compact,
    depth,
    flipAxis,
    flipSpeed,
    letterSpacing,
    playKey,
    reduced,
    resolvedPhase,
    stagger,
    text,
  ]);

  if (reduced) {
    return (
      <span
        className={cn(
          "inline-flex font-medium tracking-tight text-white",
          compact ? "text-lg" : "text-3xl md:text-4xl",
          className,
        )}
        aria-label={text}
      >
        {text}
      </span>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div
        ref={hostRef}
        className={cn("relative w-full", compact ? "h-16" : "h-36 md:h-44")}
        aria-label={text}
        role="img"
      />
      <div ref={fallbackRef} hidden className="absolute inset-0 flex items-center justify-center">
        <CssFlipFallback
          text={text}
          playKey={playKey}
          compact={compact}
          phase={resolvedPhase}
          flipSpeed={flipSpeed}
          stagger={stagger}
          flipAxis={flipAxis}
        />
      </div>
    </div>
  );
}
