import {
  ACESFilmicToneMapping,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { createRendererOptions } from "@/three/utils/renderer";

export function createChromeRenderer(canvas: HTMLCanvasElement): WebGLRenderer {
  const renderer = new WebGLRenderer({
    canvas,
    ...createRendererOptions(),
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    stencil: false,
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1);
  renderer.autoClear = true;
  return renderer;
}
