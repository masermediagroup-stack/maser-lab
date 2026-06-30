"use client";

import {
  memo,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { computeLayerFill } from "./color-utils";
import { cloneSvgForLayer } from "./resolve-svg";
import styles from "./SVG3DRotator.module.css";
import { SVG3D_DEFAULTS, type SVG3DRotatorProps } from "./types";

const ExtrusionLayer = memo(function ExtrusionLayer({
  index,
  fill,
  z,
  node,
}: {
  index: number;
  fill: string;
  z: number;
  node: ReactElement;
}) {
  return (
    <div
      className={cn(styles.layer, index === 0 && styles.layerFront)}
      style={
        {
          transform: `translate3d(${index * 0.025}px, ${index * 0.018}px, ${z}px)`,
          "--layer-fill": fill,
        } as CSSProperties
      }
    >
      {node}
    </div>
  );
});

export function SVG3DRotator({
  svg,
  width = SVG3D_DEFAULTS.width,
  height = SVG3D_DEFAULTS.height,
  depth = SVG3D_DEFAULTS.depth,
  depthStep = SVG3D_DEFAULTS.depthStep,
  strokeColor = SVG3D_DEFAULTS.strokeColor,
  strokeWidth = SVG3D_DEFAULTS.strokeWidth,
  faceColor = SVG3D_DEFAULTS.faceColor,
  backColor = SVG3D_DEFAULTS.backColor,
  rotationSpeed = SVG3D_DEFAULTS.rotationSpeed,
  direction = SVG3D_DEFAULTS.direction,
  rotationAxis = SVG3D_DEFAULTS.rotationAxis,
  gradientMode = SVG3D_DEFAULTS.gradientMode,
  gradientStart = SVG3D_DEFAULTS.gradientStart,
  gradientEnd = SVG3D_DEFAULTS.gradientEnd,
  gradientCenter = SVG3D_DEFAULTS.gradientCenter,
  gradientEdge = SVG3D_DEFAULTS.gradientEdge,
  ambientGlow = SVG3D_DEFAULTS.ambientGlow,
  shadowColor = SVG3D_DEFAULTS.shadowColor,
  cardRadius = SVG3D_DEFAULTS.cardRadius,
  padding = SVG3D_DEFAULTS.padding,
  perspective = SVG3D_DEFAULTS.perspective,
  hoverPause = SVG3D_DEFAULTS.hoverPause,
  enableHoverEffects = SVG3D_DEFAULTS.enableHoverEffects,
  autoRotate = SVG3D_DEFAULTS.autoRotate,
  pauseAnimation = false,
  enableFloat = SVG3D_DEFAULTS.enableFloat,
  hoverSpeedMultiplier = SVG3D_DEFAULTS.hoverSpeedMultiplier,
  className,
  style,
  "aria-label": ariaLabel = "Rotating logo",
}: SVG3DRotatorProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const shouldAnimate =
    autoRotate &&
    !pauseAnimation &&
    !prefersReducedMotion &&
    !(hoverPause && hovered);

  const effectiveSpeed =
    hovered && enableHoverEffects && !hoverPause
      ? rotationSpeed * hoverSpeedMultiplier
      : rotationSpeed;

  const rotateDuration = 360 / Math.max(effectiveSpeed, 0.1);
  const directionSign = direction === "clockwise" ? 1 : -1;

  const layerData = useMemo(
    () =>
      Array.from({ length: Math.max(1, depth) }, (_, index) => ({
        index,
        fill: computeLayerFill(index, depth, faceColor, backColor),
        z: -index * depthStep,
        node: cloneSvgForLayer(svg, index, styles.layerSvg),
      })),
    [svg, depth, depthStep, faceColor, backColor],
  );

  const rotateYMotion = useMotionValue(0);

  const shadowX = useTransform(
    rotateYMotion,
    (r) => `${Math.sin((r * Math.PI) / 180) * 16}px`,
  );
  const shadowScale = useTransform(
    rotateYMotion,
    (r) => 0.82 + Math.abs(Math.cos((r * Math.PI) / 180)) * 0.28,
  );
  const shadowOpacity = useTransform(
    rotateYMotion,
    (r) => 0.28 + Math.abs(Math.cos((r * Math.PI) / 180)) * 0.22,
  );
  const shadowBlur = useTransform(
    rotateYMotion,
    (r) => `${10 + Math.abs(Math.sin((r * Math.PI) / 180)) * 10}px`,
  );

  const shadowTransform = useMotionTemplate`translateX(calc(-50% + ${shadowX})) scaleX(${shadowScale})`;
  const shadowFilter = useMotionTemplate`blur(${shadowBlur})`;

  const rootStyle = {
    ...style,
    "--svg3d-width": `${width}px`,
    "--svg3d-height": `${height}px`,
    "--gradient-center": gradientCenter ?? gradientStart,
    "--gradient-edge": gradientEdge ?? gradientEnd,
    "--ambient-glow": ambientGlow,
    "--shadow-color": shadowColor,
    "--face-color": faceColor,
    "--stroke-color": strokeColor,
    "--stroke-width": `${strokeWidth}px`,
    "--card-radius": `${cardRadius}px`,
    "--card-padding": typeof padding === "number" ? `${padding}px` : padding,
    "--svg3d-perspective": `${perspective}px`,
  } as CSSProperties;

  const hoverActive = hovered && enableHoverEffects && !hoverPause;

  const rotateYKeyframes = directionSign * 360;
  const rotateXKeyframes =
    rotationAxis === "y" ? undefined : [-10, 10, -10];

  return (
    <div
      className={cn(styles.root, className)}
      style={rootStyle}
      data-gradient={gradientMode}
      data-hover-active={hoverActive ? "true" : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      role="region"
      aria-label={ariaLabel}
    >
      <div className={styles.bloom} aria-hidden />

      <motion.div
        className={styles.shadow}
        aria-hidden
        style={{
          transform: shadowTransform,
          opacity: shadowOpacity,
          filter: shadowFilter,
        }}
      />

      <div className={styles.scene}>
        <motion.div
          className={styles.floatWrapper}
          animate={
            enableFloat && !prefersReducedMotion
              ? { y: [-6, 6, -6] }
              : { y: 0 }
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.div
            className={styles.object}
            animate={
              shouldAnimate
                ? {
                    rotateY: rotateYKeyframes,
                    ...(rotateXKeyframes
                      ? { rotateX: rotateXKeyframes }
                      : {}),
                  }
                : {
                    rotateY: prefersReducedMotion ? 24 : 0,
                    rotateX: prefersReducedMotion ? 6 : 0,
                  }
            }
            transition={{
              rotateY: {
                duration: rotateDuration,
                repeat: shouldAnimate ? Infinity : 0,
                ease: "linear",
              },
              rotateX: {
                duration: 8,
                repeat: shouldAnimate ? Infinity : 0,
                ease: "easeInOut",
              },
            }}
            onUpdate={(latest) => {
              if (typeof latest.rotateY === "number") {
                rotateYMotion.set(latest.rotateY);
              }
            }}
          >
            {layerData.map(({ index, fill, z, node }) => (
              <ExtrusionLayer
                key={index}
                index={index}
                fill={fill}
                z={z}
                node={node}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export type { SVG3DRotatorProps } from "./types";
