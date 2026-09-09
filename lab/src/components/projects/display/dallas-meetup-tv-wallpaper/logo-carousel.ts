/** Center logo carousel — Grok Bot → SpaceX → Cursor. */

export const GROK_LOCKUP_SRC =
  "/assets/dallas-meetup-tv-wallpaper/grok-bot-lockup.svg";
export const SPACEX_LOCKUP_SRC =
  "/assets/dallas-meetup-tv-wallpaper/spacexai-wordmark-light.svg";
export const CURSOR_LOCKUP_SRC =
  "/assets/dallas-meetup-tv-wallpaper/cursor-lockup-horizontal.svg";

export const GROK_LOCKUP_W = 814;
export const GROK_LOCKUP_H = 153;
export const SPACEX_LOCKUP_W = 900.886;
export const SPACEX_LOCKUP_H = 110;
export const CURSOR_LOCKUP_W = 645;
export const CURSOR_LOCKUP_H = 153;

export const LOGO_MAX_H_PX = 153;
export const LOGO_CROSSFADE_FRACTION = 0.1;

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
    img.onload = () => resolve(img);
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

/** Opacity for [grok, spacex, cursor] — seamless 3-phase loop. */
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
  const prev = (index + 2) % 3;
  const frac = phase - Math.floor(phase);
  const fadeWidth = LOGO_CROSSFADE_FRACTION;

  const opacities: [number, number, number] = [0, 0, 0];

  if (frac < fadeWidth) {
    if (frac <= 1e-6) {
      opacities[index] = 1;
    } else {
      const p = frac / fadeWidth;
      opacities[prev] = 1 - p;
      opacities[index] = p;
    }
  } else if (frac > 1 - fadeWidth) {
    const p = (frac - (1 - fadeWidth)) / fadeWidth;
    opacities[index] = 1 - p;
    opacities[next] = p;
  } else {
    opacities[index] = 1;
  }

  return opacities;
}

type LogoSpec = {
  image: HTMLImageElement;
  designW: number;
  designH: number;
  opacity: number;
};

function fitLogoRect(
  designW: number,
  designH: number,
  maxH: number,
): { w: number; h: number } {
  const scale = maxH / designH;
  return { w: designW * scale, h: designH * scale };
}

export function drawLogoCarousel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  loopSeconds: number,
  reducedMotion: boolean,
  images: LogoCarouselImages,
) {
  const scale = width / 1920;
  const maxH = LOGO_MAX_H_PX * scale;
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const [grokOp, spacexOp, cursorOp] = logoOpacities(
    elapsed,
    loopSeconds,
    reducedMotion,
  );

  const specs: LogoSpec[] = [
    { image: images.grok, designW: GROK_LOCKUP_W, designH: GROK_LOCKUP_H, opacity: grokOp },
    { image: images.spacex, designW: SPACEX_LOCKUP_W, designH: SPACEX_LOCKUP_H, opacity: spacexOp },
    { image: images.cursor, designW: CURSOR_LOCKUP_W, designH: CURSOR_LOCKUP_H, opacity: cursorOp },
  ];

  for (const spec of specs) {
    if (spec.opacity <= 0.001) continue;
    const { w, h } = fitLogoRect(spec.designW, spec.designH, maxH);
    const x = centerX - w * 0.5;
    const y = centerY - h * 0.5;
    ctx.save();
    ctx.globalAlpha = spec.opacity;
    ctx.drawImage(spec.image, x, y, w, h);
    ctx.restore();
  }
}
