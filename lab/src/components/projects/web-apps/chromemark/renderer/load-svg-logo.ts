import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import type { Shape, ShapePath } from "three";
import { assembleSilhouette } from "./assemble-silhouette";
import { hasStroke, outlineStrokePath } from "./outline-stroke";
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
  const fillShapes: Shape[] = [];
  const strokeShapes: Shape[] = [];

  for (const path of data.paths) {
    if (hasFill(path)) {
      fillShapes.push(...path.toShapes());
      continue;
    }
    if (hasStroke(path)) {
      strokeShapes.push(...outlineStrokePath(path));
    }
  }

  if (fillShapes.length === 0 && strokeShapes.length === 0) {
    throw new LogoLoadError(
      "no-fills",
      "No filled or stroked paths were found. ChromeMark needs filled shapes or outlined strokes.",
    );
  }

  // Fills reassemble as holes. Stroke ribbons already keep their inner offset
  // as a hole — do not run them through silhouette assembly or they explode.
  return [...assembleSilhouette(fillShapes), ...strokeShapes];
}
