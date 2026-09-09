/** Center logo carousel — Grok Bot → SpaceX → Cursor. Sequential fade, never overlap. */

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

/** Shared slot matches Figma Grok lockup (814×153 @ 1920). Contain, do not upscale. */
export const LOGO_MAX_W_PX = 814;
export const LOGO_MAX_H_PX = 153;

/**
 * Optical center of the SpaceXAI lockup in design px.
 * Letter mass sits left of the geometric bbox center (~450) because the AI
 * tail occupies the right third. Weighted center of SPACEX letters + sparse AI.
 */
export const SPACEX_OPTICAL_CENTER_X = 360;

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

type LogoSpec = {
  image: HTMLImageElement;
  designW: number;
  designH: number;
  opticalCenterX: number;
  opacity: number;
};

function fitLogoRect(
  designW: number,
  designH: number,
  maxW: number,
  maxH: number,
): { w: number; h: number } {
  const scale = Math.min(maxW / designW, maxH / designH);
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
  const maxW = LOGO_MAX_W_PX * scale;
  const maxH = LOGO_MAX_H_PX * scale;
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const [grokOp, spacexOp, cursorOp] = logoOpacities(
    elapsed,
    loopSeconds,
    reducedMotion,
  );

  const specs: LogoSpec[] = [
    {
      image: images.grok,
      designW: GROK_LOCKUP_W,
      designH: GROK_LOCKUP_H,
      opticalCenterX: GROK_LOCKUP_W * 0.5,
      opacity: grokOp,
    },
    {
      image: images.spacex,
      designW: SPACEX_LOCKUP_W,
      designH: SPACEX_LOCKUP_H,
      opticalCenterX: SPACEX_OPTICAL_CENTER_X,
      opacity: spacexOp,
    },
    {
      image: images.cursor,
      designW: CURSOR_LOCKUP_W,
      designH: CURSOR_LOCKUP_H,
      opticalCenterX: CURSOR_LOCKUP_W * 0.5,
      opacity: cursorOp,
    },
  ];

  for (const spec of specs) {
    if (spec.opacity <= 0.001) continue;
    const { w, h } = fitLogoRect(spec.designW, spec.designH, maxW, maxH);
    const fittedScale = w / spec.designW;
    const x = centerX - spec.opticalCenterX * fittedScale;
    const y = centerY - h * 0.5;
    ctx.save();
    ctx.globalAlpha = spec.opacity;
    ctx.drawImage(spec.image, x, y, w, h);
    ctx.restore();
  }
}
