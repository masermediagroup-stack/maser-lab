import { getInteractionMode } from "./modes/catalog";
import { PointerPhysics } from "./PointerPhysics";
import type {
  HoldBehaviorId,
  InteractionEngineConfig,
  InteractionUniformPayload,
  PointerStateId,
  ProceduralLight,
  ReleaseBehaviorId,
  RippleStyleId,
  TrailModeId,
} from "./types";
import {
  DEFAULT_INTERACTION_CONFIG,
  MAX_LIGHTS,
  MAX_RIPPLES,
  MAX_TRAIL,
  POINTER_STATE_INDEX,
  idleInteractionPayload,
} from "./types";

type RippleSlot = {
  x: number;
  y: number;
  age: number;
  amp: number;
  alive: boolean;
  dirX: number;
  dirY: number;
};

type TrailPoint = { x: number; y: number };

const FALLOFF_INDEX = {
  linear: 0,
  smooth: 1,
  gaussian: 2,
  exponential: 3,
  power: 4,
} as const;

const TRAIL_INDEX: Record<TrailModeId, number> = {
  none: 0,
  light: 1,
  density: 2,
  heat: 3,
  gradient: 4,
  ghost: 5,
  "motion-blur": 6,
};

const RIPPLE_INDEX: Record<RippleStyleId, number> = {
  none: 0,
  single: 1,
  repeating: 2,
  noise: 3,
  directional: 4,
  pressure: 5,
};

/**
 * Owns pointer physics, lights, ripples, trails, and pointer states.
 * Emits GPU-ready uniforms each frame. Does not touch React.
 */
export class InteractionController {
  private config: InteractionEngineConfig;
  private physics = new PointerPhysics();
  private targetX = 0.5;
  private targetY = 0.5;
  private pointerActive = false;
  private pointerDown = false;
  private state: PointerStateId = "idle";
  private holdCharge = 0;
  private holdTime = 0;
  private releasePulse = 0;
  private releaseTimer = 0;
  private idleTimer = 0;
  private ripples: RippleSlot[] = Array.from({ length: MAX_RIPPLES }, () => ({
    x: 0.5,
    y: 0.5,
    age: 0,
    amp: 0,
    alive: false,
    dirX: 1,
    dirY: 0,
  }));
  private trail: TrailPoint[] = [];
  private trailAcc = 0;
  private lastEmitX = 0.5;
  private lastEmitY = 0.5;
  private payload = idleInteractionPayload();
  private viewportScale = 1;
  private materialInfluence = 1;

  constructor(initial?: Partial<InteractionEngineConfig>) {
    this.config = this.mergeConfig(DEFAULT_INTERACTION_CONFIG, initial);
    this.physics.reset(0.5, 0.5);
  }

  getConfig(): Readonly<InteractionEngineConfig> {
    return this.config;
  }

  getState(): PointerStateId {
    return this.state;
  }

  setViewportSize(width: number, height: number): void {
    if (!this.config.responsiveScale) {
      this.viewportScale = 1;
      return;
    }
    // Normalize to ~1280×720 reference — radius stays characterful
    const diag = Math.hypot(Math.max(width, 1), Math.max(height, 1));
    const ref = Math.hypot(1280, 720);
    this.viewportScale = Math.min(1.35, Math.max(0.65, Math.sqrt(diag / ref)));
  }

  applyConfig(next: Partial<InteractionEngineConfig>): void {
    this.config = this.mergeConfig(this.config, next);
  }

  syncFromProps(next?: Partial<InteractionEngineConfig>): void {
    if (next) this.applyConfig(next);
  }

  /**
   * DOM-normalized pointer (y=0 top). Converted to UV (y=0 bottom) here.
   */
  setTargetDom(x: number, y: number, active: boolean): void {
    this.targetX = clamp01(x);
    this.targetY = clamp01(1 - y);
    this.pointerActive = active;
    if (active) {
      this.idleTimer = 0;
      if (this.state === "idle" || this.state === "exit") {
        this.state = this.pointerDown ? "down" : "hover";
      }
    }
  }

