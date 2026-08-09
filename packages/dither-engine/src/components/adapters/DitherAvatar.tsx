"use client";

import {
  useId,
  useRef,
  type CSSProperties,
  type ChangeEvent,
} from "react";
import { SurfaceCanvas } from "../../react/SurfaceCanvas";
import type { DitherAdapterProps } from "../../types";
import {
  AVATAR_SIZE_PX,
  DEFAULT_COMPONENT_CONTENT,
} from "../../content/types";
import { cn } from "../../lib/utils";
import {
  overlayLabelStyle,
  useAdapterPointer,
} from "./adapterInteraction";

/**
 * True avatar chrome — shape, size, initials / image / placeholder, presence.
 */
export function DitherAvatar({
  params,
  animation,
  interaction,
  color,
  light,
  dither,
  material,
  content,
  sourceUrl,
  sourceLightMix,
  onSourceChange,
  reducedMotion,
  className,
}: DitherAdapterProps) {
  const { pointer, handlers } = useAdapterPointer(reducedMotion);
  const c = { ...DEFAULT_COMPONENT_CONTENT, ...content };
  const size = AVATAR_SIZE_PX[c.avatarSize] ?? 80;
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const showImage = c.avatarMode === "image" && Boolean(sourceUrl);
  const showInitials =
    c.avatarMode === "initials" || (c.avatarMode === "image" && !sourceUrl);
  const showPlaceholder = c.avatarMode === "placeholder";

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onSourceChange) return;
    onSourceChange({ url: URL.createObjectURL(file) });
  };

  return (
    <div
      className={cn(
        "mde-adapter mde-adapter--avatar",
        `mde-adapter--avatar-${c.avatarShape}`,
        className,
      )}
      role="img"
      aria-label={
        showImage
          ? "Avatar image"
          : showPlaceholder
            ? "Avatar placeholder"
            : `Avatar ${c.avatarInitials}`
      }
      style={
        {
          width: size,
          height: size,
          borderWidth: Math.max(0, c.avatarBorder),
          boxShadow:
            c.avatarGlow > 0.01
              ? `0 0 ${12 + c.avatarGlow * 28}px color-mix(in oklab, #fff ${Math.round(c.avatarGlow * 45)}%, transparent)`
              : undefined,
        } as CSSProperties
      }
      {...handlers}
    >
      <div className="mde-adapter-avatar__fill">
        <SurfaceCanvas
          params={{
            ...params,
            animationSpeed: reducedMotion
              ? 0
              : Math.max(params.animationSpeed, 1),
          }}
          animation={animation}
          interaction={interaction}
          color={color}
          light={light}
          dither={dither}
          material={material}
          pointer={pointer}
          sourceUrl={showImage ? sourceUrl : null}
          sourceLightMix={sourceLightMix}
          reducedMotion={reducedMotion}
          aria-label="Avatar material"
        />
      </div>

      {showInitials ? (
        <span
          className="mde-adapter-avatar__initials"
          style={overlayLabelStyle(c)}
          aria-hidden
        >
          {c.avatarInitials.slice(0, 3)}
        </span>
      ) : null}

      {showPlaceholder ? (
        <span className="mde-adapter-avatar__placeholder" aria-hidden>
          <svg viewBox="0 0 24 24" width="42%" height="42%" fill="currentColor">
            <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2.25c-4.14 0-7.5 2.24-7.5 5v.75h15v-.75c0-2.76-3.36-5-7.5-5Z" />
          </svg>
        </span>
      ) : null}

      {c.avatarShowPresence ? (
        <span
          className={cn(
            "mde-adapter-avatar__presence",
            `mde-adapter-avatar__presence--${c.avatarPresence}`,
          )}
          aria-label={`Status ${c.avatarPresence}`}
        />
      ) : null}

      {onSourceChange && c.avatarMode === "image" ? (
        <>
          <label
            htmlFor={inputId}
            className="mde-adapter-avatar__upload"
            title="Upload avatar image"
          >
            <span className="sr-only">Upload avatar image</span>
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onFile}
          />
        </>
      ) : null}
    </div>
  );
}
