"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { TYPE_WORLD_DEFAULTS } from "./constants";
import { clamp, damp, inertiaDecay } from "./math";
import type { DragRotationOptions } from "./types";

const INTENT_PX = 10;
const DEG = Math.PI / 180;

export type DragRotationApi = {
  yawRef: RefObject<number>;
  pitchRef: RefObject<number>;
  gripRef: RefObject<number>;
  grabbingRef: RefObject<boolean>;
  tick: (dt: number) => void;
  handlers: {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
    onLostPointerCapture: (event: ReactPointerEvent<HTMLElement>) => void;
    onContextMenu: (event: { preventDefault: () => void }) => void;
  };
};

type PointerSession = {
  id: number;
  lastX: number;
  lastY: number;
  lastT: number;
  pending: boolean;
  startX: number;
  startY: number;
};

/**
 * Pointer → target rotation → damped actual rotation.
 * Touch: vertical intent scrolls the page; horizontal intent turns the sphere.
 */
export function useDragRotation(
  surfaceRef: RefObject<HTMLElement | null>,
  options: DragRotationOptions,
): DragRotationApi {
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const yawTargetRef = useRef(0);
  const pitchTargetRef = useRef(0);
  const velYawRef = useRef(0);
  const velPitchRef = useRef(0);
  const gripRef = useRef(1);
  const gripTargetRef = useRef(1);
  const grabbingRef = useRef(false);
  const sessionRef = useRef<PointerSession | null>(null);
  const interactedRef = useRef(false);

  const markGrabbing = useCallback((node: HTMLElement, grabbing: boolean) => {
    grabbingRef.current = grabbing;
    gripTargetRef.current = grabbing ? TYPE_WORLD_DEFAULTS.gripScale : 1;
    node.dataset.grabbing = grabbing ? "true" : "false";
    node.style.touchAction = grabbing ? "none" : "pan-y";
  }, []);

  const endSession = useCallback(
    (node: HTMLElement, pointerId: number) => {
      const session = sessionRef.current;
      if (!session || session.id !== pointerId) return;
      sessionRef.current = null;
      if (grabbingRef.current) {
        try {
          node.releasePointerCapture(pointerId);
        } catch {
          // Capture may already be released.
        }
      }
      markGrabbing(node, false);
    },
    [markGrabbing],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (sessionRef.current) return;
      const node = surfaceRef.current;
      if (!node) return;

      const isMouse = event.pointerType === "mouse" || event.pointerType === "pen";
      sessionRef.current = {
        id: event.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
        lastT: performance.now(),
        pending: !isMouse,
        startX: event.clientX,
        startY: event.clientY,
      };
      velYawRef.current = 0;
      velPitchRef.current = 0;

      if (isMouse) {
        node.setPointerCapture(event.pointerId);
        markGrabbing(node, true);
      }
    },
    [markGrabbing, surfaceRef],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const session = sessionRef.current;
      if (!session || session.id !== event.pointerId) return;
      const node = surfaceRef.current;
      if (!node) return;

      const now = performance.now();
      const dx = event.clientX - session.lastX;
      const dy = event.clientY - session.lastY;
      const dt = Math.max(0.008, (now - session.lastT) / 1000);

      if (session.pending) {
        const adx = Math.abs(event.clientX - session.startX);
        const ady = Math.abs(event.clientY - session.startY);
        if (adx < INTENT_PX && ady < INTENT_PX) return;
        if (ady >= adx) {
          // Vertical-first: let the page scroll.
          sessionRef.current = null;
          return;
        }
        session.pending = false;
        try {
          node.setPointerCapture(event.pointerId);
        } catch {
          // iOS may reject capture; we still handle moves while the pointer is down.
        }
        markGrabbing(node, true);
      }

      if (!grabbingRef.current) return;
      event.preventDefault();

      const opts = optionsRef.current;
      const pitchLimit = opts.pitchLimit * DEG;
      // Grab the surface: drag right → that point follows right (yaw+).
      yawTargetRef.current += dx * opts.yawSensitivity;
      pitchTargetRef.current = clamp(
        pitchTargetRef.current + dy * opts.pitchSensitivity,
        -pitchLimit,
        pitchLimit,
      );

      if (!opts.reducedMotion) {
        velYawRef.current = (dx * opts.yawSensitivity) / dt;
        velPitchRef.current = (dy * opts.pitchSensitivity) / dt;
      }

      session.lastX = event.clientX;
      session.lastY = event.clientY;
      session.lastT = now;

      if (!interactedRef.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
        interactedRef.current = true;
        opts.onInteract?.();
      }
    },
    [markGrabbing, surfaceRef],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const node = surfaceRef.current;
      if (!node) return;
      const opts = optionsRef.current;
      if (opts.reducedMotion) {
        velYawRef.current = 0;
        velPitchRef.current = 0;
      }
      endSession(node, event.pointerId);
    },
    [endSession, surfaceRef],
  );

  const onContextMenu = useCallback((event: { preventDefault: () => void }) => {
    event.preventDefault();
  }, []);

  const tick = useCallback((dt: number) => {
    const opts = optionsRef.current;
    const pitchLimit = opts.pitchLimit * DEG;
    const grabbing = grabbingRef.current;

    if (!grabbing && !opts.reducedMotion) {
      const decay = Math.exp(-inertiaDecay(opts.inertia) * dt);
      velYawRef.current *= decay;
      velPitchRef.current *= decay;
      if (Math.abs(velYawRef.current) < 0.0004) velYawRef.current = 0;
      if (Math.abs(velPitchRef.current) < 0.0004) velPitchRef.current = 0;
      yawTargetRef.current += velYawRef.current * dt;
      pitchTargetRef.current = clamp(
        pitchTargetRef.current + velPitchRef.current * dt,
        -pitchLimit,
        pitchLimit,
      );
    } else if (opts.reducedMotion && !grabbing) {
      velYawRef.current = 0;
      velPitchRef.current = 0;
    }

    const follow = grabbing ? 18 : 11;
    yawRef.current = damp(yawRef.current, yawTargetRef.current, follow, dt);
    pitchRef.current = damp(pitchRef.current, pitchTargetRef.current, follow, dt);
    gripRef.current = damp(gripRef.current, gripTargetRef.current, 14, dt);
  }, []);

  useEffect(() => {
    const node = surfaceRef.current;
    if (!node) return;
    const preventScrollWhenGrabbing = (event: TouchEvent) => {
      if (!grabbingRef.current) return;
      event.preventDefault();
    };
    node.addEventListener("touchmove", preventScrollWhenGrabbing, {
      passive: false,
    });
    return () => {
      node.removeEventListener("touchmove", preventScrollWhenGrabbing);
    };
  }, [surfaceRef]);

  return {
    yawRef,
    pitchRef,
    gripRef,
    grabbingRef,
    tick,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onLostPointerCapture: onPointerUp,
      onContextMenu,
    },
  };
}
