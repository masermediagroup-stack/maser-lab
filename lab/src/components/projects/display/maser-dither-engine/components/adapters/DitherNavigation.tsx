"use client";

import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import { DEFAULT_COMPONENT_CONTENT } from "../../content/types";
import { cn } from "@/lib/utils";

type Ptr = { x: number; y: number; down: boolean };

function readPtr(e: ReactPointerEvent<HTMLElement>, down: boolean): Ptr {
  const r = e.currentTarget.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) / r.width,
    y: (e.clientY - r.top) / r.height,
    down,
  };
}

/**
 * Mark canvas is small — nav-wide pointer drives the brand light.
 */
export function DitherNavigation({
  params,
  animation,
  interaction,
  color,
  light,
  dither,
  content,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const [pointer, setPointer] = useState<Ptr | null>(null);
  const c = { ...DEFAULT_COMPONENT_CONTENT, ...content };

  return (
    <nav
      className={cn("mde-adapter mde-adapter--nav", className)}
      aria-label="Dither navigation preview"
      onPointerMove={(e) => {
        if (reducedMotion) return;
        setPointer(readPtr(e, pointer?.down ?? e.buttons > 0));
      }}
      onPointerDown={(e) => {
        if (reducedMotion) return;
        setPointer(readPtr(e, true));
      }}
      onPointerUp={(e) => {
        if (reducedMotion) return;
        setPointer(readPtr(e, false));
      }}
      onPointerLeave={() => setPointer(null)}
    >
      <div className="mde-adapter-nav__mark" aria-hidden>
        <SurfaceCanvas
          params={params}
          animation={animation}
          interaction={interaction}
          color={color}
          light={light}
          dither={dither}
          pointer={pointer}
          reducedMotion={reducedMotion}
          aria-label=""
        />
      </div>
      <span className="mde-adapter-nav__brand">{c.navBrand}</span>
      <div className="mde-adapter-nav__links">
        {c.navItems.map((item, i) => (
          <a
            key={`${item}-${i}`}
            href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
            className={cn(i === c.navActiveIndex && "mde-adapter-nav__link--active")}
            aria-current={i === c.navActiveIndex ? "page" : undefined}
          >
            {item}
          </a>
        ))}
      </div>
    </nav>
  );
}
