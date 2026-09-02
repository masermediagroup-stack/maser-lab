import { Box3, ExtrudeGeometry, Group, Mesh, Vector3 } from "three";
import type { Shape } from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { clampBevelSize } from "./bevel-limit";
import type { ChromeMaterials } from "./create-chrome-material";
import { SHELL_SMOOTH_ANGLE_RAD } from "./geometry-quality";
import { measureShapes } from "./normalize-logo";
import { splitExtrudeSurfaces } from "./surface-groups";
import { LogoLoadError, type GeometrySettings } from "../types";

/** Negative offset facets the lids. Always zero. */
export const EXTRUDE_BEVEL_OFFSET = 0;

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

  const steps = 1;
  const requestedBevel = settings.bevel ? settings.bevelSize * maxXY : 0;
  const bevelThickness = settings.bevelThickness * maxXY;
  const depth = settings.depth * maxXY;

  const inner = new Group();
  for (const shape of shapes) {
    const bevelSize = clampBevelSize(requestedBevel, shape);
    const bevelEnabled = settings.bevel && bevelSize > 1e-6;
    const bevelSegments = bevelEnabled ? settings.bevelSegments : 0;
    const extruded = new ExtrudeGeometry(shape, {
      depth,
      bevelEnabled,
      bevelThickness,
      bevelSize,
      bevelOffset: EXTRUDE_BEVEL_OFFSET,
      bevelSegments,
      curveSegments: settings.curveDetail,
      steps,
    });
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
      const smoothed = toCreasedNormals(shell, SHELL_SMOOTH_ANGLE_RAD);
      if (smoothed !== shell) shell.dispose();
      const hasBevelGroup = smoothed.groups.some((group) => group.materialIndex === 0);
      const shellMesh = new Mesh(
        smoothed,
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
