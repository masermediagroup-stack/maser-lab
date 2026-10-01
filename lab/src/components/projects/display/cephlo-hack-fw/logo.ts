/** Center Cephlo lockup. Native pixel size of the supplied mark. */

export const CEPHLO_LOCKUP_SRC = "/assets/cephlo-hack-fw/cephlo-lockup.png";
/** On-frame size (native asset 2393×561, same ~4.27 aspect). */
export const CEPHLO_LOCKUP_W = 960;
export const CEPHLO_LOCKUP_H = 225;

export const FRAME_W = 1920;
export const FRAME_H = 1080;

export function logoCenteredRect(
  w: number,
  h: number,
): { x: number; y: number; w: number; h: number } {
  return {
    x: FRAME_W * 0.5 - w / 2,
    y: FRAME_H * 0.5 - h / 2,
    w,
    h,
  };
}

export function preloadCephloLogo(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (typeof img.decode === "function") {
        void img.decode().then(() => resolve(img)).catch(() => resolve(img));
        return;
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load logo: ${CEPHLO_LOCKUP_SRC}`));
    img.src = CEPHLO_LOCKUP_SRC;
  });
}

let cached: HTMLImageElement | null = null;
let pending: Promise<HTMLImageElement> | null = null;

export function loadCephloLogo(): Promise<HTMLImageElement> {
  if (cached) return Promise.resolve(cached);
  if (pending) return pending;
  pending = preloadCephloLogo().then((img) => {
    cached = img;
    return img;
  });
  return pending;
}

export function cephloLogoImage(): HTMLImageElement | null {
  return cached;
}
