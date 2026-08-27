import { LOGO_ASPECT, LOGO_RASTER_WIDTH } from "./constants";

export type RasterizedLogo = {
  bitmap: ImageBitmap;
  width: number;
  height: number;
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Could not load logo image: ${url}`));
    image.src = url;
  });
}

/**
 * vgpu cannot sample SVG. Draw Blue-HD into a bitmap, then upload as a texture.
 */
export async function rasterizeLogo(url: string): Promise<RasterizedLogo> {
  const image = await loadImage(url);
  try {
    await image.decode();
  } catch {
    /* onload already fired; decode is best-effort for SVG. */
  }

  const width = LOGO_RASTER_WIDTH;
  const height = Math.max(1, Math.round(width / LOGO_ASPECT));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not rasterize the Maser cloud mark.");
  }
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  const bitmap = await createImageBitmap(canvas);
  return { bitmap, width, height };
}
