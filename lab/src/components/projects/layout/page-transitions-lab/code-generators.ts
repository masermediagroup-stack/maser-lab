import type { TransitionDefinition, TransitionSettings } from "./types";

export function generateSettingsSummary(settings: TransitionSettings) {
  return Object.entries(settings)
    .map(([key, value]) => {
      if (key === "duration" || key === "stagger") return `${key}: ${value}ms`;
      if (key === "radius") return `${key}: ${value}px`;
      return `${key}: ${value}`;
    })
    .join("\n");
}

export function generateTransitionCode(
  definition: TransitionDefinition,
  settings: TransitionSettings,
) {
  if (definition.engine === "three") {
    return `// ${definition.title}
// Three.js curtain-fall route transition starter.

import * as THREE from "three";

const settings = {
  curtains: ${settings.curtains},
  duration: ${settings.duration},
  stagger: ${settings.stagger},
  intensity: ${settings.intensity},
};

/**
 * 1. Capture or paint the destination page into a CanvasTexture.
 * 2. Build \`settings.curtains\` vertical planes with UV slices of that texture.
 * 3. Drop each plane from above with staggered ease-out.
 * 4. On complete, unmount the overlay and show the real next route.
 *
 * See lab/src/components/projects/layout/page-transitions-lab/curtain-fall-scene.tsx
 * for the full Maser-Lab implementation (disposal, resize, reduced-motion).
 */

export async function playCurtainFall({
  container,
  destinationCanvas,
}: {
  container: HTMLElement;
  destinationCanvas: HTMLCanvasElement;
}) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const texture = new THREE.CanvasTexture(destinationCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const count = settings.curtains;
  const width = 2 / count;
  const meshes: THREE.Mesh[] = [];

  for (let i = 0; i < count; i++) {
    const geometry = new THREE.PlaneGeometry(width, 2);
    const material = new THREE.MeshBasicMaterial({ map: texture.clone() });
    // UV offset/repeat so each curtain shows its vertical strip
    material.map!.wrapS = THREE.ClampToEdgeWrapping;
    material.map!.repeat.set(1 / count, 1);
    material.map!.offset.set(i / count, 0);
    material.map!.needsUpdate = true;

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -1 + width * i + width / 2;
    mesh.position.y = 2.2; // start above
    scene.add(mesh);
    meshes.push(mesh);
  }

  container.appendChild(renderer.domElement);
  // animate y -> 0 with stagger, then dispose
  return { renderer, scene, meshes, settings };
}`;
  }

  return `// ${definition.title}
// Route transition starter. Drive with a one-shot status flag.
// IMPORTANT: swap the current page on complete — do not reverse CSS by
// dropping data-status while layers are still mid-tween.

const transitionSettings = {
  duration: ${settings.duration},
  intensity: ${settings.intensity},
  stagger: ${settings.stagger},
  radius: ${settings.radius},
};

export function RouteTransitionShell({
  status,
  playKey,
  previousPage,
  nextPage,
}: {
  status: "rest" | "running";
  playKey: number;
  previousPage: React.ReactNode;
  nextPage: React.ReactNode;
}) {
  return (
    <section
      key={playKey}
      className="route-transition"
      data-transition="${definition.id}"
      data-status={status}
      style={
        {
          "--route-duration": \`\${transitionSettings.duration}ms\`,
          "--route-intensity": transitionSettings.intensity,
          "--route-stagger": \`\${transitionSettings.stagger}ms\`,
          "--route-radius": \`\${transitionSettings.radius}px\`,
        } as React.CSSProperties
      }
    >
      <div className="route-transition__page route-transition__page--outgoing">
        {previousPage}
      </div>
      {status === "running" ? (
        <div className="route-transition__page route-transition__page--incoming">
          {nextPage}
        </div>
      ) : null}
      <span className="route-transition__cover" aria-hidden="true" />
    </section>
  );
}

/* CSS: use @keyframes with animation-fill-mode: forwards for ${definition.id}.
   Never rely on CSS transitions that reverse when status returns to rest. */`;
}
