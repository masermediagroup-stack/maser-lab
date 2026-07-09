import type { TransitionDefinition, TransitionSettings } from "./types";

export function generateSettingsSummary(
  definition: TransitionDefinition,
  settings: TransitionSettings,
) {
  // Only list controls for this transition — shared unused fields stay hidden.
  return definition.controls
    .map((control) => {
      const key = control.key;
      const value = settings[key];
      if (key === "duration" || key === "stagger") return `${key}: ${value}ms`;
      if (key === "radius") return `${key}: ${value}px`;
      return `${key}: ${value}`;
    })
    .join("\n");
}

function curtainFillSnippet(settings: TransitionSettings) {
  return `curtainColorA: "${settings.curtainColorA}",
  curtainColorB: "${settings.curtainColorB}",
  curtainGradient: "${settings.curtainGradient}", // solid | vertical | horizontal
  curtainFallIn: "${settings.curtainFallIn}", // left | right | center
  curtainFallOut: "${settings.curtainFallOut}", // left | right | center`;
}

function pixelWormholeSnippet(settings: TransitionSettings) {
  return `pixelDensity: ${settings.pixelDensity},
  pixelColorMode: "${settings.pixelColorMode}", // preserve | solid | gradient | white
  pixelColorA: "${settings.pixelColorA}",
  pixelColorB: "${settings.pixelColorB}",`;
}

export function generateTransitionCode(
  definition: TransitionDefinition,
  settings: TransitionSettings,
) {
  if (definition.id === "pixel-wormhole") {
    return `// ${definition.title}
// Pixel Wormhole: page → glowing pixels (corners→center) → wormhole zoom →
// destination pixels emit and reassemble.

import * as THREE from "three";

const settings = {
  duration: ${settings.duration},
  stagger: ${settings.stagger},
  intensity: ${settings.intensity},
  ${pixelWormholeSnippet(settings)}
};

/**
 * 1. Sample from/to page colors onto a pixel grid (InstancedMesh planes).
 * 2. Phase FLOAT: corners disintegrate first; pixels glow and drift.
 * 3. Phase SUCK: spiral into a dark wormhole; camera zooms in.
 * 4. Phase TUNNEL: brief hold inside the hole; swap destination colors.
 * 5. Phase EMIT + ASSEMBLE: pixels exit the hole, settle, glow fades.
 *
 * See lab/src/components/projects/layout/page-transitions-lab/pixel-wormhole-scene.tsx
 */

export async function playPixelWormhole({ container }: { container: HTMLElement }) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 20);
  camera.position.z = 2.35;
  // Build InstancedMesh pixel grid + wormhole rings, then animate phases.
  container.appendChild(renderer.domElement);
  return { renderer, scene, camera, settings };
}`;
  }

  if (definition.id === "curtain-fall") {
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
 * 2. Build \`settings.curtains\` opaque vertical planes.
 * 3. Phase IN: drop each plane from above with stagger (left | right | center).
 * 4. Phase OUT: drop each plane downward with its own origin stagger.
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
  const material = new THREE.MeshBasicMaterial({ color: 0x071018 });

  for (let i = 0; i < count; i++) {
    const geometry = new THREE.PlaneGeometry(width * 1.08, 2.1);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -1 + width * i + width / 2;
    mesh.position.y = 2.2;
    scene.add(mesh);
    meshes.push(mesh);
  }

  container.appendChild(renderer.domElement);
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
