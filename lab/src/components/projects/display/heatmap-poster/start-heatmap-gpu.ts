import {
  FIELD_CONTOUR,
  FIELD_INNER_GLOW,
  FIELD_OUTER_GLOW,
  HEATMAP_GROUND,
} from "./constants";
import type { HeatmapDriver, StartHeatmapOptions } from "./start-heatmap";
import type { PackedMask } from "./types";
import shader from "./heatmap.wgsl";
import { heatmapTrace } from "./trace";

const WHITE_PACK: PackedMask = {
  width: 1,
  height: 1,
  pixels: new Uint8ClampedArray([255, 255, 255, 255]),
  frame: null,
};

type GpuQueue = {
  copyExternalImageToTexture: (
    source: { source: ImageData },
    dest: { texture: { destroy?: () => void } },
    size: readonly [number, number],
  ) => void;
  writeTexture: (
    dest: { texture: { destroy?: () => void } },
    data: Uint8Array,
    layout: { bytesPerRow: number; rowsPerImage: number },
    size: { width: number; height: number },
  ) => void;
};

type VgpuTexture = { gpu: { destroy?: () => void } };

type GpuHandle = {
  device: {
    gpu: { queue: GpuQueue };
    createTexture: (opts: {
      size: readonly [number, number];
      format: string;
      usage: number;
      label?: string;
    }) => VgpuTexture;
  };
  dispose: () => void;
};

const TEXTURE_BINDING = 0x04;
const COPY_DST = 0x02;

function packImageData(pack: PackedMask): ImageData {
  const copy = new Uint8ClampedArray(pack.pixels);
  return new ImageData(copy, pack.width, pack.height);
}

function paddedTexels(pack: PackedMask): { data: Uint8Array; bytesPerRow: number } {
  const w = Math.max(1, pack.width);
  const h = Math.max(1, pack.height);
  const bytesPerRow = Math.ceil((w * 4) / 256) * 256;
  const data = new Uint8Array(bytesPerRow * h);
  const src = pack.pixels;
  for (let y = 0; y < h; y += 1) {
    data.set(src.subarray(y * w * 4, (y + 1) * w * 4), y * bytesPerRow);
  }
  return { data, bytesPerRow };
}

function uploadPackedTexture(
  gpu: GpuHandle,
  texture: VgpuTexture,
  pack: PackedMask,
): void {
  const w = Math.max(1, pack.width);
  const h = Math.max(1, pack.height);
  const queue = gpu.device.gpu.queue;
  const imageData = packImageData(pack);
  try {
    queue.copyExternalImageToTexture(
      { source: imageData },
      { texture: texture.gpu },
      [w, h],
    );
    return;
  } catch {
    // ImageData copy is missing on some queues; write padded rows.
  }
  const padded = paddedTexels(pack);
  queue.writeTexture(
    { texture: texture.gpu },
    padded.data,
    { bytesPerRow: padded.bytesPerRow, rowsPerImage: h },
    { width: w, height: h },
  );
}

function makePackTexture(gpu: GpuHandle, pack: PackedMask): VgpuTexture {
  const w = Math.max(1, pack.width);
  const h = Math.max(1, pack.height);
  return gpu.device.createTexture({
    size: [w, h],
    format: "rgba8unorm",
    usage: TEXTURE_BINDING | COPY_DST,
    label: "heatmap-pack",
  });
}

function fieldUniforms(
  look: StartHeatmapOptions["lookRef"]["current"],
  extras: {
    time: number;
    reduced: boolean;
    packWidth: number;
    packHeight: number;
    canvasWidth: number;
    canvasHeight: number;
  },
) {
  return {
    heat: [...look.heat],
    pad0: 0,
    mid: [...look.mid],
    pad1: 0,
    ground: [...look.ground],
    pad2: 0,
    grain: look.grain,
    frequency: look.wave,
    speed: look.speed,
    time: extras.time,
    contour: FIELD_CONTOUR,
    innerGlow: FIELD_INNER_GLOW,
    outerGlow: FIELD_OUTER_GLOW,
    reducedMotion: extras.reduced ? 1 : 0,
    packWidth: extras.packWidth,
    packHeight: extras.packHeight,
    canvasWidth: extras.canvasWidth,
    canvasHeight: extras.canvasHeight,
  };
}

