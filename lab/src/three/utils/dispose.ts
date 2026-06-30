/**
 * Dispose helpers for Three.js objects.
 * Import types from `three` when the package is installed.
 *
 * Usage after `npm install three`:
 * ```ts
 * import type { Object3D, Material, Texture } from "three";
 * disposeObject3D(scene);
 * ```
 */

type Disposable = { dispose?: () => void };

export function disposeMaterial(material: Disposable | Disposable[]): void {
  const materials = Array.isArray(material) ? material : [material];
  for (const mat of materials) {
    mat.dispose?.();
  }
}

export function disposeGeometry(geometry: Disposable): void {
  geometry.dispose?.();
}

export function disposeTexture(texture: Disposable): void {
  texture.dispose?.();
}

/**
 * Traverse-compatible dispose stub.
 * Replace with full Object3D traversal when `three` is installed.
 */
export function disposeResources(resources: Disposable[]): void {
  for (const resource of resources) {
    resource.dispose?.();
  }
}
