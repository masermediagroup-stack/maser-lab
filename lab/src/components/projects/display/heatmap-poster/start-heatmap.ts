import {
  FIELD_CONTOUR,
  FIELD_INNER_GLOW,
  FIELD_OUTER_GLOW,
} from "./constants";
import { applyWave, heatFromPaperPack, waveBand } from "./field";
import type { HeatmapLook, PackedMask } from "./types";
import { heatmapTrace } from "./trace";

export type HeatmapDriver = {
  setFallback: (pack: PackedMask) => void;
  setPack: (pack: PackedMask) => void;
  setSourceImage: (pack: PackedMask) => void;
  dispose: () => void;
};

export type StartHeatmapOptions = {
  canvas: HTMLCanvasElement;
  lookRef: { current: HeatmapLook };
  reducedRef: { current: boolean };
  onReady?: () => void;
};

function mixRgb(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function heatLut(
  t: number,
  heat: readonly [number, number, number],
  mid: readonly [number, number, number],
  ground: readonly [number, number, number],
): [number, number, number] {
  const x = Math.min(1, Math.max(0, t));
  if (x < 0.55) return mixRgb(ground, mid, x / 0.55);
  return mixRgb(mid, heat, (x - 0.55) / 0.45);
}

function hash21(x: number, y: number): number {
  const px = x * 0.1031;
  const py = y * 0.1031;
  const pz = px;
  const fx = px - Math.floor(px);
  const fy = py - Math.floor(py);
  const fz = pz - Math.floor(pz);
  const n = fx + fy * fz;
  return (fx + fy) * n - Math.floor((fx + fy) * n);
}

function whitePack(): PackedMask {
  return {
    width: 1,
    height: 1,
    pixels: new Uint8ClampedArray([255, 255, 255, 255]),
    frame: null,
  };
}

function samplePack(
  pack: PackedMask,
  u: number,
  v: number,
): [number, number, number] {
  const x = Math.min(
    pack.width - 1,
    Math.max(0, Math.floor(u * pack.width)),
  );
  const y = Math.min(
    pack.height - 1,
    Math.max(0, Math.floor(v * pack.height)),
  );
  const i = (y * pack.width + x) * 4;
  return [
    (pack.pixels[i] ?? 255) / 255,
    (pack.pixels[i + 1] ?? 255) / 255,
    (pack.pixels[i + 2] ?? 255) / 255,
  ];
}

export function startCanvas2d(
  canvas: HTMLCanvasElement,
  lookRef: { current: HeatmapLook },
  reducedRef: { current: boolean },
  onReady?: () => void,
): HeatmapDriver {
  const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
  if (!ctx) {
    console.error("[heatmap] canvas2d:fail", "getContext('2d') returned null");
    heatmapTrace("canvas2d:fail", { reason: "no-2d-context" });
  }
  let disposed = false;
  let pack: PackedMask = whitePack();
  let last = performance.now();
  let time = 0;
  let raf = 0;
  let hidden = false;

  const onHidden = () => {
    hidden = document.visibilityState === "hidden";
  };
  document.addEventListener("visibilitychange", onHidden);

  const scratch = document.createElement("canvas");
  const sctx = scratch.getContext("2d");
  const work = 320;

  const paint = (advanceTime: boolean, dt: number) => {
    if (disposed || !ctx || !sctx) return;
    const reduced = reducedRef.current;
    if (advanceTime && !reduced) time += dt;

    const w = Math.max(1, canvas.clientWidth || canvas.width || 1);
    const h = Math.max(1, canvas.clientHeight || canvas.height || 1);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const look = lookRef.current;
    ctx.fillStyle = `rgb(${Math.round(look.ground[0] * 255)} ${Math.round(look.ground[1] * 255)} ${Math.round(look.ground[2] * 255)})`;
    ctx.fillRect(0, 0, w, h);

    if (scratch.width !== work || scratch.height !== work) {
      scratch.width = work;
      scratch.height = work;
    }
    const out = sctx.createImageData(work, work);
    const t = reduced ? 0 : time;
    for (let y = 0; y < work; y += 1) {
      const uvY = (y + 0.5) / work;
      const band = waveBand(uvY, t, look.speed, look.wave, reduced);
      for (let x = 0; x < work; x += 1) {
        const uvX = (x + 0.5) / work;
        const [pr, pg, pb] = samplePack(pack, uvX, uvY);
        let heat = heatFromPaperPack(
          pr,
          pg,
          pb,
          FIELD_CONTOUR,
          FIELD_INNER_GLOW,
          FIELD_OUTER_GLOW,
        );
        heat = applyWave(heat, band);
        const rgb = heatLut(heat, look.heat, look.mid, look.ground);
        const n = hash21(x + t * 0.15, y);
        const i = (y * work + x) * 4;
        out.data[i] = Math.round(
          Math.min(1, Math.max(0, rgb[0] + (n - 0.5) * look.grain * 0.045)) * 255,
        );
        out.data[i + 1] = Math.round(
          Math.min(1, Math.max(0, rgb[1] + (n - 0.5) * look.grain * 0.045)) * 255,
        );
        out.data[i + 2] = Math.round(
          Math.min(1, Math.max(0, rgb[2] + (n - 0.5) * look.grain * 0.045)) * 255,
        );
        out.data[i + 3] = 255;
      }
    }
    sctx.putImageData(out, 0, 0);

    const scale = Math.min(w / work, h / work);
    const dw = work * scale;
    const dh = work * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(scratch, dx, dy, dw, dh);
  };

  const sampleCenter = (): [number, number, number] | null => {
    if (!ctx || canvas.width < 1 || canvas.height < 1) return null;
    try {
      const p = ctx.getImageData(
        Math.floor(canvas.width / 2),
        Math.floor(canvas.height / 2),
        1,
        1,
      ).data;
      return [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0];
    } catch (err) {
      console.error("[heatmap] field:sample:fail", err);
      heatmapTrace("field:sample:fail", {
        message: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  };

  const tick = (now: number) => {
    if (disposed || !ctx) return;
    raf = window.requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (hidden) return;
    paint(true, dt);
  };

  raf = window.requestAnimationFrame(tick);
  heatmapTrace("canvas2d:loop");
  onReady?.();

  const setPack = (next: PackedMask) => {
    pack = next;
    heatmapTrace("driver:setSourceImage", { w: next.width, h: next.height });
    paint(false, 0);
    heatmapTrace("field:presented", {
      w: canvas.width,
      h: canvas.height,
      packW: next.width,
      packH: next.height,
      sample: sampleCenter(),
    });
  };

  return {
    setFallback: setPack,
    setPack,
    setSourceImage: setPack,
    dispose: () => {
      disposed = true;
      window.cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onHidden);
    },
  };
}

/**
 * vgpu first on a virgin canvas. Canvas 2D only if the adapter/compile fails.
 * Never call getContext('2d') before this — WebGPU cannot take over a 2D canvas.
 */
export async function startHeatmapField(
  opts: StartHeatmapOptions,
  cancelled: () => boolean,
): Promise<HeatmapDriver | null> {
  const { tryStartGpuDriver } = await import("./start-heatmap-gpu");
  if (cancelled()) return null;
  const gpu = await tryStartGpuDriver(opts, cancelled);
  if (cancelled()) {
    gpu?.dispose();
    return null;
  }
  if (gpu) {
    heatmapTrace("gpu:used");
    opts.onReady?.();
    return gpu;
  }
  heatmapTrace("canvas2d:start", { reason: "gpu-unavailable" });
  const parent = opts.canvas.parentElement;
  let canvas = opts.canvas;
  if (parent) {
    const fresh = document.createElement("canvas");
    fresh.className = opts.canvas.className;
    fresh.setAttribute("aria-hidden", "true");
    parent.replaceChild(fresh, opts.canvas);
    canvas = fresh;
  }
  return startCanvas2d(
    canvas,
    opts.lookRef,
    opts.reducedRef,
    opts.onReady,
  );
}
