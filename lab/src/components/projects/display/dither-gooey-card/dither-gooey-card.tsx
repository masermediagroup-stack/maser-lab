"use client";

import { motion, useTransform } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Liquid } from "liquid-gooey";
import { useId } from "react";
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
  DEFAULT_BACKGROUND,
  DEFAULT_TEXT,
  DRIP_Y,
  EXPANDED_HEIGHT,
} from "./constants";
import type { DitherGooeyCardProps } from "./types";
import { useDrawerGesture } from "./use-drawer-gesture";
import "./tokens.css";

export function DitherGooeyCard({
  title = COPY.title,
  closeHint = COPY.closeHint,
  bodyTitle = COPY.bodyTitle,
  body = COPY.body,
  backgroundColor = DEFAULT_BACKGROUND,
  textColor = DEFAULT_TEXT,
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

  const fill = backgroundColor.trim() || DEFAULT_BACKGROUND;
  const ink = textColor.trim() || DEFAULT_TEXT;
  const live = drawer.dragging || drawer.settling;
  const gooey = live && !reducedMotion;

  const scaleY = useTransform(drawer.height, (value) => value / EXPANDED_HEIGHT);
  const contentScaleY = useTransform(scaleY, (value) => (value === 0 ? 1 : 1 / value));
  const chevronRotate = useTransform(
    drawer.height,
    [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
    [0, 180],
  );
  const bodyOpacity = useTransform(
    drawer.height,
    [COLLAPSED_HEIGHT + 28, EXPANDED_HEIGHT - 12],
    [0, 1],
  );

  const activate = () => {
    if (drawer.consumeClick()) return;
    drawer.toggle();
  };

  return (
    <div
      className={cn("dgc-root", className)}
      style={{
        ...style,
        ["--dgc-fill" as string]: fill,
        ["--dgc-ink" as string]: ink,
      }}
    >
      <Liquid
        className="dgc-liquid"
        blur={gooey ? 16 : 7}
        contrast={20}
        fill={fill}
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
          <motion.div
            className="dgc-shell"
            data-live={live ? "true" : "false"}
            style={{
              height: EXPANDED_HEIGHT,
              scaleY,
              originX: 0.5,
              originY: 0,
              z: 0,
            }}
          >
            <motion.div
              className="dgc-shell-inner"
              style={{
                scaleY: contentScaleY,
                originX: 0.5,
                originY: 0,
                z: 0,
              }}
            >
              <Card
                size="sm"
                className="dgc-card h-full w-full bg-transparent py-0 ring-0"
                aria-label={`${title} drawer`}
              >
                <CardHeader className="p-0">
                  <div className="dgc-title-wrap">
                    <span className="dgc-title">{title}</span>
                  </div>
                </CardHeader>
                <CardContent
                  id={panelId}
                  className="dgc-body"
                  style={{ pointerEvents: drawer.open ? "auto" : "none" }}
                >
                  <motion.div style={{ opacity: bodyOpacity }}>
                    <h3>{bodyTitle}</h3>
                    {typeof body === "string" ? <p>{body}</p> : body}
                  </motion.div>
                </CardContent>
                <CardFooter className="mt-auto border-0 bg-transparent p-0">
                  <motion.button
                    type="button"
                    className="dgc-close"
                    tabIndex={drawer.open ? 0 : -1}
                    aria-label={closeHint}
                    style={{
                      opacity: bodyOpacity,
                      pointerEvents: drawer.open ? "auto" : "none",
                    }}
                    onClick={() => drawer.collapse()}
                  >
                    <ChevronUp aria-hidden className="dgc-chevron" />
                    {closeHint}
                  </motion.button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </Liquid.Item>
        <Liquid.Item className="dgc-drip-item" y={DRIP_Y} x={0} radius={24}>
          <button
            type="button"
            className="dgc-drip"
            aria-expanded={drawer.open}
            aria-controls={panelId}
            aria-label={`${title}. Pull down to open`}
            {...drawer.handleProps}
            onClick={activate}
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
            <motion.span className="dgc-chevron-wrap" style={{ rotate: chevronRotate }}>
              <ChevronDown aria-hidden className="dgc-chevron" />
            </motion.span>
          </button>
        </Liquid.Item>
      </Liquid>
    </div>
  );
}

export type { DitherGooeyCardProps };
