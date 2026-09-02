import type { Mp4Ground } from "../types";

export type Mp4Support = {
  supported: boolean;
  reason?: string;
};

/** MP4 is opaque social video. Alpha is WebM + PNG ZIP only. */
export const MP4_HAS_ALPHA = false;

const MP4_UNSUPPORTED =
  "Opaque MP4 isn't supported by this browser. Export a PNG sequence or WebM instead.";

export function mp4GroundColor(ground: Mp4Ground): string {
  return ground === "white" ? "#ffffff" : "#000000";
}

export async function detectOpaqueMp4Support(
  width = 1280,
  height = 720,
): Promise<Mp4Support> {
  if (typeof VideoEncoder === "undefined") {
    return { supported: false, reason: MP4_UNSUPPORTED };
  }
  try {
    const config: VideoEncoderConfig = {
      codec: "avc1.42001f",
      width,
      height,
      bitrate: 8_000_000,
      framerate: 30,
      latencyMode: "quality",
    };
    const result = await VideoEncoder.isConfigSupported(config);
    if (!result.supported) {
      return { supported: false, reason: MP4_UNSUPPORTED };
    }
    return { supported: true };
  } catch {
    return { supported: false, reason: MP4_UNSUPPORTED };
  }
}

function evenSize(value: number): number {
  return Math.max(2, value & ~1);
}

/**
 * Opaque H.264 MP4 on a user-picked black or white ground.
 * Do not pass alpha through — social MP4 is not transparent.
 */
export async function exportOpaqueMp4(options: {
  width: number;
  height: number;
  fps: number;
  duration: number;
  ground: Mp4Ground;
  frames: Blob[];
  signal?: AbortSignal;
}): Promise<Blob> {
  const width = evenSize(options.width);
  const height = evenSize(options.height);
  const support = await detectOpaqueMp4Support(width, height);
  if (!support.supported) {
    throw new Error(support.reason ?? MP4_UNSUPPORTED);
  }

  const muxerMod = await import("mp4-muxer");
  const target = new muxerMod.ArrayBufferTarget();
  const muxer = new muxerMod.Muxer({
    target,
    video: {
      codec: "avc",
      width,
      height,
      frameRate: options.fps,
    },
    fastStart: "in-memory",
  });

  let encodeError: Error | null = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (err) => {
      encodeError = err;
    },
  });

  encoder.configure({
    codec: "avc1.42001f",
    width,
    height,
    bitrate: 10_000_000,
    framerate: options.fps,
    latencyMode: "quality",
  });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    encoder.close();
    throw new Error("Could not composite MP4 frames.");
  }

  const fill = mp4GroundColor(options.ground);
  const timestampStep = 1_000_000 / options.fps;

  for (let i = 0; i < options.frames.length; i++) {
    if (options.signal?.aborted) {
      encoder.close();
      throw new Error("Export cancelled.");
    }
    if (encodeError) {
      encoder.close();
      throw encodeError;
    }
    const bitmap = await createImageBitmap(options.frames[i]!);
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const opaque = await createImageBitmap(canvas);
    const frame = new VideoFrame(opaque, {
      timestamp: Math.round(i * timestampStep),
    });
    encoder.encode(frame, { keyFrame: i % options.fps === 0 });
    frame.close();
    opaque.close();
  }

  await encoder.flush();
  encoder.close();
  if (encodeError) throw encodeError;
  muxer.finalize();
  return new Blob([target.buffer], { type: "video/mp4" });
}
