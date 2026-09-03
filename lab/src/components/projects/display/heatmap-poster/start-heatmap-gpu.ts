import type { StorageBuffer } from "vgpu";
import {
  FIELD_CONTOUR,
  FIELD_INNER_GLOW,
  FIELD_OUTER_GLOW,
  FIELD_PACK_MAX,
  HEATMAP_GROUND,
} from "./constants";
import type { HeatmapDriver, StartHeatmapOptions } from "./start-heatmap";
import type { PackedMask } from "./types";
import shader from "./heatmap.wgsl";
import { heatmapTrace } from "./trace";

const MAX_TEXELS = FIELD_PACK_MAX * FIELD_PACK_MAX;
const WHITE_TEXEL = 0xffffffff;

function writePack(buffer: StorageBuffer, pack: PackedMask): void {
  const count = Math.min(pack.width * pack.height, MAX_TEXELS);
  const bytes = pack.pixels.subarray(0, count * 4);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const src = new Uint32Array(count);
  for (let i = 0; i < count; i++) {
    src[i] = view.getUint32(i * 4, true);
  }
  buffer.write(src);
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
 */
export async function tryStartGpuDriver(
  opts: StartHeatmapOptions,
  cancelled: () => boolean,
): Promise<HeatmapDriver | null> {
  const { canvas, lookRef, reducedRef } = opts;
  let loop: { stop: () => void } | undefined;
  let gpu: { dispose: () => void } | undefined;
  let io: IntersectionObserver | undefined;

  try {
    const vgpu = await import("vgpu");
    if (cancelled()) return null;
    const device = await vgpu.init();
    heatmapTrace("gpu:init:ok");
    if (cancelled()) {
      device.dispose();
      return null;
    }
    gpu = device;

    const canvasSurface = vgpu.surface(device, canvas, {
      dpr: [1, 2] as [number, number],
      alphaMode: "opaque",
      clearColor: [...HEATMAP_GROUND, 1] as [number, number, number, number],
      label: "heatmap-poster",
    });

    const fieldBuf = vgpu.storage(device, MAX_TEXELS * 4, "read");
    fieldBuf.write(new Uint32Array([WHITE_TEXEL]));

    const look = lookRef.current;
    const wash = vgpu.effect(device, shader, {
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
        fieldPack: fieldBuf,
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
    let visible = true;
    let disposed = false;

    io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
    });
    io.observe(canvas);

    loop = vgpu.frameLoop(device, (frame) => {
      if (disposed || !visible) return;
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
        fieldPack: fieldBuf,
      });
      frame.pass(canvasSurface, wash);
    });

    const setPack = (pack: PackedMask) => {
      packWidth = pack.width;
      packHeight = pack.height;
      writePack(fieldBuf, pack);
      heatmapTrace("gpu:setPack", { w: pack.width, h: pack.height });
    };

    return {
      setFallback: setPack,
      setPack,
      dispose: () => {
        disposed = true;
        loop?.stop();
        device.dispose();
        io?.disconnect();
      },
    };
  } catch (err) {
    console.error("[heatmap] gpu:fail", err);
    heatmapTrace("gpu:fail", {
      message: err instanceof Error ? err.message : String(err),
    });
    loop?.stop();
    gpu?.dispose();
    io?.disconnect();
    return null;
  }
}
