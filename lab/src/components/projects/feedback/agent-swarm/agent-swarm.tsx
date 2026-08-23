"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type PointerEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DEFAULT_PARAMS, VIEW_PADDING } from "./constants";
import { formationBounds, layoutTriangleAnchors } from "./engine/anchors";
import { assignAgentColors, errorTint } from "./engine/colors";
import { clamp, lerp } from "./engine/easing";
import {
  clientToSvgPoint,
  nearestAgent,
  useAgentEngine,
} from "./hooks/use-agent-engine";
import { AgentNode } from "./render/agent-node";
import { DebugOverlay } from "./render/debug-overlay";
import { GlowDefs } from "./render/glow-defs";
import { TrailLayer } from "./render/trail-layer";
import type {
  AgentSwarmParams,
  AgentSwarmProps,
  DebugSnapshot,
} from "./types";
import "./tokens.css";

function useElementSize() {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 480, height: 420 });

  useEffect(() => {
    if (!node) return;
    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize({
        width: Math.max(160, rect.width),
        height: Math.max(160, rect.height),
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return { setRef: setNode, size };
}

export function resolveAgentSwarmParams(props: AgentSwarmProps): AgentSwarmParams {
  const merged: AgentSwarmParams = { ...DEFAULT_PARAMS, ...props.params };
  return {
    ...merged,
    mode: props.mode ?? merged.mode,
    seed: String(props.seed ?? merged.seed),
    nodeCount: props.nodeCount ?? merged.nodeCount,
    speed: props.paused ? 0 : (props.speed ?? merged.speed),
    status:
      props.status ??
      (props.loading === false ? "idle" : props.loading === true ? "loading" : merged.status),
    colorMode: props.colorMode ?? merged.colorMode,
    animation: props.paused ? false : merged.animation,
  };
}

export function AgentSwarm({
  className,
  style,
  "aria-label": ariaLabel,
  reducedMotion: reducedMotionProp,
  onDebug,
  ...props
}: AgentSwarmProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const reducedMotion = reducedMotionProp ?? prefersReduced;
  const params = resolveAgentSwarmParams(props);
  const uid = useId().replace(/:/g, "");
  const { setRef, size } = useElementSize();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [debugSnapshot, setDebugSnapshot] = useState<DebugSnapshot | null>(null);

  const spacing = useMemo(() => {
    const shortest = Math.min(size.width, size.height);
    const t = clamp((shortest - 280) / 420, 0, 1);
    const base = lerp(42, 64, t);
    return {
      horizontal: base * params.horizontalSpacing,
      vertical: base * 0.866 * params.verticalSpacing,
      coreR: lerp(3.7, 5.4, t) * params.nodeSize,
    };
  }, [size.width, size.height, params.horizontalSpacing, params.verticalSpacing, params.nodeSize]);

  const anchors = useMemo(
    () =>
      layoutTriangleAnchors({
        count: params.nodeCount,
        horizontalSpacing: spacing.horizontal,
        verticalSpacing: spacing.vertical,
      }),
    [params.nodeCount, spacing.horizontal, spacing.vertical],
  );

  const colors = useMemo(
    () =>
      assignAgentColors(params.nodeCount, params.seed, params.colorMode, params.customPalette).map(
        (color, index) =>
          params.status === "error" ? errorTint(color, index, 2) : color,
      ),
    [params.nodeCount, params.seed, params.colorMode, params.customPalette, params.status],
  );

  const bloomR = spacing.coreR * 3.4 * params.glowRadius * params.bloomStrength;
  const haloR = spacing.coreR * 9.5 * params.glowRadius * params.glowIntensity;
  const blend = params.background === "transparent" ? "normal" : "plus-lighter";
  const bounds = formationBounds(anchors);
  const pad = Math.max(VIEW_PADDING, haloR * 1.15);
  const viewX = bounds.minX - pad;
  const viewY = bounds.minY - pad;
  const viewW = bounds.maxX - bounds.minX + pad * 2;
  const viewH = bounds.maxY - bounds.minY + pad * 2;

  const handleDebug = useCallback(
    (snapshot: DebugSnapshot) => {
      if (params.debug) setDebugSnapshot(snapshot);
      onDebug?.(snapshot);
    },
    [onDebug, params.debug],
  );

  const engine = useAgentEngine({
    svgRef,
    params,
    anchors,
    reducedMotion,
    restartToken: `${params.seed}:${params.nodeCount}`,
    onDebug: handleDebug,
  });

  const backgroundFill =
    params.background === "transparent"
      ? "none"
      : params.background === "custom"
        ? params.customBackground
        : "#050505";

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (params.interaction === "off") return;
    const svg = svgRef.current;
    if (!svg) return;
    const point = clientToSvgPoint(svg, event.clientX, event.clientY);
    if (!point) return;
    engine.setPointer(point);
  };

  const onPointerLeave = () => {
    engine.clearPointer();
  };

  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (params.interaction === "off") return;
    const svg = svgRef.current;
    if (!svg) return;
    const point = clientToSvgPoint(svg, event.clientX, event.clientY);
    if (!point) return;
    const agentId = nearestAgent(engine.visuals(), point);
    if (agentId === null) return;
    if (params.interaction === "tap-swap") {
      engine.setTap(agentId);
    }
  };

  const interactive = params.interaction !== "off";
  const live =
    reducedMotion
      ? "Agent swarm, reduced motion pulse"
      : params.status === "error"
        ? "Agent swarm, coordination halted"
        : params.status === "success"
          ? "Agent swarm, resolved"
          : params.animation && params.speed > 0
            ? "Agent swarm, coordinating"
            : "Agent swarm, paused";

  return (
    <div
      ref={setRef}
      className={cn("agent-swarm", className)}
      style={style}
      data-background={params.background}
    >
      <svg
        ref={svgRef}
        className="agent-swarm__canvas"
        viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`}
        role="img"
        aria-label={ariaLabel ?? "Agent swarm visualization"}
        aria-busy={params.status === "loading" && params.animation && !reducedMotion}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        style={{ touchAction: interactive ? "none" : "auto" }}
      >
        {backgroundFill !== "none" ? (
          <rect x={viewX} y={viewY} width={viewW} height={viewH} fill={backgroundFill} />
        ) : null}
        <GlowDefs uid={uid} colors={colors} colorMode={params.colorMode} />
        <TrailLayer agentCount={params.nodeCount} colors={colors} coreR={spacing.coreR} />
        {anchors.map((anchor, index) => (
          <AgentNode
            key={index}
            id={index}
            x={anchor.x}
            y={anchor.y}
            color={colors[index] ?? "#ffffff"}
            coreR={spacing.coreR}
            bloomR={bloomR}
            haloR={haloR}
            uid={uid}
            blend={blend}
            coreBrightness={params.coreBrightness}
          />
        ))}
        {params.debug ? (
          <DebugOverlay
            anchors={anchors}
            snapshot={debugSnapshot}
            occupancy={debugSnapshot?.occupancy ?? anchors.map((_, i) => i)}
          />
        ) : null}
      </svg>
      <p className="agent-swarm__live" aria-live="polite">
        {live}
      </p>
    </div>
  );
}