  setPointerDown(down: boolean): void {
    const wasDown = this.pointerDown;
    this.pointerDown = down;
    if (down && !wasDown) {
      this.state = "down";
      this.holdTime = 0;
      this.maybeSpawnRipple("down");
    } else if (!down && wasDown) {
      this.beginRelease();
    }
  }

  setPointerExit(): void {
    if (this.pointerDown) {
      this.beginRelease();
    }
    this.pointerActive = false;
    this.pointerDown = false;
    if (this.releaseTimer <= 0) {
      this.state = "exit";
    }
    this.idleTimer = 0;
  }

  tick(
    dt: number,
    reducedMotion: boolean,
    time: number,
    material?: { lightX: number; lightY: number; influence?: number },
  ): InteractionUniformPayload {
    if (material) {
      for (const light of this.config.lights) {
        if (light.role === "ambient") {
          light.x = material.lightX;
          light.y = material.lightY;
        }
      }
      if (typeof material.influence === "number") {
        this.materialInfluence = material.influence;
      }
    }

    const cfg = this.config;
    if (!cfg.enabled || reducedMotion) {
      return this.writeDisabledPayload();
    }

    this.updateStateMachine(dt);
    this.updateHold(dt);
    this.updateRelease(dt);

    const radius =
      cfg.falloff.radius * this.viewportScale * (0.85 + this.holdCharge * 0.4);

    const sample = this.physics.tick(
      cfg.modeId,
      this.targetX,
      this.targetY,
      this.pointerActive || this.pointerDown,
      dt,
      cfg.physics,
      radius,
    );

    this.updateTrail(dt, sample.x, sample.y);
    this.updateRipples(dt);
    this.maybeAutoRipple(sample.x, sample.y);

    const lights = this.resolveLights(time, sample.x, sample.y, radius);
    this.packPayload(sample.x, sample.y, sample.vx, sample.vy, lights, radius);
    return this.payload;
  }

  private updateStateMachine(dt: number): void {
    if (this.pointerDown) {
      this.holdTime += dt;
      if (this.holdTime > 0.18) this.state = "hold";
      else this.state = "down";
      return;
    }
    if (this.releaseTimer > 0) {
      this.state = "release";
      return;
    }
    if (this.pointerActive) {
      this.state = "hover";
      this.idleTimer = 0;
      return;
    }
    if (this.state === "exit") {
      this.idleTimer += dt;
      if (this.idleTimer > 0.35) this.state = "idle";
      return;
    }
    this.idleTimer += dt;
    if (this.idleTimer > 0.5) this.state = "idle";
  }

  private updateHold(dt: number): void {
    const { behavior, chargeRate, maxCharge } = this.config.hold;
    if (this.state === "hold" || this.state === "down") {
      if (behavior === "none") return;
      this.holdCharge = Math.min(
        maxCharge,
        this.holdCharge + chargeRate * dt,
      );
    } else if (this.releaseTimer <= 0) {
      this.holdCharge = Math.max(0, this.holdCharge - dt * 0.85);
    }
  }

  private beginRelease(): void {
    const { behavior, strength, duration } = this.config.release;
    this.releaseTimer = Math.max(0.05, duration);
    this.releasePulse = strength * (0.4 + this.holdCharge * 0.6);
    this.state = "release";

    if (
      behavior === "ripple" ||
      behavior === "shockwave" ||
      this.config.modeId === "ripple"
    ) {
      this.spawnRipple(
        this.physics.x,
        this.physics.y,
        this.releasePulse * (behavior === "shockwave" ? 1.4 : 1),
      );
    }
    if (behavior === "elastic") {
      // Nudge velocity outward for elastic return feel
      this.physics.vx += (this.physics.x - 0.5) * 2;
      this.physics.vy += (this.physics.y - 0.5) * 2;
    }
  }

  private updateRelease(dt: number): void {
    if (this.releaseTimer <= 0) {
      this.releasePulse = Math.max(0, this.releasePulse - dt * 2);
      return;
    }
    this.releaseTimer -= dt;
    const t = Math.max(0, this.releaseTimer / this.config.release.duration);
    this.releasePulse *= 0.5 + t * 0.5;
    if (this.releaseTimer <= 0) {
      this.releasePulse = 0;
      this.state = this.pointerActive ? "hover" : "exit";
    }
  }

