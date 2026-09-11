/** Center logo carousel — Grok Bot → SpaceX → Cursor. Sequential fade, never overlap. */

export const GROK_LOCKUP_SRC =
  "/assets/dallas-meetup-tv-wallpaper/grok-bot-lockup.svg";
export const SPACEX_LOCKUP_SRC =
  "/assets/dallas-meetup-tv-wallpaper/spacexai-wordmark-light.svg";
export const CURSOR_LOCKUP_SRC =
  "/assets/dallas-meetup-tv-wallpaper/cursor-lockup-horizontal.svg";

/** Figma `GrokBot-TV-Idle-Wallpaper` (11:2) native sizes — draw 1:1, no per-asset scale. */
export const FIGMA_FRAME_W = 1920;
export const FIGMA_FRAME_H = 1080;
export const GROK_LOCKUP_W = 814;
export const GROK_LOCKUP_H = 153;
export const SPACEX_LOCKUP_W = 900.886;
export const SPACEX_LOCKUP_H = 110;
export const CURSOR_LOCKUP_W = 645;
export const CURSOR_LOCKUP_H = 153;

/** Fraction of each logo segment used for fade-out, then the same for fade-in. */
export const LOGO_FADE_FRACTION = 0.08;

export type LogoCarouselImages = {
  grok: HTMLImageElement;
  spacex: HTMLImageElement;
  cursor: HTMLImageElement;
};

const logoSources = [
  { key: "grok" as const, src: GROK_LOCKUP_SRC },
  { key: "spacex" as const, src: SPACEX_LOCKUP_SRC },
  { key: "cursor" as const, src: CURSOR_LOCKUP_SRC },
];

let cachedImages: LogoCarouselImages | null = null;
let preloadPromise: Promise<LogoCarouselImages> | null = null;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (typeof img.decode === "function") {
        void img.decode().then(() => resolve(img)).catch(() => resolve(img));
        return;
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load logo: ${src}`));
    img.src = src;
  });
}

export function preloadLogoCarousel(): Promise<LogoCarouselImages> {
  if (cachedImages) return Promise.resolve(cachedImages);
  if (preloadPromise) return preloadPromise;

  preloadPromise = Promise.all(
    logoSources.map(({ key, src }) =>
      loadImage(src).then((img) => [key, img] as const),
    ),
  ).then((entries) => {
    cachedImages = {
      grok: entries.find(([k]) => k === "grok")![1],
      spacex: entries.find(([k]) => k === "spacex")![1],
      cursor: entries.find(([k]) => k === "cursor")![1],
    };
    return cachedImages;
  });

  return preloadPromise;
}

export function logoCarouselImages(): LogoCarouselImages | null {
  return cachedImages;
}

function smoothstep(t: number): number {
  const u = Math.min(1, Math.max(0, t));
  return u * u * (3 - 2 * u);
}

/**
 * Opacity for [grok, spacex, cursor].
 * Each segment: hold → fade out current → fade in next.
 * At most one logo is non-zero (no overlap / no double-fade flash).
 */
export function logoOpacities(
  elapsed: number,
  loopSeconds: number,
  reducedMotion: boolean,
): [number, number, number] {
  if (reducedMotion) return [1, 0, 0];

  const loop = Math.max(0.001, loopSeconds);
  const t = ((elapsed % loop) + loop) % loop;
  const phase = (t / loop) * 3;
  const index = Math.floor(phase) % 3;
  const next = (index + 1) % 3;
  const frac = phase - Math.floor(phase);
  const fade = LOGO_FADE_FRACTION;
  const outStart = 1 - 2 * fade;
  const inStart = 1 - fade;

  const opacities: [number, number, number] = [0, 0, 0];

  if (frac >= inStart) {
    opacities[next] = smoothstep((frac - inStart) / fade);
  } else if (frac >= outStart) {
    opacities[index] = 1 - smoothstep((frac - outStart) / fade);
  } else {
    opacities[index] = 1;
  }

  return opacities;
}

/** Geometric center of a native-size lockup on the 1920×1080 Figma frame. */
export function logoCenteredRect(
  w: number,
  h: number,
): { x: number; y: number; w: number; h: number } {
  return {
    x: FIGMA_FRAME_W * 0.5 - w / 2,
    y: FIGMA_FRAME_H * 0.5 - h / 2,
    w,
    h,
  };
}

type LogoSpec = {
  image: HTMLImageElement;
  w: number;
  h: number;
  opacity: number;
};

/**
 * Draw logos at Figma-native W×H, geometrically centered on 1920×1080.
 * Caller must be in identity 1920×1080 space (no dpr scale, no CSS stretch).
 * `width` / `height` are ignored for placement (frame is always 1920×1080).
 * Live preview uses DOM SVG; this draw path is export-only.
 */
export function drawLogoCarousel(
  ctx: CanvasRenderingContext2D,
  _width: number,
  _height: number,
  elapsed: number,
  loopSeconds: number,
  reducedMotion: boolean,
  images: LogoCarouselImages,
) {
  const [grokOp, spacexOp, cursorOp] = logoOpacities(
    elapsed,
    loopSeconds,
    reducedMotion,
  );

  const specs: LogoSpec[] = [
    { image: images.grok, w: GROK_LOCKUP_W, h: GROK_LOCKUP_H, opacity: grokOp },
    {
      image: images.spacex,
      w: SPACEX_LOCKUP_W,
      h: SPACEX_LOCKUP_H,
      opacity: spacexOp,
    },
    {
      image: images.cursor,
      w: CURSOR_LOCKUP_W,
      h: CURSOR_LOCKUP_H,
      opacity: cursorOp,
    },
  ];

  for (const spec of specs) {
    if (spec.opacity <= 0.001) continue;
    const { x, y, w, h } = logoCenteredRect(spec.w, spec.h);
    ctx.save();
    ctx.globalAlpha = spec.opacity;
    ctx.drawImage(spec.image, x, y, w, h);
    ctx.restore();
  }
}
