import type { Shape } from "three";
import {
  interiorPoint,
  pathFromShape,
  pointInRing,
  shapeFromCurves,
  signedArea,
} from "./path-geometry";

/**
 * Silhouette assembly: nested filled regions become holes, not extra islands.
 * Preserves original curves so SVG stays vector.
 */
export function assembleSilhouette(shapes: Shape[]): Shape[] {
  if (shapes.length === 0) return [];
  if (shapes.length === 1) return [shapeFromCurves(shapes[0]!)];

  const entries = shapes.map((shape) => {
    const points = shape.getPoints(48);
    return {
      shape,
      points,
      area: Math.abs(signedArea(points)),
      parent: -1,
    };
  });

  entries.sort((a, b) => b.area - a.area);

  for (let i = 1; i < entries.length; i++) {
    const sample = interiorPoint(entries[i]!.points);
    let parent = -1;
    for (let j = 0; j < i; j++) {
      if (!pointInRing(sample, entries[j]!.points)) continue;
      parent = j;
    }
    entries[i]!.parent = parent;
  }

  const depthOf = (index: number): number => {
    let depth = 0;
    let parent = entries[index]!.parent;
    const seen = new Set<number>();
    while (parent >= 0 && !seen.has(parent)) {
      seen.add(parent);
      depth += 1;
      parent = entries[parent]!.parent;
    }
    return depth;
  };

  const assembled: Shape[] = [];
  for (let i = 0; i < entries.length; i++) {
    if (depthOf(i) % 2 !== 0) continue;
    const shape = shapeFromCurves(entries[i]!.shape);
    for (let k = 0; k < entries.length; k++) {
      if (entries[k]!.parent !== i) continue;
      if (depthOf(k) !== depthOf(i) + 1) continue;
      shape.holes.push(pathFromShape(entries[k]!.shape));
    }
    assembled.push(shape);
  }

  return assembled.length > 0 ? assembled : shapes.map(shapeFromCurves);
}
