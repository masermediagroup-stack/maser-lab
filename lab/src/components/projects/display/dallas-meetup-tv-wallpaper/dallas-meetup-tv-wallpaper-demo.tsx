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
import { dallasPlexCondensed } from "./dallas-fonts";
import {
  DallasMeetupWallpaper,
  exportDallasMeetupWallpaperLoop,
} from "./dallas-meetup-tv-wallpaper";
import {
  DEFAULT_LOOP_SECONDS,
  DEFAULT_WHIP_SECONDS,
  WHIP_MAX_SECONDS,
  WHIP_MIN_SECONDS,
} from "./globe-motion";
import { runDallasTypeLock } from "./type-lock";
import "./tokens.css";

const FPS = 30;

function formatSeconds(value: number) {
  return `${value.toFixed(2)}s`;
}

const LOOP_OPTIONS = [
  { value: "8", label: "8s (default)" },
  { value: "10", label: "10s" },
  { value: "12", label: "12s" },
  { value: "16", label: "16s" },
];

export function DallasMeetupTvWallpaperDemo() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [time, setTime] = useState(0);
  const [scrubTime, setScrubTime] = useState(0);
  const [isPresentation, setIsPresentation] = useState(false);
  const [loopSeconds, setLoopSeconds] = useState(DEFAULT_LOOP_SECONDS);
  const [whipSeconds, setWhipSeconds] = useState(DEFAULT_WHIP_SECONDS);
  const [resetNonce, setResetNonce] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportNote, setExportNote] = useState<string>("");

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
    const canvas = root.querySelector("canvas");
    if (canvas) observer.observe(canvas);
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
        whipSeconds,
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
  }, [loopSeconds, whipSeconds]);

  return (
    <div
      ref={rootRef}
      className={`dallas-demo maser-lab ${dallasPlexCondensed.variable}`}
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
          whipSeconds={whipSeconds}
          resetNonce={resetNonce}
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
            <h1 className="text-sm font-semibold tracking-tight">Dallas meetup TV wallpaper</h1>
            <p className="mt-1 text-xs leading-relaxed text-[var(--lab-text-secondary)]">
              Loop is 8s. Black disc. Planted stadiums. Kick = article-thick
              Ver 02 ribbons wrap, clip, leave. Idle has no ribbons. Geist is out.
            </p>
          </div>

          <LabControlGroup label="Playback">
            <div className="flex flex-wrap gap-1.5">
              <LabButton onClick={() => setPlaying((value) => !value)}>
                {playing ? "Pause" : "Play"}
              </LabButton>
              <LabButton variant="outline" onClick={replay}>
                Replay from t=0
              </LabButton>
              <LabButton variant="outline" onClick={() => nudgeFrame(-1)}>
                -1 frame
              </LabButton>
              <LabButton variant="outline" onClick={() => nudgeFrame(1)}>
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
            <p className="dallas-demo__note text-[10px] text-[var(--lab-text-muted)]">
              Live t: {formatSeconds(time)} / {loopSeconds}s @ 30fps
            </p>
          </LabControlGroup>

          <LabControlGroup label="Whip">
            <LabSelect
              id="dallas-loop-duration"
              label="Loop duration"
              value={String(loopSeconds)}
              options={LOOP_OPTIONS}
              onChange={(v) => {
                const next = Number(v);
                setLoopSeconds(next);
                setTime(0);
                setScrubTime(0);
              }}
            />
            <LabRange
              id="dallas-whip"
              label="Whip duration"
              min={WHIP_MIN_SECONDS}
              max={WHIP_MAX_SECONDS}
              step={0.01}
              value={whipSeconds}
              display={formatSeconds(whipSeconds)}
              onChange={setWhipSeconds}
              className="w-full"
            />
            <p className="dallas-demo__note text-[10px] text-[var(--lab-text-muted)]">
              Super-fast means the whip is short. Rest stays 6.4s at the 8s loop.
            </p>
          </LabControlGroup>

          <LabControlGroup label="Kick bands">
            <p className="dallas-demo__note text-[10px] text-[var(--lab-text-muted)]">
              Kick: 2–4 flat Ver 02, ~8% of face height, rounded caps.
              Wrap front/back, clip, cross the left eye, then leave. Random
              chromatic HEX per kick. Skip gray. Disc stays black. Eyes stay planted.
            </p>
          </LabControlGroup>

          <LabControlGroup label="Presentation">
            <div className="flex flex-wrap gap-1.5">
              <LabButton variant="accent" onClick={enterPresentation}>
                TV / presentation mode
              </LabButton>
            </div>
            <p className="dallas-demo__note text-[10px] text-[var(--lab-text-muted)]">
              Fullscreen with zero demo chrome. Exit with Esc.
            </p>
          </LabControlGroup>

          <LabControlGroup label="Export">
            <div className="flex flex-wrap gap-1.5">
              <LabButton onClick={exportVideo} disabled={exporting}>
                {exporting ? "Exporting…" : "Export MP4"}
              </LabButton>
            </div>
            <p className="dallas-demo__note text-[10px] text-[var(--lab-text-muted)]">
              1920x1080 @ 30fps, {loopSeconds}s, silent.
            </p>
            {exportNote ? (
              <p className="dallas-demo__note text-[10px] text-[var(--lab-text-secondary)]">{exportNote}</p>
            ) : null}
          </LabControlGroup>
        </DemoControlMenu>
      ) : null}
    </div>
  );
}
