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
  expandedHeight?: number;
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
  expandedHeight = EXPANDED_HEIGHT,
}: GestureOptions) {
  const height = useMotionValue(defaultOpen ? expandedHeight : COLLAPSED_HEIGHT);
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
  const expandedRef = useRef(expandedHeight);

  useEffect(() => {
    expandedRef.current = expandedHeight;
  }, [expandedHeight]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  const range = Math.max(1, expandedHeight - COLLAPSED_HEIGHT);

  const commitOpen = useCallback((next: boolean) => {
    openRef.current = next;
    setOpenState(next);
    onOpenChangeRef.current?.(next);
  }, []);

  const springTo = useCallback(
    (target: number, velocity: number) => {
      springRef.current?.stop();
      const max = expandedRef.current;
      if (reducedMotion) {
        height.set(target);
        progress.set(target >= max - 0.5 ? 1 : 0);
        setSettling(false);
        commitOpen(target >= max - 0.5);
        return;
      }
      setSettling(true);
      const collapsing = target <= COLLAPSED_HEIGHT + 0.5;
      springRef.current = animate(height, target, {
        type: "spring",
        stiffness: 380,
        // Collapse is overdamped so the fill cannot bounce off the heading.
        damping: collapsing ? 42 : velocity > 400 ? 26 : 34,
        mass: 0.85,
        velocity: velocity / 1000,
        onUpdate: (latest) => {
          if (latest < COLLAPSED_HEIGHT) height.set(COLLAPSED_HEIGHT);
        },
        onComplete: () => {
          if (height.get() < COLLAPSED_HEIGHT) height.set(COLLAPSED_HEIGHT);
          setSettling(false);
          commitOpen(target >= max - 0.5);
        },
      });
      commitOpen(target >= max - 0.5);
    },
    [commitOpen, height, progress, reducedMotion],
  );

  useEffect(() => {
    if (openProp === undefined) return;
    if (openProp === openRef.current && !draggingRef.current) return;
    springTo(openProp ? expandedRef.current : COLLAPSED_HEIGHT, 0);
  }, [openProp, springTo]);

  useEffect(() => {
    if (draggingRef.current) return;
    if (!openRef.current) return;
    const max = expandedHeight;
    if (Math.abs(height.get() - max) < 1) return;
    height.set(max);
  }, [expandedHeight, height]);

  useEffect(() => {
    const unsub = height.on("change", (value) => {
      if (value < COLLAPSED_HEIGHT) {
        height.set(COLLAPSED_HEIGHT);
        progress.set(0);
        return;
      }
      progress.set(Math.max(0, Math.min(1, (value - COLLAPSED_HEIGHT) / range)));
    });
    return unsub;
  }, [height, progress, range]);

  useEffect(() => {
    if (!dragging) return;
    const preventScroll = (event: TouchEvent) => {
      event.preventDefault();
    };
    document.addEventListener("touchmove", preventScroll, { passive: false });
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    return () => {
      document.removeEventListener("touchmove", preventScroll);
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
    };
  }, [dragging]);

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
      event.preventDefault();
      const dy = event.clientY - startYRef.current;
      if (Math.abs(dy) > DRAG_CLICK_PX) movedRef.current = true;
      const now = performance.now();
      const dt = Math.max(8, now - lastTRef.current);
      const inst = ((event.clientY - lastYRef.current) / dt) * 1000;
      velocityRef.current = velocityRef.current * 0.65 + inst * 0.35;
      lastYRef.current = event.clientY;
      lastTRef.current = now;
      height.set(
        constrainHeight(
          startHRef.current + dy,
          COLLAPSED_HEIGHT,
          expandedRef.current,
        ),
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
      springTo(
        nextOpen ? expandedRef.current : COLLAPSED_HEIGHT,
        velocityRef.current,
      );
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
    springTo(openRef.current ? COLLAPSED_HEIGHT : expandedRef.current, 0);
  }, [springTo]);

  const collapse = useCallback(() => {
    springTo(COLLAPSED_HEIGHT, 0);
  }, [springTo]);

  const expand = useCallback(() => {
    springTo(expandedRef.current, 0);
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
