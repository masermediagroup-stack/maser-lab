"use client";

import { motion, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useId } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  COLLAPSED_HEIGHT,
  COPY,
  DEFAULT_BACKGROUND,
  DEFAULT_TEXT,
  DRIP_HANG,
  DRIP_OVERLAP,
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

  const scaleY = useTransform(
    drawer.height,
    (value) => Math.max(COLLAPSED_HEIGHT, value) / EXPANDED_HEIGHT,
  );
  const contentScaleY = useTransform(scaleY, (value) => (value === 0 ? 1 : 1 / value));
  const dripY = useTransform(
    drawer.height,
    (value) => Math.max(COLLAPSED_HEIGHT, value) - DRIP_OVERLAP,
  );
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
      data-live={live ? "true" : "false"}
      data-scroll-lock={live ? "true" : "false"}
      style={{
        ...style,
        ["--dgc-fill" as string]: fill,
        ["--dgc-ink" as string]: ink,
      }}
    >
      <div
        className="dgc-stage"
        style={{ height: EXPANDED_HEIGHT + DRIP_HANG }}
      >
        <motion.div
          className="dgc-shell"
          data-live={live ? "true" : "false"}
          style={{
            height: EXPANDED_HEIGHT,
            scaleY,
            originX: 0.5,
            originY: 0,
            translateZ: 0,
          }}
        >
          <motion.div
            className="dgc-shell-inner"
            style={{
              scaleY: contentScaleY,
              originX: 0.5,
              originY: 0,
              translateZ: 0,
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
            </Card>
          </motion.div>
        </motion.div>
        <motion.button
          type="button"
          className="dgc-drip"
          aria-expanded={drawer.open}
          aria-controls={panelId}
          aria-label={
            drawer.open ? `${title}. ${closeHint}` : `${title}. Pull down to open`
          }
          style={{
            x: "-50%",
            y: dripY,
            translateZ: 0,
          }}
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
        </motion.button>
      </div>
    </div>
  );
}

export type { DitherGooeyCardProps };
