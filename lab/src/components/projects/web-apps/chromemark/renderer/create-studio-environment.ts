import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  Vector3,
  type Texture,
  type WebGLRenderTarget,
} from "three";
import type { EnvironmentSettings } from "../types";

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

/**
 * Product-studio reflection rig. Cards are mildly HDR so chrome keeps
 * white streaks without collapsing into binary black/white.
 */
export function createStudioEnvironment(
  pmrem: PMREMGenerator,
  settings: EnvironmentSettings,
  previous?: WebGLRenderTarget | null,
): { target: WebGLRenderTarget; texture: Texture } {
  const envScene = new Scene();
  envScene.background = gray(0.16);
  const disposables: Array<{ dispose: () => void }> = [];

  const keyRadius = 5.1;
  const keyRad = (settings.keyAngle * Math.PI) / 180;
  const keyPos = new Vector3(
    -Math.sin(keyRad) * keyRadius,
    1.55,
    Math.cos(keyRad) * keyRadius,
  );

  addCard(envScene, disposables, {
    width: 11.5,
    height: 8.5,
    color: gray(0.58),
    position: new Vector3(-2.4, 1.1, 5.4),
  });
  addCard(envScene, disposables, {
    width: 8.2,
    height: 7.4,
    color: gray(0.38),
    position: new Vector3(5.1, 0.7, 2.8),
  });
  addCard(envScene, disposables, {
    width: 9.4,
    height: 7.8,
    color: gray(0.24),
    position: new Vector3(1.6, 0.9, -5.2),
  });
  addCard(envScene, disposables, {
    width: 4.2,
    height: 4.2,
    color: gray(0.5),
    position: new Vector3(0.15, 0.35, 3.35),
  });

  addCard(envScene, disposables, {
    width: settings.keyWidth,
    height: 6.8,
    color: gray(4.2),
    position: keyPos,
  });

  addCard(envScene, disposables, {
    width: 9.2,
    height: 4.8,
    color: gray(2.05),
    position: new Vector3(-0.4, 6.2, 1.3),
  });
  addCard(envScene, disposables, {
    width: 12,
    height: 12,
    color: gray(0.2),
    position: new Vector3(0.2, -6.4, 0.4),
  });

  const strip = Math.max(0.08, settings.stripWidth);
  const hot = 5.4 * settings.stripStrength;
  addCard(envScene, disposables, {
    width: strip,
    height: 6.6,
    color: gray(hot),
    position: new Vector3(2.35, 1.7, 4.85),
  });
  addCard(envScene, disposables, {
    width: strip * 0.7,
    height: 5.1,
    color: gray(hot * 0.62),
    position: new Vector3(-2.15, 2.4, 5.05),
  });
  addCard(envScene, disposables, {
    width: strip * 0.5,
    height: 6.8,
    color: gray(hot * 0.42),
    position: new Vector3(5.15, 0.35, 0.85),
  });

  const block = 0.07 + (1 - settings.blockerStrength) * 0.14;
  addCard(envScene, disposables, {
    width: 8.5,
    height: 7.2,
    color: gray(block),
    position: new Vector3(-5.8, -0.15, -2.6),
  });
  addCard(envScene, disposables, {
    width: 6.4,
    height: 5.8,
    color: gray(block * 1.35),
    position: new Vector3(5.6, 1.8, -3.2),
  });

  const target = pmrem.fromScene(envScene, 0.046, 0.1, 40);
  disposeList(disposables);
  previous?.dispose();

  return { target, texture: target.texture };
}
