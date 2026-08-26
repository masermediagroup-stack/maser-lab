import {
  BURST_COUNT,
  BURST_STAGGER,
  MAX_CHARGES,
  MAX_PRIMARIES,
  RADIUS_MAX,
  RADIUS_MIN,
  SPAWN_COOLDOWN_MAX,
  SPAWN_COOLDOWN_MIN,
  STILL_CLUSTER,
} from "./constants";

export type Edge = "top" | "right" | "bottom" | "left";

type Vec2 = { x: number; y: number };

type Ball = {
  p0: Vec2;
  p1: Vec2;
  p2: Vec2;
  p3: Vec2;
  r: number;
  t: number;
  duration: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
};

const EDGES: Edge[] = ["top", "right", "bottom", "left"];

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickEdge(exclude?: Edge): Edge {
  const pool = exclude ? EDGES.filter((edge) => edge !== exclude) : EDGES;
  return pool[Math.floor(Math.random() * pool.length)] ?? "left";
}

function pointOnEdge(edge: Edge, width: number, height: number, radius: number): Vec2 {
  const margin = radius + 10;
  const xSpan = Math.max(1, width - margin * 2);
  const ySpan = Math.max(1, height - margin * 2);
  switch (edge) {
    case "top":
      return { x: margin + Math.random() * xSpan, y: -margin };
    case "right":
      return { x: width + margin, y: margin + Math.random() * ySpan };
    case "bottom":
      return { x: margin + Math.random() * xSpan, y: height + margin };
    case "left":
      return { x: -margin, y: margin + Math.random() * ySpan };
  }
}

function mix(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function cubicBezier(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, t: number): Vec2 {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

/**
 * Ease that spends more time in the middle of the page (weight on travel).
 * f(t) = t + a sin(2πt) → f'(0.5) = 1 − 2πa.
 */
function weightEase(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped + 0.1 * Math.sin(2 * Math.PI * clamped);
}

function makeArc(p0: Vec2, p3: Vec2, width: number, height: number): { p1: Vec2; p2: Vec2 } {
  const dx = p3.x - p0.x;
  const dy = p3.y - p0.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const bow = (0.16 + Math.random() * 0.28) * Math.min(width, height);
  const sign = Math.random() < 0.5 ? 1 : -1;
  const p1 = mix(p0, p3, 0.3);
  const p2 = mix(p0, p3, 0.68);
  p1.x += px * bow * sign;
  p1.y += py * bow * sign;
  p2.x += px * bow * sign * 0.35;
  p2.y += py * bow * sign * 0.35;
  return { p1, p2 };
}

function radiusForViewport(width: number, height: number): number {
  const scale = Math.min(width, height) / 820;
  return rand(RADIUS_MIN, RADIUS_MAX) * Math.max(0.72, Math.min(1.15, scale));
}

export class MeatballSimulation {
  readonly charges = new Float32Array(MAX_CHARGES * 4);

  private readonly balls: Ball[] = [];
  private spawnCooldown = 0;
  private burstWait = 0;
  private burstLeft = 0;
  private spawning = false;
  private width = 1;
  private height = 1;

  reset(): void {
    this.balls.length = 0;
    this.spawnCooldown = 0;
    this.burstWait = 0;
    this.burstLeft = 0;
    this.charges.fill(0);
  }

  setSpawning(active: boolean): void {
    if (active && !this.spawning) {
      this.burstLeft = BURST_COUNT;
      this.burstWait = 0;
    }
    this.spawning = active;
  }

  loadStillCluster(width: number, height: number): void {
    this.reset();
    this.width = width;
    this.height = height;
    const minSide = Math.min(width, height);
    for (const node of STILL_CLUSTER) {
      this.balls.push({
        p0: { x: node.x * width, y: node.y * height },
        p1: { x: node.x * width, y: node.y * height },
        p2: { x: node.x * width, y: node.y * height },
        p3: { x: node.x * width, y: node.y * height },
        r: node.r * minSide,
        t: 0,
        duration: 1,
        x: node.x * width,
        y: node.y * height,
        vx: 0,
        vy: 0,
        alive: true,
      });
    }
    this.packCharges();
  }

  step(dt: number, width: number, height: number): void {
    this.width = width;
    this.height = height;
    const capped = Math.min(dt, 0.033);

    for (const ball of this.balls) {
      if (!ball.alive) continue;
      ball.t += capped / ball.duration;
      if (ball.t >= 1) {
        ball.alive = false;
        continue;
      }
      const e0 = weightEase(ball.t);
      const e1 = weightEase(Math.min(1, ball.t + 0.002));
      const pos = cubicBezier(ball.p0, ball.p1, ball.p2, ball.p3, e0);
      const ahead = cubicBezier(ball.p0, ball.p1, ball.p2, ball.p3, e1);
      ball.x = pos.x;
      ball.y = pos.y;
      ball.vx = (ahead.x - pos.x) / 0.002;
      ball.vy = (ahead.y - pos.y) / 0.002;
    }

    this.balls.splice(
      0,
      this.balls.length,
      ...this.balls.filter((ball) => ball.alive),
    );

    if (this.spawning) {
      this.burstWait -= capped;
      if (this.burstLeft > 0 && this.burstWait <= 0) {
        this.trySpawn();
        this.burstLeft -= 1;
        this.burstWait = BURST_STAGGER;
      }

      this.spawnCooldown -= capped;
      if (this.burstLeft <= 0 && this.spawnCooldown <= 0) {
        if (this.trySpawn()) {
          this.spawnCooldown = rand(SPAWN_COOLDOWN_MIN, SPAWN_COOLDOWN_MAX);
        }
      }
    }

    this.packCharges();
  }

  get aliveCount(): number {
    return this.balls.length;
  }

  private trySpawn(): boolean {
    if (this.balls.length >= MAX_PRIMARIES) return false;
    const radius = radiusForViewport(this.width, this.height);
    const spawnEdge = pickEdge();
    const exitEdge = pickEdge(spawnEdge);
    const p0 = pointOnEdge(spawnEdge, this.width, this.height, radius);
    const p3 = pointOnEdge(exitEdge, this.width, this.height, radius);
    const { p1, p2 } = makeArc(p0, p3, this.width, this.height);
    const chord = Math.hypot(p3.x - p0.x, p3.y - p0.y);
    const duration = Math.min(5.2, Math.max(1.7, (1.55 + chord / 440) * (radius / 40)));
    this.balls.push({
      p0,
      p1,
      p2,
      p3,
      r: radius,
      t: 0,
      duration,
      x: p0.x,
      y: p0.y,
      vx: 0,
      vy: 0,
      alive: true,
    });
    return true;
  }

  private packCharges(): void {
    this.charges.fill(0);
    const n = Math.min(this.balls.length, MAX_PRIMARIES);
    for (let i = 0; i < n; i += 1) {
      const ball = this.balls[i];
      if (!ball) continue;
      const base = i * 4;
      this.charges[base] = ball.x;
      this.charges[base + 1] = ball.y;
      this.charges[base + 2] = ball.r;
      this.charges[base + 3] = 1;

      const speed = Math.hypot(ball.vx, ball.vy);
      if (speed < 48) continue;
      const nx = ball.vx / speed;
      const ny = ball.vy / speed;
      const dist = Math.min(ball.r * 1.12, speed * 0.055);
      const trail = (i + MAX_PRIMARIES) * 4;
      this.charges[trail] = ball.x - nx * dist;
      this.charges[trail + 1] = ball.y - ny * dist;
      this.charges[trail + 2] = ball.r * 0.7;
      this.charges[trail + 3] = 1;
    }
  }
}
