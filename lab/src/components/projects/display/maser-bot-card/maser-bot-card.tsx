"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { CardObject, type CardObjectPose } from "./card-object";
import { PARKED_COPY } from "./copy";
import { GrokBotMark, type MarkLookPointer } from "./grok-bot-mark";
import { GrokBotWordmark } from "./grok-bot-wordmark";
import { startStage, type StageUniforms } from "./start-stage";
import type { MaserBotCardFace, MaserBotCardProps } from "./types";
import "./maser-bot-card.css";

const YAW_DEG = 16;
const PITCH_DEG = 10;
const QUIET_SHEEN = 0.22;

const REST_STAGE: StageUniforms = {
  time: 0,
  pointerX: 0.22,
  pointerY: 0.18,
  tracking: 0,
  intensity: 0.35,
  reduced: 1,
};

const REST_POSE: CardObjectPose = {
  yaw: 0,
  pitch: 0,
  sheenX: 0.5,
  sheenY: 0.5,
  shineOn: 0,
  shineA: 0,
  tracking: false,
};

function setCardFaceLight(
  face: HTMLElement,
  on: boolean,
  x: number,
  y: number,
  amount: number,
) {
  face.style.setProperty("--sheen-x", `${x * 100}%`);
  face.style.setProperty("--sheen-y", `${y * 100}%`);
  face.style.setProperty("--shine-a", on ? String(amount) : "0");
  face.style.setProperty("--shine-on", on ? "1" : "0");
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
  const sceneRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const faceTiltRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLCanvasElement>(null);
  const stageUniformsRef = useRef<StageUniforms>(REST_STAGE);
  const poseRef = useRef<CardObjectPose>({ ...REST_POSE });
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
      poseRef.current = { ...REST_POSE };
      lookPointerRef.current = null;
      const faceEl = faceRef.current;
      if (faceEl) setCardFaceLight(faceEl, false, 0.5, 0.5, 0);
    }
    stageUniformsRef.current = {
      ...stageUniformsRef.current,
      tracking: bgInteractive && !reduced ? stageUniformsRef.current.tracking : 0,
      intensity: bgIntensity,
      reduced: reduced || !bgInteractive ? 1 : 0,
    };
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
    const onWinPointerMove = (event: globalThis.PointerEvent) => {
      if (reducedRef.current) return;
      lookPointerRef.current = {
        clientX: event.clientX,
        clientY: event.clientY,
        tracking: true,
      };
      if (!poseRef.current.tracking) return;
      const faceEl = faceRef.current;
      if (!faceEl) return;
      const rect = faceEl.getBoundingClientRect();
      const pad = 8;
      const inside =
        event.clientX >= rect.left - pad &&
        event.clientX <= rect.right + pad &&
        event.clientY >= rect.top - pad &&
        event.clientY <= rect.bottom + pad;
      if (inside) return;
      killCardLight();
    };
    window.addEventListener("pointermove", onWinPointerMove);
    return () => window.removeEventListener("pointermove", onWinPointerMove);
  }, []);

  function setFace(next: MaserBotCardFace) {
    if (faceProp === undefined) setUncontrolledFace(next);
    onFaceChange?.(next);
  }

  function killCardLight() {
    poseRef.current.tracking = false;
    poseRef.current.yaw = 0;
    poseRef.current.pitch = 0;
    poseRef.current.shineOn = 0;
    poseRef.current.shineA = 0;
    const faceEl = faceRef.current;
    if (faceEl) setCardFaceLight(faceEl, false, 0.5, 0.5, 0);
  }

  function pointerStillOnFace(event: PointerEvent<HTMLDivElement>) {
    const faceEl = faceRef.current;
    if (!faceEl) return false;
    const related = event.relatedTarget;
    if (related instanceof Node && faceEl.contains(related)) return true;
    const rect = faceEl.getBoundingClientRect();
    const pad = 8;
    return (
      event.clientX >= rect.left - pad &&
      event.clientX <= rect.right + pad &&
      event.clientY >= rect.top - pad &&
      event.clientY <= rect.bottom + pad
    );
  }

  function onCardEnter() {
    if (reduced) return;
    poseRef.current.tracking = true;
  }

  function onCardMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced) return;
    poseRef.current.tracking = true;
    const faceEl = faceRef.current;
    if (!faceEl) return;
    const rect = faceEl.getBoundingClientRect();
    const nx = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / Math.max(rect.width, 1)),
    );
    const ny = Math.min(
      1,
      Math.max(0, (event.clientY - rect.top) / Math.max(rect.height, 1)),
    );
    poseRef.current.sheenX = nx;
    poseRef.current.sheenY = ny;
    if (shineOnRef.current) {
      poseRef.current.shineOn = 1;
      poseRef.current.shineA = intensityRef.current;
      setCardFaceLight(faceEl, true, nx, ny, intensityRef.current);
    } else {
      poseRef.current.shineOn = 0;
      poseRef.current.shineA = 0;
      setCardFaceLight(faceEl, false, nx, ny, 0);
    }
    if (!tiltOnRef.current) {
      poseRef.current.yaw = 0;
      poseRef.current.pitch = 0;
      return;
    }
    const feel = feelRef.current;
    poseRef.current.yaw = (nx - 0.5) * 2 * YAW_DEG * feel;
    poseRef.current.pitch = (0.5 - ny) * 2 * PITCH_DEG * feel;
  }

  function onCardLeave(event: PointerEvent<HTMLDivElement>) {
    if (pointerStillOnFace(event)) return;
    killCardLight();
  }

  function onStageMove(event: PointerEvent<HTMLElement>) {
    if (reduced) return;
    lookPointerRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      tracking: true,
    };
    if (!bgInteractive) return;
    const canvas = stageRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    stageUniformsRef.current = {
      time: stageUniformsRef.current.time,
      pointerX: Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / Math.max(rect.width, 1)),
      ),
      pointerY: Math.min(
        1,
        Math.max(0, (event.clientY - rect.top) / Math.max(rect.height, 1)),
      ),
      tracking: 1,
      intensity: bgIntensityRef.current,
      reduced: 0,
    };
  }

  function onStageLeave() {
    lookPointerRef.current = null;
    stageUniformsRef.current = {
      ...stageUniformsRef.current,
      tracking: 0,
      reduced: reducedRef.current || !bgInteractiveRef.current ? 1 : 0,
      intensity: bgIntensityRef.current,
    };
  }

  const otherFace: MaserBotCardFace = face === "front" ? "back" : "front";
  const flipLabel = face === "front" ? "Back" : "Front";

  const cardFace = (
    <div
      ref={faceRef}
      className="maser-bot-card__face"
      onPointerEnter={onCardEnter}
      onPointerMove={onCardMove}
      onPointerLeave={onCardLeave}
      onPointerCancel={killCardLight}
    >
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
      <button
        type="button"
        className="maser-bot-card__flip-control"
        onClick={() => setFace(otherFace)}
        aria-pressed={face === "back"}
      >
        {flipLabel}
      </button>
    </div>
  );

  return (
    <article
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
      <div ref={sceneRef} className="maser-bot-card__scene">
        <div className="maser-bot-card__shadow" aria-hidden />
        <CardObject
          poseRef={poseRef}
          reduced={reduced}
          shadowRef={sceneRef}
          faceTiltRef={faceTiltRef}
        />
        <div className="maser-bot-card__face-layer">
          <div ref={faceTiltRef} className="maser-bot-card__face-tilt">
            {cardFace}
          </div>
        </div>
      </div>
    </article>
  );
}

export type {
  MaserBotCardBgMode,
  MaserBotCardFace,
  MaserBotCardProps,
} from "./types";