  private updateTrail(dt: number, x: number, y: number): void {
    if (this.config.trail.mode === "none") {
      this.trail.length = 0;
      return;
    }
    this.trailAcc += dt;
    const step = 0.016 + (1 - this.config.trail.smoothing) * 0.03;
    if (this.trailAcc >= step) {
      this.trailAcc = 0;
      this.trail.unshift({ x, y });
      const maxPts = Math.max(
        2,
        Math.min(MAX_TRAIL, Math.round(2 + this.config.trail.length * 10)),
      );
      if (this.trail.length > maxPts) this.trail.length = maxPts;
    }
    // Decay older points toward newest (visual fade handled in shader via index)
    const decay = this.config.trail.decay;
    for (let i = 1; i < this.trail.length; i++) {
      const p = this.trail[i]!;
      const prev = this.trail[i - 1]!;
      p.x += (prev.x - p.x) * (1 - decay) * 0.15;
      p.y += (prev.y - p.y) * (1 - decay) * 0.15;
    }
  }

  private maybeAutoRipple(x: number, y: number): void {
    const style = this.config.ripple.style;
    if (style === "none" && this.config.modeId !== "ripple") return;
    if (!this.pointerActive && !this.pointerDown) return;

    const moved = Math.hypot(x - this.lastEmitX, y - this.lastEmitY);
    const threshold =
      style === "repeating" || this.config.modeId === "ripple" ? 0.04 : 0.12;

    if (moved > threshold) {
      this.lastEmitX = x;
      this.lastEmitY = y;
      if (style !== "none" || this.config.modeId === "ripple") {
        this.spawnRipple(x, y, this.config.ripple.amplitude);
      }
    }
  }

  private maybeSpawnRipple(reason: "down"): void {
    void reason;
    if (
      this.config.ripple.style === "none" &&
      this.config.modeId !== "ripple" &&
      this.config.hold.behavior !== "ripples"
    ) {
      return;
    }
    this.spawnRipple(
      this.targetX,
      this.targetY,
      this.config.ripple.amplitude * (1 + this.holdCharge),
    );
  }

  private spawnRipple(x: number, y: number, amp: number): void {
    let slot = this.ripples.find((r) => !r.alive);
    if (!slot) {
      // Replace oldest
      slot = this.ripples.reduce((a, b) => (a.age > b.age ? a : b));
    }
    const vx = this.physics.vx;
    const vy = this.physics.vy;
    const sp = Math.hypot(vx, vy) || 1;
    slot.x = x;
    slot.y = y;
    slot.age = 0;
    slot.amp = amp;
    slot.alive = true;
    slot.dirX = vx / sp;
    slot.dirY = vy / sp;
  }

  private updateRipples(dt: number): void {
    const decay = this.config.ripple.decay;
    for (const r of this.ripples) {
      if (!r.alive) continue;
      r.age += dt * this.config.ripple.expansionSpeed;
      r.amp *= Math.exp(-decay * dt);
      if (r.age > 2.2 || r.amp < 0.02) {
        r.alive = false;
        r.amp = 0;
      }
    }
  }

