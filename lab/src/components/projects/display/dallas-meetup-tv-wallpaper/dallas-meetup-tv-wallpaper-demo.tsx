"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DemoBackButton,
  DemoControlMenu,
  LabButton,
  LabControlGroup,
  LabRange,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import {
  DallasMeetupWallpaper,
  exportDallasMeetupWallpaperLoop,
} from "./dallas-meetup-tv-wallpaper";
import "./tokens.css";

const LOOP_SECONDS = 8;
const FPS = 30;
const FRAME_STEP = 1 / FPS;

function formatSeconds(value: number) {
  return `${value.toFixed(2)}s`;
}

export function DallasMeetupTvWallpaperDemo() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [time, setTime] = useState(0);
  const [scrubTime, setScrubTime] = useState(0);
  const [isPresentation, setIsPresentation] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportNote, setExportNote] = useState<string>("");

  const controlledTime = useMemo(
    () => (playing && !reducedMotion ? undefined : scrubTime),
    [playing, reducedMotion, scrubTime],
  );

  useEffect(() => {
    if (!isPresentation) return;

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsPresentation(false);
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [isPresentation]);

  const handleFrameTime = useCallback(
    (frameTime: number) => {
      if (reducedMotion || !playing) return;
      setTime(frameTime);
      setScrubTime(frameTime);
    },
    [playing, reducedMotion],
  );

  const enterPresentation = useCallback(async () => {
    const root = stageRef.current;
    if (!root) return;
    setIsPresentation(true);
    try {
      if (!document.fullscreenElement) {
        await root.requestFullscreen();
      }
    } catch {
      setIsPresentation(false);
    }
  }, []);

  const replay = useCallback(() => {
    setTime(0);
    setScrubTime(0);
    setPlaying(true);
  }, []);

  const nudgeFrame = useCallback((direction: -1 | 1) => {
    setPlaying(false);
    setScrubTime((prev) => {
      const next = (prev + direction * FRAME_STEP + LOOP_SECONDS) % LOOP_SECONDS;
      setTime(next);
      return next;
    });
  }, []);

  const exportVideo = useCallback(async () => {
    setExporting(true);
    setExportNote("Preparing export…");
    try {
      const result = await exportDallasMeetupWallpaperLoop();
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
  }, []);

  return (
    <div className="dallas-demo maser-lab">
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
              Locked composition wallpaper loop for in-room TV presentation.
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
              max={LOOP_SECONDS}
              step={FRAME_STEP}
              value={scrubTime}
              display={formatSeconds(scrubTime)}
              onChange={(next) => {
                const clamped = Math.min(LOOP_SECONDS, Math.max(0, next));
                setPlaying(false);
                setScrubTime(clamped === LOOP_SECONDS ? 0 : clamped);
                setTime(clamped === LOOP_SECONDS ? 0 : clamped);
              }}
              className="w-full"
            />
            <p className="font-mono text-[10px] text-[var(--lab-text-muted)]">
              Live t: {formatSeconds(time)} · loop: 8.00s · 30fps
            </p>
          </LabControlGroup>

          <LabControlGroup label="Presentation">
            <div className="flex flex-wrap gap-1.5">
              <LabButton variant="accent" onClick={enterPresentation}>
                TV / presentation mode
              </LabButton>
            </div>
            <p className="font-mono text-[10px] text-[var(--lab-text-muted)]">
              Opens fullscreen wallpaper with zero demo chrome. Exit with browser Esc.
            </p>
          </LabControlGroup>

          <LabControlGroup label="Export">
            <div className="flex flex-wrap gap-1.5">
              <LabButton onClick={exportVideo} disabled={exporting}>
                {exporting ? "Exporting…" : "Export MP4"}
              </LabButton>
            </div>
            <p className="font-mono text-[10px] text-[var(--lab-text-muted)]">
              1920×1080 · 30fps · 8s · silent.
            </p>
            {exportNote ? (
              <p className="font-mono text-[10px] text-[var(--lab-text-secondary)]">{exportNote}</p>
            ) : null}
          </LabControlGroup>
        </DemoControlMenu>
      ) : null}
    </div>
  );
}
