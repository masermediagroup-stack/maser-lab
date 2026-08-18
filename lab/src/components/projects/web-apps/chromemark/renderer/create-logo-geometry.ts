import {
  Box3,
  ExtrudeGeometry,
  Group,
  Mesh,
  Vector3,
  type BufferGeometry,
  type ExtrudeGeometryOptions,
} from "three";
import type { Shape } from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import type { ChromeMaterials } from "./create-chrome-material";
import { CREASE_ANGLE_RAD } from "./geometry-quality";
import { measureShapes } from "./normalize-logo";
import { LogoLoadError, type GeometrySettings } from "../types";

function withCreasedNormals(geometry: ExtrudeGeometry): BufferGeometry {
  const groups = geometry.groups.map((group) => ({
    start: group.start,
    count: group.count,
    materialIndex: group.materialIndex,
  }));
  const creased = toCreasedNormals(geometry, CREASE_ANGLE_RAD);
  if (creased !== geometry) geometry.dispose();
  if (creased.groups.length === 0) {
    for (const group of groups) {
      creased.addGroup(group.start, group.count, group.materialIndex);
    }
  }
  return creased;
}

export function createLogoGeometry(
  shapes: Shape[],
  settings: GeometrySettings,
  materials: ChromeMaterials,
): Group {
  const { maxXY } = measureShapes(shapes);
  if (maxXY <= 1e-8) {
    throw new LogoLoadError(
      "zero-size",
      "The logo produced empty geometry. Try a different SVG or PNG.",
    );
  }

  const options: ExtrudeGeometryOptions = {
    depth: settings.depth * maxXY,
    bevelEnabled: settings.bevel,
    bevelThickness: settings.bevelThickness * maxXY,
    bevelSize: settings.bevelSize * maxXY,
    bevelSegments: settings.bevel ? settings.bevelSegments : 0,
    curveSegments: settings.curveDetail,
    steps: 1,
  };

  const inner = new Group();
  for (const shape of shapes) {
    const extruded = new ExtrudeGeometry(shape, options);
    const geometry = withCreasedNormals(extruded);
    const mesh = new Mesh(geometry, [materials.lids, materials.sides]);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    inner.add(mesh);
  }

  const scale = 1 / maxXY;
  inner.scale.set(scale, -scale, scale);
  inner.updateMatrixWorld(true);
  const box = new Box3().setFromObject(inner);
  const center = box.getCenter(new Vector3());
  inner.position.sub(center);

  const group = new Group();
  group.add(inner);
  group.updateMatrixWorld(true);

  return group;
}

export function disposeLogoGroup(group: Group | null): void {
  if (!group) return;
  group.traverse((object) => {
    if (object instanceof Mesh) {
      object.geometry.dispose();
    }
  });
  group.removeFromParent();
}
