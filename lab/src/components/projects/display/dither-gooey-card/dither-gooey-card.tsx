"use client";

import { motion } from "framer-motion";
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
  DRIP_SIZE,
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
  const gooey = drawer.dragging || drawer.progress > 0.04;
  const dripY =
    COLLAPSED_HEIGHT -
    DRIP_SIZE * 0.55 +
    drawer.progress * (EXPANDED_HEIGHT - COLLAPSED_HEIGHT);
  const chevronRotate = drawer.progress * 180;

  const activate = () => {
    if (drawer.consumeClick()) return;
    drawer.toggle();
  };

  const collapse = () => {
    if (drawer.consumeClick()) return;
    drawer.collapse();
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
        blur={gooey && !reducedMotion ? 16 : 7}
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
          <motion.div style={{ height: drawer.height }}>
            <Card
              size="sm"
              className="dgc-card h-full w-full bg-transparent py-0 ring-0"
              aria-label={`${title} drawer`}
            >
              <CardHeader className="p-0">
                <button
                  type="button"
                  className="dgc-handle"
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
                  <span className="dgc-title">{title}</span>
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
                  onClick={collapse}
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
          <div
            className="dgc-drip"
            aria-hidden
            {...drawer.handleProps}
            onClick={activate}
          >
            <ChevronDown
              className="dgc-chevron"
              style={{ transform: `rotate(${chevronRotate}deg)` }}
            />
          </div>
        </Liquid.Item>
      </Liquid>
    </div>
  );
}

export type { DitherGooeyCardProps };
