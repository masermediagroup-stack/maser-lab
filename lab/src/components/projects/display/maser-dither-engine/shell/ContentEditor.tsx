"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { ComponentId } from "../types";
import type {
  AvatarMode,
  AvatarPresence,
  AvatarShape,
  AvatarSizeToken,
  ComponentContent,
  ImageAspectId,
  ImageFitMode,
  ScrollbarOrientation,
} from "../content/types";
import {
  SourceImageField,
  type SourceImageValue,
} from "./SourceImageField";
import { cn } from "@/lib/utils";

type ContentEditorProps = {
  componentId: ComponentId;
  value: ComponentContent;
  onChange: (next: ComponentContent) => void;
  source: SourceImageValue;
  onSourceChange: (next: SourceImageValue) => void;
  idPrefix?: string;
};

type Field =
  | { kind: "text"; key: keyof ComponentContent; label: string }
  | {
      kind: "number";
      key: keyof ComponentContent;
      label: string;
      min: number;
      max: number;
      step: number;
    }
  | { kind: "navItems"; label: string }
  | { kind: "activeIndex"; label: string }
  | {
      kind: "choice";
      key: keyof ComponentContent;
      label: string;
      options: { id: string; label: string }[];
    }
  | { kind: "toggle"; key: keyof ComponentContent; label: string };

