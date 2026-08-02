"use client";

import { useId, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export type SourceImageValue = {
  url: string | null;
  lightMix: number;
};

type SourceImageFieldProps = {
  value: SourceImageValue;
  onChange: (next: SourceImageValue) => void;
  idPrefix?: string;
};

/**
 * Upload a photo to drive surface luminance — dither / material / lighting
 * then recreate the look on top of the image.
 */
export function SourceImageField({
  value,
  onChange,
  idPrefix = "mde-source",
}: SourceImageFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const clear = () => {
    if (value.url?.startsWith("blob:")) {
      URL.revokeObjectURL(value.url);
    }
    onChange({ ...value, url: null });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="mde-source-field">
      <div className="mde-field">
        <Label htmlFor={inputId}>Source image</Label>
        <p className="mde-source-field__hint">
          Upload a photo — the engine dithers its luminance with your current
          algorithm, material, and lighting.
        </p>
        <div className="mde-source-field__row">
          <input
            ref={inputRef}
            id={inputId}
            className="mde-source-field__input"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (value.url?.startsWith("blob:")) {
                URL.revokeObjectURL(value.url);
              }
              const url = URL.createObjectURL(file);
              onChange({ ...value, url });
            }}
          />
          {value.url ? (
            <Button type="button" variant="outline" size="sm" onClick={clear}>
              Clear
            </Button>
          ) : null}
        </div>
        {value.url ? (
          <div className="mde-source-field__preview" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value.url} alt="" />
            <span>Dithering active</span>
          </div>
        ) : null}
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
