import { animatedColorForPiece, assignPieceColors } from "./colors";
import { rotateShape } from "./polyominoes";
import type {
  PieceAnimState,
  PieceRuntime,
  PixelPiece,
  RevealOutDirection,
  TetrisPixelSettings,
} from "./types";

export type ControllerState = {
  pieces: PieceRuntime[];
  phase: "in" | "out" | "hold" | "done";
  elapsed: number;
  wordGlow: number;
  allLanded: boolean;
  gridWidth: number;
  gridHeight: number;
};

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function easeInCubic(t: number): number {
  return t * t * t;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function steppedHorizontal(
  spawnX: number,
  waypoints: number[],
  targetX: number,
  t: number,
): number {
  const points = [spawnX, ...waypoints];
  if (points[points.length - 1] !== targetX) points.push(targetX);
  if (points.length === 1) return points[0]!;
  const travelT = Math.min(1, t / 0.82);
  const segCount = points.length - 1;
  const f = travelT * segCount;
  const i = Math.min(segCount - 1, Math.floor(f));
  const local = f - i;
  const slide = local < 0.2 ? easeInCubic(local / 0.2) : 1;
  return lerp(points[i]!, points[i + 1]!, slide);
}

function rotationAt(start: number, steps: number, t: number, rotationSpeed: number): number {
  if (steps <= 0) return 0;
  const windowStart = 0.15;
  const windowEnd = 0.75;
  const speedScale = 0.5 + rotationSpeed * 0.5;
  const u = (t - windowStart) / ((windowEnd - windowStart) / speedScale);
  const clamped = Math.max(0, Math.min(1, u));
  const stepped = Math.floor(clamped * steps + 1e-6);
  const currentStep = Math.min(steps, stepped);
  const stepProgress = clamped * steps - currentStep;
  const from = start - currentStep * 90;
  if (stepProgress < 0.25 && currentStep < steps) {
    const next = start - (currentStep + 1) * 90;
    return lerp(from, next, easeOutCubic(stepProgress / 0.25));
  }
  return start - currentStep * 90;
}

function setState(p: PieceRuntime, animState: PieceAnimState, visible: boolean) {
  p.animState = animState;
  p.visible = visible;
}

export function createRuntimePieces(pieces: PixelPiece[]): PieceRuntime[] {
  return pieces.map((p) => ({
    ...p,
    x: p.spawnX,
    y: p.spawnY,
    rotation: p.startRotation,
    progress: 0,
    bounceScaleY: 1,
    glowAlpha: 0,
    impactFlash: 0,
    // waiting: never draw until delay elapses
    visible: false,
    animState: "waiting" as const,
    landed: false,
  }));
}

export function initController(
  pieces: PixelPiece[],
  gridWidth: number,
  gridHeight: number,
  settings: Pick<
    TetrisPixelSettings,
    | "colorMode"
    | "color"
    | "rainbowSaturation"
    | "rainbowBrightness"
    | "rainbowSpread"
    | "hueSpeed"
    | "gradientAxis"
    | "phase"
  >,
): ControllerState {
  const colored = assignPieceColors(pieces, {
    colorMode: settings.colorMode,
    color: settings.color,
    rainbowSaturation: settings.rainbowSaturation,
    rainbowBrightness: settings.rainbowBrightness,
    rainbowSpread: settings.rainbowSpread,
    hueSpeed: settings.hueSpeed,
    gradientAxis: settings.gradientAxis,
    gridWidth,
    gridHeight,
    timeMs: 0,
  });

  const phase = settings.phase === "out" ? "out" : "in";
  const runtime = createRuntimePieces(colored);

  if (phase === "out") {
    for (const p of runtime) {
      p.x = p.targetX;
      p.y = p.targetY;
      p.rotation = 0;
      p.progress = 1;
      p.landed = true;
      p.bounceScaleY = 1;
      p.glowAlpha = 0;
      setState(p, "landed", true);
    }
  }

  return {
    pieces: runtime,
    phase,
    elapsed: 0,
    wordGlow: phase === "out" ? 0.3 : 0,
    allLanded: phase === "out",
    gridWidth,
    gridHeight,
  };
}

function updateRevealIn(
  state: ControllerState,
  dt: number,
  settings: TetrisPixelSettings,
): void {
  state.elapsed += dt;
  let landedCount = 0;

  for (let i = 0; i < state.pieces.length; i++) {
    const p = state.pieces[i]!;
    const localTime = state.elapsed - p.delay;

    if (settings.colorMode === "animated-rainbow" && localTime >= 0) {
      p.color = animatedColorForPiece(i, state.pieces.length, {
        colorMode: settings.colorMode,
        color: settings.color,
        rainbowSaturation: settings.rainbowSaturation,
        rainbowBrightness: settings.rainbowBrightness,
        rainbowSpread: settings.rainbowSpread,
        hueSpeed: settings.hueSpeed,
        gradientAxis: settings.gradientAxis,
        gridWidth: state.gridWidth,
        gridHeight: state.gridHeight,
        timeMs: state.elapsed,
      });
      p.glowColor = p.color;
    }

    // Explicit skip — do not clamp progress to 0 and draw at spawn.
    if (localTime < 0) {
      p.x = p.spawnX;
      p.y = p.spawnY;
      p.rotation = p.startRotation;
      p.progress = 0;
      p.landed = false;
      setState(p, "waiting", false);
      continue;
    }

    if (p.landed || p.animState === "landed" || p.animState === "landing") {
      const sinceLand = localTime - p.duration;
      if (sinceLand < 180 && p.animState !== "landed") {
        setState(p, "landing", true);
      } else {
        setState(p, "landed", true);
        p.impactFlash = 0;
      }
      landedCount++;
      const glowT = Math.max(0, 1 - sinceLand / Math.max(60, settings.glowDuration));
      p.glowAlpha = glowT * settings.glowIntensity;
      p.impactFlash = Math.max(0, 1 - sinceLand / 120) * settings.impactFlash;
      const bounceT = Math.min(1, Math.max(0, sinceLand) / 180);
      const bounce = Math.sin(bounceT * Math.PI) * settings.landingBounce * 0.12;
      p.bounceScaleY = 1 - bounce + bounceT * bounce * 0.3;
      if (bounceT >= 1) p.bounceScaleY = 1;
      p.x = p.targetX;
      p.y = p.targetY;
      p.rotation = 0;
      continue;
    }

    const t = Math.min(1, localTime / Math.max(1, p.duration));
    p.progress = t;
    setState(p, "falling", true);

    const yT = t < 0.85 ? t / 0.85 : 1;
    const yEase = yT < 1 ? yT * yT : 1;
    p.y = lerp(p.spawnY, p.targetY, yEase);
    p.x = steppedHorizontal(p.spawnX, p.horizontalWaypoints, p.targetX, t);
    p.rotation = rotationAt(p.startRotation, p.rotationSteps, t, settings.rotationSpeed);

    if (t >= 1) {
      p.landed = true;
      p.x = p.targetX;
      p.y = p.targetY;
      p.rotation = 0;
      p.glowAlpha = settings.glowIntensity;
      p.impactFlash = settings.impactFlash;
      p.bounceScaleY = 1 - settings.landingBounce * 0.15;
      setState(p, "landing", true);
      landedCount++;
    }
  }

  state.allLanded = landedCount === state.pieces.length && state.pieces.length > 0;
  if (state.allLanded) {
    state.wordGlow = Math.min(1, state.wordGlow + dt / 400) * settings.finalWordGlow;
    if (state.phase === "in") state.phase = "hold";
  }
}

function updateRevealOut(
  state: ControllerState,
  dt: number,
  settings: TetrisPixelSettings,
): void {
  state.elapsed += dt;
  const speed = Math.max(0.35, settings.revealOutSpeed);
  const direction: RevealOutDirection = settings.revealOutDirection;
  let gone = 0;

  const order = state.pieces.map((p, i) => ({ p, i }));
  if (direction === "reverse-assembly") {
    order.reverse();
  } else {
    order.sort(
      (a, b) =>
        Math.min(...a.p.cells.map((c) => c.y + a.p.targetY)) -
        Math.min(...b.p.cells.map((c) => c.y + b.p.targetY)),
    );
  }

  const stagger = settings.stagger / speed;

  for (let seq = 0; seq < order.length; seq++) {
    const { p, i } = order[seq]!;
    const delay = seq * stagger * 0.85;
    const localTime = state.elapsed - delay;
    const duration = (settings.fallDuration * 0.65) / speed;

    if (settings.colorMode === "animated-rainbow") {
      p.color = animatedColorForPiece(i, state.pieces.length, {
        colorMode: settings.colorMode,
        color: settings.color,
        rainbowSaturation: settings.rainbowSaturation,
        rainbowBrightness: settings.rainbowBrightness,
        rainbowSpread: settings.rainbowSpread,
        hueSpeed: settings.hueSpeed,
        gradientAxis: settings.gradientAxis,
        gridWidth: state.gridWidth,
        gridHeight: state.gridHeight,
        timeMs: state.elapsed,
      });
      p.glowColor = p.color;
    }

    if (localTime < 0) {
      p.x = p.targetX;
      p.y = p.targetY;
      p.rotation = 0;
      p.landed = true;
      setState(p, "landed", true);
      continue;
    }

    const t = Math.min(1, localTime / Math.max(1, duration));
    setState(p, "exiting", t < 1);

    if (t < 0.08) {
      p.glowAlpha = settings.glowIntensity * (1 - t / 0.08);
    } else {
      p.glowAlpha = Math.max(0, p.glowAlpha - dt / 200);
    }

    const exitLift = state.gridHeight + 8;
    let destY = p.targetY + exitLift;
    let destX = p.targetX;
    let destRot = 90;

    if (direction === "lift-up") {
      destY = p.targetY - exitLift;
      destRot = -90;
    } else if (direction === "scatter-vertical") {
      destY = i % 2 === 0 ? p.targetY + exitLift : p.targetY - exitLift;
      destX = p.targetX + ((i % 5) - 2) * 1.2;
      destRot = ((i % 3) + 1) * 90;
    } else if (direction === "reverse-assembly") {
      destY = p.spawnY;
      destX = p.spawnX;
      destRot = p.startRotation;
    }

    const ease = easeInCubic(t);
    p.x = lerp(p.targetX, destX, ease);
    p.y = lerp(p.targetY, destY, ease);
    p.rotation = lerp(0, destRot, ease);
    p.landed = false;
    if (t >= 1) {
      setState(p, "exiting", false);
      gone++;
    }
  }

  state.wordGlow = Math.max(0, state.wordGlow - dt / 500);
  if (gone === state.pieces.length) {
    state.phase = "done";
    state.allLanded = false;
  }
}

export function tickController(
  state: ControllerState,
  dt: number,
  settings: TetrisPixelSettings,
): ControllerState {
  if (settings.paused) return state;

  if (state.phase === "in" || state.phase === "hold") {
    if (state.phase === "in" || !state.allLanded) {
      updateRevealIn(state, dt, settings);
    } else {
      state.elapsed += dt;
      if (settings.colorMode === "animated-rainbow") {
        for (let i = 0; i < state.pieces.length; i++) {
          const p = state.pieces[i]!;
          p.color = animatedColorForPiece(i, state.pieces.length, {
            colorMode: settings.colorMode,
            color: settings.color,
            rainbowSaturation: settings.rainbowSaturation,
            rainbowBrightness: settings.rainbowBrightness,
            rainbowSpread: settings.rainbowSpread,
            hueSpeed: settings.hueSpeed,
            gradientAxis: settings.gradientAxis,
            gridWidth: state.gridWidth,
            gridHeight: state.gridHeight,
            timeMs: state.elapsed,
          });
          p.glowColor = p.color;
        }
      }
      state.wordGlow =
        settings.finalWordGlow * (0.75 + 0.25 * Math.sin(state.elapsed / 600));
    }
  } else if (state.phase === "out") {
    updateRevealOut(state, dt, settings);
  }

  return state;
}

export function snapToCompleted(state: ControllerState, settings: TetrisPixelSettings): void {
  for (const p of state.pieces) {
    p.x = p.targetX;
    p.y = p.targetY;
    p.rotation = 0;
    p.landed = true;
    p.progress = 1;
    p.bounceScaleY = 1;
    p.glowAlpha = 0;
    p.impactFlash = 0;
    setState(p, "landed", true);
  }
  state.allLanded = true;
  state.phase = "hold";
  state.wordGlow = settings.finalWordGlow;
}

export function getDrawnCells(
  piece: PieceRuntime,
): Array<{ x: number; y: number }> {
  const rot = ((Math.round(piece.rotation / 90) % 4) + 4) % 4;
  const snapped = (rot * 90) as 0 | 90 | 180 | 270;
  const useSmooth = Math.abs(piece.rotation - snapped) > 2;
  if (!useSmooth) {
    return rotateShape(piece.cells, snapped).map((c) => ({
      x: Math.round(piece.x) + c.x,
      y: Math.round(piece.y) + c.y,
    }));
  }
  const cx = piece.cells.reduce((s, c) => s + c.x, 0) / piece.cells.length;
  const cy = piece.cells.reduce((s, c) => s + c.y, 0) / piece.cells.length;
  const rad = (piece.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return piece.cells.map((c) => {
    const dx = c.x - cx;
    const dy = c.y - cy;
    return {
      x: piece.x + cx + dx * cos - dy * sin,
      y: piece.y + cy + dx * sin + dy * cos,
    };
  });
}
