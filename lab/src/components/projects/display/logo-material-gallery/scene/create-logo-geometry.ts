import { ExtrudeGeometry, Shape, type BufferGeometry } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  MARK_SVG,
  MASER_M_CENTERLINE_SVG,
} from "../constants";
import type { Vec2 } from "../types";
import { outlineToShape, polylineRoundStroke } from "./stroke-shape";

const WORLD_SCALE = 2 / MARK_SVG.width;
const STROKE_RADIUS = (MARK_SVG.stroke / 2) * WORLD_SCALE;

function svgToWorld(point: Vec2, yOffsetSvg: number): Vec2 {
  const svgY = point.y + yOffsetSvg;
  return {
    x: point.x * WORLD_SCALE - 1,
    y: -(svgY * WORLD_SCALE),
  };
}

function maserMShape(yOffsetSvg: number): Shape {
  const points = MASER_M_CENTERLINE_SVG.map((point) =>
    svgToWorld(point, yOffsetSvg),
  );
  return outlineToShape(polylineRoundStroke(points, STROKE_RADIUS));
}

export function createLogoGeometry(depth: number): BufferGeometry {
  const top = maserMShape(0);
  const bottom = maserMShape(MARK_SVG.stackDy);
  const bevel = Math.min(0.05, depth * 0.14);

  const extrude = {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.85,
    bevelSegments: 5,
    curveSegments: 24,
    steps: 1,
  } as const;

  const topGeo = new ExtrudeGeometry(top, extrude);
  const bottomGeo = new ExtrudeGeometry(bottom, extrude);

  const merged = mergeGeometries([topGeo, bottomGeo], false);
  topGeo.dispose();
  bottomGeo.dispose();

  if (!merged) {
    throw new Error("Logo geometry merge failed");
  }

  merged.center();
  merged.computeVertexNormals();
  if (
    merged.index &&
    merged.getAttribute("position") &&
    merged.getAttribute("normal") &&
    merged.getAttribute("uv")
  ) {
    merged.computeTangents();
  }
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}
