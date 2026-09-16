"use client";

/**
 * Back v1 identity mark (Figma 1:2). One catalog curl per page load, then
 * pointer gaze until refresh. Do not replay the curl. Front v1 has no mark.
 */
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { NOTIF_BLUE, type DotRender } from "./grokbot/decor";
import { BotEngine, type BotFrame } from "./grokbot/engine";
import {
  EXPRESSION_BY_ID,
  type ExpressionId,
} from "./grokbot/expressions";
import { DEMI_VIEWBOX, RAYON } from "./grokbot/repere";
import { COLOR_BY_ID, SHAPE_BY_ID, mixHex } from "./grokbot/skins";
import type { StateId } from "./grokbot/states";

const PAPER = "#000000";
const INK = COLOR_BY_ID.get("bleu")?.hex ?? "#3b93f0";
const CAPSULE = SHAPE_BY_ID.get("capsule")?.radii ?? null;
const NEUTRE = EXPRESSION_BY_ID.get("neutre") ?? null;

/** One catalog pass, then stop. Beat splits stay internal. */
const CURL_S = 30;

/** Pointer look stays inside the capsule: full eye inset, never clipped. */
const MAX_LOOK_YAW = 8;
const MAX_LOOK_PITCH = 5.5;

type CurlBeat =
  | { kind: "expr"; expr: ExpressionId; state: "idle" }
  | { kind: "state"; state: StateId };

const CURL_BEATS: CurlBeat[] = [
  { kind: "expr", expr: "neutre", state: "idle" },
  { kind: "expr", expr: "attentif", state: "idle" },
  { kind: "expr", expr: "curieux", state: "idle" },
  { kind: "expr", expr: "mefiant", state: "idle" },
  { kind: "state", state: "thinking" },
  { kind: "expr", expr: "fier", state: "idle" },
  { kind: "expr", expr: "neutre", state: "idle" },
];

export type MarkLookPointer = {
  clientX: number;
  clientY: number;
  tracking: boolean;
};

/** Figma Back v1 mark box. Scale as n / 1299 of the card face. */
export const MARK_SLOT = { x: 100, y: 142, w: 272, h: 162, art: 1299 };
/** Rest capsule bounds (~208×124) match the 272×162 Figma slot aspect. */
export const MARK_VB = { x: -104, y: -62, w: 208, h: 124 };

export type MarkTickState = {
  lastBeatKey: string;
  lookArmed: boolean;
  curling: boolean;
};

export function createMarkTickState(): MarkTickState {
  return { lastBeatKey: "", lookArmed: false, curling: true };
}

export function plantMark(engine: BotEngine, now = 0) {
  engine.setShape(CAPSULE, now);
  engine.reset("idle", now);
  engine.setExpression(NEUTRE, now);
  engine.setLook(null, now);
}

export function makeEngine(): BotEngine {
  const engine = new BotEngine(RAYON, "idle", CAPSULE, NEUTRE);
  plantMark(engine, 0);
  return engine;
}

function sampleFirstFrame(): BotFrame {
  return makeEngine().sample(0);
}

const FIRST_FRAME = sampleFirstFrame();
const EMPTY_FRAME: BotFrame = {
  bodyPath: "",
  bodyAlpha: 1,
  eyes: [],
  dots: [],
  dotsBehind: false,
  arcs: [],
  notif: null,
  notch: null,
};

function GrokBotDot({
  dot,
  paper,
}: {
  dot: DotRender;
  paper: string;
}) {
  const fill =
    dot.color ?? (dot.depth === undefined ? INK : mixHex(paper, INK, dot.depth));
  if (dot.d) {
    return (
      <path
        d={dot.d}
        fill={fill}
        opacity={dot.opacity}
        transform={`translate(${dot.x} ${dot.y}) rotate(${dot.rot ?? 0}) scale(${RAYON})`}
      />
    );
  }
  return <circle cx={dot.x} cy={dot.y} r={dot.r} fill={fill} opacity={dot.opacity} />;
}

