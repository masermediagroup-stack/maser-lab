import { MASK_FADE_MS } from "./constants";
import type { HeatmapLook, PackedMask } from "./types";
import { heatmapTrace } from "./trace";

export type HeatmapDriver = {
  setFallback: (pack: PackedMask) => void;
  setDepth: (pack: PackedMask | null) => void;
  /** 0 = luma+edge only, 1 = depth. Starts immediately. No pre-delay. */
  setMaskMixTarget: (mix: number) => void;
  snapMaskMix: (mix: number) => void;
  dispose: () => void;
};

export type StartHeatmapOptions = {
  canvas: HTMLCanvasElement;
  lookRef: { current: HeatmapLook };
  reducedRef: { current: boolean };
  onReady?: () => void;
};

const GPU_BOOT_MS = 2500;

function mixRgb(a: readonly [number, number, number], b: readonly [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
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

function fieldFromPack(r: number, g: number, b: number, frequency: number, time: number, speed: number): number {
  const t = time * speed;
  const wave1 = 0.5 + 0.5 * Math.sin(t);
  const wave2 = 0.5 + 0.5 * Math.sin(t * 1.3 + 1);
  const wave3 = 0.5 + 0.5 * Math.sin(t * 0.7 + 2);
  const contour = r * frequency * 0.35;
  const outerGlow = g * 0.55;
  const innerGlow = b;
  return (
    innerGlow * (0.55 + 0.45 * wave1) +
    outerGlow * (0.25 + 0.2 * wave2) +
    contour * (0.4 + 0.6 * wave3)
  );
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

function startCanvas2d(
  canvas: HTMLCanvasElement,
  lookRef: { current: HeatmapLook },
  reducedRef: { current: boolean },
  onReady?: () => void,
): HeatmapDriver {
  const ctx = canvas.getContext("2d", { alpha: false });
  let disposed = false;
  let fallback: PackedMask = {
    width: 1,
    height: 1,
    pixels: new Uint8ClampedArray([0, 0, 0, 255]),
    frame: null,
  };
  let depth: PackedMask | null = null;
  let maskMix = 0;
  let maskMixTarget = 0;
  let last = performance.now();
  let time = 0;
  let raf = 0;
  let visible = true;

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
  });
  io.observe(canvas);

  const onHidden = () => {
    visible = document.visibilityState !== "hidden" && visible;
  };
  document.addEventListener("visibilitychange", onHidden);

  const scratch = document.createElement("canvas");
  const sctx = scratch.getContext("2d");

  const tick = (now: number) => {
    if (disposed || !ctx) return;
    raf = window.requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible) return;

    const reduced = reducedRef.current;
    if (!reduced) time += dt;
    if (reduced) {
      maskMix = maskMixTarget;
    } else if (maskMix !== maskMixTarget) {
      const step = dt * (1000 / MASK_FADE_MS);
      if (maskMix < maskMixTarget) maskMix = Math.min(maskMixTarget, maskMix + step);
      else maskMix = Math.max(maskMixTarget, maskMix - step);
    }

    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const look = lookRef.current;
    const pw = fallback.width;
    const ph = fallback.height;
    const out = ctx.createImageData(pw, ph);
    const mix = depth && depth.width === fallback.width && depth.height === fallback.height ? maskMix : 0;
    const freq = look.wave;
    const speed = look.speed;
    const t = reduced ? 0 : time;
    for (let i = 0; i < pw * ph; i++) {
      const fr = (fallback.pixels[i * 4] ?? 0) / 255;
      const fg = (fallback.pixels[i * 4 + 1] ?? 0) / 255;
      const fb = (fallback.pixels[i * 4 + 2] ?? 0) / 255;
      let r = fr;
      let g = fg;
      let b = fb;
      if (depth && mix > 0) {
        const dr = (depth.pixels[i * 4] ?? 0) / 255;
        const dg = (depth.pixels[i * 4 + 1] ?? 0) / 255;
        const db = (depth.pixels[i * 4 + 2] ?? 0) / 255;
        r = fr + (dr - fr) * mix;
        g = fg + (dg - fg) * mix;
        b = fb + (db - fb) * mix;
      }
      const heat = fieldFromPack(r, g, b, freq, t, speed);
      const rgb = heatLut(heat, look.heat, look.mid, look.ground);
      const n = hash21((i % pw) + t * 0.15, Math.floor(i / pw));
      out.data[i * 4] = Math.round(Math.min(1, Math.max(0, rgb[0] + (n - 0.5) * look.grain * 0.045)) * 255);
      out.data[i * 4 + 1] = Math.round(Math.min(1, Math.max(0, rgb[1] + (n - 0.5) * look.grain * 0.045)) * 255);
      out.data[i * 4 + 2] = Math.round(Math.min(1, Math.max(0, rgb[2] + (n - 0.5) * look.grain * 0.045)) * 255);
      out.data[i * 4 + 3] = 255;
    }
    if (!sctx) return;
    if (scratch.width !== pw || scratch.height !== ph) {
      scratch.width = pw;
      scratch.height = ph;
    }
    sctx.putImageData(out, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(scratch, 0, 0, canvas.width, canvas.height);
  };

  raf = window.requestAnimationFrame(tick);
  heatmapTrace("canvas2d:loop");
  onReady?.();

  return {
    setFallback: (pack) => {
      fallback = pack;
    },
    setDepth: (pack) => {
      depth = pack;
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
      window.cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onHidden);
    },
  };
}

