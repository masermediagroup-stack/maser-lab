"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DemoBackButton,
  DemoControlMenu,
  LabButton,
  LabControlGroup,
  LabRange,
  LabSelect,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import {
  CEPHLO_DEFAULT_HEADLINE,
  CEPHLO_DEFAULT_UP_NEXT,
  cephloPlexCondensed,
} from "./fonts";
import { CephloHackFwWallpaper, exportCephloHackFwWallpaperLoop } from "./cephlo-hack-fw";
import {
  CEPHLO_WALLPAPER_FPS,
  clampLoopSeconds,
  DEFAULT_LOOP_SECONDS,
  LOOP_DURATION_OPTIONS,
  LOOP_MAX_SECONDS,
} from "./loop";
import { containScale, coverScale } from "./fit-stage";
import { DEFAULT_SILK_LOOK, SILK_LOOK_RANGES, type SilkLook } from "./silk-look";
import { runCephloTypeLock } from "./type-lock";
import "./tokens.css";

const FPS = CEPHLO_WALLPAPER_FPS;

const labTextFieldClassName =
  "lab-type-label min-h-11 w-full rounded-[6px] border border-[var(--lab-border)] bg-[var(--lab-surface)] px-[12px] text-[var(--lab-text-primary)]";

function formatSeconds(value: number) {
  return `${value.toFixed(2)}s`;
}

const LOOP_OPTIONS = LOOP_DURATION_OPTIONS.map((option) => ({ ...option }));

