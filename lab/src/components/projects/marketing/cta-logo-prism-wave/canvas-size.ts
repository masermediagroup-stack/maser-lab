/**
 * Replaced <canvas> defaults to a 300×150 CSS box. Never size the backing
 * store from the canvas's own rect — that stamps the default. Measure the
 * tilt viewport (the CSS 3D plane), then cover it with width/height 100%.
 *
 * Use the viewport's *layout* box (client/offset), not getBoundingClientRect
 * during tilt: GBR is the projected AABB and would recreate the swapchain
 * every pointer-move frame. At rest, layout size matches GBR.
 */

export type ViewportBackingStore = {
  cssW: number;
  cssH: number;
  bufW: number;
  bufH: number;
  dpr: number;
};

export function readViewportBackingStore(
  viewport: HTMLElement,
): ViewportBackingStore | null {
  const rect = viewport.getBoundingClientRect();
  const cssW = Math.max(viewport.clientWidth, viewport.offsetWidth);
  const cssH = Math.max(viewport.clientHeight, viewport.offsetHeight);
  // Rest-state GBR is a floor so a 0×0 layout box cannot win; during tilt
  // we still prefer layout so the buffer stays stable.
  const restW = cssW > 1 ? cssW : rect.width;
  const restH = cssH > 1 ? cssH : rect.height;
  if (restW < 2 || restH < 2) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  return {
    cssW: restW,
    cssH: restH,
    dpr,
    bufW: Math.max(1, Math.round(restW * dpr)),
    bufH: Math.max(1, Math.round(restH * dpr)),
  };
}

/** Cover the viewport in CSS. Backing store is pixel size, not the CSS box. */
export function coverViewportWithCanvas(
  canvas: HTMLCanvasElement,
  size: ViewportBackingStore,
): void {
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.maxWidth = "none";
  canvas.style.maxHeight = "none";
  canvas.style.display = "block";
  canvas.style.backgroundColor = "transparent";
  if (canvas.width !== size.bufW) canvas.width = size.bufW;
  if (canvas.height !== size.bufH) canvas.height = size.bufH;
}

export function backingStoreChanged(
  canvas: HTMLCanvasElement,
  size: ViewportBackingStore,
): boolean {
  return canvas.width !== size.bufW || canvas.height !== size.bufH;
}
