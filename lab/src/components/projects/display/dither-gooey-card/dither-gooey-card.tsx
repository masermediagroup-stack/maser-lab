"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  COLLAPSED_HEIGHT,
  COPY,
  DEFAULT_BACKGROUND,
  DEFAULT_TEXT,
  EXPANDED_HEIGHT,
  GOOEY_HANG,
  HANDLE_INSET,
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
  fillViewport = false,
  className,
  style,
  open,
  defaultOpen,
  onOpenChange,
}: DitherGooeyCardProps) {
  const panelId = useId();
  const filterId = `dgc-goo-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const stageRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(EXPANDED_HEIGHT);
  const expandedHeight = fillViewport ? viewportHeight : EXPANDED_HEIGHT;
  const expandedMV = useMotionValue(expandedHeight);

  useEffect(() => {
    if (!fillViewport) return;
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box) return;
      setViewportHeight(
        Math.max(COLLAPSED_HEIGHT + 96, Math.round(box.height - GOOEY_HANG)),
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [fillViewport]);

  useEffect(() => {
    expandedMV.set(expandedHeight);
  }, [expandedHeight, expandedMV]);

  const drawer = useDrawerGesture({
    reducedMotion,
    open,
    defaultOpen,
    onOpenChange,
    expandedHeight,
  });

  const fill = backgroundColor.trim() || DEFAULT_BACKGROUND;
  const ink = textColor.trim() || DEFAULT_TEXT;
  const live = drawer.dragging || drawer.settling;

  const scaleY = useTransform(
    [drawer.height, expandedMV],
    ([value, max]) =>
      Math.max(COLLAPSED_HEIGHT, Number(value)) / Math.max(1, Number(max)),
  );
  const contentScaleY = useTransform(scaleY, (value) =>
    value === 0 ? 1 : 1 / value,
  );
  const handleY = useTransform(
    drawer.height,
    (value) => Math.max(COLLAPSED_HEIGHT, value) - HANDLE_INSET,
  );
  const chevronRotate = useTransform(
    [drawer.height, expandedMV],
    ([value, max]) => {
      const range = Math.max(1, Number(max) - COLLAPSED_HEIGHT);
      return (Math.max(0, Number(value) - COLLAPSED_HEIGHT) / range) * 180;
    },
  );
  const bodyOpacity = useTransform(
    [drawer.height, expandedMV],
    ([value, max]) => {
      const start = COLLAPSED_HEIGHT + 28;
      const end = Math.max(start + 8, Number(max) - 12);
      const t = (Number(value) - start) / (end - start);
      return Math.max(0, Math.min(1, t));
    },
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
      data-fill-viewport={fillViewport ? "true" : "false"}
      data-reduced={reducedMotion ? "true" : "false"}
      style={{
        ...style,
        ["--dgc-fill" as string]: fill,
        ["--dgc-ink" as string]: ink,
        ["--dgc-expanded" as string]: `${expandedHeight}px`,
      }}
    >
      <div
        ref={stageRef}
        className="dgc-stage"
        style={
          fillViewport
            ? undefined
            : { height: expandedHeight + GOOEY_HANG }
        }
      >
        <svg className="dgc-gooey-defs" aria-hidden width="0" height="0">
          <defs>
            <filter
              id={filterId}
              x="-32%"
              y="-32%"
              width="164%"
              height="180%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="8"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
                result="goo"
              />
            </filter>
          </defs>
        </svg>

        <motion.div
          className="dgc-gooey"
          data-live={live ? "true" : "false"}
          style={{
            height: expandedHeight,
            scaleY,
            originX: 0.5,
            originY: 0,
            translateZ: 0,
            filter: reducedMotion
              ? undefined
              : `url(#${filterId}) drop-shadow(0 16px 32px rgba(0, 0, 0, 0.38))`,
          }}
        >
          <div className="dgc-gooey-body" />
          <div className="dgc-gooey-bulge" />
          <div className="dgc-gooey-drop" />
        </motion.div>

        <motion.div
          className="dgc-clip"
          style={{
            height: expandedHeight,
            scaleY,
            originX: 0.5,
            originY: 0,
            translateZ: 0,
            pointerEvents: drawer.open ? "auto" : "none",
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
              className="dgc-card h-full w-full border-0 bg-transparent py-0 shadow-none ring-0"
              aria-label={`${title} drawer`}
            >
              <CardHeader className="p-0">
                <div className="dgc-title-wrap">
                  <span className="dgc-title">{title}</span>
                </div>
              </CardHeader>
              <CardContent id={panelId} className="dgc-body">
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
          className="dgc-handle"
          data-live={live ? "true" : "false"}
          aria-expanded={drawer.open}
          aria-controls={panelId}
          aria-label={
            drawer.open
              ? `${title}. ${closeHint}`
              : `${title}. Pull down to open`
          }
          style={{
            x: "-50%",
            y: handleY,
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
          <motion.span
            className="dgc-chevron-wrap"
            style={{ rotate: chevronRotate }}
          >
            <ChevronDown aria-hidden className="dgc-chevron" />
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}

export type { DitherGooeyCardProps };
