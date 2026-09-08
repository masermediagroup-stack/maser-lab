"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { PARKED_COPY } from "./copy";
import { GrokBotMark, type MarkLookPointer } from "./grok-bot-mark";
import { GrokBotWordmark } from "./grok-bot-wordmark";
import { startStage, type StageUniforms } from "./start-stage";
import type { MaserBotCardFace, MaserBotCardProps } from "./types";
import "./maser-bot-card.css";

const YAW_DEG = 8;
const PITCH_DEG = 5;
const TRACK_LERP = 0.16;
const REST_LERP = 0.09;
const QUIET_SHEEN = 0.18;

const REST_STAGE: StageUniforms = {
  time: 0,
  pointerX: 0.22,
  pointerY: 0.18,
  tracking: 0,
  intensity: 0.35,
  reduced: 1,
};

function lerp(current: number, target: number, amount: number) {
  return current + (target - current) * amount;
}

function setPlateSheen(
  plate: HTMLDivElement,
  on: boolean,
  x: number,
  y: number,
  amount: number,
) {
  plate.style.setProperty("--sheen-x", `${x * 100}%`);
  plate.style.setProperty("--sheen-y", `${y * 100}%`);
  plate.style.setProperty("--shine-a", on ? String(amount) : "0");
  plate.style.setProperty("--shine-on", on ? "1" : "0");
}

