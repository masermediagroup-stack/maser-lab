import {
  CanvasTexture,
  LinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";

export type ProceduralTextures = {
  woodAlbedo: CanvasTexture;
  woodRough: CanvasTexture;
  marbleAlbedo: CanvasTexture;
  marbleRough: CanvasTexture;
  steelAlbedo: CanvasTexture;
  steelRough: CanvasTexture;
  steelAniso: CanvasTexture;
  goldRough: CanvasTexture;
  gradientAlbedo: CanvasTexture;
};

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function noise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
}

function fbm(x: number, y: number, octaves = 5): number {
  let value = 0;
  let amp = 0.5;
  let fx = x;
  let fy = y;
  for (let i = 0; i < octaves; i += 1) {
    value += amp * noise(fx, fy);
    fx *= 2;
    fy *= 2;
    amp *= 0.5;
  }
  return value;
}

function makeCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function canvasTexture(
  canvas: HTMLCanvasElement,
  srgb: boolean,
): CanvasTexture {
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = 8;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  if (srgb) texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function paintWood(size: number): { albedo: HTMLCanvasElement; rough: HTMLCanvasElement } {
  const albedo = makeCanvas(size);
  const rough = makeCanvas(size);
  const aCtx = albedo.getContext("2d");
  const rCtx = rough.getContext("2d");
  if (!aCtx || !rCtx) return { albedo, rough };

  const aImg = aCtx.createImageData(size, size);
  const rImg = rCtx.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const px = (u - 0.35) * 4.2;
      const py = (v - 0.5) * 0.55;
      const rings =
        Math.sin((Math.hypot(px, py) + fbm(u * 6, v * 2.2) * 0.45) * 38) * 0.5 +
        0.5;
      const grain = fbm(u * 18, v * 3.5, 4);
      const t = rings * 0.72 + grain * 0.28;
      const dark = [92, 54, 28];
      const light = [196, 138, 78];
      const i = (y * size + x) * 4;
      aImg.data[i] = dark[0] + (light[0] - dark[0]) * t;
      aImg.data[i + 1] = dark[1] + (light[1] - dark[1]) * t;
      aImg.data[i + 2] = dark[2] + (light[2] - dark[2]) * t;
      aImg.data[i + 3] = 255;
      const rv = 0.38 + t * 0.4 + grain * 0.12;
      rImg.data[i] = rImg.data[i + 1] = rImg.data[i + 2] = Math.round(rv * 255);
      rImg.data[i + 3] = 255;
    }
  }
  aCtx.putImageData(aImg, 0, 0);
  rCtx.putImageData(rImg, 0, 0);
  return { albedo, rough };
}

function paintMarble(size: number): { albedo: HTMLCanvasElement; rough: HTMLCanvasElement } {
  const albedo = makeCanvas(size);
  const rough = makeCanvas(size);
  const aCtx = albedo.getContext("2d");
  const rCtx = rough.getContext("2d");
  if (!aCtx || !rCtx) return { albedo, rough };

  const aImg = aCtx.createImageData(size, size);
  const rImg = rCtx.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const n = fbm(u * 3.2, v * 3.2, 6);
      const vein = Math.abs(Math.sin(u * 6.5 + n * 7.5 + v * 1.4));
      const veinMask = Math.pow(1 - vein, 10);
      const dust = fbm(u * 14, v * 14, 3);
      const i = (y * size + x) * 4;
      const base = 232 + dust * 18;
      aImg.data[i] = base - veinMask * 90;
      aImg.data[i + 1] = base - veinMask * 88;
      aImg.data[i + 2] = base - veinMask * 82;
      aImg.data[i + 3] = 255;
      const rv = 0.22 + veinMask * 0.35 + dust * 0.08;
      rImg.data[i] = rImg.data[i + 1] = rImg.data[i + 2] = Math.round(rv * 255);
      rImg.data[i + 3] = 255;
    }
  }
  aCtx.putImageData(aImg, 0, 0);
  rCtx.putImageData(rImg, 0, 0);
  return { albedo, rough };
}

function paintSteel(size: number): {
  albedo: HTMLCanvasElement;
  rough: HTMLCanvasElement;
  aniso: HTMLCanvasElement;
} {
  const albedo = makeCanvas(size);
  const rough = makeCanvas(size);
  const aniso = makeCanvas(size);
  const aCtx = albedo.getContext("2d");
  const rCtx = rough.getContext("2d");
  const nCtx = aniso.getContext("2d");
  if (!aCtx || !rCtx || !nCtx) return { albedo, rough, aniso };

  const aImg = aCtx.createImageData(size, size);
  const rImg = rCtx.createImageData(size, size);
  const nImg = nCtx.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const streak = fbm(u * 1.4, v * 70, 4);
      const scratch = Math.pow(noise(u * 40, v * 2), 8);
      const t = streak * 0.85 + scratch * 0.15;
      const i = (y * size + x) * 4;
      const g = 118 + t * 90;
      aImg.data[i] = g + 4;
      aImg.data[i + 1] = g + 2;
      aImg.data[i + 2] = g - 2;
      aImg.data[i + 3] = 255;
      const rv = 0.22 + (1 - t) * 0.28;
      rImg.data[i] = rImg.data[i + 1] = rImg.data[i + 2] = Math.round(rv * 255);
      rImg.data[i + 3] = 255;
      const av = 0.55 + t * 0.4;
      nImg.data[i] = nImg.data[i + 1] = nImg.data[i + 2] = Math.round(av * 255);
      nImg.data[i + 3] = 255;
    }
  }
  aCtx.putImageData(aImg, 0, 0);
  rCtx.putImageData(rImg, 0, 0);
  nCtx.putImageData(nImg, 0, 0);
  return { albedo, rough, aniso };
}

function paintGold(size: number): HTMLCanvasElement {
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const t = fbm(u * 8, v * 8, 4);
      const i = (y * size + x) * 4;
      const rv = 0.16 + t * 0.28;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.round(rv * 255);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

function paintGradient(size: number): HTMLCanvasElement {
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#7AD3FF");
  gradient.addColorStop(0.35, "#10A4FF");
  gradient.addColorStop(0.7, "#0065A3");
  gradient.addColorStop(1, "#003A5C");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

export function createProceduralTextures(size = 512): ProceduralTextures {
  const wood = paintWood(size);
  const marble = paintMarble(size);
  const steel = paintSteel(size);
  const textures = {
    woodAlbedo: canvasTexture(wood.albedo, true),
    woodRough: canvasTexture(wood.rough, false),
    marbleAlbedo: canvasTexture(marble.albedo, true),
    marbleRough: canvasTexture(marble.rough, false),
    steelAlbedo: canvasTexture(steel.albedo, true),
    steelRough: canvasTexture(steel.rough, false),
    steelAniso: canvasTexture(steel.aniso, false),
    goldRough: canvasTexture(paintGold(size), false),
    gradientAlbedo: canvasTexture(paintGradient(size), true),
  };

  textures.woodAlbedo.repeat.set(1.7, 1.7);
  textures.woodRough.repeat.set(1.7, 1.7);
  textures.marbleAlbedo.repeat.set(1.35, 1.35);
  textures.marbleRough.repeat.set(1.35, 1.35);
  textures.steelAlbedo.repeat.set(1.2, 2.4);
  textures.steelRough.repeat.set(1.2, 2.4);
  textures.steelAniso.repeat.set(1.2, 2.4);

  return textures;
}

export function disposeProceduralTextures(textures: ProceduralTextures): void {
  for (const texture of Object.values(textures)) {
    texture.dispose();
  }
}