function applyBeat(engine: BotEngine, beat: CurlBeat, now: number) {
  if (beat.kind === "state") {
    engine.setState(beat.state, now);
    engine.setExpression(NEUTRE, now);
    return;
  }
  engine.setState(beat.state, now);
  engine.setExpression(EXPRESSION_BY_ID.get(beat.expr) ?? NEUTRE, now);
}

function clampLook(nx: number, ny: number): { yaw: number; pitch: number } | null {
  if (!Number.isFinite(nx) || !Number.isFinite(ny)) return null;
  let yaw = (nx - 0.5) * 2 * MAX_LOOK_YAW;
  let pitch = (0.5 - ny) * 2 * MAX_LOOK_PITCH;
  const mag = Math.hypot(yaw / MAX_LOOK_YAW, pitch / MAX_LOOK_PITCH);
  if (mag > 1) {
    yaw /= mag;
    pitch /= mag;
  }
  return { yaw, pitch };
}

function lookFromPointer(
  svg: SVGSVGElement,
  pointer: MarkLookPointer,
): { yaw: number; pitch: number } | null {
  const rect = svg.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;
  const nx = (pointer.clientX - rect.left) / rect.width;
  const ny = (pointer.clientY - rect.top) / rect.height;
  return clampLook(nx, ny);
}

/** Gaze from a point on the card face (0–1), mapped through the Figma mark box. */
export function lookFromCardFace(
  pointer: MarkLookPointer,
  face: DOMRect,
): { yaw: number; pitch: number } | null {
  if (face.width < 1 || face.height < 1) return null;
  const nx = (pointer.clientX - face.left) / face.width;
  const ny = (pointer.clientY - face.top) / face.height;
  if (!Number.isFinite(nx) || !Number.isFinite(ny)) return null;
  const slotX = (nx * MARK_SLOT.art - MARK_SLOT.x) / MARK_SLOT.w;
  const slotY = (ny * MARK_SLOT.art - MARK_SLOT.y) / MARK_SLOT.h;
  return clampLook(slotX, slotY);
}

export function tickBotMark(
  engine: BotEngine,
  clock: number,
  state: MarkTickState,
  followLook: boolean,
  look: { yaw: number; pitch: number } | null,
): BotFrame {
  if (clock < CURL_S) {
    const beatIndex = Math.min(
      CURL_BEATS.length - 1,
      Math.floor((clock / CURL_S) * CURL_BEATS.length),
    );
    const beat = CURL_BEATS[beatIndex];
    const beatKey = beat
      ? beat.kind === "state"
        ? `state:${beat.state}`
        : `expr:${beat.expr}`
      : "";
    if (beat && beatKey !== state.lastBeatKey) {
      applyBeat(engine, beat, clock);
      state.lastBeatKey = beatKey;
    }
    if (state.lookArmed) {
      engine.setLook(null, clock);
      state.lookArmed = false;
    }
  } else {
    if (state.curling) {
      const lastBeat = CURL_BEATS[CURL_BEATS.length - 1];
      if (lastBeat) applyBeat(engine, lastBeat, clock);
      state.curling = false;
    }
    if (followLook && look) {
      engine.setLook(
        {
          yaw: look.yaw,
          pitch: look.pitch,
          mix: 1,
          spin: 0,
          wander: 0,
        },
        clock,
      );
      state.lookArmed = true;
    } else if (state.lookArmed) {
      engine.setLook(null, clock);
      state.lookArmed = false;
    }
  }
  return engine.sample(clock);
}

function parseSvgMatrix(
  value: string,
): [number, number, number, number, number, number] | null {
  const match = /matrix\(\s*([^)]+)\)/.exec(value);
  if (!match?.[1]) return null;
  const parts = match[1]
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (parts.length !== 6 || parts.some((n) => !Number.isFinite(n))) return null;
  return [parts[0]!, parts[1]!, parts[2]!, parts[3]!, parts[4]!, parts[5]!];
}

