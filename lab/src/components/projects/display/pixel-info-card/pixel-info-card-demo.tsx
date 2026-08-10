"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
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

export function PixelInfoCardDemo() {
  const [theme, setTheme] = useState<PixelInfoTheme>("dark");
  const [tuning, setTuning] = useState<PixelInfoTuning>({ ...PIC_DEFAULTS });
  const [exportOpen, setExportOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const cardKeyRef = useRef(0);

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

  return (
    <div className="pic-demo" data-theme={theme}>
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
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
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

      <div className="pic-demo__stage">
        <PixelInfoCard
          key={resetKey}
          theme={theme}
          title={DEFAULT_TITLE}
          body={DEMO_BODY}
          tuning={tuning}
        />
      </div>

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
          label="Snake density"
          value={tuning.snakeDensity}
          min={PIC_PARAM_RANGES.snakeDensity.min}
          max={PIC_PARAM_RANGES.snakeDensity.max}
          step={PIC_PARAM_RANGES.snakeDensity.step}
          formatValue={(v) => v.toFixed(2)}
          onChange={(v) => update("snakeDensity", v)}
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
