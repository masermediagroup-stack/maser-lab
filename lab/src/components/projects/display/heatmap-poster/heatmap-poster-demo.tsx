"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import {
  DemoBackButton,
  DemoControlMenu,
  LabButton,
  LabColor,
  LabControlGroup,
  LabRange,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import {
  HEATMAP_DEFAULTS,
  HEATMAP_GROUND,
  HEATMAP_HEAT,
  HEATMAP_MID,
  MAX_UPLOAD_BYTES,
} from "./constants";
import { HEATMAP_COPY } from "./copy";
import { HeatmapPoster } from "./heatmap-poster";
import { heatmapTrace } from "./trace";
import type {
  HeatmapFileStatus,
  HeatmapFormat,
  HeatmapImageSource,
  HeatmapLook,
  HeatmapReadStatus,
} from "./types";
import "./tokens.css";
import "./demo.css";

const SAMPLES = [
  { id: "photo", src: "/assets/heatmap-poster/sample-photo.svg", label: "Photo" },
  { id: "logo", src: "/assets/heatmap-poster/sample-logo.svg", label: "Logo" },
  { id: "lines", src: "/assets/heatmap-poster/sample-lines.svg", label: "Lines" },
] as const;

function rgbToHex(rgb: readonly [number, number, number]): string {
  const hex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${hex(rgb[0])}${hex(rgb[1])}${hex(rgb[2])}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = hex.replace("#", "");
  return [
    parseInt(n.slice(0, 2), 16) / 255,
    parseInt(n.slice(2, 4), 16) / 255,
    parseInt(n.slice(4, 6), 16) / 255,
  ];
}

export function HeatmapPosterDemo() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [reduced, setReduced] = useState(false);
  const [format, setFormat] = useState<HeatmapFormat>("9-16");
  const [look, setLook] = useState<HeatmapLook>(HEATMAP_DEFAULTS);
  const [image, setImage] = useState<HeatmapImageSource | null>(null);
  const [readStatus, setReadStatus] = useState<HeatmapReadStatus>("idle");
  const [fileStatus, setFileStatus] = useState<HeatmapFileStatus>("ok");
  const [caption, setCaption] = useState("");
  const heldFileRef = useRef<File | null>(null);

  const setSample = (src: string) => {
    heldFileRef.current = null;
    heatmapTrace("sample:selected", { src });
    setFileStatus("ok");
    setReadStatus("reading");
    setImage({ src });
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    heldFileRef.current = file;
    heatmapTrace("file:selected", {
      name: file.name,
      type: file.type,
      size: file.size,
    });
    if (file.size > MAX_UPLOAD_BYTES) {
      setFileStatus("too-big");
      setReadStatus("idle");
      setImage(null);
      return;
    }
    setFileStatus("ok");
    setReadStatus("reading");
    setImage({ src: file.name, file });
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    heatmapTrace("file:drop", {
      count: event.dataTransfer.files.length,
      name: file?.name,
      type: file?.type,
    });
    onFile(file);
  };

  const railStatus =
    fileStatus === "error"
      ? HEATMAP_COPY.fileError
      : fileStatus === "too-big"
        ? HEATMAP_COPY.tooBig
        : "";

  const patch = (partial: Partial<HeatmapLook>) => {
    setLook((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div
      className="heatmap-demo maser-lab relative min-h-screen"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        data-heatmap-file-input=""
        aria-label={HEATMAP_COPY.upload}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            heldFileRef.current = file;
            onFile(file);
          }
          event.currentTarget.value = "";
        }}
      />
      <label className="lab-demo-field heatmap-stage" htmlFor={inputId}>
        <HeatmapPoster
          format={format}
          look={look}
          image={image}
          forceReducedMotion={reduced}
          readStatus={readStatus}
          fileStatus={fileStatus}
          onReadStatus={setReadStatus}
          onFileStatus={setFileStatus}
          caption={caption || undefined}
        />
      </label>

      <DemoControlMenu>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <DemoBackButton />
          <ReducedMotionToggle
            enabled={reduced}
            onToggle={() => setReduced((value) => !value)}
          />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight">{HEATMAP_COPY.title}</h1>
        </div>
        <LabButton
          type="button"
          variant="accent"
          onClick={() => inputRef.current?.click()}
        >
          {image ? HEATMAP_COPY.replace : HEATMAP_COPY.upload}
        </LabButton>
        {railStatus ? (
          <p className="heatmap-status heatmap-rail-status">{railStatus}</p>
        ) : null}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Size">
          <LabButton
            type="button"
            variant={format === "9-16" ? "accent" : "ghost"}
            aria-pressed={format === "9-16"}
            onClick={() => setFormat("9-16")}
          >
            {HEATMAP_COPY.size916}
          </LabButton>
          <LabButton
            type="button"
            variant={format === "a4" ? "accent" : "ghost"}
            aria-pressed={format === "a4"}
            onClick={() => setFormat("a4")}
          >
            {HEATMAP_COPY.sizeA4}
          </LabButton>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Samples">
          {SAMPLES.map((sample) => (
            <LabButton
              key={sample.id}
              type="button"
              variant="outline"
              onClick={() => setSample(sample.src)}
            >
              {sample.label}
            </LabButton>
          ))}
        </div>
        <LabControlGroup label="Caption">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={HEATMAP_COPY.captionPlaceholder}
            className="min-h-11 w-full rounded-none border border-[var(--lab-border)] bg-[var(--lab-surface)] px-2 font-mono text-xs text-[var(--lab-text-primary)] placeholder:text-[var(--lab-text-muted)]"
          />
        </LabControlGroup>
        <LabControlGroup label="Stops">
          <LabColor
            id="heatmap-heat"
            label={HEATMAP_COPY.heat}
            value={rgbToHex(look.heat)}
            onChange={(hex) => patch({ heat: hexToRgb(hex) })}
          />
          <LabColor
            id="heatmap-mid"
            label={HEATMAP_COPY.mid}
            value={rgbToHex(look.mid)}
            onChange={(hex) => patch({ mid: hexToRgb(hex) })}
          />
          <LabColor
            id="heatmap-ground"
            label={HEATMAP_COPY.ground}
            value={rgbToHex(look.ground)}
            onChange={(hex) => patch({ ground: hexToRgb(hex) })}
          />
        </LabControlGroup>
        <LabControlGroup label="Wash">
          <LabRange
            id="heatmap-speed"
            label={HEATMAP_COPY.speed}
            min={0}
            max={1}
            step={0.01}
            value={look.speed}
            display={look.speed.toFixed(2)}
            onChange={(speed) => patch({ speed })}
          />
          <LabRange
            id="heatmap-wave"
            label={HEATMAP_COPY.wave}
            min={0}
            max={1}
            step={0.01}
            value={look.wave}
            display={look.wave.toFixed(2)}
            onChange={(wave) => patch({ wave })}
          />
        </LabControlGroup>
        <LabButton
          type="button"
          variant="outline"
          onClick={() => {
            patch({
              heat: HEATMAP_HEAT,
              mid: HEATMAP_MID,
              ground: HEATMAP_GROUND,
              speed: HEATMAP_DEFAULTS.speed,
              wave: HEATMAP_DEFAULTS.wave,
            });
          }}
        >
          Replay
        </LabButton>
      </DemoControlMenu>
    </div>
  );
}
