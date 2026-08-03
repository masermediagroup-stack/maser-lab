"use client";

import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/utils";

export type SheetSnap = "collapsed" | "half" | "expanded" | "fullscreen";

const SNAP_VH: Record<SheetSnap, number> = {
  collapsed: 22,
  half: 42,
  expanded: 58,
  fullscreen: 78,
};

type BottomSheetProps = {
  open: boolean;
  title: string;
  snap: SheetSnap;
  onSnapChange: (snap: SheetSnap) => void;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
};

/**
 * Draggable bottom sheet for mobile editing (collapsed / half / expanded / fullscreen).
 */
export function BottomSheet({
  open,
  title,
  snap,
  onSnapChange,
  onClose,
  children,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartH = useRef(0);
  const [dragH, setDragH] = useState<number | null>(null);

  const heightVh = !open ? SNAP_VH.collapsed : (dragH ?? SNAP_VH[snap]);

  const nearestSnap = useCallback((vh: number): SheetSnap => {
    const entries = Object.entries(SNAP_VH) as [SheetSnap, number][];
    let best: SheetSnap = "half";
    let bestDist = Infinity;
    for (const [key, val] of entries) {
      const d = Math.abs(val - vh);
      if (d < bestDist) {
        bestDist = d;
        best = key;
      }
    }
    return best;
  }, []);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (!open) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragStartY.current = e.clientY;
    dragStartH.current = heightVh;
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (dragStartY.current === 0 && e.buttons === 0) return;
    if (!e.currentTarget.hasPointerCapture?.(e.pointerId) && e.buttons === 0) {
      return;
    }
    const dy = dragStartY.current - e.clientY;
    const next = Math.min(96, Math.max(12, dragStartH.current + (dy / window.innerHeight) * 100));
    setDragH(next);
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const vh = dragH ?? heightVh;
    if (vh < 14 && onClose) {
      onClose();
      setDragH(null);
      return;
    }
    const next = nearestSnap(vh);
    setDragH(null);
    onSnapChange(next);
  };

  if (!open) return null;

  return (
    <div
      ref={sheetRef}
      className={cn("mde-sheet", className)}
      style={{ height: `${heightVh}dvh` }}
      role="dialog"
      aria-label={title}
    >
      <div
        className="mde-sheet__handle"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className="mde-sheet__grab" aria-hidden />
        <div className="mde-sheet__title-row">
          <h2>{title}</h2>
          <div className="mde-sheet__snaps" role="group" aria-label="Sheet size">
            {(["collapsed", "half", "expanded", "fullscreen"] as SheetSnap[]).map(
              (s) => (
                <button
                  key={s}
                  type="button"
                  className={cn(
                    "mde-chip mde-chip--tiny",
                    snap === s && "mde-chip--active",
                  )}
                  aria-pressed={snap === s}
                  onClick={() => onSnapChange(s)}
                >
                  {s[0]!.toUpperCase()}
                </button>
              ),
            )}
          </div>
          {onClose ? (
            <button type="button" className="mde-btn" onClick={onClose}>
              Close
            </button>
          ) : null}
        </div>
      </div>
      <div className="mde-sheet__body">{children}</div>
    </div>
  );
}
