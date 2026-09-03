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
import { dallasPlexMono, dallasPlexSansCondensed } from "./dallas-fonts";
import {
  DallasMeetupWallpaper,
  exportDallasMeetupWallpaperLoop,
} from "./dallas-meetup-tv-wallpaper";
import "./tokens.css";

const DEFAULT_LOOP = 12;
const FPS = 30;

function formatSeconds(value: number) {
  return `${value.toFixed(2)}s`;
}

const LOOP_OPTIONS = [
  { value: "8", label: "8s (fast)" },
  { value: "10", label: "10s" },
  { value: "12", label: "12s (default)" },
  { value: "16", label: "16s (slow)" },
];

export function DallasMeetupTvWallpaperDemo() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [time, setTime] = useState(0);
  const [scrubTime, setScrubTime] = useState(0);
  const [isPresentation, setIsPresentation] = useState(false);
  const [loopSeconds, setLoopSeconds] = useState(DEFAULT_LOOP);
  const [faceForward, setFaceForward] = useState(false);
  const [showSkyline, setShowSkyline] = useState(false);
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
        faceForward,
        showSkyline,
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
  }, [loopSeconds, faceForward, showSkyline]);

  return (
    <div
      className={`dallas-demo maser-lab ${dallasPlexSansCondensed.variable} ${dallasPlexMono.variable}`}
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
          faceForward={faceForward}
          showSkyline={showSkyline}
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
              Cursor + Grok Bot globe. One revolution = one seamless loop.
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
            <p className="dallas-demo__mono text-[10px] text-[var(--lab-text-muted)]">
              Live t: {formatSeconds(time)} / {loopSeconds}s @ 30fps
            </p>
          </LabControlGroup>

          <LabControlGroup label="Globe">
            <LabSelect
              id="dallas-loop-duration"
              label="Revolution duration"
              value={String(loopSeconds)}
              options={LOOP_OPTIONS}
              onChange={(v) => {
                const next = Number(v);
                setLoopSeconds(next);
                setTime(0);
                setScrubTime(0);
              }}
            />
            <div className="flex items-center gap-1.5">
              <LabButton
                variant={faceForward ? "ghost" : "accent"}
                aria-pressed={!faceForward}
                onClick={() => setFaceForward(false)}
              >
                Full rotation
              </LabButton>
              <LabButton
                variant={faceForward ? "accent" : "ghost"}
                aria-pressed={faceForward}
                onClick={() => setFaceForward(true)}
              >
                Face-forward
              </LabButton>
            </div>
            <p className="dallas-demo__mono text-[10px] text-[var(--lab-text-muted)]">
              Full rotation: face travels with the globe. Face-forward: eyes
              stay front while meridians rotate.
            </p>
          </LabControlGroup>

          <LabControlGroup label="Skyline">
            <div className="flex items-center gap-1.5">
              <LabButton
                variant={showSkyline ? "ghost" : "accent"}
                aria-pressed={!showSkyline}
                onClick={() => setShowSkyline(false)}
              >
                Off (default)
              </LabButton>
              <LabButton
                variant={showSkyline ? "accent" : "ghost"}
                aria-pressed={showSkyline}
                onClick={() => setShowSkyline(true)}
              >
                On
              </LabButton>
            </div>
            <p className="dallas-demo__mono text-[10px] text-[var(--lab-text-muted)]">
              Additive Dallas silhouette. Off keeps the globe as the only
              subject. Toggle does not move marks or type.
            </p>
          </LabControlGroup>

          <LabControlGroup label="Presentation">
            <div className="flex flex-wrap gap-1.5">
              <LabButton variant="accent" onClick={enterPresentation}>
                TV / presentation mode
              </LabButton>
            </div>
            <p className="dallas-demo__mono text-[10px] text-[var(--lab-text-muted)]">
              Fullscreen with zero demo chrome. Exit with Esc.
            </p>
          </LabControlGroup>

          <LabControlGroup label="Export">
            <div className="flex flex-wrap gap-1.5">
              <LabButton onClick={exportVideo} disabled={exporting}>
                {exporting ? "Exporting…" : "Export MP4"}
              </LabButton>
            </div>
            <p className="dallas-demo__mono text-[10px] text-[var(--lab-text-muted)]">
              1920x1080 @ 30fps, {loopSeconds}s, silent.
            </p>
            {exportNote ? (
              <p className="dallas-demo__mono text-[10px] text-[var(--lab-text-secondary)]">{exportNote}</p>
            ) : null}
          </LabControlGroup>
        </DemoControlMenu>
      ) : null}
    </div>
  );
}
