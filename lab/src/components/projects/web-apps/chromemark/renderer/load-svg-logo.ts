import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import type { Shape, ShapePath } from "three";
import { LogoLoadError } from "../types";

type SvgStyle = {
  fill?: string;
  fillOpacity?: number;
  opacity?: number;
};

function readStyle(path: ShapePath): SvgStyle {
  const userData = path.userData as { style?: SvgStyle } | undefined;
  return userData?.style ?? {};
}

function hasFill(path: ShapePath): boolean {
  const style = readStyle(path);
  if (style.fill === undefined) return true;
  if (style.fill === "none") return false;
  if ((style.fillOpacity ?? 1) * (style.opacity ?? 1) <= 0) return false;
  return true;
}

export function loadSvgLogo(svgText: string): Shape[] {
  const trimmed = svgText.trim();
  if (!trimmed) {
    throw new LogoLoadError("invalid-svg", "The SVG file is empty.");
  }

  const parsed = new DOMParser().parseFromString(trimmed, "image/svg+xml");
  if (parsed.querySelector("parsererror")) {
    throw new LogoLoadError(
      "invalid-svg",
      "This SVG could not be parsed. Export a plain SVG with filled paths.",
    );
  }

  const loader = new SVGLoader();
  const data = loader.parse(trimmed);
  const shapes: Shape[] = [];

  for (const path of data.paths) {
    if (!hasFill(path)) continue;
    const pathShapes = path.toShapes();
    shapes.push(...pathShapes);
  }

  if (shapes.length === 0) {
    throw new LogoLoadError(
      "no-fills",
      "No filled paths were found. ChromeMark needs filled shapes, not strokes-only artwork.",
    );
  }

  return shapes;
}
