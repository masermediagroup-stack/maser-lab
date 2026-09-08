"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DemoBackButton,
  DemoControlMenu,
  LabButton,
  LabColor,
  LabControlGroup,
  LabRange,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { MaserBotCard } from "./maser-bot-card";
import type { MaserBotCardBgMode, MaserBotCardFace } from "./types";

export function MaserBotCardDemo() {
  const [tiltEnabled, setTiltEnabled] = useState(true);
  const [maxAngleFeel, setMaxAngleFeel] = useState(1);
  const [shineEnabled, setShineEnabled] = useState(true);
  const [shineIntensity, setShineIntensity] = useState(0.22);
  const [face, setFace] = useState<MaserBotCardFace>("front");
  const [bgMode, setBgMode] = useState<MaserBotCardBgMode>("interactive");
  const [bgIntensity, setBgIntensity] = useState(0.35);
  const [groundColor, setGroundColor] = useState("#000000");
  const [reduced, setReduced] = useState(false);
  const [present, setPresent] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  const handleReplay = useCallback(() => {
    setFace("front");
    setReplayKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!present) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setPresent(false);
    };
    window.addEventListener("keydown", onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [present]);

  const card = (
    <MaserBotCard
      key={replayKey}
      tiltEnabled={tiltEnabled}
      maxAngleFeel={maxAngleFeel}
      shineEnabled={shineEnabled}
      shineIntensity={shineIntensity}
      face={face}
      onFaceChange={setFace}
      bgMode={bgMode}
      bgIntensity={bgIntensity}
      groundColor={groundColor}
      forceReducedMotion={reduced}
    />
  );

  return (
    <div className="maser-lab relative min-h-dvh">
      {present ? null : (
        <DemoControlMenu>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DemoBackButton />
            <LabButton type="button" variant="outline" onClick={() => setPresent(true)}>
              Present
            </LabButton>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <LabButton type="button" variant="outline" onClick={handleReplay}>
              Replay
            </LabButton>
            <ReducedMotionToggle
              enabled={reduced}
              onToggle={() => setReduced((value) => !value)}
            />
          </div>
          <LabControlGroup label="Face">
            <div className="flex flex-wrap gap-1" role="group" aria-label="Card face">
              <LabButton
                type="button"
                variant={face === "front" ? "accent" : "ghost"}
                aria-pressed={face === "front"}
                onClick={() => setFace("front")}
              >
                Front
              </LabButton>
              <LabButton
                type="button"
                variant={face === "back" ? "accent" : "ghost"}
                aria-pressed={face === "back"}
                onClick={() => setFace("back")}
              >
                Back
              </LabButton>
            </div>
          </LabControlGroup>
          <LabControlGroup label="Tilt">
            <LabButton
              type="button"
              variant={tiltEnabled ? "accent" : "ghost"}
              aria-pressed={tiltEnabled}
              onClick={() => setTiltEnabled((value) => !value)}
            >
              Tilt {tiltEnabled ? "on" : "off"}
            </LabButton>
            <LabRange
              id="mbc-max-angle"
              label="Max angle feel"
              min={0.5}
              max={1.6}
              step={0.05}
              value={maxAngleFeel}
              display={maxAngleFeel.toFixed(2)}
              onChange={setMaxAngleFeel}
            />
          </LabControlGroup>
          <LabControlGroup label="Shine">
            <LabButton
              type="button"
              variant={shineEnabled ? "accent" : "ghost"}
              aria-pressed={shineEnabled}
              onClick={() => setShineEnabled((value) => !value)}
            >
              Shine {shineEnabled ? "on" : "off"}
            </LabButton>
            <LabRange
              id="mbc-shine"
              label="Intensity"
              min={0}
              max={1}
              step={0.01}
              value={shineIntensity}
              display={shineIntensity.toFixed(2)}
              onChange={setShineIntensity}
            />
          </LabControlGroup>
          <LabControlGroup label="Stage bg">
            <div
              className="flex flex-wrap gap-1"
              role="group"
              aria-label="Stage background mode"
            >
              <LabButton
                type="button"
                variant={bgMode === "calm" ? "accent" : "ghost"}
                aria-pressed={bgMode === "calm"}
                onClick={() => setBgMode("calm")}
              >
                Calm
              </LabButton>
              <LabButton
                type="button"
                variant={bgMode === "interactive" ? "accent" : "ghost"}
                aria-pressed={bgMode === "interactive"}
                onClick={() => setBgMode("interactive")}
              >
                Interactive
              </LabButton>
            </div>
            <LabRange
              id="mbc-bg-intensity"
              label="Intensity"
              min={0}
              max={1}
              step={0.01}
              value={bgIntensity}
              display={bgIntensity.toFixed(2)}
              onChange={setBgIntensity}
            />
          </LabControlGroup>
          <LabControlGroup label="Ground">
            <LabColor
              id="mbc-ground"
              label="Ground"
              value={groundColor}
              onChange={setGroundColor}
            />
          </LabControlGroup>
        </DemoControlMenu>
      )}

      <div
        className={present ? "fixed inset-0 z-20" : "lab-demo-field"}
        role={present ? "dialog" : undefined}
        aria-modal={present || undefined}
        aria-label={present ? "Maser bot card present" : undefined}
      >
        {card}
      </div>
    </div>
  );
}
