"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { ComponentId } from "../types";
import type { ComponentContent } from "../content/types";
import {
  SourceImageField,
  type SourceImageValue,
} from "./SourceImageField";

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
  | { kind: "number"; key: keyof ComponentContent; label: string; min: number; max: number; step: number }
  | { kind: "navItems"; label: string }
  | { kind: "activeIndex"; label: string };

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
      return [{ kind: "text", key: "avatarInitials", label: "Initials" }];
    case "image-frame":
      return [{ kind: "text", key: "imageCaption", label: "Caption" }];
    case "scrollbar":
      return [
        { kind: "text", key: "scrollbarNote", label: "Note" },
        {
          kind: "number",
          key: "scrollbarThickness",
          label: "Thickness",
          min: 4,
          max: 24,
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
