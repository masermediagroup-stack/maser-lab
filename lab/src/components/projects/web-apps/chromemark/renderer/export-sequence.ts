import { Quaternion, type PerspectiveCamera, type Scene, type WebGLRenderer } from "three";
import type { ChromeMarkSettings } from "../types";
import { LogoLoadError } from "../types";
import { rotationForFrame, sequenceFrameCount } from "./animation";
import { exportStillPng } from "./export-still";
import { padFrameIndex } from "./read-pixels";

export type SequenceProgress = {
  current: number;
  total: number;
};

export type SequenceExportOptions = {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  settings: ChromeMarkSettings;
  start: Quaternion;
  filenameBase?: string;
  signal?: AbortSignal;
  onProgress?: (progress: SequenceProgress) => void;
  setOrientation: (q: Quaternion) => void;
};

export type SequenceFileMap = Record<string, Uint8Array>;

export async function exportPngSequence(
  options: SequenceExportOptions,
): Promise<{ files: SequenceFileMap; frameCount: number; settingsJson: string }> {
  const {
    renderer,
    scene,
    camera,
    settings,
    start,
    filenameBase = "chromemark-logo",
    signal,
    onProgress,
    setOrientation,
  } = options;

  const width = settings.export.width;
  const height = settings.export.height;
  const fps = settings.export.sequenceFps;
  const duration = settings.export.sequenceDuration;
  const total = sequenceFrameCount(fps, duration);
  const files: SequenceFileMap = {};
  const previous = start.clone();

  const animation = {
    ...settings.animation,
    turns: settings.export.sequenceTurns,
  };

  try {
    for (let i = 0; i < total; i++) {
      if (signal?.aborted) {
        throw new LogoLoadError("cancelled", "Export cancelled.");
      }
      const q = rotationForFrame({
        start,
        settings: animation,
        frameIndex: i,
        totalFrames: total,
      });
      setOrientation(q);
      const blob = await exportStillPng({ renderer, scene, camera, width, height });
      files[`${filenameBase}-${padFrameIndex(i)}.png`] = new Uint8Array(
        await blob.arrayBuffer(),
      );
      onProgress?.({ current: i + 1, total });
      await yieldToUi();
    }
  } finally {
    setOrientation(previous);
  }

  const settingsJson = JSON.stringify(
    {
      width,
      height,
      fps,
      duration,
      frameCount: total,
      turns: settings.export.sequenceTurns,
      axis: settings.animation.axis,
      chromePreset: settings.material.preset,
      roughness: settings.material.roughness,
      metalness: settings.material.metalness,
      extrusion: settings.geometry,
    },
    null,
    2,
  );

  return { files, frameCount: total, settingsJson };
}

export async function zipSequenceFiles(
  files: SequenceFileMap,
  settingsJson: string,
): Promise<Blob> {
  const { zipSync, strToU8 } = await import("fflate");
  const zipped = zipSync(
    {
      ...files,
      "settings.json": strToU8(settingsJson),
    },
    { level: 6 },
  );
  return new Blob([zipped.buffer as ArrayBuffer], { type: "application/zip" });
}

function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
