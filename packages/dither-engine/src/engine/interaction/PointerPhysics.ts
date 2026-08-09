import type { InteractionModeId, PhysicsConfig } from "./types";

export type PhysicsSample = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

/**
 * Framerate-independent exponential damp toward a target.
 * Same perceived catch-up on 60Hz / 144Hz (Freya Holmér / frame-damp).
 * Never snaps current → target on pointer enter.
 */
function damp(current: number, target: number, lambda: number, dt: number): number {
  if (dt <= 0 || lambda <= 0) return current;
  return target + (current - target) * Math.exp(-lambda * dt);
}

/**
 * Unique integration per interaction mode — not just different lerp rates.
 */
export class PointerPhysics {
  x = 0.5;
  y = 0.5;
  vx = 0;
  vy = 0;
  private stuck = false;
  private orbitAngle = 0;
  private restX = 0.5;
  private restY = 0.5;

  reset(x = 0.5, y = 0.5): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.stuck = false;
    this.orbitAngle = 0;
    this.restX = x;
    this.restY = y;
  }

  tick(
    mode: InteractionModeId,
    targetX: number,
    targetY: number,
    active: boolean,
    dt: number,
    physics: PhysicsConfig,
    radius: number,
  ): PhysicsSample {
    const px = physics;
    const maxSp = Math.max(0.05, px.maxSpeed);
    let tx = targetX;
    let ty = targetY;

    if (!active && mode !== "none") {
      // Soft return toward rest when idle (except sticky hold).
      if (mode !== "sticky" || !this.stuck) {
        tx = this.restX;
        ty = this.restY;
      }
    }

    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < px.deadZone && mode !== "orbit-pointer" && mode !== "repel") {
      this.vx *= 0.85;
      this.vy *= 0.85;
      return { x: this.x, y: this.y, vx: this.vx, vy: this.vy };
    }

    const prevX = this.x;
    const prevY = this.y;

    switch (mode) {
      case "none":
        this.vx = 0;
        this.vy = 0;
        break;

      case "follow": {
        // Soft catch-up: λ ≈ 3.5–10.5 (half-life ~0.2s → ~0.07s).
        // Previous 8+40*interp caused near-instant snaps on enter.
        const lambda = 3.5 + px.interpolation * 7;
        this.x = damp(this.x, tx, lambda, dt);
        this.y = damp(this.y, ty, lambda, dt);
        this.vx = (this.x - prevX) / Math.max(dt, 1e-4);
        this.vy = (this.y - prevY) / Math.max(dt, 1e-4);
        break;
      }

      case "spring": {
        const invMass = 1 / Math.max(0.2, px.mass);
        const ax = (px.springStrength * dx - px.friction * this.vx) * invMass;
        const ay = (px.springStrength * dy - px.friction * this.vy) * invMass;
        this.vx += ax * dt;
        this.vy += ay * dt;
        this.clampSpeed(maxSp);
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        break;
      }

      case "magnetic": {
        if (dist < radius && active) {
          const force = px.springStrength / (dist * dist + 0.04);
          const inv = 1 / Math.max(dist, 1e-4);
          this.vx += dx * inv * force * dt;
          this.vy += dy * inv * force * dt;
          this.vx *= Math.exp(-px.friction * 0.4 * dt);
          this.vy *= Math.exp(-px.friction * 0.4 * dt);
        } else {
          // Drift gently to rest
          this.vx += (this.restX - this.x) * 2 * dt;
          this.vy += (this.restY - this.y) * 2 * dt;
          this.vx *= Math.exp(-px.friction * dt);
          this.vy *= Math.exp(-px.friction * dt);
        }
        this.clampSpeed(maxSp);
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        break;
      }

      case "sticky": {
        const enter = radius * 0.35;
        const exit = radius * 0.7;
        if (!this.stuck && dist < enter && active) this.stuck = true;
        if (this.stuck && dist > exit) this.stuck = false;
        if (this.stuck && active) {
          // Ease into sticky lock instead of hard teleport
          const lambda = 14 + px.interpolation * 10;
          this.x = damp(this.x, tx, lambda, dt);
          this.y = damp(this.y, ty, lambda, dt);
          this.vx = (this.x - prevX) / Math.max(dt, 1e-4);
          this.vy = (this.y - prevY) / Math.max(dt, 1e-4);
        } else {
          this.x = damp(this.x, this.restX, 5, dt);
          this.y = damp(this.y, this.restY, 5, dt);
          this.vx = (this.x - prevX) / Math.max(dt, 1e-4);
          this.vy = (this.y - prevY) / Math.max(dt, 1e-4);
        }
        break;
      }

      case "gravity": {
        if (dist > 1e-4) {
          const inv = 1 / dist;
          this.vx += dx * inv * px.acceleration * dt;
          this.vy += dy * inv * px.acceleration * dt;
        }
        this.clampSpeed(maxSp);
        this.vx *= Math.exp(-px.friction * 0.15 * dt);
        this.vy *= Math.exp(-px.friction * 0.15 * dt);
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        break;
      }

      case "repel": {
        if (dist < radius && active) {
          const inv = 1 / Math.max(dist, 0.02);
          const force = px.acceleration * inv * inv;
          this.vx -= dx * inv * force * dt;
          this.vy -= dy * inv * force * dt;
        }
        // Soft restore
        this.vx += (this.restX - this.x) * 3 * dt;
        this.vy += (this.restY - this.y) * 3 * dt;
        this.vx *= Math.exp(-px.friction * 0.5 * dt);
        this.vy *= Math.exp(-px.friction * 0.5 * dt);
        this.clampSpeed(maxSp);
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        break;
      }

      case "orbit-pointer": {
        // Travel across most of the surface — no tiny 0.22 UV cap
        const orbitR = Math.max(0.12, Math.min(0.48, radius * 0.85));
        this.orbitAngle += dt * (1.6 + px.acceleration * 0.22);
        const cx = active ? tx : this.restX;
        const cy = active ? ty : this.restY;
        const ox = cx + Math.cos(this.orbitAngle) * orbitR;
        const oy = cy + Math.sin(this.orbitAngle) * orbitR;
        const lambda = 4 + px.interpolation * 8;
        this.x = damp(this.x, ox, lambda, dt);
        this.y = damp(this.y, oy, lambda, dt);
        this.vx = (this.x - prevX) / Math.max(dt, 1e-4);
        this.vy = (this.y - prevY) / Math.max(dt, 1e-4);
        break;
      }

      case "elastic": {
        // Underdamped — low friction relative to spring
        const invMass = 1 / Math.max(0.2, px.mass);
        const friction = Math.max(0.8, px.friction * 0.25);
        const ax = (px.springStrength * 1.4 * dx - friction * this.vx) * invMass;
        const ay = (px.springStrength * 1.4 * dy - friction * this.vy) * invMass;
        this.vx += ax * dt;
        this.vy += ay * dt;
        this.clampSpeed(maxSp * 1.35);
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        // Soft wall
        this.x = Math.min(1.15, Math.max(-0.15, this.x));
        this.y = Math.min(1.15, Math.max(-0.15, this.y));
        break;
      }

      case "pressure":
      case "ripple": {
        // Soft follow — pressure/ripple handled by controller charge/emit
        const lambda = 3 + px.interpolation * 6;
        this.x = damp(this.x, tx, lambda, dt);
        this.y = damp(this.y, ty, lambda, dt);
        this.vx = (this.x - prevX) / Math.max(dt, 1e-4);
        this.vy = (this.y - prevY) / Math.max(dt, 1e-4);
        break;
      }

      default:
        break;
    }

    // Soft edge soft-bound — keep light on-material without hard clipping feel
    this.x = softBound01(this.x);
    this.y = softBound01(this.y);

    return { x: this.x, y: this.y, vx: this.vx, vy: this.vy };
  }

  private clampSpeed(max: number): void {
    const sp = Math.hypot(this.vx, this.vy);
    if (sp > max) {
      const s = max / sp;
      this.vx *= s;
      this.vy *= s;
    }
  }
}

function softBound01(v: number): number {
  // Reflect lightly at edges so lights travel full surface without hard stick
  if (v < 0) return Math.min(0.35, -v * 0.5);
  if (v > 1) return Math.max(0.65, 1 - (v - 1) * 0.5);
  return v;
}