function fieldsFor(id: ComponentId): Field[] {
  switch (id) {
    case "button":
      return [
        { kind: "text", key: "buttonLabel", label: "Button label" },
        { kind: "text", key: "buttonIcon", label: "Icon / suffix" },
      ];
    case "badge":
      return [{ kind: "text", key: "badgeLabel", label: "Badge label" }];
    case "card":
      return [
        { kind: "text", key: "cardTitle", label: "Title" },
        { kind: "text", key: "cardSubtitle", label: "Subtitle" },
        { kind: "text", key: "cardDescription", label: "Description" },
        { kind: "text", key: "cardButtonLabel", label: "Button" },
      ];
    case "navigation":
      return [
        { kind: "text", key: "navBrand", label: "Brand" },
        { kind: "navItems", label: "Nav items (comma-separated)" },
        { kind: "activeIndex", label: "Active item" },
      ];
    case "hero-background":
      return [
        { kind: "text", key: "heroEyebrow", label: "Eyebrow / brand" },
        { kind: "text", key: "heroTitle", label: "Hero title" },
        { kind: "text", key: "heroDescription", label: "Description" },
      ];
    case "section-background":
      return [
        { kind: "text", key: "sectionTitle", label: "Heading" },
        { kind: "text", key: "sectionBody", label: "Body" },
      ];
    case "input":
      return [
        { kind: "text", key: "inputLabel", label: "Label" },
        { kind: "text", key: "inputPlaceholder", label: "Placeholder" },
      ];
    case "progress-bar":
      return [
        { kind: "text", key: "progressLabel", label: "Label" },
        {
          kind: "number",
          key: "progressValue",
          label: "Value %",
          min: 0,
          max: 100,
          step: 1,
        },
      ];
    case "loader":
      return [{ kind: "text", key: "loaderLabel", label: "Status label" }];
    case "avatar":
      return [
        { kind: "text", key: "avatarInitials", label: "Initials" },
        {
          kind: "choice",
          key: "avatarShape",
          label: "Shape",
          options: [
            { id: "circle", label: "Circle" },
            { id: "rounded", label: "Rounded" },
            { id: "square", label: "Square" },
          ],
        },
        {
          kind: "choice",
          key: "avatarMode",
          label: "Mode",
          options: [
            { id: "initials", label: "Initials" },
            { id: "image", label: "Image" },
            { id: "placeholder", label: "Placeholder" },
          ],
        },
        {
          kind: "choice",
          key: "avatarSize",
          label: "Size",
          options: [
            { id: "sm", label: "SM" },
            { id: "md", label: "MD" },
            { id: "lg", label: "LG" },
            { id: "xl", label: "XL" },
          ],
        },
        { kind: "toggle", key: "avatarShowPresence", label: "Presence" },
        {
          kind: "choice",
          key: "avatarPresence",
          label: "Status",
          options: [
            { id: "online", label: "Online" },
            { id: "away", label: "Away" },
            { id: "busy", label: "Busy" },
            { id: "offline", label: "Offline" },
          ],
        },
        {
          kind: "number",
          key: "avatarBorder",
          label: "Border",
          min: 0,
          max: 6,
          step: 1,
        },
        {
          kind: "number",
          key: "avatarGlow",
          label: "Glow",
          min: 0,
          max: 1,
          step: 0.01,
        },
      ];
    case "image-frame":
      return [
        { kind: "text", key: "imageCaption", label: "Caption" },
        {
          kind: "choice",
          key: "imageAspect",
          label: "Aspect",
          options: [
            { id: "1:1", label: "1:1" },
            { id: "4:3", label: "4:3" },
            { id: "3:2", label: "3:2" },
            { id: "16:9", label: "16:9" },
            { id: "9:16", label: "9:16" },
            { id: "21:9", label: "21:9" },
            { id: "custom", label: "Custom" },
          ],
        },
        {
          kind: "number",
          key: "imageCustomAspect",
          label: "Custom ratio",
          min: 0.4,
          max: 3,
          step: 0.01,
        },
        {
          kind: "choice",
          key: "imageFit",
          label: "Fit",
          options: [
            { id: "cover", label: "Cover" },
            { id: "contain", label: "Contain" },
            { id: "fill", label: "Fill" },
          ],
        },
        {
          kind: "number",
          key: "imageRadius",
          label: "Radius",
          min: 0,
          max: 48,
          step: 1,
        },
        {
          kind: "number",
          key: "imagePadding",
          label: "Padding",
          min: 0,
          max: 32,
          step: 1,
        },
        {
          kind: "number",
          key: "imageBorder",
          label: "Border",
          min: 0,
          max: 8,
          step: 1,
        },
        {
          kind: "number",
          key: "imageOverlay",
          label: "Material overlay",
          min: 0,
          max: 1,
          step: 0.01,
        },
      ];
    case "scrollbar":
      return [
        { kind: "text", key: "scrollbarNote", label: "Note" },
        {
          kind: "choice",
          key: "scrollbarOrientation",
          label: "Orientation",
          options: [
            { id: "vertical", label: "Vertical" },
            { id: "horizontal", label: "Horizontal" },
          ],
        },
        {
          kind: "number",
          key: "scrollbarThickness",
          label: "Thickness",
          min: 8,
          max: 28,
          step: 1,
        },
        {
          kind: "number",
          key: "scrollbarRadius",
          label: "Radius",
          min: 0,
          max: 16,
          step: 1,
        },
        {
          kind: "number",
          key: "scrollbarProgress",
          label: "Start progress",
          min: 0,
          max: 1,
          step: 0.01,
        },
      ];
    default:
      return [];
  }
}

/**
 * Live content editor — updates adapter copy instantly without remounting the material.
 * Always includes source-image upload so any adapter can dither a photo.
 */
