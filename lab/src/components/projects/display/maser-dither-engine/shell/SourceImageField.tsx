"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SourceImageValue = {
  url: string | null;
  lightMix: number;
};

type SourceImageFieldProps = {
  value: SourceImageValue;
  onChange: (next: SourceImageValue) => void;
  idPrefix?: string;
  emphasize?: boolean;
};

/**
 * Upload a photo to drive surface luminance — dither / material / lighting
 * then recreate the look on top of the image.
 */
export function SourceImageField({
  value,
  onChange,
  idPrefix = "mde-source",
  emphasize = false,
}: SourceImageFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const clear = () => {
    if (value.url?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(value.url);
      } catch {
        /* ignore */
      }
    }
    onChange({ ...value, url: null });
    if (inputRef.current) inputRef.current.value = "";
  };

  const applyFile = (file: File | null | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (value.url?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(value.url);
      } catch {
        /* ignore */
      }
    }
    onChange({ ...value, url: URL.createObjectURL(file) });
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    applyFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div
      className={cn(
        "mde-source-field",
        emphasize && "mde-source-field--emphasize",
      )}
    >
      <div className="mde-field">
        <Label htmlFor={inputId}>Source image</Label>
        <p className="mde-source-field__hint">
          Drag & drop or click to upload. The engine dithers luminance with your
          current algorithm, material, and lighting.
        </p>
        <div
          className={cn(
            "mde-source-field__drop",
            dragging && "mde-source-field__drop--active",
            value.url && "mde-source-field__drop--filled",
          )}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            id={inputId}
            className="mde-source-field__input"
            type="file"
            accept="image/*"
            onChange={(e) => applyFile(e.target.files?.[0])}
          />
          <div className="mde-source-field__row">
            <label htmlFor={inputId} className="mde-btn mde-btn--primary">
              {value.url ? "Replace image" : "Choose image"}
            </label>
            {value.url ? (
              <Button type="button" variant="outline" size="sm" onClick={clear}>
                Remove
              </Button>
            ) : null}
          </div>
          {value.url ? (
            <div className="mde-source-field__preview" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value.url} alt="" />
              <span>Dithering active</span>
            </div>
          ) : (
            <p className="mde-source-field__drop-hint">
              PNG, JPG, WebP · local upload
            </p>
          )}
        </div>
      </div>
      <div className="mde-field">
        <div className="mde-field__row">
          <Label htmlFor={`${idPrefix}-light-mix`}>Light on image</Label>
          <span>{value.lightMix.toFixed(2)}</span>
        </div>
        <Slider
          id={`${idPrefix}-light-mix`}
          min={0}
          max={1}
          step={0.01}
          value={[value.lightMix]}
          disabled={!value.url}
          onValueChange={(vals) => {
            const next = Array.isArray(vals) ? vals[0] : vals;
            if (typeof next !== "number") return;
            onChange({ ...value, lightMix: next });
          }}
        />
      </div>
    </div>
  );
}
