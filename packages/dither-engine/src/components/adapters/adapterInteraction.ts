import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useState } from "react";
import type { ChromeCorner, ComponentContent } from "../../content/types";

export type AdapterPointer = { x: number; y: number; down: boolean };

export function readAdapterPointer(
  e: ReactPointerEvent<HTMLElement>,
  down: boolean,
): AdapterPointer {
  const r = e.currentTarget.getBoundingClientRect();
  const w = Math.max(r.width, 1);
  const h = Math.max(r.height, 1);
  return {
    x: (e.clientX - r.left) / w,
    y: (e.clientY - r.top) / h,
    down,
  };
}

/** Pointer state for dither interaction — skips when reduced motion. */
export function useAdapterPointer(reducedMotion?: boolean) {
  const [pointer, setPointer] = useState<AdapterPointer | null>(null);

  const handlers = {
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      if (reducedMotion) return;
      setPointer(readAdapterPointer(e, pointer?.down ?? e.buttons > 0));
    },
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      if (reducedMotion) return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      setPointer(readAdapterPointer(e, true));
    },
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => {
      if (reducedMotion) return;
      setPointer(readAdapterPointer(e, false));
    },
    onPointerCancel: () => setPointer(null),
    onPointerLeave: () => setPointer(null),
    onContextMenu: (e: { preventDefault: () => void }) => {
      e.preventDefault();
    },
  };

  return { pointer, handlers };
}

export const CORNER_RADIUS_PX: Record<ChromeCorner, number> = {
  pill: 999,
  rounded: 16,
  soft: 8,
  square: 2,
};

export function chromeCornerStyle(
  content: Pick<ComponentContent, "chromeCorner">,
): CSSProperties {
  return {
    ["--mde-chrome-radius" as string]: `${CORNER_RADIUS_PX[content.chromeCorner] ?? 999}px`,
  };
}

export function overlayLabelStyle(
  content: Pick<ComponentContent, "labelColor" | "labelBlend">,
): CSSProperties {
  const solid = content.labelBlend !== "exclusion";
  return {
    color: content.labelColor || "#ffffff",
    mixBlendMode: solid ? "normal" : "exclusion",
  };
}
