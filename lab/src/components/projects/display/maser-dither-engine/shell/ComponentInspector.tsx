"use client";

import type { ComponentContent, ChromeCorner } from "../content/types";
import type { ComponentId } from "../types";
import { StudioSlider } from "./studio/StudioSlider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ComponentInspectorProps = {
  componentId: ComponentId;
  content: ComponentContent;
  onChange: (next: ComponentContent) => void;
  idPrefix?: string;
  className?: string;
};

const CORNERS: { id: ChromeCorner; label: string }[] = [
  { id: "pill", label: "Pill" },
  { id: "rounded", label: "Rounded" },
  { id: "soft", label: "Soft" },
  { id: "square", label: "Square" },
];

/**
 * Dock / sheet target for component chrome: padding, radius, corner, size.
 * Reuses content fields — does not fork adapter layout props.
 */
export function ComponentInspector({
  componentId,
  content,
  onChange,
  idPrefix = "mde-inspect",
  className,
}: ComponentInspectorProps) {
  const patch = <K extends keyof ComponentContent>(
    key: K,
    value: ComponentContent[K],
  ) => onChange({ ...content, [key]: value });

  const showChrome =
    componentId === "button" ||
    componentId === "badge" ||
    componentId === "card" ||
    componentId === "navigation";
  const showImage =
    componentId === "image-frame" || componentId === "card";
  const showAvatar = componentId === "avatar";
  const showScrollbar = componentId === "scrollbar";

  if (!showChrome && !showImage && !showAvatar && !showScrollbar) {
    return (
      <div className={cn("mde-inspector", className)}>
        <p className="mde-field__hint">
          No padding / radius chrome for this component — edit copy in Content
          below.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("mde-inspector", className)}
      aria-label="Component inspector"
    >
      <header className="mde-inspector__head">
        <h3 className="mde-inspector__title">Inspector</h3>
        <p className="mde-field__hint">
          Padding, radius, and chrome for the active component.
        </p>
      </header>

      {showChrome ? (
        <div className="mde-field">
          <Label>Corner</Label>
          <div className="mde-chip-row" role="group" aria-label="Corner style">
            {CORNERS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={cn(
                  "mde-chip",
                  content.chromeCorner === c.id && "mde-chip--active",
                )}
                aria-pressed={content.chromeCorner === c.id}
                onClick={() => patch("chromeCorner", c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showImage ? (
        <>
          <StudioSlider
            id={`${idPrefix}-radius`}
            label="Radius"
            value={content.imageRadius}
            min={0}
            max={48}
            step={1}
            unit="px"
            defaultValue={12}
            onChange={(v) => patch("imageRadius", v)}
          />
          <StudioSlider
            id={`${idPrefix}-padding`}
            label="Padding"
            value={content.imagePadding}
            min={0}
            max={32}
            step={1}
            unit="px"
            defaultValue={0}
            onChange={(v) => patch("imagePadding", v)}
          />
          <StudioSlider
            id={`${idPrefix}-border`}
            label="Border"
            value={content.imageBorder}
            min={0}
            max={8}
            step={1}
            unit="px"
            defaultValue={1}
            onChange={(v) => patch("imageBorder", v)}
          />
        </>
      ) : null}

      {showAvatar ? (
        <>
          <StudioSlider
            id={`${idPrefix}-avatar-border`}
            label="Border"
            value={content.avatarBorder}
            min={0}
            max={8}
            step={1}
            unit="px"
            defaultValue={2}
            onChange={(v) => patch("avatarBorder", v)}
          />
          <StudioSlider
            id={`${idPrefix}-avatar-glow`}
            label="Glow"
            value={content.avatarGlow}
            min={0}
            max={1}
            step={0.01}
            defaultValue={0.35}
            onChange={(v) => patch("avatarGlow", v)}
          />
        </>
      ) : null}

      {showScrollbar ? (
        <>
          <StudioSlider
            id={`${idPrefix}-sb-thickness`}
            label="Thickness"
            value={content.scrollbarThickness}
            min={8}
            max={28}
            step={1}
            unit="px"
            defaultValue={14}
            onChange={(v) => patch("scrollbarThickness", v)}
          />
          <StudioSlider
            id={`${idPrefix}-sb-radius`}
            label="Radius"
            value={content.scrollbarRadius}
            min={0}
            max={16}
            step={1}
            unit="px"
            defaultValue={8}
            onChange={(v) => patch("scrollbarRadius", v)}
          />
        </>
      ) : null}
    </div>
  );
}
