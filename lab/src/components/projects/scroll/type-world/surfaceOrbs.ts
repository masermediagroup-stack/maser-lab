import { Vector3 } from "three";
import { MAX_SURFACE_ORBS } from "./constants";

export type SurfaceOrbMotionParams = {
  sizeMin: number;
  sizeMax: number;
  speedMin: number;
  speedMax: number;
  steerAmount: number;
  speedNoise: number;
  driftNoise: number;
};

export type SurfaceOrbState = {
  pos: Vector3;
  dir: Vector3;
  sizeT: number;
  noiseA: number;
  noiseB: number;
  noiseC: number;
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  if (a === 0) a = 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash11(n: number): number {
  const x = Math.sin(n) * 43758.5453123;
  return x - Math.floor(x);
}

/** Smooth 1D value noise in 0..1. Same seed + t always matches. */
export function valueNoise1(seed: number, t: number): number {
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * (3 - 2 * f);
  const a = hash11(seed + i);
  const b = hash11(seed + i + 1);
  return a * (1 - u) + b * u;
}

function randomUnit(rng: () => number, out: Vector3): Vector3 {
  // Marsaglia on the sphere — even coverage, no polar bunching.
  let x = 0;
  let y = 0;
  let s = 2;
  while (s >= 1) {
    x = rng() * 2 - 1;
    y = rng() * 2 - 1;
    s = x * x + y * y;
  }
  const z = 1 - 2 * s;
  const scale = 2 * Math.sqrt(Math.max(0, 1 - s));
  return out.set(x * scale, y * scale, z).normalize();
}

function tangentOn(pos: Vector3, rng: () => number, out: Vector3, scratch: Vector3): Vector3 {
  randomUnit(rng, scratch);
  out.crossVectors(pos, scratch);
  if (out.lengthSq() < 1e-8) {
    scratch.set(pos.y, pos.z, pos.x);
    out.crossVectors(pos, scratch);
  }
  return out.normalize();
}

/**
 * Seeded orbs on the unit sphere. Positions live in mesh-local space so
 * they ride the typographic world when the visitor drags.
 */
export class SurfaceOrbSim {
  readonly orbs: SurfaceOrbState[];
  private time = 0;
  private seed = 1;
  private readonly tmpA = new Vector3();
  private readonly tmpB = new Vector3();

  constructor(seed: number) {
    this.orbs = Array.from({ length: MAX_SURFACE_ORBS }, () => ({
      pos: new Vector3(1, 0, 0),
      dir: new Vector3(0, 1, 0),
      sizeT: 0.5,
      noiseA: 1,
      noiseB: 2,
      noiseC: 3,
    }));
    this.reseed(seed);
  }

  reseed(seed: number): void {
    this.seed = seed >>> 0 || 1;
    this.time = 0;
    const rng = mulberry32(this.seed);

    for (let i = 0; i < MAX_SURFACE_ORBS; i++) {
      const orb = this.orbs[i];
      if (!orb) continue;
      randomUnit(rng, orb.pos);
      tangentOn(orb.pos, rng, orb.dir, this.tmpA);
      orb.sizeT = rng();
      orb.noiseA = rng() * 4096 + 1;
      orb.noiseB = rng() * 4096 + 1;
      orb.noiseC = rng() * 4096 + 1;
    }
  }

  radiusFor(index: number, sizeMin: number, sizeMax: number): number {
    const orb = this.orbs[index];
    const lo = Math.min(sizeMin, sizeMax);
    const hi = Math.max(sizeMin, sizeMax);
    if (!orb) return lo;
    return lo + (hi - lo) * orb.sizeT;
  }

  step(dt: number, params: SurfaceOrbMotionParams): void {
    if (dt === 0) return;
    this.time += dt;

    const speedLo = Math.min(params.speedMin, params.speedMax);
    const speedHi = Math.max(params.speedMin, params.speedMax);
    const speedFreq = Math.max(0, params.speedNoise);
    const driftFreq = Math.max(0, params.driftNoise);
    const steer = params.steerAmount;

    for (let i = 0; i < MAX_SURFACE_ORBS; i++) {
      const orb = this.orbs[i];
      if (!orb) continue;

      const speedT =
        speedFreq <= 1e-4
          ? 0.5
          : valueNoise1(orb.noiseA, this.time * speedFreq);
      const speed = speedLo + (speedHi - speedLo) * speedT;

      const steerT =
        driftFreq <= 1e-4
          ? 0
          : valueNoise1(orb.noiseB, this.time * driftFreq) * 2 - 1;
      const driftT =
        driftFreq <= 1e-4
          ? 0
          : valueNoise1(orb.noiseC, this.time * driftFreq * 0.73) * 2 - 1;

      if (steer !== 0) {
        orb.dir.applyAxisAngle(orb.pos, steer * steerT * dt);
        this.tmpA.crossVectors(orb.pos, orb.dir);
        if (this.tmpA.lengthSq() > 1e-8) {
          this.tmpA.normalize();
          orb.dir.applyAxisAngle(this.tmpA, steer * 0.38 * driftT * dt);
        }
      }

      orb.pos.addScaledVector(orb.dir, speed * dt);
      orb.pos.normalize();

      const radial = orb.dir.dot(orb.pos);
      orb.dir.addScaledVector(orb.pos, -radial);
      if (orb.dir.lengthSq() < 1e-8) {
        this.tmpB.set(orb.pos.y, orb.pos.z, orb.pos.x);
        orb.dir.crossVectors(orb.pos, this.tmpB);
      }
      orb.dir.normalize();
    }
  }
}
