"use client";

import { useRef } from "react";
import { SAMPLE_FIXTURES } from "../defaults";
import type { LogoInfo } from "../types";

type LogoUploaderProps = {
  logo: LogoInfo | null;
  busy: boolean;
  onFile: (file: File) => void;
  onReset: () => void;
};

export function LogoUploader({ logo, busy, onFile, onReset }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="chromemark-toolbar">
      <input
        ref={inputRef}
        type="file"
        accept=".svg,.png,image/svg+xml,image/png"
        className="chromemark-sr-only"
        aria-label="Upload logo"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        className="chromemark-btn"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {logo ? "Replace" : "Upload logo"}
      </button>
      <button type="button" className="chromemark-btn" onClick={onReset}>
        Reset all
      </button>
      {SAMPLE_FIXTURES.map((sample) => (
        <button
          key={sample.id}
          type="button"
          className="chromemark-btn"
          title={`Load ${sample.label}`}
          onClick={async () => {
            const response = await fetch(sample.href);
            const blob = await response.blob();
            const file = new File([blob], sample.filename, { type: blob.type });
            onFile(file);
          }}
        >
          {sample.label}
        </button>
      ))}
    </div>
  );
}
