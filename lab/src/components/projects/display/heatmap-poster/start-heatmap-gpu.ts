import type { StorageBuffer } from "vgpu";
import { MASK_FADE_MS, PACK_MAX } from "./constants";
import type { HeatmapDriver, StartHeatmapOptions } from "./start-heatmap";
import type { PackedMask } from "./types";
import shader from "./heatmap.wgsl";
import { heatmapTrace } from "./trace";

const MAX_TEXELS = PACK_MAX * PACK_MAX;

function writePack(buffer: StorageBuffer, pack: PackedMask): void {
  const count = pack.width * pack.height;
  const bytes = pack.pixels.subarray(0, count * 4);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const src = new Uint32Array(count);
  for (let i = 0; i < count; i++) {
    src[i] = view.getUint32(i * 4, true);
  }
  buffer.write(src);
}

/**
 * Optional WebGPU wash. Must never be imported from the demo entry.
 * A failed adapter, compile, or hung init leaves Canvas 2D running.
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
      clearColor: [0.07, 0.03, 0.18, 1],
      label: "heatmap-poster",
    });

    const fallbackBuf = vgpu.storage(device, MAX_TEXELS * 4, "read");
    const depthBuf = vgpu.storage(device, MAX_TEXELS * 4, "read");
    const empty = new Uint32Array(1);
    fallbackBuf.write(empty);
    depthBuf.write(empty);

    const look = lookRef.current;
    const wash = vgpu.effect(device, shader, {
      label: "heatmap-poster-wash",
      set: {
        u: {
          heat: [...look.heat],
          pad0: 0,
          mid: [...look.mid],
          pad1: 0,
          ground: [...look.ground],
          pad2: 0,
          grain: look.grain,
          frequency: look.wave,
          speed: look.speed,
          time: 0,
          maskMix: 0,
          reducedMotion: 0,
          packWidth: 1,
          packHeight: 1,
        },
        fallbackPack: fallbackBuf,
        depthPack: depthBuf,
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
    let maskMix = 0;
    let maskMixTarget = 0;
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
      if (reduced) {
        maskMix = maskMixTarget;
      } else if (maskMix !== maskMixTarget) {
        const step = dt * (1000 / MASK_FADE_MS);
        if (maskMix < maskMixTarget) maskMix = Math.min(maskMixTarget, maskMix + step);
        else maskMix = Math.max(maskMixTarget, maskMix - step);
      }
      const current = lookRef.current;
      wash.set({
        u: {
          heat: [...current.heat],
          pad0: 0,
          mid: [...current.mid],
          pad1: 0,
          ground: [...current.ground],
          pad2: 0,
          grain: current.grain,
          frequency: current.wave,
          speed: current.speed,
          time,
          maskMix,
          reducedMotion: reduced ? 1 : 0,
          packWidth,
          packHeight,
        },
        fallbackPack: fallbackBuf,
        depthPack: depthBuf,
      });
      frame.pass(canvasSurface, wash);
    });

    return {
      setFallback: (pack) => {
        packWidth = pack.width;
        packHeight = pack.height;
        writePack(fallbackBuf, pack);
      },
      setDepth: (pack) => {
        if (pack) writePack(depthBuf, pack);
      },
      setMaskMixTarget: (mix) => {
        maskMixTarget = mix;
      },
      snapMaskMix: (mix) => {
        maskMix = mix;
        maskMixTarget = mix;
      },
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
