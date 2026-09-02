import { Path, Shape, Vector2 } from "three";
import { describe, expect, it } from "vitest";
import { assembleSilhouette } from "./assemble-silhouette";
import { clampBevelSize, minFeatureWidth } from "./bevel-limit";
import { EXTRUDE_BEVEL_OFFSET } from "./create-logo-geometry";
import {
  STUDIO_PMREM_FAR,
  STUDIO_PMREM_SIZE,
  STUDIO_RADIUS_SCALE,
} from "./create-studio-environment";
import { SHELL_SMOOTH_ANGLE_RAD } from "./geometry-quality";
import { MP4_HAS_ALPHA, mp4GroundColor } from "./export-mp4";
import { outlineStrokePolyline } from "./outline-stroke";
import { EXPORT_DEFAULTS } from "../defaults";

function rect(x: number, y: number, w: number, h: number): Shape {
  const shape = new Shape();
  shape.moveTo(x, y);
  shape.lineTo(x + w, y);
  shape.lineTo(x + w, y + h);
  shape.lineTo(x, y + h);
  shape.closePath();
  return shape;
}

function circle(cx: number, cy: number, r: number, segments = 32): Shape {
  const shape = new Shape();
  const points: Vector2[] = [];
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    points.push(new Vector2(cx + Math.cos(t) * r, cy + Math.sin(t) * r));
  }
  shape.setFromPoints(points);
  return shape;
}

describe("assembleSilhouette", () => {
  it("keeps disconnected marks as separate solids", () => {
    const shapes = assembleSilhouette([
      rect(0, 0, 10, 40),
      rect(20, 0, 10, 40),
      rect(40, 0, 10, 40),
    ]);
    expect(shapes).toHaveLength(3);
    expect(shapes.every((shape) => shape.holes.length === 0)).toBe(true);
  });

  it("turns a nested island into a hole instead of a second solid", () => {
    const outer = rect(0, 0, 100, 100);
    const inner = rect(30, 30, 40, 40);
    const shapes = assembleSilhouette([outer, inner]);
    expect(shapes).toHaveLength(1);
    expect(shapes[0]!.holes).toHaveLength(1);
  });

  it("keeps a solid nested inside a hole (even-odd island)", () => {
    const outer = rect(0, 0, 100, 100);
    const hole = rect(20, 20, 60, 60);
    const island = rect(40, 40, 20, 20);
    const shapes = assembleSilhouette([outer, hole, island]);
    expect(shapes).toHaveLength(2);
    const parent = shapes.find((shape) => shape.holes.length === 1);
    const nested = shapes.find((shape) => shape.holes.length === 0);
    expect(parent).toBeTruthy();
    expect(nested).toBeTruthy();
  });

  it("preserves existing holes on a single shape", () => {
    const outer = rect(0, 0, 100, 100);
    const hole = new Path();
    hole.moveTo(30, 30);
    hole.lineTo(70, 30);
    hole.lineTo(70, 70);
    hole.lineTo(30, 70);
    hole.closePath();
    outer.holes.push(hole);
    const shapes = assembleSilhouette([outer]);
    expect(shapes).toHaveLength(1);
    expect(shapes[0]!.holes).toHaveLength(1);
  });
});

describe("bevel-limit", () => {
  it("does not let bevel eat a thin bar", () => {
    const bar = rect(0, 0, 20, 100);
    const width = minFeatureWidth(bar);
    expect(width).toBeGreaterThan(15);
    expect(width).toBeLessThan(25);
    expect(clampBevelSize(40, bar)).toBeLessThan(width * 0.5);
    expect(clampBevelSize(40, bar)).toBeLessThanOrEqual(width * 0.42 + 1e-6);
  });

  it("uses ring thickness for a holed mark", () => {
    const ring = circle(0, 0, 50);
    const hole = new Path();
    hole.curves = circle(0, 0, 30).curves.slice();
    ring.holes.push(hole);
    const width = minFeatureWidth(ring);
    expect(width).toBeGreaterThan(15);
    expect(width).toBeLessThan(28);
  });
});

describe("shell normals", () => {
  it("does not crease the chrome shell at 45°", () => {
    expect(SHELL_SMOOTH_ANGLE_RAD).toBe(Math.PI);
    expect(SHELL_SMOOTH_ANGLE_RAD).toBeGreaterThan((89 * Math.PI) / 180);
  });
});

describe("outline strokes", () => {
  it("keeps a closed stroke as one ribbon with a hole, not two islands", () => {
    const ring: Vector2[] = [];
    const segments = 32;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      ring.push(new Vector2(Math.cos(t) * 40, Math.sin(t) * 40));
    }
    const shape = outlineStrokePolyline(ring, {
      strokeWidth: 8,
      strokeLineJoin: "miter",
      strokeLineCap: "butt",
      strokeMiterLimit: 4,
    });
    expect(shape).toBeTruthy();
    expect(shape!.holes).toHaveLength(1);
  });

  it("does not explode an open stroke into separate islands", () => {
    const line = [
      new Vector2(0, 0),
      new Vector2(40, 0),
      new Vector2(80, 0),
      new Vector2(120, 0),
    ];
    const shape = outlineStrokePolyline(line, {
      strokeWidth: 10,
      strokeLineJoin: "miter",
      strokeLineCap: "butt",
      strokeMiterLimit: 4,
    });
    expect(shape).toBeTruthy();
    expect(shape!.holes).toHaveLength(0);
    expect(Math.abs(shape!.getPoints(8).length)).toBeGreaterThan(4);
  });
});

describe("extrude bevel offset", () => {
  it("never uses a negative bevelOffset that would facet lids", () => {
    expect(EXTRUDE_BEVEL_OFFSET).toBe(0);
    expect(EXTRUDE_BEVEL_OFFSET).toBeGreaterThanOrEqual(0);
  });
});

describe("studio env", () => {
  it("uses a large linear studio so sidewalls are not a tiny 8-bit env", () => {
    expect(STUDIO_RADIUS_SCALE).toBeGreaterThan(3);
    expect(STUDIO_PMREM_FAR).toBeGreaterThan(100);
    expect(STUDIO_PMREM_SIZE).toBeGreaterThanOrEqual(512);
  });
});

describe("opaque MP4", () => {
  it("is not sold as transparent and only offers black or white ground", () => {
    expect(MP4_HAS_ALPHA).toBe(false);
    expect(EXPORT_DEFAULTS.mp4Ground).toBe("black");
    expect(mp4GroundColor("black")).toBe("#000000");
    expect(mp4GroundColor("white")).toBe("#ffffff");
  });
});
