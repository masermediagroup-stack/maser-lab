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
import { dallasPlexCondensed, DALLAS_DEFAULT_HEADLINE, DALLAS_DEFAULT_UP_NEXT } from "./dallas-fonts";
import {
  DallasMeetupWallpaper,
  exportDallasMeetupWallpaperLoop,
} from "./dallas-meetup-tv-wallpaper";
import {
  clampLoopSeconds,
  DEFAULT_LOOP_SECONDS,
  DALLAS_WALLPAPER_FPS,
  LOOP_DURATION_OPTIONS,
  LOOP_MAX_SECONDS,
} from "./globe-motion";
import { runDallasTypeLock } from "./type-lock";
import "./tokens.css";

const FPS = DALLAS_WALLPAPER_FPS;

const labTextFieldClassName =
  "lab-type-label min-h-11 w-full rounded-[6px] border border-[var(--lab-border)] bg-[var(--lab-surface)] px-[12px] text-[var(--lab-text-primary)]";

function formatSeconds(value: number) {
  return `${value.toFixed(2)}s`;
}

const LOOP_OPTIONS = LOOP_DURATION_OPTIONS.map((option) => ({ ...option }));

export function DallasMeetupTvWallpaperDemo() {
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
  const [headlineText, setHeadlineText] = useState(DALLAS_DEFAULT_HEADLINE);
  const [upNextText, setUpNextText] = useState(DALLAS_DEFAULT_UP_NEXT);

  const frameStep = 1 / FPS;

  const controlledTime = useMemo(
    () => (playing && !reducedMotion ? undefined : scrubTime),
    [playing, reducedMotion, scrubTime],
  );

  useEffect(() => {
    const sync = () => {
      setIsPresentation(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", sync);
    sync();
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const run = () => {
      try {
        runDallasTypeLock(root);
      } catch {
        root.dataset.dallasTypeLock = "fail";
      }
    };

    run();
    const observer = new ResizeObserver(run);
    observer.observe(root);
    const stack = root.querySelector(".dallas-wallpaper-stack");
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
    const root = stageRef.current;
    if (!root) return;
    try {
      if (!document.fullscreenElement) {
        await root.requestFullscreen();
      }
      await new Promise((r) => setTimeout(r, 50));
      if (!document.fullscreenElement) {
        setIsPresentation(false);
      }
    } catch {
      setIsPresentation(false);
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
      const result = await exportDallasMeetupWallpaperLoop({
        loopSeconds,
        headlineText,
        upNextText,
      });
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `dallas-meetup-wallpaper-loop.${result.extension}`;
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
      className={`dallas-demo maser-lab max-sm:has-[.lab-dock-open]:overflow-visible ${dallasPlexCondensed.variable}`}
      data-reduced-motion={reducedMotion ? "true" : undefined}
    >
      <section
        ref={stageRef}
        className="lab-demo-field dallas-demo__stage"
        aria-label="Dallas meetup TV wallpaper"
      >
        <DallasMeetupWallpaper
          className="dallas-demo__wallpaper"
          reducedMotion={reducedMotion}
          playing={playing}
          timeSeconds={controlledTime}
          onFrameTime={handleFrameTime}
          loopSeconds={loopSeconds}
          resetNonce={resetNonce}
          headlineText={headlineText}
          upNextText={upNextText}
        />
      </section>

      {!isPresentation ? (
        <DemoControlMenu>
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
            <p className="lab-type-title text-[var(--lab-text-primary)]">
              Dallas meetup TV wallpaper
            </p>
            <p className="lab-type-caption mt-1 text-[var(--lab-text-secondary)]">
              Idle wallpaper: dark silk vgpu moving-gradient ground, three center logos fading
              one-at-a-time over {DEFAULT_LOOP_SECONDS}s (default), bottom-left Universal Sans copy
              at true 1920×1080. Geist is out of the product surface.
            </p>
          </div>

          <LabControlGroup label="On-screen copy">
            <div className="lab-chrome-control flex min-w-0 flex-col gap-1">
              <label
                htmlFor="dallas-headline"
                className="lab-type-label text-[var(--lab-text-primary)]"
              >
                Headline
              </label>
              <input
                id="dallas-headline"
                type="text"
                value={headlineText}
                onChange={(event) => setHeadlineText(event.target.value)}
                className={labTextFieldClassName}
                autoComplete="off"
              />
            </div>
            <div className="lab-chrome-control flex min-w-0 flex-col gap-1">
              <label
                htmlFor="dallas-up-next"
                className="lab-type-label text-[var(--lab-text-primary)]"
              >
                Up next
              </label>
              <input
                id="dallas-up-next"
                type="text"
                value={upNextText}
                onChange={(event) => setUpNextText(event.target.value)}
                className={labTextFieldClassName}
                autoComplete="off"
                placeholder="Who is demoing next or what is up next"
              />
            </div>
            <p className="lab-type-caption text-[var(--lab-text-muted)]">
              Headline and up next render bottom-left on the wallpaper in white Universal Sans.
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
              id="dallas-loop-time"
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
              id="dallas-loop-duration"
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
              Default {DEFAULT_LOOP_SECONDS}s. Logo carousel shares this loop (up to{" "}
              {LOOP_MAX_SECONDS}s). Code ground runs quietly unless reduced motion.
            </p>
          </LabControlGroup>

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
