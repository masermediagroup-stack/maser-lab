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
  const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
  if (!ctx) {
    console.error("[heatmap] canvas2d:fail", "getContext('2d') returned null");
    heatmapTrace("canvas2d:fail", { reason: "no-2d-context" });
  }
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
  let pendingPresent = true;

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

  const paint = (advanceTime: boolean, dt: number) => {
    if (disposed || !ctx) return;
    const reduced = reducedRef.current;
    if (advanceTime && !reduced) time += dt;
    if (reduced) {
      maskMix = maskMixTarget;
    } else if (maskMix !== maskMixTarget) {
      const step = dt * (1000 / MASK_FADE_MS);
      if (maskMix < maskMixTarget) maskMix = Math.min(maskMixTarget, maskMix + step);
      else maskMix = Math.max(maskMixTarget, maskMix - step);
    }

    const w = Math.max(1, canvas.clientWidth || canvas.width || 1);
    const h = Math.max(1, canvas.clientHeight || canvas.height || 1);
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

  const sampleCenter = (): [number, number, number] | null => {
    if (!ctx || canvas.width < 1 || canvas.height < 1) return null;
    try {
      const p = ctx.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data;
      return [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0];
    } catch (err) {
      console.error("[heatmap] luma:sample:fail", err);
      heatmapTrace("luma:sample:fail", {
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
    if (!visible && !pendingPresent) return;
    pendingPresent = false;
    paint(true, dt);
  };

  raf = window.requestAnimationFrame(tick);
  heatmapTrace("canvas2d:loop");
  onReady?.();

  return {
    setFallback: (pack) => {
      fallback = pack;
      pendingPresent = true;
      heatmapTrace("driver:setFallback", { w: pack.width, h: pack.height });
      paint(false, 0);
      heatmapTrace("luma:presented", {
        w: canvas.width,
        h: canvas.height,
        packW: pack.width,
        packH: pack.height,
        sample: sampleCenter(),
      });
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
  heatmapTrace("canvas2d:start", { reason: "cpu-owns-canvas" });
  heatmapTrace("gpu:unused", { reason: "cpu-owns-canvas" });
  return startCanvas2d(canvas, lookRef, reducedRef, onReady);
}
