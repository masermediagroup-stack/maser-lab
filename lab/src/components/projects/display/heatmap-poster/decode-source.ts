import { heatmapTrace } from "./trace";
import type { HeatmapImageSource } from "./types";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("file read failed"));
    };
    reader.onerror = () => reject(new Error("file read failed"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const local = src.startsWith("blob:") || src.startsWith("data:");
    if (!local) image.crossOrigin = "anonymous";
    heatmapTrace("decode:start", { srcKind: local ? "local" : "remote" });
    image.onload = () => {
      const finish = () => {
        heatmapTrace("decode:resolved", {
          w: image.naturalWidth,
          h: image.naturalHeight,
        });
        resolve(image);
      };
      if (typeof image.decode === "function") {
        image.decode().then(finish).catch(finish);
      } else {
        finish();
      }
    };
    image.onerror = () => {
      heatmapTrace("decode:failed", { srcKind: local ? "local" : "remote" });
      reject(new Error("image load failed"));
    };
    image.src = src;
  });
}

async function decodeFile(file: File): Promise<CanvasImageSource> {
  heatmapTrace("decode:file", { name: file.name, type: file.type, size: file.size });
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      heatmapTrace("decode:bitmap", { w: bitmap.width, h: bitmap.height });
      if (bitmap.width < 1 || bitmap.height < 1) {
        bitmap.close();
        throw new Error("decoded image has no pixels");
      }
      return bitmap;
    } catch (err) {
      heatmapTrace("decode:bitmap:fail", {
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
  const dataUrl = await readFileAsDataUrl(file);
  return loadImage(dataUrl);
}

/** Hold the File. Decode from it. Never revoke or swap the source before this resolves. */
export async function decodeImageSource(
  image: HeatmapImageSource,
): Promise<CanvasImageSource> {
  if (image.file) return decodeFile(image.file);
  return loadImage(image.src);
}

export function sourceKey(image: HeatmapImageSource | null): string | null {
  if (!image) return null;
  if (image.file) {
    return `file:${image.file.name}:${image.file.size}:${image.file.lastModified}`;
  }
  return image.src;
}

export function closeDecoded(source: CanvasImageSource): void {
  if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
    source.close();
  }
}
