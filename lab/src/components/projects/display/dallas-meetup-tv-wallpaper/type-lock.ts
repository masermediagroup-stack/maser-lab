/**
 * Mechanical type lock for the Dallas meetup TV wallpaper.
 *
 * Three rules (Elite Pixel Guy + engineering threshold). Not a judgment call:
 *
 * 1. Geist Sans appears exactly once on the frame — the canvas display line
 *    "Dallas meetup". If a second DOM element wants Geist, it does not get it.
 * 2. Nothing in IBM Plex Sans Condensed sits close to the display in size.
 *    Largest Plex rendered size ≤ DALLAS_PLEX_MAX_RATIO of the display's
 *    rendered size. Fix: shrink or remove the label. Never enlarge the display.
 * 3. Geist Mono only if a small structural element genuinely earns it
 *    (`data-dallas-mono="structural"` — a slug or rule label). It is not a
 *    third voice and never appears just to add texture.
 *
 * DALLAS_PLEX_MAX_RATIO (0.4) is the instructing-agent working threshold for
 * EPG's "decisive" jump. Re-weight off the live canvas; do not invent a
 * second ratio in CSS.
 */

export const DALLAS_DISPLAY_FONT_PX = 56;
export const DALLAS_TYPE_DESIGN_WIDTH_PX = 1920;
/** Working threshold for a "decisive" Geist/Plex jump. EPG can re-weight. */
export const DALLAS_PLEX_MAX_RATIO = 0.4;
/** Subpixel slack so computed px vs calc() does not false-fail. */
export const DALLAS_PLEX_SIZE_EPSILON_PX = 0.51;

export type DallasFamilyKind = "geist-sans" | "geist-mono" | "plex" | "other";

export type DallasTypeLockViolation = {
  rule: "geist-once" | "plex-size" | "geist-mono";
  detail: string;
  selector?: string;
  sizePx?: number;
  maxPx?: number;
};

export type DallasTypeLockResult = {
  ok: boolean;
  displayPx: number;
  plexMaxPx: number;
  violations: DallasTypeLockViolation[];
};

export function displayRenderedPx(canvasCssWidthPx: number): number {
  if (!Number.isFinite(canvasCssWidthPx) || canvasCssWidthPx <= 0) {
    return DALLAS_DISPLAY_FONT_PX;
  }
  return DALLAS_DISPLAY_FONT_PX * (canvasCssWidthPx / DALLAS_TYPE_DESIGN_WIDTH_PX);
}

export function plexMaxPx(displayPx: number): number {
  return displayPx * DALLAS_PLEX_MAX_RATIO;
}