export function startHeatmap({
  canvas,
  lookRef,
  reducedRef,
  onReady,
}: StartHeatmapOptions): HeatmapDriver {
  heatmapTrace("canvas2d:start", { reason: "cpu-first" });
  const cpu = startCanvas2d(canvas, lookRef, reducedRef, onReady);
  let gpu: HeatmapDriver | undefined;
  let disposed = false;
  let expired = false;
  let pendingFallback: PackedMask | null = null;
  let pendingDepth: PackedMask | null = null;
  let pendingMix = 0;

  const active = () => gpu ?? cpu;

  const expire = window.setTimeout(() => {
    expired = true;
    heatmapTrace("gpu:unused", { reason: "timeout" });
  }, GPU_BOOT_MS);

  void (async () => {
    try {
      const { tryStartGpuDriver } = await import("./start-heatmap-gpu");
      const next = await tryStartGpuDriver(
        { canvas, lookRef, reducedRef },
        () => disposed || expired,
      );
      window.clearTimeout(expire);
      if (disposed || expired || !next) {
        next?.dispose();
        if (!expired) heatmapTrace("gpu:unused", { reason: "fail-or-cancel" });
        return;
      }
      gpu = next;
      cpu.dispose();
      if (pendingFallback) next.setFallback(pendingFallback);
      if (pendingDepth) next.setDepth(pendingDepth);
      next.snapMaskMix(pendingMix);
      heatmapTrace("gpu:takeover");
    } catch (err) {
      window.clearTimeout(expire);
      console.error("[heatmap] gpu:unused", err);
      heatmapTrace("gpu:unused", {
        message: err instanceof Error ? err.message : String(err),
      });
    }
  })();

  return {
    setFallback: (pack) => {
      pendingFallback = pack;
      heatmapTrace("driver:setFallback", { w: pack.width, h: pack.height });
      active().setFallback(pack);
    },
    setDepth: (pack) => {
      pendingDepth = pack;
      active().setDepth(pack);
    },
    setMaskMixTarget: (mix) => {
      pendingMix = mix;
      active().setMaskMixTarget(mix);
    },
    snapMaskMix: (mix) => {
      pendingMix = mix;
      active().snapMaskMix(mix);
    },
    dispose: () => {
      disposed = true;
      window.clearTimeout(expire);
      gpu?.dispose();
      cpu.dispose();
    },
  };
}