export function CephloHackFwDemo() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [time, setTime] = useState(0);
  const [scrubTime, setScrubTime] = useState(0);
  const [isPresentation, setIsPresentation] = useState(false);
  const [loopSeconds, setLoopSeconds] = useState(DEFAULT_LOOP_SECONDS);
  const [resetNonce, setResetNonce] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportNote, setExportNote] = useState<string>("");
  const [headlineText, setHeadlineText] = useState(CEPHLO_DEFAULT_HEADLINE);
  const [upNextText, setUpNextText] = useState(CEPHLO_DEFAULT_UP_NEXT);
  const [silkLook, setSilkLook] = useState<SilkLook>(DEFAULT_SILK_LOOK);

  const patchSilk = (partial: Partial<SilkLook>) => {
    setSilkLook((prev) => ({ ...prev, ...partial }));
  };

  const frameStep = 1 / FPS;

  const controlledTime = useMemo(
    () => (playing && !reducedMotion ? undefined : scrubTime),
    [playing, reducedMotion, scrubTime],
  );

  useEffect(() => {
    const sync = () => {
      const host = rootRef.current;
      const presenting = !!document.fullscreenElement;
      if (!presenting && host) host.dataset.presenting = "false";
      setIsPresentation(presenting || host?.dataset.presenting === "true");
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const host = rootRef.current;
      if (!host || host.dataset.presenting !== "true") return;
      host.dataset.presenting = "false";
      setIsPresentation(false);
      if (document.fullscreenElement) void document.exitFullscreen();
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("keydown", onKey);
    sync();
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const fit = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const presenting =
        document.fullscreenElement != null ||
        rootRef.current?.dataset.presenting === "true";
      const cover = coverScale(w, h);
      /* Preview: cover shader, contain lockup. Present: cover both (no letterbox). */
      const lockup = presenting ? cover : containScale(w, h);
      stage.style.setProperty("--cephlo-fit-scale", String(lockup));
      stage.style.setProperty("--cephlo-cover-scale", String(cover));
      stage.dataset.presentation = presenting ? "true" : "false";
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    document.addEventListener("fullscreenchange", fit);
    return () => {
      observer.disconnect();
      document.removeEventListener("fullscreenchange", fit);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const run = () => {
      try {
        runCephloTypeLock(root);
      } catch {
        root.dataset.cephloTypeLock = "fail";
      }
    };

    run();
    const observer = new ResizeObserver(run);
    observer.observe(root);
    const stack = root.querySelector(".cephlo-wallpaper-stack");
    if (stack) observer.observe(stack);
    document.fonts.addEventListener("loadingdone", run);
    const later = window.setTimeout(run, 80);

    return () => {
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", run);
      window.clearTimeout(later);
    };
  }, [isPresentation]);

  const handleFrameTime = useCallback(
    (frameTime: number) => {
      if (reducedMotion || !playing) return;
      const wrapped = ((frameTime % loopSeconds) + loopSeconds) % loopSeconds;
      setTime(wrapped);
      setScrubTime(wrapped);
    },
    [playing, reducedMotion, loopSeconds],
  );

  const enterPresentation = useCallback(async () => {
    const host = rootRef.current;
    if (!host) return;
    host.dataset.presenting = "true";
    setIsPresentation(true);
    const stage = stageRef.current;
    if (stage) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cover = coverScale(w, h);
      stage.style.setProperty("--cephlo-fit-scale", String(cover));
      stage.style.setProperty("--cephlo-cover-scale", String(cover));
    }
    try {
      if (!document.fullscreenElement) {
        await host.requestFullscreen();
      }
    } catch {
      /* CSS viewport cover stays on; Esc exits. */
    }
  }, []);

  const replay = useCallback(() => {
    setTime(0);
    setScrubTime(0);
    setResetNonce((n) => n + 1);
    setPlaying(true);
  }, []);

  const nudgeFrame = useCallback(
    (direction: -1 | 1) => {
      setPlaying(false);
      setScrubTime((prev) => {
        const next = (prev + direction * frameStep + loopSeconds) % loopSeconds;
        setTime(next);
        return next;
      });
    },
    [frameStep, loopSeconds],
  );

  const exportVideo = useCallback(async () => {
    setExporting(true);
    setExportNote("Preparing export…");
    try {
      const result = await exportCephloHackFwWallpaperLoop({
        loopSeconds,
        headlineText,
        upNextText,
      });
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `cephlo-hack-fw-wallpaper-loop.${result.extension}`;
      anchor.click();
      URL.revokeObjectURL(url);

      setExportNote(
        result.extension === "mp4"
          ? "Export complete: MP4 (H.264)."
          : "Export complete: WebM (browser does not expose MP4 MediaRecorder here).",
      );
    } catch (error) {
      setExportNote(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }, [headlineText, loopSeconds, upNextText]);

  return (
    <div
      ref={rootRef}
      className={`cephlo-demo maser-lab max-sm:has-[.lab-dock-open]:overflow-visible ${cephloPlexCondensed.variable}`}
      data-reduced-motion={reducedMotion ? "true" : undefined}
    >
      <section
        ref={stageRef}
        className="lab-demo-field cephlo-demo__stage"
        aria-label="Cephlo Hack FW wallpaper"
      >
        <CephloHackFwWallpaper
          reducedMotion={reducedMotion}
          playing={playing}
          timeSeconds={controlledTime}
          onFrameTime={handleFrameTime}
          loopSeconds={loopSeconds}
          resetNonce={resetNonce}
          headlineText={headlineText}
          upNextText={upNextText}
          silkLook={silkLook}
        />
      </section>

      {!isPresentation ? (
        <DemoControlMenu>
          <LabControlGroup label="Presentation">
            <div className="flex flex-wrap gap-1.5">
              <LabButton type="button" variant="accent" onClick={enterPresentation}>
                Present
              </LabButton>
            </div>
            <p className="lab-type-caption text-[var(--lab-text-muted)]">
              Fullscreen with zero demo chrome. Exit with Esc.
            </p>
          </LabControlGroup>

          <LabControlGroup label="On-screen copy">
            <div className="lab-chrome-control flex min-w-0 flex-col gap-1">
              <label htmlFor="cephlo-headline" className="lab-type-label text-[var(--lab-text-primary)]">
                Headline
              </label>
              <input
                id="cephlo-headline"
                type="text"
                value={headlineText}
                onChange={(event) => setHeadlineText(event.target.value)}
                className={labTextFieldClassName}
                autoComplete="off"
              />
            </div>
            <div className="lab-chrome-control flex min-w-0 flex-col gap-1">
              <label htmlFor="cephlo-up-next" className="lab-type-label text-[var(--lab-text-primary)]">
                Up next
              </label>
              <input
                id="cephlo-up-next"
                type="text"
                value={upNextText}
                onChange={(event) => setUpNextText(event.target.value)}
                className={labTextFieldClassName}
                autoComplete="off"
                placeholder="Who is demoing next or what is up next"
              />
            </div>
            <p className="lab-type-caption text-[var(--lab-text-muted)]">
              Headline and up next render bottom-left on the wallpaper in white.
            </p>
          </LabControlGroup>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <DemoBackButton />
            <ReducedMotionToggle
              enabled={reducedMotion}
              onToggle={() => {
                setReducedMotion((value) => !value);
                setPlaying(false);
              }}
            />
          </div>

          <div>
            <p className="lab-type-title text-[var(--lab-text-primary)]">Cephlo Hack FW</p>
            <p className="lab-type-caption mt-1 text-[var(--lab-text-secondary)]">
              TV wallpaper with the Cephlo lockup on a blue moving gradient. Dither sits
              above noise. Letterboxed at 1920×1080.
            </p>
          </div>

          <LabControlGroup label="Gradient">
            <LabRange
              id="cephlo-silk-speed"
              label="Speed"
              min={SILK_LOOK_RANGES.speed.min}
              max={SILK_LOOK_RANGES.speed.max}
              step={SILK_LOOK_RANGES.speed.step}
              value={silkLook.speed}
              display={`${silkLook.speed.toFixed(2)}×`}
              onChange={(speed) => patchSilk({ speed })}
            />
            <LabRange
              id="cephlo-silk-scale"
              label="Fold scale"
              min={SILK_LOOK_RANGES.scale.min}
              max={SILK_LOOK_RANGES.scale.max}
              step={SILK_LOOK_RANGES.scale.step}
              value={silkLook.scale}
              display={`${silkLook.scale.toFixed(2)}×`}
              onChange={(scale) => patchSilk({ scale })}
            />
            <LabRange
              id="cephlo-silk-warp"
              label="Warp"
              min={SILK_LOOK_RANGES.warp.min}
              max={SILK_LOOK_RANGES.warp.max}
              step={SILK_LOOK_RANGES.warp.step}
              value={silkLook.warp}
              display={silkLook.warp.toFixed(2)}
              onChange={(warp) => patchSilk({ warp })}
            />
            <LabRange
              id="cephlo-silk-grey"
              label="Shade"
              min={SILK_LOOK_RANGES.grey.min}
              max={SILK_LOOK_RANGES.grey.max}
              step={SILK_LOOK_RANGES.grey.step}
              value={silkLook.grey}
              display={silkLook.grey.toFixed(2)}
              onChange={(grey) => patchSilk({ grey })}
            />
            <LabRange
              id="cephlo-silk-white"
              label="Highlight"
              min={SILK_LOOK_RANGES.white.min}
              max={SILK_LOOK_RANGES.white.max}
              step={SILK_LOOK_RANGES.white.step}
              value={silkLook.white}
              display={silkLook.white.toFixed(2)}
              onChange={(white) => patchSilk({ white })}
            />
            <LabRange
              id="cephlo-silk-ridge"
              label="Ridge mix"
              min={SILK_LOOK_RANGES.ridge.min}
              max={SILK_LOOK_RANGES.ridge.max}
              step={SILK_LOOK_RANGES.ridge.step}
              value={silkLook.ridge}
              display={silkLook.ridge.toFixed(2)}
              onChange={(ridge) => patchSilk({ ridge })}
            />
            <LabRange
              id="cephlo-silk-rotate"
              label="Rotate"
              min={SILK_LOOK_RANGES.rotate.min}
              max={SILK_LOOK_RANGES.rotate.max}
              step={SILK_LOOK_RANGES.rotate.step}
              value={silkLook.rotate}
              display={silkLook.rotate.toFixed(3)}
              onChange={(rotate) => patchSilk({ rotate })}
            />
            <LabRange
              id="cephlo-silk-drift"
              label="Drift"
              min={SILK_LOOK_RANGES.drift.min}
              max={SILK_LOOK_RANGES.drift.max}
              step={SILK_LOOK_RANGES.drift.step}
              value={silkLook.drift}
              display={silkLook.drift.toFixed(3)}
              onChange={(drift) => patchSilk({ drift })}
            />
            <LabRange
              id="cephlo-silk-dither"
              label="Dither"
              min={SILK_LOOK_RANGES.dither.min}
              max={SILK_LOOK_RANGES.dither.max}
              step={SILK_LOOK_RANGES.dither.step}
              value={silkLook.dither ?? DEFAULT_SILK_LOOK.dither}
              display={(silkLook.dither ?? DEFAULT_SILK_LOOK.dither).toFixed(2)}
              onChange={(dither) => patchSilk({ dither })}
            />
            <LabRange
              id="cephlo-silk-noise"
              label="Noise"
              min={SILK_LOOK_RANGES.grain.min}
              max={SILK_LOOK_RANGES.grain.max}
              step={SILK_LOOK_RANGES.grain.step}
              value={silkLook.grain ?? DEFAULT_SILK_LOOK.grain}
              display={(silkLook.grain ?? DEFAULT_SILK_LOOK.grain).toFixed(2)}
              onChange={(grain) => patchSilk({ grain })}
            />
            <div className="flex flex-wrap gap-1.5">
              <LabButton type="button" variant="outline" onClick={() => setSilkLook(DEFAULT_SILK_LOOK)}>
                Reset gradient
              </LabButton>
            </div>
            <p className="lab-type-caption text-[var(--lab-text-muted)]">
              Dither is ordered Bayer on the blue field. Noise is film grain under it.
              Sliders write live uniforms and do not remount the canvas.
            </p>
          </LabControlGroup>

          <LabControlGroup label="Playback">
            <div className="flex flex-wrap gap-1.5">
              <LabButton
                type="button"
                variant={playing ? "accent" : "ghost"}
                aria-pressed={playing}
                onClick={() => setPlaying((value) => !value)}
              >
                {playing ? "Pause" : "Play"}
              </LabButton>
              <LabButton type="button" variant="outline" onClick={replay}>
                Replay from t=0
              </LabButton>
              <LabButton type="button" variant="outline" onClick={() => nudgeFrame(-1)}>
                -1 frame
              </LabButton>
              <LabButton type="button" variant="outline" onClick={() => nudgeFrame(1)}>
                +1 frame
              </LabButton>
            </div>
            <LabRange
              id="cephlo-loop-time"
              label="Loop time"
              min={0}
              max={loopSeconds}
              step={frameStep}
              value={scrubTime}
              display={formatSeconds(scrubTime)}
              onChange={(next) => {
                const clamped = Math.min(loopSeconds, Math.max(0, next));
                setPlaying(false);
                setScrubTime(clamped >= loopSeconds ? 0 : clamped);
                setTime(clamped >= loopSeconds ? 0 : clamped);
              }}
              className="w-full"
            />
            <p className="lab-type-caption text-[var(--lab-text-muted)]">
              Live t: {formatSeconds(time)} / {loopSeconds}s @ {FPS}fps
            </p>
          </LabControlGroup>

          <LabControlGroup label="Loop">
            <LabSelect
              id="cephlo-loop-duration"
              label="Loop duration"
              value={String(loopSeconds)}
              options={LOOP_OPTIONS}
              onChange={(v) => {
                const next = clampLoopSeconds(Number(v));
                setLoopSeconds(next);
                setTime(0);
                setScrubTime(0);
              }}
            />
            <p className="lab-type-caption text-[var(--lab-text-muted)]">
              Default {DEFAULT_LOOP_SECONDS}s (up to {LOOP_MAX_SECONDS}s). The gradient drifts
              unless reduced motion is on.
            </p>
          </LabControlGroup>

          <LabControlGroup label="Export">
            <div className="flex flex-wrap gap-1.5">
              <LabButton type="button" onClick={exportVideo} disabled={exporting}>
                {exporting ? "Exporting…" : "Export MP4"}
              </LabButton>
            </div>
            <p className="lab-type-caption text-[var(--lab-text-muted)]">
              1920x1080 @ {FPS}fps, {loopSeconds}s, silent.
            </p>
            {exportNote ? (
              <p className="lab-type-caption text-[var(--lab-text-secondary)]">{exportNote}</p>
            ) : null}
          </LabControlGroup>
        </DemoControlMenu>
      ) : null}
    </div>
  );
}
