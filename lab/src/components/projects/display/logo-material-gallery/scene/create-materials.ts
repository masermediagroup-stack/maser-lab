import {
  Color,
  DoubleSide,
  FrontSide,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Texture,
} from "three";
import type { MaterialId } from "../types";
import type { ProceduralTextures } from "./procedural-textures";

export type LogoMaterial = MeshStandardMaterial | MeshPhysicalMaterial;

export type MaterialMap = Record<MaterialId, LogoMaterial>;

type CreateArgs = {
  textures: ProceduralTextures;
  envMap: Texture | null;
  envIntensity: number;
  depth: number;
};

function commonPhysical(
  params: ConstructorParameters<typeof MeshPhysicalMaterial>[0],
): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    envMapIntensity: 1,
    ...params,
  });
}

export function createMaterials({
  textures,
  envMap,
  envIntensity,
  depth,
}: CreateArgs): MaterialMap {
  const wood = new MeshStandardMaterial({
    map: textures.woodAlbedo,
    roughnessMap: textures.woodRough,
    roughness: 0.72,
    metalness: 0.02,
    envMap: envMap ?? undefined,
    envMapIntensity: envIntensity * 0.55,
    bumpMap: textures.woodRough,
    bumpScale: 0.04,
  });

  const glass = commonPhysical({
    color: new Color("#7ecfff"),
    metalness: 0,
    roughness: 0.055,
    transmission: 0.84,
    thickness: Math.max(0.48, depth * 1.3),
    ior: 1.5,
    attenuationColor: new Color("#2f8fd4"),
    attenuationDistance: 0.55,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    specularIntensity: 1,
    specularColor: new Color("#e7f6ff"),
    iridescence: 0.18,
    iridescenceIOR: 1.28,
    iridescenceThicknessRange: [120, 420],
    envMap: envMap ?? undefined,
    envMapIntensity: envIntensity * 1.45,
    transparent: true,
    side: FrontSide,
    depthWrite: true,
  });

  const gradient = commonPhysical({
    map: textures.gradientAlbedo,
    metalness: 0.18,
    roughness: 0.28,
    clearcoat: 0.7,
    clearcoatRoughness: 0.18,
    iridescence: 0.35,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [120, 380],
    envMap: envMap ?? undefined,
    envMapIntensity: envIntensity,
    side: DoubleSide,
  });

  const steel = commonPhysical({
    map: textures.steelAlbedo,
    roughnessMap: textures.steelRough,
    metalness: 1,
    roughness: 0.32,
    anisotropy: 0.85,
    anisotropyRotation: Math.PI / 2,
    anisotropyMap: textures.steelAniso,
    envMap: envMap ?? undefined,
    envMapIntensity: envIntensity * 1.15,
    color: new Color("#c5c8cc"),
  });

  const marble = commonPhysical({
    map: textures.marbleAlbedo,
    roughnessMap: textures.marbleRough,
    roughness: 0.34,
    metalness: 0.02,
    clearcoat: 0.28,
    clearcoatRoughness: 0.4,
    envMap: envMap ?? undefined,
    envMapIntensity: envIntensity * 0.7,
  });

  const gold = commonPhysical({
    color: new Color("#d7b056"),
    metalness: 1,
    roughness: 0.22,
    roughnessMap: textures.goldRough,
    clearcoat: 0.18,
    clearcoatRoughness: 0.28,
    envMap: envMap ?? undefined,
    envMapIntensity: envIntensity * 1.2,
  });

  return { wood, glass, gradient, steel, marble, gold };
}

export function applyEnvIntensity(
  materials: MaterialMap,
  envIntensity: number,
): void {
  materials.wood.envMapIntensity = envIntensity * 0.55;
  materials.glass.envMapIntensity = envIntensity * 1.45;
  materials.gradient.envMapIntensity = envIntensity;
  materials.steel.envMapIntensity = envIntensity * 1.15;
  materials.marble.envMapIntensity = envIntensity * 0.7;
  materials.gold.envMapIntensity = envIntensity * 1.2;
}

export function applyGlassThickness(
  materials: MaterialMap,
  depth: number,
): void {
  if (materials.glass instanceof MeshPhysicalMaterial) {
    materials.glass.thickness = Math.max(0.48, depth * 1.3);
  }
}

export function disposeMaterials(materials: MaterialMap): void {
  for (const material of Object.values(materials)) {
    material.dispose();
  }
}
