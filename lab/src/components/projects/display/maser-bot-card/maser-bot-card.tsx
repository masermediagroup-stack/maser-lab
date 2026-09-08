"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { isWebGLAvailable } from "@/three/utils/capabilities";
import {
  CARD_FOV,
  CardObject,
  type CardObjectPose,
} from "./card-object";
import { PARKED_COPY } from "./copy";
import { GrokBotMark, type MarkLookPointer } from "./grok-bot-mark";
import { GrokBotWordmark } from "./grok-bot-wordmark";
import { startStage, type StageUniforms } from "./start-stage";
import type { MaserBotCardFace, MaserBotCardProps } from "./types";
import "./maser-bot-card.css";

const YAW_DEG = 16;
const PITCH_DEG = 10;
const QUIET_SHEEN = 0.22;
const TRACK_LERP = 0.18;
const REST_LERP = 0.11;
const BODY_WIDOW = "room moving.";
/** Raised body box (top 560, height 512) ends at y 1072 on the 1299 artboard. */
const FIGMA_TYPE_END = 1072;
const FIGMA_ART = 1299;
/** Air under the last body line / Figma type end before Back / Front. */
const FLIP_CLEAR_PX = 64;
const DEFAULT_GROUND = "#000000";
const EMPTY_SUBSCRIBE = () => () => {};

function cssGround(hex: string): string {
  const raw = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw;
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const h = raw.slice(1);
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  return DEFAULT_GROUND;
}

function hexToRgb01(hex: string): [number, number, number] {
  const value = cssGround(hex).slice(1);
  return [
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255,
  ];
}

function syncFlipGap(
  scene: HTMLElement | null,
  stack: HTMLElement | null,
  bio: HTMLElement | null,
) {
  if (!scene || !stack) return;
  const stackBox = stack.getBoundingClientRect();
  if (stackBox.height < 1) return;
  const figmaEnd =
    stackBox.top + (FIGMA_TYPE_END / FIGMA_ART) * stackBox.height;
  let typeEnd = figmaEnd;
  if (bio) {
    const range = document.createRange();
    range.selectNodeContents(bio);
    const rects = range.getClientRects();
    const last = rects[rects.length - 1];
    if (last) typeEnd = Math.max(typeEnd, last.bottom);
  }
  const gap = Math.max(FLIP_CLEAR_PX, typeEnd + FLIP_CLEAR_PX - stackBox.bottom);
  scene.style.setProperty("--flip-gap", `${Math.ceil(gap)}px`);
}

const REST_STAGE: StageUniforms = {
  time: 0,
  pointerX: 0.22,
  pointerY: 0.18,
  tracking: 0,
  intensity: 0.35,
  reduced: 1,
  groundR: 0,
  groundG: 0,
  groundB: 0,
};

const REST_POSE: CardObjectPose = {
  yaw: 0,
  pitch: 0,
  tracking: false,
};

function lerp(current: number, target: number, amount: number) {
  return current + (target - current) * amount;
}

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

