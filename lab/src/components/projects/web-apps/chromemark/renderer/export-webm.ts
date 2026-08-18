export type WebMSupport = {
  supported: boolean;
  reason?: string;
};

const ALPHA_UNSUPPORTED =
  "Transparent WebM isn't supported by this browser. Export a PNG sequence instead.";

export async function detectAlphaWebMSupport(
  width = 1280,
  height = 720,
): Promise<WebMSupport> {
  if (typeof VideoEncoder === "undefined") {
    return { supported: false, reason: ALPHA_UNSUPPORTED };
  }
  try {
    const config: VideoEncoderConfig = {
      codec: "vp09.00.10.08",
      width,
      height,
      bitrate: 6_000_000,
      framerate: 30,
      latencyMode: "quality",
      alpha: "keep",
    };
    const result = await VideoEncoder.isConfigSupported(config);
    if (!result.supported) {
      return { supported: false, reason: ALPHA_UNSUPPORTED };
    }
    return { supported: true };
  } catch {
    return { supported: false, reason: ALPHA_UNSUPPORTED };
  }
}

/**
 * Alpha WebM via WebCodecs. A ProRes 4444 encoder can be added later behind
 * the same `exportAnimation` capability check — do not assume MP4 has alpha.
 */
export async function exportTransparentWebM(options: {
  width: number;
  height: number;
  fps: number;
  duration: number;
  frames: Blob[];
  signal?: AbortSignal;
}): Promise<Blob> {
  const support = await detectAlphaWebMSupport(options.width, options.height);
  if (!support.supported) {
    throw new Error(support.reason ?? ALPHA_UNSUPPORTED);
  }

  const muxerMod = await import("webm-muxer");
  const target = new muxerMod.ArrayBufferTarget();
  const muxer = new muxerMod.Muxer({
    target,
    video: {
      codec: "V_VP9",
      width: options.width,
      height: options.height,
      frameRate: options.fps,
      alpha: true,
    },
  });

  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (err) => {
      throw err;
    },
  });

  encoder.configure({
    codec: "vp09.00.10.08",
    width: options.width,
    height: options.height,
    bitrate: 8_000_000,
    framerate: options.fps,
    latencyMode: "quality",
    alpha: "keep",
  });

  const timestampStep = 1_000_000 / options.fps;
  for (let i = 0; i < options.frames.length; i++) {
    if (options.signal?.aborted) {
      encoder.close();
      throw new Error("Export cancelled.");
    }
    const bitmap = await createImageBitmap(options.frames[i]!);
    const frame = new VideoFrame(bitmap, {
      timestamp: Math.round(i * timestampStep),
      alpha: "keep",
    });
    encoder.encode(frame, { keyFrame: i % options.fps === 0 });
    frame.close();
    bitmap.close();
  }

  await encoder.flush();
  encoder.close();
  muxer.finalize();
  return new Blob([target.buffer], { type: "video/webm" });
}
