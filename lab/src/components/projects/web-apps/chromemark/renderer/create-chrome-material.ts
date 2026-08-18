import { Color, FrontSide, MeshPhysicalMaterial } from "three";
import type { MaterialSettings } from "../types";

export type ChromeMaterials = {
  lids: MeshPhysicalMaterial;
  sides: MeshPhysicalMaterial;
};

function sharedPhysical(settings: MaterialSettings, roughness: number) {
  const material = new MeshPhysicalMaterial({
    color: new Color(settings.tint),
    metalness: settings.metalness,
    roughness,
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
    envMapIntensity: 1,
    anisotropy: settings.brushedAmount,
    anisotropyRotation: (settings.brushedDirection * Math.PI) / 180,
  });
  return material;
}

export function createChromeMaterials(settings: MaterialSettings): ChromeMaterials {
  const sideRoughness = Math.min(1, settings.roughness + 0.07);
  return {
    lids: sharedPhysical(settings, settings.roughness),
    sides: sharedPhysical(settings, sideRoughness),
  };
}

export function applyChromeMaterials(
  materials: ChromeMaterials,
  settings: MaterialSettings,
): void {
  const sideRoughness = Math.min(1, settings.roughness + 0.07);
  const rotation = (settings.brushedDirection * Math.PI) / 180;
  for (const [material, roughness] of [
    [materials.lids, settings.roughness],
    [materials.sides, sideRoughness],
  ] as const) {
    material.color.set(settings.tint);
    material.metalness = settings.metalness;
    material.roughness = roughness;
    material.anisotropy = settings.brushedAmount;
    material.anisotropyRotation = rotation;
    material.flatShading = false;
    material.needsUpdate = true;
  }
}

export function disposeChromeMaterials(materials: ChromeMaterials): void {
  materials.lids.dispose();
  materials.sides.dispose();
}