function CardFaceBody({ text }: { text: string }) {
  if (!text.endsWith(BODY_WIDOW)) return text;
  return (
    <>
      {text.slice(0, -BODY_WIDOW.length)}
      <span className="maser-bot-card__body-end">{BODY_WIDOW}</span>
    </>
  );
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
  groundColor = DEFAULT_GROUND,
  forceReducedMotion = false,
  className,
}: MaserBotCardProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLParagraphElement>(null);
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
  const ground = cssGround(groundColor);
  const [groundR, groundG, groundB] = hexToRgb01(ground);

  const [osReduced, setOsReduced] = useState(false);
  const [gpuPainted, setGpuPainted] = useState(false);
  const [uncontrolledFace, setUncontrolledFace] =
    useState<MaserBotCardFace>("front");
  const webgl = useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    isWebGLAvailable,
    () => false,
  );

  const face = faceProp ?? uncontrolledFace;
  const reduced = forceReducedMotion || osReduced;
  const tiltOn = tiltEnabled && !reduced;
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
      groundR,
      groundG,
      groundB,
    };
  }, [
    reduced,
    tiltOn,
    shineOn,
    maxAngleFeel,
    shineIntensity,
    bgInteractive,
    bgIntensity,
    groundR,
    groundG,
    groundB,
  ]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setOsReduced(motion.matches);
    };
    sync();
    motion.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
    };
  }, []);

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    const stack = stackRef.current;
    const bio = bioRef.current;
    const apply = () => syncFlipGap(scene, stack, bio);
    apply();
    const ro = new ResizeObserver(apply);
    if (stack) ro.observe(stack);
    if (bio) ro.observe(bio);
    void document.fonts?.ready.then(apply);
    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, [face]);

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
    if (webgl) return;
    let raf = 0;
    let yaw = 0;
    let pitch = 0;

    const tick = () => {
      const pose = poseRef.current;
      const rest = reducedRef.current || !pose.tracking;
      const amount = rest ? REST_LERP : TRACK_LERP;
      const yawTarget = reducedRef.current || !tiltOnRef.current ? 0 : pose.yaw;
      const pitchTarget =
        reducedRef.current || !tiltOnRef.current ? 0 : pose.pitch;
      yaw = lerp(yaw, yawTarget, amount);
      pitch = lerp(pitch, pitchTarget, amount);

      const faceTilt = faceTiltRef.current;
      if (faceTilt) {
        const layer = faceTilt.parentElement;
        if (layer) {
          const height = faceTilt.offsetHeight;
          if (height > 0) {
            const persp =
              height / (2 * Math.tan(((CARD_FOV / 2) * Math.PI) / 180));
            layer.style.perspective = `${persp}px`;
          }
        }
        faceTilt.style.setProperty("--card-pitch", `${pitch}deg`);
        faceTilt.style.setProperty("--card-yaw", `${yaw}deg`);
      }

      const scene = sceneRef.current;
      if (scene) {
        scene.style.setProperty("--shadow-x", `${yaw * 1.15}px`);
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [webgl]);

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
    if (shineOnRef.current) {
      setCardFaceLight(faceEl, true, nx, ny, intensityRef.current);
    } else {
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
      ...stageUniformsRef.current,
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

  return (
    <article
      className={["maser-bot-card", className].filter(Boolean).join(" ")}
      style={{ "--mbc-ground": ground } as CSSProperties}
      aria-label="Maser bot card"
      data-reduced={reduced ? "true" : "false"}
      data-tilt={tiltOn ? "true" : "false"}
      data-shine={shineOn ? "true" : "false"}
      data-face={face}
      data-bg={bgMode}
      data-gpu={gpuPainted ? "painting" : "pending"}
      data-gl={webgl ? "true" : "false"}
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
        <div ref={stackRef} className="maser-bot-card__card-stack">
          <div className="maser-bot-card__shadow" aria-hidden />
          {webgl ? (
            <CardObject
              poseRef={poseRef}
              face={face}
              reduced={reduced}
              shadowRef={sceneRef}
              faceTiltRef={faceTiltRef}
            />
          ) : null}
          <div className="maser-bot-card__face-layer">
            <div ref={faceTiltRef} className="maser-bot-card__face-tilt">
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
                    <div className="maser-bot-card__sheen" aria-hidden />
                  </div>
                  <div className="maser-bot-card__side maser-bot-card__side--back">
                    <div className="maser-bot-card__slot maser-bot-card__slot--mark">
                      <GrokBotMark
                        reduced={reduced}
                        followLook={!reduced}
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
                    <p
                      ref={bioRef}
                      className="maser-bot-card__slot maser-bot-card__slot--bio"
                    >
                      <CardFaceBody text={PARKED_COPY.body} />
                    </p>
                    <div className="maser-bot-card__sheen" aria-hidden />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="maser-bot-card__flip-control"
          onClick={() => setFace(otherFace)}
          aria-pressed={face === "back"}
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