export function MaserBotCard({
  tiltEnabled = true,
  maxAngleFeel = 1,
  shineEnabled = true,
  shineIntensity = QUIET_SHEEN,
  face: faceProp,
  onFaceChange,
  bgMode = "interactive",
  bgIntensity = 0.35,
  forceReducedMotion = false,
  className,
}: MaserBotCardProps) {
  const rootRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLCanvasElement>(null);
  const stageUniformsRef = useRef<StageUniforms>(REST_STAGE);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const targetYawRef = useRef(0);
  const targetPitchRef = useRef(0);
  const sheenXRef = useRef(0.5);
  const sheenYRef = useRef(0.5);
  const trackingRef = useRef(false);
  const stagePointerRef = useRef({ x: 0.22, y: 0.18, tracking: false });
  const lookPointerRef = useRef<MarkLookPointer | null>(null);
  const reducedRef = useRef(false);
  const tiltOnRef = useRef(true);
  const shineOnRef = useRef(true);
  const feelRef = useRef(maxAngleFeel);
  const intensityRef = useRef(shineIntensity);
  const bgInteractiveRef = useRef(false);
  const bgIntensityRef = useRef(bgIntensity);

  const [osReduced, setOsReduced] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [gpuPainted, setGpuPainted] = useState(false);
  const [uncontrolledFace, setUncontrolledFace] =
    useState<MaserBotCardFace>("front");

  const face = faceProp ?? uncontrolledFace;
  const reduced = forceReducedMotion || osReduced;
  const tiltOn = tiltEnabled && !reduced && finePointer;
  const shineOn = shineEnabled && !reduced;
  const bgInteractive = bgMode === "interactive" && !reduced;

  useEffect(() => {
    reducedRef.current = reduced;
    tiltOnRef.current = tiltOn;
    shineOnRef.current = shineOn;
    feelRef.current = maxAngleFeel;
    intensityRef.current = shineIntensity;
    bgInteractiveRef.current = bgInteractive;
    bgIntensityRef.current = bgIntensity;
    if (reduced) {
      trackingRef.current = false;
      stagePointerRef.current.tracking = false;
      const plate = plateRef.current;
      if (plate) setPlateSheen(plate, false, 0.5, 0.5, 0);
    }
  }, [
    reduced,
    tiltOn,
    shineOn,
    maxAngleFeel,
    shineIntensity,
    bgInteractive,
    bgIntensity,
  ]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => {
      setOsReduced(motion.matches);
      setFinePointer(pointer.matches);
    };
    sync();
    motion.addEventListener("change", sync);
    pointer.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      pointer.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const canvas = stageRef.current;
    if (!canvas) return;
    return startStage({
      canvas,
      uniformsRef: stageUniformsRef,
      onPainted: () => setGpuPainted(true),
    });
  }, []);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const plate = plateRef.current;
      if (!plate) {
        frame = window.requestAnimationFrame(tick);
        return;
      }

      const rest = !trackingRef.current || reducedRef.current || !tiltOnRef.current;
      const amount = rest ? REST_LERP : TRACK_LERP;
      const yawTarget = reducedRef.current || !tiltOnRef.current ? 0 : targetYawRef.current;
      const pitchTarget =
        reducedRef.current || !tiltOnRef.current ? 0 : targetPitchRef.current;

      yawRef.current = lerp(yawRef.current, yawTarget, amount);
      pitchRef.current = lerp(pitchRef.current, pitchTarget, amount);

      plate.style.setProperty("--yaw", `${yawRef.current}deg`);
      plate.style.setProperty("--pitch", `${pitchRef.current}deg`);

      const sheenLive =
        trackingRef.current && shineOnRef.current && !reducedRef.current;
      if (sheenLive) {
        setPlateSheen(
          plate,
          true,
          sheenXRef.current,
          sheenYRef.current,
          intensityRef.current,
        );
      } else {
        setPlateSheen(plate, false, sheenXRef.current, sheenYRef.current, 0);
      }

      const stagePtr = stagePointerRef.current;
      stageUniformsRef.current = {
        time: stageUniformsRef.current.time,
        pointerX: stagePtr.x,
        pointerY: stagePtr.y,
        tracking: stagePtr.tracking && bgInteractiveRef.current ? 1 : 0,
        intensity: bgIntensityRef.current,
        reduced: reducedRef.current || !bgInteractiveRef.current ? 1 : 0,
      };

      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function setFace(next: MaserBotCardFace) {
    if (faceProp === undefined) setUncontrolledFace(next);
    onFaceChange?.(next);
  }

  function killPlateLight() {
    trackingRef.current = false;
    lookPointerRef.current = null;
    targetYawRef.current = 0;
    targetPitchRef.current = 0;
    const plate = plateRef.current;
    if (plate) setPlateSheen(plate, false, sheenXRef.current, sheenYRef.current, 0);
  }

  function onPlateEnter() {
    if (reduced) return;
    trackingRef.current = true;
  }

  function onPlateMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced) return;
    lookPointerRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      tracking: true,
    };
    if (!finePointer) return;
    const plate = plateRef.current;
    if (!plate) return;
    const rect = plate.getBoundingClientRect();
    const nx = Math.min(1, Math.max(0, (event.clientX - rect.left) / Math.max(rect.width, 1)));
    const ny = Math.min(1, Math.max(0, (event.clientY - rect.top) / Math.max(rect.height, 1)));
    const feel = feelRef.current;
    targetYawRef.current = (nx - 0.5) * 2 * YAW_DEG * feel;
    targetPitchRef.current = (0.5 - ny) * 2 * PITCH_DEG * feel;
    sheenXRef.current = nx;
    sheenYRef.current = ny;
    if (shineOn) setPlateSheen(plate, true, nx, ny, intensityRef.current);
  }

  function onStageMove(event: PointerEvent<HTMLElement>) {
    if (reduced || !bgInteractive) return;
    const canvas = stageRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    stagePointerRef.current = {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / Math.max(rect.width, 1))),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / Math.max(rect.height, 1))),
      tracking: true,
    };
  }

  function onStageLeave() {
    stagePointerRef.current.tracking = false;
  }

  const otherFace: MaserBotCardFace = face === "front" ? "back" : "front";
  const flipLabel = face === "front" ? "View back" : "View front";

  return (
    <article
      ref={rootRef}
      className={["maser-bot-card", className].filter(Boolean).join(" ")}
      aria-label="Maser bot card"
      data-reduced={reduced ? "true" : "false"}
      data-tilt={tiltOn ? "true" : "false"}
      data-shine={shineOn ? "true" : "false"}
      data-face={face}
      data-bg={bgMode}
      data-gpu={gpuPainted ? "painting" : "pending"}
      onPointerMove={onStageMove}
      onPointerLeave={onStageLeave}
    >
      <div
        className="maser-bot-card__bg"
        data-mode={bgMode}
        data-interactive={bgInteractive ? "true" : "false"}
        data-slot="stage-bg"
        aria-hidden
      >
        <canvas ref={stageRef} className="maser-bot-card__stage" />
      </div>
      <div className="maser-bot-card__scene">
        <div
          ref={plateRef}
          className="maser-bot-card__plate"
          onPointerEnter={onPlateEnter}
          onPointerMove={onPlateMove}
          onPointerLeave={killPlateLight}
          onPointerCancel={killPlateLight}
        >
          <div className="maser-bot-card__body">
            <div className="maser-bot-card__flip">
              <div className="maser-bot-card__side maser-bot-card__side--front">
                <div className="maser-bot-card__slot maser-bot-card__slot--wordmark">
                  <GrokBotWordmark className="maser-bot-card__wordmark" />
                </div>
              </div>
              <div className="maser-bot-card__side maser-bot-card__side--back">
                <div className="maser-bot-card__slot maser-bot-card__slot--mark">
                  <GrokBotMark
                    reduced={reduced}
                    followLook={!reduced && finePointer}
                    lookPointerRef={lookPointerRef}
                    className="maser-bot-card__mark"
                  />
                </div>
                <p className="maser-bot-card__slot maser-bot-card__slot--name">
                  {PARKED_COPY.name}
                </p>
                <p className="maser-bot-card__slot maser-bot-card__slot--role">
                  {PARKED_COPY.role}
                </p>
                <p className="maser-bot-card__slot maser-bot-card__slot--bio">
                  {PARKED_COPY.body}
                </p>
              </div>
            </div>
            <div className="maser-bot-card__sheen" aria-hidden />
          </div>
        </div>
        <button
          type="button"
          className="maser-bot-card__flip-control"
          onClick={() => setFace(otherFace)}
          aria-pressed={face === "back"}
          aria-label={flipLabel}
        >
          {flipLabel}
        </button>
      </div>
    </article>
  );
}

export type {
  MaserBotCardBgMode,
  MaserBotCardFace,
  MaserBotCardProps,
} from "./types";
