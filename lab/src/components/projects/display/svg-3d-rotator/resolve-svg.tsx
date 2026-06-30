import {
  cloneElement,
  createElement,
  isValidElement,
  type ComponentType,
  type ReactElement,
  type SVGProps,
} from "react";

export type SvgInput =
  | ReactElement<SVGProps<SVGSVGElement>>
  | ComponentType<SVGProps<SVGSVGElement>>;

export function resolveSvgElement(svg: SvgInput): ReactElement<SVGProps<SVGSVGElement>> {
  if (isValidElement(svg)) {
    return svg;
  }

  const Component = svg as ComponentType<SVGProps<SVGSVGElement>>;
  return createElement(Component, {
    width: "100%",
    height: "100%",
    preserveAspectRatio: "xMidYMid meet",
  });
}

export function cloneSvgForLayer(
  svg: SvgInput,
  layerIndex: number,
  className: string,
): ReactElement {
  const element = resolveSvgElement(svg);
  return cloneElement(element, {
    key: `extrusion-${layerIndex}`,
    className,
    focusable: false,
    "aria-hidden": layerIndex > 0 ? true : undefined,
    role: layerIndex === 0 ? "img" : undefined,
    preserveAspectRatio: "xMidYMid meet",
    width: "100%",
    height: "100%",
  });
}