  private resolveLights(
    time: number,
    px: number,
    py: number,
    radius: number,
  ): ProceduralLight[] {
    const out: ProceduralLight[] = [];
    const mul = this.stateRadiusMul();
    for (const light of this.config.lights) {
      if (!light.enabled) continue;
      const copy = { ...light };
      const soft = light.softness ?? 0.55;
      const opacity = light.opacity ?? 1;
      const noise = light.noiseInfluence ?? 0;

      if (copy.role === "pointer") {
        copy.x = px;
        copy.y = py;
        copy.radius = radius * 0.85 * mul * (0.85 + soft * 0.3);
        copy.intensity =
          light.intensity *
          opacity *
          this.config.influence *
          (0.75 + this.holdCharge * 0.45 + this.releasePulse * 0.3);
      } else if (copy.role === "ambient") {
        copy.intensity =
          light.intensity * opacity * (0.9 + this.stateBrightness() * 0.2);
      } else if (copy.role === "edge") {
        // Sweep along edges with large travel
        const ang = time * Math.max(0.15, copy.moveSpeed) + copy.phase;
        const edge = (Math.sin(ang) * 0.5 + 0.5) * copy.offset * 2;
        copy.x = clamp01(0.04 + edge * 0.92);
        copy.y = clamp01(0.08 + Math.cos(ang * 0.7) * copy.offset * 0.85);
        copy.radius = light.radius * (0.9 + soft * 0.4);
        copy.intensity =
          light.intensity *
          opacity *
          (0.7 + 0.3 * Math.sin(time * 1.1 + copy.phase));
      } else if (
        copy.animation > 0 ||
        copy.role === "animated" ||
        copy.role === "primary" ||
        copy.role === "secondary" ||
        copy.role === "accent"
      ) {
        const ang = time * Math.max(0.05, copy.moveSpeed) + copy.phase;
        const travel = Math.max(0.2, copy.offset);
        const nx =
          noise > 0
            ? Math.sin(time * 1.7 + copy.phase * 2) * noise * 0.12
            : 0;
        const ny =
          noise > 0
            ? Math.cos(time * 1.3 + copy.phase) * noise * 0.12
            : 0;
        copy.x = clamp01(light.x + Math.cos(ang) * travel + nx);
        copy.y = clamp01(light.y + Math.sin(ang * 0.85) * travel + ny);
        copy.radius = light.radius * (0.85 + soft * 0.35);
        copy.intensity =
          light.intensity *
          opacity *
          (0.7 + 0.3 * Math.sin(time * 1.3 + copy.phase));
      }
      out.push(copy);
      if (out.length >= MAX_LIGHTS) break;
    }
    return out;
  }

  private stateBrightness(): number {
    switch (this.state) {
      case "hover":
        return 0.04;
      case "down":
        return 0.08;
      case "hold":
        return 0.1 + this.holdCharge * 0.12;
      case "release":
        return this.releasePulse * 0.15;
      default:
        return 0;
    }
  }

  private stateBloom(): number {
    const hold = this.config.hold.behavior;
    let v = 0;
    if (this.state === "hold" && (hold === "bloom" || hold === "charge")) {
      v += this.holdCharge * 0.35;
    }
    if (
      this.state === "release" &&
      (this.config.release.behavior === "bloom" ||
        this.config.release.behavior === "shockwave")
    ) {
      v += this.releasePulse * 0.4;
    }
    return v;
  }

  private stateContrast(): number {
    if (
      this.state === "hold" &&
      this.config.hold.behavior === "contrast"
    ) {
      return this.holdCharge * 0.25;
    }
    return this.state === "down" ? 0.05 : 0;
  }

  private stateRadiusMul(): number {
    const hold = this.config.hold.behavior;
    if (
      this.state === "hold" &&
      (hold === "grow-radius" || hold === "accumulate" || hold === "charge")
    ) {
      return 1 + this.holdCharge * 0.55;
    }
    if (
      this.state === "release" &&
      this.config.release.behavior === "collapse"
    ) {
      return Math.max(0.4, 1 - this.releasePulse * 0.5);
    }
    if (this.state === "hold" && hold === "pulse") {
      return 1 + Math.sin(this.holdTime * 8) * 0.12 * this.holdCharge;
    }
    return 1;
  }

