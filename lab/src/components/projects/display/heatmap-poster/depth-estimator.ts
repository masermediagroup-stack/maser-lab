import { isDepthFieldConfident } from "./depth-confidence";
import type { DepthOutcome } from "./types";

export type DepthRead =
  | { outcome: "ok"; depth: Float32Array; width: number; height: number }
  | { outcome: Exclude<DepthOutcome, "ok"> };

type DepthPipe = {
  (
    input: HTMLImageElement | HTMLCanvasElement | OffscreenCanvas,
  ): Promise<{
    predicted_depth?: { data: Float32Array | number[]; dims: number[] };
  }>;
};

let pipePromise: Promise<DepthPipe | null> | null = null;
const cache = new Map<string, DepthRead>();

let testHook: { forceError?: boolean; forceUnavailable?: boolean } = {};

/** Lab/test only. Not a product control. */
export function setDepthEstimatorTestHook(hook: {
  forceError?: boolean;
  forceUnavailable?: boolean;
}): void {
  testHook = hook;
  pipePromise = null;
  cache.clear();
}

async function getDepthPipeline(): Promise<DepthPipe | null> {
  if (testHook.forceUnavailable) return null;
  if (pipePromise) return pipePromise;
  pipePromise = (async () => {
    try {
      if (typeof navigator === "undefined" || !("gpu" in navigator)) return null;
      const { pipeline } = await import("@huggingface/transformers");
      const pipe = await pipeline(
        "depth-estimation",
        "onnx-community/depth-anything-v2-small",
        { device: "webgpu", dtype: "fp16" },
      );
      return pipe as unknown as DepthPipe;
    } catch {
      return null;
    }
  })();
  return pipePromise;
}

export function prefetchDepthModel(): void {
  if (typeof window === "undefined") return;
  const run = () => {
    void getDepthPipeline();
  };
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: 2500 });
  } else {
    setTimeout(run, 1);
  }
}

function tensorToField(predicted: {
  data: Float32Array | number[];
  dims: number[];
}): { depth: Float32Array; width: number; height: number } | null {
  const dims = predicted.dims;
  let height = 0;
  let width = 0;
  if (dims.length === 2) {
    height = dims[0] ?? 0;
    width = dims[1] ?? 0;
  } else if (dims.length >= 3) {
    height = dims[dims.length - 2] ?? 0;
    width = dims[dims.length - 1] ?? 0;
  }
  if (width < 4 || height < 4) return null;
  const src = predicted.data;
  const depth =
    src instanceof Float32Array ? src.slice(0, width * height) : Float32Array.from(src);
  if (depth.length < width * height) return null;
  return { depth, width, height };
}

export async function readDepth(
  image: HTMLImageElement | HTMLCanvasElement,
  cacheKey?: string,
): Promise<DepthRead> {
  const key = cacheKey
    ?? (image instanceof HTMLImageElement ? (image.currentSrc || image.src) : "");
  const cached = cache.get(key);
  if (cached) return cached;

  if (testHook.forceError) {
    const result: DepthRead = { outcome: "error" };
    cache.set(key, result);
    return result;
  }

  const pipe = await getDepthPipeline();
  if (!pipe) {
    const result: DepthRead = { outcome: "unavailable" };
    cache.set(key, result);
    return result;
  }

  try {
    const out = await pipe(image);
    const field = out.predicted_depth ? tensorToField(out.predicted_depth) : null;
    if (!field) {
      const result: DepthRead = { outcome: "error" };
      cache.set(key, result);
      return result;
    }
    if (!isDepthFieldConfident(field.depth, field.width, field.height)) {
      const result: DepthRead = { outcome: "discarded" };
      cache.set(key, result);
      return result;
    }
    const result: DepthRead = {
      outcome: "ok",
      depth: field.depth,
      width: field.width,
      height: field.height,
    };
    cache.set(key, result);
    return result;
  } catch {
    const result: DepthRead = { outcome: "error" };
    cache.set(key, result);
    return result;
  }
}
