"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  initController,
  snapToCompleted,
  tickController,
  type ControllerState,
} from "./animation-controller";
import { layoutStage, renderFrame, setupCanvas } from "./canvas-renderer";
import { generateMotionPaths } from "./motion-paths";
import { partitionGrid } from "./partitioner";
import { createTextMask } from "./text-mask";
import {
  DEFAULT_TETRIS_SETTINGS,
  type PixelPiece,
  type TetrisPixelSettings,
  type TetrisPixelTextProps,
} from "./types";
import { cn, usePrefersReducedMotion } from "../shared";

function mergeSettings(props: TetrisPixelTextProps): TetrisPixelSettings {
  const merged: TetrisPixelSettings = { ...DEFAULT_TETRIS_SETTINGS };
  for (const key of Object.keys(DEFAULT_TETRIS_SETTINGS) as Array<keyof TetrisPixelSettings>) {
    const value = props[key as keyof TetrisPixelTextProps];
    if (value !== undefined) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }
  return merged;
}

function settingsFingerprint(s: TetrisPixelSettings, text: string): string {
  return [
    text,
    s.line2,
    s.fontVariant,
    s.fontSize,
    s.letterSpacing,
    s.lineHeight,
    s.textAlign,
    s.cellSize,
    s.gridPadding,
    s.pieceSizePreference,
    s.tetrominoFrequency,
    s.triominoFrequency,
    s.shapeVariety,
    s.edgeDetail,
    s.layoutSeed,
    s.motionSeed,
    s.fallDuration,
    s.stagger,
    s.staggerRandomness,
    s.horizontalMovement,
    s.horizontalCorrections,
    s.rotationAmount,
    s.maxQuarterTurns,
    s.spawnHeightMin,
    s.spawnHeightMax,
    s.pieceSpacing,
    s.landingDensity,
    s.colorMode,
    s.color,
    s.background,
    s.phase,
  ].join("|");
}

export function TetrisPixelText(props: TetrisPixelTextProps) {
  const {
    text,
    playKey = 0,
    compact = false,
    className,
  } = props;

  const settings = mergeSettings(props);
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ControllerState | null>(null);
  const piecesRef = useRef<PixelPiece[]>([]);
  const gridRef = useRef({ width: 1, height: 1 });
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);
  const settingsRef = useRef(settings);

  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    settingsRef.current = settings;
  });

  const fingerprint = settingsFingerprint(settings, text);

  const rebuild = useEffectEvent(async (cssWidth: number, cssHeight: number) => {
    const s = settingsRef.current;
    const mask = await createTextMask({
      text,
      line2: s.line2,
      fontVariant: s.fontVariant,
      fontSize: s.fontSize,
      letterSpacing: s.letterSpacing,
      lineHeight: s.lineHeight,
      textAlign: s.textAlign,
      cellSize: s.cellSize,
      stageWidth: cssWidth,
      stageHeight: cssHeight,
      gridPadding: s.gridPadding,
      edgeDetail: s.edgeDetail,
    });

    setStatusMessage(mask.message);
    gridRef.current = { width: mask.width, height: mask.height };

    const partitioned = partitionGrid({
      grid: mask,
      layoutSeed: s.layoutSeed,
      tetrominoFrequency: s.tetrominoFrequency,
      triominoFrequency: s.triominoFrequency,
      pieceSizePreference: s.pieceSizePreference,
      shapeVariety: s.shapeVariety,
    });

    const withMotion = generateMotionPaths(partitioned, mask.width, mask.height, s);
    piecesRef.current = withMotion;

    const controller = initController(withMotion, mask.width, mask.height, s);
    if (reducedMotion) {
      snapToCompleted(controller, s);
    }
    stateRef.current = controller;
    setReady(true);
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let cancelled = false;
    let renderCtx = setupCanvas(canvas, wrap.clientWidth || 640, wrap.clientHeight || 360);

    const startLoop = () => {
      cancelAnimationFrame(rafRef.current);
      lastTsRef.current = performance.now();

      const frame = (ts: number) => {
        if (cancelled) return;
        const s = settingsRef.current;
        const dt = Math.min(48, ts - lastTsRef.current);
        lastTsRef.current = ts;

        if (document.hidden || s.paused) {
          rafRef.current = requestAnimationFrame(frame);
          return;
        }

        const state = stateRef.current;
        if (state && renderCtx) {
          tickController(state, dt, s);
          layoutStage(renderCtx, state.gridWidth, state.gridHeight, s.cellSize);
          renderFrame(renderCtx, state, s);
        }
        rafRef.current = requestAnimationFrame(frame);
      };

      rafRef.current = requestAnimationFrame(frame);
    };

    const run = async () => {
      const w = wrap.clientWidth || 640;
      const h = wrap.clientHeight || (compact ? 220 : 420);
      renderCtx = setupCanvas(canvas, w, h);
      await rebuild(w, h);
      if (cancelled) return;
      if (renderCtx && stateRef.current) {
        layoutStage(
          renderCtx,
          stateRef.current.gridWidth,
          stateRef.current.gridHeight,
          settingsRef.current.cellSize,
        );
        renderFrame(renderCtx, stateRef.current, settingsRef.current);
      }
      startLoop();
    };

    void run();

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || cancelled) return;
      const { width, height } = entry.contentRect;
      if (width < 8 || height < 8) return;
      renderCtx = setupCanvas(canvas, width, height);
      // Preserve seeds — rebuild mask for new size but keep settings
      void rebuild(width, height).then(() => {
        if (cancelled || !renderCtx || !stateRef.current) return;
        layoutStage(
          renderCtx,
          stateRef.current.gridWidth,
          stateRef.current.gridHeight,
          settingsRef.current.cellSize,
        );
      });
    });
    ro.observe(wrap);

    const onVisibility = () => {
      if (!document.hidden) lastTsRef.current = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fingerprint, playKey, compact, reducedMotion]);

  const accessible = [text, settings.line2].filter(Boolean).join(" ");

  return (
    <div
      ref={wrapRef}
      className={cn("tetris-pixel-text", compact && "tetris-pixel-text--compact", className)}
      style={{
        position: "relative",
        width: "100%",
        height: compact ? 200 : "100%",
        minHeight: compact ? 180 : 320,
        background: settings.background,
        overflow: "hidden",
      }}
      role="img"
      aria-label={accessible}
      data-ready={ready ? "true" : "false"}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
        aria-hidden="true"
      />
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {accessible}
      </span>
      {statusMessage ? (
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            right: 12,
            color: "rgba(255,255,255,0.55)",
            fontSize: 11,
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            pointerEvents: "none",
          }}
        >
          {statusMessage}
        </div>
      ) : null}
    </div>
  );
}

export default TetrisPixelText;
