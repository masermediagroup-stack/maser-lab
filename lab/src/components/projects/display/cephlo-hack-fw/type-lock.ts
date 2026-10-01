/**
 * Mechanical type lock for the Cephlo Hack FW wallpaper.
 *
 * Product type is Figma-native 48/36 HTML on the 1920×1080 frame
 * (no CSS scale below 1). Demo chrome uses Plex via --cephlo-font-ui.
 * `displayRenderedPx` maps CSS width for the Plex 40% cap only.
 */

export const CEPHLO_DISPLAY_FONT_PX = 48;
export const CEPHLO_SUBLINE_FONT_PX = 36;
export const CEPHLO_DISPLAY_TRACKING_PX = 0;
export const CEPHLO_TYPE_DESIGN_WIDTH_PX = 1920;
export const CEPHLO_PLEX_MAX_RATIO = 0.4;
export const CEPHLO_BODY_FONT_PX = CEPHLO_SUBLINE_FONT_PX;
export const CEPHLO_BODY_FONT_WEIGHT = 300;
export const CEPHLO_PLEX_SIZE_EPSILON_PX = 0.51;

export type CephloFamilyKind = "geist-sans" | "geist-mono" | "universal-sans" | "plex" | "other";

export type CephloTypeLockViolation = {
  rule: "display-once" | "geist-out" | "plex-size" | "third-voice";
  detail: string;
  selector?: string;
  sizePx?: number;
  maxPx?: number;
};

export type CephloTypeLockResult = {
  ok: boolean;
  displayPx: number;
  plexMaxPx: number;
  violations: CephloTypeLockViolation[];
};

export function displayRenderedPx(canvasCssWidthPx: number): number {
  if (!Number.isFinite(canvasCssWidthPx) || canvasCssWidthPx <= 0) {
    return CEPHLO_DISPLAY_FONT_PX;
  }
  return CEPHLO_DISPLAY_FONT_PX * (canvasCssWidthPx / CEPHLO_TYPE_DESIGN_WIDTH_PX);
}

export function plexMaxPx(displayPx: number): number {
  return displayPx * CEPHLO_PLEX_MAX_RATIO;
}

function familyTokens(family: string): string[] {
  return family
    .split(",")
    .map((token) => token.trim().replace(/^["']|["']$/g, "").toLowerCase())
    .filter(Boolean);
}

function classifyFamily(family: string): CephloFamilyKind {
  const tokens = familyTokens(family);
  if (tokens.some((t) => t.includes("geist mono"))) return "geist-mono";
  if (tokens.some((t) => t.includes("geist"))) return "geist-sans";
  if (tokens.some((t) => t.includes("universal"))) return "universal-sans";
  if (tokens.some((t) => t.includes("plex"))) return "plex";
  return "other";
}

function parsePx(value: string): number | null {
  const match = value.trim().match(/^([\d.]+)px$/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

export function publishCephloDisplayPx(root: ParentNode, canvasCssWidthPx: number) {
  const el = root instanceof HTMLElement ? root : null;
  if (!el) return;
  el.style.setProperty("--cephlo-display-px", `${displayRenderedPx(canvasCssWidthPx)}px`);
}

export function runCephloTypeLock(root: ParentNode): CephloTypeLockResult {
  const violations: CephloTypeLockViolation[] = [];
  const stage =
    root.querySelector(".cephlo-wallpaper-stack") ??
    root.querySelector(".cephlo-wallpaper-stack__fg, .cephlo-wallpaper-canvas");
  const stageEl = stage instanceof HTMLElement ? stage : null;
  const canvasCssWidth = stageEl?.clientWidth ?? CEPHLO_TYPE_DESIGN_WIDTH_PX;
  const displayPx = displayRenderedPx(canvasCssWidth);
  const maxPlex = plexMaxPx(displayPx);

  const displayMarker = root.querySelector('[data-cephlo-display="universal-sans"]');
  if (!displayMarker) {
    violations.push({
      rule: "display-once",
      detail: "Missing Universal Sans marker.",
    });
  }

  const textNodes = root.querySelectorAll<HTMLElement>(
    "p, span, label, button, input, textarea, h1, h2, h3, h4, h5, h6",
  );

  for (const node of textNodes) {
    if (node.closest(".demo-control-bar, .lab-control-bar, [data-lab-chrome]")) {
      const style = getComputedStyle(node);
      const kind = classifyFamily(style.fontFamily);
      if (kind === "geist-sans" || kind === "geist-mono") {
        violations.push({
          rule: "geist-out",
          detail: "Geist on demo chrome is allowed only via lab tokens; check product surface.",
          selector: node.tagName.toLowerCase(),
        });
      }
      const size = parsePx(style.fontSize);
      if (size !== null && kind === "plex" && size > maxPlex + CEPHLO_PLEX_SIZE_EPSILON_PX) {
        violations.push({
          rule: "plex-size",
          detail: "Plex label exceeds 40% of display size.",
          selector: node.tagName.toLowerCase(),
          sizePx: size,
          maxPx: maxPlex,
        });
      }
    }
  }

  return {
    ok: violations.length === 0,
    displayPx,
    plexMaxPx: maxPlex,
    violations,
  };
}
