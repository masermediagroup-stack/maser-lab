"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
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
  DRIP_OVERLAP,
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
  const filterId = `dgcgoo${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
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
  const dripY = useTransform(
    drawer.height,
    (value) => Math.max(COLLAPSED_HEIGHT, value) - DRIP_OVERLAP,
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="dgc-gooey-defs"
          aria-hidden
          focusable="false"
        >
          <defs>
            <filter
              id={filterId}
              x="-50%"
              y="-50%"
              width="200%"
              height="220%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
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
            transformOrigin: "50% 0%",
            translateZ: 0,
          }}
        >
          <div className="dgc-gooey-body" />
        </motion.div>
        <motion.div
          className="dgc-drip-goo"
          data-live={live ? "true" : "false"}
          style={{
            x: "-50%",
            y: dripY,
            translateZ: 0,
          }}
        >
          <div
            className="dgc-drip-fx"
            style={
              reducedMotion ? undefined : { filter: `url(#${filterId})` }
            }
          >
            <div className="dgc-gooey-bulge" />
            <div className="dgc-gooey-drop" />
            <div className="dgc-gooey-tail" />
          </div>
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
              <svg
                aria-hidden
                className="dgc-chevron"
                viewBox="0 0 48 48"
                fill="none"
              >
                <path
                  d="M6 10 L24 38 L42 10"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.span>
          </motion.button>
        </motion.div>

        <motion.div
          className="dgc-clip"
          style={{
            height: expandedHeight,
            scaleY,
            originX: 0.5,
            originY: 0,
            transformOrigin: "50% 0%",
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

      </div>
    </div>
  );
}

export type { DitherGooeyCardProps };
