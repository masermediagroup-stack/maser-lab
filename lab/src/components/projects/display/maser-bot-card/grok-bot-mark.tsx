"use client";

/**
 * Back v1 identity mark (Figma 1:2). 30s catalog curl, then 30s pointer-owned
 * neutre break, then curl again. Front v1 has no animated mark.
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

/** Human-locked periods. Beat splits stay internal — time feel on the preview. */
const CURL_S = 30;
const BREAK_S = 30;
const PERIOD_S = CURL_S + BREAK_S;

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

function makeEngine(): BotEngine {
  const engine = new BotEngine(RAYON, "idle", CAPSULE, NEUTRE);
  engine.setShape(CAPSULE, 0);
  engine.reset("idle", 0);
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

function lookFromPointer(
  svg: SVGSVGElement,
  pointer: MarkLookPointer,
): { yaw: number; pitch: number } | null {
  const rect = svg.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;
  const nx = (pointer.clientX - rect.left) / rect.width;
  const ny = (pointer.clientY - rect.top) / rect.height;
  if (!Number.isFinite(nx) || !Number.isFinite(ny)) return null;
  return {
    yaw: (nx - 0.5) * 36,
    pitch: (0.5 - ny) * 28,
  };
}

/**
 * SVG Grok bot mark. Bloub engine, capsule + bleu.
 * Back-v1 identity loop: ~30s expression curl, then 30s neutre break with pointer gaze.
 * Reduced motion: first frame (neutre capsule), still.
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
    let lastBeatKey = "";
    let lookArmed = false;

    const tick = (ms: number) => {
      raf = window.requestAnimationFrame(tick);
      const dt = last ? Math.min((ms - last) / 1000, 0.064) : 0;
      last = ms;
      clock += dt;
      const cycleT = ((clock % PERIOD_S) + PERIOD_S) % PERIOD_S;
      const inCurl = cycleT < CURL_S;

      if (inCurl) {
        const beatIndex = Math.min(
          CURL_BEATS.length - 1,
          Math.floor((cycleT / CURL_S) * CURL_BEATS.length),
        );
        const beat = CURL_BEATS[beatIndex];
        const beatKey = beat
          ? beat.kind === "state"
            ? `state:${beat.state}`
            : `expr:${beat.expr}`
          : "";
        if (beat && beatKey !== lastBeatKey) {
          applyBeat(engine, beat, clock);
          lastBeatKey = beatKey;
        }
        if (lookArmed) {
          engine.setLook(null, clock);
          lookArmed = false;
        }
      } else {
        if (lastBeatKey !== "break") {
          engine.setState("idle", clock);
          engine.setExpression(NEUTRE, clock);
          lastBeatKey = "break";
        }
        const pointer = lookPointerRef?.current ?? null;
        const svg = svgRef.current;
        if (followLook && pointer?.tracking && svg) {
          const look = lookFromPointer(svg, pointer);
          if (look) {
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
            lookArmed = true;
          }
        } else if (lookArmed) {
          engine.setLook(null, clock);
          lookArmed = false;
        }
      }

      setFrame(engine.sample(clock));
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [engine, followLook, lookPointerRef, reduced]);

  const active = reduced ? FIRST_FRAME : frame;
  const drawn = active.bodyPath ? active : EMPTY_FRAME;
  const vb = DEMI_VIEWBOX;

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={`${-vb} ${-vb} ${vb * 2} ${vb * 2}`}
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
