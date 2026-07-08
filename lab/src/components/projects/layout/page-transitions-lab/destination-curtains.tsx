"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { paintPageTexture } from "./paint-page-texture";
import type { PageSample } from "./types";

type DestinationCurtainsProps = {
  sample: PageSample;
  count: number;
  staggerMs: number;
  durationMs: number;
  playKey: number;
  reducedMotion: boolean;
};

/**
 * Always-visible curtain strips painted with the destination page.
 * Used as the reliable mobile/WebGL-fallback path so the reveal is never blank.
 */
export function DestinationCurtains({
  sample,
  count,
  staggerMs,
  durationMs,
  playKey,
  reducedMotion,
}: DestinationCurtainsProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const strips = Math.max(3, Math.min(16, Math.round(count)));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let objectUrl: string | null = null;

    const paint = () => {
      const width = Math.max(host.clientWidth, host.offsetWidth);
      const height = Math.max(host.clientHeight, host.offsetHeight);
      if (width < 8 || height < 8) return false;
      try {
        const canvas = document.createElement("canvas");
        paintPageTexture(canvas, sample, width, height);
        canvas.toBlob(
          (blob) => {
            if (cancelled || !blob) return;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            objectUrl = URL.createObjectURL(blob);
            setBgUrl(objectUrl);
          },
          "image/jpeg",
          0.92,
        );
        return true;
      } catch {
        setBgUrl(null);
        return true;
      }
    };

    // Wait a frame so explicit frame height has resolved before measuring.
    const raf = window.requestAnimationFrame(() => {
      if (!paint()) {
        // Retry once after layout settles (Safari min-height edge cases).
        window.requestAnimationFrame(() => {
          paint();
        });
      }
    });

    const observer = new ResizeObserver(() => {
      paint();
    });
    observer.observe(host);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [sample, playKey]);

  return (
    <div
      ref={hostRef}
      className="ptl-curtain-fallback ptl-curtain-fallback--destination"
      aria-hidden="true"
      data-ready={bgUrl ? "true" : "false"}
    >
      {Array.from({ length: strips }, (_, index) => (
        <span
          key={`${playKey}-${index}`}
          style={
            {
              backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
              backgroundSize: `${strips * 100}% 100%`,
              backgroundPosition: `${-index * 100}% 0%`,
              animationDuration: `${reducedMotion ? 140 : durationMs}ms`,
              animationDelay: `${reducedMotion ? 0 : index * staggerMs}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