  private packPayload(
    x: number,
    y: number,
    vx: number,
    vy: number,
    lights: ProceduralLight[],
    radius: number,
  ): void {
    const p = this.payload;
    const cfg = this.config;
    p.pointerX = x;
    p.pointerY = y;
    p.velocityX = vx;
    p.velocityY = vy;
    p.state = POINTER_STATE_INDEX[this.state];
    p.mode = getInteractionMode(cfg.modeId).index;
    p.influence = cfg.influence * this.materialInfluence;
    p.holdCharge = this.holdCharge;
    p.falloffType = FALLOFF_INDEX[cfg.falloff.type];
    p.falloffRadius = radius;
    p.falloffSoft = cfg.falloff.softness;
    p.falloffPower = cfg.falloff.power;
    p.trailMode = TRAIL_INDEX[cfg.trail.mode];
    p.trailIntensity = cfg.trail.intensity * cfg.influence;
    p.trailWidth = cfg.trail.width;
    p.rippleStyle = RIPPLE_INDEX[
      cfg.modeId === "ripple" && cfg.ripple.style === "none"
        ? "single"
        : cfg.ripple.style
    ];
    p.rippleFreq = cfg.ripple.frequency;
    p.rippleThick = cfg.ripple.thickness;
    p.debug = cfg.debug ? 1 : 0;
    p.releasePulse = this.releasePulse;
    p.stateBrightness = this.stateBrightness();
    p.stateBloom = this.stateBloom();
    p.stateContrast = this.stateContrast();
    p.stateRadiusMul = this.stateRadiusMul();

    p.lightCount = lights.length;
    p.lightPos.fill(0);
    p.lightRad.fill(0);
    p.lightInt.fill(0);
    p.lightCol.fill(0);
    p.lightFlags.fill(0);
    for (let i = 0; i < lights.length; i++) {
      const L = lights[i]!;
      p.lightPos[i * 2] = L.x;
      p.lightPos[i * 2 + 1] = L.y;
      p.lightRad[i] = L.radius;
      p.lightInt[i] = L.intensity;
      p.lightCol[i] = L.color;
      p.lightFlags[i] =
        (L.enabled ? 1 : 0) +
        (L.blendMode === "screen" ? 2 : L.blendMode === "soft" ? 4 : 0);
    }

    p.ripples.fill(0);
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const r = this.ripples[i]!;
      if (!r.alive) continue;
      p.ripples[i * 4] = r.x;
      p.ripples[i * 4 + 1] = r.y;
      p.ripples[i * 4 + 2] = r.age;
      p.ripples[i * 4 + 3] = r.amp;
    }

    p.trailPts.fill(0);
    p.trailCount = Math.min(MAX_TRAIL, this.trail.length);
    for (let i = 0; i < p.trailCount; i++) {
      const t = this.trail[i]!;
      p.trailPts[i * 2] = t.x;
      p.trailPts[i * 2 + 1] = t.y;
    }
  }

  private writeDisabledPayload(): InteractionUniformPayload {
    const p = this.payload;
    p.influence = 0;
    p.state = 0;
    p.debug = 0;
    p.holdCharge = 0;
    p.releasePulse = 0;
    p.trailCount = 0;
    p.lightCount = 0;
    // Still expose ambient from config for base lighting
    const ambient = this.config.lights.find((l) => l.role === "ambient");
    if (ambient?.enabled) {
      p.lightCount = 1;
      p.lightPos[0] = ambient.x;
      p.lightPos[1] = ambient.y;
      p.lightRad[0] = ambient.radius;
      p.lightInt[0] = ambient.intensity * 0.7;
      p.lightCol[0] = ambient.color;
      p.lightFlags[0] = 1;
    }
    p.pointerX = 0.5;
    p.pointerY = 0.5;
    return p;
  }

  private mergeConfig(
    base: InteractionEngineConfig,
    partial?: Partial<InteractionEngineConfig>,
  ): InteractionEngineConfig {
    if (!partial) {
      return {
        ...base,
        physics: { ...base.physics },
        falloff: { ...base.falloff },
        trail: { ...base.trail },
        ripple: { ...base.ripple },
        hold: { ...base.hold },
        release: { ...base.release },
        lights: base.lights.map((l) => ({ ...l })),
      };
    }
    return {
      ...base,
      ...partial,
      physics: { ...base.physics, ...partial.physics },
      falloff: { ...base.falloff, ...partial.falloff },
      trail: { ...base.trail, ...partial.trail },
      ripple: { ...base.ripple, ...partial.ripple },
      hold: { ...base.hold, ...partial.hold },
      release: { ...base.release, ...partial.release },
      lights: partial.lights
        ? partial.lights.map((l) => ({ ...l }))
        : base.lights.map((l) => ({ ...l })),
    };
  }
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export type { HoldBehaviorId, ReleaseBehaviorId };
