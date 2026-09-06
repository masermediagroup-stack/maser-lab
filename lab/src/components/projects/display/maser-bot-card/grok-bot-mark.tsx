"use client";

import { useEffect, useId, useState } from "react";
import { blockAt, defaultCycle, offsetOf } from "./grokbot/cycles";
import { NOTIF_BLUE, type DotRender } from "./grokbot/decor";
import { BotEngine, type BotFrame } from "./grokbot/engine";
import { DEMI_VIEWBOX, RAYON } from "./grokbot/repere";
import { COLOR_BY_ID, DEFAULT_COLOR, mixHex } from "./grokbot/skins";

const PAPER = "#242429";
const INK = COLOR_BY_ID.get(DEFAULT_COLOR)?.hex ?? "#0a0a0c";
const CYCLE = defaultCycle().blocks;

function sampleFirstFrame(): BotFrame {
  const engine = new BotEngine(RAYON, "idle");
  const first = CYCLE[0];
  if (first) engine.reset(first.state, 0);
  else engine.reset("idle", 0);
  return engine.sample(0);
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

/**
 * SVG Grok bot mark. Plays the upstream default cycle as-is.
 * Reduced motion: first frame of that cycle, still.
 */
export function GrokBotMark({
  reduced,
  className,
}: {
  reduced: boolean;
  className?: string;
}) {
  const reactId = useId().replace(/:/g, "");
  const maskId = `mbc-bot-mask-${reactId}`;
  const [engine] = useState(() => new BotEngine(RAYON, "idle"));
  const [frame, setFrame] = useState<BotFrame>(FIRST_FRAME);

  useEffect(() => {
    if (reduced || !CYCLE.length) return;

    const first = CYCLE[0];
    if (!first) return;

    engine.reset(first.state, 0);
    let raf = 0;
    let last = 0;
    let clock = 0;
    let lastIndex = 0;

    const tick = (ms: number) => {
      raf = window.requestAnimationFrame(tick);
      const dt = last ? Math.min((ms - last) / 1000, 0.064) : 0;
      last = ms;
      clock += dt;
      const { index } = blockAt(CYCLE, clock);
      if (index !== lastIndex) {
        const block = CYCLE[index];
        if (block) {
          const at = offsetOf(CYCLE, index);
          if (index < lastIndex) engine.reset(block.state, at);
          else engine.setState(block.state, at);
          lastIndex = index;
        }
      }
      setFrame(engine.sample(clock));
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [engine, reduced]);

  const active = reduced ? FIRST_FRAME : frame;
  const drawn = active.bodyPath ? active : EMPTY_FRAME;
  const vb = DEMI_VIEWBOX;

  return (
    <svg
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
