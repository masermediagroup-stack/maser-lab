import { Box2, Shape, Vector2 } from "three";

export function measureShapes(shapes: Shape[]): { box: Box2; maxXY: number } {
  const box = new Box2();
  for (const shape of shapes) {
    for (const point of shape.getPoints(24)) box.expandByPoint(point);
    for (const hole of shape.holes) {
      for (const point of hole.getPoints(24)) box.expandByPoint(point);
    }
  }
  if (box.isEmpty()) {
    return { box, maxXY: 0 };
  }
  const size = box.getSize(new Vector2());
  return { box, maxXY: Math.max(size.x, size.y) };
}