/**
 * Optional WebGPU wash. Must never be imported from the demo entry.
 * Call only on a canvas that has never had getContext('2d').
 * After silhouette pack, setSourceImage uploads the packed RGB texture.
 */
export async function tryStartGpuDriver(
  opts: StartHeatmapOptions,
  cancelled: () => boolean,
): Promise<HeatmapDriver | null> {
  const { canvas, lookRef, reducedRef } = opts;
  let loop: { stop: () => void } | undefined;
  let gpu: GpuHandle | undefined;

  try {
    const vgpu = await import("vgpu");
    if (cancelled()) return null;
    const device = (await vgpu.init()) as unknown as GpuHandle;
    heatmapTrace("gpu:init:ok");
    if (cancelled()) {
      device.dispose();
      return null;
    }
    gpu = device;

    const canvasSurface = vgpu.surface(device as never, canvas, {
      dpr: [1, 2] as [number, number],
      alphaMode: "opaque",
      clearColor: [...HEATMAP_GROUND, 1] as [number, number, number, number],
      label: "heatmap-poster",
    });

    let fieldTex = makePackTexture(device, WHITE_PACK);
    uploadPackedTexture(device, fieldTex, WHITE_PACK);

    const fieldSamp = vgpu.sampler(device as never, {
      minFilter: "linear",
      magFilter: "linear",
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge",
    });

    const look = lookRef.current;
    const wash = vgpu.effect(device as never, shader, {
      label: "heatmap-poster-wash",
      set: {
        u: fieldUniforms(look, {
          time: 0,
          reduced: false,
          packWidth: 1,
          packHeight: 1,
          canvasWidth: Math.max(1, canvas.clientWidth || 1),
          canvasHeight: Math.max(1, canvas.clientHeight || 1),
        }),
        fieldTex,
        fieldSamp,
      },
    });

    await wash.compile(canvasSurface);
    heatmapTrace("gpu:compile:ok");
    if (cancelled()) {
      device.dispose();
      return null;
    }

    let packWidth = 1;
    let packHeight = 1;
    let time = 0;
    let last = performance.now();
    let disposed = false;

    loop = vgpu.frameLoop(device as never, (frame) => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const reduced = reducedRef.current;
      if (!reduced) time += dt;
      const current = lookRef.current;
      wash.set({
        u: fieldUniforms(current, {
          time,
          reduced,
          packWidth,
          packHeight,
          canvasWidth: Math.max(1, canvas.width || canvas.clientWidth || 1),
          canvasHeight: Math.max(1, canvas.height || canvas.clientHeight || 1),
        }),
        fieldTex,
        fieldSamp,
      });
      frame.pass(canvasSurface, wash);
    });

    const setSourceImage = (pack: PackedMask) => {
      packWidth = pack.width;
      packHeight = pack.height;
      const next = makePackTexture(device, pack);
      uploadPackedTexture(device, next, pack);
      fieldTex.gpu.destroy?.();
      fieldTex = next;
      wash.set({ fieldTex, fieldSamp });
      heatmapTrace("gpu:setSourceImage", { w: pack.width, h: pack.height });
    };

    return {
      setFallback: setSourceImage,
      setPack: setSourceImage,
      setSourceImage,
      dispose: () => {
        disposed = true;
        loop?.stop();
        device.dispose();
      },
    };
  } catch (err) {
    console.error("[heatmap] gpu:fail", err);
    heatmapTrace("gpu:fail", {
      message: err instanceof Error ? err.message : String(err),
    });
    loop?.stop();
    gpu?.dispose();
    return null;
  }
}
