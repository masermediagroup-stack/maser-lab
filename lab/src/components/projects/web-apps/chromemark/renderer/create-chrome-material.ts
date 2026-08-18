import { Color, FrontSide, MeshPhysicalMaterial } from "three";
import type { MaterialSettings } from "../types";

export type ChromeMaterials = {
  lids: MeshPhysicalMaterial;
  bevels: MeshPhysicalMaterial;
  sides: MeshPhysicalMaterial;
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function sharedPhysical(
  settings: MaterialSettings,
  options: { roughness: number; envMapIntensity: number; tintScale: number },
) {
  const color = new Color(settings.tint).multiplyScalar(options.tintScale);
  const material = new MeshPhysicalMaterial({
    color,
    metalness: settings.metalness,
    roughness: clamp01(options.roughness),
    flatShading: false,
    side: FrontSide,
    clearcoat: 0,
    clearcoatRoughness: 0.04,
    ior: 1.5,
    specularIntensity: 1,
    specularColor: new Color(0xffffff),
    emissive: 0x000000,
    transparent: false,
    opacity: 1,
    envMapIntensity: options.envMapIntensity,
    anisotropy: settings.brushedAmount,
    anisotropyRotation: (settings.brushedDirection * Math.PI) / 180,
  });
  return material;
}

function surfaceParams(settings: MaterialSettings) {
  return {
    lids: {
      roughness: settings.roughness + 0.03,
      envMapIntensity: 0.82,
      tintScale: 1,
    },
    bevels: {
      roughness: settings.roughness - 0.025,
      envMapIntensity: 1.12,
      tintScale: 1.04,
    },
    sides: {
      roughness: settings.roughness + 0.07,
      envMapIntensity: 0.88,
      tintScale: 0.78,
    },
  };
}

export function createChromeMaterials(settings: MaterialSettings): ChromeMaterials {
  const params = surfaceParams(settings);
  return {
    lids: sharedPhysical(settings, params.lids),
    bevels: sharedPhysical(settings, params.bevels),
    sides: sharedPhysical(settings, params.sides),
  };
}

export function applyChromeMaterials(
  materials: ChromeMaterials,
  settings: MaterialSettings,
): void {
  const rotation = (settings.brushedDirection * Math.PI) / 180;
  const params = surfaceParams(settings);
  const entries = [
    [materials.lids, params.lids],
    [materials.bevels, params.bevels],
    [materials.sides, params.sides],
  ] as const;

  for (const [material, option] of entries) {
    material.color.set(settings.tint).multiplyScalar(option.tintScale);
    material.metalness = settings.metalness;
    material.roughness = clamp01(option.roughness);
    material.envMapIntensity = option.envMapIntensity;
    material.anisotropy = settings.brushedAmount;
    material.anisotropyRotation = rotation;
    material.flatShading = false;
    material.needsUpdate = true;
  }
}

export function disposeChromeMaterials(materials: ChromeMaterials): void {
  materials.lids.dispose();
  materials.bevels.dispose();
  materials.sides.dispose();
}
