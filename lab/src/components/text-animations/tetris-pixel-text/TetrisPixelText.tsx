"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  initController,
  snapToCompleted,
  tickController,
  type ControllerState,
} from "./animation-controller";
import {
  layoutStage,
  renderFrame,
  setupCanvas,
  type DebugRenderInfo,
} from "./canvas-renderer";
import { generateMotionPaths } from "./motion-paths";
import { partitionGrid, validatePartition, type PartitionValidation } from "./partitioner";
import { createTextMask, maskCacheKey } from "./text-mask";
import { normalizeTimeline } from "./timeline";
import {
  DEFAULT_TETRIS_SETTINGS,
  type MaskStats,
  type OccupancyGrid,
  type PixelPiece,
  type TetrisPixelSettings,
  type TetrisPixelTextProps,
  type TimelineSummary,
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

/** Keys that require remask + repartition. */
function layoutFingerprint(s: TetrisPixelSettings, text: string, w: number, h: number): string {
  return maskCacheKey({
    text,
    line2: s.line2,
    fontVariant: s.fontVariant,
    customFontFamily: s.customFontFamily,
    customFontUrl: s.customFontUrl,
    fontSize: s.fontSize,
    letterSpacing: s.letterSpacing,
    lineHeight: s.lineHeight,
    textAlign: s.textAlign,
    textDensity: s.textDensity,
    renderQuality: s.renderQuality,
    edgeDetailLevel: s.edgeDetailLevel,
    cellSize: s.cellSize,
    coverageThreshold: s.coverageThreshold,
    gridPadding: s.gridPadding,
    stageWidth: w,
    stageHeight: h,
    layoutSeed: s.layoutSeed,
    pieceScale: s.pieceScale,
  });
}

/** Motion-only keys (no remask). */
function motionFingerprint(s: TetrisPixelSettings): string {
  return [
    s.motionSeed,
    s.animationDuration,
    s.concurrency,
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
    s.landingDelay,
    s.spawnSafetyMargin,
    s.glowDuration,
    s.finalHoldDuration,
    s.phase,
  ].join("|");
}

type CacheBundle = {
  layoutKey: string;
  mask: OccupancyGrid & { renderCellPx: number; logicalCellPx: number; fontSize: number };
  partitioned: PixelPiece[];
  validation: PartitionValidation;
};

export function TetrisPixelText(props: TetrisPixelTextProps) {
  const {
    text,
    playKey = 0,
    compact = false,
    className,
    onTimelineReady,
    onMaskStats,
    onFontError,
    onFontLoading,
  } = props;

  const settings = mergeSettings(props);
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ControllerState | null>(null);
  const piecesRef = useRef<PixelPiece[]>([]);
  const maskRef = useRef<OccupancyGrid | null>(null);
  const renderCellRef = useRef(4);
  const validationRef = useRef<PartitionValidation | null>(null);
  const cacheRef = useRef<CacheBundle | null>(null);
  const lastWorkingFontRef = useRef<string | null>(null);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);
  const settingsRef = useRef(settings);

  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [fontLoading, setFontLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [timelineSummary, setTimelineSummary] = useState<TimelineSummary | null>(null);
  const [maskStats, setMaskStats] = useState<MaskStats | null>(null);

  useEffect(() => {
    settingsRef.current = settings;
  });

  const rebuild = useEffectEvent(async (cssWidth: number, cssHeight: number) => {
    const s = settingsRef.current;
    const layoutKey = layoutFingerprint(s, text, cssWidth, cssHeight);
    onFontLoading?.(true);
    setFontLoading(true);

    let mask: CacheBundle["mask"];
    let partitioned: PixelPiece[];
    let validation: PartitionValidation;

    const cached = cacheRef.current;
    if (cached && cached.layoutKey === layoutKey) {
      mask = cached.mask;
      partitioned = cached.partitioned.map((p) => ({ ...p }));
      validation = cached.validation;
    } else {
      const generated = await createTextMask({
        text,
        line2: s.line2,
        fontVariant: s.fontVariant,
        customFontFamily: s.customFontFamily,
        customFontUrl: s.customFontUrl,
        customFontWeight: s.customFontWeight,
        customFontStyle: s.customFontStyle,
        fontSize: s.fontSize,
        letterSpacing: s.letterSpacing,
        lineHeight: s.lineHeight,
        textAlign: s.textAlign,
        textDensity: s.textDensity,
        renderQuality: s.renderQuality,
        edgeDetailLevel: s.edgeDetailLevel,
        cellSize: s.cellSize,
        stageWidth: cssWidth,
        stageHeight: cssHeight,
        gridPadding: s.gridPadding,
        edgeDetail: s.edgeDetail,
        coverageThreshold: s.coverageThreshold,
        targetWidthRatio: cssWidth < 520 ? 0.9 : 0.84,
      });

      if (!generated.fontReady) {
        onFontError?.(generated.fontError ?? "Font failed to load");
        setStatusMessage(generated.fontError ?? generated.message);
        // Keep last working layout if we have one
        if (cacheRef.current) {
          mask = cacheRef.current.mask;
          partitioned = cacheRef.current.partitioned.map((p) => ({ ...p }));
          validation = cacheRef.current.validation;
        } else {
          onFontLoading?.(false);
          setFontLoading(false);
          setReady(true);
          return;
        }
      } else {
        lastWorkingFontRef.current = generated.fontFamily;
        mask = {
          width: generated.width,
          height: generated.height,
          cells: generated.cells,
          occupied: generated.occupied,
          coverage: generated.coverage,
          logicalCellPx: generated.logicalCellPx,
          renderCellPx: generated.renderCellPx,
          fontSize: generated.fontSize,
        };
        partitioned = partitionGrid({
          grid: mask,
          layoutSeed: s.layoutSeed,
          tetrominoFrequency: s.tetrominoFrequency,
          triominoFrequency: s.triominoFrequency,
          pieceSizePreference: s.pieceSizePreference,
          shapeVariety: s.shapeVariety,
          pieceScale: s.pieceScale,
        });
        validation = validatePartition(mask.cells, partitioned);
        cacheRef.current = { layoutKey, mask, partitioned, validation };
        setStatusMessage(generated.message);
      }
    }

    onFontLoading?.(false);
    setFontLoading(false);

    maskRef.current = mask;
    validationRef.current = validation;
    renderCellRef.current = mask.renderCellPx;

    const withMotion = generateMotionPaths(partitioned, mask.width, mask.height, {
      ...s,
      cellSize: mask.renderCellPx,
      stageCssHeight: cssHeight,
    });

    const { pieces: timed, summary } = normalizeTimeline({
      pieces: withMotion,
      settings: s,
    });

    piecesRef.current = timed;
    setTimelineSummary(summary);
    onTimelineReady?.(summary);

    const stats: MaskStats = {
      gridWidth: mask.width,
      gridHeight: mask.height,
      targetCells: mask.occupied.length,
      pieceCount: timed.length,
      logicalCellPx: Math.round(mask.logicalCellPx * 100) / 100,
      renderCellPx: mask.renderCellPx,
      fontSizeUsed: mask.fontSize,
    };
    setMaskStats(stats);
    onMaskStats?.(stats);

    const controller = initController(timed, mask.width, mask.height, s);
    if (reducedMotion) {
      snapToCompleted(controller, { ...s, cellSize: mask.renderCellPx });
    }
    stateRef.current = controller;
    setReady(true);
  });

  // Color-only updates should not remask — fingerprint excludes color for rebuild.
  const rebuildFingerprint = `${layoutFingerprint(settings, text, 0, 0)}|${motionFingerprint(settings)}|${playKey}`;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let cancelled = false;
    let renderCtx = setupCanvas(canvas, wrap.clientWidth || 640, wrap.clientHeight || 360);

    const debugPayload = (): DebugRenderInfo | null => {
      if (!settingsRef.current.debugOverlay) return null;
      if (!maskRef.current || !validationRef.current) return null;
      return { mask: maskRef.current, validation: validationRef.current };
    };

    const startLoop = () => {
      cancelAnimationFrame(rafRef.current);
      lastTsRef.current = performance.now();

      const frame = (ts: number) => {
        if (cancelled) return;
        const s = settingsRef.current;
        const dt = Math.min(48, ts - lastTsRef.current);
        lastTsRef.current = ts;

        if (document.hidden) {
          rafRef.current = requestAnimationFrame(frame);
          return;
        }

        const state = stateRef.current;
        if (state && renderCtx) {
          if (!s.paused) {
            tickController(state, dt, s);
          }
          layoutStage(
            renderCtx,
            state.gridWidth,
            state.gridHeight,
            renderCellRef.current,
          );
          renderFrame(
            renderCtx,
            state,
            { ...s, cellSize: renderCellRef.current },
            debugPayload(),
          );
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
          renderCellRef.current,
        );
        renderFrame(
          renderCtx,
          stateRef.current,
          { ...settingsRef.current, cellSize: renderCellRef.current },
          debugPayload(),
        );
      }
      startLoop();
    };

    void run();

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || cancelled) return;
      const { width, height } = entry.contentRect;
      if (width < 8 || height < 8) return;
      // Invalidate layout cache on meaningful resize
      cacheRef.current = null;
      renderCtx = setupCanvas(canvas, width, height);
      void rebuild(width, height).then(() => {
        if (cancelled || !renderCtx || !stateRef.current) return;
        layoutStage(
          renderCtx,
          stateRef.current.gridWidth,
          stateRef.current.gridHeight,
          renderCellRef.current,
        );
        renderFrame(
          renderCtx,
          stateRef.current,
          { ...settingsRef.current, cellSize: renderCellRef.current },
          debugPayload(),
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
    // Color-only changes apply live via settingsRef in the render loop (no remask).
  }, [rebuildFingerprint, compact, reducedMotion]);

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
      data-font-loading={fontLoading ? "true" : "false"}
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
      {fontLoading ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "rgba(255,255,255,0.55)",
            fontSize: 12,
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            pointerEvents: "none",
            background: "rgba(0,0,0,0.25)",
          }}
        >
          Loading font &amp; rebuilding mask…
        </div>
      ) : null}
      {statusMessage || maskStats || timelineSummary ? (
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
            lineHeight: 1.35,
          }}
        >
          {statusMessage ? <div>{statusMessage}</div> : null}
          {maskStats ? (
            <div>
              Grid {maskStats.gridWidth}×{maskStats.gridHeight} · {maskStats.targetCells} cells ·{" "}
              {maskStats.pieceCount} pieces · cell {maskStats.renderCellPx}px
            </div>
          ) : null}
          {timelineSummary ? (
            <div>
              Requested {timelineSummary.requestedDuration.toFixed(1)}s · Calculated{" "}
              {timelineSummary.calculatedDuration.toFixed(1)}s · Peak concurrent{" "}
              {timelineSummary.peakConcurrent}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default TetrisPixelText;