function familyTokens(family: string): string[] {
  return family
    .split(",")
    .map((token) => token.trim().replace(/^["']|["']$/g, "").toLowerCase())
    .filter(Boolean);
}

export function classifyDallasFamily(family: string): DallasFamilyKind {
  const tokens = familyTokens(family);
  if (tokens.some((token) => token.includes("geist") && token.includes("mono"))) {
    return "geist-mono";
  }
  if (tokens.some((token) => token === "geist" || token.includes("geist"))) {
    return "geist-sans";
  }
  if (tokens.some((token) => token.includes("plex"))) {
    return "plex";
  }
  return "other";
}

function elementSelector(el: Element): string {
  const id = el.id ? `#${el.id}` : "";
  const cls = typeof el.className === "string" && el.className.trim()
    ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}`
    : "";
  return `${el.tagName.toLowerCase()}${id}${cls}`;
}

function hasOwnText(el: Element): boolean {
  return Array.from(el.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()),
  );
}

export function publishDallasDisplayPx(host: HTMLElement, displayPx: number): void {
  host.style.setProperty("--dallas-display-px", `${displayPx}px`);
  host.style.setProperty("--dallas-plex-max-ratio", String(DALLAS_PLEX_MAX_RATIO));
  host.dataset.dallasDisplayPx = displayPx.toFixed(2);
  host.dataset.dallasPlexMaxPx = plexMaxPx(displayPx).toFixed(2);
}

/**
 * Shrink Plex (or other non-Geist) text that exceeds the cap.
 * Never mutates the canvas and never increases the display size.
 */
export function enforcePlexCap(root: HTMLElement, maxPx: number): number {
  let shrunk = 0;
  const nodes = root.querySelectorAll<HTMLElement>("*:not(canvas)");
  for (const el of nodes) {
    if (!hasOwnText(el)) continue;
    const style = getComputedStyle(el);
    const kind = classifyDallasFamily(style.fontFamily);
    if (kind === "geist-sans" || kind === "geist-mono") continue;
    const size = Number.parseFloat(style.fontSize);
    if (!Number.isFinite(size) || size <= maxPx + DALLAS_PLEX_SIZE_EPSILON_PX) {
      continue;
    }
    el.style.setProperty("font-size", `${maxPx}px`, "important");
    shrunk += 1;
  }
  return shrunk;
}

export function checkDallasTypeLock(
  root: HTMLElement,
  displayPx: number,
): DallasTypeLockResult {
  const maxPx = plexMaxPx(displayPx);
  const violations: DallasTypeLockViolation[] = [];

  const canvas = root.querySelector("canvas.dallas-wallpaper-canvas");
  if (!canvas) {
    violations.push({
      rule: "geist-once",
      detail: "Missing wallpaper canvas — Geist display has nowhere to appear once.",
    });
  } else if (canvas.getAttribute("data-dallas-geist") !== "display") {
    violations.push({
      rule: "geist-once",
      detail: "Wallpaper canvas is not marked as the single Geist Sans display.",
      selector: "canvas.dallas-wallpaper-canvas",
    });
  }

  const nodes = root.querySelectorAll<HTMLElement>("*:not(canvas)");
  for (const el of nodes) {
    if (!hasOwnText(el)) continue;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const kind = classifyDallasFamily(style.fontFamily);
    const selector = elementSelector(el);

    if (kind === "geist-sans") {
      violations.push({
        rule: "geist-once",
        detail: `Geist Sans on DOM (${selector}). Only the canvas display line may use it.`,
        selector,
      });
      continue;
    }

    if (kind === "geist-mono") {
      const earned = el.getAttribute("data-dallas-mono") === "structural";
      if (!earned) {
        violations.push({
          rule: "geist-mono",
          detail: `Geist Mono on ${selector} without data-dallas-mono="structural".`,
          selector,
        });
      }
      continue;
    }

    const size = Number.parseFloat(style.fontSize);
    if (!Number.isFinite(size)) continue;
    if (size > maxPx + DALLAS_PLEX_SIZE_EPSILON_PX) {
      violations.push({
        rule: "plex-size",
        detail: `Plex (or UI) on ${selector} is ${size.toFixed(2)}px; max is ${maxPx.toFixed(2)}px (40% of display ${displayPx.toFixed(2)}px). Shrink or remove the label; do not enlarge the display.`,
        selector,
        sizePx: size,
        maxPx,
      });
    }
  }

  return {
    ok: violations.length === 0,
    displayPx,
    plexMaxPx: maxPx,
    violations,
  };
}

export function runDallasTypeLock(root: HTMLElement): DallasTypeLockResult {
  const canvas = root.querySelector<HTMLCanvasElement>("canvas.dallas-wallpaper-canvas");
  const cssWidth = canvas?.clientWidth ?? 0;
  const displayPx = displayRenderedPx(cssWidth);
  publishDallasDisplayPx(root, displayPx);

  let result = checkDallasTypeLock(root, displayPx);
  if (!result.ok && result.violations.some((item) => item.rule === "plex-size")) {
    enforcePlexCap(root, result.plexMaxPx);
    result = checkDallasTypeLock(root, displayPx);
  }

  root.dataset.dallasTypeLock = result.ok ? "pass" : "fail";
  root.dataset.dallasDisplayPx = displayPx.toFixed(2);
  root.dataset.dallasPlexMaxPx = result.plexMaxPx.toFixed(2);
  return result;
}