export function ContentEditor({
  componentId,
  value,
  onChange,
  source,
  onSourceChange,
  idPrefix = "mde-content",
}: ContentEditorProps) {
  const fields = fieldsFor(componentId);

  const setText = (key: keyof ComponentContent, text: string) => {
    onChange({ ...value, [key]: text });
  };

  return (
    <div className="mde-content-editor">
      <SourceImageField
        value={source}
        onChange={onSourceChange}
        idPrefix={`${idPrefix}-source`}
        emphasize={componentId === "image-frame" || componentId === "avatar"}
      />
      {fields.map((field) => {
        if (field.kind === "text") {
          const current = String(value[field.key] ?? "");
          return (
            <div key={field.key} className="mde-field">
              <Label htmlFor={`${idPrefix}-${field.key}`}>{field.label}</Label>
              <input
                id={`${idPrefix}-${field.key}`}
                className="mde-text-input"
                type="text"
                value={current}
                onChange={(e) => setText(field.key, e.target.value)}
              />
            </div>
          );
        }
        if (field.kind === "number") {
          if (
            field.key === "imageCustomAspect" &&
            value.imageAspect !== "custom"
          ) {
            return null;
          }
          const current = Number(value[field.key] ?? 0);
          return (
            <div key={field.key} className="mde-field">
              <div className="mde-field__row">
                <Label htmlFor={`${idPrefix}-${field.key}`}>{field.label}</Label>
                <span>{current}</span>
              </div>
              <Slider
                id={`${idPrefix}-${field.key}`}
                min={field.min}
                max={field.max}
                step={field.step}
                value={[current]}
                onValueChange={(vals) => {
                  const next = Array.isArray(vals) ? vals[0] : vals;
                  if (typeof next !== "number") return;
                  onChange({ ...value, [field.key]: next });
                }}
              />
            </div>
          );
        }
        if (field.kind === "choice") {
          const current = String(value[field.key] ?? "");
          return (
            <div key={field.key} className="mde-field">
              <span className="mde-field__label">{field.label}</span>
              <div className="mde-preset-row" role="group" aria-label={field.label}>
                {field.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={cn(
                      "mde-chip",
                      current === opt.id && "mde-chip--active",
                    )}
                    aria-pressed={current === opt.id}
                    onClick={() => {
                      if (field.key === "avatarShape") {
                        onChange({
                          ...value,
                          avatarShape: opt.id as AvatarShape,
                        });
                      } else if (field.key === "avatarMode") {
                        onChange({
                          ...value,
                          avatarMode: opt.id as AvatarMode,
                        });
                      } else if (field.key === "avatarSize") {
                        onChange({
                          ...value,
                          avatarSize: opt.id as AvatarSizeToken,
                        });
                      } else if (field.key === "avatarPresence") {
                        onChange({
                          ...value,
                          avatarPresence: opt.id as AvatarPresence,
                        });
                      } else if (field.key === "imageAspect") {
                        onChange({
                          ...value,
                          imageAspect: opt.id as ImageAspectId,
                        });
                      } else if (field.key === "imageFit") {
                        onChange({
                          ...value,
                          imageFit: opt.id as ImageFitMode,
                        });
                      } else if (field.key === "scrollbarOrientation") {
                        onChange({
                          ...value,
                          scrollbarOrientation: opt.id as ScrollbarOrientation,
                        });
                      }
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          );
        }
        if (field.kind === "toggle") {
          const on = Boolean(value[field.key]);
          return (
            <div key={field.key} className="mde-field">
              <div className="mde-field__row">
                <Label htmlFor={`${idPrefix}-${field.key}`}>{field.label}</Label>
                <button
                  type="button"
                  id={`${idPrefix}-${field.key}`}
                  className={cn("mde-chip", on && "mde-chip--active")}
                  aria-pressed={on}
                  onClick={() =>
                    onChange({ ...value, [field.key]: !on } as ComponentContent)
                  }
                >
                  {on ? "On" : "Off"}
                </button>
              </div>
            </div>
          );
        }
        if (field.kind === "navItems") {
          return (
            <div key="navItems" className="mde-field">
              <Label htmlFor={`${idPrefix}-navItems`}>{field.label}</Label>
              <input
                id={`${idPrefix}-navItems`}
                className="mde-text-input"
                type="text"
                value={value.navItems.join(", ")}
                onChange={(e) =>
                  onChange({
                    ...value,
                    navItems: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          );
        }
        return (
          <div key="activeIndex" className="mde-field">
            <div className="mde-field__row">
              <Label htmlFor={`${idPrefix}-active`}>{field.label}</Label>
              <span>{value.navActiveIndex + 1}</span>
            </div>
            <Slider
              id={`${idPrefix}-active`}
              min={0}
              max={Math.max(0, value.navItems.length - 1)}
              step={1}
              value={[value.navActiveIndex]}
              onValueChange={(vals) => {
                const next = Array.isArray(vals) ? vals[0] : vals;
                if (typeof next !== "number") return;
                onChange({ ...value, navActiveIndex: next });
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
