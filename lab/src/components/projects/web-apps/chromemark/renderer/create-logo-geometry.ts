import { Box3, ExtrudeGeometry, Group, Mesh, Vector3 } from "three";
import type { Shape } from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import type { ChromeMaterials } from "./create-chrome-material";
import { CREASE_ANGLE_RAD } from "./geometry-quality";
import { measureShapes } from "./normalize-logo";
import { splitExtrudeSurfaces } from "./surface-groups";
import { LogoLoadError, type GeometrySettings } from "../types";

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

  const bevelEnabled = settings.bevel;
  const bevelSegments = bevelEnabled ? settings.bevelSegments : 0;
  const steps = 1;
  const options = {
    depth: settings.depth * maxXY,
    bevelEnabled,
    bevelThickness: settings.bevelThickness * maxXY,
    bevelSize: settings.bevelSize * maxXY,
    bevelSegments,
    curveSegments: settings.curveDetail,
    steps,
  };

  const inner = new Group();
  for (const shape of shapes) {
    const extruded = new ExtrudeGeometry(shape, options);
    const { lids, shell } = splitExtrudeSurfaces(extruded, {
      bevelEnabled,
      bevelSegments,
      steps,
    });
    extruded.dispose();

    const lidMesh = new Mesh(lids, materials.lids);
    lidMesh.castShadow = false;
    lidMesh.receiveShadow = false;
    inner.add(lidMesh);

    if (shell) {
      const creased = toCreasedNormals(shell, CREASE_ANGLE_RAD);
      if (creased !== shell) shell.dispose();
      const hasBevelGroup = creased.groups.some((group) => group.materialIndex === 0);
      const shellMesh = new Mesh(
        creased,
        hasBevelGroup ? [materials.bevels, materials.sides] : materials.sides,
      );
      shellMesh.castShadow = false;
      shellMesh.receiveShadow = false;
      inner.add(shellMesh);
    }
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
