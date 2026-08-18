import {
  Box3,
  MathUtils,
  PerspectiveCamera,
  Sphere,
  type Object3D,
} from "three";
import type { CameraSettings } from "../types";

const DEG = MathUtils.DEG2RAD;

export function createProductCamera(): PerspectiveCamera {
  const camera = new PerspectiveCamera(32, 1, 0.05, 40);
  camera.position.set(0, 0, 2.4);
  camera.lookAt(0, 0, 0);
  return camera;
}

export function applyCameraSettings(
  camera: PerspectiveCamera,
  settings: CameraSettings,
  width: number,
  height: number,
): void {
  camera.fov = settings.fov;
  camera.aspect = Math.max(width / Math.max(height, 1), 0.05);
  camera.near = 0.05;
  camera.far = 40;
  camera.updateProjectionMatrix();

  const polar = MathUtils.clamp(settings.polar, 8, 172) * DEG;
  const azimuth = settings.azimuth * DEG;
  const x = settings.distance * Math.sin(polar) * Math.sin(azimuth);
  const y = settings.distance * Math.cos(polar);
  const z = settings.distance * Math.sin(polar) * Math.cos(azimuth);
  camera.position.set(x + settings.panX, y + settings.panY, z);
  camera.lookAt(settings.panX, settings.panY, 0);
}

export function fitDistanceForObject(
  camera: PerspectiveCamera,
  object: Object3D,
  padding = 0.18,
): number {
  const box = new Box3().setFromObject(object);
  if (box.isEmpty()) return 2.4;
  const sphere = box.getBoundingSphere(new Sphere());
  const fov = camera.fov * DEG;
  const aspect = camera.aspect || 1;
  const vertical = sphere.radius * (1 + padding) / Math.sin(fov / 2);
  const hFov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
  const horizontal = sphere.radius * (1 + padding) / Math.sin(hFov / 2);
  return Math.max(vertical, horizontal, 0.8);
}

export function fitLogoToCamera(
  camera: PerspectiveCamera,
  object: Object3D,
  settings: CameraSettings,
  width: number,
  height: number,
): number {
  applyCameraSettings(camera, { ...settings, distance: 2.4 }, width, height);
  return fitDistanceForObject(camera, object);
}
