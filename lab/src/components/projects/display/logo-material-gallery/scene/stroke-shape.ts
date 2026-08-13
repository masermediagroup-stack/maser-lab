import { Shape } from "three";
import type { Vec2 } from "../types";

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(a: Vec2, s: number): Vec2 {
  return { x: a.x * s, y: a.y * s };
}

export function normalize(a: Vec2): Vec2 {
  const len = Math.hypot(a.x, a.y);
  if (len < 1e-8) return { x: 0, y: 0 };
  return { x: a.x / len, y: a.y / len };
}

/** Left-hand normal (CCW). */
export function leftNormal(dir: Vec2): Vec2 {
  return { x: -dir.y, y: dir.x };
}

function miterPoint(curr: Vec2, nIn: Vec2, nOut: Vec2, radius: number): Vec2 {
  const dot = nIn.x * nOut.x + nIn.y * nOut.y;
  const denom = 1 + dot;
  if (Math.abs(denom) < 1e-4) {
    return add(curr, scale(nIn, radius));
  }
  return add(curr, scale(add(nIn, nOut), radius / denom));
}

export type OutlineCmd =
  | { kind: "move"; p: Vec2 }
  | { kind: "line"; p: Vec2 }
  | {
      kind: "arc";
      center: Vec2;
      radius: number;
      from: number;
      to: number;
      clockwise: boolean;
    };

function angleOf(point: Vec2, center: Vec2): number {
  return Math.atan2(point.y - center.y, point.x - center.x);
}

/**
 * Expand a polyline into a round-cap / round-join outline (Y-up).
 * Outer corners become arcs; inner corners use a miter.
 */
export function polylineRoundStroke(
  points: readonly Vec2[],
  radius: number,
): OutlineCmd[] {
  if (points.length < 2) return [];

  const left: OutlineCmd[] = [];
  const right: OutlineCmd[] = [];
  const last = points.length - 1;

  for (let i = 0; i < points.length; i += 1) {
    const curr = points[i]!;
    if (i === 0 || i === last) {
      const dir =
        i === 0 ? sub(points[1]!, curr) : sub(curr, points[i - 1]!);
      const n = leftNormal(normalize(dir));
      left.push({ kind: "line", p: add(curr, scale(n, radius)) });
      right.push({ kind: "line", p: add(curr, scale(n, -radius)) });
      continue;
    }

    const dirIn = normalize(sub(curr, points[i - 1]!));
    const dirOut = normalize(sub(points[i + 1]!, curr));
    const nIn = leftNormal(dirIn);
    const nOut = leftNormal(dirOut);
    const cross = dirIn.x * dirOut.y - dirIn.y * dirOut.x;

    const leftIn = add(curr, scale(nIn, radius));
    const leftOut = add(curr, scale(nOut, radius));
    const rightIn = add(curr, scale(nIn, -radius));
    const rightOut = add(curr, scale(nOut, -radius));

    if (cross > 1e-6) {
      left.push({ kind: "line", p: miterPoint(curr, nIn, nOut, radius) });
      right.push({
        kind: "arc",
        center: curr,
        radius,
        from: angleOf(rightIn, curr),
        to: angleOf(rightOut, curr),
        clockwise: true,
      });
    } else if (cross < -1e-6) {
      left.push({
        kind: "arc",
        center: curr,
        radius,
        from: angleOf(leftIn, curr),
        to: angleOf(leftOut, curr),
        clockwise: false,
      });
      right.push({
        kind: "line",
        p: miterPoint(curr, scale(nIn, -1), scale(nOut, -1), radius),
      });
    } else {
      left.push({ kind: "line", p: leftIn });
      right.push({ kind: "line", p: rightIn });
    }
  }

  const start = points[0]!;
  const end = points[last]!;
  const startDir = sub(points[1]!, start);
  const endDir = sub(end, points[last - 1]!);
  const nStart = leftNormal(normalize(startDir));
  const nEnd = leftNormal(normalize(endDir));
  const leftStart = add(start, scale(nStart, radius));
  const rightStart = add(start, scale(nStart, -radius));
  const leftEnd = add(end, scale(nEnd, radius));
  const rightEnd = add(end, scale(nEnd, -radius));

  const cmds: OutlineCmd[] = [{ kind: "move", p: leftStart }];
  for (let i = 1; i < left.length; i += 1) {
    cmds.push(left[i]!);
  }

  cmds.push({
    kind: "arc",
    center: end,
    radius,
    from: angleOf(leftEnd, end),
    to: angleOf(rightEnd, end),
    clockwise: true,
  });

  for (let i = right.length - 1; i >= 1; i -= 1) {
    const cmd = right[i]!;
    if (cmd.kind === "arc") {
      cmds.push({
        ...cmd,
        from: cmd.to,
        to: cmd.from,
        clockwise: !cmd.clockwise,
      });
    } else {
      cmds.push(cmd);
    }
  }

  cmds.push({
    kind: "arc",
    center: start,
    radius,
    from: angleOf(rightStart, start),
    to: angleOf(leftStart, start),
    clockwise: false,
  });

  return cmds;
}

export function outlineToShape(cmds: OutlineCmd[]): Shape {
  const shape = new Shape();
  for (const cmd of cmds) {
    if (cmd.kind === "move") {
      shape.moveTo(cmd.p.x, cmd.p.y);
    } else if (cmd.kind === "line") {
      shape.lineTo(cmd.p.x, cmd.p.y);
    } else {
      shape.absarc(
        cmd.center.x,
        cmd.center.y,
        cmd.radius,
        cmd.from,
        cmd.to,
        cmd.clockwise,
      );
    }
  }
  shape.closePath();
  return shape;
}
