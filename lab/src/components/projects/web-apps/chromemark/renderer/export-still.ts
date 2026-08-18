import {
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
  WebGLRenderTarget,
  type WebGLRenderer,
  type Scene,
  type PerspectiveCamera,
} from "three";
import { LogoLoadError } from "../types";
import { rgbaToPngBlob } from "./read-pixels";

export async function exportStillPng(options: {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  width: number;
  height: number;
}): Promise<Blob> {
  const { renderer, scene, camera, width, height } = options;
  const max = renderer.capabilities.maxTextureSize;
  if (width > max || height > max) {
    throw new LogoLoadError(
      "gpu-limit",
      `This GPU supports textures up to ${max}px. Choose a smaller export size.`,
    );
  }

  const samples = Math.min(8, renderer.capabilities.maxSamples || 0);
  const target = new WebGLRenderTarget(width, height, {
    format: RGBAFormat,
    type: UnsignedByteType,
    colorSpace: SRGBColorSpace,
    samples,
    depthBuffer: true,
    stencilBuffer: false,
  });

  const prevAspect = camera.aspect;
  const prevTarget = renderer.getRenderTarget();
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();

  try {
    renderer.setRenderTarget(target);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, camera);
    const buffer = new Uint8Array(width * height * 4);
    await renderer.readRenderTargetPixelsAsync(
      target,
      0,
      0,
      width,
      height,
      buffer,
    );
    return rgbaToPngBlob(buffer, width, height);
  } finally {
    renderer.setRenderTarget(prevTarget);
    camera.aspect = prevAspect;
    camera.updateProjectionMatrix();
    target.dispose();
  }
}
