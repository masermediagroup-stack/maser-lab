"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Moon, Sun, X } from "lucide-react";
import { PixelInfoCard } from "./pixel-info-card";
import { ControlSlider } from "./control-slider";
import { CodeExportDrawer } from "./code-export-drawer";
import {
  DEMO_BODY,
  DEFAULT_TITLE,
  PIC_DEFAULTS,
  PIC_PARAM_RANGES,
} from "./constants";
import type { PixelInfoTheme, PixelInfoTuning } from "./types";
import "./tokens.css";

function useNarrowViewport(): boolean {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return narrow;
}

export function PixelInfoCardDemo() {
  const [theme, setTheme] = useState<PixelInfoTheme>("dark");
  const [tuning, setTuning] = useState<PixelInfoTuning>({ ...PIC_DEFAULTS });
  const [exportOpen, setExportOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const cardKeyRef = useRef(0);
  const isNarrow = useNarrowViewport();
  const previewScale = fullscreen && !isNarrow ? 2 : 1;

  const update = useCallback(
    <K extends keyof PixelInfoTuning>(key: K, value: PixelInfoTuning[K]) => {
      setTuning((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setTuning({ ...PIC_DEFAULTS });
    cardKeyRef.current += 1;
    setResetKey(cardKeyRef.current);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setFullscreen(false);
    };
    // Capture so we exit fullscreen before the card collapses on Escape
    window.addEventListener("keydown", onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [fullscreen]);

  return (
    <div
      className="pic-demo"
      data-theme={theme}
      data-fullscreen={fullscreen ? "true" : "false"}
    >
      {!fullscreen && (
        <>
          <div className="pic-demo__back">
            <Link href="/" className="pic-demo__pill" aria-label="Back to lab">
              ‹
            </Link>
          </div>

          <div className="pic-demo__theme">
            <button
              type="button"
              className="pic-demo__pill"
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="size-5" aria-hidden />
              ) : (
                <Moon className="size-5" aria-hidden />
              )}
            </button>
          </div>

          <header className="pic-demo__header">
            <h1 className="pic-demo__title">Pixel Info Card</h1>
          </header>
        </>
      )}

      <div
        className={
          fullscreen
            ? "pic-demo__stage pic-demo__stage--fullscreen"
            : "pic-demo__stage"
        }
        role={fullscreen ? "dialog" : undefined}
        aria-modal={fullscreen || undefined}
        aria-label={fullscreen ? "Pixel Info Card fullscreen preview" : undefined}
      >
        {fullscreen ? (
          <button
            type="button"
            className="pic-demo__pill pic-demo__fullscreen-close"
            onClick={() => setFullscreen(false)}
            aria-label="Close fullscreen preview"
          >
            <X className="size-5" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            className="pic-demo__fullscreen-btn"
            onClick={() => setFullscreen(true)}
            aria-label="Enter fullscreen preview"
          >
            <Maximize2 className="size-4" aria-hidden />
            <span className="pic-demo__fullscreen-label">Fullscreen</span>
          </button>
        )}

        <div className="pic-demo__stage-focus">
          <PixelInfoCard
            key={`${resetKey}-fs-${fullscreen ? 2 : 1}`}
            theme={theme}
            title={DEFAULT_TITLE}
            body={DEMO_BODY}
            tuning={tuning}
            scale={previewScale}
          />
        </div>
      </div>

      {!fullscreen && (
        <div className="pic-demo__controls">
          <div className="pic-demo__actions">
            <button
              type="button"
              className="pic-demo__action-btn"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              type="button"
              className="pic-demo__action-btn"
              onClick={() => setExportOpen(true)}
            >
              Export
            </button>
          </div>

          <ControlSlider
            label="Pixel size"
            value={tuning.pixelSize}
            min={PIC_PARAM_RANGES.pixelSize.min}
            max={PIC_PARAM_RANGES.pixelSize.max}
            step={PIC_PARAM_RANGES.pixelSize.step}
            onChange={(v) => update("pixelSize", v)}
          />
          <ControlSlider
            label="Pixel density"
            value={tuning.pixelDensity}
            min={PIC_PARAM_RANGES.pixelDensity.min}
            max={PIC_PARAM_RANGES.pixelDensity.max}
            step={PIC_PARAM_RANGES.pixelDensity.step}
            formatValue={(v) => v.toFixed(2)}
            onChange={(v) => update("pixelDensity", v)}
          />
          <ControlSlider
            label="Assemble speed"
            value={tuning.assembleMs}
            min={PIC_PARAM_RANGES.assembleMs.min}
            max={PIC_PARAM_RANGES.assembleMs.max}
            step={PIC_PARAM_RANGES.assembleMs.step}
            formatValue={(v) => `${v}ms`}
            onChange={(v) => update("assembleMs", v)}
          />
          <ControlSlider
            label="Dissipate speed"
            value={tuning.dissipateMs}
            min={PIC_PARAM_RANGES.dissipateMs.min}
            max={PIC_PARAM_RANGES.dissipateMs.max}
            step={PIC_PARAM_RANGES.dissipateMs.step}
            formatValue={(v) => `${v}ms`}
            onChange={(v) => update("dissipateMs", v)}
          />
          <ControlSlider
            label="Card radius"
            value={tuning.cardRadius}
            min={PIC_PARAM_RANGES.cardRadius.min}
            max={PIC_PARAM_RANGES.cardRadius.max}
            step={PIC_PARAM_RANGES.cardRadius.step}
            formatValue={(v) => `${v}px`}
            onChange={(v) => update("cardRadius", v)}
          />
        </div>
      )}

      <CodeExportDrawer
        open={exportOpen}
        onOpenChange={setExportOpen}
        theme={theme}
        tuning={tuning}
        title={DEFAULT_TITLE}
        body={DEMO_BODY}
      />
    </div>
  );
}
