"use client";

import {
  applyPaletteToConfig,
  DEFAULT_COLOR_MATERIAL,
  defaultModeParams,
  hexToRgb,
  SurfaceCanvas,
} from "@maser/dither-engine";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Liquid } from "liquid-gooey";
import { useId, useMemo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  COLLAPSED_HEIGHT,
  COPY,
  DRIP_SIZE,
  EXPANDED_HEIGHT,
  RADIAL_PULSE_PARAMS,
} from "./constants";
import type { DitherGooeyCardProps } from "./types";
import { useDrawerGesture } from "./use-drawer-gesture";
import "./tokens.css";

function mixRgb(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

export function DitherGooeyCard({
  title = COPY.title,
  pullHint = COPY.pullHint,
  closeHint = COPY.closeHint,
  bodyTitle = COPY.bodyTitle,
  body = COPY.body,
  accentColor,
  reducedMotion = false,
  className,
  style,
  open,
  defaultOpen,
  onOpenChange,
}: DitherGooeyCardProps) {
  const panelId = useId();
  const drawer = useDrawerGesture({
    reducedMotion,
    open,
    defaultOpen,
    onOpenChange,
  });

  const color = useMemo(() => {
    const base = applyPaletteToConfig("monochrome", DEFAULT_COLOR_MATERIAL);
    const hex = accentColor?.trim();
    if (!hex) return base;
    const tint = hexToRgb(hex);
    return {
      ...base,
      colors: {
        ...base.colors,
        accent: tint,
        glow: tint,
        highlight: mixRgb(base.colors.highlight, tint, 0.4),
        dither: mixRgb(base.colors.dither, tint, 0.55),
        edgeTint: mixRgb(base.colors.edgeTint, tint, 0.35),
      },
      paletteId: "monochrome-tint",
    };
  }, [accentColor]);

  const animation = useMemo(
    () => ({
      modeId: "radial-pulse" as const,
      modeParams: {
        ...defaultModeParams("radial-pulse"),
        ...RADIAL_PULSE_PARAMS,
      },
      blendDuration: 0.2,
    }),
    [],
  );

  const gooey = drawer.dragging || drawer.progress > 0.04;
  const dripY = COLLAPSED_HEIGHT - DRIP_SIZE * 0.55 + drawer.progress * (EXPANDED_HEIGHT - COLLAPSED_HEIGHT);

  return (
    <div className={cn("dgc-root", className)} style={style}>
      <Liquid
        className="dgc-liquid"
        blur={gooey && !reducedMotion ? 16 : 7}
        contrast={20}
        fill="var(--dgc-fill)"
        shadow="0 16px 40px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.12)"
        filterPadding={36}
      >
        <Liquid.Item
          morph={
            reducedMotion
              ? undefined
              : {
                  shape: gooey,
                  bounce: drawer.dragging ? 0.46 : 0.28,
                  contentBlur: 0,
                  advanced: { bridgeGrow: 10 },
                }
          }
          observe
          radius={18}
        >
          <motion.div style={{ height: drawer.height }}>
            <Card
              size="sm"
              className="dgc-card h-full w-full bg-transparent py-0 ring-0"
              aria-label={`${title} drawer`}
            >
              <SurfaceCanvas
                className="dgc-canvas"
                reducedMotion={reducedMotion}
                animation={animation}
                color={color}
                material={{ materialId: "monochrome" }}
                dither={{ algorithm: "bayer", matrixSize: 8, patternScale: 1.15 }}
                light={{
                  shape: "radial",
                  centerX: 0.28,
                  centerY: 0.22,
                  radius: 0.72,
                  falloff: 0.85,
                }}
                params={{
                  contrast: 1.15,
                  brightness: 0.04,
                  opacity: 0.92,
                  grainAmount: 0.06,
                  softEdge: 0.62,
                }}
              />
              <CardHeader className="p-0">
                <button
                  type="button"
                  className="dgc-handle"
                  aria-expanded={drawer.open}
                  aria-controls={panelId}
                  aria-label={`${title}. ${pullHint}`}
                  {...drawer.handleProps}
                  onClick={() => {
                    if (drawer.consumeClick()) return;
                    drawer.toggle();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      drawer.toggle();
                      return;
                    }
                    if (event.key === "Escape" && drawer.open) {
                      event.preventDefault();
                      drawer.collapse();
                    }
                  }}
                >
                  <div className="dgc-title-row">
                    <ChevronDown
                      aria-hidden
                      className="dgc-chevron"
                      style={{
                        transform: `rotate(${drawer.progress * 180}deg)`,
                      }}
                    />
                    <span className="dgc-title">{title}</span>
                  </div>
                  <span className="dgc-hint">{pullHint}</span>
                </button>
              </CardHeader>
              <CardContent
                id={panelId}
                className="dgc-body"
                style={{
                  opacity: Math.max(0, (drawer.progress - 0.28) / 0.72),
                  pointerEvents: drawer.open ? "auto" : "none",
                }}
              >
                <h3>{bodyTitle}</h3>
                {typeof body === "string" ? <p>{body}</p> : body}
              </CardContent>
              <CardFooter className="mt-auto border-0 bg-transparent p-0">
                <button
                  type="button"
                  className="dgc-close"
                  tabIndex={drawer.open ? 0 : -1}
                  aria-label={closeHint}
                  style={{
                    opacity: Math.max(0, (drawer.progress - 0.4) / 0.6),
                    pointerEvents: drawer.progress > 0.55 ? "auto" : "none",
                  }}
                  {...drawer.handleProps}
                  onClick={() => {
                    if (drawer.consumeClick()) return;
                    drawer.collapse();
                  }}
                >
                  <ChevronUp aria-hidden className="dgc-chevron" />
                  {closeHint}
                </button>
              </CardFooter>
            </Card>
          </motion.div>
        </Liquid.Item>
        <Liquid.Item
          className="dgc-drip-item"
          y={dripY}
          effect={gooey && !reducedMotion ? "move" : "morph"}
          move={{ springiness: 0.38, trail: 0.62, stretch: 0.42, wobble: 0.4 }}
          morph={{
            shape: gooey && !reducedMotion,
            bounce: 0.35,
            contentBlur: 0,
          }}
          transition={reducedMotion ? { duration: 0 } : "bouncy"}
          radius={20}
        >
          <div className="dgc-drip" aria-hidden />
        </Liquid.Item>
      </Liquid>
    </div>
  );
}

export type { DitherGooeyCardProps };
