"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { NOTIF_BLUE } from "./bloub/decor";
import { BotEngine, type BotFrame } from "./bloub/engine";
import { defaultCycle } from "./bloub/cycles";
import { RAYON, DEMI_VIEWBOX } from "./bloub/repere";
import { COLOR_BY_ID, DEFAULT_SHAPE, SHAPE_BY_ID, mixHex } from "./bloub/skins";

/**
 * Playback uses `defaultCycle()` from Grokbot-animations as-is
 * (`SEQUENCE` measured durations, ~31s loop). Do not invent a shorter
 * idle/thinking/wink edit until the human style list lands.
 */
const CYCLE = defaultCycle().blocks;
const VB = DEMI_VIEWBOX;
const R = RAYON;
/** Page is `--loop-bg: #000`. Catalog `encre` would vanish; `creme` is in the personalizer palette. */
const INK = COLOR_BY_ID.get("creme")?.hex ?? "#f1efe9";
const PAPER = "#000000";
const SHAPE_RADII = SHAPE_BY_ID.get(DEFAULT_SHAPE)?.radii ?? null;

type GrokBotMarkProps = {
  reduced: boolean;
};

export function GrokBotMark({ reduced }: GrokBotMarkProps) {
  const reactId = useId().replace(/:/g, "");
  const maskId = `loop-bot-mask-${reactId}`;
  const [engine] = useState(() => new BotEngine(R, "idle", SHAPE_RADII, null));
  const stillFrame = useMemo(() => {
    const still = new BotEngine(R, "idle", SHAPE_RADII, null);
    return still.sample(0);
  }, []);
  const [liveFrame, setLiveFrame] = useState<BotFrame>(() => engine.sample(0));

  useEffect(() => {
    if (reduced) {
      return;
    }

    engine.reset("idle", 0);
    let raf = 0;
    let last = 0;
    let clock = 0;
    let nextAt = CYCLE[0]?.duration ?? Infinity;
    let blockIndex = 0;

    const apply = (i: number, from = 0) => {
      const block = CYCLE[i];
      if (!block) {
        nextAt = Infinity;
        return;
      }
      const blockStart = clock - from;
      engine.setState(block.state, clock);
      blockIndex = i;
      nextAt = blockStart + block.duration;
    };

    apply(0, 0);

    const tick = (ms: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min((ms - last) / 1000, 0.064) : 0;
      last = ms;
      clock += dt;
      if (clock >= nextAt && CYCLE.length) {
        apply((blockIndex + 1) % CYCLE.length);
      }
      setLiveFrame(engine.sample(clock));
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engine, reduced]);

  const frame = reduced ? stillFrame : liveFrame;

  const dots = frame.dots.map((dot, i) => {
    const fill =
      dot.color ?? (dot.depth === undefined ? INK : mixHex(PAPER, INK, dot.depth));
    const opacity = dot.opacity;
    if (dot.d) {
      return (
        <path
          key={i}
          d={dot.d}
          fill={fill}
          opacity={opacity}
          transform={`translate(${dot.x} ${dot.y}) rotate(${dot.rot ?? 0}) scale(${R})`}
        />
      );
    }
    return (
      <circle
        key={i}
        cx={dot.x}
        cy={dot.y}
        r={dot.r}
        fill={fill}
        opacity={opacity}
      />
    );
  });

  return (
    <svg
      className="meetup-loop-viz__mark"
      viewBox={`${-VB} ${-VB} ${VB * 2} ${VB * 2}`}
      role="img"
      aria-label="Grok Bot"
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={-VB}
          y={-VB}
          width={VB * 2}
          height={VB * 2}
        >
          <path d={frame.bodyPath} fill="#fff" />
          {frame.eyes.map((eye, i) => (
            <path
              key={i}
              d={eye.d}
              transform={eye.matrix}
              opacity={eye.alpha}
              fill="#000"
            />
          ))}
          {frame.notch ? (
            <circle
              cx={frame.notch.x}
              cy={frame.notch.y}
              r={frame.notch.r}
              fill="#000"
            />
          ) : null}
        </mask>
        {frame.arcs.map((arc) => (
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
                offset={i / Math.max(1, arc.grad.stops.length - 1)}
                stopColor={color}
              />
            ))}
          </linearGradient>
        ))}
      </defs>

      <g fill="none" strokeLinecap="round">
        {frame.arcs.map((arc) => (
          <path
            key={`b${arc.id}`}
            d={arc.back}
            stroke={`url(#${reactId}-${arc.id})`}
            strokeWidth={arc.width}
            opacity={arc.opacity}
          />
        ))}
      </g>

      {frame.dotsBehind ? <g>{dots}</g> : null}

      <g opacity={frame.bodyAlpha}>
        <path d={frame.bodyPath} fill={PAPER} />
        <g mask={`url(#${maskId})`}>
          <rect x={-VB} y={-VB} width={VB * 2} height={VB * 2} fill={INK} />
        </g>
      </g>

      {frame.dotsBehind ? null : <g>{dots}</g>}

      {frame.notif ? (
        <circle
          cx={frame.notif.x}
          cy={frame.notif.y}
          r={frame.notif.r}
          fill={NOTIF_BLUE}
        />
      ) : null}

      <g fill="none" strokeLinecap="round">
        {frame.arcs.map((arc) => (
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
