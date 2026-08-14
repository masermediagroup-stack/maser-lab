"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DemoBackButton,
  DemoControlBar,
  LabButton,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { DitherGooeyCard } from "./dither-gooey-card";
import { COPY, DEFAULT_BACKGROUND, DEFAULT_TEXT } from "./constants";

const COLOR_PRESETS = [
  { id: "grey", label: "Grey", background: DEFAULT_BACKGROUND, text: DEFAULT_TEXT },
  { id: "ink", label: "Ink", background: "#1c1c1f", text: "#f4f4f2" },
  { id: "cream", label: "Cream", background: "#e8e4d8", text: "#2a2a28" },
  { id: "navy", label: "Navy", background: "#1e3a5f", text: "#f4f7fb" },
] as const;

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-[var(--lab-radius-sm)] border border-[var(--lab-border)] bg-[var(--lab-surface)] px-2 py-1.5 font-mono text-xs text-[var(--lab-text-secondary)]">
      <span>{label}</span>
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
      />
    </label>
  );
}

export function DitherGooeyCardDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [open, setOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND);
  const [textColor, setTextColor] = useState(DEFAULT_TEXT);

  const activePreset = COLOR_PRESETS.find(
    (preset) =>
      preset.background === backgroundColor && preset.text === textColor,
  );

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setFocusMode(false);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!focusMode) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    const prevOverscroll = html.style.overscrollBehavior;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      html.style.overscrollBehavior = prevOverscroll;
    };
  }, [focusMode]);

  const exitFocus = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
    }
    setFocusMode(false);
  }, []);

  const enterFocus = useCallback(async () => {
    setFocusMode(true);
    const node = stageRef.current;
    if (node && "requestFullscreen" in node) {
      await node.requestFullscreen().catch(() => undefined);
    }
  }, []);

  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      <LabButton
        variant={open ? "accent" : "ghost"}
        aria-pressed={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Open" : "Collapsed"}
      </LabButton>
      {COLOR_PRESETS.map((preset) => (
        <LabButton
          key={preset.id}
          variant={activePreset?.id === preset.id ? "accent" : "ghost"}
          aria-pressed={activePreset?.id === preset.id}
          onClick={() => {
            setBackgroundColor(preset.background);
            setTextColor(preset.text);
          }}
        >
          {preset.label}
        </LabButton>
      ))}
      <ColorField
        label="Background"
        value={backgroundColor}
        onChange={setBackgroundColor}
      />
      <ColorField label="Text" value={textColor} onChange={setTextColor} />
      <ReducedMotionToggle
        enabled={reducedMotion}
        onToggle={() => setReducedMotion((value) => !value)}
      />
    </div>
  );

  return (
    <div
      ref={stageRef}
      data-focus={focusMode ? "true" : "false"}
      className={
        focusMode
          ? "fixed inset-0 z-[70] flex min-h-dvh flex-col overflow-hidden bg-[#121214] text-[#f4f4f2] overscroll-none"
          : "relative min-h-dvh overflow-x-hidden bg-[#121214] text-[#f4f4f2]"
      }
      style={{ touchAction: focusMode ? "none" : undefined }}
    >
      <DemoControlBar className="left-4 right-4 top-4 justify-between sm:left-6 sm:right-6">
        {focusMode ? (
          <>
            <LabButton variant="ghost" onClick={() => void exitFocus()}>
              Exit
            </LabButton>
            <div className="flex flex-wrap items-center gap-2">
              <ReducedMotionToggle
                enabled={reducedMotion}
                onToggle={() => setReducedMotion((value) => !value)}
              />
              <LabButton
                variant="accent"
                aria-pressed
                aria-label="Exit fullscreen"
                onClick={() => void exitFocus()}
              >
                <Minimize2 aria-hidden className="size-3.5" />
                Exit
              </LabButton>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <DemoBackButton />
              <LabButton
                variant="ghost"
                aria-pressed={false}
                aria-label="Enter fullscreen"
                onClick={() => void enterFocus()}
              >
                <Maximize2 aria-hidden className="size-3.5" />
                Fullscreen
              </LabButton>
            </div>
            {controls}
          </>
        )}
      </DemoControlBar>

      <main
        className={
          focusMode
            ? "flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[calc(var(--lab-control-bar-bottom,5.5rem))]"
            : "flex min-h-dvh flex-col items-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[calc(var(--lab-control-bar-bottom,7.5rem))]"
        }
      >
        {focusMode ? null : (
          <div className="mb-6 max-w-md shrink-0 text-center">
            <p className="font-mono text-xs tracking-[0.18em] text-[var(--lab-text-muted,#9a9a9a)] uppercase">
              Display
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Gooey Card
            </h1>
            <p className="mt-2 text-sm text-[var(--lab-text-secondary,#c4c4c4)]">
              Grab the arrow to pull open. Tap Fullscreen on mobile so the page
              does not scroll with the gesture.
            </p>
          </div>
        )}

        <div className="flex w-full flex-1 items-center justify-center">
          <DitherGooeyCard
            title={COPY.title}
            reducedMotion={reducedMotion}
            backgroundColor={backgroundColor}
            textColor={textColor}
            open={open}
            onOpenChange={setOpen}
          />
        </div>
      </main>
    </div>
  );
}
