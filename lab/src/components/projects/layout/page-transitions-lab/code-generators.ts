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

function curtainFillSnippet(settings: TransitionSettings) {
  return `curtainColorA: "${settings.curtainColorA}",
  curtainColorB: "${settings.curtainColorB}",
  curtainGradient: "${settings.curtainGradient}", // solid | vertical | horizontal`;
}

export function generateTransitionCode(
  definition: TransitionDefinition,
  settings: TransitionSettings,
) {
  if (definition.engine === "three") {
    return `// ${definition.title}
// Curtain Fall: opaque strips fall in to cover, hold, then fall out to reveal.

import * as THREE from "three";

const settings = {
  curtains: ${settings.curtains},
  duration: ${settings.duration},
  stagger: ${settings.stagger},
  intensity: ${settings.intensity},
  ${curtainFillSnippet(settings)}
};

/**
 * 1. Mount the destination route underneath the overlay (hidden by curtains).
 * 2. Build \`settings.curtains\` overlapping opaque vertical planes.
 * 3. Phase IN: drop each plane from above with stagger until the stage is covered.
 * 4. Phase OUT: drop each plane downward off-screen to reveal the destination.
 * 5. Dispose the overlay on complete.
 *
 * See lab/src/components/projects/layout/page-transitions-lab/curtain-fall-scene.tsx
 */

export async function playCurtainFall({ container }: { container: HTMLElement }) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const count = settings.curtains;
  const width = 2 / count;
  const meshes: THREE.Mesh[] = [];
  // Paint Color A / B onto a canvas (solid or gradient), then map to strips.
  const material = new THREE.MeshBasicMaterial({ color: 0x071018 });

  for (let i = 0; i < count; i++) {
    const geometry = new THREE.PlaneGeometry(width * 1.08, 2.1);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -1 + width * i + width / 2;
    mesh.position.y = 2.2; // start above
    scene.add(mesh);
    meshes.push(mesh);
  }

  container.appendChild(renderer.domElement);
  // animate y: 2.2 -> 0 (in), hold, then 0 -> -2.2 (out), then dispose
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