function paintDot(
  ctx: CanvasRenderingContext2D,
  dot: DotRender,
  paper: string,
) {
  const fill =
    dot.color ?? (dot.depth === undefined ? INK : mixHex(paper, INK, dot.depth));
  ctx.save();
  ctx.globalAlpha *= dot.opacity;
  ctx.fillStyle = fill;
  if (dot.d) {
    ctx.translate(dot.x, dot.y);
    ctx.rotate(((dot.rot ?? 0) * Math.PI) / 180);
    ctx.scale(RAYON, RAYON);
    ctx.fill(new Path2D(dot.d));
  } else {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Paint the live mark onto a canvas that sits on the cuboid back face.
 * Paper holes stay transparent so the card fill shows through.
 */
export function paintBotFrame(
  ctx: CanvasRenderingContext2D,
  frame: BotFrame,
  width: number,
  height: number,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const drawn = frame.bodyPath ? frame : EMPTY_FRAME;
  if (!drawn.bodyPath) return;

  const sx = width / MARK_VB.w;
  const sy = height / MARK_VB.h;
  ctx.setTransform(sx, 0, 0, sy, -MARK_VB.x * sx, -MARK_VB.y * sy);

  const paintArcs = (which: "back" | "front") => {
    for (const arc of drawn.arcs) {
      const grad = ctx.createLinearGradient(
        arc.grad.x1,
        arc.grad.y1,
        arc.grad.x2,
        arc.grad.y2,
      );
      const stops = arc.grad.stops;
      stops.forEach((color, i) => {
        grad.addColorStop(
          stops.length > 1 ? i / (stops.length - 1) : 0,
          color,
        );
      });
      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = arc.width;
      ctx.lineCap = "round";
      ctx.globalAlpha *= arc.opacity;
      ctx.stroke(new Path2D(which === "back" ? arc.back : arc.front));
      ctx.restore();
    }
  };

  paintArcs("back");
  if (drawn.dotsBehind) {
    drawn.dots.forEach((dot) => paintDot(ctx, dot, PAPER));
  }

  ctx.save();
  ctx.globalAlpha *= drawn.bodyAlpha;
  ctx.fillStyle = INK;
  ctx.fill(new Path2D(drawn.bodyPath));
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "#000";
  for (const eye of drawn.eyes) {
    const matrix = parseSvgMatrix(eye.matrix);
    ctx.save();
    ctx.globalAlpha *= eye.alpha;
    if (matrix) {
      const [a, b, c, d, e, f] = matrix;
      ctx.transform(a, b, c, d, e, f);
    }
    ctx.fill(new Path2D(eye.d));
    ctx.restore();
  }
  if (drawn.notch) {
    ctx.beginPath();
    ctx.arc(drawn.notch.x, drawn.notch.y, drawn.notch.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  if (!drawn.dotsBehind) {
    drawn.dots.forEach((dot) => paintDot(ctx, dot, PAPER));
  }
  if (drawn.notif) {
    ctx.fillStyle = NOTIF_BLUE;
    ctx.beginPath();
    ctx.arc(drawn.notif.x, drawn.notif.y, drawn.notif.r, 0, Math.PI * 2);
    ctx.fill();
  }
  paintArcs("front");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/**
 * SVG Grok bot mark. Bloub engine, capsule + bleu.
 * One curl per load, then pointer gaze (clamped inside the capsule).
 * Reduced motion: planted neutre, still.
 */
export function GrokBotMark({
  reduced,
  className,
  lookPointerRef,
  followLook = false,
}: {
  reduced: boolean;
  className?: string;
  lookPointerRef?: RefObject<MarkLookPointer | null>;
  followLook?: boolean;
}) {
  const reactId = useId().replace(/:/g, "");
  const maskId = `mbc-bot-mask-${reactId}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const [engine] = useState(() => makeEngine());
  const [frame, setFrame] = useState<BotFrame>(FIRST_FRAME);

  useEffect(() => {
    if (reduced) {
      engine.setShape(CAPSULE, 0);
      engine.reset("idle", 0);
      engine.setExpression(NEUTRE, 0);
      engine.setLook(null, 0);
      return;
    }

    engine.setShape(CAPSULE, 0);
    engine.reset("idle", 0);
    engine.setExpression(NEUTRE, 0);
    engine.setLook(null, 0);

    let raf = 0;
    let last = 0;
    let clock = 0;

    const tickState = createMarkTickState();

    const tick = (ms: number) => {
      raf = window.requestAnimationFrame(tick);
      const dt = last ? Math.min((ms - last) / 1000, 0.064) : 0;
      last = ms;
      clock += dt;
      const pointer = lookPointerRef?.current ?? null;
      const svg = svgRef.current;
      const look =
        followLook && pointer?.tracking && svg
          ? lookFromPointer(svg, pointer)
          : null;
      setFrame(tickBotMark(engine, clock, tickState, followLook, look));
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [engine, followLook, lookPointerRef, reduced]);

  const active = reduced ? FIRST_FRAME : frame;
  const drawn = active.bodyPath ? active : EMPTY_FRAME;
  const vb = DEMI_VIEWBOX;
  /** Rest capsule bounds (~208×124) match the 272×162 Figma slot aspect. */
  const slotVb = MARK_VB;

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={`${slotVb.x} ${slotVb.y} ${slotVb.w} ${slotVb.h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Maser bot mark"
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={-vb}
          y={-vb}
          width={vb * 2}
          height={vb * 2}
        >
          <path d={drawn.bodyPath} fill="#fff" />
          {drawn.eyes.map((eye, i) => (
            <path
              key={i}
              d={eye.d}
              transform={eye.matrix}
              opacity={eye.alpha}
              fill="#000"
            />
          ))}
          {drawn.notch ? (
            <circle
              cx={drawn.notch.x}
              cy={drawn.notch.y}
              r={drawn.notch.r}
              fill="#000"
            />
          ) : null}
        </mask>
        {drawn.arcs.map((arc) => (
          <linearGradient
            key={arc.id}
            id={`${reactId}-${arc.id}`}
            gradientUnits="userSpaceOnUse"
            x1={arc.grad.x1}
            y1={arc.grad.y1}
            x2={arc.grad.x2}
            y2={arc.grad.y2}
          >
            {arc.grad.stops.map((color, i) => (
              <stop
                key={i}
                offset={
                  arc.grad.stops.length > 1
                    ? i / (arc.grad.stops.length - 1)
                    : 0
                }
                stopColor={color}
              />
            ))}
          </linearGradient>
        ))}
      </defs>

      <g fill="none" strokeLinecap="round">
        {drawn.arcs.map((arc) => (
          <path
            key={`b${arc.id}`}
            d={arc.back}
            stroke={`url(#${reactId}-${arc.id})`}
            strokeWidth={arc.width}
            opacity={arc.opacity}
          />
        ))}
      </g>

      {drawn.dotsBehind
        ? drawn.dots.map((dot, i) => (
            <GrokBotDot key={`pb${i}`} dot={dot} paper={PAPER} />
          ))
        : null}

      <g opacity={drawn.bodyAlpha}>
        <path d={drawn.bodyPath} fill={PAPER} />
        <g mask={`url(#${maskId})`}>
          <rect x={-vb} y={-vb} width={vb * 2} height={vb * 2} fill={INK} />
        </g>
      </g>

      {!drawn.dotsBehind
        ? drawn.dots.map((dot, i) => (
            <GrokBotDot key={`pf${i}`} dot={dot} paper={PAPER} />
          ))
        : null}

      {drawn.notif ? (
        <circle
          cx={drawn.notif.x}
          cy={drawn.notif.y}
          r={drawn.notif.r}
          fill={NOTIF_BLUE}
        />
      ) : null}

      <g fill="none" strokeLinecap="round">
        {drawn.arcs.map((arc) => (
          <path
            key={`f${arc.id}`}
            d={arc.front}
            stroke={`url(#${reactId}-${arc.id})`}
            strokeWidth={arc.width}
            opacity={arc.opacity}
          />
        ))}
      </g>
    </svg>
  );
}
