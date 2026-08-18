export function flipRgbaVertically(
  pixels: Uint8Array,
  width: number,
  height: number,
): Uint8ClampedArray<ArrayBuffer> {
  const stride = width * 4;
  const out = new Uint8ClampedArray(new ArrayBuffer(width * height * 4));
  for (let y = 0; y < height; y++) {
    const src = (height - 1 - y) * stride;
    out.set(pixels.subarray(src, src + stride), y * stride);
  }
  return out;
}

export async function rgbaToPngBlob(
  pixels: Uint8Array,
  width: number,
  height: number,
): Promise<Blob> {
  const flipped = flipRgbaVertically(pixels, width, height);
  const imageData = new ImageData(flipped, width, height);

  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.putImageData(imageData, 0, 0);
      return canvas.convertToBlob({ type: "image/png" });
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not encode PNG.");
  }
  ctx.putImageData(imageData, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not encode PNG."));
    }, "image/png");
  });
}

export function padFrameIndex(index: number, width = 4): string {
  return String(index).padStart(width, "0");
}
