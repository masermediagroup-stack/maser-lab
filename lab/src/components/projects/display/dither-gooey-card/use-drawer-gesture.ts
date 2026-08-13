"use client";

import {
  animate,
  useMotionValue,
  type AnimationPlaybackControls,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import {
  COLLAPSED_HEIGHT,
  DRAG_CLICK_PX,
  EXPANDED_HEIGHT,
  OPEN_THRESHOLD,
} from "./constants";

type GestureOptions = {
  reducedMotion: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** Rubber-band only past the open ceiling. Never shrink below collapsed. */
function constrainHeight(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) {
    const overflow = value - max;
    return max + overflow / (1 + overflow / 72);
  }
  return value;
}

export function useDrawerGesture({
  reducedMotion,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: GestureOptions) {
  const height = useMotionValue(defaultOpen ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT);
  const progress = useMotionValue(defaultOpen ? 1 : 0);
  const [open, setOpenState] = useState(defaultOpen);
  const [dragging, setDragging] = useState(false);
  const [settling, setSettling] = useState(false);

  const openRef = useRef(open);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHRef = useRef(COLLAPSED_HEIGHT);
  const lastYRef = useRef(0);
  const lastTRef = useRef(0);
  const velocityRef = useRef(0);
  const movedRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const springRef = useRef<AnimationPlaybackControls | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  const skipClickRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  const range = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;

  const commitOpen = useCallback((next: boolean) => {
    openRef.current = next;
    setOpenState(next);
    onOpenChangeRef.current?.(next);
  }, []);

  const springTo = useCallback(
    (target: number, velocity: number) => {
      springRef.current?.stop();
      if (reducedMotion) {
        height.set(target);
        progress.set(target === EXPANDED_HEIGHT ? 1 : 0);
        setSettling(false);
        commitOpen(target === EXPANDED_HEIGHT);
        return;
      }
      setSettling(true);
      springRef.current = animate(height, target, {
        type: "spring",
        stiffness: 380,
        damping: velocity > 400 ? 26 : 34,
        mass: 0.85,
        velocity: velocity / 1000,
        onComplete: () => {
          setSettling(false);
          commitOpen(target === EXPANDED_HEIGHT);
        },
      });
      commitOpen(target === EXPANDED_HEIGHT);
    },
    [commitOpen, height, progress, reducedMotion],
  );

  useEffect(() => {
    if (openProp === undefined) return;
    if (openProp === openRef.current && !draggingRef.current) return;
    springTo(openProp ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT, 0);
  }, [openProp, springTo]);

  useEffect(() => {
    const unsub = height.on("change", (value) => {
      progress.set(Math.max(0, Math.min(1, (value - COLLAPSED_HEIGHT) / range)));
    });
    return unsub;
  }, [height, progress, range]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      pointerIdRef.current = event.pointerId;
      springRef.current?.stop();
      setSettling(false);
      draggingRef.current = true;
      setDragging(true);
      startYRef.current = event.clientY;
      startHRef.current = height.get();
      lastYRef.current = event.clientY;
      lastTRef.current = performance.now();
      velocityRef.current = 0;
      movedRef.current = false;
    },
    [height],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!draggingRef.current) return;
      if (pointerIdRef.current !== event.pointerId) return;
      const dy = event.clientY - startYRef.current;
      if (Math.abs(dy) > DRAG_CLICK_PX) movedRef.current = true;
      const now = performance.now();
      const dt = Math.max(8, now - lastTRef.current);
      const inst = ((event.clientY - lastYRef.current) / dt) * 1000;
      velocityRef.current = velocityRef.current * 0.65 + inst * 0.35;
      lastYRef.current = event.clientY;
      lastTRef.current = now;
      height.set(
        constrainHeight(startHRef.current + dy, COLLAPSED_HEIGHT, EXPANDED_HEIGHT),
      );
    },
    [height],
  );

  const finishGesture = useCallback(
    (event: PointerEvent<HTMLElement>, applySnap: boolean) => {
      if (!draggingRef.current) return;
      if (pointerIdRef.current !== event.pointerId) return;
      draggingRef.current = false;
      setDragging(false);
      pointerIdRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      skipClickRef.current = movedRef.current;
      if (!applySnap || !movedRef.current) return;

      const p = (height.get() - COLLAPSED_HEIGHT) / range;
      const flickOpen = velocityRef.current > 720;
      const flickClose = velocityRef.current < -720;
      const nextOpen = flickClose ? false : flickOpen ? true : p >= OPEN_THRESHOLD;
      springTo(nextOpen ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT, velocityRef.current);
    },
    [height, range, springTo],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      finishGesture(event, true);
    },
    [finishGesture],
  );

  const onPointerCancel = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      finishGesture(event, false);
    },
    [finishGesture],
  );

  const toggle = useCallback(() => {
    springTo(openRef.current ? COLLAPSED_HEIGHT : EXPANDED_HEIGHT, 0);
  }, [springTo]);

  const collapse = useCallback(() => {
    springTo(COLLAPSED_HEIGHT, 0);
  }, [springTo]);

  const expand = useCallback(() => {
    springTo(EXPANDED_HEIGHT, 0);
  }, [springTo]);

  const consumeClick = useCallback(() => {
    if (!skipClickRef.current) return false;
    skipClickRef.current = false;
    return true;
  }, []);

  const handleProps = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };

  return {
    height,
    progress,
    open,
    dragging,
    settling,
    toggle,
    collapse,
    expand,
    consumeClick,
    handleProps,
  };
}
