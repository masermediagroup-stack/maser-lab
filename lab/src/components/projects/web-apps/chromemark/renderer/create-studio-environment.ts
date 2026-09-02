import {
  Color,
  DoubleSide,
  LinearSRGBColorSpace,
  Mesh,
  MeshBasicMaterial,
  NoToneMapping,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  Vector3,
  type Texture,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from "three";
import type { EnvironmentSettings } from "../types";

/** World-scale of the card rig vs the original tight studio. */
export const STUDIO_RADIUS_SCALE = 4.5;
/** Far plane must clear the scaled cards. */
export const STUDIO_PMREM_FAR = 220;
/** Higher cube resolution so grazing sidewalls don't posterize. */
export const STUDIO_PMREM_SIZE = 512;

function scaled(value: number): number {
  return value * STUDIO_RADIUS_SCALE;
}

function addCard(
  scene: Scene,
  disposables: Array<{ dispose: () => void }>,
  options: {
    width: number;
    height: number;
    color: Color;
    position: Vector3;
  },
): void {
  const geometry = new PlaneGeometry(options.width, options.height);
  const material = new MeshBasicMaterial({
    color: options.color,
    side: DoubleSide,
  });
  const mesh = new Mesh(geometry, material);
  mesh.position.copy(options.position);
  mesh.lookAt(0, 0, 0);
  scene.add(mesh);
  disposables.push(geometry, material);
}

function gray(value: number): Color {
  return new Color().setRGB(value, value, value * 1.01);
}

function disposeList(items: Array<{ dispose: () => void }>): void {
  for (const item of items) item.dispose();
}

function cardPos(x: number, y: number, z: number): Vector3 {
  return new Vector3(scaled(x), scaled(y), scaled(z));
}

/**
 * Product-studio reflection rig. Cards are mildly HDR so chrome keeps
 * white streaks without collapsing into binary black/white.
 * Capture is linear / no tone mapping so ACES + 8-bit output does not
 * bake banding into the env map.
 */
export function createStudioEnvironment(
  renderer: WebGLRenderer,
  pmrem: PMREMGenerator,
  settings: EnvironmentSettings,
  previous?: WebGLRenderTarget | null,
): { target: WebGLRenderTarget; texture: Texture } {
  const envScene = new Scene();
  envScene.background = gray(0.16);
  const disposables: Array<{ dispose: () => void }> = [];

  const keyRadius = scaled(5.1);
  const keyRad = (settings.keyAngle * Math.PI) / 180;
  const keyPos = new Vector3(
    -Math.sin(keyRad) * keyRadius,
    scaled(1.55),
    Math.cos(keyRad) * keyRadius,
  );

  addCard(envScene, disposables, {
    width: scaled(11.5),
    height: scaled(8.5),
    color: gray(0.58),
    position: cardPos(-2.4, 1.1, 5.4),
  });
  addCard(envScene, disposables, {
    width: scaled(8.2),
    height: scaled(7.4),
    color: gray(0.38),
    position: cardPos(5.1, 0.7, 2.8),
  });
  addCard(envScene, disposables, {
    width: scaled(9.4),
    height: scaled(7.8),
    color: gray(0.24),
    position: cardPos(1.6, 0.9, -5.2),
  });
  addCard(envScene, disposables, {
    width: scaled(4.2),
    height: scaled(4.2),
    color: gray(0.5),
    position: cardPos(0.15, 0.35, 3.35),
  });

  addCard(envScene, disposables, {
    width: scaled(settings.keyWidth),
    height: scaled(6.8),
    color: gray(4.2),
    position: keyPos,
  });

  addCard(envScene, disposables, {
    width: scaled(9.2),
    height: scaled(4.8),
    color: gray(2.05),
    position: cardPos(-0.4, 6.2, 1.3),
  });
  addCard(envScene, disposables, {
    width: scaled(12),
    height: scaled(12),
    color: gray(0.2),
    position: cardPos(0.2, -6.4, 0.4),
  });

  const strip = scaled(Math.max(0.08, settings.stripWidth));
  const hot = 5.4 * settings.stripStrength;
  addCard(envScene, disposables, {
    width: strip,
    height: scaled(6.6),
    color: gray(hot),
    position: cardPos(2.35, 1.7, 4.85),
  });
  addCard(envScene, disposables, {
    width: strip * 0.7,
    height: scaled(5.1),
    color: gray(hot * 0.62),
    position: cardPos(-2.15, 2.4, 5.05),
  });
  addCard(envScene, disposables, {
    width: strip * 0.5,
    height: scaled(6.8),
    color: gray(hot * 0.42),
    position: cardPos(5.15, 0.35, 0.85),
  });

  const block = 0.07 + (1 - settings.blockerStrength) * 0.14;
  addCard(envScene, disposables, {
    width: scaled(8.5),
    height: scaled(7.2),
    color: gray(block),
    position: cardPos(-5.8, -0.15, -2.6),
  });
  addCard(envScene, disposables, {
    width: scaled(6.4),
    height: scaled(5.8),
    color: gray(block * 1.35),
    position: cardPos(5.6, 1.8, -3.2),
  });

  const prevTone = renderer.toneMapping;
  const prevSpace = renderer.outputColorSpace;
  const prevExposure = renderer.toneMappingExposure;
  renderer.toneMapping = NoToneMapping;
  renderer.outputColorSpace = LinearSRGBColorSpace;
  renderer.toneMappingExposure = 1;

  let target: WebGLRenderTarget;
  try {
    target = pmrem.fromScene(envScene, 0.05, 0.4, STUDIO_PMREM_FAR, {
      size: STUDIO_PMREM_SIZE,
    });
  } finally {
    renderer.toneMapping = prevTone;
    renderer.outputColorSpace = prevSpace;
    renderer.toneMappingExposure = prevExposure;
  }

  disposeList(disposables);
  previous?.dispose();

  return { target, texture: target.texture };
}
