"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  isAssetRef,
  putImageFile,
} from "../lib/asset-store";
import { useResolvedDisplayUrl } from "../react/useResolvedDisplayUrl";
import { StudioSlider } from "./studio/StudioSlider";

export type SourceImageValue = {
  url: string | null;
  lightMix: number;
};

type SourceImageFieldProps = {
  value: SourceImageValue;
  onChange: (next: SourceImageValue) => void;
  idPrefix?: string;
  emphasize?: boolean;
  /** Override the default “Source image” label. */
  label?: string;
  /** Override the default hint under the label. */
  hint?: string;
  /** When false, hide the light-mix slider (default true). */
  showLightMix?: boolean;
};

/**
 * Upload a photo to drive surface luminance — dither / material / lighting
 * then recreate the look on top of the image.
 * Persists uploads to IndexedDB (`mde-asset:`) so lab projects survive reload.
 */
export function SourceImageField({
  value,
  onChange,
  idPrefix = "mde-source",
  emphasize = false,
  label = "Source image",
  hint = "Drag & drop or click to upload. The engine dithers luminance with your current algorithm, material, and lighting.",
  showLightMix = true,
}: SourceImageFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewUrl = useResolvedDisplayUrl(value.url);

  const clear = () => {
    if (value.url?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(value.url);
      } catch {
        /* ignore */
      }
    }
    setError(null);
    onChange({ ...value, url: null });
    if (inputRef.current) inputRef.current.value = "";
  };

  const applyFile = async (file: File | null | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (value.url?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(value.url);
      } catch {
        /* ignore */
      }
    }
    setBusy(true);
    setError(null);
    try {
      const ref = await putImageFile(file);
      onChange({ ...value, url: ref });
    } catch {
      setError("Could not store image. Try a smaller file.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void applyFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div
      className={cn(
        "mde-source-field",
        emphasize && "mde-source-field--emphasize",
      )}
    >
      <div className="mde-field">
        <Label htmlFor={inputId}>{label}</Label>
        <p className="mde-source-field__hint">{hint}</p>
        <div
          className={cn(
            "mde-source-field__drop",
            dragging && "mde-source-field__drop--active",
            value.url && "mde-source-field__drop--filled",
            busy && "mde-source-field__drop--busy",
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
            disabled={busy}
            onChange={(e) => void applyFile(e.target.files?.[0])}
          />
          <div className="mde-source-field__row">
            <label
              htmlFor={inputId}
              className={cn(
                "mde-btn mde-btn--primary",
                busy && "mde-btn--disabled",
              )}
              aria-disabled={busy}
            >
              {busy
                ? "Saving…"
                : value.url
                  ? "Replace image"
                  : "Choose image"}
            </label>
            {value.url ? (
              <button
                type="button"
                className="mde-btn mde-btn--compact mde-source-field__remove"
                onClick={clear}
                disabled={busy}
              >
                Remove photo
              </button>
            ) : null}
          </div>
          {previewUrl ? (
            <div className="mde-source-field__preview" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="" />
              <span>
                {isAssetRef(value.url) ? "Saved locally" : "Dithering active"}
              </span>
            </div>
          ) : (
            <p className="mde-source-field__drop-hint">
              PNG, JPG, WebP · stored in this browser
            </p>
          )}
          {error ? (
            <p className="mde-field__hint" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
      {showLightMix ? (
        <StudioSlider
          id={`${idPrefix}-light-mix`}
          label="Light on image"
          value={value.lightMix}
          min={0}
          max={1}
          step={0.01}
          defaultValue={0.45}
          onChange={(lightMix) => onChange({ ...value, lightMix })}
          disabled={!value.url}
        />
      ) : null}
    </div>
  );
}
