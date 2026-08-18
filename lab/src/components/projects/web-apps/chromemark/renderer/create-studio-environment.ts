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

function disposeList(items: Array<{ dispose: () => void }>): void {
  for (const item of items) item.dispose();
}

/**
 * Product-studio reflection rig. Cards are HDR (color > 1) so chrome gets
 * clipped white streaks and near-black blockers. Never added to the main scene.
 */
export function createStudioEnvironment(
  pmrem: PMREMGenerator,
  settings: EnvironmentSettings,
  previous?: WebGLRenderTarget | null,
): { target: WebGLRenderTarget; texture: Texture } {
  const envScene = new Scene();
  envScene.background = new Color().setScalar(0.045);
  const disposables: Array<{ dispose: () => void }> = [];

  const keyRadius = 4.9;
  const keyRad = (settings.keyAngle * Math.PI) / 180;
  const keyPos = new Vector3(
    -Math.sin(keyRad) * keyRadius,
    1.35,
    Math.cos(keyRad) * keyRadius,
  );

  addCard(envScene, disposables, {
    width: settings.keyWidth,
    height: 7.2,
    color: new Color().setRGB(9, 9, 9),
    position: keyPos,
  });

  addCard(envScene, disposables, {
    width: 3.4,
    height: 6.2,
    color: new Color().setRGB(0.55, 0.55, 0.58),
    position: new Vector3(4.4, 0.55, 2.6),
  });

  addCard(envScene, disposables, {
    width: 8.5,
    height: 4.4,
    color: new Color().setRGB(3.4, 3.4, 3.5),
    position: new Vector3(0.2, 6.4, 0.8),
  });

  const strip = Math.max(0.08, settings.stripWidth);
  const hot = 10 * settings.stripStrength;
  addCard(envScene, disposables, {
    width: strip,
    height: 6.4,
    color: new Color().setRGB(hot, hot, hot),
    position: new Vector3(2.6, 1.8, 4.6),
  });
  addCard(envScene, disposables, {
    width: strip * 0.72,
    height: 5.2,
    color: new Color().setRGB(hot * 0.85, hot * 0.85, hot * 0.9),
    position: new Vector3(-1.8, 2.6, 5.1),
  });
  addCard(envScene, disposables, {
    width: strip * 0.55,
    height: 7,
    color: new Color().setRGB(hot * 0.7, hot * 0.7, hot * 0.72),
    position: new Vector3(5.4, 0.2, 0.4),
  });

  const block = 0.02 + (1 - settings.blockerStrength) * 0.12;
  addCard(envScene, disposables, {
    width: 14,
    height: 10,
    color: new Color().setRGB(block, block, block),
    position: new Vector3(0.4, 0.2, -6.4),
  });
  addCard(envScene, disposables, {
    width: 10,
    height: 10,
    color: new Color().setRGB(block * 0.4, block * 0.4, block * 0.45),
    position: new Vector3(-6.6, -0.4, -2.2),
  });
  addCard(envScene, disposables, {
    width: 16,
    height: 16,
    color: new Color().setRGB(block * 0.25, block * 0.25, block * 0.25),
    position: new Vector3(0, -6.2, 0),
  });

  const target = pmrem.fromScene(envScene, 0.028, 0.1, 40);
  disposeList(disposables);
  previous?.dispose();

  return { target, texture: target.texture };
}
